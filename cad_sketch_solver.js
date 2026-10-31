/**
 * 3DCad Studio — 2D Parametric Sketch Constraint Solver & Profile Extractor
 * Damped Levenberg-Marquardt nonlinear solver + QR Jacobian rank DOF analysis
 * + Closed planar loop (wire + nested hole) topology extractor.
 */
(function (root) {
  "use strict";

  const EPS = 1e-9;
  const SOLVE_TOL = 1e-6;
  const RANK_TOL = 1e-5;
  const MAX_ITERS = 140;

  const CONSTRAINT_TYPES = new Set([
    "fixed",
    "coincident",
    "horizontal",
    "vertical",
    "parallel",
    "perpendicular",
    "equal",
    "tangent",
    "concentric",
    "midpoint",
    "symmetric",
    "distance",
    "distanceX",
    "distanceY",
    "radius",
    "diameter",
    "angle",
  ]);

  function cloneSketch(sketch) {
    return JSON.parse(JSON.stringify(sketch || { entities: [], constraints: [] }));
  }

  function wrapAngle(rad) {
    return Math.atan2(Math.sin(rad), Math.cos(rad));
  }

  /**
   * Decomposes a rectangle into 4 corner points + 4 lines + H/V constraints
   * so users can freely constrain individual corners/edges or replace edges with arcs/fillets.
   */
  function createConstrainedRect(cx = 0, cy = 0, w = 60, h = 40, prefix = "sk") {
    const hw = w / 2;
    const hh = h / 2;
    const p1 = `${prefix}_p1`,
      p2 = `${prefix}_p2`,
      p3 = `${prefix}_p3`,
      p4 = `${prefix}_p4`;
    const l1 = `${prefix}_l1`,
      l2 = `${prefix}_l2`,
      l3 = `${prefix}_l3`,
      l4 = `${prefix}_l4`;
    return {
      entities: [
        { id: p1, kind: "point", x: cx - hw, y: cy - hh },
        { id: p2, kind: "point", x: cx + hw, y: cy - hh },
        { id: p3, kind: "point", x: cx + hw, y: cy + hh },
        { id: p4, kind: "point", x: cx - hw, y: cy + hh },
        { id: l1, kind: "line", p1, p2 },
        { id: l2, kind: "line", p1: p2, p2: p3 },
        { id: l3, kind: "line", p1: p3, p2: p4 },
        { id: l4, kind: "line", p1: p4, p2: p1 },
      ],
      constraints: [
        { id: `${prefix}_c_h1`, type: "horizontal", line: l1 },
        { id: `${prefix}_c_v1`, type: "vertical", line: l2 },
        { id: `${prefix}_c_h2`, type: "horizontal", line: l3 },
        { id: `${prefix}_c_v2`, type: "vertical", line: l4 },
        { id: `${prefix}_c_w`, type: "distance", line: l1, value: w },
        { id: `${prefix}_c_h`, type: "distance", line: l2, value: h },
      ],
    };
  }

  /**
   * Solve dense linear system A x = b via Gaussian elimination with partial pivoting.
   */
  function solveLinearSystem(A, b) {
    const n = b.length;
    if (n === 0) return [];
    const M = A.map((row, i) => [...row, b[i]]);
    for (let col = 0; col < n; col++) {
      let pivot = col;
      let maxAbs = Math.abs(M[col][col]);
      for (let row = col + 1; row < n; row++) {
        const v = Math.abs(M[row][col]);
        if (v > maxAbs) {
          maxAbs = v;
          pivot = row;
        }
      }
      if (maxAbs < 1e-15) continue;
      if (pivot !== col) {
        const tmp = M[col];
        M[col] = M[pivot];
        M[pivot] = tmp;
      }
      const diag = M[col][col];
      for (let row = col + 1; row < n; row++) {
        const factor = M[row][col] / diag;
        if (factor === 0) continue;
        for (let k = col; k <= n; k++) {
          M[row][k] -= factor * M[col][k];
        }
      }
    }
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let sum = M[i][n];
      for (let j = i + 1; j < n; j++) sum -= M[i][j] * x[j];
      x[i] = Math.abs(M[i][i]) > 1e-15 ? sum / M[i][i] : 0;
    }
    return x;
  }

  /**
   * Compute numerical rank of m x n Jacobian via Householder QR with column pivoting.
   */
  function computeJacobianRank(J, m, n) {
    if (m === 0 || n === 0) return 0;
    const R = J.map((r) => r.slice());
    const colNorms = new Array(n).fill(0);
    for (let j = 0; j < n; j++) {
      let s = 0;
      for (let i = 0; i < m; i++) s += R[i][j] * R[i][j];
      colNorms[j] = s;
    }
    const kMax = Math.min(m, n);
    let rank = 0;
    for (let k = 0; k < kMax; k++) {
      let bestCol = k;
      let bestNorm = -1;
      for (let j = k; j < n; j++) {
        let s = 0;
        for (let i = k; i < m; i++) s += R[i][j] * R[i][j];
        if (s > bestNorm) {
          bestNorm = s;
          bestCol = j;
        }
      }
      if (Math.sqrt(Math.max(0, bestNorm)) <= RANK_TOL) break;
      if (bestCol !== k) {
        for (let i = 0; i < m; i++) {
          const tmp = R[i][k];
          R[i][k] = R[i][bestCol];
          R[i][bestCol] = tmp;
        }
      }
      let normX = 0;
      for (let i = k; i < m; i++) normX += R[i][k] * R[i][k];
      normX = Math.sqrt(normX);
      if (normX <= RANK_TOL) break;
      const alpha = R[k][k] >= 0 ? -normX : normX;
      const vLenSq = normX * normX - R[k][k] * R[k][k] + (R[k][k] - alpha) * (R[k][k] - alpha);
      const vLen = Math.sqrt(Math.max(vLenSq, 1e-30));
      const v = new Array(m - k);
      v[0] = (R[k][k] - alpha) / vLen;
      for (let i = k + 1; i < m; i++) v[i - k] = R[i][k] / vLen;

      for (let j = k; j < n; j++) {
        let dot = 0;
        for (let i = k; i < m; i++) dot += v[i - k] * R[i][j];
        for (let i = k; i < m; i++) R[i][j] -= 2 * v[i - k] * dot;
      }
      rank++;
    }
    return rank;
  }

  /**
   * Normalize entity IDs and build parameter mapping for solver.
   */
  function indexSketchVariables(sketch) {
    const entities = sketch.entities || [];
    const byId = new Map();
    entities.forEach((ent, idx) => {
      if (!ent.id) ent.id = `ent_${idx + 1}`;
      byId.set(ent.id, ent);
    });

    const vars = [];
    const varMap = new Map(); // key "id:prop" -> index in vars

    const addVar = (ent, prop, min = -1e5, max = 1e5) => {
      const k = `${ent.id}:${prop}`;
      if (varMap.has(k)) return varMap.get(k);
      const idx = vars.length;
      vars.push({ ent, prop, min, max, initial: Number(ent[prop]) || 0 });
      varMap.set(k, idx);
      return idx;
    };

    for (const ent of entities) {
      if (ent.kind === "point") {
        addVar(ent, "x");
        addVar(ent, "y");
      } else if (ent.kind === "circle") {
        if (!ent.center || !byId.has(ent.center)) {
          addVar(ent, "x");
          addVar(ent, "y");
        }
        addVar(ent, "r", 0.1, 1e4);
      } else if (ent.kind === "polygon") {
        if (!ent.center || !byId.has(ent.center)) {
          addVar(ent, "x");
          addVar(ent, "y");
        }
        addVar(ent, "r", 0.2, 1e4);
      } else if (ent.kind === "rect" || ent.kind === "slot") {
        if (!ent.center || !byId.has(ent.center)) {
          addVar(ent, "x");
          addVar(ent, "y");
        }
        addVar(ent, "w", 0.2, 1e4);
        addVar(ent, "h", 0.2, 1e4);
      }
    }

    const getPointXY = (pointOrEntityId, xVec) => {
      const ent = byId.get(pointOrEntityId);
      if (!ent) return null;
      if (ent.kind === "point") {
        return {
          x: xVec[varMap.get(`${ent.id}:x`)],
          y: xVec[varMap.get(`${ent.id}:y`)],
          id: ent.id,
        };
      }
      if (ent.center && byId.has(ent.center)) {
        return getPointXY(ent.center, xVec);
      }
      if (varMap.has(`${ent.id}:x`)) {
        return {
          x: xVec[varMap.get(`${ent.id}:x`)],
          y: xVec[varMap.get(`${ent.id}:y`)],
          id: ent.id,
        };
      }
      return null;
    };

    const getLineEnds = (lineId, xVec) => {
      const ent = byId.get(lineId);
      if (!ent || ent.kind !== "line") return null;
      const a = getPointXY(ent.p1, xVec);
      const b = getPointXY(ent.p2, xVec);
      if (!a || !b) return null;
      return { ent, a, b };
    };

    const getRadius = (entId, xVec) => {
      const ent = byId.get(entId);
      if (!ent) return null;
      if (ent.kind === "circle" || ent.kind === "polygon") {
        const c = getPointXY(ent.id, xVec);
        return { ent, center: c, r: xVec[varMap.get(`${ent.id}:r`)] };
      }
      if (ent.kind === "arc") {
        const c = getPointXY(ent.center, xVec);
        const p1 = getPointXY(ent.p1, xVec);
        const p2 = getPointXY(ent.p2, xVec);
        if (!c || !p1 || !p2) return null;
        return { ent, center: c, p1, p2, r: Math.hypot(p1.x - c.x, p1.y - c.y) };
      }
      return null;
    };

    return { entities, byId, vars, varMap, getPointXY, getLineEnds, getRadius };
  }

  /**
   * Evaluate residual vector and track which constraint generated each row.
   */
  function evaluateResiduals(ctx, constraints, xVec) {
    const residuals = [];
    const owners = [];
    const push = (val, ownerId) => {
      residuals.push(Number.isFinite(val) ? val : 1e3);
      owners.push(ownerId);
    };

    // 1. Intrinsic entity constraints (fixed flag on points + equal-radius endpoints on arcs)
    for (const ent of ctx.entities) {
      if (ent.kind === "point" && ent.fixed === true) {
        const p = ctx.getPointXY(ent.id, xVec);
        const fx = ent.fixedX !== undefined ? ent.fixedX : ent.x;
        const fy = ent.fixedY !== undefined ? ent.fixedY : ent.y;
        push(p.x - fx, `fixed:${ent.id}`);
        push(p.y - fy, `fixed:${ent.id}`);
      } else if (ent.kind === "arc") {
        const c = ctx.getPointXY(ent.center, xVec);
        const p1 = ctx.getPointXY(ent.p1, xVec);
        const p2 = ctx.getPointXY(ent.p2, xVec);
        if (c && p1 && p2) {
          const r1 = Math.hypot(p1.x - c.x, p1.y - c.y);
          const r2 = Math.hypot(p2.x - c.x, p2.y - c.y);
          push(r1 - r2, `arc:${ent.id}`);
        }
      }
    }

    // 2. User geometric & dimensional constraints
    for (let i = 0; i < constraints.length; i++) {
      const c = constraints[i];
      if (!c || c.enabled === false) continue;
      const cid = c.id || `c_${i + 1}`;
      switch (c.type) {
        case "fixed": {
          const p = ctx.getPointXY(c.point || c.entity, xVec);
          if (!p) break;
          const orig = ctx.byId.get(c.point || c.entity);
          const tx = c.x !== undefined ? Number(c.x) : Number(orig?.x || 0);
          const ty = c.y !== undefined ? Number(c.y) : Number(orig?.y || 0);
          push(p.x - tx, cid);
          push(p.y - ty, cid);
          break;
        }
        case "coincident": {
          if (c.p1 && c.p2) {
            const a = ctx.getPointXY(c.p1, xVec);
            const b = ctx.getPointXY(c.p2, xVec);
            if (a && b) {
              push(a.x - b.x, cid);
              push(a.y - b.y, cid);
            }
          } else if (c.point && c.line) {
            const p = ctx.getPointXY(c.point, xVec);
            const ln = ctx.getLineEnds(c.line, xVec);
            if (p && ln) {
              const dx = ln.b.x - ln.a.x;
              const dy = ln.b.y - ln.a.y;
              const len = Math.max(Math.hypot(dx, dy), 1e-6);
              push(((p.x - ln.a.x) * dy - (p.y - ln.a.y) * dx) / len, cid);
            }
          } else if (c.point && (c.circle || c.entity)) {
            const p = ctx.getPointXY(c.point, xVec);
            const cir = ctx.getRadius(c.circle || c.entity, xVec);
            if (p && cir && cir.center) {
              push(Math.hypot(p.x - cir.center.x, p.y - cir.center.y) - cir.r, cid);
            }
          }
          break;
        }
        case "horizontal": {
          if (c.line) {
            const ln = ctx.getLineEnds(c.line, xVec);
            if (ln) push(ln.b.y - ln.a.y, cid);
          } else if (c.p1 && c.p2) {
            const a = ctx.getPointXY(c.p1, xVec);
            const b = ctx.getPointXY(c.p2, xVec);
            if (a && b) push(b.y - a.y, cid);
          }
          break;
        }
        case "vertical": {
          if (c.line) {
            const ln = ctx.getLineEnds(c.line, xVec);
            if (ln) push(ln.b.x - ln.a.x, cid);
          } else if (c.p1 && c.p2) {
            const a = ctx.getPointXY(c.p1, xVec);
            const b = ctx.getPointXY(c.p2, xVec);
            if (a && b) push(b.x - a.x, cid);
          }
          break;
        }
        case "parallel": {
          const l1 = ctx.getLineEnds(c.line1 || c.entity1, xVec);
          const l2 = ctx.getLineEnds(c.line2 || c.entity2, xVec);
          if (l1 && l2) {
            const dx1 = l1.b.x - l1.a.x,
              dy1 = l1.b.y - l1.a.y;
            const dx2 = l2.b.x - l2.a.x,
              dy2 = l2.b.y - l2.a.y;
            const len2 = Math.max(Math.hypot(dx2, dy2), 1e-6);
            push((dx1 * dy2 - dy1 * dx2) / len2, cid);
          }
          break;
        }
        case "perpendicular": {
          const l1 = ctx.getLineEnds(c.line1 || c.entity1, xVec);
          const l2 = ctx.getLineEnds(c.line2 || c.entity2, xVec);
          if (l1 && l2) {
            const dx1 = l1.b.x - l1.a.x,
              dy1 = l1.b.y - l1.a.y;
            const dx2 = l2.b.x - l2.a.x,
              dy2 = l2.b.y - l2.a.y;
            const len2 = Math.max(Math.hypot(dx2, dy2), 1e-6);
            push((dx1 * dx2 + dy1 * dy2) / len2, cid);
          }
          break;
        }
        case "equal": {
          const id1 = c.entity1 || c.line1 || c.circle1;
          const id2 = c.entity2 || c.line2 || c.circle2;
          const l1 = ctx.getLineEnds(id1, xVec);
          const l2 = ctx.getLineEnds(id2, xVec);
          if (l1 && l2) {
            const len1 = Math.hypot(l1.b.x - l1.a.x, l1.b.y - l1.a.y);
            const len2 = Math.hypot(l2.b.x - l2.a.x, l2.b.y - l2.a.y);
            push(len1 - len2, cid);
            break;
          }
          const r1 = ctx.getRadius(id1, xVec);
          const r2 = ctx.getRadius(id2, xVec);
          if (r1 && r2) push(r1.r - r2.r, cid);
          break;
        }
        case "tangent": {
          const lineId = c.line || c.entity1;
          const circId = c.circle || c.arc || c.entity2;
          const ln = ctx.getLineEnds(lineId, xVec);
          const cir = ctx.getRadius(circId, xVec);
          if (ln && cir && cir.center) {
            const dx = ln.b.x - ln.a.x;
            const dy = ln.b.y - ln.a.y;
            const len = Math.max(Math.hypot(dx, dy), 1e-6);
            // If line and arc share an endpoint, enforce exact radial perpendicularity (non-singular!)
            if (
              cir.ent.kind === "arc" &&
              (ln.ent.p1 === cir.ent.p1 ||
                ln.ent.p1 === cir.ent.p2 ||
                ln.ent.p2 === cir.ent.p1 ||
                ln.ent.p2 === cir.ent.p2)
            ) {
              const sharedId =
                ln.ent.p1 === cir.ent.p1 || ln.ent.p1 === cir.ent.p2 ? ln.ent.p1 : ln.ent.p2;
              const sp = ctx.getPointXY(sharedId, xVec);
              push(((sp.x - cir.center.x) * dx + (sp.y - cir.center.y) * dy) / len, cid);
            } else {
              const signedDist = ((cir.center.x - ln.a.x) * dy - (cir.center.y - ln.a.y) * dx) / len;
              push(Math.sqrt(signedDist * signedDist + 1e-12) - cir.r, cid);
            }
            break;
          }
          const c1 = ctx.getRadius(c.circle1 || c.entity1, xVec);
          const c2 = ctx.getRadius(c.circle2 || c.entity2, xVec);
          if (c1 && c2 && c1.center && c2.center) {
            const dist = Math.hypot(c2.center.x - c1.center.x, c2.center.y - c1.center.y);
            const target = c.internal ? Math.abs(c1.r - c2.r) : c1.r + c2.r;
            push(dist - target, cid);
          }
          break;
        }
        case "concentric": {
          const c1 = ctx.getRadius(c.entity1 || c.circle1, xVec);
          const c2 = ctx.getRadius(c.entity2 || c.circle2, xVec);
          if (c1?.center && c2?.center) {
            push(c1.center.x - c2.center.x, cid);
            push(c1.center.y - c2.center.y, cid);
          }
          break;
        }
        case "midpoint": {
          const p = ctx.getPointXY(c.point, xVec);
          const ln = ctx.getLineEnds(c.line, xVec);
          if (p && ln) {
            push(p.x - (ln.a.x + ln.b.x) * 0.5, cid);
            push(p.y - (ln.a.y + ln.b.y) * 0.5, cid);
          }
          break;
        }
        case "symmetric": {
          const a = ctx.getPointXY(c.p1, xVec);
          const b = ctx.getPointXY(c.p2, xVec);
          if (!a || !b) break;
          const axis = c.axis || "Y";
          if (axis === "Y") {
            push(a.x + b.x, cid);
            push(a.y - b.y, cid);
          } else if (axis === "X") {
            push(a.x - b.x, cid);
            push(a.y + b.y, cid);
          } else {
            const ln = ctx.getLineEnds(axis, xVec);
            if (ln) {
              const mx = (a.x + b.x) * 0.5,
                my = (a.y + b.y) * 0.5;
              const dx = ln.b.x - ln.a.x,
                dy = ln.b.y - ln.a.y;
              const len = Math.max(Math.hypot(dx, dy), 1e-6);
              push(((mx - ln.a.x) * dy - (my - ln.a.y) * dx) / len, cid);
              push(((b.x - a.x) * dx + (b.y - a.y) * dy) / len, cid);
            }
          }
          break;
        }
        case "distance": {
          const val = Number(c.value);
          if (!Number.isFinite(val) || val < 0) break;
          if (c.line || c.entity) {
            const ln = ctx.getLineEnds(c.line || c.entity, xVec);
            if (ln) {
              push(Math.hypot(ln.b.x - ln.a.x, ln.b.y - ln.a.y) - val, cid);
              break;
            }
          }
          if (c.p1 && c.p2) {
            const a = ctx.getPointXY(c.p1, xVec);
            const b = ctx.getPointXY(c.p2, xVec);
            if (a && b) push(Math.hypot(b.x - a.x, b.y - a.y) - val, cid);
          }
          break;
        }
        case "distanceX": {
          const val = Number(c.value);
          if (!Number.isFinite(val)) break;
          if (c.entity && ctx.varMap.has(`${c.entity}:w`)) {
            push(xVec[ctx.varMap.get(`${c.entity}:w`)] - Math.abs(val), cid);
          } else if (c.p1 && c.p2) {
            const a = ctx.getPointXY(c.p1, xVec);
            const b = ctx.getPointXY(c.p2, xVec);
            if (a && b) {
              if (c.signed) push(b.x - a.x - val, cid);
              else push(Math.sqrt((b.x - a.x) ** 2 + 1e-12) - Math.abs(val), cid);
            }
          }
          break;
        }
        case "distanceY": {
          const val = Number(c.value);
          if (!Number.isFinite(val)) break;
          if (c.entity && ctx.varMap.has(`${c.entity}:h`)) {
            push(xVec[ctx.varMap.get(`${c.entity}:h`)] - Math.abs(val), cid);
          } else if (c.p1 && c.p2) {
            const a = ctx.getPointXY(c.p1, xVec);
            const b = ctx.getPointXY(c.p2, xVec);
            if (a && b) {
              if (c.signed) push(b.y - a.y - val, cid);
              else push(Math.sqrt((b.y - a.y) ** 2 + 1e-12) - Math.abs(val), cid);
            }
          }
          break;
        }
        case "radius":
        case "diameter": {
          const raw = Number(c.value);
          if (!Number.isFinite(raw) || raw <= 0) break;
          const targetR = c.type === "diameter" ? raw * 0.5 : raw;
          const cir = ctx.getRadius(c.entity || c.circle || c.arc, xVec);
          if (cir) push(cir.r - targetR, cid);
          break;
        }
        case "angle": {
          const deg = Number(c.value);
          if (!Number.isFinite(deg)) break;
          const rad = (deg * Math.PI) / 180;
          const l1 = ctx.getLineEnds(c.line1 || c.line || c.entity1, xVec);
          if (!l1) break;
          const dx1 = l1.b.x - l1.a.x,
            dy1 = l1.b.y - l1.a.y;
          const scale = Math.max(Math.hypot(dx1, dy1), 5);
          const a1 = Math.atan2(dy1, dx1);
          if (c.line2 || c.entity2) {
            const l2 = ctx.getLineEnds(c.line2 || c.entity2, xVec);
            if (!l2) break;
            const a2 = Math.atan2(l2.b.y - l2.a.y, l2.b.x - l2.a.x);
            push(scale * wrapAngle(a2 - a1 - rad), cid);
          } else {
            push(scale * wrapAngle(a1 - rad), cid);
          }
          break;
        }
      }
    }

    return { residuals, owners };
  }

  function computeJacobian(ctx, constraints, xVec) {
    const n = xVec.length;
    const base = evaluateResiduals(ctx, constraints, xVec);
    const m = base.residuals.length;
    const J = Array.from({ length: m }, () => new Array(n).fill(0));
    const hStep = 1e-6;
    const xp = xVec.slice();
    const xm = xVec.slice();
    for (let j = 0; j < n; j++) {
      const orig = xVec[j];
      const h = Math.max(hStep, Math.abs(orig) * 1e-7);
      xp[j] = orig + h;
      xm[j] = orig - h;
      const rp = evaluateResiduals(ctx, constraints, xp).residuals;
      const rm = evaluateResiduals(ctx, constraints, xm).residuals;
      const inv2h = 1 / (2 * h);
      for (let i = 0; i < m; i++) {
        J[i][j] = (rp[i] - rm[i]) * inv2h;
      }
      xp[j] = orig;
      xm[j] = orig;
    }
    return { J, base };
  }

  /**
   * Solve a 2D parametric sketch in-place or on a clone, returning solved sketch + diagnostics.
   */
  function solveSketch(inputSketch, options = {}) {
    const sketch = options.inPlace ? inputSketch : cloneSketch(inputSketch);
    if (!Array.isArray(sketch.entities)) sketch.entities = [];
    if (!Array.isArray(sketch.constraints)) sketch.constraints = [];
    // Memorize initial fixed targets for points marked fixed
    for (const ent of sketch.entities) {
      if (ent.kind === "point" && ent.fixed === true) {
        if (ent.fixedX === undefined) ent.fixedX = ent.x;
        if (ent.fixedY === undefined) ent.fixedY = ent.y;
      }
    }

    const ctx = indexSketchVariables(sketch);
    const constraints = sketch.constraints;
    const n = ctx.vars.length;
    const xVec = ctx.vars.map((v) => v.initial);

    let evalState = evaluateResiduals(ctx, constraints, xVec);
    const m = evalState.residuals.length;
    const normInf = (arr) => arr.reduce((mx, v) => Math.max(mx, Math.abs(v)), 0);
    const cost = (arr) => arr.reduce((s, v) => s + 0.5 * v * v, 0);

    let maxErr = normInf(evalState.residuals);
    let currentCost = cost(evalState.residuals);
    let lambda = 1e-4;
    let iterations = 0;

    if (m > 0 && n > 0 && maxErr > EPS) {
      for (let iter = 0; iter < MAX_ITERS; iter++) {
        iterations = iter + 1;
        const { J } = computeJacobian(ctx, constraints, xVec);
        // Build normal equations (J^T J + lambda * I) delta = -J^T r
        const JTJ = Array.from({ length: n }, () => new Array(n).fill(0));
        const negJTr = new Array(n).fill(0);
        for (let i = 0; i < m; i++) {
          const ri = evalState.residuals[i];
          const row = J[i];
          for (let a = 0; a < n; a++) {
            const ja = row[a];
            if (ja === 0) continue;
            negJTr[a] -= ja * ri;
            for (let b = a; b < n; b++) {
              JTJ[a][b] += ja * row[b];
            }
          }
        }
        for (let a = 0; a < n; a++) {
          for (let b = 0; b < a; b++) JTJ[a][b] = JTJ[b][a];
          JTJ[a][a] += lambda * (1 + JTJ[a][a] * 0.01);
        }

        const delta = solveLinearSystem(JTJ, negJTr);
        const stepNorm = normInf(delta);
        if (stepNorm < 1e-11) break;

        // Clamp large jumps per iteration for robustness on nonlinear angle/tangent constraints
        const maxJump = 80;
        const scaleJump = stepNorm > maxJump ? maxJump / stepNorm : 1;
        const candidate = xVec.map((v, idx) => {
          const meta = ctx.vars[idx];
          return Math.min(meta.max, Math.max(meta.min, v + delta[idx] * scaleJump));
        });

        const nextEval = evaluateResiduals(ctx, constraints, candidate);
        const nextCost = cost(nextEval.residuals);
        if (nextCost < currentCost || normInf(nextEval.residuals) < maxErr) {
          for (let j = 0; j < n; j++) xVec[j] = candidate[j];
          evalState = nextEval;
          currentCost = nextCost;
          maxErr = normInf(evalState.residuals);
          lambda = Math.max(1e-9, lambda * 0.35);
          if (maxErr <= SOLVE_TOL) break;
        } else {
          lambda = Math.min(1e6, lambda * 6);
        }
      }
    }

    // Write solved values back into entities
    for (let j = 0; j < n; j++) {
      const meta = ctx.vars[j];
      meta.ent[meta.prop] = Number(xVec[j].toFixed(9));
    }
    // Sync circle/rect/slot/polygon x,y if bound to a center point
    for (const ent of ctx.entities) {
      if (ent.center && ctx.byId.has(ent.center)) {
        const cp = ctx.byId.get(ent.center);
        ent.x = cp.x;
        ent.y = cp.y;
      }
    }

    const finalJac = computeJacobian(ctx, constraints, xVec);
    const rank = computeJacobianRank(finalJac.J, m, n);
    const dof = Math.max(0, n - rank);
    const redundant = Math.max(0, m - rank);
    const converged = maxErr <= 1e-3;

    const conflictingIds = [];
    evalState.residuals.forEach((r, idx) => {
      if (Math.abs(r) > 1e-3 && !conflictingIds.includes(evalState.owners[idx])) {
        conflictingIds.push(evalState.owners[idx]);
      }
    });

    const status = !converged
      ? "over_constrained"
      : redundant > 0 && dof === 0
      ? "redundant"
      : dof === 0
      ? "fully_constrained"
      : "under_constrained";

    return {
      sketch,
      converged,
      status,
      dof,
      variables: n,
      equations: m,
      rank,
      redundant,
      maxError: Number(maxErr.toExponential(4)),
      iterations,
      conflictingIds,
    };
  }

  /**
   * Sample a 2D closed loop into polygon points for containment & winding tests.
   */
  function signedPolygonArea(pts) {
    let area = 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      area += a[0] * b[1] - b[0] * a[1];
    }
    return area * 0.5;
  }

  function pointInPolygon(pt, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0],
        yi = polygon[i][1];
      const xj = polygon[j][0],
        yj = polygon[j][1];
      if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    return inside;
  }

  /**
   * Extract closed 2D profiles (outer contours + nested holes) from a solved sketch.
   * Note: Sketch screen Y is downward in existing 2D canvas (`cadY = -ent.y`), or CAD XY (`invertY` option).
   * By default `invertY = true` matches 3DCad's 2D sketcher convention (`X_cad = x, Y_cad = -y`).
   */
  function extractProfiles(sketch, { invertY = true } = {}) {
    const entities = sketch?.entities || [];
    const byId = new Map(entities.map((e, i) => [e.id || `ent_${i + 1}`, e]));
    const sy = invertY ? -1 : 1;
    const toCad = (x, y) => [Number(x) || 0, (Number(y) || 0) * sy];

    const rawLoops = [];

    // 1. Standalone closed primitive entities (rect, circle, slot, polygon)
    for (const ent of entities) {
      if (ent.construction) continue;
      if (ent.kind === "circle") {
        const cp = ent.center && byId.get(ent.center) ? byId.get(ent.center) : ent;
        const [cx, cy] = toCad(cp.x, cp.y);
        const r = Math.max(0.1, Number(ent.r) || 5);
        const samples = Array.from({ length: 48 }, (_, i) => {
          const a = (i * Math.PI * 2) / 48;
          return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
        });
        rawLoops.push({
          kind: "circle",
          cx,
          cy,
          r,
          explicitHole: ent.isHole === true,
          samples,
          segments: [{ type: "circle", cx, cy, r }],
        });
      } else if (ent.kind === "rect") {
        const cp = ent.center && byId.get(ent.center) ? byId.get(ent.center) : ent;
        const [cx, cy] = toCad(cp.x, cp.y);
        const hw = Math.max(0.5, (Number(ent.w) || 20) * 0.5);
        const hh = Math.max(0.5, (Number(ent.h) || 20) * 0.5);
        const corners = [
          [cx - hw, cy - hh],
          [cx + hw, cy - hh],
          [cx + hw, cy + hh],
          [cx - hw, cy + hh],
        ];
        rawLoops.push({
          kind: "wire",
          explicitHole: ent.isHole === true,
          samples: corners,
          segments: corners.map((p, idx) => ({
            type: "line",
            from: p,
            to: corners[(idx + 1) % 4],
          })),
        });
      } else if (ent.kind === "slot") {
        const cp = ent.center && byId.get(ent.center) ? byId.get(ent.center) : ent;
        const [cx, cy] = toCad(cp.x, cp.y);
        const len = Math.max(2, Number(ent.w) || 30);
        const rad = Math.max(1, (Number(ent.h) || 12) * 0.5);
        const half = Math.max(0.01, len * 0.5 - rad);
        const samples = [];
        for (let i = 0; i <= 16; i++) {
          const a = -Math.PI / 2 + (i * Math.PI) / 16;
          samples.push([cx + half + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
        }
        for (let i = 0; i <= 16; i++) {
          const a = Math.PI / 2 + (i * Math.PI) / 16;
          samples.push([cx - half + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
        }
        rawLoops.push({
          kind: "slot",
          cx,
          cy,
          w: len,
          h: rad * 2,
          explicitHole: ent.isHole === true,
          samples,
          segments: [
            { type: "line", from: [cx - half, cy - rad], to: [cx + half, cy - rad] },
            {
              type: "arc",
              from: [cx + half, cy - rad],
              mid: [cx + half + rad, cy],
              to: [cx + half, cy + rad],
              center: [cx + half, cy],
              r: rad,
            },
            { type: "line", from: [cx + half, cy + rad], to: [cx - half, cy + rad] },
            {
              type: "arc",
              from: [cx - half, cy + rad],
              mid: [cx - half - rad, cy],
              to: [cx - half, cy - rad],
              center: [cx - half, cy],
              r: rad,
            },
          ],
        });
      } else if (ent.kind === "polygon") {
        const cp = ent.center && byId.get(ent.center) ? byId.get(ent.center) : ent;
        const [cx, cy] = toCad(cp.x, cp.y);
        const r = Math.max(1, Number(ent.r) || 12);
        const sides = Math.max(3, Math.round(Number(ent.sides) || 6));
        const corners = Array.from({ length: sides }, (_, i) => {
          const a = (i * Math.PI * 2) / sides;
          return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
        });
        rawLoops.push({
          kind: "wire",
          explicitHole: ent.isHole === true,
          samples: corners,
          segments: corners.map((p, idx) => ({
            type: "line",
            from: p,
            to: corners[(idx + 1) % sides],
          })),
        });
      }
    }

    // 2. Connected closed wire loops formed by line & arc segments
    // Merge coincident points within 1e-4 mm into canonical topological nodes
    const nodeCoords = [];
    const pointToNode = new Map();
    const getNode = (ptId) => {
      if (pointToNode.has(ptId)) return pointToNode.get(ptId);
      const pt = byId.get(ptId);
      if (!pt) return -1;
      const [x, y] = toCad(pt.x, pt.y);
      let idx = nodeCoords.findIndex((c) => Math.hypot(c[0] - x, c[1] - y) < 1e-3);
      if (idx === -1) {
        idx = nodeCoords.length;
        nodeCoords.push([x, y]);
      }
      pointToNode.set(ptId, idx);
      return idx;
    };

    const edges = [];
    for (const ent of entities) {
      if (ent.construction) continue;
      if (ent.kind === "line") {
        const u = getNode(ent.p1);
        const v = getNode(ent.p2);
        if (u !== -1 && v !== -1 && u !== v) {
          edges.push({ id: ent.id, kind: "line", u, v, ent });
        }
      } else if (ent.kind === "arc") {
        const u = getNode(ent.p1);
        const v = getNode(ent.p2);
        const cPt = byId.get(ent.center);
        if (u !== -1 && v !== -1 && u !== v && cPt) {
          edges.push({ id: ent.id, kind: "arc", u, v, center: toCad(cPt.x, cPt.y), ent });
        }
      }
    }

    const usedEdges = new Set();
    const adj = new Map();
    edges.forEach((e, idx) => {
      if (!adj.has(e.u)) adj.set(e.u, []);
      if (!adj.has(e.v)) adj.set(e.v, []);
      adj.get(e.u).push({ edgeIdx: idx, to: e.v, forward: true });
      adj.get(e.v).push({ edgeIdx: idx, to: e.u, forward: false });
    });

    for (let startIdx = 0; startIdx < edges.length; startIdx++) {
      if (usedEdges.has(startIdx)) continue;
      // Find cycle starting with edges[startIdx] from u -> v using DFS
      const startEdge = edges[startIdx];
      const visitedNodes = new Map([[startEdge.u, 0]]);
      const path = [{ edgeIdx: startIdx, from: startEdge.u, to: startEdge.v, forward: true }];
      usedEdges.add(startIdx);

      let curr = startEdge.v;
      let guard = 0;
      while (curr !== startEdge.u && guard++ < 500) {
        const candidates = (adj.get(curr) || []).filter((step) => !usedEdges.has(step.edgeIdx));
        if (!candidates.length) break;
        const chosen =
          candidates.find((c) => c.to === startEdge.u && path.length >= 2) || candidates[0];
        usedEdges.add(chosen.edgeIdx);
        path.push({
          edgeIdx: chosen.edgeIdx,
          from: curr,
          to: chosen.to,
          forward: chosen.forward,
        });
        curr = chosen.to;
        if (visitedNodes.has(curr) && curr !== startEdge.u) break;
        visitedNodes.set(curr, path.length);
      }

      if (curr === startEdge.u && path.length >= 2) {
        const samples = [];
        const segments = [];
        for (const step of path) {
          const edge = edges[step.edgeIdx];
          const pFrom = nodeCoords[step.from];
          const pTo = nodeCoords[step.to];
          if (edge.kind === "line") {
            samples.push(pFrom);
            segments.push({ type: "line", from: pFrom, to: pTo });
          } else {
            const [cx, cy] = edge.center;
            const r = Math.hypot(pFrom[0] - cx, pFrom[1] - cy);
            const aStart = Math.atan2(pFrom[1] - cy, pFrom[0] - cx);
            const aEnd = Math.atan2(pTo[1] - cy, pTo[0] - cx);
            // Determine sweep direction in CAD coords (note invertY flips CCW <-> CW)
            const sketchCcw = edge.ent.ccw !== false;
            const cadCcw = invertY ? !sketchCcw : sketchCcw;
            const dir = step.forward ? cadCcw : !cadCcw;
            let sweep = aEnd - aStart;
            if (dir && sweep <= 1e-7) sweep += Math.PI * 2;
            if (!dir && sweep >= -1e-7) sweep -= Math.PI * 2;
            const aMid = aStart + sweep * 0.5;
            const mid = [cx + Math.cos(aMid) * r, cy + Math.sin(aMid) * r];
            const steps = 16;
            for (let k = 0; k < steps; k++) {
              const ak = aStart + (sweep * k) / steps;
              samples.push([cx + Math.cos(ak) * r, cy + Math.sin(ak) * r]);
            }
            segments.push({ type: "arc", from: pFrom, mid, to: pTo, center: [cx, cy], r });
          }
        }
        if (Math.abs(signedPolygonArea(samples)) > 1e-3) {
          rawLoops.push({
            kind: "wire",
            explicitHole: path.every((s) => edges[s.edgeIdx].ent.isHole === true),
            samples,
            segments,
          });
        }
      }
    }

    // 3. Classify outer contours and inner holes (by explicitHole OR odd nesting depth)
    const areas = rawLoops.map((l) => Math.abs(signedPolygonArea(l.samples)));
    const parents = rawLoops.map((loop, idx) => {
      const containerIndices = [];
      for (let j = 0; j < rawLoops.length; j++) {
        if (idx === j || areas[j] <= areas[idx] + 1e-4) continue;
        if (loop.samples.every((pt) => pointInPolygon(pt, rawLoops[j].samples))) {
          containerIndices.push(j);
        }
      }
      // Smallest enclosing loop is the immediate parent
      containerIndices.sort((a, b) => areas[a] - areas[b]);
      return { depth: containerIndices.length, parentIdx: containerIndices[0] ?? -1 };
    });

    const outers = new Map();
    rawLoops.forEach((loop, idx) => {
      const isHole = loop.explicitHole || parents[idx].depth % 2 === 1;
      if (!isHole) {
        outers.set(idx, { outer: loop, holes: [] });
      }
    });

    rawLoops.forEach((loop, idx) => {
      const isHole = loop.explicitHole || parents[idx].depth % 2 === 1;
      if (isHole) {
        let p = parents[idx].parentIdx;
        while (p !== -1 && !outers.has(p)) p = parents[p].parentIdx;
        if (p !== -1 && outers.has(p)) {
          outers.get(p).holes.push(loop);
        }
      }
    });

    return [...outers.values()];
  }

  const api = {
    CONSTRAINT_TYPES,
    cloneSketch,
    createConstrainedRect,
    solveSketch,
    extractProfiles,
    signedPolygonArea,
    pointInPolygon,
  };

  root.CadSketchSolver = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : globalThis);
