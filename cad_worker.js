/**
 * 3DCad Studio — Dedicated Web Worker for Exact BRep CAD
 * Runs Open CASCADE Technology WebAssembly and Replicad in a background thread.
 * Guarantees a 60 FPS responsive UI even during heavy BRep booleans, lofts, sweeps, and STEP I/O.
 */
import opencascade from "./libs/replicad_single.js";
import * as replicad from "./libs/replicad.bundle.js";
import "./cad_sketch_solver.js";
import "./cad_exact_engine.js";

let isReady = false;
let ocInstance = null;
const historyGraph = new self.CadExactEngine.ParametricHistoryGraph();

async function initOC() {
  if (isReady) return true;
  try {
    ocInstance = await opencascade({
      locateFile: (file) => new URL("./libs/" + file, import.meta.url).href,
      print: (msg) => console.log("[OCCT Worker]", msg),
      printErr: (err) => console.warn("[OCCT Worker Error]", err),
    });
    replicad.setOC(ocInstance);
    self.CadExactEngine.setReplicad(replicad, ocInstance);
    isReady = true;
    return true;
  } catch (err) {
    console.error("[OCCT Worker] Init failed:", err);
    throw err;
  }
}

self.onmessage = async function (e) {
  const { id, action, payload } = e.data || {};
  if (!id) return;

  try {
    if (action === "init") {
      await initOC();
      self.postMessage({ id, success: true, action: "init" });
      return;
    }

    if (!isReady) {
      await initOC();
    }

    switch (action) {
      case "ping": {
        self.postMessage({ id, success: true, result: "pong" });
        break;
      }

      case "solveSketch": {
        const solveRes = self.CadSketchSolver.solveSketch(payload.sketch);
        let profiles = [];
        try {
          profiles = self.CadSketchSolver.extractProfiles(solveRes.sketch, {
            invertY: payload.invertY !== false,
          });
        } catch {}
        self.postMessage({
          id,
          success: true,
          action,
          result: {
            ...solveRes,
            profiles,
          },
        });
        break;
      }

      case "buildPrimitive": {
        const rep = self.CadExactEngine.getReplicad();
        let solid;
        const { type, params } = payload;
        if (type === "BOX") solid = self.CadExactEngine.makeExactBox(rep, params);
        else if (type === "CYLINDER") solid = self.CadExactEngine.makeExactCylinder(rep, params);
        else if (type === "SPHERE") solid = self.CadExactEngine.makeExactSphere(rep, params);
        else if (type === "CONE") solid = self.CadExactEngine.makeExactCone(rep, params);
        else if (type === "TORUS") solid = self.CadExactEngine.makeExactTorus(rep, params);
        else throw new Error("Unknown exact primitive: " + type);

        const meshData = self.CadExactEngine.meshBRepSolid(solid, payload.options);
        solid.delete();
        self.postMessage({ id, success: true, action, result: meshData });
        break;
      }

      case "buildExtrude": {
        const rep = self.CadExactEngine.getReplicad();
        const solid = self.CadExactEngine.makeExactExtrude(rep, payload.profiles, payload.params);
        const meshData = self.CadExactEngine.meshBRepSolid(solid, payload.options);
        solid.delete();
        self.postMessage({ id, success: true, action, result: meshData });
        break;
      }

      case "buildRevolve": {
        const rep = self.CadExactEngine.getReplicad();
        const solid = self.CadExactEngine.makeExactRevolve(rep, payload.profiles, payload.params);
        const meshData = self.CadExactEngine.meshBRepSolid(solid, payload.options);
        solid.delete();
        self.postMessage({ id, success: true, action, result: meshData });
        break;
      }

      case "buildLoft": {
        const rep = self.CadExactEngine.getReplicad();
        const solid = self.CadExactEngine.makeExactLoft(rep, payload.profileSketches, payload.params);
        const meshData = self.CadExactEngine.meshBRepSolid(solid, payload.options);
        solid.delete();
        self.postMessage({ id, success: true, action, result: meshData });
        break;
      }

      case "buildSweep": {
        const rep = self.CadExactEngine.getReplicad();
        const solid = self.CadExactEngine.makeExactSweep(rep, payload.profile, payload.spine, payload.params);
        const meshData = self.CadExactEngine.meshBRepSolid(solid, payload.options);
        solid.delete();
        self.postMessage({ id, success: true, action, result: meshData });
        break;
      }

      case "recomputeHistory": {
        historyGraph.setFeatures(payload.features);
        const out = historyGraph.recompute(payload.step);
        self.postMessage({
          id,
          success: true,
          action,
          result: {
            step: out.step,
            total: out.total,
            results: out.results,
          },
        });
        break;
      }

      case "exportSTEP": {
        // Build solids from current features and export true analytic STEP
        historyGraph.setFeatures(payload.features);
        const out = historyGraph.recompute();
        const validShapes = [];
        if (out.activeSolid) {
          validShapes.push({ shape: out.activeSolid, name: payload.name || "Part", color: payload.color || "#f97316" });
        }
        if (!validShapes.length) throw new Error("No active BRep solid to export");
        const blob = self.CadExactEngine.exportExactSTEP(validShapes);
        const arrayBuf = await blob.arrayBuffer();
        self.postMessage({ id, success: true, action, result: { arrayBuffer: arrayBuf } }, [arrayBuf]);
        break;
      }

      case "importSTEP": {
        const shape = await self.CadExactEngine.importExactSTEP(payload.arrayBuffer);
        const meshData = self.CadExactEngine.meshBRepSolid(shape);
        shape.delete();
        self.postMessage({ id, success: true, action, result: meshData });
        break;
      }

      default:
        throw new Error("Unknown worker action: " + action);
    }
  } catch (err) {
    self.postMessage({ id, success: false, action, error: err.message || String(err) });
  }
};
