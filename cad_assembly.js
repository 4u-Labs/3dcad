/**
 * 3DCad Studio — Assembly & Kinematic Joints
 * Multi-body assemblies with Fixed, Revolute, Slider (Prismatic), and Ball joints.
 * Computes forward kinematics, enforces motion limits, and drives interactive simulation.
 */
(function (root, factory) {
  "use strict";
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.CadAssembly = factory();
  }
})(typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const JOINT_TYPES = new Set(["fixed", "revolute", "slider", "ball"]);

  function toRad(deg) {
    return ((Number(deg) || 0) * Math.PI) / 180;
  }

  function toDeg(rad) {
    return ((Number(rad) || 0) * 180) / Math.PI;
  }

  class Joint {
    constructor(config = {}) {
      this.id = config.id || `joint_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      this.name = config.name || "Joint";
      this.type = JOINT_TYPES.has(config.type) ? config.type : "revolute";
      this.bodyA = config.bodyA || null; // parent/base body id
      this.bodyB = config.bodyB || null; // child/moving body id
      this.anchor = Array.isArray(config.anchor) ? config.anchor.slice(0, 3) : [0, 0, 0];
      this.axis = Array.isArray(config.axis) ? config.axis.slice(0, 3) : [0, 0, 1];
      // Normalize axis
      const len = Math.hypot(...this.axis);
      if (len > 1e-6) this.axis = this.axis.map((n) => n / len);
      else this.axis = [0, 0, 1];

      this.limits = {
        min: config.limits?.min !== undefined ? Number(config.limits.min) : this.type === "revolute" ? -180 : 0,
        max: config.limits?.max !== undefined ? Number(config.limits.max) : this.type === "revolute" ? 180 : 50,
        enabled: config.limits?.enabled !== false,
      };

      this.value = Number(config.value ?? (this.type === "revolute" ? 0 : 0));
      this.initialValue = this.value;
    }

    setValue(val) {
      let v = Number(val) || 0;
      if (this.limits.enabled) {
        v = Math.max(this.limits.min, Math.min(this.limits.max, v));
      }
      this.value = v;
      return this.value;
    }

    toJSON() {
      return {
        id: this.id,
        name: this.name,
        type: this.type,
        bodyA: this.bodyA,
        bodyB: this.bodyB,
        anchor: this.anchor,
        axis: this.axis,
        limits: { ...this.limits },
        value: this.value,
      };
    }
  }

  class AssemblyManager {
    constructor() {
      this.joints = [];
      this.bodies = new Map(); // bodyId -> { id, name, mesh, basePos, baseRot }
    }

    registerBody(id, name, mesh) {
      if (!mesh) return;
      this.bodies.set(id, {
        id,
        name: name || id,
        mesh,
        basePos: mesh.position.clone(),
        baseQuaternion: mesh.quaternion.clone(),
        baseScale: mesh.scale.clone(),
      });
    }

    unregisterBody(id) {
      this.bodies.delete(id);
      this.joints = this.joints.filter((j) => j.bodyA !== id && j.bodyB !== id);
    }

    addJoint(config) {
      const joint = new Joint(config);
      this.joints.push(joint);
      this.evaluateKinematics();
      return joint;
    }

    removeJoint(id) {
      const idx = this.joints.findIndex((j) => j.id === id);
      if (idx !== -1) {
        const removed = this.joints.splice(idx, 1)[0];
        this.resetBodyTransforms(removed.bodyB);
        this.evaluateKinematics();
        return removed;
      }
      return null;
    }

    getJoint(id) {
      return this.joints.find((j) => j.id === id) || null;
    }

    setJointValue(jointId, value) {
      const j = this.getJoint(jointId);
      if (!j) return null;
      j.setValue(value);
      this.evaluateKinematics();
      return j.value;
    }

    resetBodyTransforms(bodyId) {
      const b = this.bodies.get(bodyId);
      if (b && b.mesh) {
        b.mesh.position.copy(b.basePos);
        b.mesh.quaternion.copy(b.baseQuaternion);
        b.mesh.scale.copy(b.baseScale);
      }
    }

    /**
     * Compute forward kinematics for all joints.
     * Uses topological sorting to solve kinematic chains from root base bodies down to end effectors.
     */
    evaluateKinematics() {
      if (typeof THREE === "undefined") return;

      // Reset all bodies to base transforms first
      for (const b of this.bodies.values()) {
        if (b.mesh) {
          b.mesh.position.copy(b.basePos);
          b.mesh.quaternion.copy(b.baseQuaternion);
          b.mesh.scale.copy(b.baseScale);
          b.mesh.updateMatrix();
        }
      }

      // Build dependency graph
      const childToJoint = new Map();
      for (const j of this.joints) {
        if (j.bodyB) childToJoint.set(j.bodyB, j);
      }

      // Solve recursively
      const solved = new Set();
      const applyJoint = (j) => {
        if (!j || solved.has(j.id)) return;
        if (j.bodyA && childToJoint.has(j.bodyA)) {
          applyJoint(childToJoint.get(j.bodyA));
        }

        const parentRecord = this.bodies.get(j.bodyA);
        const childRecord = this.bodies.get(j.bodyB);
        if (!childRecord || !childRecord.mesh) return;

        const childMesh = childRecord.mesh;
        const parentMesh = parentRecord?.mesh || null;

        const anchorVec = new THREE.Vector3(...j.anchor);
        const axisVec = new THREE.Vector3(...j.axis).normalize();

        if (j.type === "revolute") {
          const angleRad = toRad(j.value);
          const rotQuat = new THREE.Quaternion().setFromAxisAngle(axisVec, angleRad);

          // Rotate childMesh around anchor
          childMesh.position.sub(anchorVec);
          childMesh.position.applyQuaternion(rotQuat);
          childMesh.position.add(anchorVec);
          childMesh.quaternion.multiplyQuaternions(rotQuat, childMesh.quaternion);
        } else if (j.type === "slider") {
          const moveVec = axisVec.clone().multiplyScalar(j.value);
          childMesh.position.add(moveVec);
        }

        // If parent has moved or rotated from its own parent joints, compound with parent world transform
        if (parentMesh && parentRecord) {
          const parentDeltaPos = parentMesh.position.clone().sub(parentRecord.basePos);
          childMesh.position.add(parentDeltaPos);
        }

        childMesh.updateMatrix();
        childMesh.updateMatrixWorld(true);
        solved.add(j.id);
      };

      for (const j of this.joints) {
        applyJoint(j);
      }
    }

    serialize() {
      return this.joints.map((j) => j.toJSON());
    }

    toJSON() {
      return {
        joints: this.serialize(),
      };
    }

    deserialize(list = []) {
      this.joints = [];
      for (const item of list) {
        this.addJoint(item);
      }
    }
  }

  return {
    JOINT_TYPES,
    Joint,
    AssemblyManager,
  };
});
