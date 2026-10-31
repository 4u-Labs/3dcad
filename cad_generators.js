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
      { key: "shaftLength", pt: "Comprimento da Haste (mm)", en: "Shaft Length (mm)", min: 0, max: 150, step: 1 },
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
    PILLOW_BLOCK: [
      { key: "bearingBore", pt: "Furo Rolamento 608 (mm)", en: "Bearing Bore (mm)", min: 4, max: 100, step: 0.1 },
      { key: "outerRingDia", pt: "Diâmetro do Anel (mm)", en: "Housing Ring Dia (mm)", min: 12, max: 140, step: 1 },
      { key: "baseWidth", pt: "Largura Base Total X (mm)", en: "Total Base Width X (mm)", min: 30, max: 240, step: 1 },
      { key: "thickness", pt: "Espessura / Largura Y (mm)", en: "Block Depth Y (mm)", min: 5, max: 60, step: 0.5 },
      { key: "baseHeight", pt: "Altura da Aba Base Z (mm)", en: "Flange Height Z (mm)", min: 3, max: 30, step: 0.5 },
      { key: "mountHoleDia", pt: "Furos de Fixação (mm)", en: "Mounting Holes (mm)", min: 0, max: 20, step: 0.2 },
    ],
    SNAP_LID_BOX: [
      { key: "width", pt: "Largura Externa X (mm)", en: "Outer Width X (mm)", min: 20, max: 400, step: 1 },
      { key: "depth", pt: "Profundidade Y (mm)", en: "Outer Depth Y (mm)", min: 20, max: 400, step: 1 },
      { key: "topThickness", pt: "Espessura da Tampa Z (mm)", en: "Lid Plate Thickness Z (mm)", min: 1.5, max: 20, step: 0.5 },
      { key: "lipHeight", pt: "Altura do Rebordo (mm)", en: "Lip Height (mm)", min: 1.5, max: 25, step: 0.5 },
      { key: "wallThickness", pt: "Parede da Caixa (mm)", en: "Box Wall Thickness (mm)", min: 1.2, max: 15, step: 0.2 },
      { key: "clearance", pt: "Folga Impressão 3D (mm)", en: "3D Print Clearance (mm)", min: 0, max: 1.5, step: 0.05 },
      { key: "ventSlots", pt: "Aletas de Ventilação (0/1)", en: "Ventilation Slots (0/1)", min: 0, max: 1, step: 1 },
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
    if (root.CadProject) params = root.CadProject.validateParams(type, params);
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
        const bore = Math.max(0, num(params.boreDiameter, 6));
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

      case "PILLOW_BLOCK": {
        const bore = Math.max(4, num(params.bearingBore, 22.2));
        const ringDia = Math.max(bore + 5, num(params.outerRingDia, 34));
        const baseW = Math.max(ringDia + 16, num(params.baseWidth, 68));
        const depth = Math.max(5, num(params.thickness, 14));
        const flangeH = Math.max(3, num(params.baseHeight, 6));
        const mHole = Math.max(0, num(params.mountHoleDia, 4.4));

        const rOut = ringDia / 2;
        const centerY = Math.max(rOut, flangeH + rOut * 0.45);

        // Build front profile of Pillow Block in XY plane and extrude along Z (depth)
        const shape = new THREE.Shape();
        const hw = baseW / 2;
        shape.moveTo(-hw, 0);
        shape.lineTo(hw, 0);
        shape.lineTo(hw, flangeH);
        shape.lineTo(rOut, flangeH);
        shape.absarc(0, centerY, rOut, 0, Math.PI, false);
        shape.lineTo(-rOut, flangeH);
        shape.lineTo(-hw, flangeH);
        shape.closePath();

        // Bearing bore hole
        shape.holes.push(makeCirclePath(0, centerY, bore / 2, 48));

        let geom = new THREE.ExtrudeGeometry(shape, {
          depth,
          bevelEnabled: false,
          curveSegments: 40,
        });
        geom.computeBoundingBox();
        const minY = geom.boundingBox.min.y;
        const maxY = geom.boundingBox.max.y;
        geom.translate(0, -(minY + maxY) / 2, -depth / 2);

        if (typeof CSG !== "undefined" && mHole >= 1) {
          const mat = new THREE.MeshStandardMaterial();
          const baseMesh = new THREE.Mesh(geom, mat);
          baseMesh.updateMatrix();
          let csg = CSG.fromMesh(baseMesh);
          const holeX = (hw + rOut) / 2;
          const rH = mHole / 2;
          const yFlangeMid = -(minY + maxY) / 2 + flangeH / 2;
          for (const sx of [-holeX, holeX]) {
            const cyl = new THREE.Mesh(new THREE.CylinderGeometry(rH, rH, flangeH * 4, 24), mat);
            cyl.position.set(sx, yFlangeMid, 0);
            cyl.updateMatrix();
            csg = csg.subtract(CSG.fromMesh(cyl));
          }
          const res = CSG.toMesh(csg, new THREE.Matrix4(), mat);
          geom = res.geometry;
        }
        geom.computeVertexNormals();
        return geom;
      }

      case "SNAP_LID_BOX": {
        const w = Math.max(20, num(params.width, 85));
        const d = Math.max(20, num(params.depth, 58));
        const topT = Math.max(1.5, num(params.topThickness, 3));
        const lipH = Math.max(1.5, num(params.lipHeight, 4));
        const wall = Math.max(1.2, num(params.wallThickness, 2.5));
        const clear = Math.max(0, num(params.clearance, 0.3));
        const hasVents = num(params.ventSlots, 1) === 1;

        const totalH = topT + lipH;
        const lipOuterW = Math.max(8, w - (wall + clear) * 2);
        const lipOuterD = Math.max(8, d - (wall + clear) * 2);
        const lipWall = Math.max(1.4, wall * 0.8);

        if (typeof CSG !== "undefined") {
          const mat = new THREE.MeshStandardMaterial();
          const topPlate = new THREE.Mesh(new THREE.BoxGeometry(w, topT, d), mat);
          topPlate.position.set(0, -totalH / 2 + topT / 2, 0);
          topPlate.updateMatrix();

          const lipOuter = new THREE.Mesh(
            new THREE.BoxGeometry(lipOuterW, lipH, lipOuterD),
            mat
          );
          lipOuter.position.set(0, -totalH / 2 + topT + lipH / 2, 0);
          lipOuter.updateMatrix();

          const lipInner = new THREE.Mesh(
            new THREE.BoxGeometry(
              Math.max(2, lipOuterW - lipWall * 2),
              lipH + 2,
              Math.max(2, lipOuterD - lipWall * 2)
            ),
            mat
          );
          lipInner.position.set(0, -totalH / 2 + topT + lipH / 2 + 0.5, 0);
          lipInner.updateMatrix();

          let csg = CSG.fromMesh(topPlate)
            .union(CSG.fromMesh(lipOuter))
            .subtract(CSG.fromMesh(lipInner));

          if (hasVents && lipOuterW > 24 && lipOuterD > 20) {
            const slotW = 2.6;
            const slotD = Math.min(36, lipOuterD * 0.55);
            for (let i = -2; i <= 2; i++) {
              const slot = new THREE.Mesh(
                new THREE.BoxGeometry(slotW, totalH * 3, slotD),
                mat
              );
              slot.position.set(i * (slotW * 2.4), 0, 0);
              slot.updateMatrix();
              csg = csg.subtract(CSG.fromMesh(slot));
            }
          }

          const res = CSG.toMesh(csg, new THREE.Matrix4(), mat);
          res.geometry.computeVertexNormals();
          return res.geometry;
        }
        return new THREE.BoxGeometry(w, totalH, d);
      }

      case "SKETCH_EXTRUDE": {
        const h = Math.max(1, Number(params.height) || 15);
        const requestedBevel = Math.min(Math.max(0, Number(params.bevel) || 0), h * 0.24);
        const bevel = requestedBevel > 0.05 ? requestedBevel : 0;
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

        const shapes = solids.map(buildShapeFromEnt);
        function inside(point, polygon) {
          let result=false;
          for(let i=0,j=polygon.length-1;i<polygon.length;j=i++) {
            const a=polygon[i],b=polygon[j];
            if((a.y>point.y)!==(b.y>point.y)&&point.x<(b.x-a.x)*(point.y-a.y)/(b.y-a.y)+a.x) result=!result;
          }
          return result;
        }
        for(const hole of holes) {
          const samples=Array.from({length:32},(_,i)=>({x:hole.x+Math.cos(i*Math.PI/16)*hole.r,y:-hole.y+Math.sin(i*Math.PI/16)*hole.r}));
          const matches=shapes.filter(shape=>samples.every(point=>inside(point,shape.getPoints(64))));
          if(matches.length!==1) throw new Error('Furo deve estar dentro de um único contorno / Hole must be inside exactly one profile');
          matches[0].holes.push(makeCirclePath(hole.x,-hole.y,hole.r,32));
        }
        for(let i=0;i<holes.length;i++)for(let j=i+1;j<holes.length;j++)if(Math.hypot(holes[i].x-holes[j].x,holes[i].y-holes[j].y)<=holes[i].r+holes[j].r)
          throw new Error('Furos sobrepostos ou tangentes / Overlapping or tangent holes');

        const geom = new THREE.ExtrudeGeometry(shapes, {
          depth: h - 2 * bevel,
          bevelEnabled: bevel > 0.05,
          bevelThickness: bevel,
          bevelSize: -bevel,
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
        throw new Error("Tipo de peça desconhecido / Unknown part type: " + type);
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

  const PRINT_METRIC_CACHE = new WeakMap();
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
      // Translation leaves physical metrics unchanged. Cache the linear part
      // of the world transform to keep dragging independent of triangle count.
      const linear = new THREE.Matrix3().setFromMatrix4(mat4);
      const signature = linear.elements.map(n => n.toPrecision(12)).join(',') + ':' + pos.version;
      let cached = PRINT_METRIC_CACHE.get(geom);
      if (!cached || cached.signature !== signature) {
        let signedVol = 0, area = 0;
        for (let i = 0; i < triCount; i++) {
          const i0=index?index.getX(i*3):i*3, i1=index?index.getX(i*3+1):i*3+1, i2=index?index.getX(i*3+2):i*3+2;
          pA.fromBufferAttribute(pos,i0).applyMatrix3(linear);
          pB.fromBufferAttribute(pos,i1).applyMatrix3(linear);
          pC.fromBufferAttribute(pos,i2).applyMatrix3(linear);
          signedVol += pA.dot(cb.crossVectors(pB,pC))/6;
          ab.subVectors(pB,pA);cb.subVectors(pC,pA);area += cb.cross(ab).length()*0.5;
        }
        cached={signature,volume:Math.abs(signedVol),area};PRINT_METRIC_CACHE.set(geom,cached);
      }
      totalVolMm3 += cached.volume;totalAreaMm2 += cached.area;

    }

    const sizeVec = new THREE.Vector3();
    if (!overallBox.isEmpty()) overallBox.getSize(sizeVec);

    const volCm3 = totalVolMm3 / 1000;
    const areaCm2 = totalAreaMm2 / 100;

    const matKey = printSettings.material || "PLA";
    const matInfo = FILAMENT_MATERIALS[matKey] || FILAMENT_MATERIALS.PLA;
    const infillFrac = Math.min(1, Math.max(0, Number(printSettings.infill ?? 20) / 100));
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
    const filamentMeters = matKey === "RESIN" ? 0 : extrudedVolMm3 / 2.40528 / 1000;
    const costBrl = (weightGrams / 1000) * spoolPrice;

    // Print time estimation based on volumetric flow rate + layer height factor
    const layerFactor = 0.2 / layerH;
    const estSeconds = totalVolMm3 === 0 ? 0 : Math.max(
      60,
      (extrudedVolMm3 / matInfo.speedMm3s) * layerFactor * 1.28 + sizeVec.y * 8
    );
    const totalMinutes = Math.ceil(estSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

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
      fitsBed220: !overallBox.isEmpty() && overallBox.min.x >= -110 - 1e-4 && overallBox.max.x <= 110 + 1e-4 && overallBox.min.z >= -110 - 1e-4 && overallBox.max.z <= 110 + 1e-4 && overallBox.min.y >= -1e-4 && overallBox.max.y <= 250 + 1e-4,
      isEstimate: true,
      material: matKey,
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
  const xml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  function exportMeshesTo3MF(meshes) {
    const objects = root.CadMesh.collect(meshes, true);
    const colors = objects.map(o => `<base name="${xml(o.name)}" displaycolor="${o.color.toUpperCase()}FF"/>`).join('');
    const resources = objects.map((o, i) => `<object id="${i + 2}" type="model" name="${xml(o.name)}" pid="1" pindex="${i}"><mesh><vertices>${o.vertices.map(v => `<vertex x="${v[0]}" y="${v[1]}" z="${v[2]}"/>`).join('')}</vertices><triangles>${o.triangles.map(f => `<triangle v1="${f[0]}" v2="${f[1]}" v3="${f[2]}"/>`).join('')}</triangles></mesh></object>`).join('');
    const modelXml = `<?xml version="1.0" encoding="UTF-8"?><model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"><metadata name="Application">3DCad Studio 1.2</metadata><resources><basematerials id="1">${colors}</basematerials>${resources}</resources><build>${objects.map((o,i)=>`<item objectid="${i+2}"/>`).join('')}</build></model>`;
    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>`;
    const relsXml = `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>`;
    return buildZipBlob([{name:'[Content_Types].xml',data:contentTypesXml},{name:'_rels/.rels',data:relsXml},{name:'3D/3dmodel.model',data:modelXml}]);
  }
  function exportMeshesToOBJ(meshes) { return root.CadMesh.obj(meshes); }
  function exportMeshesToSTEP(meshes) { return root.CadMesh.step(meshes); }

  /**
   * Natural Language Prompt Parser (PT-BR & EN) -> Parametric Feature Action
   */
  function parseCadPrompt(rawText) {
    const text = String(rawText || '').trim();
    if (!text || text.length > 1000) return null;
    const norm = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const number = '(-?\\d+(?:[.,]\\d+)?)';
    const parse = value => value === undefined ? undefined : Number(value.replace(',', '.'));
    const named = terms => { const match = norm.match(new RegExp('(?:'+terms+')\\s*(?:de|of|to|para|=|:)?\\s*'+number)); return match ? parse(match[1]) : undefined; };
    const dimensions = norm.match(new RegExp(number+'\\s*[x×]\\s*'+number+'(?:\\s*[x×]\\s*'+number+')?'));
    const dims = dimensions ? dimensions.slice(1).map(parse) : [];
    const metric = norm.match(/\bm(\d+(?:[.,]\d+)?)\b/);
    const m = metric ? parse(metric[1]) : undefined;
    const width = named('largura|width'), depth = named('profundidade|depth'), height = named('altura|height'), thickness = named('espessura|thickness');
    const bore = named('furo|bore|eixo|shaft bore|inner diameter'), diameter = named('diametro(?: externo)?|outer diameter|diameter');
    if (/\b(cm|inch|inches|polegadas|metros)\b/.test(norm)) return null;
    const modify = /\b(alterar|modificar|ajustar|mudar|change|modify|update|set)\b/.test(norm);
    if (modify) {
      const target = terms => { const match = norm.match(new RegExp('(?:'+terms+')[^0-9]{0,70}?(?:para|to|=)\\s*'+number)); return match ? parse(match[1]) : undefined; };
      const params = {};
      for (const [key, value] of Object.entries({width:width??target('largura|width'),depth:depth??target('profundidade|depth'),height:height??target('altura|height'),thickness,diameter,boreDiameter:bore})) if (value !== undefined) params[key] = value;
      return Object.keys(params).length ? {action:'MODIFY',params,name:'Editar peça / Edit part'} : null;
    }
    const isGear = /\b(engrenagem|gear|pinhao)\b/.test(norm);
    const isBracket = /\b(suporte|cantoneira|bracket)\b/.test(norm);
    const isPlate = /\b(placa|chapa|flange|plate|base)\b/.test(norm);
    const isBox = /\b(bloco|cubo|box|block|cube)\b/.test(norm);
    const isCase = /\b(caixa|gabinete|case|enclosure)\b/.test(norm);
    const isBearing = /\b(mancal|rolamento|bearing|pillow)\b/.test(norm);
    const isLid = /\b(tampa|snap|lid|cover)\b/.test(norm);
    const isBolt = /\b(parafuso|porca|bolt|nut|screw)\b/.test(norm);
    const isPulley = /\b(polia|roldana|pulley)\b/.test(norm);
    const isCylinder = /\b(cilindro|tubo|bucha|cylinder|tube|pipe|bushing)\b/.test(norm);
    const isSphere = /\b(esfera|sphere)\b/.test(norm);
    const isCone = /\b(cone)\b/.test(norm);
    const isTorus = /\b(torus|o-ring|anel|ring)\b/.test(norm);
    const partMentioned = isGear || isBracket || isPlate || isBox || isCase || isBearing || isLid || isBolt || isPulley || isCylinder || isSphere || isCone || isTorus;
    if (!partMentioned && /\b(furar|perfurar|drill|furo|bore)\b/.test(norm)) {
      const d = bore ?? diameter ?? (m !== undefined ? m + 0.2 : named('furar|perfurar|drill'));
      return d === undefined ? null : {action:'DRILL_HOLE',diameter:d,name:`Furo / Hole Ø${d} mm`};
    }
    let type, params;
    if (isGear) {
      const teeth = norm.match(/(\d+)\s*(?:dentes|teeth)\b|\bz\s*(\d+)/);
      type='SPUR_GEAR'; params={teeth:teeth?Number(teeth[1]||teeth[2]):24,module:named('modulo|module')??2,thickness:thickness??height??8,boreDiameter:bore??0,pressureAngle:named('angulo de pressao|pressure angle')??20};
    } else if (isBracket) {
      type='L_BRACKET';params={armA:named('aba a|arm a')??dims[0]??60,armB:named('aba b|arm b')??dims[1]??45,width:width??30,thickness:thickness??5,holeDiameter:bore??(m!==undefined?m+0.2:4.2),gusset:1};
    } else if (isBearing) {
      const b = /\b608\b/.test(norm)?22.2:(bore??diameter??22.2);
      type='PILLOW_BLOCK';params={bearingBore:b,outerRingDia:Math.max(b+10,34),baseWidth:named('base|base width')??width??68,thickness:thickness??14,baseHeight:6,mountHoleDia:m!==undefined?m+0.2:4.4};
    } else if (isLid) {
      type='SNAP_LID_BOX';params={width:width??dims[0]??85,depth:depth??dims[1]??58,topThickness:thickness??3,lipHeight:4,wallThickness:named('parede|wall(?: thickness)?')??2.5,clearance:named('folga|clearance')??0.3,ventSlots:/\b(sem ventilacao|no vents)\b/.test(norm)?0:1};
    } else if (isCase) {
      type='ENCLOSURE';params={width:width??dims[0]??85,depth:depth??dims[1]??58,height:height??dims[2]??32,wallThickness:named('parede|wall(?: thickness)?')??2.5,standoffHeight:6,screwHole:2.8};
    } else if (isBolt) {
      const nut=/\b(porca|nut)\b/.test(norm),d=m??diameter??6;
      type='HEX_BOLT';params={metricDia:d,shaftLength:nut?0:named('comprimento|length')??dims[1]??22,headWidth:Number((d*1.65).toFixed(2)),headHeight:Number((d*0.7).toFixed(2)),nutBore:nut?1:0};
    } else if (isPulley) {
      const d=diameter??40;
      type='PULLEY';params={outerDiameter:d,grooveDiameter:named('pista|groove(?: diameter)?')??d*0.75,boreDiameter:bore??8,height:height??14};
    } else if (isPlate) {
      type='MOUNTING_PLATE';params={width:width??dims[0]??90,depth:depth??dims[1]??70,thickness:thickness??dims[2]??5,cornerRadius:6,holeDiameter:bore??(m!==undefined?m+0.2:4.2),centerBore:0};
    } else if (isCylinder) {
      const tube=/\b(tubo|bucha|tube|pipe|bushing)\b/.test(norm),d=diameter??dims[0]??32;
      type='CYLINDER';params={diameter:d,innerDiameter:bore??(tube?named('interno|inner')??d*0.65:0),height:height??dims[1]??40,segments:48};
    } else if (isSphere) { type='SPHERE';params={diameter:diameter??30,segments:36};
    } else if (isCone) { type='CONE';params={bottomDiameter:diameter??34,topDiameter:named('topo|top diameter')??0,height:height??30};
    } else if (isTorus) { type='TORUS';params={majorDiameter:diameter??38,tubeDiameter:thickness??8};
    } else if (isBox) {type='BOX';params={width:width??dims[0]??50,depth:depth??dims[1]??35,height:height??dims[2]??20,cornerRadius:named('raio|radius')??0,boreDiameter:bore??0};}
    else return null;
    if (root.CadProject) params=root.CadProject.validateParams(type,params);
    return {action:'CREATE',type,params,name:type,color:'#f97316'};
  }

  /**
   * 4 Showcase Parametric Projects (including the SolidCraft Rover!)
   */
  const DEMO_PROJECTS = {
    rover: {
      titlePt: "Robô Rover Espacial (Demonstração)",
      titleEn: "Space Rover Assembly (Demo)",
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
          name: "Polia_Guia",
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
