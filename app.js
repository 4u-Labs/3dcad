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

  Object.assign(I18N.pt, CadUI.pt);
  Object.assign(I18N.en, CadUI.en);
  function applyExtraTranslations() { CadUI.translate(lang); }

  let lang = "pt";
  try { lang = localStorage.getItem("3dcad_lang") || "pt"; } catch {}
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
  let restoring = false;
  let isBooting = true;
  let saveTimer = null;
  let saveRevision = 0;
  let pendingEdits = new Set();
  let savedScene = "";
  let timelineTimer = null;
  const projectStore = CadProject.createStore();

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

  function disposeMesh(mesh) {
    mesh.traverse(child => {
      child.geometry?.dispose();
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach(material => material?.dispose());
    });
  }

  function newId(prefix = "solid") {
    let id;
    do { id = `${prefix}_${idCounter++}`; } while (solids.some(s => s.userData.id === id));
    return id;
  }

  function buildSolid(type, customOpts = {}) {
    const isMesh = ["CSG_SOLID", "STL_IMPORT", "MESH"].includes(type);
    const params = isMesh ? {} : CadProject.validateParams(type, {...(DEFAULT_PARAMS[type] || {}), ...(customOpts.params || {})});
    const record = CadProject.validateItems([{...customOpts, id: customOpts.id || newId(), type, params,
      color: customOpts.color || DEFAULT_COLORS[type] || "#f97316",
      name: customOpts.name || `${type}_${solids.length + 1}`}])[0];
    const geom = CadProject.geometry(record);
    geom.computeBoundingBox();
    if (geom.boundingBox.isEmpty()) { geom.dispose(); throw new Error(L("Operação sem volume", "Operation has no volume")); }
    const mat = new THREE.MeshStandardMaterial({color: record.color, roughness: 0.36, metalness: 0.18, flatShading: isMesh, clippingPlanes: [slicePlane], side: THREE.DoubleSide});
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.position.fromArray(record.pos);
    mesh.rotation.set(...record.rot.map(THREE.MathUtils.degToRad));
    mesh.scale.fromArray(record.scale);
    mesh.visible = record.visible;
    if (!customOpts.pos) {
      mesh.position.x = solids.length ? (solids.length % 5) * 6 - 12 : 0;
      mesh.updateWorldMatrix(true, false);
      mesh.position.y -= new THREE.Box3().setFromObject(mesh).min.y;
    }
    mesh.userData = {id: record.id, type, name: record.name, color: record.color, params, isParametric: !isMesh};
    const suffix = /_(\d+)$/.exec(record.id);
    if (suffix) idCounter = Math.max(idCounter, Number(suffix[1]) + 1);
    attachCadEdges(mesh);
    applyVisualStyleToMesh(mesh);
    return mesh;
  }

  function triangleCount(geometry) { return (geometry.index?.count || geometry.attributes.position.count) / 3; }
  function ensureCapacity(geometry, except = null) {
    if (solids.filter(s=>s!==except).reduce((sum,s)=>sum+triangleCount(s.geometry),0)+triangleCount(geometry)>CadMesh.MAX_TRIANGLES)
      throw new Error(L("Projeto excede 250.000 triângulos.", "Project exceeds 250,000 triangles."));
  }

  function createParametricSolid(type, customOpts = {}) {
    if (solids.length >= CadProject.MAX_SOLIDS) throw new Error(L("Limite de 150 peças atingido", "150-part limit reached"));
    const mesh = buildSolid(type, customOpts);
    try { ensureCapacity(mesh.geometry); } catch(error) { disposeMesh(mesh); throw error; }
    scene.add(mesh); solids.push(mesh); timelineStep = solids.length;
    selectSolid(mesh); refreshAllUI();
    return mesh;
  }

  function rebuildSolidGeometry(mesh) {
    if (!mesh?.userData?.isParametric) return;
    const wasOnBed = Math.abs(new THREE.Box3().setFromObject(mesh).min.y) < 0.001;
    const next = CadGenerators.buildParametricGeometry(mesh.userData.type, mesh.userData.params);
    try { ensureCapacity(next,mesh); } catch(error) { next.dispose(); throw error; }
    mesh.geometry.dispose(); mesh.geometry = next;
    attachCadEdges(mesh);
    if (wasOnBed) {
      mesh.updateWorldMatrix(true, false);
      mesh.position.y -= new THREE.Box3().setFromObject(mesh).min.y;
      if ($("#posZ")) $("#posZ").value = Number(mesh.position.y.toFixed(4));
    }
    updateTelemetryAndPrintMetrics(); syncMcpConsole();
  }

  function serializeSceneState() { return solids.map(CadProject.serialize); }

  function flushEdits() { [...pendingEdits].forEach(flush => flush()); }

  function pushUndoSnapshot(snapshot = JSON.stringify(serializeSceneState())) {
    if (undoStack.at(-1) !== snapshot) undoStack.push(snapshot);
    // Snapshots include meshes. Bound both count and serialized memory.
    let bytes = undoStack.reduce((sum, item) => sum + item.length, 0);
    while (undoStack.length > 30 || (bytes > 48 * 1024 * 1024 && undoStack.length > 1)) bytes -= undoStack.shift().length;
    redoStack = [];
  }

  function restoreSceneFromItems(items) {
    const records = CadProject.validateItems(items), staged = [];
    try { let triangles=0;for (const item of records) { const mesh=buildSolid(item.type,item);staged.push(mesh);triangles+=triangleCount(mesh.geometry);if(triangles>CadMesh.MAX_TRIANGLES)throw new Error(L("Projeto excede 250.000 triângulos.", "Project exceeds 250,000 triangles.")); } }
    catch (error) { staged.forEach(disposeMesh); throw error; }
    const selectedId = selectedSolid?.userData.id;
    restoring = true;
    for (const mesh of solids) { scene.remove(mesh); disposeMesh(mesh); }
    solids = staged;
    solids.forEach(mesh => scene.add(mesh));
    selectedSolid = null;
    timelineStep = solids.length;
    restoring = false;
    selectSolid(solids.find(mesh => mesh.userData.id === selectedId) || solids.at(-1) || null);
    refreshAllUI();
  }

  function undo() {
    flushEdits();
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
    flushEdits();
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
    if (mesh !== selectedSolid) flushEdits();
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
    disposeMesh(mesh);
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
      disposeMesh(m);
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
    listEl.setAttribute("role","tree");
    listEl.innerHTML = "";

    solids.forEach((mesh, idx) => {
      const li = document.createElement("li");
      li.className = "tree-item" + (mesh === selectedSolid ? " selected" : "");
      const visibleIcon = mesh.visible ? "👁" : "🚫";
      li.tabIndex = 0;
      li.setAttribute("role", "treeitem");
      li.setAttribute("aria-selected",String(mesh===selectedSolid));
      li.setAttribute("aria-label", mesh.userData.name);
      const left = document.createElement("div"); left.className = "tree-item-left";
      const dot = document.createElement("span"); dot.className = "color-dot"; dot.style.backgroundColor = mesh.userData.color;
      const label = document.createElement("span"); label.className = "tree-name"; label.textContent = mesh.userData.name; label.title = mesh.userData.name;
      const tag = document.createElement("span"); tag.className = "tree-type-tag"; tag.textContent = mesh.userData.type;
      left.append(dot, label, tag);
      const actions = document.createElement("div"); actions.className = "tree-actions";
      const vis = document.createElement("button"); vis.type = "button"; vis.className = "tree-act-btn"; vis.dataset.toggleVis = String(idx); vis.textContent = visibleIcon;
      vis.title = L("Mostrar/Ocultar", "Show/Hide"); vis.setAttribute("aria-label", `${vis.title}: ${mesh.userData.name}`);
      const del = document.createElement("button"); del.type = "button"; del.className = "tree-act-btn"; del.dataset.delIdx = String(idx); del.textContent = "×";
      del.title = L("Excluir", "Delete"); del.setAttribute("aria-label", `${del.title}: ${mesh.userData.name}`);
      actions.append(vis, del); li.append(left, actions);
      li.addEventListener("keydown", e => { if (e.target === li && ["Enter", " "].includes(e.key)) { e.preventDefault(); selectSolid(mesh); } });
      li.addEventListener("click", (e) => {
        const visBtn = e.target.closest("[data-toggle-vis]");
        const delBtn = e.target.closest("[data-del-idx]");
        if (visBtn) {
          e.stopPropagation();
          pushUndoSnapshot();
          mesh.visible = !mesh.visible;
          refreshAllUI();
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
      const previous = csgSel.value;
      csgSel.replaceChildren();
      if (!others.length) {
        const option = document.createElement("option"); option.value = ""; option.textContent = L("Adicione 2+ sólidos", "Add 2+ solids"); csgSel.append(option);
      } else for (const other of others) {
        const option = document.createElement("option"); option.value = other.userData.id;
        option.textContent = `${other.userData.name} (${other.userData.type})`; csgSel.append(option);
      }
      csgSel.value = others.some(s => s.userData.id === previous) ? previous : others.at(-1)?.userData.id || "";

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
    $("#posX").value = Number(selectedSolid.position.x.toFixed(6));
    $("#posY").value = Number(selectedSolid.position.z.toFixed(6));
    $("#posZ").value = Number(selectedSolid.position.y.toFixed(6));
    $("#rotX").value = Number(THREE.MathUtils.radToDeg(selectedSolid.rotation.x).toFixed(6));
    $("#rotY").value = Number(THREE.MathUtils.radToDeg(selectedSolid.rotation.z).toFixed(6));
    $("#rotZ").value = Number(THREE.MathUtils.radToDeg(selectedSolid.rotation.y).toFixed(6));

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
      inp.id = `param_${field.key}`;
      lbl.htmlFor = inp.id;
      inp.setAttribute("aria-label", lbl.textContent);
      bindEdit(inp, value => {
        const val = Number(value);
        const params = CadProject.validateParams(ud.type, {...ud.params, [field.key]: val});
        const old = ud.params;
        ud.params = params;
        try { rebuildSolidGeometry(selectedSolid); } catch (error) { ud.params = old; throw error; }
      }, true);
      row.append(lbl, inp);
      dynWrap.appendChild(row);
    }
  }

  // === TELEMETRY & 3D PRINT METRICS ===
  function updateTelemetryAndPrintMetrics() {
    const targetMeshes = $("#printScope")?.value === "scene" ? solids : selectedSolid ? [selectedSolid] : solids;
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
    $("#mLenVal").textContent = metrics.material === "RESIN" ? L("Não se aplica", "Not applicable") : `${metrics.filamentMeters} m`;
    $("#mCostVal").textContent = `R$ ${metrics.costBrl.toFixed(2).replace(".", ",")}`;
    $("#mTriVal").textContent = metrics.triangles.toLocaleString(lang === "pt" ? "pt-BR" : "en-US");

    const fitBadge = $("#bedFitBadge");
    if (fitBadge) {
      const job = CadGenerators.analyzeMeshFor3DPrint(solids, printSettings);
      fitBadge.textContent = job.fitsBed220 ? L("✓ Cena na mesa", "✓ Scene on bed") : L("⚠ Cena fora da mesa", "⚠ Scene outside bed");
      fitBadge.style.color = job.fitsBed220 ? "#4ade80" : "#f87171";
    }
  }

  function setSaveStatus(state) {
    const badge = $("#autoSaveBadge");
    const labels = {pending: L("Salvando…", "Saving…"), saved: L("Salvo neste navegador", "Saved in this browser"), error: L("Não salvo — exporte JSON", "Not saved — export JSON")};
    if (badge) { badge.textContent = labels[state]; badge.dataset.state = state; badge.style.color = state === "saved" ? "#4ade80" : state === "error" ? "#f87171" : "#fbbf24"; }
  }

  function saveAutoSave() {
    if (isBooting || restoring) return;
    const state = JSON.stringify(CadProject.document(serializeSceneState()));
    if (state === savedScene) return;
    const revision = ++saveRevision;
    setSaveStatus("pending"); clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try { await projectStore.save(JSON.parse(state)); if (revision === saveRevision) { savedScene = state; setSaveStatus("saved"); } }
      catch (error) { if (revision === saveRevision) { setSaveStatus("error"); showToast(L("Não foi possível salvar. Exporte seu projeto JSON.", "Unable to save. Export your JSON project.")); } }
    }, 300);
  }

  function renderProjectConsole() {
    const input = $("#mcpJsonConsole"), doc = CadProject.document(serializeSceneState());
    const text = JSON.stringify(doc,null,2), large = text.length > 60000;
    input.dataset.previewOnly = large ? 'true' : 'false';
    input.value = large ? JSON.stringify({format:doc.format,version:doc.version,units:doc.units,preview:true,partCount:doc.solids.length,solids:doc.solids.map(s=>({id:s.id,type:s.type,name:s.name,vertices:s.geometry?.positions.length/3,triangles:s.geometry?(s.geometry.index?.length||s.geometry.positions.length/3)/3:undefined,visible:s.visible}))},null,2) : text;
    $("#btnApplyMcpJson").disabled = large;
  }
  function syncMcpConsole() {
    const input = $("#mcpJsonConsole");
    if (input && document.activeElement !== input) renderProjectConsole();
    saveAutoSave();
  }

  function bindEdit(input, apply, debounce = false) {
    let snapshot = null, timer = null;
    const commit = () => {
      clearTimeout(timer); pendingEdits.delete(commit);
      if (snapshot === null) return;
      try {
        apply(input.value);
        if (snapshot !== JSON.stringify(serializeSceneState())) pushUndoSnapshot(snapshot);
        input.setCustomValidity("");
      } catch (error) { input.setCustomValidity(error.message); input.reportValidity(); showToast(error.message); }
      snapshot = null;
    };
    input.addEventListener("input", () => {
      if (!selectedSolid) return;
      if (snapshot === null) snapshot = JSON.stringify(serializeSceneState());
      if (debounce) { clearTimeout(timer); pendingEdits.add(commit); timer = setTimeout(commit, 220); }
      else { pendingEdits.add(commit); commit(); }
    });
    input.addEventListener("change", commit);
    input.addEventListener("blur", commit);
  }

  function refreshAllUI() {
    renderFeatureTree();
    renderInspectorFields();
    updateTelemetryAndPrintMetrics();
    syncMcpConsole();
  }

  // === CSG BOOLEAN OPERATIONS & QUICK HOLE ===
  function booleanOperand(mesh) {
    const geometry=mesh.geometry;
    if((geometry.index?.count||geometry.attributes.position.count)/3>30000) throw new Error(L('CSG aceita até 30.000 triângulos por peça.', 'CSG accepts up to 30,000 triangles per part.'));
    const data=CadMesh.fromMesh(mesh,false);
    if(data.diagnostics.boundaryEdges||data.diagnostics.nonManifoldEdges)throw new Error(L('CSG exige malhas fechadas. Valide a peça.', 'CSG requires closed meshes. Validate the part.'));
    const operand=new THREE.Mesh(CadMesh.toGeometry(data),new THREE.MeshStandardMaterial());operand.updateMatrix();return operand;
  }
  function commitCsg(csg,base,removed,name) {
    const result=CSG.toMesh(csg,new THREE.Matrix4(),base.material.clone());
    try {
      const data=CadMesh.fromMesh(result,false);
      if(!data.triangles.length||Math.abs(CadMesh.signedVolume(data.vertices,data.triangles))<1e-6)throw new Error(L('A operação não produz volume. A cena foi preservada.', 'The operation produces no volume. The scene was preserved.'));
      const geometry=CadMesh.toGeometry(data);result.geometry.dispose();result.geometry=geometry;
      const center=new THREE.Vector3();geometry.boundingBox.getCenter(center);geometry.translate(-center.x,-center.y,-center.z);result.position.copy(center);
      result.castShadow=result.receiveShadow=true;result.material.flatShading=true;result.material.needsUpdate=true;
      result.userData={id:newId('csg'),type:'CSG_SOLID',name:name.slice(0,160),color:base.userData.color,params:{},isParametric:false};
      attachCadEdges(result);applyVisualStyleToMesh(result);
    } catch(error){disposeMesh(result);throw error;}
    pushUndoSnapshot();
    for(const mesh of removed){scene.remove(mesh);disposeMesh(mesh);}
    solids=solids.filter(mesh=>!removed.includes(mesh));solids.push(result);scene.add(result);
    selectedSolid=null;timelineStep=solids.length;selectSolid(result);refreshAllUI();return result;
  }
  function runBooleanOp(opType) {
    flushEdits();
    if(!['union','subtract','intersect'].includes(opType))return;
    const base=selectedSolid,tool=solids.find(mesh=>mesh.userData.id===$('#csgTargetSelect').value&&mesh!==base);
    if(!base||!tool)return showToast(L('Selecione duas peças para a operação.', 'Select two parts for the operation.'));
    let a,b;
    try{a=booleanOperand(base);b=booleanOperand(tool);const left=CSG.fromMesh(a),right=CSG.fromMesh(b);const result=opType==='union'?left.union(right):opType==='intersect'?left.intersect(right):left.subtract(right);commitCsg(result,base,[base,tool],`${base.userData.name}_${opType}`);showToast(L('Operação booleana concluída.', 'Boolean operation completed.'));}
    catch(error){showToast(error.message);}
    finally{if(a)disposeMesh(a);if(b)disposeMesh(b);}
  }
  function drillQuickHoleOnSelected(holeDia=4.2) {
    flushEdits();
    if(!selectedSolid)return showToast(L('Selecione uma peça primeiro.', 'Select a part first.'));
    if(!Number.isFinite(holeDia)||holeDia<0.5||holeDia>200)throw new Error(L('Diâmetro deve estar entre 0,5 e 200 mm.', 'Diameter must be between 0.5 and 200 mm.'));
    const target=selectedSolid,box=new THREE.Box3().setFromObject(target),center=new THREE.Vector3(),size=new THREE.Vector3();box.getCenter(center);box.getSize(size);
    let base;const tool=new THREE.Mesh(new THREE.CylinderGeometry(holeDia/2,holeDia/2,Math.max(size.y+4,10),48),new THREE.MeshStandardMaterial());tool.position.copy(center);tool.updateMatrix();
    try{base=booleanOperand(target);const result=CSG.fromMesh(base).subtract(CSG.fromMesh(tool));commitCsg(result,target,[target],`${target.userData.name}_Bore${holeDia}`);showToast(L(`Furo Ø${holeDia} mm aplicado.`, `Bore Ø${holeDia} mm applied.`));}
    finally{if(base)disposeMesh(base);disposeMesh(tool);}
  }

  // === PATTERNS, MIRROR & DUPLICATE ===
  function cloneSolidMesh(src, offsetVec) {
    if(solids.length>=CadProject.MAX_SOLIDS)throw new Error(L("Limite de peças atingido.","Part limit reached."));
    ensureCapacity(src.geometry);
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
      id: newId(),
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
    skCanvas.setPointerCapture(e.pointerId);
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
    editingSketchId = null;
    sketchOverlay.hidden = false;
    if (skEntities.length === 0) {
      // Seed with a default 60x40 base plate with 2 holes so user sees an instant example
      skEntities = [
        { kind: "rect", x: 0, y: 0, w: 70, h: 44, isHole: false },
        { kind: "circle", x: -22, y: 0, r: 5, isHole: true },
        { kind: "circle", x: 22, y: 0, r: 5, isHole: true },
      ];
    }
    renderSketchFields();
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

  function exportStl() {
    flushEdits();
    try { downloadBlob(CadMesh.stl(solids), "modelo_3dcad.stl"); showToast(L("STL exportado em mm, Z vertical.", "STL exported in mm, Z up.")); }
    catch (error) { showToast(error.message); }
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

  bindEdit($("#inspNameInput"), value => {
    if (!selectedSolid) return;
    if (!value.trim() || value.length > 160) throw new Error(L("Nome deve ter 1–160 caracteres", "Name must have 1–160 characters"));
    selectedSolid.userData.name = value;
    renderFeatureTree(); updateTelemetryAndPrintMetrics(); syncMcpConsole();
  });
  ["posX", "posY", "posZ", "rotX", "rotY", "rotZ"].forEach(id => bindEdit($("#" + id), () => {
    const values = ["posX", "posY", "posZ", "rotX", "rotY", "rotZ"].map(id => Number($("#" + id).value));
    if (values.some(n => !Number.isFinite(n) || Math.abs(n) > 100000)) throw new Error(L("Transformação inválida", "Invalid transform"));
    selectedSolid.position.set(values[0], values[2], values[1]);
    selectedSolid.rotation.set(...[values[3], values[5], values[4]].map(THREE.MathUtils.degToRad));
    updateTelemetryAndPrintMetrics(); syncMcpConsole();
  }, true));
  $$("#colorSwatches .color-swatch").forEach(sw => sw.addEventListener("click", () => {
    if (!selectedSolid) return;
    flushEdits(); pushUndoSnapshot();
    selectedSolid.userData.color = sw.dataset.color;
    selectedSolid.material.color.set(sw.dataset.color);
    refreshAllUI();
  }));

  // Boolean & Pattern Buttons
  $("#btnCsgUnion").onclick = () => runBooleanOp("union");
  $("#btnCsgSubtract").onclick = () => runBooleanOp("subtract");
  $("#btnCsgIntersect").onclick = () => runBooleanOp("intersect");
  $("#inspCsgUnion").onclick = () => runBooleanOp("union");
  $("#inspCsgSubtract").onclick = () => runBooleanOp("subtract");
  $("#inspCsgIntersect").onclick = () => runBooleanOp("intersect");
  $("#btnDrillQuickHole").onclick = () => drillQuickHoleOnSelected(Number($("#drillDiameter").value));

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

  function patternOptions() {
    const count = Number($('#patternCount').value), step = Number($('#patternStep').value), cx = Number($('#patternCenterX').value), cy = Number($('#patternCenterY').value);
    if (!Number.isInteger(count) || count < 2 || count > 32 || solids.length + count - 1 > CadProject.MAX_SOLIDS || !Number.isFinite(step) || step < 0.1 || step > 1000 || ![cx,cy].every(n=>Number.isFinite(n)&&Math.abs(n)<=10000)) throw new Error(L('Configuração de padrão inválida.', 'Invalid pattern settings.'));
    if(solids.reduce((sum,m)=>sum+triangleCount(m.geometry),0)+(count-1)*triangleCount(selectedSolid.geometry)>CadMesh.MAX_TRIANGLES) throw new Error(L("Padrão excede o limite de malha.","Pattern exceeds the mesh limit."));
    return {count,step,cx,cy};
  }
  $('#btnLinearPattern').onclick = () => {
    if (!selectedSolid) return;
    const {count,step} = patternOptions(), base = selectedSolid;
    pushUndoSnapshot();
    for (let i = 1; i < count; i++) cloneSolidMesh(base, new THREE.Vector3(step * i,0,0));
    timelineStep = solids.length; refreshAllUI();
    showToast(L(`Padrão de ${count} peças criado.`, `${count}-part pattern created.`));
  };
  $('#btnCircularPattern').onclick = () => {
    if (!selectedSolid) return;
    const {count,cx,cy} = patternOptions(), base = selectedSolid;
    const dx = base.position.x-cx, dz = base.position.z-cy;
    if (Math.hypot(dx,dz)<0.01) throw new Error(L('A peça está no centro circular. Mova a peça ou ajuste o centro.', 'Part is at the circular center. Move the part or adjust the center.'));
    pushUndoSnapshot();
    for(let i=1;i<count;i++){
      const angle = i*Math.PI*2/count, copy = cloneSolidMesh(base,new THREE.Vector3());
      copy.position.set(cx+dx*Math.cos(angle)+dz*Math.sin(angle),base.position.y,cy-dx*Math.sin(angle)+dz*Math.cos(angle));
      copy.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),angle));
    }
    timelineStep=solids.length; refreshAllUI();
    showToast(L('Padrão circular criado a partir da posição original.', 'Circular pattern created from the original position.'));
  };
  $('#btnMirrorX').onclick = () => {
    if (!selectedSolid) return;
    const plane = Number($('#mirrorPlaneX').value);
    if(!Number.isFinite(plane)||Math.abs(plane)>10000) throw new Error(L('Plano de espelho inválido.', 'Invalid mirror plane.'));
    pushUndoSnapshot();
    selectedSolid.updateMatrix();
    const reflection=new THREE.Matrix4().makeScale(-1,1,1);reflection.setPosition(plane*2,0,0);
    const transform=reflection.multiply(selectedSolid.matrix);
    const copy=cloneSolidMesh(selectedSolid,new THREE.Vector3());transform.decompose(copy.position,copy.quaternion,copy.scale);
    selectSolid(copy); refreshAllUI(); showToast(L('Espelho no plano configurado criado.', 'Mirror on the configured plane created.'));
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
    const h = Number($("#sketchExtrudeHeight").value);
    const params = CadProject.validateParams("SKETCH_EXTRUDE", {height:h,bevel:0,entities:JSON.parse(JSON.stringify(skEntities))});
    const preview = CadGenerators.buildParametricGeometry("SKETCH_EXTRUDE",params); preview.dispose();
    pushUndoSnapshot();
    const existing = solids.find(mesh=>mesh.userData.id===editingSketchId);
    if(existing){existing.userData.params=params;rebuildSolidGeometry(existing);selectSolid(existing);refreshAllUI();}
    else createParametricSolid("SKETCH_EXTRUDE", {name:`Sketch3D_${solids.length+1}`,color:'#f97316',params});
    editingSketchId=null;
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
  $("#hudDropBed").onclick = $("#btnLayFlatBed").onclick = () => { flushEdits(); pushUndoSnapshot(); dropSelectedToBed(); };
  $("#btnRotX90").onclick = () => rotateSelected90("x");
  $("#btnRotY90").onclick = () => rotateSelected90("y");
  $("#btnRotZ90").onclick = () => rotateSelected90("z");

  $("#hudCenterBed").onclick = () => {
    if (!selectedSolid) return;
    flushEdits(); pushUndoSnapshot();
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
      const child = measureGroup.children[0]; measureGroup.remove(child); disposeMesh(child);
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

  function exportDocument() {
    flushEdits();
    downloadBlob(new Blob([JSON.stringify(CadProject.document(serializeSceneState()), null, 2)], {type:'application/json;charset=utf-8'}), 'projeto_3dcad.json');
  }
  function exportFormat(format) {
    flushEdits();
    try {
      const blob = format === '3mf' ? CadGenerators.exportMeshesTo3MF(solids) : format === 'step' ? CadGenerators.exportMeshesToSTEP(solids) : CadGenerators.exportMeshesToOBJ(solids);
      downloadBlob(blob, `modelo_3dcad.${format}`);
      showToast(format === 'step' ? L('STEP facetado exportado: superfícies trianguladas, sem histórico.', 'Faceted STEP exported: triangulated surfaces, no history.') : L('Arquivo exportado.', 'File exported.'));
    } catch (error) { showToast(error.message); }
  }
  $('#btnQuickExportStl').onclick = $('#printExportStlBin').onclick = exportStl;
  $('#btnExport3mf').onclick = $('#printExport3mf').onclick = () => exportFormat('3mf');
  $('#btnExportStep').onclick = $('#printExportStep').onclick = () => exportFormat('step');
  $('#btnExportObj').onclick = $('#printExportObj').onclick = () => exportFormat('obj');
  $('#btnExportJson').onclick = exportDocument;
  $('#btnSaveProject').onclick = exportDocument;

  async function importFile(file) {
    if (!file) return;
    if (file.size > CadProject.MAX_BYTES) throw new Error(L('Arquivo excede 32 MB.', 'File exceeds 32 MB.'));
    flushEdits();
    if (/\.json$/i.test(file.name)) {
      const doc = CadProject.read(await file.text());
      // Restore stages every object before committing. Invalid input leaves the scene intact.
      pushUndoSnapshot(); restoreSceneFromItems(doc.solids);
    } else if (/\.stl$/i.test(file.name)) {
      const bytes = await file.arrayBuffer();
      if (bytes.byteLength < 15) throw new Error(L('STL vazio ou inválido.', 'Empty or invalid STL.'));
      if (bytes.byteLength >= 84) {
        const count = new DataView(bytes).getUint32(80, true);
        if (84 + count * 50 === bytes.byteLength && count > CadMesh.MAX_TRIANGLES) throw new Error(L('STL excede 250.000 triângulos.', 'STL exceeds 250,000 triangles.'));
      }
      const raw = new THREE.STLLoader().parse(bytes);
      try {
        if (raw.attributes.position.count / 3 > CadMesh.MAX_TRIANGLES) throw new Error(L('Malha grande demais.', 'Mesh is too large.'));
        raw.rotateX(-Math.PI / 2); // CAD Z-up -> internal Y-up, inverse of every exporter.
        const normalized = CadMesh.fromMesh(new THREE.Mesh(raw), false);
        if (!normalized.triangles.length) throw new Error(L('STL sem triângulos válidos.', 'STL has no valid triangles.'));
        const geometry = CadMesh.toGeometry(normalized);
        const record = {type:'STL_IMPORT',name:file.name.replace(/\.stl$/i,'').slice(0,160),color:'#38bdf8',params:{},pos:[0,0,0],geometry:{positions:Array.from(geometry.attributes.position.array),index:Array.from(geometry.index.array)}};
        geometry.dispose();
        const mesh = buildSolid(record.type, record);
        try { if(solids.length>=CadProject.MAX_SOLIDS)throw new Error(L("Limite de peças atingido.","Part limit reached."));ensureCapacity(mesh.geometry); } catch(error) {disposeMesh(mesh);throw error;}
        pushUndoSnapshot(); scene.add(mesh); solids.push(mesh); timelineStep = solids.length;
        selectSolid(mesh); refreshAllUI();
      } finally { raw.dispose(); }
    } else throw new Error(L('Escolha um arquivo STL ou JSON.', 'Choose an STL or JSON file.'));
    zoomFitScene(); showToast(L('Projeto importado. Posições preservadas.', 'Project imported. Positions preserved.'));
  }
  $('#fileImportInput').addEventListener('change', async e => {
    const file = e.target.files?.[0]; e.target.value = '';
    try { await importFile(file); } catch (error) { showToast(error.message); }
  });

  let proposedCommand = null;
  function previewCommand(text) {
    try {
      proposedCommand = CadGenerators.parseCadPrompt(text);
      if (!proposedCommand) throw new Error(L('Comando não reconhecido. Use um exemplo ou parâmetros da peça.', 'Unknown command. Use an example or the part parameters.'));
      const cmd = proposedCommand;
      if (cmd.action !== 'CREATE' && !selectedSolid) throw new Error(L('Selecione uma peça primeiro.', 'Select a part first.'));
      if (cmd.action === 'DRILL_HOLE' && (!Number.isFinite(cmd.diameter) || cmd.diameter < 0.5 || cmd.diameter > 200)) throw new Error(L('Diâmetro de furo inválido.', 'Invalid bore diameter.'));
      if (cmd.action === 'MODIFY') {
        if (!selectedSolid.userData.isParametric) throw new Error(L('Malhas importadas/CSG não têm dimensões paramétricas editáveis.', 'Imported/CSG meshes have no editable parametric dimensions.'));
        cmd.params = CadProject.validateParams(selectedSolid.userData.type, {...selectedSolid.userData.params,...cmd.params});
      }
      cmd.target = cmd.action === 'CREATE' ? null : selectedSolid.userData.id;
      $('#commandPreview').textContent = JSON.stringify({action:cmd.action,type:cmd.type,target:cmd.target,params:cmd.params,diameter:cmd.diameter},null,2);
      $('#btnApplyCommand').disabled = false;
      showToast(L('Confira a ação e clique em Aplicar.', 'Review the action and click Apply.'));
    } catch (error) {
      proposedCommand = null; $('#commandPreview').textContent = error.message; $('#btnApplyCommand').disabled = true; showToast(error.message);
    }
  }
  function applyCommand() {
    const cmd = proposedCommand;
    if (!cmd) return;
    try {
      flushEdits();
      if (cmd.target && selectedSolid?.userData.id !== cmd.target) throw new Error(L('A seleção mudou. Interprete o comando novamente.', 'Selection changed. Interpret the command again.'));
      if (cmd.action === 'DRILL_HOLE') drillQuickHoleOnSelected(cmd.diameter);
      else if (cmd.action === 'MODIFY') {
        const old = selectedSolid.userData.params;
        const next = CadGenerators.buildParametricGeometry(selectedSolid.userData.type, cmd.params); next.dispose();
        pushUndoSnapshot(); selectedSolid.userData.params = cmd.params;
        try { rebuildSolidGeometry(selectedSolid); refreshAllUI(); } catch (error) { selectedSolid.userData.params = old; throw error; }
      } else { pushUndoSnapshot(); createParametricSolid(cmd.type,{params:cmd.params,color:cmd.color}); }
      proposedCommand = null; $('#btnApplyCommand').disabled = true;
      zoomFitScene(); showToast(L('Comando aplicado.', 'Command applied.'));
    } catch (error) { showToast(error.message); }
  }
  $('#btnRunAiPrompt').onclick = () => previewCommand($('#aiPromptInput').value);
  $('#btnApplyCommand').onclick = applyCommand;
  $$('[data-prompt]').forEach(chip => chip.addEventListener('click', () => {
    $('#aiPromptInput').value = lang === 'en' ? chip.dataset.promptEn || chip.dataset.prompt : chip.dataset.prompt;
    previewCommand($('#aiPromptInput').value);
  }));
  $('#aiPromptInput').addEventListener('input',()=>{ proposedCommand = null; $('#btnApplyCommand').disabled = true; });
  $('#btnApplyMcpJson').onclick = () => {
    try { const doc = CadProject.read($('#mcpJsonConsole').value); flushEdits(); pushUndoSnapshot(); restoreSceneFromItems(doc.solids); zoomFitScene(); showToast(L('Projeto JSON validado e aberto.', 'JSON project validated and opened.')); }
    catch(error) { showToast(error.message); }
  };
  $('#btnRefreshMcpJson').onclick = renderProjectConsole;
  $('#mcpJsonConsole').addEventListener('input',()=>{ $('#mcpJsonConsole').dataset.previewOnly='false';$('#btnApplyMcpJson').disabled=false; });
  $('#btnCopyMcp').onclick = async () => {
    try { if (!navigator.clipboard) throw new Error('Clipboard unavailable'); await navigator.clipboard.writeText($('#mcpJsonConsole').dataset.previewOnly==='true'?JSON.stringify(CadProject.document(serializeSceneState()),null,2):$('#mcpJsonConsole').value); showToast(L('JSON copiado.', 'JSON copied.')); }
    catch { showToast(L('Selecione o JSON e use Ctrl+C.', 'Select the JSON and use Ctrl+C.')); }
  };
  $('#btnRecoverProject').onclick = async () => {
    try { const backup = await projectStore.load(true); if (!backup) throw new Error(L('Nenhuma cópia anterior disponível.', 'No previous copy available.')); flushEdits(); pushUndoSnapshot(); restoreSceneFromItems(backup.solids); zoomFitScene(); showToast(L('Cópia anterior recuperada. Desfazer restaura a cena atual.', 'Previous copy recovered. Undo restores the current scene.')); }
    catch (error) { showToast(error.message); }
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
    clearInterval(timelineTimer);
    applyTimelineStep(0);
    timelineTimer = setInterval(() => {
      step++;
      applyTimelineStep(step);
      if (step >= solids.length) clearInterval(timelineTimer);
    }, 320);
  };

  $("#btnClearScene").onclick = () => clearAllSolids(true);
  $("#btnUndo").onclick = undo;
  $("#btnRedo").onclick = redo;

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { if (!$("#modal4uLabs").hidden) closeModal($("#modal4uLabs")); if (!$("#helpModal").hidden) closeModal($("#helpModal")); sketchOverlay.hidden = true; }
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
    flushEdits();
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
    $("#langPt").classList.toggle("active", lang === "pt");
    $("#langEn").classList.toggle("active", lang === "en");
    const dict = I18N[lang];
    $$("[data-i18n]").forEach((el) => {
      const k = el.dataset.i18n;
      if (dict[k]) el.textContent = dict[k];
    });
    applyExtraTranslations();
    renderInspectorFields();
    renderFeatureTree();
    updateTelemetryAndPrintMetrics();
    if ($("#autoSaveBadge").dataset.state) setSaveStatus($("#autoSaveBadge").dataset.state);
  }

  $("#langPt").onclick = () => {
    lang = "pt";
    try { localStorage.setItem("3dcad_lang", "pt"); } catch {}
    applyLanguage();
  };
  $("#langEn").onclick = () => {
    lang = "en";
    try { localStorage.setItem("3dcad_lang", "en"); } catch {}
    applyLanguage();
  };

  let deferredInstall = null;
  let modalReturnFocus = null;
  function openModal(modal) {
    modalReturnFocus = document.activeElement;
    modal.hidden = false;
    modal.querySelector('button, a, input, textarea')?.focus();
  }
  function closeModal(modal) { modal.hidden = true; modalReturnFocus?.focus(); }
  [$('#modal4uLabs'), $('#helpModal')].forEach(modal => {
    modal.addEventListener('click', e => { if(e.target === modal) closeModal(modal); });
    modal.addEventListener('keydown', e => {
      if(e.key === 'Escape'){ e.preventDefault();closeModal(modal);return; }
      if(e.key !== 'Tab') return;
      const focusable=[...modal.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]')].filter(el=>!el.disabled&&!el.hidden);
      const first=focusable[0],last=focusable.at(-1);
      if(e.shiftKey && document.activeElement===first){e.preventDefault();last?.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
    });
  });
  $('#btnOpen4uModal').onclick = () => openModal($('#modal4uLabs'));
  $('#btnClose4uModal').onclick = () => closeModal($('#modal4uLabs'));
  $('#btnHelp').onclick = () => openModal($('#helpModal'));
  $('#btnCloseHelp').onclick = () => closeModal($('#helpModal'));
  const isStandalone=()=>window.matchMedia?.('(display-mode: standalone)').matches||navigator.standalone===true;
  $('#btnInstall').hidden = isStandalone();
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;$('#btnInstall').hidden=isStandalone();});
  window.addEventListener('appinstalled',()=>{deferredInstall=null;$('#btnInstall').hidden=true;});
  $('#btnInstall').onclick = async () => {
    if(deferredInstall){ const event=deferredInstall;deferredInstall=null;await event.prompt();await event.userChoice; }
    else { openModal($('#helpModal')); $('#helpModal').querySelector('[data-i18n="helpInstallTitle"]')?.scrollIntoView({block:'start'}); }
  };
  $('#printScope').addEventListener('input',updateTelemetryAndPrintMetrics);
  $('#btnValidateMesh').onclick = () => {
    if(!selectedSolid) return showToast(L('Selecione uma peça.', 'Select a part.'));
    const result=CadMesh.fromMesh(selectedSolid,false),d=result.diagnostics;
    $('#meshReport').textContent=L(`Malha: ${result.triangles.length} triângulos; ${d.boundaryEdges} arestas abertas; ${d.nonManifoldEdges} não manifold; ${d.removedDegenerate} degenerados removidos; ${d.splitEdges} junções corrigidas na exportação.`, `Mesh: ${result.triangles.length} triangles; ${d.boundaryEdges} open edges; ${d.nonManifoldEdges} non-manifold; ${d.removedDegenerate} degenerate triangles removed; ${d.splitEdges} junctions repaired for export.`);
  };

  let editingSketchId = null;
  function renderSketchFields() {
    const container=$('#sketchEntityFields'); container.replaceChildren();
    skEntities.forEach((entity,index)=>{
      const row=document.createElement('fieldset'); const legend=document.createElement('legend');
      legend.textContent=`${index+1} · ${entity.kind}${entity.isHole?L(' · furo',' · hole'):''}`;row.append(legend);
      for(const key of ['x','y',...(entity.r!==undefined?['r']:['w','h'])]){
        const label=document.createElement('label');label.textContent=`${{x:'X',y:'Y',r:'R',w:'X',h:'Y'}[key]} (mm)`;
        const input=document.createElement('input');input.type='number';input.className='num-input';input.step='0.1';input.value=entity[key];input.id=`sk_${index}_${key}`;label.htmlFor=input.id;
        input.addEventListener('change',()=>{
          const candidate={...entity,[key]:Number(input.value)};
          try{CadProject.validateParams('SKETCH_EXTRUDE',{height:18,bevel:0,entities:skEntities.map((e,i)=>i===index?candidate:e)});Object.assign(entity,candidate);input.setCustomValidity('');drawSketch2D();}
          catch(error){input.setCustomValidity(error.message);input.reportValidity();input.value=entity[key];}
        });
        row.append(label,input);
      }
      const del=document.createElement('button');del.type='button';del.className='hdr-btn';del.textContent=L('Excluir','Delete');
      del.onclick=()=>{skEntities.splice(index,1);renderSketchFields();drawSketch2D();};row.append(del);container.append(row);
    });
  }
  $('#btnEditSketch').onclick=()=>{
    if(selectedSolid?.userData.type!=='SKETCH_EXTRUDE')return showToast(L('Selecione uma extrusão de esboço.', 'Select a sketch extrusion.'));
    editingSketchId=selectedSolid.userData.id;skEntities=JSON.parse(JSON.stringify(selectedSolid.userData.params.entities));
    $('#sketchExtrudeHeight').value=selectedSolid.userData.params.height;
    sketchOverlay.hidden=false;renderSketchFields();resizeSketchCanvas();
  };
  $('#btnSketchAddNumeric').onclick=()=>{
    const kind=skTool==='hex'?'polygon':skTool==='hole'?'circle':skTool;
    skEntities.push({kind,x:0,y:0,...(['circle','polygon'].includes(kind)?{r:skTool==='hole'?3:10,...(kind==='polygon'?{sides:6}:{})}:{w:30,h:20}),isHole:skTool==='hole'});
    renderSketchFields();drawSketch2D();$('#sketchEntityFields').parentElement.open=true;
  };
  // Keep numeric entry and pointer drawing in sync.
  skCanvas.addEventListener('pointerup',renderSketchFields);
  skCanvas.addEventListener('pointercancel',()=>{skDragStart=null;skCurrentMouse=null;drawSketch2D();});
  $('#btnSketchClear').addEventListener('click',renderSketchFields);
  document.addEventListener('click',()=>flushEdits(),true);
  // Guard direct toolbar actions so invalid settings do not leave an uncaught exception.
  $$('button').forEach(button=>{
    const action=button.onclick;
    if(action)button.onclick=function(event){try{const value=action.call(this,event);value?.catch?.(error=>showToast(error.message));return value;}catch(error){showToast(error.message);}};
  });
  window.addEventListener('pagehide',()=>{
    flushEdits(); clearTimeout(saveTimer);
    if(!isBooting&&savedScene!=='load-error')projectStore.save(CadProject.document(serializeSceneState())).catch(()=>{});
  });
  window.addEventListener('beforeunload',event=>{
    if($('#autoSaveBadge').dataset.state==='pending'||$('#autoSaveBadge').dataset.state==='error'){event.preventDefault();event.returnValue='';}
  });

  // Resize & Animation Loop
  function onResize() {
    const w = Math.max(1, viewport.clientWidth || window.innerWidth);
    const h = (viewport.clientHeight || window.innerHeight) - ($("#timelineBar")?.offsetHeight || 38);
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
    navigator.serviceWorker.register("sw.js", {updateViaCache:"none"}).catch(() => {});
  }

  // Boot Studio: v2 complete documents, legacy migration and explicit recovery.
  async function bootStudio() {
    onResize(); applyLanguage();
    try {
      const saved = await projectStore.load();
      if (saved) restoreSceneFromItems(saved.solids);
      else loadDemoProject("rover");
    } catch (error) {
      savedScene = "load-error";
      try {
        const backup = await projectStore.load(true);
        if (backup) { savedScene = ""; restoreSceneFromItems(backup.solids); showToast(L("Projeto recuperado da cópia anterior.", "Project recovered from the previous copy.")); }
        else showToast(L("Falha ao abrir projeto. O arquivo anterior foi preservado; use Recuperar.", "Unable to open project. Previous data was preserved; use Recover."));
      } catch { showToast(L("Falha na recuperação. Importe uma cópia JSON.", "Recovery failed. Import a JSON backup.")); }
    }
    zoomFitScene();
    isBooting = false; undoStack = []; redoStack = [];
    if (solids.length || savedScene !== "load-error") saveAutoSave();
    $("#bootOverlay")?.remove();
    animate();
  }
  bootStudio();
})();
