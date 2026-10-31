/**
 * 3DCad Studio — Main Application Controller
 * Inspired by SolidCraft + FreeCAD 1.0 + Fusion 360
 * 100% Client-Side • 4u-Labs Ecosystem
 */
(function () {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  // === BILINGUAL DICTIONARY (PT-BR & EN) ===
  const I18N = {
    pt: {
      subtitle: "CAD 3D Paramétrico & Impressão 3D · 4u-Labs",
      wsModel: "Modelar 3D",
      wsSketch: "Esboço 2D",
      wsMech: "Peças & Engrenagens",
      wsPrint: "Impressão 3D",
      wsAi: "🤖 Copiloto IA (MCP)",
      undo: "Desfazer",
      redo: "Refazer",
      importBtn: "Importar STL/JSON",
      exportStl: "Exportar .STL",
      rbSketch: "Esboço 2D",
      grpSketch: "Sketch",
      rbBox: "Cubo",
      rbCyl: "Cilindro/Tubo",
      rbSphere: "Esfera",
      rbCone: "Cone",
      rbTorus: "O-Ring/Torus",
      grpPrimitives: "Primitivas Paramétricas",
      rbGear: "Engrenagem",
      rbBracket: "Suporte L",
      rbEnclosure: "Caixa PCB",
      rbPlate: "Placa Furada",
      rbBolt: "Parafuso/Porca",
      rbPulley: "Polia",
      rbPillow: "Mancal 608",
      rbSnapLid: "Tampa Snap",
      grpMechanical: "Geradores Mecânicos",
      rbUnion: "Unir (CSG)",
      rbSubtract: "Subtrair/Furar",
      rbIntersect: "Interseção",
      rbHole: "Furo M4/M6",
      grpBoolean: "Booleano (CSG)",
      rbLinPat: "Padrão Linear",
      rbCircPat: "Padrão Circular",
      rbMirror: "Espelhar",
      rbDuplicate: "Duplicar",
      grpPattern: "Padrão & Cópia",
      grpExport: "Formatos CAD",
      browserTitle: "Árvore do Projeto",
      clearBtn: "Limpar",
      bodiesHeader: "Sólidos & Operações",
      viewsHeader: "Vistas Padrão",
      vTop: "Topo (Z)",
      vFront: "Frente (Y)",
      vRight: "Direita (X)",
      vLeft: "Esquerda",
      vBack: "Trás",
      demosHeader: "Projetos Exemplo (1 Clique)",
      demoRover: "Robô Rover (SolidCraft)",
      demoGearbox: "Redutor de Engrenagens",
      demoEnclosure: "Caixa Eletrônica IoT",
      demoBracket: "Cantoneira + Polia GT2",
      selLabel: "Peça:",
      vcTop: "TOPO",
      vcFront: "FRENTE",
      vcRight: "DIR",
      hudDrag: "Mover Peça",
      hudFit: "Enquadrar",
      hudDrop: "Mesa Z=0",
      hudCenter: "Centrar",
      hudShadedEdges: "Sólido + Arestas",
      hudWire: "Aramado",
      hudXray: "Raio-X",
      hudMeasure: "Trena 3D",
      skTitle: "✏️ Esboço 2D no Plano XY (mm):",
      skRect: "Retângulo",
      skCircle: "Círculo",
      skSlot: "Oblongo (Slot)",
      skHex: "Hexágono",
      skHole: "Furo Circular",
      skClear: "Limpar",
      skHeightLbl: "Altura Z (mm):",
      skExtrudeBtn: "Extrudar para 3D",
      skCancel: "Fechar",
      tlReplay: "Reproduzir Histórico",
      bedInfo: "Mesa de Impressão: 220 × 220 mm · Unidades: milímetros (mm)",
      tabParams: "🔧 Parâmetros",
      tabPrint: "🖨️ Impressão 3D",
      tabAi: "🤖 IA & MCP",
      selectedPartTitle: "Peça Selecionada",
      lblPartName: "Nome da Peça",
      transformTitle: "Posição (mm) & Rotação (°)",
      layFlatBtn: "Assentar Peça na Mesa (Z = 0 mm)",
      materialColorTitle: "Cor & Acabamento",
      csgCardTitle: "Operação Booleana (CSG)",
      csgSecondSolid: "2º Sólido (Ferramenta):",
      btnUnion: "Unir",
      btnSub: "Furar",
      btnInt: "Interseção",
      deletePart: "Excluir Peça",
      printMetricsTitle: "Métricas Físicas de Impressão 3D",
      mWeight: "Peso Estimado",
      mTime: "Tempo de Impressão",
      mVolume: "Volume Sólido",
      mFilament: "Filamento (1.75mm)",
      mCost: "Custo de Material",
      mTriangles: "Malha (Triângulos)",
      slicerCfgTitle: "Parâmetros do Fatiador",
      lblMaterial: "Material",
      lblInfill: "Preenchimento (Infill %)",
      lblLayerH: "Altura da Camada",
      lblSpoolPrice: "Preço do Kg (R$)",
      slicePreviewTitle: "Inspeção Interna por Camadas (Corte Z)",
      sliceHint: "Arraste para cortar horizontalmente a peça e inspecionar furos internos e encaixes.",
      exportSuiteTitle: "Exportar para Impressora 3D / CAD",
      aiCopilotTitle: "🤖 Copiloto Paramétrico (PT / EN)",
      btnGenerateAi: "Gerar / Modificar Peça 3D",
      aiExamplesLbl: "Clique em um exemplo para testar na hora:",
      btnApplyMcp: "Aplicar JSON MCP",
      btnSyncMcp: "Sincronizar",
      ecoModalTitle: "Aplicativos, suporte e comunidade — 4u-Labs",
      ecoModalDesc:
        "O 3DCad Studio faz parte do ecossistema gratuito e privado da 4u-Labs. Modele peças técnicas 3D direto no navegador, sem anúncios e sem limites de exportação.",
      supportProject: "Apoiar o projeto (PayPal)",
    },
    en: {
      subtitle: "Parametric 3D CAD & 3D Printing · 4u-Labs",
      wsModel: "3D Model",
      wsSketch: "2D Sketch",
      wsMech: "Gears & Parts",
      wsPrint: "3D Print",
      wsAi: "🤖 AI Copilot (MCP)",
      undo: "Undo",
      redo: "Redo",
      importBtn: "Import STL/JSON",
      exportStl: "Export .STL",
      rbSketch: "2D Sketch",
      grpSketch: "Sketch",
      rbBox: "Box",
      rbCyl: "Cylinder/Tube",
      rbSphere: "Sphere",
      rbCone: "Cone",
      rbTorus: "O-Ring/Torus",
      grpPrimitives: "Parametric Primitives",
      rbGear: "Spur Gear",
      rbBracket: "L-Bracket",
      rbEnclosure: "PCB Box",
      rbPlate: "Mount Plate",
      rbBolt: "Hex Bolt/Nut",
      rbPulley: "Pulley",
      rbPillow: "608 Bearing",
      rbSnapLid: "Snap-Fit Lid",
      grpMechanical: "Mechanical Generators",
      rbUnion: "Union (CSG)",
      rbSubtract: "Subtract/Cut",
      rbIntersect: "Intersect",
      rbHole: "M4/M6 Hole",
      grpBoolean: "Boolean (CSG)",
      rbLinPat: "Linear Array",
      rbCircPat: "Circular Array",
      rbMirror: "Mirror",
      rbDuplicate: "Duplicate",
      grpPattern: "Pattern & Copy",
      grpExport: "CAD Formats",
      browserTitle: "Project Browser",
      clearBtn: "Clear",
      bodiesHeader: "Bodies & Features",
      viewsHeader: "Named Views",
      vTop: "Top (Z)",
      vFront: "Front (Y)",
      vRight: "Right (X)",
      vLeft: "Left",
      vBack: "Back",
      demosHeader: "1-Click Demo Projects",
      demoRover: "Space Rover (SolidCraft)",
      demoGearbox: "Spur Gear Reduction",
      demoEnclosure: "IoT Electronics Box",
      demoBracket: "L-Bracket + GT2 Pulley",
      selLabel: "Part:",
      vcTop: "TOP",
      vcFront: "FRONT",
      vcRight: "RIGHT",
      hudDrag: "Move Part",
      hudFit: "Zoom Fit",
      hudDrop: "Bed Z=0",
      hudCenter: "Center",
      hudShadedEdges: "Shaded + Edges",
      hudWire: "Wireframe",
      hudXray: "X-Ray",
      hudMeasure: "3D Caliper",
      skTitle: "✏️ 2D Sketch on XY Plane (mm):",
      skRect: "Rectangle",
      skCircle: "Circle",
      skSlot: "Slot",
      skHex: "Hexagon",
      skHole: "Circle Hole",
      skClear: "Clear",
      skHeightLbl: "Extrude Z (mm):",
      skExtrudeBtn: "Extrude to 3D",
      skCancel: "Close",
      tlReplay: "Replay Timeline",
      bedInfo: "Build Plate: 220 × 220 mm · Units: millimeters (mm)",
      tabParams: "🔧 Parameters",
      tabPrint: "🖨️ 3D Print",
      tabAi: "🤖 AI & MCP",
      selectedPartTitle: "Selected Body",
      lblPartName: "Body Name",
      transformTitle: "Position (mm) & Rotation (°)",
      layFlatBtn: "Lay Flat on Bed (Z = 0 mm)",
      materialColorTitle: "Color & Finish",
      csgCardTitle: "Boolean Operation (CSG)",
      csgSecondSolid: "2nd Solid (Tool):",
      btnUnion: "Union",
      btnSub: "Cut",
      btnInt: "Intersect",
      deletePart: "Delete Body",
      printMetricsTitle: "3D Printing Physical Metrics",
      mWeight: "Estimated Weight",
      mTime: "Est. Print Time",
      mVolume: "Solid Volume",
      mFilament: "Filament (1.75mm)",
      mCost: "Material Cost",
      mTriangles: "Mesh Triangles",
      slicerCfgTitle: "Slicer Parameters",
      lblMaterial: "Material",
      lblInfill: "Infill Density (%)",
      lblLayerH: "Layer Height",
      lblSpoolPrice: "Spool Price / kg",
      slicePreviewTitle: "Internal Layer Slicer (Z-Cut)",
      sliceHint: "Drag to slice the model horizontally and inspect internal bores & walls.",
      exportSuiteTitle: "Export to 3D Printer / CAD",
      aiCopilotTitle: "🤖 Parametric Copilot (PT / EN)",
      btnGenerateAi: "Generate / Modify 3D Part",
      aiExamplesLbl: "Click an example to test right away:",
      btnApplyMcp: "Apply MCP JSON",
      btnSyncMcp: "Sync Scene",
      ecoModalTitle: "Apps, support and community — 4u-Labs",
      ecoModalDesc:
        "3DCad Studio is part of the free, privacy-first 4u-Labs ecosystem. Model parametric 3D parts directly in your browser with no ads and no export limits.",
      supportProject: "Support the project (PayPal)",
    },
  };

  let lang = localStorage.getItem("3dcad_lang") || "pt";
  if (!["pt", "en"].includes(lang)) lang = "pt";
  const L = (pt, en) => (lang === "pt" ? pt : en);

  function showToast(msg) {
    const t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("visible");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => t.classList.remove("visible"), 3400);
  }

  // === THREE.JS SCENE & STATE ===
  const canvas = $("#cad3dCanvas");
  const viewport = $("#centerViewport");
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x161b24);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 4000);
  camera.position.set(130, 115, 145);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.localClippingEnabled = true;

  // Clipping plane for 3D Print Layer Slicer (cuts down along Y, which is CAD Z height)
  const slicePlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1000);

  const controls = new THREE.OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.screenSpacePanning = true;
  controls.target.set(0, 22, 0);

  // Studio Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.68));
  const mainLight = new THREE.DirectionalLight(0xffffff, 0.78);
  mainLight.position.set(140, 240, 160);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = 2048;
  mainLight.shadow.mapSize.height = 2048;
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0x7dd3fc, 0.35);
  fillLight.position.set(-150, 90, -120);
  scene.add(fillLight);

  // 220 x 220 mm Build Plate & Millimeter Grid
  const buildPlateGroup = new THREE.Group();
  const plateGeom = new THREE.PlaneGeometry(220, 220);
  plateGeom.rotateX(-Math.PI / 2);
  const plateMat = new THREE.MeshStandardMaterial({
    color: 0x111621,
    roughness: 0.85,
    metalness: 0.1,
    transparent: true,
    opacity: 0.75,
  });
  const plateMesh = new THREE.Mesh(plateGeom, plateMat);
  plateMesh.receiveShadow = true;
  plateMesh.position.y = -0.05;
  buildPlateGroup.add(plateMesh);

  const gridMajor = new THREE.GridHelper(220, 22, 0x38bdf8, 0x263248);
  gridMajor.position.y = 0;
  buildPlateGroup.add(gridMajor);

  const axesHelper = new THREE.AxesHelper(45);
  axesHelper.position.set(-110, 0.1, -110);
  buildPlateGroup.add(axesHelper);
  scene.add(buildPlateGroup);

  // Measurement 3D Overlay Group
  const measureGroup = new THREE.Group();
  scene.add(measureGroup);

  // Application State
  let solids = [];
  let selectedSolid = null;
  let visualStyle = "shaded-edges";
  let idCounter = 1;
  let timelineStep = 0;
  let measureMode = false;
  let measurePoints = [];
  let undoStack = [];
  let redoStack = [];

  const DEFAULT_PARAMS = {
    BOX: { width: 40, depth: 30, height: 20, cornerRadius: 2, boreDiameter: 0 },
    CYLINDER: { diameter: 30, innerDiameter: 14, height: 28, segments: 48 },
    SPHERE: { diameter: 32, segments: 36 },
    CONE: { bottomDiameter: 34, topDiameter: 0, height: 30 },
    TORUS: { majorDiameter: 38, tubeDiameter: 8 },
    SPUR_GEAR: { module: 2, teeth: 24, thickness: 8, boreDiameter: 8, pressureAngle: 20 },
    L_BRACKET: { armA: 55, armB: 45, width: 30, thickness: 5, holeDiameter: 4.2, gusset: 1 },
    ENCLOSURE: { width: 85, depth: 58, height: 32, wallThickness: 2.5, standoffHeight: 6, screwHole: 2.8 },
    MOUNTING_PLATE: { width: 85, depth: 65, thickness: 5, cornerRadius: 6, holeDiameter: 4.2, centerBore: 12 },
    HEX_BOLT: { metricDia: 6, shaftLength: 22, headWidth: 10, headHeight: 4.2, nutBore: 0 },
    PULLEY: { outerDiameter: 40, grooveDiameter: 30, boreDiameter: 8, height: 14 },
    PILLOW_BLOCK: { bearingBore: 22.2, outerRingDia: 34, baseWidth: 68, thickness: 14, baseHeight: 6, mountHoleDia: 4.4 },
    SNAP_LID_BOX: { width: 85, depth: 58, topThickness: 3, lipHeight: 4, wallThickness: 2.5, clearance: 0.3, ventSlots: 1 },
  };

  const DEFAULT_COLORS = {
    BOX: "#3b82f6",
    CYLINDER: "#10b981",
    SPHERE: "#eab308",
    CONE: "#ec4899",
    TORUS: "#8b5cf6",
    SPUR_GEAR: "#f97316",
    L_BRACKET: "#38bdf8",
    ENCLOSURE: "#3b82f6",
    MOUNTING_PLATE: "#10b981",
    HEX_BOLT: "#94a3b8",
    PULLEY: "#f97316",
    PILLOW_BLOCK: "#10b981",
    SNAP_LID_BOX: "#8b5cf6",
    SKETCH_EXTRUDE: "#f97316",
  };

  // === SOLID CREATION & CAD EDGES HELPER ===
  function attachCadEdges(mesh) {
    // Remove previous edges child if present
    const oldEdges = mesh.children.find((c) => c.userData?.isCadEdge);
    if (oldEdges) {
      mesh.remove(oldEdges);
      oldEdges.geometry?.dispose();
      oldEdges.material?.dispose();
    }
    try {
      const edgeGeom = new THREE.EdgesGeometry(mesh.geometry, 24);
      const edgeMat = new THREE.LineBasicMaterial({
        color: 0x0b0e14,
        transparent: true,
        opacity: 0.72,
        clippingPlanes: [slicePlane],
      });
      const lines = new THREE.LineSegments(edgeGeom, edgeMat);
      lines.userData = { isCadEdge: true };
      lines.visible = visualStyle === "shaded-edges";
      mesh.add(lines);
    } catch {}
  }

  function applyVisualStyleToMesh(mesh) {
    if (!mesh || !mesh.material) return;
    mesh.material.clippingPlanes = [slicePlane];
    mesh.material.clipShadows = true;
    mesh.material.side = THREE.DoubleSide;
    if (visualStyle === "wireframe") {
      mesh.material.wireframe = true;
      mesh.material.transparent = false;
      mesh.material.opacity = 1;
    } else if (visualStyle === "xray") {
      mesh.material.wireframe = false;
      mesh.material.transparent = true;
      mesh.material.opacity = 0.45;
    } else {
      mesh.material.wireframe = false;
      mesh.material.transparent = false;
      mesh.material.opacity = 1;
    }
    mesh.material.needsUpdate = true;
    const edgeChild = mesh.children.find((c) => c.userData?.isCadEdge);
    if (edgeChild) edgeChild.visible = visualStyle === "shaded-edges";
  }

  function createParametricSolid(type, customOpts = {}) {
    const params = {
      ...(DEFAULT_PARAMS[type] || {}),
      ...(customOpts.params || {}),
    };
    const geom = CadGenerators.buildParametricGeometry(type, params);
    geom.computeBoundingBox();
    const bbox = geom.boundingBox;
    const h = bbox ? bbox.max.y - bbox.min.y : 20;

    const color = customOpts.color || DEFAULT_COLORS[type] || "#f97316";
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.36,
      metalness: 0.18,
      clippingPlanes: [slicePlane],
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const uid = customOpts.id || `solid_${idCounter++}`;
    const name = customOpts.name || `${type}_${solids.length + 1}`;

    if (Array.isArray(customOpts.pos)) {
      mesh.position.set(customOpts.pos[0], customOpts.pos[1], customOpts.pos[2]);
    } else {
      // Place on Z=0 build plate (Three.js Y = h/2) with small offset if overlapping
      const offset = (solids.length % 5) * 6 - 12;
      mesh.position.set(solids.length ? offset : 0, h / 2, 0);
    }

    if (Array.isArray(customOpts.rot)) {
      mesh.rotation.set(
        THREE.MathUtils.degToRad(customOpts.rot[0] || 0),
        THREE.MathUtils.degToRad(customOpts.rot[1] || 0),
        THREE.MathUtils.degToRad(customOpts.rot[2] || 0)
      );
    }

    mesh.userData = {
      id: uid,
      type,
      name,
      color,
      params,
      isParametric: true,
    };

    attachCadEdges(mesh);
    applyVisualStyleToMesh(mesh);
    scene.add(mesh);
    solids.push(mesh);
    timelineStep = solids.length;
    selectSolid(mesh);
    refreshAllUI();
    return mesh;
  }

  function rebuildSolidGeometry(mesh) {
    if (!mesh || !mesh.userData?.isParametric) return;
    const prevBox = new THREE.Box3().setFromObject(mesh);
    const wasOnBed = Math.abs(prevBox.min.y) < 0.5;

    const newGeom = CadGenerators.buildParametricGeometry(
      mesh.userData.type,
      mesh.userData.params
    );
    mesh.geometry.dispose();
    mesh.geometry = newGeom;
    attachCadEdges(mesh);

    if (wasOnBed) {
      newGeom.computeBoundingBox();
      const h = newGeom.boundingBox.max.y - newGeom.boundingBox.min.y;
      mesh.position.y = h / 2;
      if ($("#posZ")) $("#posZ").value = Number(mesh.position.y.toFixed(1));
    }
    updateTelemetryAndPrintMetrics();
    syncMcpConsole();
  }

  // === UNDO / REDO SNAPSHOTS ===
  function serializeSceneState() {
    return solids
      .filter((s) => s.userData?.isParametric)
      .map((s) => ({
        id: s.userData.id,
        type: s.userData.type,
        name: s.userData.name,
        color: s.userData.color,
        params: JSON.parse(JSON.stringify(s.userData.params || {})),
        pos: [
          Number(s.position.x.toFixed(2)),
          Number(s.position.y.toFixed(2)),
          Number(s.position.z.toFixed(2)),
        ],
        rot: [
          Number(THREE.MathUtils.radToDeg(s.rotation.x).toFixed(1)),
          Number(THREE.MathUtils.radToDeg(s.rotation.y).toFixed(1)),
          Number(THREE.MathUtils.radToDeg(s.rotation.z).toFixed(1)),
        ],
      }));
  }

  function pushUndoSnapshot() {
    undoStack.push(JSON.stringify(serializeSceneState()));
    if (undoStack.length > 30) undoStack.shift();
    redoStack = [];
  }

  function restoreSceneFromItems(items) {
    clearAllSolids(false);
    for (const item of items) {
      createParametricSolid(item.type, item);
    }
    refreshAllUI();
  }

  function undo() {
    if (!undoStack.length) {
      showToast(L("Nada para desfazer.", "Nothing to undo."));
      return;
    }
    redoStack.push(JSON.stringify(serializeSceneState()));
    const prev = JSON.parse(undoStack.pop());
    restoreSceneFromItems(prev);
    showToast(L("Desfeito (Ctrl+Z)", "Undone (Ctrl+Z)"));
  }

  function redo() {
    if (!redoStack.length) {
      showToast(L("Nada para refazer.", "Nothing to redo."));
      return;
    }
    undoStack.push(JSON.stringify(serializeSceneState()));
    const next = JSON.parse(redoStack.pop());
    restoreSceneFromItems(next);
    showToast(L("Refeito (Ctrl+Y)", "Redone (Ctrl+Y)"));
  }

  // === SELECTION & INSPECTOR ===
  function selectSolid(mesh) {
    if (selectedSolid && selectedSolid.material) {
      selectedSolid.material.emissive = new THREE.Color(0x000000);
      selectedSolid.material.emissiveIntensity = 0;
    }
    selectedSolid = mesh || null;
    if (selectedSolid && selectedSolid.material) {
      selectedSolid.material.emissive = new THREE.Color(0x38bdf8);
      selectedSolid.material.emissiveIntensity = 0.22;
    }
    renderFeatureTree();
    renderInspectorFields();
    updateTelemetryAndPrintMetrics();
  }

  function removeSolid(mesh) {
    if (!mesh) return;
    const idx = solids.indexOf(mesh);
    if (idx !== -1) solids.splice(idx, 1);
    scene.remove(mesh);
    mesh.geometry?.dispose();
    mesh.material?.dispose();
    if (selectedSolid === mesh) {
      selectedSolid = solids.at(-1) || null;
      if (selectedSolid) selectSolid(selectedSolid);
    }
    timelineStep = solids.length;
    refreshAllUI();
  }

  function clearAllSolids(recordUndo = true) {
    if (recordUndo && solids.length) pushUndoSnapshot();
    while (solids.length > 0) {
      const m = solids.pop();
      scene.remove(m);
      m.geometry?.dispose();
      m.material?.dispose();
    }
    selectedSolid = null;
    timelineStep = 0;
    refreshAllUI();
  }

  // === FEATURE TREE & TIMELINE SCRUBBER ===
  function renderFeatureTree() {
    const listEl = $("#featureTree");
    const countBadge = $("#bodiesCountBadge");
    if (!listEl) return;
    countBadge.textContent = String(solids.length);
    listEl.innerHTML = "";

    solids.forEach((mesh, idx) => {
      const li = document.createElement("li");
      li.className = "tree-item" + (mesh === selectedSolid ? " selected" : "");
      const visibleIcon = mesh.visible ? "👁" : "🚫";
      li.innerHTML = `
        <div class="tree-item-left">
          <span class="color-dot" style="background:${mesh.userData.color || "#f97316"}"></span>
          <span class="tree-name">${mesh.userData.name || `Solid_${idx + 1}`}</span>
          <span class="tree-type-tag">${mesh.userData.type}</span>
        </div>
        <div class="tree-actions">
          <button type="button" class="tree-act-btn" data-toggle-vis="${idx}" title="Mostrar/Ocultar">${visibleIcon}</button>
          <button type="button" class="tree-act-btn" data-del-idx="${idx}" title="Excluir">×</button>
        </div>
      `;
      li.addEventListener("click", (e) => {
        const visBtn = e.target.closest("[data-toggle-vis]");
        const delBtn = e.target.closest("[data-del-idx]");
        if (visBtn) {
          e.stopPropagation();
          mesh.visible = !mesh.visible;
          renderFeatureTree();
          updateTelemetryAndPrintMetrics();
          return;
        }
        if (delBtn) {
          e.stopPropagation();
          pushUndoSnapshot();
          removeSolid(mesh);
          return;
        }
        selectSolid(mesh);
      });
      listEl.appendChild(li);
    });

    // Populate 2nd solid selector for CSG Boolean operations
    const csgSel = $("#csgTargetSelect");
    if (csgSel) {
      const others = solids.filter((s) => s !== selectedSolid);
      csgSel.innerHTML = others.length
        ? others
            .map(
              (s, i) =>
                `<option value="${s.userData.id}" ${i === others.length - 1 ? "selected" : ""}>${s.userData.name} (${s.userData.type})</option>`
            )
            .join("")
        : `<option value="">— ${L("Adicione 2+ sólidos", "Add 2+ solids")} —</option>`;
    }

    const tlLbl = $("#tlStepLabel");
    if (tlLbl) {
      tlLbl.textContent = `${timelineStep} / ${solids.length}`;
    }
  }

  function renderInspectorFields() {
    const nameInput = $("#inspNameInput");
    const typeBadge = $("#inspTypeBadge");
    const dynWrap = $("#dynamicParamFields");
    if (!dynWrap) return;

    if (!selectedSolid) {
      nameInput.value = "";
      typeBadge.textContent = "—";
      dynWrap.innerHTML = `<small style="color:var(--text-muted)">${L(
        "Selecione ou crie uma peça para editar seus parâmetros em tempo real.",
        "Select or create a part to edit its parameters in real time."
      )}</small>`;
      return;
    }

    const ud = selectedSolid.userData;
    nameInput.value = ud.name || "";
    typeBadge.textContent = ud.type || "SOLID";

    // Transform inputs: map Three.js (x, y_up, z_depth) -> CAD (X, Y_depth, Z_height)
    $("#posX").value = Number(selectedSolid.position.x.toFixed(1));
    $("#posY").value = Number(selectedSolid.position.z.toFixed(1));
    $("#posZ").value = Number(selectedSolid.position.y.toFixed(1));
    $("#rotX").value = Math.round(THREE.MathUtils.radToDeg(selectedSolid.rotation.x));
    $("#rotY").value = Math.round(THREE.MathUtils.radToDeg(selectedSolid.rotation.z));
    $("#rotZ").value = Math.round(THREE.MathUtils.radToDeg(selectedSolid.rotation.y));

    $$("#colorSwatches .color-swatch").forEach((sw) => {
      sw.classList.toggle(
        "active",
        sw.dataset.color?.toLowerCase() === (ud.color || "").toLowerCase()
      );
    });

    const schema = CadGenerators.PARAM_SCHEMA[ud.type] || [];
    dynWrap.innerHTML = "";

    if (!ud.isParametric || schema.length === 0) {
      dynWrap.innerHTML = `<small style="color:var(--text-muted)">${L(
        "Malha combinada (CSG/STL). Use Posição, Rotação ou Operações Booleanas abaixo.",
        "Combined mesh (CSG/STL). Use Position, Rotation or Boolean tools below."
      )}</small>`;
      return;
    }

    for (const field of schema) {
      const row = document.createElement("div");
      row.className = "field-row";
      const lbl = document.createElement("label");
      lbl.textContent = lang === "pt" ? field.pt : field.en;
      const inp = document.createElement("input");
      inp.type = "number";
      inp.className = "num-input";
      inp.min = field.min;
      inp.max = field.max;
      inp.step = field.step || 1;
      inp.value = ud.params?.[field.key] ?? field.min;
      inp.addEventListener("input", () => {
        const val = Number(inp.value);
        if (!Number.isFinite(val)) return;
        ud.params[field.key] = val;
        rebuildSolidGeometry(selectedSolid);
      });
      row.append(lbl, inp);
      dynWrap.appendChild(row);
    }
  }

  // === TELEMETRY & 3D PRINT METRICS ===
  function updateTelemetryAndPrintMetrics() {
    const targetMeshes = selectedSolid ? [selectedSolid] : solids;
    const printSettings = {
      material: $("#printMaterial")?.value || "PLA",
      infill: Number($("#printInfill")?.value || 20),
      layerHeight: Number($("#printLayerH")?.value || 0.2),
      spoolPrice: Number($("#printSpoolPrice")?.value || 110),
    };

    const metrics = CadGenerators.analyzeMeshFor3DPrint(targetMeshes, printSettings);

    $("#hudSelectedName").textContent = selectedSolid
      ? selectedSolid.userData.name
      : L(`Cena (${solids.length})`, `Scene (${solids.length})`);
    $("#hudSelectedDims").textContent = `${metrics.sizeMm.x} × ${metrics.sizeMm.y} × ${metrics.sizeMm.z} mm`;

    $("#mWeightVal").textContent = `${metrics.weightGrams} g`;
    $("#mTimeVal").textContent = metrics.timeFormatted;
    $("#mVolVal").textContent = `${metrics.volumeCm3} cm³`;
    $("#mLenVal").textContent = `${metrics.filamentMeters} m`;
    $("#mCostVal").textContent = `R$ ${metrics.costBrl.toFixed(2).replace(".", ",")}`;
    $("#mTriVal").textContent = metrics.triangles.toLocaleString("pt-BR");

    const fitBadge = $("#bedFitBadge");
    if (fitBadge) {
      fitBadge.textContent = metrics.fitsBed220 ? "✓ 220×220 mm" : "⚠ > 220 mm";
      fitBadge.style.color = metrics.fitsBed220 ? "#4ade80" : "#f87171";
    }
  }

  let isBooting = true;
  function saveAutoSave() {
    if (isBooting) return;
    try {
      const state = serializeSceneState();
      localStorage.setItem("3dcad_autosave_v1", JSON.stringify(state));
      const badge = $("#autoSaveBadge");
      if (badge) {
        badge.textContent = L("💾 Salvo", "💾 Saved");
        badge.style.color = "#4ade80";
      }
    } catch {}
  }

  function syncMcpConsole() {
    const mcpEl = $("#mcpJsonConsole");
    if (!mcpEl) return;
    const payload = {
      protocol: "3dcad-mcp/1.0",
      units: "mm",
      solids: serializeSceneState(),
    };
    mcpEl.value = JSON.stringify(payload, null, 2);
    saveAutoSave();
  }

  function refreshAllUI() {
    renderFeatureTree();
    renderInspectorFields();
    updateTelemetryAndPrintMetrics();
    syncMcpConsole();
  }

  // === CSG BOOLEAN OPERATIONS & QUICK HOLE ===
  function runBooleanOp(opType) {
    if (typeof CSG === "undefined") {
      showToast(L("Módulo CSG não carregado.", "CSG module not loaded."));
      return;
    }
    if (solids.length < 2) {
      showToast(
        L(
          "Adicione pelo menos 2 sólidos para usar União / Subtração (CSG).",
          "Add at least 2 solids to run Boolean Union / Subtract."
        )
      );
      return;
    }
    const baseMesh = selectedSolid || solids[0];
    const targetId = $("#csgTargetSelect")?.value;
    const toolMesh =
      solids.find((s) => s.userData.id === targetId && s !== baseMesh) ||
      solids.find((s) => s !== baseMesh);
    if (!baseMesh || !toolMesh) return;

    try {
      pushUndoSnapshot();
      baseMesh.updateMatrix();
      toolMesh.updateMatrix();
      const csgA = CSG.fromMesh(baseMesh);
      const csgB = CSG.fromMesh(toolMesh);
      const outCsg =
        opType === "union"
          ? csgA.union(csgB)
          : opType === "intersect"
          ? csgA.intersect(csgB)
          : csgA.subtract(csgB);

      const newMat = baseMesh.material.clone();
      const resMesh = CSG.toMesh(outCsg, baseMesh.matrix, newMat);
      resMesh.castShadow = true;
      resMesh.receiveShadow = true;
      resMesh.userData = {
        id: `csg_${idCounter++}`,
        type: "CSG_SOLID",
        name: `${baseMesh.userData.name}_${opType}`,
        color: baseMesh.userData.color || "#f97316",
        params: {},
        isParametric: false,
      };
      attachCadEdges(resMesh);
      applyVisualStyleToMesh(resMesh);

      removeSolid(baseMesh);
      removeSolid(toolMesh);
      scene.add(resMesh);
      solids.push(resMesh);
      timelineStep = solids.length;
      selectSolid(resMesh);
      refreshAllUI();
      showToast(
        L(
          `Operação booleana (${opType.toUpperCase()}) concluída!`,
          `Boolean ${opType.toUpperCase()} completed!`
        )
      );
    } catch (e) {
      showToast(e.message);
    }
  }

  function drillQuickHoleOnSelected(holeDia = 4.2) {
    const target = selectedSolid || solids.at(-1);
    if (!target || typeof CSG === "undefined") {
      showToast(L("Selecione uma peça primeiro.", "Select a part first."));
      return;
    }
    pushUndoSnapshot();
    const box = new THREE.Box3().setFromObject(target);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const drillGeom = new THREE.CylinderGeometry(
      holeDia / 2,
      holeDia / 2,
      Math.max(size.y * 2.5, 100),
      32
    );
    const drillMesh = new THREE.Mesh(drillGeom, target.material.clone());
    drillMesh.position.copy(center);
    drillMesh.updateMatrix();
    target.updateMatrix();

    const outCsg = CSG.fromMesh(target).subtract(CSG.fromMesh(drillMesh));
    const resMesh = CSG.toMesh(outCsg, target.matrix, target.material.clone());
    resMesh.castShadow = true;
    resMesh.receiveShadow = true;
    resMesh.userData = {
      ...target.userData,
      id: `csg_${idCounter++}`,
      type: "CSG_SOLID",
      name: `${target.userData.name}_FuroM${Math.round(holeDia)}`,
      isParametric: false,
    };
    attachCadEdges(resMesh);
    applyVisualStyleToMesh(resMesh);
    removeSolid(target);
    scene.add(resMesh);
    solids.push(resMesh);
    selectSolid(resMesh);
    refreshAllUI();
    showToast(
      L(
        `Furo passante Ø${holeDia}mm aplicado na peça!`,
        `Drilled Ø${holeDia}mm through-hole!`
      )
    );
  }

  // === PATTERNS, MIRROR & DUPLICATE ===
  function cloneSolidMesh(src, offsetVec) {
    const geom = src.geometry.clone();
    const mat = src.material.clone();
    const copy = new THREE.Mesh(geom, mat);
    copy.position.copy(src.position).add(offsetVec);
    copy.rotation.copy(src.rotation);
    copy.scale.copy(src.scale);
    copy.castShadow = true;
    copy.receiveShadow = true;
    copy.userData = {
      ...JSON.parse(JSON.stringify(src.userData)),
      id: `solid_${idCounter++}`,
      name: `${src.userData.name}_Copy`,
    };
    attachCadEdges(copy);
    applyVisualStyleToMesh(copy);
    scene.add(copy);
    solids.push(copy);
    timelineStep = solids.length;
    return copy;
  }

  // === CAMERA VIEWS & ZOOM FIT ===
  function setStandardView(view) {
    const target = controls.target.clone();
    const d = 145;
    switch (view) {
      case "top":
        camera.position.set(target.x, target.y + d * 1.2, target.z + 0.01);
        break;
      case "front":
        camera.position.set(target.x, target.y + 10, target.z + d);
        break;
      case "back":
        camera.position.set(target.x, target.y + 10, target.z - d);
        break;
      case "right":
        camera.position.set(target.x + d, target.y + 10, target.z);
        break;
      case "left":
        camera.position.set(target.x - d, target.y + 10, target.z);
        break;
      default:
        camera.position.set(target.x + d * 0.78, target.y + d * 0.72, target.z + d * 0.85);
        break;
    }
    controls.update();
  }

  function zoomFitScene() {
    const box = new THREE.Box3();
    for (const s of solids) {
      if (s.visible) box.expandByObject(s);
    }
    if (box.isEmpty()) {
      controls.target.set(0, 15, 0);
      camera.position.set(120, 100, 130);
      controls.update();
      return;
    }
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z, 30);
    controls.target.copy(center);
    camera.position.set(
      center.x + maxDim * 1.35,
      center.y + maxDim * 1.15,
      center.z + maxDim * 1.45
    );
    controls.update();
  }

  // === RAYCASTING SELECTION, 3D PART DRAGGING & 3D CALIPER MEASUREMENT ===
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let pointerDownPos = { x: 0, y: 0 };
  let dragMode = false;
  let draggingSolid = null;
  const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const dragIntersect = new THREE.Vector3();
  const dragOffset = new THREE.Vector3();

  function updateMouseRay(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
  }

  canvas.addEventListener("pointerdown", (e) => {
    pointerDownPos = { x: e.clientX, y: e.clientY };
    if (e.button !== 0 || measureMode) return;
    if (dragMode || e.shiftKey) {
      updateMouseRay(e);
      const visibleSolids = solids.filter((s) => s.visible);
      const hits = raycaster.intersectObjects(visibleSolids, false);
      if (hits.length > 0) {
        pushUndoSnapshot();
        draggingSolid = hits[0].object;
        selectSolid(draggingSolid);
        dragPlane.setFromNormalAndCoplanarPoint(
          new THREE.Vector3(0, 1, 0),
          draggingSolid.position
        );
        if (raycaster.ray.intersectPlane(dragPlane, dragIntersect)) {
          dragOffset.subVectors(draggingSolid.position, dragIntersect);
        }
        controls.enabled = false;
        canvas.style.cursor = "grabbing";
      }
    }
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!draggingSolid) return;
    updateMouseRay(e);
    if (raycaster.ray.intersectPlane(dragPlane, dragIntersect)) {
      const nx = Math.round(dragIntersect.x + dragOffset.x);
      const nz = Math.round(dragIntersect.z + dragOffset.z);
      draggingSolid.position.x = Math.max(-105, Math.min(105, nx));
      draggingSolid.position.z = Math.max(-105, Math.min(105, nz));
      if ($("#posX")) $("#posX").value = draggingSolid.position.x;
      if ($("#posY")) $("#posY").value = draggingSolid.position.z;
      updateTelemetryAndPrintMetrics();
    }
  });

  window.addEventListener("pointerup", () => {
    if (draggingSolid) {
      draggingSolid = null;
      controls.enabled = true;
      canvas.style.cursor = dragMode ? "move" : "default";
      syncMcpConsole();
    }
  });

  canvas.addEventListener("pointerup", (e) => {
    if (e.button !== 0) return;
    if (Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y) > 5) return;

    updateMouseRay(e);
    const visibleSolids = solids.filter((s) => s.visible);
    const hits = raycaster.intersectObjects(visibleSolids, false);

    if (measureMode && hits.length > 0) {
      const pt = hits[0].point.clone();
      measurePoints.push(pt);
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(1.4, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      dot.position.copy(pt);
      measureGroup.add(dot);

      if (measurePoints.length === 2) {
        const [p1, p2] = measurePoints;
        const dist = p1.distanceTo(p2);
        const lineGeom = new THREE.BufferGeometry().setFromPoints([p1, p2]);
        const line = new THREE.Line(
          lineGeom,
          new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 })
        );
        measureGroup.add(line);
        $("#telemetryMeasure").hidden = false;
        $("#hudMeasureVal").textContent = `${dist.toFixed(2)} mm (ΔX:${Math.abs(
          p2.x - p1.x
        ).toFixed(1)} ΔY:${Math.abs(p2.z - p1.z).toFixed(1)} ΔZ:${Math.abs(
          p2.y - p1.y
        ).toFixed(1)})`;
        showToast(L(`Distância medida: ${dist.toFixed(2)} mm`, `Measured: ${dist.toFixed(2)} mm`));
        measurePoints = [];
      } else {
        showToast(
          L("1º ponto marcado. Clique no 2º ponto da peça.", "1st point set. Click 2nd point.")
        );
      }
      return;
    }

    if (hits.length > 0) {
      selectSolid(hits[0].object);
    }
  });

  // === INTERACTIVE 2D SKETCHER OVERLAY ===
  const sketchOverlay = $("#sketchOverlay");
  const skCanvas = $("#sketch2dCanvas");
  const skCtx = skCanvas.getContext("2d");
  let skTool = "rect";
  let skEntities = [];
  let skDragStart = null;
  let skCurrentMouse = null;
  const SK_SCALE = 3.2; // pixels per millimeter

  function resizeSketchCanvas() {
    const wrap = skCanvas.parentElement;
    if (!wrap) return;
    skCanvas.width = wrap.clientWidth || 800;
    skCanvas.height = wrap.clientHeight || 500;
    drawSketch2D();
  }

  function screenToSketchMm(px, py) {
    const cx = skCanvas.width / 2;
    const cy = skCanvas.height / 2;
    const snap = (v) => Math.round(v);
    return {
      x: snap((px - cx) / SK_SCALE),
      y: snap((py - cy) / SK_SCALE),
    };
  }

  function mmToSketchScreen(mx, my) {
    return {
      x: skCanvas.width / 2 + mx * SK_SCALE,
      y: skCanvas.height / 2 + my * SK_SCALE,
    };
  }

  function drawSketch2D() {
    if (sketchOverlay.hidden) return;
    const w = skCanvas.width;
    const h = skCanvas.height;
    skCtx.clearRect(0, 0, w, h);
    skCtx.fillStyle = "#0d1118";
    skCtx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;

    // 5mm minor & 20mm major grid
    const step5 = 5 * SK_SCALE;
    skCtx.strokeStyle = "#1a2232";
    skCtx.lineWidth = 1;
    for (let x = cx % step5; x < w; x += step5) {
      skCtx.beginPath();
      skCtx.moveTo(x, 0);
      skCtx.lineTo(x, h);
      skCtx.stroke();
    }
    for (let y = cy % step5; y < h; y += step5) {
      skCtx.beginPath();
      skCtx.moveTo(0, y);
      skCtx.lineTo(w, y);
      skCtx.stroke();
    }

    // X / Y Origin Axes
    skCtx.strokeStyle = "rgba(239,68,68,0.6)";
    skCtx.beginPath();
    skCtx.moveTo(0, cy);
    skCtx.lineTo(w, cy);
    skCtx.stroke();

    skCtx.strokeStyle = "rgba(34,197,94,0.6)";
    skCtx.beginPath();
    skCtx.moveTo(cx, 0);
    skCtx.lineTo(cx, h);
    skCtx.stroke();

    const drawEnt = (ent, isPreview = false) => {
      const p = mmToSketchScreen(ent.x, ent.y);
      skCtx.save();
      skCtx.strokeStyle = ent.isHole ? "#f87171" : isPreview ? "#f97316" : "#38bdf8";
      skCtx.fillStyle = ent.isHole
        ? "rgba(239, 68, 68, 0.16)"
        : "rgba(56, 189, 248, 0.14)";
      skCtx.lineWidth = 2;
      if (ent.isHole) skCtx.setLineDash([5, 4]);

      skCtx.beginPath();
      if (ent.kind === "circle") {
        skCtx.arc(p.x, p.y, ent.r * SK_SCALE, 0, Math.PI * 2);
      } else if (ent.kind === "slot") {
        const rw = ent.w * SK_SCALE;
        const rh = ent.h * SK_SCALE;
        skCtx.roundRect(p.x - rw / 2, p.y - rh / 2, rw, rh, rh / 2);
      } else if (ent.kind === "polygon") {
        const sides = ent.sides || 6;
        const rad = ent.r * SK_SCALE;
        for (let i = 0; i < sides; i++) {
          const a = (i * Math.PI * 2) / sides;
          const vx = p.x + Math.cos(a) * rad;
          const vy = p.y + Math.sin(a) * rad;
          if (i === 0) skCtx.moveTo(vx, vy);
          else skCtx.lineTo(vx, vy);
        }
        skCtx.closePath();
      } else {
        const rw = ent.w * SK_SCALE;
        const rh = ent.h * SK_SCALE;
        skCtx.rect(p.x - rw / 2, p.y - rh / 2, rw, rh);
      }
      skCtx.fill();
      skCtx.stroke();

      // Dimension label
      skCtx.setLineDash([]);
      skCtx.fillStyle = "#f8fafc";
      skCtx.font = "600 11px monospace";
      const label =
        ent.kind === "circle" || ent.kind === "polygon"
          ? `Ø${(ent.r * 2).toFixed(0)} mm`
          : `${ent.w.toFixed(0)} × ${ent.h.toFixed(0)} mm`;
      skCtx.fillText(label, p.x + 6, p.y - 6);
      skCtx.restore();
    };

    for (const ent of skEntities) drawEnt(ent, false);

    if (skDragStart && skCurrentMouse) {
      const preview = buildSketchEntFromDrag(skDragStart, skCurrentMouse);
      if (preview) drawEnt(preview, true);
    }
  }

  function buildSketchEntFromDrag(a, b) {
    const dx = Math.abs(b.x - a.x);
    const dy = Math.abs(b.y - a.y);
    if (dx < 2 && dy < 2) return null;
    if (skTool === "circle" || skTool === "hole") {
      const r = Math.max(2, Math.round(Math.hypot(b.x - a.x, b.y - a.y)));
      return { kind: "circle", x: a.x, y: a.y, r, isHole: skTool === "hole" };
    }
    if (skTool === "hex") {
      const r = Math.max(4, Math.round(Math.hypot(b.x - a.x, b.y - a.y)));
      return { kind: "polygon", sides: 6, x: a.x, y: a.y, r, isHole: false };
    }
    if (skTool === "slot") {
      return {
        kind: "slot",
        x: Math.round((a.x + b.x) / 2),
        y: Math.round((a.y + b.y) / 2),
        w: Math.max(12, dx),
        h: Math.max(6, Math.min(dy, dx * 0.8)),
        isHole: false,
      };
    }
    return {
      kind: "rect",
      x: Math.round((a.x + b.x) / 2),
      y: Math.round((a.y + b.y) / 2),
      w: Math.max(4, dx),
      h: Math.max(4, dy),
      isHole: false,
    };
  }

  skCanvas.addEventListener("pointerdown", (e) => {
    const r = skCanvas.getBoundingClientRect();
    skDragStart = screenToSketchMm(e.clientX - r.left, e.clientY - r.top);
    skCurrentMouse = skDragStart;
    drawSketch2D();
  });

  skCanvas.addEventListener("pointermove", (e) => {
    if (!skDragStart) return;
    const r = skCanvas.getBoundingClientRect();
    skCurrentMouse = screenToSketchMm(e.clientX - r.left, e.clientY - r.top);
    drawSketch2D();
  });

  skCanvas.addEventListener("pointerup", () => {
    if (!skDragStart || !skCurrentMouse) return;
    const ent = buildSketchEntFromDrag(skDragStart, skCurrentMouse);
    if (ent) skEntities.push(ent);
    skDragStart = null;
    skCurrentMouse = null;
    drawSketch2D();
  });

  function openSketch2D() {
    sketchOverlay.hidden = false;
    if (skEntities.length === 0) {
      // Seed with a default 60x40 base plate with 2 holes so user sees an instant example
      skEntities = [
        { kind: "rect", x: 0, y: 0, w: 70, h: 44, isHole: false },
        { kind: "circle", x: -22, y: 0, r: 5, isHole: true },
        { kind: "circle", x: 22, y: 0, r: 5, isHole: true },
      ];
    }
    resizeSketchCanvas();
  }

  // === EXPORT HANDLERS ===
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function exportStl(binary = true) {
    const visible = solids.filter((s) => s.visible);
    if (!visible.length) {
      showToast(L("Nenhuma peça na cena para exportar.", "No parts in scene to export."));
      return;
    }
    const group = new THREE.Group();
    visible.forEach((m) => {
      const clone = new THREE.Mesh(m.geometry.clone());
      clone.position.copy(m.position);
      clone.rotation.copy(m.rotation);
      clone.scale.copy(m.scale);
      clone.updateMatrix();
      group.add(clone);
    });
    const exporter = new THREE.STLExporter();
    const data = exporter.parse(group, { binary });
    const blob = new Blob([data], {
      type: binary ? "application/octet-stream" : "text/plain;charset=utf-8",
    });
    downloadBlob(blob, "modelo_3dcad.stl");
    showToast(L("Arquivo .STL exportado com sucesso!", ".STL file exported!"));
  }

  // === UI EVENT BINDINGS ===
  $$("[data-add-type]").forEach((btn) => {
    btn.addEventListener("click", () => {
      pushUndoSnapshot();
      createParametricSolid(btn.dataset.addType);
      showToast(
        L(
          `Peça ${btn.dataset.addType} adicionada! Ajuste as medidas à direita.`,
          `Added ${btn.dataset.addType}! Adjust dimensions on the right.`
        )
      );
    });
  });

  // Workspace tabs
  $$(".ws-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$(".ws-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const ws = tab.dataset.ws;
      if (ws === "sketch") {
        openSketch2D();
      } else {
        sketchOverlay.hidden = true;
      }
      if (ws === "print") {
        $$(".insp-tab").forEach((b) =>
          b.classList.toggle("active", b.dataset.inspTab === "print")
        );
        $("#paneParams").hidden = true;
        $("#panePrint").hidden = false;
        $("#paneAi").hidden = true;
      } else if (ws === "ai") {
        $$(".insp-tab").forEach((b) =>
          b.classList.toggle("active", b.dataset.inspTab === "ai")
        );
        $("#paneParams").hidden = true;
        $("#panePrint").hidden = true;
        $("#paneAi").hidden = false;
      } else if (ws === "model" || ws === "mech") {
        $$(".insp-tab").forEach((b) =>
          b.classList.toggle("active", b.dataset.inspTab === "params")
        );
        $("#paneParams").hidden = false;
        $("#panePrint").hidden = true;
        $("#paneAi").hidden = true;
      }
    });
  });

  // Inspector right tabs
  $$(".insp-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$(".insp-tab").forEach((b) => b.classList.remove("active"));
      tab.classList.add("active");
      const target = tab.dataset.inspTab;
      $("#paneParams").hidden = target !== "params";
      $("#panePrint").hidden = target !== "print";
      $("#paneAi").hidden = target !== "ai";
      updateTelemetryAndPrintMetrics();
    });
  });

  // Transform & Name Listeners
  $("#inspNameInput")?.addEventListener("input", (e) => {
    if (!selectedSolid) return;
    selectedSolid.userData.name = e.target.value || "Solid";
    renderFeatureTree();
    updateTelemetryAndPrintMetrics();
    syncMcpConsole();
  });

  ["posX", "posY", "posZ", "rotX", "rotY", "rotZ"].forEach((id) => {
    $("#" + id)?.addEventListener("input", () => {
      if (!selectedSolid) return;
      selectedSolid.position.set(
        Number($("#posX").value) || 0,
        Number($("#posZ").value) || 0,
        Number($("#posY").value) || 0
      );
      selectedSolid.rotation.set(
        THREE.MathUtils.degToRad(Number($("#rotX").value) || 0),
        THREE.MathUtils.degToRad(Number($("#rotZ").value) || 0),
        THREE.MathUtils.degToRad(Number($("#rotY").value) || 0)
      );
      updateTelemetryAndPrintMetrics();
      syncMcpConsole();
    });
  });

  $$("#colorSwatches .color-swatch").forEach((sw) => {
    sw.addEventListener("click", () => {
      if (!selectedSolid) return;
      const hex = sw.dataset.color;
      selectedSolid.userData.color = hex;
      selectedSolid.material.color.set(hex);
      renderFeatureTree();
      renderInspectorFields();
      syncMcpConsole();
    });
  });

  // Boolean & Pattern Buttons
  $("#btnCsgUnion").onclick = () => runBooleanOp("union");
  $("#btnCsgSubtract").onclick = () => runBooleanOp("subtract");
  $("#btnCsgIntersect").onclick = () => runBooleanOp("intersect");
  $("#inspCsgUnion").onclick = () => runBooleanOp("union");
  $("#inspCsgSubtract").onclick = () => runBooleanOp("subtract");
  $("#inspCsgIntersect").onclick = () => runBooleanOp("intersect");
  $("#btnDrillQuickHole").onclick = () => drillQuickHoleOnSelected(4.2);

  $("#btnDuplicateSolid").onclick = $("#inspDuplicateBtn").onclick = () => {
    if (!selectedSolid) return;
    pushUndoSnapshot();
    const copy = cloneSolidMesh(selectedSolid, new THREE.Vector3(18, 0, 18));
    selectSolid(copy);
    refreshAllUI();
    showToast(L("Peça duplicada!", "Part duplicated!"));
  };

  $("#inspDeleteBtn").onclick = () => {
    if (!selectedSolid) return;
    pushUndoSnapshot();
    removeSolid(selectedSolid);
  };

  $("#btnLinearPattern").onclick = () => {
    if (!selectedSolid) return;
    pushUndoSnapshot();
    const box = new THREE.Box3().setFromObject(selectedSolid);
    const sz = new THREE.Vector3();
    box.getSize(sz);
    const stepX = Math.max(sz.x + 8, 20);
    cloneSolidMesh(selectedSolid, new THREE.Vector3(stepX, 0, 0));
    const c2 = cloneSolidMesh(selectedSolid, new THREE.Vector3(stepX * 2, 0, 0));
    selectSolid(c2);
    refreshAllUI();
    showToast(L("Padrão Linear (3×) gerado!", "Linear Pattern (3×) created!"));
  };

  $("#btnCircularPattern").onclick = () => {
    if (!selectedSolid) return;
    pushUndoSnapshot();
    const basePos = selectedSolid.position.clone();
    const r = Math.max(32, Math.hypot(basePos.x, basePos.z));
    for (let i = 1; i < 4; i++) {
      const ang = (i * Math.PI) / 2;
      const copy = cloneSolidMesh(selectedSolid, new THREE.Vector3(0, 0, 0));
      copy.position.set(Math.cos(ang) * r, basePos.y, Math.sin(ang) * r);
    }
    refreshAllUI();
    showToast(L("Padrão Circular (4×) gerado!", "Circular Pattern (4×) created!"));
  };

  $("#btnMirrorX").onclick = () => {
    if (!selectedSolid) return;
    pushUndoSnapshot();
    const copy = cloneSolidMesh(selectedSolid, new THREE.Vector3(0, 0, 0));
    copy.position.x = -selectedSolid.position.x || 35;
    copy.scale.x *= -1;
    selectSolid(copy);
    refreshAllUI();
    showToast(L("Espelhamento concluído!", "Mirrored part created!"));
  };

  // Sketch 2D Controls
  $("#btnOpenSketch").onclick = openSketch2D;
  $("#btnCancelSketch").onclick = () => (sketchOverlay.hidden = true);
  $("#btnSketchClear").onclick = () => {
    skEntities = [];
    drawSketch2D();
  };
  $$("[data-sk-tool]").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$("[data-sk-tool]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      skTool = btn.dataset.skTool;
    });
  });
  $("#btnFinishSketch").onclick = () => {
    if (!skEntities.length) {
      showToast(L("Desenhe pelo menos uma forma no esboço.", "Draw at least one shape."));
      return;
    }
    pushUndoSnapshot();
    const h = Math.max(1, Number($("#sketchExtrudeHeight")?.value) || 18);
    createParametricSolid("SKETCH_EXTRUDE", {
      name: `Sketch3D_${solids.length + 1}`,
      color: "#f97316",
      params: { height: h, bevel: 0.4, entities: JSON.parse(JSON.stringify(skEntities)) },
    });
    sketchOverlay.hidden = true;
    showToast(L("Esboço 2D extrudado para 3D!", "2D Sketch extruded to 3D!"));
  };

  // Views & HUD Controls
  $$("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => setStandardView(btn.dataset.view));
  });

  $("#hudDragModeBtn").onclick = () => {
    dragMode = !dragMode;
    $("#hudDragModeBtn").classList.toggle("active", dragMode);
    canvas.style.cursor = dragMode ? "move" : "default";
    showToast(
      dragMode
        ? L(
            "Modo Mover Peça ativo: arraste qualquer peça com o mouse sobre a mesa!",
            "Move Part active: drag any part across the build plate!"
          )
        : L("Modo Rotação de Câmera 3D restaurado.", "3D Camera Orbit mode restored.")
    );
  };

  function dropSelectedToBed() {
    if (!selectedSolid) return;
    selectedSolid.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(selectedSolid);
    selectedSolid.position.y -= box.min.y;
    renderInspectorFields();
    updateTelemetryAndPrintMetrics();
    syncMcpConsole();
    showToast(L("Peça assentada na mesa (Z = 0 mm)!", "Part dropped to build plate (Z = 0 mm)!"));
  }

  function rotateSelected90(axis) {
    if (!selectedSolid) return;
    pushUndoSnapshot();
    const stepRad = Math.PI / 2;
    if (axis === "x") selectedSolid.rotation.x += stepRad;
    else if (axis === "y") selectedSolid.rotation.z += stepRad;
    else if (axis === "z") selectedSolid.rotation.y += stepRad;
    dropSelectedToBed();
  }

  $("#hudZoomFit").onclick = zoomFitScene;
  $("#hudDropBed").onclick = dropSelectedToBed;
  $("#btnLayFlatBed").onclick = dropSelectedToBed;
  $("#btnRotX90").onclick = () => rotateSelected90("x");
  $("#btnRotY90").onclick = () => rotateSelected90("y");
  $("#btnRotZ90").onclick = () => rotateSelected90("z");

  $("#hudCenterBed").onclick = () => {
    if (!selectedSolid) return;
    selectedSolid.position.x = 0;
    selectedSolid.position.z = 0;
    renderInspectorFields();
    updateTelemetryAndPrintMetrics();
    syncMcpConsole();
  };
  $$("[data-style]").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$("[data-style]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      visualStyle = btn.dataset.style;
      solids.forEach((m) => applyVisualStyleToMesh(m));
    });
  });

  $("#hudMeasureBtn").onclick = () => {
    measureMode = !measureMode;
    $("#hudMeasureBtn").classList.toggle("active", measureMode);
    measurePoints = [];
    while (measureGroup.children.length) {
      measureGroup.remove(measureGroup.children[0]);
    }
    if (!measureMode) $("#telemetryMeasure").hidden = true;
    else
      showToast(
        L(
          "Trena 3D ativa: clique em 2 pontos na superfície de qualquer peça.",
          "3D Caliper active: click any 2 points on a part surface."
        )
      );
  };

  $("#hudShotBtn").onclick = () => {
    renderer.render(scene, camera);
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, "3dcad-render.png");
    }, "image/png");
  };

  // 3D Print Slicer Listeners
  ["printMaterial", "printInfill", "printLayerH", "printSpoolPrice"].forEach((id) => {
    $("#" + id)?.addEventListener("input", updateTelemetryAndPrintMetrics);
  });

  $("#sliceZRange")?.addEventListener("input", (e) => {
    const pct = Number(e.target.value);
    $("#slicePctBadge").textContent = `${pct}%`;
    if (pct >= 100) {
      slicePlane.constant = 1000;
      return;
    }
    const box = new THREE.Box3();
    solids.forEach((s) => s.visible && box.expandByObject(s));
    const maxH = Math.max(10, box.max.y || 60);
    slicePlane.constant = (pct / 100) * maxH;
  });

  // Export Suite Buttons
  $("#btnQuickExportStl").onclick = $("#printExportStlBin").onclick = () => exportStl(true);
  $("#btnExport3mf").onclick = $("#printExport3mf").onclick = () => {
    const vis = solids.filter((s) => s.visible);
    if (!vis.length) return showToast(L("Cena vazia.", "Empty scene."));
    downloadBlob(CadGenerators.exportMeshesTo3MF(vis), "modelo_3dcad.3mf");
    showToast(L("Arquivo .3MF (Bambu/Prusa/Orca) exportado!", ".3MF file exported!"));
  };
  $("#btnExportStep").onclick = $("#printExportStep").onclick = () => {
    const vis = solids.filter((s) => s.visible);
    if (!vis.length) return showToast(L("Cena vazia.", "Empty scene."));
    downloadBlob(CadGenerators.exportMeshesToSTEP(vis), "modelo_3dcad.step");
    showToast(L("Arquivo .STEP (ISO-10303-21) exportado!", ".STEP file exported!"));
  };
  $("#btnExportObj").onclick = $("#printExportObj").onclick = () => {
    const vis = solids.filter((s) => s.visible);
    if (!vis.length) return showToast(L("Cena vazia.", "Empty scene."));
    downloadBlob(CadGenerators.exportMeshesToOBJ(vis), "modelo_3dcad.obj");
    showToast(L("Arquivo .OBJ exportado!", ".OBJ file exported!"));
  };
  $("#btnExportJson").onclick = () => {
    const blob = new Blob([$("#mcpJsonConsole").value], {
      type: "application/json;charset=utf-8",
    });
    downloadBlob(blob, "projeto_3dcad.json");
  };

  // File Import (.STL or .JSON)
  $("#fileImportInput")?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.name.toLowerCase().endsWith(".json")) {
      const r = new FileReader();
      r.onload = () => {
        try {
          const parsed = JSON.parse(r.result);
          if (Array.isArray(parsed.solids)) {
            pushUndoSnapshot();
            restoreSceneFromItems(parsed.solids);
            zoomFitScene();
            showToast(L("Projeto paramétrico importado!", "Parametric project imported!"));
          }
        } catch (err) {
          showToast(err.message);
        }
      };
      r.readAsText(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        pushUndoSnapshot();
        const loader = new THREE.STLLoader();
        const geom = loader.parse(reader.result);
        geom.computeVertexNormals();
        geom.center();
        geom.computeBoundingBox();
        const h = geom.boundingBox.max.y - geom.boundingBox.min.y;
        const mat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          roughness: 0.38,
          metalness: 0.15,
          clippingPlanes: [slicePlane],
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(0, h / 2, 0);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = {
          id: `stl_${idCounter++}`,
          type: "STL_IMPORT",
          name: file.name.replace(/\.stl$/i, ""),
          color: "#38bdf8",
          params: {},
          isParametric: false,
        };
        attachCadEdges(mesh);
        applyVisualStyleToMesh(mesh);
        scene.add(mesh);
        solids.push(mesh);
        selectSolid(mesh);
        zoomFitScene();
        refreshAllUI();
        showToast(L(`STL importado: ${file.name}`, `Imported STL: ${file.name}`));
      } catch (err) {
        showToast(err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  });

  // AI Copilot & MCP Console
  function executeAiPrompt(text) {
    const cmd = CadGenerators.parseCadPrompt(text);
    if (!cmd) {
      showToast(L("Digite uma descrição da peça.", "Enter a part description."));
      return;
    }
    if (cmd.action === "DRILL_HOLE") {
      drillQuickHoleOnSelected(cmd.diameter);
      return;
    }
    pushUndoSnapshot();
    createParametricSolid(cmd.type, {
      name: cmd.name,
      color: cmd.color,
      params: cmd.params,
    });
    zoomFitScene();
    showToast(L(`IA criou: ${cmd.name}`, `AI created: ${cmd.name}`));
  }

  $("#btnRunAiPrompt").onclick = () => executeAiPrompt($("#aiPromptInput").value);
  $$("[data-prompt]").forEach((chip) => {
    chip.addEventListener("click", () => {
      $("#aiPromptInput").value = chip.dataset.prompt;
      executeAiPrompt(chip.dataset.prompt);
    });
  });

  $("#btnApplyMcpJson").onclick = () => {
    try {
      const parsed = JSON.parse($("#mcpJsonConsole").value);
      if (!Array.isArray(parsed.solids)) throw new Error("Campo 'solids' ausente no JSON MCP.");
      pushUndoSnapshot();
      restoreSceneFromItems(parsed.solids);
      zoomFitScene();
      showToast(L("Cena reconstruída via MCP JSON!", "Scene rebuilt via MCP JSON!"));
    } catch (e) {
      showToast(e.message);
    }
  };
  $("#btnRefreshMcpJson").onclick = syncMcpConsole;
  $("#btnCopyMcp").onclick = () => {
    navigator.clipboard
      ?.writeText($("#mcpJsonConsole").value)
      .then(() => showToast(L("JSON MCP copiado!", "MCP JSON copied!")));
  };

  // Demo Projects & Timeline Scrubber
  function loadDemoProject(key) {
    const demo = CadGenerators.DEMO_PROJECTS[key];
    if (!demo) return;
    pushUndoSnapshot();
    restoreSceneFromItems(demo.items);
    zoomFitScene();
    showToast(L(demo.titlePt, demo.titleEn));
  }

  $$("[data-load-demo]").forEach((btn) => {
    btn.addEventListener("click", () => loadDemoProject(btn.dataset.loadDemo));
  });

  function applyTimelineStep(step) {
    timelineStep = Math.max(0, Math.min(solids.length, step));
    solids.forEach((s, i) => {
      s.visible = i < timelineStep;
    });
    renderFeatureTree();
    updateTelemetryAndPrintMetrics();
  }

  $("#tlFirst").onclick = () => applyTimelineStep(1);
  $("#tlPrev").onclick = () => applyTimelineStep(timelineStep - 1);
  $("#tlNext").onclick = () => applyTimelineStep(timelineStep + 1);
  $("#tlLast").onclick = () => applyTimelineStep(solids.length);
  $("#tlPlay").onclick = () => {
    if (!solids.length) return;
    let step = 0;
    applyTimelineStep(0);
    const timer = setInterval(() => {
      step++;
      applyTimelineStep(step);
      if (step >= solids.length) clearInterval(timer);
    }, 320);
  };

  $("#btnClearScene").onclick = () => clearAllSolids(true);
  $("#btnUndo").onclick = undo;
  $("#btnRedo").onclick = redo;

  window.addEventListener("keydown", (e) => {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || "")) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      undo();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
      e.preventDefault();
      redo();
    } else if (e.key === "Delete" && selectedSolid) {
      pushUndoSnapshot();
      removeSolid(selectedSolid);
    } else if (e.key.toLowerCase() === "f") {
      zoomFitScene();
    }
  });

  // 4u-Labs Modal & Language Switcher
  $("#btnOpen4uModal").onclick = () => ($("#modal4uLabs").hidden = false);
  $("#btnClose4uModal").onclick = () => ($("#modal4uLabs").hidden = true);
  $("#modal4uLabs").addEventListener("click", (e) => {
    if (e.target === $("#modal4uLabs")) $("#modal4uLabs").hidden = true;
  });

  function applyLanguage() {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
    $("#langPt").classList.toggle("active", lang === "pt");
    $("#langEn").classList.toggle("active", lang === "en");
    const dict = I18N[lang];
    $$("[data-i18n]").forEach((el) => {
      const k = el.dataset.i18n;
      if (dict[k]) el.textContent = dict[k];
    });
    renderInspectorFields();
    renderFeatureTree();
    updateTelemetryAndPrintMetrics();
  }

  $("#langPt").onclick = () => {
    lang = "pt";
    localStorage.setItem("3dcad_lang", "pt");
    applyLanguage();
  };
  $("#langEn").onclick = () => {
    lang = "en";
    localStorage.setItem("3dcad_lang", "en");
    applyLanguage();
  };

  // Resize & Animation Loop
  function onResize() {
    const w = viewport.clientWidth || window.innerWidth;
    const h = (viewport.clientHeight || window.innerHeight) - 30;
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
    renderer.setSize(w, Math.max(1, h));
    if (!sketchOverlay.hidden) resizeSketchCanvas();
  }
  window.addEventListener("resize", onResize);

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  // Register Service Worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  // Boot Studio: restore from localStorage Auto-Save if available, else Space Rover Demo
  onResize();
  applyLanguage();
  try {
    const savedRaw = localStorage.getItem("3dcad_autosave_v1");
    const savedItems = savedRaw ? JSON.parse(savedRaw) : null;
    if (Array.isArray(savedItems) && savedItems.length > 0) {
      restoreSceneFromItems(savedItems);
      zoomFitScene();
    } else {
      loadDemoProject("rover");
    }
  } catch {
    loadDemoProject("rover");
  }
  isBooting = false;
  saveAutoSave();
  undoStack = [];
  animate();
})();
