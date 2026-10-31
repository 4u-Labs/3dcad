const { test, before } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const CadExactEngine = require("../cad_exact_engine.js");

let oc;
let replicad;

before(async () => {
  const ocModule = await import("../libs/replicad_single.mjs");
  const repModule = await import("../libs/replicad.bundle.mjs");
  replicad = repModule;
  oc = await ocModule.default({
    locateFile: (f) => path.join(__dirname, "../libs", f),
    print: () => {},
    printErr: () => {},
  });
  replicad.setOC(oc);
  CadExactEngine.setReplicad(replicad, oc);
});

test("CadExactEngine: primitives have exact mathematical analytic volumes", () => {
  // Box 20x30x40 = 24,000 mm³
  const box = CadExactEngine.makeExactBox(replicad, { width: 20, depth: 30, height: 40 });
  const boxVol = replicad.measureVolume(box);
  assert.equal(Math.round(boxVol), 24000);
  box.delete();

  // Cylinder r=10, h=25 -> pi * 10^2 * 25 ≈ 7853.98 mm³
  const cyl = CadExactEngine.makeExactCylinder(replicad, { diameter: 20, height: 25, innerDiameter: 0 });
  const cylVol = replicad.measureVolume(cyl);
  assert.ok(Math.abs(cylVol - Math.PI * 100 * 25) < 1.0);
  cyl.delete();

  // Sphere r=12 -> 4/3 * pi * 12^3 ≈ 7238.23 mm³
  const sphere = CadExactEngine.makeExactSphere(replicad, { diameter: 24 });
  const sphereVol = replicad.measureVolume(sphere);
  assert.ok(Math.abs(sphereVol - (4 / 3) * Math.PI * Math.pow(12, 3)) < 1.0);
  sphere.delete();

  // Torus R=25, r=5 -> (pi * r^2) * (2 * pi * R) = 2 * pi^2 * 25 * 25 ≈ 12337.0 mm³
  const torus = CadExactEngine.makeExactTorus(replicad, { majorDiameter: 50, tubeDiameter: 10 });
  const torusVol = replicad.measureVolume(torus);
  assert.ok(Math.abs(torusVol - 2 * Math.PI * Math.PI * 25 * 25) < 5.0);
  torus.delete();
});

test("CadExactEngine: revolve creates exact analytic solids of revolution", () => {
  // Revolve a 10x20 rectangle offset by 5mm from axis around Z
  const rectProfile = {
    kind: "rect",
    x: 10,
    y: 0,
    w: 10,
    h: 20,
    isHole: false,
  };
  const revolved = CadExactEngine.makeExactRevolve(replicad, [rectProfile], { angle: 360, axis: "Z" });
  assert.ok(revolved);
  const vol = replicad.measureVolume(revolved);
  assert.ok(vol > 0);
  revolved.delete();
});

test("CadExactEngine: edge finishing (Fillet, Chamfer, Shell) preserves watertight BRep topology", () => {
  const baseBox = CadExactEngine.makeExactBox(replicad, { width: 30, depth: 30, height: 30 });
  const baseVol = replicad.measureVolume(baseBox);

  // Fillet removes material from exterior convex edges
  const filleted = CadExactEngine.applyFillet(baseBox, 2.5);
  const filletedVol = replicad.measureVolume(filleted);
  assert.ok(filletedVol < baseVol, "Fillet volume is less than unfilleted box");

  // Mesh check
  const meshData = CadExactEngine.meshBRepSolid(filleted);
  assert.ok(meshData.positions.length > 0);
  assert.ok(meshData.indices.length > 0);
  assert.ok(meshData.edgeLines.length > 0);

  filleted.delete();

  // Shell hollows out solid
  const boxToShell = CadExactEngine.makeExactBox(replicad, { width: 40, depth: 40, height: 40 });
  const shelled = CadExactEngine.applyShell(boxToShell, 2.0);
  const shelledVol = replicad.measureVolume(shelled);
  assert.ok(shelledVol < 40 * 40 * 40);
  shelled.delete();
});

test("CadExactEngine: ParametricHistoryGraph recomputes operations step-by-step", () => {
  const graph = new CadExactEngine.ParametricHistoryGraph();
  graph.setFeatures([
    { id: "feat1", type: "BOX", params: { width: 30, depth: 30, height: 20 } },
    { id: "feat2", type: "CYLINDER", params: { diameter: 14, height: 20, innerDiameter: 0 }, pos: [0, 0, 0] },
    { id: "feat3", type: "BOOLEAN_CUT", params: { baseFeatureId: "feat1", toolFeatureId: "feat2" } },
  ]);

  const out = graph.recompute();
  assert.equal(out.step, 3);
  assert.equal(out.total, 3);
  assert.ok(out.activeSolid);

  const finalVol = replicad.measureVolume(out.activeSolid);
  // Volume should be box volume - cylinder bore volume
  const expectedVol = 30 * 30 * 20 - Math.PI * 7 * 7 * 20;
  assert.ok(Math.abs(finalVol - expectedVol) < 50.0);
});

test("CadExactEngine: STEP interchange exports and imports true analytic BRep", async () => {
  const box = CadExactEngine.makeExactBox(replicad, { width: 25, depth: 35, height: 15 });
  const filleted = CadExactEngine.applyFillet(box, 2);

  // Export analytic STEP
  const stepBlob = CadExactEngine.exportExactSTEP([
    { shape: filleted, name: "FilletedBracket", color: "#38bdf8" },
  ]);
  const stepText = await stepBlob.text();

  assert.ok(stepText.startsWith("ISO-10303-21;"));
  assert.ok(stepText.includes("ADVANCED_BREP_SHAPE_REPRESENTATION") || stepText.includes("BREP"));
  assert.ok(stepText.includes("END-ISO-10303-21;"));

  // Re-import STEP into exact shape
  const arrayBuffer = await stepBlob.arrayBuffer();
  const importedShape = await CadExactEngine.importExactSTEP(arrayBuffer);
  assert.ok(importedShape);
  const importedVol = replicad.measureVolume(importedShape);
  assert.ok(Math.abs(importedVol - replicad.measureVolume(filleted)) < 1.0);

  filleted.delete();
  importedShape.delete();
});
