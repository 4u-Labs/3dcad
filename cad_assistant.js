/**
 * CadAssistant — Local AI & Semantic RAG Assistant for 3DCad Studio
 * 100% Client-Side · Zero Cloud · Private & Offline
 */
(function(root){
  'use strict';

  function normalize(str){
    return (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const SYNONYMS = {
    'furar': ['furo', 'buraco', 'subtrair', 'subtracao', 'corte', 'csg', 'drill', 'hole', 'pocket'],
    'furo': ['furar', 'buraco', 'subtrair', 'cavidade', 'drill', 'hole', 'diametro'],
    'bambu': ['fatiador', 'slicer', 'cura', 'prusa', 'orcaslicer', 'orca', 'stl', '3mf', 'exportar', 'fatiar'],
    'cura': ['fatiador', 'slicer', 'bambu', 'prusa', 'orcaslicer', 'stl', '3mf', 'exportar'],
    'atalho': ['teclado', 'mouse', 'pan', 'orbitar', 'zoom', 'shift', 'enquadrar', 'shortcut', 'shortcuts', 'hotkeys'],
    'teclado': ['atalho', 'shortcuts', 'teclas', 'ctrl', 'escape', 'esc', 'delete'],
    'mouse': ['pan', 'orbitar', 'zoom', 'girar', 'arrastar', 'mover', 'roda'],
    'rolamento': ['mancal', '608', 'bearing', 'folga', 'eixo', 'esfera'],
    'engrenagem': ['gear', 'dentes', 'modulo', 'involuta', 'envolvente', 'transmissao', 'redutor'],
    'parafuso': ['porca', 'rosca', 'sextavado', 'bolt', 'nut', 'metrico', 'm3', 'm4', 'm5', 'm6', 'm8'],
    'step': ['brep', 'facetado', 'stp', 'iso', 'solidworks', 'fusion', 'freecad', 'industrial', 'exportar'],
    'esboco': ['sketch', 'desenho', 'restricao', 'solver', 'extrusao', 'revolucao', 'cota', 'dof', '2d'],
    'restricao': ['solver', 'horizontal', 'vertical', 'coincidente', 'distancia', 'paralela', 'perpendicular', 'dof'],
    'montagem': ['junta', 'articulacao', 'assembly', 'revolute', 'slider', 'rotacao', 'translacao', 'cinematica'],
    'arredondar': ['fillet', 'chanfro', 'chamfer', 'casca', 'shell', 'aresta', 'acabamento', 'brep'],
    'offline': ['pwa', 'instalar', 'sem internet', 'local', 'privacidade', 'indexeddb', 'salvar'],
    'medir': ['trena', 'caliper', 'distancia', 'pontos', 'medicao', 'mm'],
    'trena': ['medir', 'caliper', 'distancia', 'dimensao']
  };

  const KNOWLEDGE_BASE = [
    {
      id: 'csg_boolean_drill',
      categories: ['csg', 'modeling'],
      keywords: ['furar', 'furo', 'buraco', 'subtrair', 'unir', 'intersecao', 'booleana', 'csg', 'drill', 'hole', 'subtract', 'union', 'intersect'],
      titlePt: 'Como fazer furos, cavidades e operações booleanas (CSG)',
      titleEn: 'How to drill holes, cavities, and use Boolean operations (CSG)',
      summaryPt: 'Você pode furar ou cortar sólidos de duas maneiras rápidas: pelo botão "Furo por diâmetro" ou pelas operações booleanas completas.',
      summaryEn: 'You can drill or cut solids in two quick ways: using the "Drill by diameter" tool or through full Boolean operations.',
      stepsPt: [
        '1. Furo rápido no centro: Selecione a peça na árvore lateral e clique no botão "Furo por diâmetro" na barra superior. Ele abrirá um furo cilíndrico vertical usando o diâmetro configurado no painel "Padrões, espelho e furo".',
        '2. Corte ou encaixe personalizado (Booleana A − B): Crie ou posicione o sólido que servirá como ferramenta de corte (ex.: um cilindro ou cubo onde deseja o furo).',
        '3. Selecione a peça base que receberá o corte.',
        '4. No painel direito "Parâmetros", localize o campo "2º Sólido (Ferramenta)" e selecione a peça cortadora.',
        '5. Clique no botão "⊖ Furar" (ou "⊕ Unir" para fundir, ou "⊗ Interseção"). O resultado é uma malha fechada e pode ser desfeito com Ctrl+Z a qualquer momento.'
      ],
      stepsEn: [
        '1. Quick center hole: Select the part in the tree and click the "Drill by diameter" button on the top ribbon. It drills a vertical hole using the diameter set in "Patterns, mirror and bore".',
        '2. Custom pocket or cut (Boolean A − B): Create and position the solid you want to use as a cutter (e.g. a cylinder or box placed where the pocket belongs).',
        '3. Select the base target part.',
        '4. In the right "Parameters" panel, look for "2nd Solid (Tool)" and select your cutting tool.',
        '5. Click "⊖ Drill/Subtract" (or "⊕ Union" to merge, or "⊗ Intersect"). The resulting mesh is watertight and can be undone with Ctrl+Z anytime.'
      ],
      tipPt: 'Dica: Se precisar furar com tolerância para parafusos M3, M4 ou M6, configure o diâmetro com 0,2 a 0,4 mm de folga (ex.: 3,4 mm para M3, 4,4 mm para M4).',
      tipEn: 'Tip: For clearance holes (M3, M4, M6 screws), add 0.2 to 0.4 mm clearance (e.g. 3.4 mm for M3, 4.4 mm for M4).'
    },
    {
      id: 'slicers_export',
      categories: ['export', 'printing'],
      keywords: ['bambu', 'cura', 'prusa', 'orcaslicer', 'fatiador', 'slicer', 'exportar', 'stl', '3mf', 'gcode', 'imprimir', 'export'],
      titlePt: 'Como exportar modelos para fatiadores (Bambu Studio, OrcaSlicer, PrusaSlicer, Cura)',
      titleEn: 'How to export models for slicers (Bambu Studio, OrcaSlicer, PrusaSlicer, Cura)',
      summaryPt: 'O 3DCad Studio gera arquivos .STL e .3MF calibrados em milímetros e com orientação vertical Z compatível com todos os fatiadores 3D modernos.',
      summaryEn: '3DCad Studio generates .STL and .3MF files calibrated in millimeters with Z-up coordinates compatible with all modern 3D slicers.',
      stepsPt: [
        '1. Antes de exportar, clique no botão "Assentar na Mesa Z=0" para garantir que a base do modelo fique perfeitamente encostada na mesa.',
        '2. Para fatiar uma peça única: use o botão "Exportar .STL". O arquivo sai em formato binário limpo, sem furos na malha.',
        '3. Para conjuntos montados com várias peças ou cores: use o botão ".3MF". Ele gera um pacote compactado moderno preservando cada corpo separado e suas cores.',
        '4. Abra o arquivo diretamente no seu fatiador (Bambu Studio, PrusaSlicer, OrcaSlicer ou Cura). Ele já abrirá na escala correta (1:1 em mm).'
      ],
      stepsEn: [
        '1. Before exporting, click "Drop to Bed (Z=0)" to seat the bottom face flat on the build surface.',
        '2. For single parts: click "Export .STL". It generates a clean binary file with manifold geometry.',
        '3. For multi-part assemblies or multi-color prints: click ".3MF". It preserves separate objects and colors.',
        '4. Open the downloaded file directly in Bambu Studio, OrcaSlicer, PrusaSlicer, or Cura. It imports in 1:1 millimeter scale.'
      ],
      tipPt: 'Aviso: O 3DCad Studio é um modelador CAD/BRep; a geração de camadas, suportes e G-Code é feita no seu software fatiador de preferência.',
      tipEn: 'Note: 3DCad Studio is a CAD modeler; slicing, infill patterns, supports, and G-Code generation are handled by your slicer.'
    },
    {
      id: 'step_brep_vs_facet',
      categories: ['export', 'brep'],
      keywords: ['step', 'brep', 'facetado', 'stp', 'solidworks', 'fusion', 'freecad', 'industrial', 'faces', 'curvas', 'exato'],
      titlePt: 'Diferença entre .STEP BRep Analítico e .STEP Facetado',
      titleEn: 'Difference between Analytic BRep .STEP and Faceted .STEP',
      summaryPt: 'O 3DCad Studio oferece duas opções de exportação STEP para atender softwares de engenharia mecânica como SolidWorks, Fusion 360, Inventor e FreeCAD.',
      summaryEn: '3DCad Studio offers two STEP export modes for mechanical engineering CAD software like SolidWorks, Fusion 360, Inventor, and FreeCAD.',
      stepsPt: [
        '1. .STEP BRep Analítico: Exporta superfícies e curvas matemáticas exatas (cilindros, planos, esferas). Disponível para sólidos paramétricos (cubo, cilindro, engrenagens, parafusos) e extrusões de esboço que não possuam escala livre.',
        '2. .STEP Facetado: Se a cena contiver malhas poligonais importadas de STL ou resultados de operações booleanas CSG, use ".STEP facetado". Ele converte as faces triangulares em formato STEP compatível.',
        '3. Se tentar exportar BRep analítico com malhas na cena, o app alertará para usar o botão de STEP facetado.'
      ],
      stepsEn: [
        '1. Analytic BRep .STEP: Exports exact mathematical surfaces and curves (cylinders, planes, spheres). Available for parametric solids (box, cylinder, gears, bolts) and unscaled sketch extrusions.',
        '2. Faceted .STEP: If the scene contains imported STL meshes or CSG Boolean results, use "Faceted .STEP". It exports triangular faces formatted as standard STEP exchange geometry.',
        '3. If you try to export analytic BRep with mixed mesh parts, the app cleanly prompts you to use Faceted .STEP.'
      ],
      tipPt: 'Para manter BRep exato em softwares externos, modele usando as primitivas paramétricas e os geradores mecânicos da barra superior.',
      tipEn: 'To keep exact BRep geometry in external CAD, build using parametric primitives and mechanical generators from the top ribbon.'
    },
    {
      id: 'mouse_keyboard_shortcuts',
      categories: ['shortcuts', 'navigation'],
      keywords: ['atalho', 'atalhos', 'teclado', 'mouse', 'pan', 'orbitar', 'zoom', 'shift', 'arrastar', 'enquadrar', 'girar', 'camera', 'shortcuts'],
      titlePt: 'Atalhos de Teclado e Navegação 3D com o Mouse',
      titleEn: 'Keyboard Shortcuts & 3D Mouse Navigation',
      summaryPt: 'Controles ágeis de visualização e manipulação de peças na área de trabalho 3D.',
      summaryEn: 'Quick controls for viewport navigation and part positioning on the 3D build plate.',
      stepsPt: [
        '• Botão Esquerdo do Mouse: Girar / Orbitar a visão 3D em torno da peça.',
        '• Botão Direito do Mouse: Mover a câmera lateralmente (Pan).',
        '• Roda do Mouse (Scroll): Zoom para aproximar ou afastar.',
        '• Shift + Botão Esquerdo (ou botão "Mover Peça"): Desloca a peça selecionada sobre o plano da mesa de impressão.',
        '• Tecla F: Enquadrar tudo na tela (Zoom Fit).',
        '• Ctrl+Z: Desfazer a última ação (inclui transformações, parâmetros e booleanas).',
        '• Ctrl+Y: Refazer a ação desfeita.',
        '• Tecla Delete: Excluir a peça selecionada (fora de campos de texto).',
        '• Tecla Esc: Fechar janelas modais, sair do modo de medição da trena ou cancelar edição de esboço.'
      ],
      stepsEn: [
        '• Left Mouse Button: Orbit / Rotate 3D camera around target.',
        '• Right Mouse Button: Pan camera across the viewport.',
        '• Mouse Wheel (Scroll): Zoom in and out.',
        '• Shift + Left Mouse Drag (or "Move Part" mode): Slide selected part on the build plate plane.',
        '• F key: Fit all parts in view (Zoom Fit).',
        '• Ctrl+Z: Undo last action (covers transforms, parameters, and Booleans).',
        '• Ctrl+Y: Redo last action.',
        '• Delete key: Delete selected part (outside text inputs).',
        '• Esc key: Close modals, exit caliper measurement mode, or exit sketch.'
      ],
      tipPt: 'Dica: Se a peça se perder no espaço 3D, basta pressionar a tecla F para recentralizar imediatamente.',
      tipEn: 'Tip: If parts drift out of view, simply press F to immediately re-center the camera.'
    },
    {
      id: 'gear_generator',
      categories: ['generators', 'modeling'],
      keywords: ['engrenagem', 'gear', 'dentes', 'modulo', 'involuta', 'envolvente', 'transmissao', 'redutor', 'furo', 'eixo'],
      titlePt: 'Gerador Paramétrico de Engrenagens Cilíndricas',
      titleEn: 'Parametric Spur Gear Generator',
      summaryPt: 'Gera engrenagens cilíndricas de dentes retos com perfil envolvente exato prontas para transmissão mecânica e impressão 3D.',
      summaryEn: 'Generates spur gears with true involute tooth profiles ready for mechanical transmission and 3D printing.',
      stepsPt: [
        '1. Clique no botão "⚙ Engrenagem" na barra superior.',
        '2. No painel lateral direito "Parâmetros", configure:',
        '   • Módulo (0,5 a 10 mm): Define o tamanho dos dentes (para engrenar duas peças, ambas precisam ter o mesmo módulo!).',
        '   • Número de dentes (6 a 120): Define o diâmetro primitivo ($D = \\text{módulo} \\times \\text{dentes}$).',
        '   • Espessura (1 a 100 mm): Largura da face da engrenagem.',
        '   • Furo central (0 a 100 mm): Diâmetro do furo para o eixo (use 0 para engrenagem maciça).',
        '   • Ângulo de pressão (14,5° a 25°, padrão industrial 20°).'
      ],
      stepsEn: [
        '1. Click the "⚙ Gear" button on the top ribbon.',
        '2. In the right "Parameters" panel, customize:',
        '   • Module (0.5 to 10 mm): Defines tooth size (mating gears must share identical module!).',
        '   • Tooth count (6 to 120): Defines pitch diameter ($D = \\text{module} \\times \\text{teeth}$).',
        '   • Face width / thickness (1 to 100 mm): Thickness of gear body.',
        '   • Bore diameter (0 to 100 mm): Center shaft bore (0 for solid gear).',
        '   • Pressure angle (14.5° to 25°, industry standard is 20°).'
      ],
      tipPt: 'Exemplo prático: Para fazer uma redução 2:1, crie uma engrenagem de 20 dentes e outra de 40 dentes com o mesmo módulo (ex.: Módulo 2). A distância entre eixos será de $(20+40) \\times 2 / 2 = 60\\text{ mm}$.',
      tipEn: 'Practical example: For a 2:1 gear ratio, create one 20-tooth gear and one 40-tooth gear with matching module (e.g. Module 2). Center distance will be $(20+40) \\times 2 / 2 = 60\\text{ mm}$.'
    },
    {
      id: 'bearing_608',
      categories: ['generators', 'mechanics'],
      keywords: ['rolamento', 'mancal', '608', 'skate', 'bearing', 'folga', 'pillow', 'bloco', 'alojamento'],
      titlePt: 'Mancal para Rolamento 608 (Pillow Block)',
      titleEn: '608 Ball Bearing Housing (Pillow Block)',
      summaryPt: 'Gera um bloco de suporte técnico com alojamento circular calibrado para o rolamento mais comum da indústria e de impressoras 3D (padrão skate 608: 8×22×7 mm).',
      summaryEn: 'Generates a mounting pillow block with precision-bored socket for the most ubiquitous 608 bearing (8×22×7 mm skate/printer standard).',
      stepsPt: [
        '1. Clique no botão "Mancal 608" na barra superior.',
        '2. O furo interno vem calibrado em Ø22,2 mm para permitir encaixe firme sob pressão (*snap-fit*) em impressoras FDM (compensando a contração térmica do filamento PLA/PETG).',
        '3. O mancal já possui furos inferiores para fixação com parafusos M4.',
        '4. Ajuste largura da base, altura do centro do eixo e espessura no painel de Parâmetros.'
      ],
      stepsEn: [
        '1. Click the "608 Bearing" button on the ribbon.',
        '2. The internal socket is calibrated at Ø22.2 mm to ensure a snug snap-fit on FDM 3D printers, compensating for filament shrinkage.',
        '3. Comes pre-drilled with mounting screw holes for M4 fasteners.',
        '4. Customize base width, shaft center height, and block depth in the Parameters panel.'
      ],
      tipPt: 'Se o rolamento entrar muito apertado na sua impressora, aumente o diâmetro do alojamento em 0,1 mm no painel.',
      tipEn: 'If the bearing fits too tightly on your printer, increase socket diameter by 0.1 mm in the panel.'
    },
    {
      id: 'brep_edge_finishing',
      categories: ['brep', 'finishing'],
      keywords: ['arredondar', 'fillet', 'chanfro', 'chamfer', 'casca', 'shell', 'aresta', 'acabamento', 'brep', 'raio'],
      titlePt: 'Acabamentos Analíticos B-Rep (Arredondar, Chanfro e Casca Oca)',
      titleEn: 'Analytic B-Rep Edge Finishing (Fillet, Chamfer, Shell)',
      summaryPt: 'Ferramentas de engenharia baseadas no kernel OpenCASCADE WebAssembly rodando em segundo plano.',
      summaryEn: 'Industrial edge tools computed by the background OpenCASCADE WebAssembly kernel.',
      stepsPt: [
        '• Arredondar (Fillet): Aplica concordância contínua de 2 mm nas arestas de sólidos paramétricos (cubos, cilindros, extrusões de esboço).',
        '• Chanfro (Chamfer): Aplica bisel angular de 1,5 mm para quebrar cantos vivos.',
        '• Casca (Shell): Transforma um bloco maciço em um pote/recipiente oco com espessura de parede de 2 mm.',
        '• Como aplicar: Selecione uma peça paramétrica suportada e clique no botão desejado no grupo BRep da barra superior.',
        '• Caso a geometria não suporte a concordância (ex.: raio incompatível), a peça original é mantida intacta e um aviso é exibido.'
      ],
      stepsEn: [
        '• Fillet: Blends sharp corners with continuous 2 mm tangent radii on supported parametric shapes.',
        '• Chamfer: Applies a 1.5 mm beveled transition.',
        '• Shell: Hollows out solid blocks into open thin-walled containers with 2 mm wall thickness.',
        '• How to apply: Select a supported parametric solid and click the operation button in the BRep ribbon group.',
        '• If edge curvature is incompatible, the original geometry is preserved and a clear notification is displayed.'
      ],
      tipPt: 'Estas operações são exclusivas para sólidos paramétricos e extrusões de esboço com definição B-Rep recuperável (não aplicáveis a malhas importadas de STL).',
      tipEn: 'These operations apply to parametric shapes and sketch extrusions with recoverable B-Rep topology (not applicable to imported STL meshes).'
    },
    {
      id: 'sketch_2d_solver',
      categories: ['sketch', 'modeling'],
      keywords: ['esboco', 'sketch', '2d', 'restricao', 'solver', 'extrusao', 'revolucao', 'cota', 'dof', 'linha', 'retangulo', 'circulo'],
      titlePt: 'Esboço 2D Paramétrico e Solver de Restrições Geométricas',
      titleEn: '2D Parametric Sketching & Geometric Constraint Solver',
      summaryPt: 'Crie perfis 2D exatos com linhas, retângulos e círculos, trave medidas com restrições e transforme em 3D com Extrusão ou Revolução.',
      summaryEn: 'Draft exact 2D profiles with lines, rectangles, and circles, lock geometry with constraints, and extrude or revolve into 3D.',
      stepsPt: [
        '1. Clique na aba "Esboço 2D" no topo da tela.',
        '2. Desenhe formas usando as ferramentas Linha, Retângulo ou Círculo, ou use o botão "＋ Forma por cotas" para digitar largura e altura numéricas.',
        '3. Selecione entidades e aplique restrições: Horizontal, Vertical, Coincidente, Distância/Cota, Paralela, Perpendicular ou Concêntrica.',
        '4. Clique em "Resolver Restrições": o algoritmo Levenberg-Marquardt calcula a posição exata e reporta os Graus de Liberdade (DOF).',
        '5. Gere o modelo 3D clicando em "Extrusão" (altura em mm) ou "Revolver 360°" para sólidos de revolução cilíndricos.',
        '6. Para alterar depois: selecione a extrusão na árvore e clique em "Editar esboço".'
      ],
      stepsEn: [
        '1. Click the "2D Sketch" tab at the top.',
        '2. Draw shapes using Line, Rectangle, or Circle, or click "＋ Shape by dimensions" for direct numeric width and height.',
        '3. Select entities and apply constraints: Horizontal, Vertical, Coincident, Distance/Dimension, Parallel, Perpendicular, or Concentric.',
        '4. Click "Solve Constraints": the Levenberg-Marquardt solver computes exact positions and reports Degrees of Freedom (DOF).',
        '5. Create 3D solids by clicking "Extrude" (height in mm) or "Revolve 360°" for rotational solids.',
        '6. To adjust later: select the extrusion in the tree and click "Edit sketch".'
      ],
      tipPt: 'Furos no esboço: basta desenhar um círculo totalmente dentro de um retângulo ou contorno fechado antes de extrudar!',
      tipEn: 'Holes in sketch: simply place a circle entirely inside an outer boundary before extruding!'
    },
    {
      id: 'kinematic_assemblies',
      categories: ['assembly', 'mechanics'],
      keywords: ['montagem', 'junta', 'articulacao', 'assembly', 'revolute', 'slider', 'rotacao', 'translacao', 'cinematica', 'animar'],
      titlePt: 'Montagens Cinemáticas e Juntas Articuladas',
      titleEn: 'Kinematic Assemblies & Articulated Joints',
      summaryPt: 'Conecte peças para simular mecanismos mecânicos articulados com juntas de rotação, deslizamento linear, fixas e esféricas.',
      summaryEn: 'Link multi-body parts to simulate articulated mechanisms with rotation, slider, fixed, and spherical joints.',
      stepsPt: [
        '1. Acesse a aba "Montagem" no painel direito.',
        '2. Escolha o Corpo Base (Pai) e o Corpo Articulado (Filho).',
        '3. Selecione o Tipo de Articulação: Revolute (Rotação), Slider (Translação linear), Fixed (Rígida) ou Ball (Esférica).',
        '4. Configure o eixo de atuação (X, Y ou Z) e os limites de curso (mínimo e máximo).',
        '5. Clique em "Adicionar Junta".',
        '6. Teste o movimento arrastando o controle deslizante ou clique em "Animar Cinemática" para ver o mecanismo funcionando em tempo real.',
        '7. As juntas e poses são salvas no arquivo de projeto JSON.'
      ],
      stepsEn: [
        '1. Go to the "Assembly" tab in the right panel.',
        '2. Pick the Base Body (Parent) and Articulated Body (Child).',
        '3. Select Joint Type: Revolute (Rotation), Slider (Linear stroke), Fixed (Rigid), or Ball.',
        '4. Set motion axis (X, Y, or Z) and stroke/angle limits (min and max).',
        '5. Click "Add Joint".',
        '6. Test motion using the interactive slider or click "Animate Kinematics" to watch mechanisms move in real time.',
        '7. All joints and poses are preserved in the JSON project file.'
      ],
      tipPt: 'Clique em "Posição Inicial" a qualquer momento para retornar todas as articulações à pose original de montagem.',
      tipEn: 'Click "Initial Position" at any time to reset all joints to their rest pose.'
    },
    {
      id: 'privacy_and_offline',
      categories: ['privacy', 'pwa'],
      keywords: ['offline', 'privacidade', 'pwa', 'instalar', 'sem internet', 'local', 'indexeddb', 'salvar', 'seguranca', 'nuvem'],
      titlePt: 'Privacidade, Salvamento Local e Uso Offline (PWA)',
      titleEn: 'Privacy, Local Storage, and Offline PWA Operation',
      summaryPt: 'O 3DCad Studio é 100% privado e client-side: nenhum arquivo, modelo ou coordenada é enviado para a nuvem.',
      summaryEn: '3DCad Studio is 100% private and client-side: no files, meshes, or coordinates are ever uploaded to cloud servers.',
      stepsPt: [
        '• Processamento Local: Todos os cálculos matemáticos, B-Rep e renderização rodam diretamente no hardware do seu computador/celular.',
        '• Salvamento Automático: Seu projeto é salvo continuamente no IndexedDB do navegador. Aguarde o aviso verde "Salvo neste navegador".',
        '• Backup Portátil: Use o botão "Salvar JSON" na barra superior para guardar uma cópia externa do projeto no seu computador.',
        '• Recuperação: O botão "Recuperar cópia anterior" permite restaurar a última versão salva caso cometa algum engano.',
        '• Uso Sem Internet (PWA): Instale o app pelo botão "+ Instalar" na barra superior (ou menu do navegador → "Instalar Aplicativo"). Abra-o conectado uma vez para carregar o cache; depois, você pode utilizá-lo completamente desconectado na bancada da sua oficina!'
      ],
      stepsEn: [
        '• Local Execution: All math, B-Rep, and 3D graphics compute directly on your local CPU/GPU.',
        '• Auto-Save: Projects are continuously saved in browser IndexedDB. Wait for the green "Saved in this browser" badge.',
        '• Portable Backups: Click "Save JSON" on the top ribbon to export a standalone project backup to your disk.',
        '• Recovery: The "Recover previous copy" button restores your prior saved state.',
        '• Offline PWA: Install via "+ Install" on the top ribbon (or browser menu → "Install App"). Load once online to populate cache, then use it fully offline at your workshop bench!'
      ],
      tipPt: 'Seus dados e criações 3D pertencem exclusivamente a você.',
      tipEn: 'Your CAD designs and data belong strictly to you.'
    }
  ];

  /**
   * Search knowledge base using local semantic token scoring
   */
  function search(query, lang = 'pt') {
    const qNorm = normalize(query);
    if (!qNorm) return [];
    const qTokens = qNorm.split(/\s+/).filter(t => t.length > 1);

    // Expand query with synonyms
    const expandedTokens = new Set(qTokens);
    for (const t of qTokens) {
      if (SYNONYMS[t]) {
        SYNONYMS[t].forEach(syn => expandedTokens.add(syn));
      }
    }

    const scored = KNOWLEDGE_BASE.map(item => {
      let score = 0;
      const title = normalize(lang === 'en' ? item.titleEn : item.titlePt);
      const summary = normalize(lang === 'en' ? item.summaryEn : item.summaryPt);
      const steps = (lang === 'en' ? item.stepsEn : item.stepsPt).map(normalize).join(' ');

      // Exact phrase match in title
      if (title.includes(qNorm)) score += 100;
      if (summary.includes(qNorm)) score += 50;

      // Token matches
      for (const tok of expandedTokens) {
        if (title.includes(tok)) score += 25;
        if (item.keywords.some(k => normalize(k) === tok || normalize(k).includes(tok))) score += 20;
        if (summary.includes(tok)) score += 10;
        if (steps.includes(tok)) score += 5;
      }

      return { item, score };
    });

    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(s => s.item);
  }

  /**
   * Answer a user question using Hybrid AI
   * 1. Uses local semantic RAG search to pull ground truth facts.
   * 2. If Chrome Built-in AI (window.ai / window.model) is available, synthesizes conversational answer.
   * 3. Otherwise, renders formatted structured local answer.
   */
  async function answerQuestion(query, lang = 'pt') {
    const isEn = lang === 'en';
    const matches = search(query, lang);

    if (!matches || matches.length === 0) {
      return {
        source: 'local_rag',
        found: false,
        text: isEn
          ? `I couldn't find a specific answer for "${query}". You can browse the 11 sections in the Complete Manual below or try asking about: Booleans / Holes, Slicers & Export (.STL / .3MF), STEP BRep, 2D Sketches & Constraints, Mechanical Generators (Gears, Bolts, Bearings), Assemblies, or Keyboard Shortcuts.`
          : `Não encontrei uma resposta exata para "${query}". Você pode consultar as 11 seções no Manual Completo abaixo ou perguntar sobre: Furos e Booleanas, Exportação para Fatiadores (STL/3MF), STEP BRep vs Facetado, Esboço 2D e Restrições, Geradores Mecânicos (Engrenagens, Parafusos, Mancal 608), Montagens, ou Atalhos de Teclado/Mouse.`
      };
    }

    const primary = matches[0];
    const contextFacts = [
      (isEn ? primary.summaryEn : primary.summaryPt),
      ...(isEn ? primary.stepsEn : primary.stepsPt),
      (isEn ? primary.tipEn : primary.tipPt)
    ].filter(Boolean).join('\n');

    // Check for Chrome Built-in AI (Gemini Nano)
    const hasWindowAi = typeof window !== 'undefined' && (window.ai?.languageModel || window.ai?.canCreateTextSession);
    if (hasWindowAi) {
      try {
        const capabilities = await window.ai.languageModel.capabilities();
        if (capabilities.available === 'readily') {
          const session = await window.ai.languageModel.create({
            systemPrompt: isEn
              ? 'You are the 3DCad Studio local assistant. Answer the user question concisely using strictly the provided facts. Keep formatting with bullets and mention that 3DCad runs 100% locally.'
              : 'Você é o assistente local do 3DCad Studio. Responda à pergunta do usuário de forma concisa e amigável baseando-se estritamente nos fatos técnicos fornecidos. Use tópicos e mencione que o 3DCad roda 100% local.'
          });
          const prompt = `Context:\n${contextFacts}\n\nQuestion: ${query}`;
          const aiResponse = await session.prompt(prompt);
          session.destroy();
          return {
            source: 'gemini_nano',
            found: true,
            title: isEn ? primary.titleEn : primary.titlePt,
            text: aiResponse,
            item: primary
          };
        }
      } catch (err) {
        console.warn('Gemini Nano fallback to local RAG:', err);
      }
    }

    // High-performance Local Semantic RAG formatting
    const formatted = [
      `### ${isEn ? primary.titleEn : primary.titlePt}`,
      '',
      isEn ? primary.summaryEn : primary.summaryPt,
      '',
      `**${isEn ? 'Step-by-step instructions:' : 'Passo a passo:'}**`,
      ...(isEn ? primary.stepsEn : primary.stepsPt).map(s => `• ${s.replace(/^[0-9]+\.\s*/, '')}`),
      '',
      primary.tipPt ? `> 💡 *${isEn ? primary.tipEn : primary.tipPt}*` : ''
    ].filter(Boolean).join('\n');

    return {
      source: 'local_rag',
      found: true,
      title: isEn ? primary.titleEn : primary.titlePt,
      text: formatted,
      item: primary,
      related: matches.slice(1, 3).map(m => isEn ? m.titleEn : m.titlePt)
    };
  }

  const SUGGESTIONS = {
    pt: [
      'Como furar ou cortar uma peça?',
      'Como exportar para Bambu Studio ou Cura?',
      'Qual a diferença entre STEP BRep e Facetado?',
      'Quais são os atalhos de teclado e mouse?',
      'Como criar engrenagens cilíndricas?',
      'Como funciona o mancal para rolamento 608?',
      'Como fazer montagens com juntas articuladas?',
      'Como funciona a privacidade e o modo offline?'
    ],
    en: [
      'How to drill holes or subtract solids?',
      'How to export for Bambu Studio or Cura?',
      'What is the difference between BRep & Faceted STEP?',
      'What are the keyboard & mouse shortcuts?',
      'How to generate spur gears?',
      'How does the 608 bearing housing work?',
      'How to create assemblies with joints?',
      'How does local privacy and offline PWA work?'
    ]
  };

  root.CadAssistant = {
    search,
    answerQuestion,
    normalize,
    KNOWLEDGE_BASE,
    SUGGESTIONS
  };

})(typeof window !== 'undefined' ? window : globalThis);
