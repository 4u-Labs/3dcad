/**
 * 3DCad Studio — Client CAD Kernel Bridge
 * Connects the main UI thread with the dedicated Web Worker (Open CASCADE + Replicad).
 * Manages request-response promises, geometry conversion to Three.js, and offline/fallback execution.
 */
(function (root, factory) {
  "use strict";
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.CadKernel = factory();
  }
})(typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  let worker = null;
  let requestIdCounter = 1;
  const pendingRequests = new Map();
  let initPromise = null;
  let isAvailable = false;

  function createWorker() {
    if (typeof Worker === "undefined") return null;
    try {
      return new Worker("cad_worker.js", { type: "module" });
    } catch (err) {
      console.warn("[CadKernel] Worker creation failed, fallback mode:", err);
      return null;
    }
  }

  function sendRequest(action, payload = {}) {
    return new Promise((resolve, reject) => {
      const id = requestIdCounter++;
      pendingRequests.set(id, { resolve, reject, action });
      if (worker) {
        worker.postMessage({ id, action, payload });
      } else {
        // Fallback if worker not available
        reject(new Error("Exact CAD Worker unavailable"));
      }
    });
  }

  function init() {
    if (initPromise) return initPromise;
    initPromise = new Promise((resolve) => {
      worker = createWorker();
      if (!worker) {
        console.info("[CadKernel] Running in Mesh CAD mode (no Web Worker)");
        resolve(false);
        return;
      }

      worker.onmessage = function (e) {
        const { id, success, action, result, error } = e.data || {};
        if (id && pendingRequests.has(id)) {
          const { resolve, reject } = pendingRequests.get(id);
          pendingRequests.delete(id);
          if (success) resolve(result);
          else reject(new Error(error || `Kernel action ${action} failed`));
        }
      };

      worker.onerror = function (err) {
        console.warn("[CadKernel Worker Error]", err);
      };

      sendRequest("init")
        .then(() => {
          isAvailable = true;
          console.info("[CadKernel] Open CASCADE Technology 7.8 BRep Kernel Ready!");
          resolve(true);
        })
        .catch((err) => {
          console.warn("[CadKernel] Kernel init warning:", err.message);
          resolve(false);
        });
    });
    return initPromise;
  }

  /**
   * Convert raw worker mesh data to a THREE.BufferGeometry with exact vertex normals and edge lines.
   */
  function toThreeGeometry(meshData, THREE_LIB = typeof THREE !== "undefined" ? THREE : null) {
    if (!meshData || !THREE_LIB) return null;
    const geom = new THREE_LIB.BufferGeometry();
    geom.setAttribute("position", new THREE_LIB.Float32BufferAttribute(meshData.positions, 3));
    if (meshData.indices && meshData.indices.length) {
      geom.setIndex(meshData.indices);
    }
    if (meshData.normals && meshData.normals.length) {
      geom.setAttribute("normal", new THREE_LIB.Float32BufferAttribute(meshData.normals, 3));
    } else {
      geom.computeVertexNormals();
    }
    geom.computeBoundingBox();
    geom.computeBoundingSphere();

    // Attach exact CAD edge lines
    let edgeSegments = null;
    if (meshData.edgeLines && meshData.edgeLines.length >= 6) {
      const edgeGeom = new THREE_LIB.BufferGeometry();
      edgeGeom.setAttribute("position", new THREE_LIB.Float32BufferAttribute(meshData.edgeLines, 3));
      const edgeMat = new THREE_LIB.LineBasicMaterial({
        color: 0x0b0e14,
        transparent: true,
        opacity: 0.78,
      });
      edgeSegments = new THREE_LIB.LineSegments(edgeGeom, edgeMat);
      edgeSegments.userData = { isCadEdge: true };
    }

    return { geometry: geom, edges: edgeSegments, meta: meshData };
  }

  return {
    init,
    get isAvailable() {
      return isAvailable;
    },
    solveSketch: (sketch, invertY = true) => sendRequest("solveSketch", { sketch, invertY }),
    buildPrimitive: (type, params, options) => sendRequest("buildPrimitive", { type, params, options }),
    buildExtrude: (profiles, params, options) => sendRequest("buildExtrude", { profiles, params, options }),
    buildRevolve: (profiles, params, options) => sendRequest("buildRevolve", { profiles, params, options }),
    buildLoft: (profileSketches, params, options) => sendRequest("buildLoft", { profileSketches, params, options }),
    buildSweep: (profile, spine, params, options) => sendRequest("buildSweep", { profile, spine, params, options }),
    recomputeHistory: (features, step) => sendRequest("recomputeHistory", { features, step }),
    exportSTEP: (features, name, color) => sendRequest("exportSTEP", { features, name, color }),
    importSTEP: (arrayBuffer) => sendRequest("importSTEP", { arrayBuffer }),
    toThreeGeometry,
  };
});
