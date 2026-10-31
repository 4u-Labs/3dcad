/**
 * 3DCad Studio — Exact BRep Geometry Engine
 * Powered by Open CASCADE Technology & Replicad
 * Exact analytic solids, BRep booleans, lofts, sweeps, revolutions, fillets,
 * chamfers, shells, and ISO-10303-21 STEP interchange.
 */
(function (root, factory) {
  "use strict";
  const api = factory();
  root.CadExactEngine = api;
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
})(typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  let replicadModule = null;
  let ocInstance = null;
  let isInitialized = false;

  function setReplicad(replicad, oc) {
    replicadModule = replicad;
    ocInstance = oc;
    if (replicad && oc) {
      replicad.setOC(oc);
      isInitialized = true;
    }
  }

  function getReplicad() {
    if (!replicadModule) {
      if (typeof self !== "undefined" && self.replicad) return self.replicad;
      if (typeof window !== "undefined" && window.replicad) return window.replicad;
      throw new Error("Replicad / Open CASCADE not initialized");
    }
    return replicadModule;
  }

  function getOC() {
    if (!ocInstance) {
      const rep = getReplicad();
      return rep.getOC();
    }
    return ocInstance;
  }

  /**
   * Safely dispose of a Replicad shape or OpenCASCADE entity.
   */
  function safeDelete(obj) {
    if (!obj) return;
    try {
      if (typeof obj.delete === "function") obj.delete();
    } catch {}
  }

  /**
   * Convert degree angle to radians.
   */
  function toRad(deg) {
    return ((Number(deg) || 0) * Math.PI) / 180;
  }

  /**
   * Build a Replicad 2D Blueprint from sketch loops (extracted by cad_sketch_solver).
   */
  function buildBlueprintFromProfile(rep, profile) {
    const outer = profile.outer || profile;
    const holes = profile.holes || [];

    function buildLoopDrawing(loop) {
      if (!loop) return rep.drawRectangle(20, 20);
      if (loop.kind === "circle") {
        return rep.drawCircle(loop.r).translate([loop.x ?? loop.cx ?? 0, loop.y ?? loop.cy ?? 0]);
      }
      if (loop.kind === "rect") {
        return rep.drawRectangle(loop.w, loop.h).translate([loop.x ?? loop.cx ?? 0, loop.y ?? loop.cy ?? 0]);
      }
      if (loop.kind === "slot") {
        const half = Math.max(0.01, loop.w * 0.5 - loop.h * 0.5);
        const rad = loop.h * 0.5;
        let pen = rep.draw([(loop.x ?? loop.cx ?? 0) - half, (loop.y ?? loop.cy ?? 0) - rad]);
        pen = pen.lineTo([(loop.x ?? loop.cx ?? 0) + half, (loop.y ?? loop.cy ?? 0) - rad]);
        pen = pen.halfEllipseTo([(loop.x ?? loop.cx ?? 0) + half, (loop.y ?? loop.cy ?? 0) + rad], rad);
        pen = pen.lineTo([(loop.x ?? loop.cx ?? 0) - half, (loop.y ?? loop.cy ?? 0) + rad]);
        pen = pen.halfEllipseTo([(loop.x ?? loop.cx ?? 0) - half, (loop.y ?? loop.cy ?? 0) - rad], rad);
        return pen.close();
      }

      // Loop built from segments
      const segs = loop.segments || [];
      if (!segs.length) {
        // Fallback from samples
        if (loop.samples && loop.samples.length >= 3) {
          let pen = rep.draw(loop.samples[0]);
          for (let i = 1; i < loop.samples.length; i++) pen = pen.lineTo(loop.samples[i]);
          return pen.close();
        }
        return rep.drawRectangle(20, 20);
      }

      const firstSeg = segs[0];
      const startPt = firstSeg.from || [0, 0];
      let pen = rep.draw(startPt);
      for (const seg of segs) {
        if (seg.type === "line") {
          pen = pen.lineTo(seg.to);
        } else if (seg.type === "arc") {
          if (seg.mid) {
            pen = pen.threePointsArcTo(seg.to, seg.mid);
          } else if (seg.r) {
            pen = pen.halfEllipseTo(seg.to, seg.r);
          } else {
            pen = pen.lineTo(seg.to);
          }
        } else if (seg.type === "circle") {
          return rep.drawCircle(seg.r).translate([seg.cx, seg.cy]);
        }
      }
      return pen.close();
    }

    let mainDrawing = buildLoopDrawing(outer);
    for (const h of holes) {
      const holeDrawing = buildLoopDrawing(h);
      const cutResult = mainDrawing.cut(holeDrawing);
      if (cutResult) mainDrawing = cutResult;
    }
    return mainDrawing;
  }

  /**
   * Exact BRep Primitive Builders
   */
  function makeExactBox(rep, params = {}) {
    const w = Math.max(0.1, Number(params.width) || 40);
    const d = Math.max(0.1, Number(params.depth) || 30);
    const h = Math.max(0.1, Number(params.height) || 20);
    const cr = Math.max(0, Number(params.cornerRadius) || 0);
    const bore = Math.max(0, Number(params.boreDiameter) || 0);

    let solid = rep.makeBaseBox(w, d, h);
    if (cr > 0.05 && cr < Math.min(w, d, h) * 0.49) {
      try {
        const filleted = solid.fillet(cr, (f) => f.parallelTo("Z"));
        solid.delete();
        solid = filleted;
      } catch {}
    }
    if (bore > 0.1 && bore < Math.min(w, d) - 0.5) {
      try {
        const cyl = rep.makeCylinder(bore * 0.5, h + 4, [0, 0, -2], [0, 0, 1]);
        const drilled = solid.cut(cyl);
        solid.delete();
        cyl.delete();
        solid = drilled;
      } catch {}
    }
    return solid;
  }

  function makeExactCylinder(rep, params = {}) {
    const dia = Math.max(0.2, Number(params.diameter) || 30);
    const inner = Math.max(0, Number(params.innerDiameter) || 0);
    const h = Math.max(0.2, Number(params.height) || 25);
    const rOut = dia * 0.5;
    let solid = rep.makeCylinder(rOut, h, [0, 0, 0], [0, 0, 1]);
    if (inner > 0.1 && inner < dia - 0.2) {
      const hole = rep.makeCylinder(inner * 0.5, h + 4, [0, 0, -2], [0, 0, 1]);
      const hollow = solid.cut(hole);
      solid.delete();
      hole.delete();
      solid = hollow;
    }
    return solid;
  }

  function makeExactSphere(rep, params = {}) {
    const dia = Math.max(0.5, Number(params.diameter) || 30);
    return rep.makeSphere(dia * 0.5);
  }

  function makeExactCone(rep, params = {}) {
    const bDia = Math.max(0.2, Number(params.bottomDiameter) || 30);
    const tDia = Math.max(0, Number(params.topDiameter) || 0);
    const h = Math.max(0.2, Number(params.height) || 30);
    const r1 = bDia * 0.5;
    const r2 = Math.max(1e-4, tDia * 0.5);
    // Open CASCADE BRep revolve of trapezoid produces true analytic conical surface
    const pen = rep.draw([0, 0]).lineTo([r1, 0]).lineTo([r2, h]).lineTo([0, h]).close();
    return pen.sketchOnPlane("XZ").revolve([0, 0, 1], { origin: [0, 0, 0], angle: 360 });
  }

  function makeExactTorus(rep, params = {}) {
    const major = Math.max(2, Number(params.majorDiameter) || 36);
    const tube = Math.max(0.5, Math.min(major * 0.48, Number(params.tubeDiameter) || 6));
    const oc = getOC();
    const rMajor = major * 0.5;
    const rTube = tube * 0.5;
    if (oc && oc.BRepPrimAPI_MakeTorus) {
      const builder = new oc.BRepPrimAPI_MakeTorus(rMajor, rTube);
      const res = rep.cast(builder.Shape());
      builder.delete();
      return res;
    }
    // Revolve circle around Z axis
    const circle = rep.drawCircle(rTube).translate([rMajor, 0]);
    return circle.sketchOnPlane("XZ").revolve([0, 0, 1], { origin: [0, 0, 0], angle: 360 });
  }

  /**
   * Build Solid from Sketch Profiles (Extrude, Revolve, Loft, Sweep)
   */
  function makeExactExtrude(rep, profiles, params = {}) {
    const h = Math.max(0.1, Number(params.height) || 15);
    const plane = params.plane || "XY";
    const solids = [];
    for (const prof of profiles) {
      const bp = buildBlueprintFromProfile(rep, prof);
      const sk = bp.sketchOnPlane(plane);
      const solid = sk.extrude(h);
      solids.push(solid);
    }
    if (solids.length === 1) return solids[0];
    let compound = solids[0];
    for (let i = 1; i < solids.length; i++) {
      try {
        const fused = compound.fuse(solids[i]);
        compound.delete();
        solids[i].delete();
        compound = fused;
      } catch {
        // Keep as compound shapes if separate islands
        compound = rep.makeCompound([compound, solids[i]]);
      }
    }
    return compound;
  }

  function makeExactRevolve(rep, profiles, params = {}) {
    const angle = Math.min(360, Math.max(1, Number(params.angle) || 360));
    const axis = params.axis || "Z";
    const origin = params.origin || [0, 0, 0];
    const plane = params.plane || "XZ";
    const solids = [];
    const revAxis = axis === "X" ? [1, 0, 0] : axis === "Y" ? [0, 1, 0] : [0, 0, 1];
    for (const prof of profiles) {
      const bp = buildBlueprintFromProfile(rep, prof);
      const sk = bp.sketchOnPlane(plane);
      const solid = sk.revolve(revAxis, { origin, angle });
      solids.push(solid);
    }
    if (solids.length === 1) return solids[0];
    let res = solids[0];
    for (let i = 1; i < solids.length; i++) {
      const fused = res.fuse(solids[i]);
      res.delete();
      solids[i].delete();
      res = fused;
    }
    return res;
  }

  function makeExactLoft(rep, profileSketches, params = {}) {
    if (!profileSketches || profileSketches.length < 2) {
      throw new Error("Loft requires at least 2 cross-section profiles across planes");
    }
    const sketches = [];
    for (const spec of profileSketches) {
      const bp = buildBlueprintFromProfile(rep, spec.profile);
      const origin = spec.origin || [0, 0, spec.z || 0];
      const plane = spec.plane || "XY";
      sketches.push(bp.sketchOnPlane(plane, origin));
    }
    const base = sketches[0];
    const targets = sketches.slice(1);
    const lofted = base.loftWith(targets, { ruled: params.ruled === true });
    return lofted;
  }

  function makeExactSweep(rep, profile, spineSpec = {}, params = {}) {
    const bp = buildBlueprintFromProfile(rep, profile);
    let spineWire;
    if (spineSpec.kind === "helix") {
      const pitch = Math.max(1, Number(spineSpec.pitch) || 10);
      const height = Math.max(1, Number(spineSpec.height) || 40);
      const radius = Math.max(1, Number(spineSpec.radius) || 15);
      spineWire = rep.sketchHelix(pitch, height, radius).wire;
    } else if (spineSpec.points && spineSpec.points.length >= 2) {
      let pen = rep.draw(spineSpec.points[0]);
      for (let i = 1; i < spineSpec.points.length; i++) pen = pen.lineTo(spineSpec.points[i]);
      spineWire = pen.sketchOnPlane(spineSpec.plane || "XZ").wire;
    } else {
      spineWire = rep.sketchHelix(12, 36, 16).wire;
    }

    const profileWire = bp.sketchOnPlane(params.plane || "XY").wire;
    const swept = rep.genericSweep(profileWire, spineWire, {});
    safeDelete(spineWire);
    safeDelete(profileWire);
    return swept;
  }

  /**
   * Apply exact Fillet, Chamfer, or Shell to an existing solid.
   */
  function applyFillet(solid, radius, edgeFilter = null) {
    const r = Math.max(0.1, Number(radius) || 1);
    if (typeof edgeFilter === "function") {
      return solid.fillet(r, edgeFilter);
    }
    return solid.fillet(r);
  }

  function applyChamfer(solid, dist, edgeFilter = null) {
    const d = Math.max(0.1, Number(dist) || 1);
    if (typeof edgeFilter === "function") {
      return solid.chamfer(d, edgeFilter);
    }
    return solid.chamfer(d);
  }

  function applyShell(solid, wallThickness, faceFilter = null) {
    const t = Math.max(0.1, Number(wallThickness) || 2);
    if (typeof faceFilter === "function") {
      return solid.shell(t, faceFilter);
    }
    // Default: hollow with top face removed
    return solid.shell(t, (f) => f.inPlane("XY", "max"));
  }

  /**
   * Mesh a BRep solid for WebGL rendering and extract exact CAD edge lines.
   */
  function meshBRepSolid(solid, options = {}) {
    const tolerance = Number(options.tolerance) || 0.05;
    const angularTolerance = Number(options.angularTolerance) || 15;
    const mesh = solid.mesh({ tolerance, angularTolerance });
    let edgeLines = [];
    try {
      const edgeData = solid.meshEdges({ tolerance, angularTolerance });
      if (edgeData && edgeData.lines) edgeLines = Array.from(edgeData.lines);
    } catch {}

    const rep = getReplicad();
    let volume = 0;
    let area = 0;
    try {
      volume = rep.measureVolume(solid);
    } catch {}
    try {
      area = rep.measureArea(solid);
    } catch {}

    return {
      positions: Array.from(mesh.vertices),
      indices: Array.from(mesh.triangles),
      normals: mesh.normals ? Array.from(mesh.normals) : null,
      edgeLines,
      triangleCount: mesh.triangles.length / 3,
      vertexCount: mesh.vertices.length / 3,
      volumeMm3: Number(volume.toFixed(3)),
      areaMm2: Number(area.toFixed(3)),
    };
  }

  /**
   * True ISO-10303-21 STEP Export using Open CASCADE XCAF/BRep.
   */
  function exportExactSTEP(shapesWithMetadata = [], options = {}) {
    const rep = getReplicad();
    const config = shapesWithMetadata.map((item) => ({
      shape: item.shape,
      name: String(item.name || "Solid"),
      color: String(item.color || "#f97316"),
    }));
    const blob = rep.exportSTEP(config, {
      unit: options.unit || "MM",
      modelUnit: options.modelUnit || "MM",
    });
    return blob;
  }

  /**
   * True STEP Import into Open CASCADE BRep shapes.
   */
  async function importExactSTEP(blobOrBytes) {
    const rep = getReplicad();
    const blob =
      blobOrBytes instanceof Blob
        ? blobOrBytes
        : new Blob([blobOrBytes], { type: "application/STEP" });
    const shape = await rep.importSTEP(blob);
    return shape;
  }

  /**
   * Feature-based Dependency Graph & Parametric History Recomputer.
   */
  class ParametricHistoryGraph {
    constructor() {
      this.features = [];
      this.cache = new Map(); // id -> { solid, meshData, error }
    }

    setFeatures(features) {
      this.clearCache();
      this.features = JSON.parse(JSON.stringify(features || []));
    }

    addFeature(feature) {
      const clone = JSON.parse(JSON.stringify(feature));
      if (!clone.id) clone.id = `feat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      this.features.push(clone);
      return clone;
    }

    updateFeature(id, nextParams) {
      const feat = this.features.find((f) => f.id === id);
      if (!feat) throw new Error(`Feature ${id} not found`);
      feat.params = { ...feat.params, ...nextParams };
      this.invalidateDownstream(id);
      return feat;
    }

    deleteFeature(id) {
      const idx = this.features.findIndex((f) => f.id === id);
      if (idx !== -1) {
        this.clearCache();
        return this.features.splice(idx, 1)[0];
      }
      return null;
    }

    invalidateDownstream(featureId) {
      const idx = this.features.findIndex((f) => f.id === featureId);
      if (idx === -1) return;
      for (let i = idx; i < this.features.length; i++) {
        const id = this.features[i].id;
        if (this.cache.has(id)) {
          const entry = this.cache.get(id);
          safeDelete(entry.solid);
          this.cache.delete(id);
        }
      }
    }

    clearCache() {
      for (const entry of this.cache.values()) {
        safeDelete(entry.solid);
      }
      this.cache.clear();
    }

    /**
     * Recompute history up to a specific step index (or all features).
     */
    recompute(maxStep = this.features.length) {
      const rep = getReplicad();
      const results = [];
      let currentActiveSolid = null;

      for (let i = 0; i < Math.min(this.features.length, maxStep); i++) {
        const feat = this.features[i];
        if (feat.suppressed) continue;

        try {
          let nextSolid = null;
          switch (feat.type) {
            case "BOX":
              nextSolid = makeExactBox(rep, feat.params);
              break;
            case "CYLINDER":
              nextSolid = makeExactCylinder(rep, feat.params);
              break;
            case "SPHERE":
              nextSolid = makeExactSphere(rep, feat.params);
              break;
            case "CONE":
              nextSolid = makeExactCone(rep, feat.params);
              break;
            case "TORUS":
              nextSolid = makeExactTorus(rep, feat.params);
              break;
            case "EXTRUDE":
              nextSolid = makeExactExtrude(rep, feat.profiles, feat.params);
              break;
            case "REVOLVE":
              nextSolid = makeExactRevolve(rep, feat.profiles, feat.params);
              break;
            case "LOFT":
              nextSolid = makeExactLoft(rep, feat.profileSketches, feat.params);
              break;
            case "SWEEP":
              nextSolid = makeExactSweep(rep, feat.profile, feat.spine, feat.params);
              break;
            case "FILLET": {
              const target = currentActiveSolid || makeExactBox(rep);
              nextSolid = applyFillet(target, feat.params?.radius || 2);
              break;
            }
            case "CHAMFER": {
              const target = currentActiveSolid || makeExactBox(rep);
              nextSolid = applyChamfer(target, feat.params?.distance || 1.5);
              break;
            }
            case "SHELL": {
              const target = currentActiveSolid || makeExactBox(rep);
              nextSolid = applyShell(target, feat.params?.thickness || 2);
              break;
            }
            case "BOOLEAN_CUT": {
              const baseId = feat.params?.baseFeatureId;
              const toolId = feat.params?.toolFeatureId;
              const base = (baseId ? this.cache.get(baseId)?.solid : null) || currentActiveSolid;
              const tool = toolId ? this.cache.get(toolId)?.solid : null;
              if (base && tool) {
                nextSolid = base.cut(tool);
              }
              break;
            }
            case "BOOLEAN_FUSE": {
              const baseId = feat.params?.baseFeatureId;
              const toolId = feat.params?.toolFeatureId;
              const base = (baseId ? this.cache.get(baseId)?.solid : null) || currentActiveSolid;
              const tool = toolId ? this.cache.get(toolId)?.solid : null;
              if (base && tool) {
                nextSolid = base.fuse(tool);
              }
              break;
            }
            default:
              break;
          }

          if (nextSolid) {
            const meshData = meshBRepSolid(nextSolid);
            this.cache.set(feat.id, { solid: nextSolid, meshData, error: null });
            currentActiveSolid = nextSolid;
            results.push({ id: feat.id, type: feat.type, success: true, meshData });
          }
        } catch (err) {
          this.cache.set(feat.id, { solid: null, meshData: null, error: err.message });
          results.push({ id: feat.id, type: feat.type, success: false, error: err.message });
        }
      }

      return {
        step: maxStep,
        total: this.features.length,
        results,
        activeSolid: currentActiveSolid,
      };
    }
  }

  return {
    setReplicad,
    getReplicad,
    getOC,
    makeExactBox,
    makeExactCylinder,
    makeExactSphere,
    makeExactCone,
    makeExactTorus,
    makeExactExtrude,
    makeExactRevolve,
    makeExactLoft,
    makeExactSweep,
    applyFillet,
    applyChamfer,
    applyShell,
    meshBRepSolid,
    exportExactSTEP,
    importExactSTEP,
    ParametricHistoryGraph,
  };
});
