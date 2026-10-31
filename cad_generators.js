/**
 * 3DCad Studio — Parametric Solid Geometry Engine, Exporters (STL/3MF/STEP/OBJ),
 * 3D Print Slicer Physics & Natural Language / MCP Copilot.
 * 100% Client-Side • 4u-Labs Ecosystem
 */
(function (root) {
  "use strict";

  const PARAM_SCHEMA = {
    BOX: [
      { key: "width", pt: "Largura X (mm)", en: "Width X (mm)", min: 1, max: 500, step: 1 },
      { key: "depth", pt: "Profundidade Y (mm)", en: "Depth Y (mm)", min: 1, max: 500, step: 1 },
      { key: "height", pt: "Altura Z (mm)", en: "Height Z (mm)", min: 1, max: 500, step: 1 },
      { key: "cornerRadius", pt: "Raio dos Cantos (mm)", en: "Corner Fillet (mm)", min: 0, max: 100, step: 0.5 },
      { key: "boreDiameter", pt: "Furo Central Z (mm)", en: "Center Bore Z (mm)", min: 0, max: 200, step: 0.5 },
    ],
    CYLINDER: [
      { key: "diameter", pt: "Diâmetro Externo (mm)", en: "Outer Diameter (mm)", min: 1, max: 500, step: 0.5 },
      { key: "innerDiameter", pt: "Furo Interno / Tubo (mm)", en: "Inner Bore (mm)", min: 0, max: 490, step: 0.5 },
      { key: "height", pt: "Altura Z (mm)", en: "Height Z (mm)", min: 1, max: 500, step: 0.5 },
      { key: "segments", pt: "Resolução (lados)", en: "Segments (sides)", min: 6, max: 128, step: 2 },
    ],
    SPHERE: [
      { key: "diameter", pt: "Diâmetro (mm)", en: "Diameter (mm)", min: 2, max: 500, step: 1 },
      { key: "segments", pt: "Resolução", en: "Segments", min: 12, max: 96, step: 4 },
    ],
    CONE: [
      { key: "bottomDiameter", pt: "Diâmetro Base (mm)", en: "Base Diameter (mm)", min: 1, max: 500, step: 1 },
      { key: "topDiameter", pt: "Diâmetro Topo (mm)", en: "Top Diameter (mm)", min: 0, max: 500, step: 1 },
      { key: "height", pt: "Altura Z (mm)", en: "Height Z (mm)", min: 1, max: 500, step: 1 },
    ],
    TORUS: [
      { key: "majorDiameter", pt: "Diâmetro Médio (mm)", en: "Ring Diameter (mm)", min: 4, max: 500, step: 1 },
      { key: "tubeDiameter", pt: "Espessura do Anel (mm)", en: "Tube Thickness (mm)", min: 1, max: 150, step: 0.5 },
    ],
    SPUR_GEAR: [
      { key: "module", pt: "Módulo (m · mm)", en: "Module (m · mm)", min: 0.5, max: 10, step: 0.25 },
      { key: "teeth", pt: "Nº de Dentes (Z)", en: "Teeth Count (Z)", min: 6, max: 120, step: 1 },
      { key: "thickness", pt: "Espessura Z (mm)", en: "Face Width Z (mm)", min: 1, max: 100, step: 0.5 },
      { key: "boreDiameter", pt: "Furo do Eixo (mm)", en: "Shaft Bore (mm)", min: 0, max: 100, step: 0.5 },
      { key: "pressureAngle", pt: "Ângulo de Pressão (°)", en: "Pressure Angle (°)", min: 14.5, max: 25, step: 0.5 },
    ],
    L_BRACKET: [
      { key: "armA", pt: "Aba Base X (mm)", en: "Base Arm X (mm)", min: 10, max: 300, step: 1 },
      { key: "armB", pt: "Aba Vertical Z (mm)", en: "Vertical Arm Z (mm)", min: 10, max: 300, step: 1 },
      { key: "width", pt: "Largura Y (mm)", en: "Width Y (mm)", min: 8, max: 200, step: 1 },
      { key: "thickness", pt: "Espessura (mm)", en: "Wall Thickness (mm)", min: 2, max: 30, step: 0.5 },
      { key: "holeDiameter", pt: "Diâmetro dos Furos (mm)", en: "Hole Diameter (mm)", min: 0, max: 30, step: 0.5 },
      { key: "gusset", pt: "Nervura de Reforço (0/1)", en: "Gusset Rib (0/1)", min: 0, max: 1, step: 1 },
    ],
    ENCLOSURE: [
      { key: "width", pt: "Largura Externa X (mm)", en: "Outer Width X (mm)", min: 20, max: 400, step: 1 },
      { key: "depth", pt: "Profundidade Y (mm)", en: "Outer Depth Y (mm)", min: 20, max: 400, step: 1 },
      { key: "height", pt: "Altura Z (mm)", en: "Outer Height Z (mm)", min: 10, max: 300, step: 1 },
      { key: "wallThickness", pt: "Espessura da Parede (mm)", en: "Wall Thickness (mm)", min: 1.2, max: 15, step: 0.2 },
      { key: "standoffHeight", pt: "Torre PCB Interna (mm)", en: "PCB Standoff Height (mm)", min: 0, max: 40, step: 1 },
      { key: "screwHole", pt: "Furo Parafuso PCB (mm)", en: "PCB Screw Bore (mm)", min: 0, max: 8, step: 0.5 },
    ],
    MOUNTING_PLATE: [
      { key: "width", pt: "Largura X (mm)", en: "Width X (mm)", min: 15, max: 400, step: 1 },
      { key: "depth", pt: "Profundidade Y (mm)", en: "Depth Y (mm)", min: 15, max: 400, step: 1 },
      { key: "thickness", pt: "Espessura Z (mm)", en: "Thickness Z (mm)", min: 1, max: 50, step: 0.5 },
      { key: "cornerRadius", pt: "Raio dos Cantos (mm)", en: "Corner Radius (mm)", min: 0, max: 50, step: 0.5 },
      { key: "holeDiameter", pt: "Furos nos 4 Cantos (mm)", en: "4-Corner Holes (mm)", min: 0, max: 30, step: 0.2 },
      { key: "centerBore", pt: "Furo Central (mm)", en: "Center Bore (mm)", min: 0, max: 200, step: 0.5 },
    ],
    HEX_BOLT: [
      { key: "metricDia", pt: "Bitola Métrica M (mm)", en: "Metric Thread M (mm)", min: 3, max: 20, step: 1 },
      { key: "shaftLength", pt: "Comprimento da Rosca (mm)", en: "Thread Length (mm)", min: 0, max: 150, step: 1 },
      { key: "headWidth", pt: "Chave Sextavada (mm)", en: "Hex Flats Width (mm)", min: 5, max: 36, step: 0.5 },
      { key: "headHeight", pt: "Altura da Cabeça (mm)", en: "Head Height (mm)", min: 2, max: 20, step: 0.5 },
      { key: "nutBore", pt: "Furo Interno (Porca=1, Parafuso=0)", en: "Is Nut (1=Nut, 0=Bolt)", min: 0, max: 1, step: 1 },
    ],
    PULLEY: [
      { key: "outerDiameter", pt: "Diâmetro das Abas (mm)", en: "Flange Diameter (mm)", min: 10, max: 250, step: 1 },
      { key: "grooveDiameter", pt: "Diâmetro da Pista (mm)", en: "Track Diameter (mm)", min: 6, max: 220, step: 1 },
      { key: "boreDiameter", pt: "Furo do Eixo (mm)", en: "Shaft Bore (mm)", min: 2, max: 80, step: 0.5 },
      { key: "height", pt: "Altura Total Z (mm)", en: "Total Height Z (mm)", min: 4, max: 100, step: 0.5 },
    ],
    SKETCH_EXTRUDE: [
      { key: "height", pt: "Altura de Extrusão Z (mm)", en: "Extrusion Height Z (mm)", min: 1, max: 400, step: 0.5 },
      { key: "bevel", pt: "Chanfro / Bevel (mm)", en: "Bevel Size (mm)", min: 0, max: 10, step: 0.2 },
    ],
  };

  function num(val, fallback) {
    if (val === undefined || val === null || val === "") return fallback;
    const n = Number(val);
    return Number.isFinite(n) ? n : fallback;
  }

  function createRoundedRectShape(w, d, r) {
    const shape = new THREE.Shape();
    const hw = w / 2;
    const hd = d / 2;
    const cr = Math.min(Math.max(0, r || 0), hw - 0.05, hd - 0.05);
    if (cr <= 0.01) {
      shape.moveTo(-hw, -hd);
      shape.lineTo(hw, -hd);
      shape.lineTo(hw, hd);
      shape.lineTo(-hw, hd);
      shape.closePath();
      return shape;
    }
    shape.moveTo(-hw + cr, -hd);
    shape.lineTo(hw - cr, -hd);
    shape.absarc(hw - cr, -hd + cr, cr, -Math.PI / 2, 0, false);
    shape.lineTo(hw, hd - cr);
    shape.absarc(hw - cr, hd - cr, cr, 0, Math.PI / 2, false);
    shape.lineTo(-hw + cr, hd);
    shape.absarc(-hw + cr, hd - cr, cr, Math.PI / 2, Math.PI, false);
    shape.lineTo(-hw, -hd + cr);
    shape.absarc(-hw + cr, -hd + cr, cr, Math.PI, Math.PI * 1.5, false);
    shape.closePath();
    return shape;
  }

  function makeCirclePath(cx, cy, radius, segs = 36) {
    const path = new THREE.Path();
    path.absarc(cx, cy, radius, 0, Math.PI * 2, true);
    return path;
  }

  /**
   * Extrude a 2D shape lying on X/Z ground plane upwards along +Y (which represents CAD +Z height)
   */
  function extrudeShapeAlongHeight(shape, height, bevel = 0, curveSegments = 36) {
    const bSize = Math.min(Math.max(0, Number(bevel) || 0), height * 0.25);
    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: Math.max(0.5, height - bSize * 2),
      bevelEnabled: bSize > 0.05,
      bevelThickness: bSize,
      bevelSize: bSize,
      bevelSegments: 2,
      curveSegments,
    });
    // Rotate so XY shape lies on XZ ground plane and extrudes upward (+Y in Three.js)
    geom.rotateX(-Math.PI / 2);
    geom.computeBoundingBox();
    const minY = geom.boundingBox.min.y;
    const cx = (geom.boundingBox.min.x + geom.boundingBox.max.x) / 2;
    const cz = (geom.boundingBox.min.z + geom.boundingBox.max.z) / 2;
    geom.translate(-cx, -minY, -cz);
    // Re-center vertically around height/2 so position.y = height/2 sits at Z=0 bed
    geom.computeBoundingBox();
    const h = geom.boundingBox.max.y - geom.boundingBox.min.y;
    geom.translate(0, -h / 2, 0);
    geom.computeVertexNormals();
    return geom;
  }

  /**
   * Builds a THREE.BufferGeometry from parametric feature type & params
   */
  function buildParametricGeometry(type, params = {}) {
    switch (type) {
      case "BOX": {
        const w = Math.max(1, Number(params.width) || 40);
        const d = Math.max(1, Number(params.depth) || 30);
        const h = Math.max(1, Number(params.height) || 20);
        const cr = Math.max(0, Number(params.cornerRadius) || 0);
        const bore = Math.max(0, Number(params.boreDiameter) || 0);
        if (cr > 0.05 || bore > 0.2) {
          const shape = createRoundedRectShape(w, d, cr);
          if (bore > 0.2 && bore < Math.min(w, d) - 1) {
            shape.holes.push(makeCirclePath(0, 0, bore / 2, 40));
          }
          return extrudeShapeAlongHeight(shape, h, 0, 32);
        }
        return new THREE.BoxGeometry(w, h, d);
      }

      case "CYLINDER": {
        const dia = Math.max(1, Number(params.diameter) || 30);
        const inner = Math.max(0, Number(params.innerDiameter) || 0);
        const h = Math.max(1, Number(params.height) || 25);
        const segs = Math.max(6, Math.min(128, Math.round(Number(params.segments) || 48)));
        const rOut = dia / 2;
        if (inner > 0.2 && inner < dia - 0.5) {
          const shape = new THREE.Shape();
          shape.absarc(0, 0, rOut, 0, Math.PI * 2, false);
          shape.holes.push(makeCirclePath(0, 0, inner / 2, segs));
          return extrudeShapeAlongHeight(shape, h, 0, segs);
        }
        return new THREE.CylinderGeometry(rOut, rOut, h, segs);
      }

      case "SPHERE": {
        const dia = Math.max(2, Number(params.diameter) || 30);
        const segs = Math.max(12, Math.min(96, Math.round(Number(params.segments) || 36)));
        return new THREE.SphereGeometry(dia / 2, segs, Math.round(segs * 0.75));
      }

      case "CONE": {
        const bDia = Math.max(0.5, num(params.bottomDiameter, 30));
        const tDia = Math.max(0, num(params.topDiameter, 0));
        const h = Math.max(1, num(params.height, 30));
        return new THREE.CylinderGeometry(tDia / 2, bDia / 2, h, 48);
      }

      case "TORUS": {
        const major = Math.max(4, Number(params.majorDiameter) || 36);
        const tube = Math.max(1, Math.min(major * 0.48, Number(params.tubeDiameter) || 6));
        const geom = new THREE.TorusGeometry(major / 2, tube / 2, 24, 56);
        geom.rotateX(Math.PI / 2);
        return geom;
      }

      case "SPUR_GEAR": {
        const mod = Math.max(0.5, Number(params.module) || 2);
        const Z = Math.max(6, Math.min(120, Math.round(Number(params.teeth) || 24)));
        const h = Math.max(1, Number(params.thickness) || 8);
        const bore = Math.max(0, Number(params.boreDiameter) || 6);
        const pa = ((Number(params.pressureAngle) || 20) * Math.PI) / 180;

        const pitchR = (mod * Z) / 2;
        const outerR = pitchR + mod;
        const rootR = Math.max(2, pitchR - 1.25 * mod);
        const shape = new THREE.Shape();
        const stepAngle = (Math.PI * 2) / Z;
        const toothHalfPitch = stepAngle / 4;
        const tipHalf = toothHalfPitch * (0.62 - 0.35 * Math.sin(pa));
        const rootHalf = toothHalfPitch * 1.15;

        for (let i = 0; i < Z; i++) {
          const a = i * stepAngle;
          const a1 = a - rootHalf;
          const a2 = a - tipHalf;
          const a3 = a + tipHalf;
          const a4 = a + rootHalf;
          const aNext = (i + 1) * stepAngle - rootHalf;

          const p1x = Math.cos(a1) * rootR,
            p1y = Math.sin(a1) * rootR;
          const pmx1 = Math.cos((a1 + a2) / 2) * pitchR,
            pmy1 = Math.sin((a1 + a2) / 2) * pitchR;
          const p2x = Math.cos(a2) * outerR,
            p2y = Math.sin(a2) * outerR;
          const p3x = Math.cos(a3) * outerR,
            p3y = Math.sin(a3) * outerR;
          const pmx2 = Math.cos((a3 + a4) / 2) * pitchR,
            pmy2 = Math.sin((a3 + a4) / 2) * pitchR;
          const p4x = Math.cos(a4) * rootR,
            p4y = Math.sin(a4) * rootR;

          if (i === 0) shape.moveTo(p1x, p1y);
          else shape.lineTo(p1x, p1y);
          shape.lineTo(pmx1, pmy1);
          shape.lineTo(p2x, p2y);
          shape.absarc(0, 0, outerR, a2, a3, false);
          shape.lineTo(pmx2, pmy2);
          shape.lineTo(p4x, p4y);
          shape.absarc(0, 0, rootR, a4, aNext, false);
        }
        shape.closePath();

        if (bore > 0.4 && bore < rootR * 1.75) {
          shape.holes.push(makeCirclePath(0, 0, bore / 2, 40));
        }
        return extrudeShapeAlongHeight(shape, h, 0, 24);
      }

      case "L_BRACKET": {
        const armA = Math.max(10, num(params.armA, 50));
        const armB = Math.max(10, num(params.armB, 40));
        const w = Math.max(8, num(params.width, 30));
        const t = Math.min(Math.min(armA, armB) * 0.45, Math.max(2, num(params.thickness, 5)));
        const holeDia = Math.max(0, num(params.holeDiameter, 4.2));
        const hasGusset = num(params.gusset, 1) === 1;

        // Build base L profile in XY (X = armA, Y = armB), extrude along Z (width), then orient
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(armA, 0);
        shape.lineTo(armA, t);
        shape.lineTo(t, t);
        shape.lineTo(t, armB);
        shape.lineTo(0, armB);
        shape.closePath();

        let geom = new THREE.ExtrudeGeometry(shape, {
          depth: w,
          bevelEnabled: false,
          curveSegments: 24,
        });
        // Center geometry
        geom.translate(-armA / 2, -armB / 2, -w / 2);

        if (typeof CSG !== "undefined" && (holeDia >= 1 || hasGusset)) {
          const mat = new THREE.MeshStandardMaterial();
          let baseMesh = new THREE.Mesh(geom, mat);
          baseMesh.updateMatrix();
          let csg = CSG.fromMesh(baseMesh);

          if (hasGusset) {
            const gShape = new THREE.Shape();
            const gSize = Math.min(armA - t, armB - t) * 0.65;
            gShape.moveTo(t - armA / 2, t - armB / 2);
            gShape.lineTo(t + gSize - armA / 2, t - armB / 2);
            gShape.lineTo(t - armA / 2, t + gSize - armB / 2);
            gShape.closePath();
            const gThick = Math.max(2.5, t * 0.85);
            const gGeom = new THREE.ExtrudeGeometry(gShape, { depth: gThick, bevelEnabled: false });
            gGeom.translate(0, 0, -gThick / 2);
            const gMesh = new THREE.Mesh(gGeom, mat);
            gMesh.updateMatrix();
            csg = csg.union(CSG.fromMesh(gMesh));
          }

          if (holeDia >= 1) {
            const r = holeDia / 2;
            const holeOffsetsZ = w >= 24 ? [-w * 0.25, w * 0.25] : [0];
            // Holes in horizontal arm (armA)
            const hx = armA / 2 - Math.max(t + r + 3, (armA - t) * 0.42);
            for (const hz of holeOffsetsZ) {
              const cyl = new THREE.Mesh(new THREE.CylinderGeometry(r, r, t * 4, 24), mat);
              cyl.position.set(hx, -armB / 2 + t / 2, hz);
              cyl.updateMatrix();
              csg = csg.subtract(CSG.fromMesh(cyl));
            }
            // Holes in vertical arm (armB)
            const hy = armB / 2 - Math.max(t + r + 3, (armB - t) * 0.42);
            for (const hz of holeOffsetsZ) {
              const cyl = new THREE.Mesh(new THREE.CylinderGeometry(r, r, t * 4, 24), mat);
              cyl.rotation.z = Math.PI / 2;
              cyl.position.set(-armA / 2 + t / 2, hy, hz);
              cyl.updateMatrix();
              csg = csg.subtract(CSG.fromMesh(cyl));
            }
          }
          const finalMesh = CSG.toMesh(csg, new THREE.Matrix4(), mat);
          geom = finalMesh.geometry;
        }
        geom.computeVertexNormals();
        return geom;
      }

      case "ENCLOSURE": {
        const w = Math.max(20, num(params.width, 80));
        const d = Math.max(20, num(params.depth, 55));
        const h = Math.max(10, num(params.height, 30));
        const wall = Math.min(Math.min(w, d) * 0.2, Math.max(1.2, num(params.wallThickness, 2.5)));
        const standoffH = Math.min(h - wall - 1, Math.max(0, num(params.standoffHeight, 6)));
        const screwBore = Math.max(0, num(params.screwHole, 2.8));

        if (typeof CSG !== "undefined") {
          const mat = new THREE.MeshStandardMaterial();
          const outer = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
          outer.updateMatrix();
          const innerH = h - wall;
          const inner = new THREE.Mesh(
            new THREE.BoxGeometry(w - wall * 2, innerH + 2, d - wall * 2),
            mat
          );
          inner.position.set(0, wall / 2 + 1, 0);
          inner.updateMatrix();

          let csg = CSG.fromMesh(outer).subtract(CSG.fromMesh(inner));

          if (standoffH > 0.5) {
            const postR = Math.max(screwBore / 2 + 1.6, 3.2);
            const ox = w / 2 - wall - postR - 1.5;
            const oz = d / 2 - wall - postR - 1.5;
            const py = -h / 2 + wall + standoffH / 2;
            const corners = [
              [-ox, -oz],
              [ox, -oz],
              [ox, oz],
              [-ox, oz],
            ];
            for (const [cx, cz] of corners) {
              const post = new THREE.Mesh(
                new THREE.CylinderGeometry(postR, postR, standoffH, 20),
                mat
              );
              post.position.set(cx, py, cz);
              post.updateMatrix();
              csg = csg.union(CSG.fromMesh(post));
              if (screwBore >= 1) {
                const hole = new THREE.Mesh(
                  new THREE.CylinderGeometry(screwBore / 2, screwBore / 2, standoffH + 1, 18),
                  mat
                );
                hole.position.set(cx, py + 0.5, cz);
                hole.updateMatrix();
                csg = csg.subtract(CSG.fromMesh(hole));
              }
            }
          }
          const finalMesh = CSG.toMesh(csg, new THREE.Matrix4(), mat);
          finalMesh.geometry.computeVertexNormals();
          return finalMesh.geometry;
        }
        return new THREE.BoxGeometry(w, h, d);
      }

      case "MOUNTING_PLATE": {
        const w = Math.max(15, num(params.width, 80));
        const d = Math.max(15, num(params.depth, 60));
        const t = Math.max(1, num(params.thickness, 5));
        const cr = Math.max(0, num(params.cornerRadius, 6));
        const holeDia = Math.max(0, num(params.holeDiameter, 4.2));
        const centerBore = Math.max(0, num(params.centerBore, 0));

        const shape = createRoundedRectShape(w, d, cr);
        if (holeDia >= 1) {
          const r = holeDia / 2;
          const inset = Math.max(r + 3, Math.min(w, d) * 0.14);
          const ox = w / 2 - inset;
          const oy = d / 2 - inset;
          if (ox > r && oy > r) {
            for (const [cx, cy] of [
              [-ox, -oy],
              [ox, -oy],
              [ox, oy],
              [-ox, oy],
            ]) {
              shape.holes.push(makeCirclePath(cx, cy, r, 28));
            }
          }
        }
        if (centerBore >= 1 && centerBore < Math.min(w, d) - 4) {
          shape.holes.push(makeCirclePath(0, 0, centerBore / 2, 40));
        }
        return extrudeShapeAlongHeight(shape, t, 0, 32);
      }

      case "HEX_BOLT": {
        const mDia = Math.max(2, num(params.metricDia, 6));
        const shaftLen = Math.max(0, num(params.shaftLength, 20));
        const headFlats = Math.max(mDia * 1.4, num(params.headWidth, Math.round(mDia * 1.65)));
        const headH = Math.max(2, num(params.headHeight, Math.round(mDia * 0.7)));
        const isNut = num(params.nutBore, 0) === 1 || shaftLen <= 0.5;

        const hexRadius = headFlats / Math.sqrt(3);
        const shape = new THREE.Shape();
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          const x = Math.cos(a) * hexRadius;
          const y = Math.sin(a) * hexRadius;
          if (i === 0) shape.moveTo(x, y);
          else shape.lineTo(x, y);
        }
        shape.closePath();

        if (isNut) {
          shape.holes.push(makeCirclePath(0, 0, (mDia * 0.85) / 2, 32));
          return extrudeShapeAlongHeight(shape, headH, 0.3, 24);
        }

        const headGeom = extrudeShapeAlongHeight(shape, headH, 0, 12);
        if (typeof CSG !== "undefined") {
          const mat = new THREE.MeshStandardMaterial();
          const totalH = headH + shaftLen;
          const headMesh = new THREE.Mesh(headGeom, mat);
          headMesh.position.set(0, -totalH / 2 + headH / 2, 0);
          headMesh.updateMatrix();

          const shaftMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(mDia / 2, mDia / 2, shaftLen, 32),
            mat
          );
          shaftMesh.position.set(0, -totalH / 2 + headH + shaftLen / 2, 0);
          shaftMesh.updateMatrix();

          let csg = CSG.fromMesh(headMesh).union(CSG.fromMesh(shaftMesh));
          const finalMesh = CSG.toMesh(csg, new THREE.Matrix4(), mat);
          finalMesh.geometry.computeVertexNormals();
          return finalMesh.geometry;
        }
        return headGeom;
      }

      case "PULLEY": {
        const od = Math.max(10, Number(params.outerDiameter) || 40);
        const gd = Math.min(od - 2, Math.max(6, Number(params.grooveDiameter) || 30));
        const bore = Math.min(gd - 2, Math.max(2, Number(params.boreDiameter) || 8));
        const h = Math.max(4, Number(params.height) || 14);
        const flangeH = Math.max(1.5, h * 0.2);

        if (typeof CSG !== "undefined") {
          const mat = new THREE.MeshStandardMaterial();
          const botFlange = new THREE.Mesh(
            new THREE.CylinderGeometry(od / 2, od / 2, flangeH, 40),
            mat
          );
          botFlange.position.set(0, -h / 2 + flangeH / 2, 0);
          botFlange.updateMatrix();

          const core = new THREE.Mesh(
            new THREE.CylinderGeometry(gd / 2, gd / 2, h, 40),
            mat
          );
          core.updateMatrix();

          const topFlange = new THREE.Mesh(
            new THREE.CylinderGeometry(od / 2, od / 2, flangeH, 40),
            mat
          );
          topFlange.position.set(0, h / 2 - flangeH / 2, 0);
          topFlange.updateMatrix();

          const hole = new THREE.Mesh(
            new THREE.CylinderGeometry(bore / 2, bore / 2, h + 4, 36),
            mat
          );
          hole.updateMatrix();

          const csg = CSG.fromMesh(core)
            .union(CSG.fromMesh(botFlange))
            .union(CSG.fromMesh(topFlange))
            .subtract(CSG.fromMesh(hole));
          const res = CSG.toMesh(csg, new THREE.Matrix4(), mat);
          res.geometry.computeVertexNormals();
          return res.geometry;
        }
        return new THREE.CylinderGeometry(od / 2, od / 2, h, 40);
      }

      case "SKETCH_EXTRUDE": {
        const h = Math.max(1, Number(params.height) || 15);
        const bevel = Math.max(0, Number(params.bevel) || 0);
        const entities = Array.isArray(params.entities) ? params.entities : [];
        if (entities.length === 0) {
          return new THREE.BoxGeometry(30, h, 30);
        }
        const solids = entities.filter((e) => !e.isHole);
        const holes = entities.filter((e) => e.isHole);
        if (solids.length === 0) {
          return new THREE.BoxGeometry(30, h, 30);
        }

        const buildShapeFromEnt = (ent) => {
          const sh = new THREE.Shape();
          if (ent.kind === "circle") {
            sh.absarc(ent.x || 0, -(ent.y || 0), Math.max(1, ent.r || 10), 0, Math.PI * 2, false);
          } else if (ent.kind === "slot") {
            const len = Math.max(4, ent.w || 30);
            const rad = Math.max(2, (ent.h || 12) / 2);
            const half = Math.max(1, len / 2 - rad);
            const cx = ent.x || 0;
            const cy = -(ent.y || 0);
            sh.moveTo(cx - half, cy - rad);
            sh.lineTo(cx + half, cy - rad);
            sh.absarc(cx + half, cy, rad, -Math.PI / 2, Math.PI / 2, false);
            sh.lineTo(cx - half, cy + rad);
            sh.absarc(cx - half, cy, rad, Math.PI / 2, Math.PI * 1.5, false);
            sh.closePath();
          } else if (ent.kind === "polygon") {
            const sides = Math.max(3, ent.sides || 6);
            const r = Math.max(2, ent.r || 15);
            const cx = ent.x || 0;
            const cy = -(ent.y || 0);
            for (let i = 0; i < sides; i++) {
              const a = (i * Math.PI * 2) / sides;
              const px = cx + Math.cos(a) * r;
              const py = cy + Math.sin(a) * r;
              if (i === 0) sh.moveTo(px, py);
              else sh.lineTo(px, py);
            }
            sh.closePath();
          } else {
            // rect
            const rw = Math.max(1, ent.w || 30);
            const rh = Math.max(1, ent.h || 20);
            const cx = ent.x || 0;
            const cy = -(ent.y || 0);
            sh.moveTo(cx - rw / 2, cy - rh / 2);
            sh.lineTo(cx + rw / 2, cy - rh / 2);
            sh.lineTo(cx + rw / 2, cy + rh / 2);
            sh.lineTo(cx - rw / 2, cy + rh / 2);
            sh.closePath();
          }
          return sh;
        };

        const shapes = solids.map((ent) => {
          const sh = buildShapeFromEnt(ent);
          for (const hole of holes) {
            if (hole.kind === "circle") {
              sh.holes.push(makeCirclePath(hole.x || 0, -(hole.y || 0), Math.max(0.5, hole.r || 3), 32));
            }
          }
          return sh;
        });

        const geom = new THREE.ExtrudeGeometry(shapes, {
          depth: h,
          bevelEnabled: bevel > 0.05,
          bevelThickness: bevel,
          bevelSize: bevel,
          bevelSegments: 2,
          curveSegments: 32,
        });
        geom.rotateX(-Math.PI / 2);
        geom.computeBoundingBox();
        const minY = geom.boundingBox.min.y;
        const maxY = geom.boundingBox.max.y;
        geom.translate(0, -(minY + maxY) / 2, 0);
        geom.computeVertexNormals();
        return geom;
      }

      default:
        return new THREE.BoxGeometry(20, 20, 20);
    }
  }

  /**
   * Exact 3D Print Mesh Physics: Signed Tetrahedron Volume, Surface Area, Filament Weight/Length/Time/Cost
   */
  const FILAMENT_MATERIALS = {
    PLA: { density: 1.24, name: "PLA (1.24 g/cm³)", speedMm3s: 11 },
    PETG: { density: 1.27, name: "PETG (1.27 g/cm³)", speedMm3s: 9 },
    ABS: { density: 1.04, name: "ABS / ASA (1.04 g/cm³)", speedMm3s: 10 },
    TPU: { density: 1.21, name: "TPU Flexível (1.21 g/cm³)", speedMm3s: 5.5 },
    RESIN: { density: 1.15, name: "Resina SLA/DLP (1.15 g/cm³)", speedMm3s: 14 },
  };

  function analyzeMeshFor3DPrint(meshes, printSettings = {}) {
    const list = Array.isArray(meshes) ? meshes : meshes ? [meshes] : [];
    let totalVolMm3 = 0;
    let totalAreaMm2 = 0;
    let totalTriangles = 0;
    const overallBox = new THREE.Box3();

    const pA = new THREE.Vector3();
    const pB = new THREE.Vector3();
    const pC = new THREE.Vector3();
    const cb = new THREE.Vector3();
    const ab = new THREE.Vector3();

    for (const mesh of list) {
      if (!mesh || !mesh.geometry || mesh.visible === false) continue;
      mesh.updateWorldMatrix(true, false);
      const mat4 = mesh.matrixWorld;
      const geom = mesh.geometry;
      const pos = geom.attributes.position;
      if (!pos) continue;

      const meshBox = new THREE.Box3().setFromObject(mesh);
      overallBox.union(meshBox);

      const index = geom.index;
      const triCount = index ? index.count / 3 : pos.count / 3;
      totalTriangles += triCount;

      let signedVol = 0;
      for (let i = 0; i < triCount; i++) {
        const i0 = index ? index.getX(i * 3) : i * 3;
        const i1 = index ? index.getX(i * 3 + 1) : i * 3 + 1;
        const i2 = index ? index.getX(i * 3 + 2) : i * 3 + 2;

        pA.fromBufferAttribute(pos, i0).applyMatrix4(mat4);
        pB.fromBufferAttribute(pos, i1).applyMatrix4(mat4);
        pC.fromBufferAttribute(pos, i2).applyMatrix4(mat4);

        // Signed volume of tetrahedron (0, pA, pB, pC)
        signedVol += pA.dot(cb.crossVectors(pB, pC)) / 6.0;

        // Triangle surface area = 0.5 * |(pB - pA) x (pC - pA)|
        ab.subVectors(pB, pA);
        cb.subVectors(pC, pA);
        totalAreaMm2 += cb.cross(ab).length() * 0.5;
      }
      totalVolMm3 += Math.abs(signedVol);
    }

    const sizeVec = new THREE.Vector3();
    if (!overallBox.isEmpty()) overallBox.getSize(sizeVec);

    const volCm3 = totalVolMm3 / 1000;
    const areaCm2 = totalAreaMm2 / 100;

    const matKey = printSettings.material || "PLA";
    const matInfo = FILAMENT_MATERIALS[matKey] || FILAMENT_MATERIALS.PLA;
    const infillFrac = Math.min(1, Math.max(0.05, Number(printSettings.infill ?? 20) / 100));
    const layerH = Math.max(0.08, Number(printSettings.layerHeight) || 0.2);
    const spoolPrice = Math.max(10, Number(printSettings.spoolPrice) || 110);
    const wallThicknessMm = 1.2; // 3 perimeters * 0.4mm nozzle

    // Effective extruded plastic volume = outer shell + infill of interior
    const shellVolMm3 = Math.min(totalVolMm3, totalAreaMm2 * wallThicknessMm * 0.82);
    const interiorVolMm3 = Math.max(0, totalVolMm3 - shellVolMm3);
    const extrudedVolMm3 =
      matKey === "RESIN"
        ? totalVolMm3
        : shellVolMm3 + interiorVolMm3 * infillFrac;
    const extrudedVolCm3 = extrudedVolMm3 / 1000;

    const weightGrams = extrudedVolCm3 * matInfo.density;
    // 1.75mm filament cross-sectional area = pi * (1.75/2)^2 = 2.40528 mm^2
    const filamentMeters = extrudedVolMm3 / 2.40528 / 1000;
    const costBrl = (weightGrams / 1000) * spoolPrice;

    // Print time estimation based on volumetric flow rate + layer height factor
    const layerFactor = 0.2 / layerH;
    const estSeconds = Math.max(
      60,
      (extrudedVolMm3 / matInfo.speedMm3s) * layerFactor * 1.28 + sizeVec.y * 8
    );
    const hours = Math.floor(estSeconds / 3600);
    const minutes = Math.ceil((estSeconds % 3600) / 60);

    return {
      triangles: Math.round(totalTriangles),
      sizeMm: {
        x: Number(sizeVec.x.toFixed(1)),
        y: Number(sizeVec.z.toFixed(1)), // CAD Y = depth
        z: Number(sizeVec.y.toFixed(1)), // CAD Z = height
      },
      volumeMm3: Math.round(totalVolMm3),
      volumeCm3: Number(volCm3.toFixed(2)),
      areaCm2: Number(areaCm2.toFixed(2)),
      extrudedCm3: Number(extrudedVolCm3.toFixed(2)),
      weightGrams: Number(weightGrams.toFixed(1)),
      filamentMeters: Number(filamentMeters.toFixed(2)),
      costBrl: Number(costBrl.toFixed(2)),
      timeFormatted: hours > 0 ? `${hours}h ${minutes}min` : `${minutes} min`,
      fitsBed220: sizeVec.x <= 220 && sizeVec.z <= 220 && sizeVec.y <= 250,
    };
  }

  /**
   * Minimal pure-JS uncompressed ZIP builder for .3MF export
   */
  const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) {
      crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function buildZipBlob(entries, mime = "application/vnd.ms-package.3dmanufacturing-3dmodel+xml") {
    const enc = new TextEncoder();
    const localParts = [];
    const centralParts = [];
    let offset = 0;

    for (const item of entries) {
      const nameBytes = enc.encode(item.name);
      const dataBytes = typeof item.data === "string" ? enc.encode(item.data) : item.data;
      const crc = crc32(dataBytes);
      const size = dataBytes.length;

      const lh = new Uint8Array(30 + nameBytes.length);
      const ldv = new DataView(lh.buffer);
      ldv.setUint32(0, 0x04034b50, true);
      ldv.setUint16(4, 20, true);
      ldv.setUint16(6, 0, true);
      ldv.setUint16(8, 0, true); // store (no compression)
      ldv.setUint32(14, crc, true);
      ldv.setUint32(18, size, true);
      ldv.setUint32(22, size, true);
      ldv.setUint16(26, nameBytes.length, true);
      lh.set(nameBytes, 30);

      const ch = new Uint8Array(46 + nameBytes.length);
      const cdv = new DataView(ch.buffer);
      cdv.setUint32(0, 0x02014b50, true);
      cdv.setUint16(4, 20, true);
      cdv.setUint16(6, 20, true);
      cdv.setUint32(16, crc, true);
      cdv.setUint32(20, size, true);
      cdv.setUint32(24, size, true);
      cdv.setUint16(28, nameBytes.length, true);
      cdv.setUint32(42, offset, true);
      ch.set(nameBytes, 46);

      localParts.push(lh, dataBytes);
      centralParts.push(ch);
      offset += lh.length + dataBytes.length;
    }

    const centralSize = centralParts.reduce((s, b) => s + b.length, 0);
    const eocd = new Uint8Array(22);
    const edv = new DataView(eocd.buffer);
    edv.setUint32(0, 0x06054b50, true);
    edv.setUint16(8, entries.length, true);
    edv.setUint16(10, entries.length, true);
    edv.setUint32(12, centralSize, true);
    edv.setUint32(16, offset, true);

    return new Blob([...localParts, ...centralParts, eocd], { type: mime });
  }

  /**
   * Collect world-space Z-up triangles from visible meshes (converting Three.js Y-up -> CAD Z-up for slicers!)
   */
  function collectWorldMeshData(meshes) {
    const vertices = [];
    const triangles = [];
    const vA = new THREE.Vector3();

    for (const mesh of meshes) {
      if (!mesh || !mesh.geometry || mesh.visible === false) continue;
      mesh.updateWorldMatrix(true, false);
      const mat4 = mesh.matrixWorld;
      const geom = mesh.geometry;
      const pos = geom.attributes.position;
      if (!pos) continue;

      const baseIndex = vertices.length;
      for (let i = 0; i < pos.count; i++) {
        vA.fromBufferAttribute(pos, i).applyMatrix4(mat4);
        // Map Three.js (x, y_up, z_depth) -> CAD Slicer Z-up (x, -z_depth, y_up)
        vertices.push([
          Number(vA.x.toFixed(4)),
          Number((-vA.z).toFixed(4)),
          Number(vA.y.toFixed(4)),
        ]);
      }

      const idx = geom.index;
      if (idx) {
        for (let i = 0; i < idx.count; i += 3) {
          triangles.push([
            baseIndex + idx.getX(i),
            baseIndex + idx.getX(i + 1),
            baseIndex + idx.getX(i + 2),
          ]);
        }
      } else {
        for (let i = 0; i < pos.count; i += 3) {
          triangles.push([baseIndex + i, baseIndex + i + 1, baseIndex + i + 2]);
        }
      }
    }
    return { vertices, triangles };
  }

  function exportMeshesTo3MF(meshes) {
    const { vertices, triangles } = collectWorldMeshData(meshes);
    const vXml = vertices
      .map(([x, y, z]) => `          <vertex x="${x}" y="${y}" z="${z}" />`)
      .join("\n");
    const tXml = triangles
      .map(([v1, v2, v3]) => `          <triangle v1="${v1}" v2="${v2}" v3="${v3}" />`)
      .join("\n");

    const modelXml = `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">
  <metadata name="Application">3DCad Studio by 4u-Labs</metadata>
  <resources>
    <object id="1" type="model" name="3DCad_Part">
      <mesh>
        <vertices>
${vXml}
        </vertices>
        <triangles>
${tXml}
        </triangles>
      </mesh>
    </object>
  </resources>
  <build>
    <item objectid="1" />
  </build>
</model>`;

    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />
  <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml" />
</Types>`;

    const relsXml = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel" />
</Relationships>`;

    return buildZipBlob([
      { name: "[Content_Types].xml", data: contentTypesXml },
      { name: "_rels/.rels", data: relsXml },
      { name: "3D/3dmodel.model", data: modelXml },
    ]);
  }

  function exportMeshesToOBJ(meshes) {
    const { vertices, triangles } = collectWorldMeshData(meshes);
    const lines = [
      "# 3DCad Studio by 4u-Labs — Exported OBJ (units: mm)",
      "o 3DCad_Model",
    ];
    for (const [x, y, z] of vertices) {
      lines.push(`v ${x} ${y} ${z}`);
    }
    for (const [v1, v2, v3] of triangles) {
      lines.push(`f ${v1 + 1} ${v2 + 1} ${v3 + 1}`);
    }
    return new Blob([lines.join("\n") + "\n"], { type: "text/plain;charset=utf-8" });
  }

  function exportMeshesToSTEP(meshes) {
    const { vertices, triangles } = collectWorldMeshData(meshes);
    const nowIso = new Date().toISOString().slice(0, 19);
    const lines = [
      "ISO-10303-21;",
      "HEADER;",
      "FILE_DESCRIPTION(('3DCad Studio Parametric Export - 4u-Labs'),'2;1');",
      `FILE_NAME('model_3dcad.step','${nowIso}',('3DCad Studio'),('4u-Labs'),'3DCad 1.0','3DCad','');`,
      "FILE_SCHEMA(('AUTOMOTIVE_DESIGN { 1 0 10303 214 1 1 1 1 }'));",
      "ENDSEC;",
      "DATA;",
      "#1 = APPLICATION_CONTEXT('core data for automotive mechanical design processes');",
      "#2 = APPLICATION_PROTOCOL_DEFINITION('international standard','automotive_design',2000,#1);",
      "#3 = ( LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.MILLI.,.METRE.) );",
    ];
    let id = 10;
    const ptIds = [];
    for (const [x, y, z] of vertices) {
      lines.push(`#${id} = CARTESIAN_POINT('',(${x},${y},${z}));`);
      ptIds.push(id++);
    }
    const maxTris = Math.min(triangles.length, 4000);
    for (let i = 0; i < maxTris; i++) {
      const [a, b, c] = triangles[i];
      lines.push(`#${id++} = POLY_LOOP('',(#${ptIds[a]},#${ptIds[b]},#${ptIds[c]}));`);
    }
    lines.push("ENDSEC;", "END-ISO-10303-21;");
    return new Blob([lines.join("\n") + "\n"], { type: "application/step;charset=utf-8" });
  }

  /**
   * Natural Language Prompt Parser (PT-BR & EN) -> Parametric Feature Action
   */
  function parseCadPrompt(rawText) {
    const text = String(rawText || "").trim();
    if (!text) return null;
    const norm = text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    const nums = (norm.match(/\d+(?:[.,]\d+)?/g) || []).map((n) =>
      Number(n.replace(",", "."))
    );
    const mMatch = norm.match(/\bm(\d+(?:[.,]\d+)?)\b/);
    const mSize = mMatch ? Number(mMatch[1].replace(",", ".")) : null;

    // 1. Hole / Cut action on selected solid
    if (/\b(furar|furo|perfurar|drill|cut hole|bore)\b/.test(norm) && !/\b(suporte|cantoneira|placa|engrenagem|caixa)\b/.test(norm)) {
      const dia = mSize ? mSize + 0.2 : nums[0] || 5;
      return {
        action: "DRILL_HOLE",
        diameter: dia,
        summaryPt: `Furo passante Ø${dia}mm aplicado na peça`,
        summaryEn: `Drilled Ø${dia}mm through-hole`,
      };
    }

    // 2. Spur Gear (Engrenagem)
    if (/\b(engrenagem|gear|pinhao|roda dentada)\b/.test(norm)) {
      const teethMatch = norm.match(/(\d+)\s*(?:dentes|teeth|z\b)/);
      const modMatch = norm.match(/(?:modulo|module)\s*(\d+(?:[.,]\d+)?)/);
      const thickMatch = norm.match(/(?:espessura|altura|thickness)\s*(\d+(?:[.,]\d+)?)/);
      const boreMatch = norm.match(/(?:furo|eixo|bore)\s*(\d+(?:[.,]\d+)?)/);
      const teeth = teethMatch ? Number(teethMatch[1]) : nums[0] || 24;
      const mod = modMatch ? Number(modMatch[1].replace(",", ".")) : nums[1] && nums[1] <= 10 ? nums[1] : 2;
      const thickness = thickMatch ? Number(thickMatch[1].replace(",", ".")) : nums[2] || 8;
      const bore = boreMatch ? Number(boreMatch[1].replace(",", ".")) : mSize || 6;
      return {
        action: "CREATE",
        type: "SPUR_GEAR",
        name: `Engrenagem_Z${teeth}_M${mod}`,
        color: "#f97316",
        params: { module: mod, teeth, thickness, boreDiameter: bore, pressureAngle: 20 },
      };
    }

    // 3. L-Bracket (Suporte em L / Cantoneira)
    if (/\b(suporte|cantoneira|bracket|l-bracket)\b/.test(norm)) {
      const armA = nums[0] || 60;
      const armB = nums[1] || 45;
      const width = nums[2] || 30;
      const thickness = nums[3] && nums[3] <= 20 ? nums[3] : 5;
      const holeDiameter = mSize ? mSize + 0.2 : 4.2;
      return {
        action: "CREATE",
        type: "L_BRACKET",
        name: `Suporte_L_${armA}x${armB}`,
        color: "#38bdf8",
        params: { armA, armB, width, thickness, holeDiameter, gusset: 1 },
      };
    }

    // 4. Electronics Enclosure (Caixa / Gabinete)
    if (/\b(caixa|gabinete|case|enclosure)\b/.test(norm)) {
      const width = nums[0] || 85;
      const depth = nums[1] || 58;
      const height = nums[2] || 32;
      const wallThickness = nums[3] && nums[3] <= 10 ? nums[3] : 2.5;
      return {
        action: "CREATE",
        type: "ENCLOSURE",
        name: `Gabinete_${width}x${depth}x${height}`,
        color: "#3b82f6",
        params: { width, depth, height, wallThickness, standoffHeight: 6, screwHole: 2.8 },
      };
    }

    // 5. Mounting Plate (Placa / Base / Chapa)
    if (/\b(placa|chapa|flange|plate|base)\b/.test(norm)) {
      const width = nums[0] || 90;
      const depth = nums[1] || 70;
      const thickness = nums[2] && nums[2] <= 30 ? nums[2] : 5;
      const holeDiameter = mSize ? mSize + 0.2 : nums[3] || 4.2;
      return {
        action: "CREATE",
        type: "MOUNTING_PLATE",
        name: `Placa_Base_${width}x${depth}`,
        color: "#10b981",
        params: { width, depth, thickness, cornerRadius: 6, holeDiameter, centerBore: 0 },
      };
    }

    // 6. Bolt / Nut (Parafuso / Porca)
    if (/\b(parafuso|porca|bolt|nut|screw)\b/.test(norm)) {
      const isNut = /\b(porca|nut)\b/.test(norm) ? 1 : 0;
      const metricDia = mSize || nums[0] || 6;
      const shaftLength = isNut ? 0 : nums[1] || 22;
      return {
        action: "CREATE",
        type: "HEX_BOLT",
        name: isNut ? `Porca_M${metricDia}` : `Parafuso_M${metricDia}x${shaftLength}`,
        color: "#94a3b8",
        params: {
          metricDia,
          shaftLength,
          headWidth: Number((metricDia * 1.65).toFixed(1)),
          headHeight: Number((metricDia * 0.7).toFixed(1)),
          nutBore: isNut,
        },
      };
    }

    // 7. Pulley / Spacer (Polia / Roldana)
    if (/\b(polia|roldana|pulley)\b/.test(norm)) {
      const outerDiameter = nums[0] || 42;
      const grooveDiameter = nums[1] || Math.round(outerDiameter * 0.75);
      const boreDiameter = nums[2] || 8;
      const height = nums[3] || 14;
      return {
        action: "CREATE",
        type: "PULLEY",
        name: `Polia_D${outerDiameter}`,
        color: "#eab308",
        params: { outerDiameter, grooveDiameter, boreDiameter, height },
      };
    }

    // 8. Cylinder / Tube / Bushing (Cilindro / Tubo / Bucha)
    if (/\b(cilindro|tubo|bucha|cylinder|tube|pipe|bushing)\b/.test(norm)) {
      const diameter = nums[0] || 32;
      const innerDiameter = /\b(tubo|bucha|tube|pipe|bushing)\b/.test(norm)
        ? nums[1] && nums[1] < diameter
          ? nums[1]
          : Math.round(diameter * 0.65)
        : 0;
      const height = (innerDiameter ? nums[2] : nums[1]) || 40;
      return {
        action: "CREATE",
        type: "CYLINDER",
        name: innerDiameter > 0 ? `Tubo_D${diameter}_d${innerDiameter}` : `Cilindro_D${diameter}`,
        color: "#10b981",
        params: { diameter, innerDiameter, height, segments: 48 },
      };
    }

    // 9. Default Box / Block
    const width = nums[0] || 50;
    const depth = nums[1] || 35;
    const height = nums[2] || 20;
    return {
      action: "CREATE",
      type: "BOX",
      name: `Bloco_${width}x${depth}x${height}`,
      color: "#f97316",
      params: { width, depth, height, cornerRadius: 2, boreDiameter: mSize || 0 },
    };
  }

  /**
   * 4 Showcase Parametric Projects (including the SolidCraft Rover!)
   */
  const DEMO_PROJECTS = {
    rover: {
      titlePt: "Robô Rover Espacial (Demo SolidCraft)",
      titleEn: "Space Rover Assembly (SolidCraft Demo)",
      items: [
        {
          type: "BOX",
          name: "Chassis_Central",
          color: "#94a3b8",
          params: { width: 54, depth: 78, height: 18, cornerRadius: 3, boreDiameter: 0 },
          pos: [0, 22, 0],
          rot: [0, 0, 0],
        },
        {
          type: "MOUNTING_PLATE",
          name: "Deck_Superior",
          color: "#f97316",
          params: { width: 58, depth: 82, thickness: 4, cornerRadius: 4, holeDiameter: 3.2, centerBore: 10 },
          pos: [0, 33, 0],
          rot: [0, 0, 0],
        },
        // 2 Solar Panels
        {
          type: "BOX",
          name: "Painel_Solar_Esq",
          color: "#1e3a8a",
          params: { width: 42, depth: 52, height: 2.5, cornerRadius: 1, boreDiameter: 0 },
          pos: [-48, 33, -4],
          rot: [0, 0, 10],
        },
        {
          type: "BOX",
          name: "Painel_Solar_Dir",
          color: "#1e3a8a",
          params: { width: 42, depth: 52, height: 2.5, cornerRadius: 1, boreDiameter: 0 },
          pos: [48, 33, -4],
          rot: [0, 0, -10],
        },
        // 6 Rover Wheels (Pulley / Treaded Cylinder style)
        ...[-34, 34].flatMap((wx, sideIdx) =>
          [-30, 0, 30].map((wz, wIdx) => ({
            type: "SPUR_GEAR",
            name: `Roda_${sideIdx === 0 ? "E" : "D"}${wIdx + 1}`,
            color: "#334155",
            params: { module: 1.5, teeth: 18, thickness: 10, boreDiameter: 6, pressureAngle: 20 },
            pos: [wx, 14, wz],
            rot: [0, 0, 90],
          }))
        ),
        // Robotic Arm Base & Boom
        {
          type: "CYLINDER",
          name: "Torre_Base_Braco",
          color: "#f97316",
          params: { diameter: 18, innerDiameter: 6, height: 14, segments: 32 },
          pos: [0, 42, 22],
          rot: [0, 0, 0],
        },
        {
          type: "L_BRACKET",
          name: "Braco_Robotico_Articulado",
          color: "#fb923c",
          params: { armA: 48, armB: 36, width: 10, thickness: 4, holeDiameter: 3.2, gusset: 1 },
          pos: [0, 62, 34],
          rot: [25, 90, 0],
        },
        // Sensor Mast
        {
          type: "CYLINDER",
          name: "Mastro_Camera",
          color: "#cbd5e1",
          params: { diameter: 6, innerDiameter: 0, height: 32, segments: 24 },
          pos: [-14, 50, -24],
          rot: [0, 0, 0],
        },
        {
          type: "BOX",
          name: "Cabeca_LiDAR_Camera",
          color: "#38bdf8",
          params: { width: 18, depth: 12, height: 10, cornerRadius: 2, boreDiameter: 4 },
          pos: [-14, 68, -24],
          rot: [90, 0, 0],
        },
      ],
    },
    gearbox: {
      titlePt: "Conjunto Redutor de Engrenagens",
      titleEn: "Planetary / Spur Gear Reduction Set",
      items: [
        {
          type: "MOUNTING_PLATE",
          name: "Placa_Base_Redutor",
          color: "#334155",
          params: { width: 130, depth: 90, thickness: 6, cornerRadius: 8, holeDiameter: 5, centerBore: 8 },
          pos: [0, 3, 0],
          rot: [0, 0, 0],
        },
        {
          type: "SPUR_GEAR",
          name: "Engrenagem_Motora_Z28",
          color: "#f97316",
          params: { module: 2, teeth: 28, thickness: 10, boreDiameter: 8, pressureAngle: 20 },
          pos: [-22, 11, 0],
          rot: [0, 0, 0],
        },
        {
          type: "SPUR_GEAR",
          name: "Pinhao_Auxiliar_Z16",
          color: "#38bdf8",
          params: { module: 2, teeth: 16, thickness: 10, boreDiameter: 6, pressureAngle: 20 },
          pos: [22, 11, 0],
          rot: [0, 11.25, 0],
        },
        {
          type: "HEX_BOLT",
          name: "Eixo_Central_M8",
          color: "#94a3b8",
          params: { metricDia: 8, shaftLength: 22, headWidth: 13, headHeight: 5, nutBore: 0 },
          pos: [-22, 14, 0],
          rot: [0, 0, 0],
        },
      ],
    },
    enclosure: {
      titlePt: "Gabinete Eletrônico IoT + Suporte",
      titleEn: "IoT Electronics Enclosure + Bracket",
      items: [
        {
          type: "ENCLOSURE",
          name: "Caixa_IoT_Principal",
          color: "#3b82f6",
          params: { width: 92, depth: 64, height: 34, wallThickness: 2.6, standoffHeight: 7, screwHole: 3 },
          pos: [0, 17, 0],
          rot: [0, 0, 0],
        },
        {
          type: "L_BRACKET",
          name: "Aba_Fixacao_Esq",
          color: "#f97316",
          params: { armA: 24, armB: 28, width: 26, thickness: 4, holeDiameter: 4.2, gusset: 1 },
          pos: [-56, 14, 0],
          rot: [0, 0, 0],
        },
        {
          type: "L_BRACKET",
          name: "Aba_Fixacao_Dir",
          color: "#f97316",
          params: { armA: 24, armB: 28, width: 26, thickness: 4, holeDiameter: 4.2, gusset: 1 },
          pos: [56, 14, 0],
          rot: [0, 180, 0],
        },
      ],
    },
    bracket: {
      titlePt: "Suporte Mecânico NEMA / Cantoneira M4",
      titleEn: "Reinforced NEMA / Structural L-Bracket",
      items: [
        {
          type: "L_BRACKET",
          name: "Cantoneira_Reforcada",
          color: "#f97316",
          params: { armA: 70, armB: 60, width: 44, thickness: 6, holeDiameter: 4.5, gusset: 1 },
          pos: [0, 30, 0],
          rot: [0, 0, 0],
        },
        {
          type: "PULLEY",
          name: "Polia_Guia_GT2",
          color: "#38bdf8",
          params: { outerDiameter: 32, grooveDiameter: 24, boreDiameter: 5, height: 12 },
          pos: [18, 42, 0],
          rot: [90, 0, 0],
        },
      ],
    },
  };

  root.CadGenerators = {
    PARAM_SCHEMA,
    FILAMENT_MATERIALS,
    DEMO_PROJECTS,
    buildParametricGeometry,
    analyzeMeshFor3DPrint,
    exportMeshesTo3MF,
    exportMeshesToOBJ,
    exportMeshesToSTEP,
    parseCadPrompt,
  };
})(typeof window !== "undefined" ? window : globalThis);
