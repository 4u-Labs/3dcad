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

      this.value = 0;
      this.setValue(config.value ?? 0);
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
      const existing = this.bodies.get(id);
      if (existing?.mesh === mesh) { existing.name = name || id; return; }
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

    clear() {
      this.joints = [];
      this.bodies.clear();
    }

    serializeBases() {
      return Object.fromEntries([...this.bodies].map(([id, body]) => [id, {
        pos: body.basePos.toArray(),
        quaternion: body.baseQuaternion.toArray(),
        scale: body.baseScale.toArray(),
      }]));
    }

    restoreBases(bases = {}) {
      for (const [id, transform] of Object.entries(bases)) {
        const body = this.bodies.get(id);
        if (!body) continue;
        body.basePos.fromArray(transform.pos);
        body.baseQuaternion.fromArray(transform.quaternion);
        body.baseScale.fromArray(transform.scale);
      }
    }

    // Version 2 projects written before assemblyBases stored only the posed meshes.
    // Recover the rest pose by inverting each joint along the saved kinematic chain.
    inferBasesFromCurrentPose(list = []) {
      if (typeof THREE === "undefined") return;
      const current = new Map([...this.bodies].map(([id,b]) => [id,
        new THREE.Matrix4().compose(b.mesh.position,b.mesh.quaternion,b.mesh.scale)]));
      const jointsByChild = new Map(list.map(j => [j.bodyB,j]));
      const bases = new Map(current);
      const visiting = new Set(),done = new Set();
      const solve = joint => {
        if(done.has(joint.bodyB)||visiting.has(joint.bodyB))return;
        visiting.add(joint.bodyB);
        const parentJoint=jointsByChild.get(joint.bodyA);
        if(parentJoint)solve(parentJoint);
        const child=current.get(joint.bodyB), parent=current.get(joint.bodyA);
        if(child && parent){
          const axis=new THREE.Vector3(...(joint.axis||[0,0,1])).normalize();
          const anchor=new THREE.Vector3(...(joint.anchor||[0,0,0]));
          let motion=new THREE.Matrix4();
          if(joint.type==="slider")motion.makeTranslation(...axis.multiplyScalar(Number(joint.value)||0).toArray());
          else if(joint.type==="revolute"||joint.type==="ball"){
            motion.makeTranslation(...anchor.toArray())
              .multiply(new THREE.Matrix4().makeRotationAxis(axis,toRad(joint.value)))
              .multiply(new THREE.Matrix4().makeTranslation(...anchor.negate().toArray()));
          }
          const base=(bases.get(joint.bodyA)||parent).clone().multiply(motion.invert()).multiply(parent.clone().invert()).multiply(child);
          bases.set(joint.bodyB,base);
          const record=this.bodies.get(joint.bodyB);
          base.decompose(record.basePos,record.baseQuaternion,record.baseScale);
        }
        visiting.delete(joint.bodyB);done.add(joint.bodyB);
      };
      list.forEach(solve);
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

      // Solve recursively with cycle protection
      const solved = new Set();
      const visiting = new Set();

      const applyJoint = (j) => {
        if (!j || solved.has(j.id) || visiting.has(j.id)) return;
        visiting.add(j.id);

        if (j.bodyA && childToJoint.has(j.bodyA)) {
          applyJoint(childToJoint.get(j.bodyA));
        }

        const parentRecord = this.bodies.get(j.bodyA);
        const childRecord = this.bodies.get(j.bodyB);
        if (!childRecord || !childRecord.mesh) {
          visiting.delete(j.id);
          return;
        }

        const childMesh = childRecord.mesh;
        const parentMesh = parentRecord?.mesh;

        const axisVec = new THREE.Vector3(...(j.axis || [0, 0, 1])).normalize();
        const anchorVec = new THREE.Vector3(...(j.anchor || [0, 0, 0]));

        let jointMat = new THREE.Matrix4();
        if (j.type === "revolute" || j.type === "ball") {
          const angleRad = toRad(j.value);
          const rotQuat = new THREE.Quaternion().setFromAxisAngle(axisVec, angleRad);
          jointMat = new THREE.Matrix4().makeTranslation(anchorVec.x, anchorVec.y, anchorVec.z)
            .multiply(new THREE.Matrix4().makeRotationFromQuaternion(rotQuat))
            .multiply(new THREE.Matrix4().makeTranslation(-anchorVec.x, -anchorVec.y, -anchorVec.z));
        } else if (j.type === "slider") {
          const moveVec = axisVec.clone().multiplyScalar(j.value);
          jointMat = new THREE.Matrix4().makeTranslation(moveVec.x, moveVec.y, moveVec.z);
        }

        const childBaseMat = new THREE.Matrix4().compose(childRecord.basePos, childRecord.baseQuaternion, childRecord.baseScale);
        let childWorldMat;
        if (parentRecord && parentMesh) {
          const parentBaseMat = new THREE.Matrix4().compose(parentRecord.basePos, parentRecord.baseQuaternion, parentRecord.baseScale);
          const parentBaseInv = parentBaseMat.clone().invert();
          const relBaseMat = new THREE.Matrix4().multiplyMatrices(parentBaseInv, childBaseMat);
          const parentCurrentMat = new THREE.Matrix4().compose(parentMesh.position, parentMesh.quaternion, parentMesh.scale);
          childWorldMat = parentCurrentMat.clone().multiply(jointMat).multiply(relBaseMat);
        } else {
          childWorldMat = jointMat.clone().multiply(childBaseMat);
        }

        childWorldMat.decompose(childMesh.position, childMesh.quaternion, childMesh.scale);
        childMesh.updateMatrix();
        childMesh.updateMatrixWorld(true);

        visiting.delete(j.id);
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
