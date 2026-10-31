# 3DCad Studio 1.3 — Dual CAD: BRep Exato (OpenCASCADE WASM) & Malhas

[Português](#português) · [English](#english) · [Abrir / Open](https://4u.ia.br/app/3dcad/)

## Português

Estúdio CAD 3D completo e privado no navegador, unindo o melhor de modeladores paramétricos baseados em malhas (SolidCraft) com o poder analítico de núcleos BRep industriais (FreeCAD / Fusion 360). 100% no cliente, sem login, sem telemetria e com suporte offline PWA.

### Principais Funcionalidades

1. **Núcleo CAD BRep Exato (Open CASCADE Technology 7.8 em WebAssembly)**
   - Sólidos analíticos perfeitos: Cubo, Cilindro, Esfera, Cone e Torus.
   - Operações avançadas: **Extrusão**, **Revolução 360° (Revolve)**, **Loft** (transição suave entre seções) e **Varredura (Sweep)** ao longo de espinhas 3D.
   - Acabamento de arestas analítico: **Arredondamento (Fillet BRep)**, **Chanfro (Chamfer BRep)** e **Casca Oca (Shell)**.
   - Execução em **Web Worker dedicado** (`cad_worker.js` via `cad_kernel.js`), mantendo a interface a 60 FPS mesmo durante operações geométricas pesadas.

2. **Esboços 2D com Solver de Restrições Geométricas & Cotas**
   - Solver não-linear amortecido de Levenberg-Marquardt com análise de posto QR Jacobiano e Graus de Liberdade (DOF).
   - Suporte a 16 restrições: Horizontal, Vertical, Coincidente, Distância/Cota, Tangente, Perpendicular, Paralela, Igualdade, Concêntrica, Fixa e Ângulo.
   - Extrator topológico automático de contornos fechados (loops externos e furos concêntricos/aninhados).

3. **Histórico Paramétrico Recomputável (Parametric History Graph)**
   - Grafo de operações acíclico direcionado (DAG) que recalcula automaticamente sólidos dependentes a cada alteração.
   - Scrubber de linha do tempo com reprodução passo a passo e animação da construção da peça.

4. **Montagens Cinemáticas & Simulação Interativa**
   - Gerenciador de montagens multi-corpos (`cad_assembly.js`).
   - Juntas cinemáticas: **Revolute (Rotação)**, **Slider (Translação Linear)**, **Fixed (Rígida)** e **Ball (Esférica 3D)**.
   - Limites angulares/lineares de fim de curso e cinemática direta em tempo real com slider interativo e reprodução contínua no viewport 3D.

5. **Intercâmbio CAD Industrial Multi-Formato**
   - **.STEP BRep Analítico (ISO-10303-21)**: Exportação e importação de curvas e superfícies exatas sem aproximação poligonal.
   - **.3MF**: Metadados fechados, tolerâncias e cores de impressão 3D multicolor.
   - **.STL** (Binário normalizado) e **.OBJ** (Malhas facetadas).
   - **.JSON v2**: Projetos completos versionados com transações, histórico de desfazer/refazer (Ctrl+Z / Ctrl+Y) e persistência redundante em IndexedDB e localStorage.

6. **Servidor de Automação MCP (Model Context Protocol)**
   - Endpoint oficial para copilotos e agentes de IA (Antigravity, Claude Desktop, Cursor, Codex).
   - 8 ferramentas cadastradas: `cad_get_status`, `cad_create_solid`, `cad_create_extrusion`, `cad_solve_sketch`, `cad_add_assembly_joint`, `cad_export_step`, `cad_export_stl`, `cad_clear_scene`.
   - 2 recursos em tempo real: `cad://project/json` e `cad://project/summary`.
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

# Executar suite completa de 51 testes automatizados
npm test

# Servir localmente
python3 -m http.server 8080
# Acesse no navegador: http://127.0.0.1:8080/
```

---

## English

Full-featured, private in-browser 3D CAD studio uniting the intuitive direct mesh modeling of SolidCraft with the exact mathematical BRep kernel of industrial systems (FreeCAD / Fusion 360). 100% client-side, zero login, zero telemetry, and full PWA offline capability.

### Key Features

1. **Exact BRep CAD Kernel (Open CASCADE Technology 7.8 in WebAssembly)**
   - Mathematically exact solids: Box, Cylinder, Sphere, Cone, and Torus.
   - Advanced modeling operations: **Extrude**, **360° Revolve**, **Loft** (smooth transitions across cross-sections), and **Sweep** along 3D spines.
   - Watertight edge finishing: **Fillet BRep**, **Chamfer BRep**, and **Hollow Shell**.
   - Background computation in a **dedicated Web Worker** (`cad_worker.js` via `cad_kernel.js`), ensuring a locked 60 FPS responsive viewport.

2. **2D Sketches with Geometric Constraint Solver & DOF Analysis**
   - Damped Levenberg-Marquardt non-linear solver with QR Jacobian rank analysis and Degrees of Freedom (DOF) tracking.
   - 16 constraint types: Horizontal, Vertical, Coincident, Distance/Dimension, Tangent, Perpendicular, Parallel, Equal, Concentric, Fixed, and Angle.
   - Closed planar loop topology extractor for outer wires and nested concentric holes.

3. **Recomputable Parametric History Graph**
   - DAG dependency tree automatically recomputing downstream operations whenever parent parameters or sketch dimensions change.
   - Interactive timeline scrubber with step-by-step playback and construction animation.

4. **Kinematic Assemblies & Motion Simulation**
   - Multi-body assembly manager (`cad_assembly.js`).
   - Kinematic joints: **Revolute (Rotation)**, **Slider (Prismatic)**, **Fixed**, and **Ball (Spherical)**.
   - Hard motion limits, forward kinematics, interactive slider control, and real-time motion playback directly in the Three.js viewport.

5. **Multi-Format CAD Interchange**
   - **Analytic .STEP (ISO-10303-21)**: True BRep topology export/import with exact curves.
   - **.3MF**: Multi-color and multi-body 3D print archive with CRC validation.
   - **Binary .STL** and **.OBJ** mesh export.
   - **Versioned .JSON v2**: Transactional project persistence with undo/redo snapshots and IndexedDB storage.

6. **Model Context Protocol (MCP) Server**
   - Standardized AI agent automation endpoint for Antigravity, Claude, Cursor, and Codex.
   - 8 tools: `cad_get_status`, `cad_create_solid`, `cad_create_extrusion`, `cad_solve_sketch`, `cad_add_assembly_joint`, `cad_export_step`, `cad_export_stl`, `cad_clear_scene`.
   - 2 resources: `cad://project/json` and `cad://project/summary`.
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
