# 3DCad Studio 1.3.7 — BRep analítico e modelagem por malhas

[Português](#português) · [English](#english) · [Abrir / Open](https://4u.ia.br/app/3dcad/)

## Português

Modelador CAD 3D local no navegador, com sólidos paramétricos, operações por malha e algumas operações BRep no OpenCASCADE. Sem login ou telemetria. O PWA pode funcionar offline após a instalação completa dos arquivos.

### Principais Funcionalidades

1. **Núcleo CAD BRep Exato (Open CASCADE Technology 7.8 em WebAssembly)**
   - Sólidos analíticos perfeitos: Cubo, Cilindro, Esfera, Cone e Torus.
   - Operações avançadas: **Extrusão**, **Revolução 360° (Revolve)**, **Loft** (transição suave entre seções) e **Varredura (Sweep)** ao longo de espinhas 3D.
   - Acabamento de arestas analítico: **Arredondamento (Fillet BRep)**, **Chanfro (Chamfer BRep)** e **Casca Oca (Shell)**.
   - Cálculo BRep em **Web Worker dedicado** (`cad_worker.js` via `cad_kernel.js`); a taxa de quadros depende do dispositivo e do tamanho do modelo.

2. **Esboços 2D com Solver de Restrições Geométricas & Cotas**
   - Solver não-linear amortecido de Levenberg-Marquardt com análise de posto QR Jacobiano e Graus de Liberdade (DOF).
   - Solver com 16 tipos de restrição. A interface aplica somente as que são compatíveis com a forma escolhida; largura de retângulos e diâmetro de círculos aceitam cota numérica.
   - Extrator topológico automático de contornos fechados (loops externos e furos concêntricos/aninhados).

3. **Parâmetros e linha do tempo**
   - Parâmetros de peças e esboços podem ser editados. O grafo BRep recomputável existe como módulo experimental; a linha do tempo da interface mostra peças, sem dependências completas entre operações.

4. **Montagens Cinemáticas & Simulação Interativa**
   - Gerenciador de montagens multi-corpos (`cad_assembly.js`).
   - Juntas **Revolute**, **Slider** e **Fixed**. A opção **Ball** atualmente controla um único ângulo em torno do eixo escolhido, sem três graus de liberdade.
   - Limites angulares/lineares de fim de curso e cinemática direta em tempo real com slider interativo e reprodução contínua no viewport 3D.

5. **Intercâmbio CAD Industrial Multi-Formato**
   - **.STEP BRep Analítico (ISO-10303-21)**: exporta os primitivos e extrusões que têm definição analítica recuperável. Peças de malha exigem o botão separado de STEP facetado. A importação STEP é triangulada para edição e salvamento no projeto.
   - **.3MF**: importa unidade e transformações de itens; exporta peças e cores. Não preserva propriedades avançadas de fabricação.
   - **.STL** (Binário normalizado) e **.OBJ** (Malhas facetadas).
   - **.JSON v2**: Projetos versionados com peças, esboços e juntas; a sessão de edição oferece desfazer/refazer (Ctrl+Z / Ctrl+Y) e salvamento em IndexedDB com cópia local quando possível.

6. **Servidor de Automação MCP (Model Context Protocol)**
   - Endpoint oficial para copilotos e agentes de IA (Antigravity, Claude Desktop, Cursor, Codex).
   - 8 ferramentas cadastradas: `cad_get_status`, `cad_create_solid`, `cad_create_extrusion`, `cad_solve_sketch`, `cad_add_assembly_joint`, `cad_export_step`, `cad_export_stl`, `cad_clear_scene`.
   - 2 recursos da sessão MCP: `cad://project/json` e `cad://project/summary`. O servidor mantém uma cena própria em memória e não sincroniza automaticamente com a aba do navegador. `cad_export_step` gera STEP facetado.
   - Inicialização simples via stdio:
     ```bash
     npm run mcp
     # ou: node mcp_server.cjs
     ```

### Instalação e Testes

```bash
# Instalar dependências de desenvolvimento
npm ci

# Validar sintaxe de todos os módulos
npm run check

# Executar os testes automatizados
npm test

# Servir localmente
python3 -m http.server 8080
# Acesse no navegador: http://127.0.0.1:8080/
```

---

## English

Local browser CAD modeler with parametric solids, mesh operations, and selected OpenCASCADE BRep operations. No login or telemetry. The PWA can work offline once its assets have finished caching.

### Key Features

1. **Exact BRep CAD Kernel (Open CASCADE Technology 7.8 in WebAssembly)**
   - Mathematically exact solids: Box, Cylinder, Sphere, Cone, and Torus.
   - Advanced modeling operations: **Extrude**, **360° Revolve**, **Loft** (smooth transitions across cross-sections), and **Sweep** along 3D spines.
   - Watertight edge finishing: **Fillet BRep**, **Chamfer BRep**, and **Hollow Shell**.
   - BRep computation runs in a **dedicated Web Worker** (`cad_worker.js` via `cad_kernel.js`); frame rate depends on the device and model size.

2. **2D Sketches with Geometric Constraint Solver & DOF Analysis**
   - Damped Levenberg-Marquardt non-linear solver with QR Jacobian rank analysis and Degrees of Freedom (DOF) tracking.
   - The solver supports 16 constraint types. The UI accepts constraints that apply to the selected shape; rectangles and circles accept numeric width and diameter dimensions.
   - Closed planar loop topology extractor for outer wires and nested concentric holes.

3. **Parameters and timeline**
   - Parts and sketches have editable parameters. The recomputable BRep graph is an experimental module; the UI timeline lists parts without a complete operation dependency graph.

4. **Kinematic Assemblies & Motion Simulation**
   - Multi-body assembly manager (`cad_assembly.js`).
   - **Revolute**, **Slider**, and **Fixed** joints. The current **Ball** control rotates about one selected axis rather than offering three degrees of freedom.
   - Hard motion limits, forward kinematics, interactive slider control, and real-time motion playback directly in the Three.js viewport.

5. **Multi-Format CAD Interchange**
   - **Analytic .STEP (ISO-10303-21)**: exports supported primitives and extrusions with recoverable definitions. Mesh parts use the separate faceted STEP action. STEP import is tessellated for editing and project storage.
   - **.3MF**: imports units and build-item transforms; exports parts and colors. Advanced manufacturing properties are not retained.
   - **Binary .STL** and **.OBJ** mesh export.
   - **Versioned .JSON v2**: Transactional project persistence with undo/redo snapshots and IndexedDB storage.

6. **Model Context Protocol (MCP) Server**
   - Standardized AI agent automation endpoint for Antigravity, Claude, Cursor, and Codex.
   - 8 tools: `cad_get_status`, `cad_create_solid`, `cad_create_extrusion`, `cad_solve_sketch`, `cad_add_assembly_joint`, `cad_export_step`, `cad_export_stl`, `cad_clear_scene`.
   - 2 resources for the MCP session: `cad://project/json` and `cad://project/summary`. The MCP scene is separate from the browser tab; `cad_export_step` writes a faceted STEP.
   - Start via:
     ```bash
     npm run mcp
     # or: node mcp_server.cjs
     ```

### Development & Verification

```bash
npm ci
npm run check
npm test
```

[Portal 4U](https://4u.ia.br/) · [Apps](https://4u.ia.br/loja/) · [Central de Ajuda / Help](https://4u.ia.br/suporte.html) · [GitHub](https://github.com/4u-Labs) · [Apoiar / Donate](https://www.paypal.com/ncp/payment/L7YRCS984T33N)
