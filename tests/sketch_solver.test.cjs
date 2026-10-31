const { test } = require("node:test");
const assert = require("node:assert/strict");
const CadSketchSolver = require("../cad_sketch_solver.js");

test("CadSketchSolver: solves rectangle with horizontal, vertical, and distance constraints", () => {
  const rect = CadSketchSolver.createConstrainedRect(0, 0, 50, 30);
  assert.equal(rect.entities.length, 8); // 4 points + 4 lines
  assert.equal(rect.constraints.length, 6); // 2 H + 2 V + 2 Distances

  const res = CadSketchSolver.solveSketch(rect);
  assert.equal(res.converged, true);
  // An unanchored rectangle can slide in X/Y, so it's under-constrained (DOF = 2)
  assert.equal(res.status, "under_constrained");
  assert.equal(res.dof, 2);

  // If we fix one corner, it becomes fully constrained (DOF = 0, converged)
  rect.constraints.push({ id: "anchor", type: "fixed", point: "sk_p1", x: -25, y: -15 });
  const fullyRes = CadSketchSolver.solveSketch(rect);
  assert.equal(fullyRes.converged, true);
  assert.equal(fullyRes.status, "fully_constrained");
  assert.equal(fullyRes.dof, 0);

  // Verify corner coordinates
  const p1 = fullyRes.sketch.entities.find((e) => e.id === "sk_p1");
  const p2 = fullyRes.sketch.entities.find((e) => e.id === "sk_p2");
  const p3 = fullyRes.sketch.entities.find((e) => e.id === "sk_p3");
  const p4 = fullyRes.sketch.entities.find((e) => e.id === "sk_p4");

  // Width is 50
  assert.ok(Math.abs(Math.hypot(p2.x - p1.x, p2.y - p1.y) - 50) < 1e-4);
  // Height is 30
  assert.ok(Math.abs(Math.hypot(p3.x - p2.x, p3.y - p2.y) - 30) < 1e-4);
});

test("CadSketchSolver: degrees of freedom (DOF) calculation matches QR rank analysis", () => {
  // A single point with fixed constraint has 0 DOF
  const sketchFixed = {
    entities: [{ id: "pt1", kind: "point", x: 10, y: 15 }],
    constraints: [{ id: "c_fix", type: "fixed", point: "pt1", x: 10, y: 15 }],
  };
  const resFixed = CadSketchSolver.solveSketch(sketchFixed);
  assert.equal(resFixed.converged, true);
  assert.equal(resFixed.dof, 0);

  // A free point has 2 DOF (x, y)
  const sketchFree = {
    entities: [{ id: "pt1", kind: "point", x: 10, y: 15 }],
    constraints: [],
  };
  const resFree = CadSketchSolver.solveSketch(sketchFree);
  assert.equal(resFree.dof, 2);

  // Two points with distance constraint: 4 variables - 1 constraint = 3 DOF
  const sketchDist = {
    entities: [
      { id: "p1", kind: "point", x: 0, y: 0 },
      { id: "p2", kind: "point", x: 10, y: 0 },
    ],
    constraints: [{ id: "c1", type: "distance", p1: "p1", p2: "p2", value: 25 }],
  };
  const resDist = CadSketchSolver.solveSketch(sketchDist);
  assert.equal(resDist.converged, true);
  assert.equal(resDist.dof, 3);
  const p1 = resDist.sketch.entities.find((e) => e.id === "p1");
  const p2 = resDist.sketch.entities.find((e) => e.id === "p2");
  assert.ok(Math.abs(Math.hypot(p2.x - p1.x, p2.y - p1.y) - 25) < 1e-4);
});

test("CadSketchSolver: perpendicular and parallel constraints align lines accurately", () => {
  const sketch = {
    entities: [
      { id: "p1", kind: "point", x: 0, y: 0 },
      { id: "p2", kind: "point", x: 20, y: 0 },
      { id: "p3", kind: "point", x: 0, y: 5 },
      { id: "p4", kind: "point", x: 5, y: 20 },
      { id: "l1", kind: "line", p1: "p1", p2: "p2" },
      { id: "l2", kind: "line", p1: "p3", p2: "p4" },
    ],
    constraints: [
      { id: "c_fix1", type: "fixed", point: "p1", x: 0, y: 0 },
      { id: "c_fix2", type: "fixed", point: "p2", x: 30, y: 0 },
      { id: "c_perp", type: "perpendicular", line1: "l1", line2: "l2" },
    ],
  };

  const res = CadSketchSolver.solveSketch(sketch);
  assert.equal(res.converged, true);
  const p3 = res.sketch.entities.find((e) => e.id === "p3");
  const p4 = res.sketch.entities.find((e) => e.id === "p4");
  // Line 1 is along X axis, so Line 2 must be vertical (perpendicular)
  assert.ok(Math.abs(p4.x - p3.x) < 1e-3);
});

test("CadSketchSolver: concentric circles constraint centers circles together", () => {
  const sketch = {
    entities: [
      { id: "c1", kind: "circle", x: 10, y: 20, r: 15 },
      { id: "c2", kind: "circle", x: 50, y: 80, r: 8 },
    ],
    constraints: [
      { id: "c_conc", type: "concentric", circle1: "c1", circle2: "c2" },
      { id: "c_fix", type: "fixed", point: "c1", x: 10, y: 20 },
    ],
  };
  const res = CadSketchSolver.solveSketch(sketch);
  assert.equal(res.converged, true);
  const c1 = res.sketch.entities.find((e) => e.id === "c1");
  const c2 = res.sketch.entities.find((e) => e.id === "c2");
  assert.ok(Math.abs(c1.x - c2.x) < 1e-4);
  assert.ok(Math.abs(c1.y - c2.y) < 1e-4);
});

test("CadSketchSolver: extractProfiles detects outer boundaries and enclosed holes", () => {
  const sketch = {
    entities: [
      { id: "outer_rect", kind: "rect", x: 0, y: 0, w: 100, h: 60, isHole: false },
      { id: "hole1", kind: "circle", x: -20, y: 0, r: 8, isHole: true },
      { id: "hole2", kind: "circle", x: 20, y: 0, r: 8, isHole: true },
    ],
  };
  const profiles = CadSketchSolver.extractProfiles(sketch);
  assert.equal(profiles.length, 1);
  assert.equal(profiles[0].holes.length, 2);
  assert.ok(["wire", "rect"].includes(profiles[0].outer.kind));
});
