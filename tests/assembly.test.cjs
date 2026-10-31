const { test } = require("node:test");
const assert = require("node:assert/strict");
const CadAssembly = require("../cad_assembly.js");

function createMockThreeMesh(pos = [0, 0, 0]) {
  const p = { x: pos[0], y: pos[1], z: pos[2], clone: () => ({ ...p, set: (x, y, z) => { p.x = x; p.y = y; p.z = z; } }) };
  const q = { x: 0, y: 0, z: 0, w: 1, clone: () => ({ ...q }), setFromAxisAngle: () => {}, premultiply: () => {} };
  const s = { x: 1, y: 1, z: 1, clone: () => ({ ...s }) };
  return {
    position: p,
    quaternion: q,
    scale: s,
    updateMatrixWorld: () => {},
  };
}

test("CadAssembly.Joint: validates joint types and enforces motion limits", () => {
  const revoluteJoint = new CadAssembly.Joint({
    name: "Arm_Pivot",
    type: "revolute",
    bodyA: "base_solid",
    bodyB: "arm_solid",
    axis: [0, 0, 1],
    limits: { min: -90, max: 90, enabled: true },
    value: 0,
  });

  assert.equal(revoluteJoint.type, "revolute");
  assert.equal(revoluteJoint.value, 0);

  // Set within limits
  revoluteJoint.setValue(45);
  assert.equal(revoluteJoint.value, 45);

  // Clamped at max limit
  revoluteJoint.setValue(120);
  assert.equal(revoluteJoint.value, 90);

  // Clamped at min limit
  revoluteJoint.setValue(-150);
  assert.equal(revoluteJoint.value, -90);
});

test("CadAssembly.AssemblyManager: registers bodies, adds joints, and serializes state", () => {
  const manager = new CadAssembly.AssemblyManager();
  const bodyA = createMockThreeMesh([0, 0, 0]);
  const bodyB = createMockThreeMesh([20, 0, 0]);

  manager.registerBody("base", "Base Body", bodyA);
  manager.registerBody("link1", "Link 1", bodyB);

  assert.equal(manager.bodies.size, 2);

  const joint = manager.addJoint({
    name: "J1_Revolute",
    type: "revolute",
    bodyA: "base",
    bodyB: "link1",
    axis: [0, 1, 0],
    limits: { min: -180, max: 180, enabled: true },
    value: 30,
  });

  assert.equal(manager.joints.length, 1);
  assert.equal(manager.getJoint(joint.id).value, 30);

  // JSON serialization roundtrip
  const json = manager.toJSON();
  assert.equal(json.joints.length, 1);
  assert.equal(json.joints[0].name, "J1_Revolute");
  assert.equal(json.joints[0].type, "revolute");

  // Removing body cascades to its attached joints
  manager.unregisterBody("link1");
  assert.equal(manager.bodies.size, 1);
  assert.equal(manager.joints.length, 0);
});

test("CadAssembly.AssemblyManager: slider joint translation clamps between min/max stroke", () => {
  const manager = new CadAssembly.AssemblyManager();
  const base = createMockThreeMesh([0, 0, 0]);
  const carriage = createMockThreeMesh([0, 0, 0]);

  manager.registerBody("rail", "Linear Rail", base);
  manager.registerBody("carriage", "Carriage", carriage);

  const slider = manager.addJoint({
    name: "Linear_Axis_X",
    type: "slider",
    bodyA: "rail",
    bodyB: "carriage",
    axis: [1, 0, 0],
    limits: { min: 0, max: 150, enabled: true },
    value: 0,
  });

  slider.setValue(75);
  assert.equal(slider.value, 75);

  slider.setValue(200);
  assert.equal(slider.value, 150);

  slider.setValue(-50);
  assert.equal(slider.value, 0);
});

test("CadAssembly.AssemblyManager: handles kinematic chains and prevents cyclic deadlocks", () => {
  const manager = new CadAssembly.AssemblyManager();
  const bodyA = createMockThreeMesh([0, 0, 0]);
  const bodyB = createMockThreeMesh([10, 0, 0]);

  manager.registerBody("bodyA", "Body A", bodyA);
  manager.registerBody("bodyB", "Body B", bodyB);

  // Add cyclic joints A -> B and B -> A
  manager.addJoint({ id: "j1", bodyA: "bodyA", bodyB: "bodyB", type: "revolute", axis: [0, 0, 1] });
  manager.addJoint({ id: "j2", bodyA: "bodyB", bodyB: "bodyA", type: "revolute", axis: [0, 0, 1] });

  // Must not throw or recurse infinitely
  assert.doesNotThrow(() => {
    manager.evaluateKinematics();
  });
});

