# 3DCad Studio — Agent & Developer Instructions (AGENTS.md)

> **Nota para Agentes de IA (Codex, Antigravity, Claude, Cursor):**
> Este arquivo é a fonte da verdade definitiva sobre o **3DCad Studio**. Leia atentamente antes de sugerir ou realizar qualquer alteração no código.

---

## 1. 📐 Visão Geral & Arquitetura Atual (v1.4.1)

O **3DCad Studio** é um estúdio de modelagem 3D paramétrica e bancada para impressão 3D direto no navegador, 100% local, privado e sem login. Ele opera com uma arquitetura **Dual CAD** combinada a um **Assistente de IA Local Híbrido**:
1. **Núcleo B-Rep Analítico (OpenCASCADE WebAssembly):** Operações exatas de engenharia executadas em Web Worker dedicado (`cad_worker.js` / `cad_kernel.js` / `cad_exact_engine.js`) para evitar travamento da interface. Suporta primitivas analíticas, extrusão, revolução 360°, loft, varredura (*sweep*), acabamentos de aresta (*Fillet* e *Chamfer*) e casca oca (*Shell*), além de intercâmbio STEP analítico (ISO-10303-21).
2. **Núcleo de Malhas Poligonais & CSG (Three.js / BSP Trees):** Manipulação de malhas facetadas importadas (.STL até 150 MB e decimação automática para >1M triângulos, .3MF multipart/multicolor com descompressão nativa ZIP) e operações booleanas rápidas (União $A \cup B$, Subtração/Furo $A - B$, Interseção $A \cap B$).
3. **Assistente IA Local Híbrido (`cad_assistant.js`):** Motor semântico RAG instantâneo em memória + suporte nativo a Chrome Built-in AI (`window.ai` / Gemini Nano local) para responder dúvidas técnicas dos usuários em linguagem natural, 100% no cliente e sem nuvem.

---

## 2. 🧱 Módulos do Sistema

| Arquivo | Função e Responsabilidade |
|---|---|
| `app.js` | Orquestrador principal da UI, Three.js viewport, seleção, transformações, desfazer/refazer com juntas/bases, integração de montagem, exportação e modais. |
| `cad_kernel.js` | Interface de comunicação (`postMessage`) entre a thread principal da UI e o worker OpenCASCADE. |
| `cad_worker.js` | Web Worker dedicado que carrega o WebAssembly do OpenCASCADE e processa operações B-Rep pesadas de forma assíncrona. |
| `cad_exact_engine.js` | Modelagem matemática B-Rep, nós do grafo histórico paramétrico recomputável e exportação/importação STEP analítico. |
| `cad_sketch_solver.js` | Solver não-linear de restrições geométricas 2D (algoritmo Levenberg-Marquardt amortecido com decomposição QR Jacobiana, cálculo de graus de liberdade DOF e 16 tipos de restrição). |
| `cad_generators.js` | Geradores mecânicos paramétricos: engrenagens cilíndricas com dentes envolventes exatos, parafusos e porcas sextavadas métricas (M3 a M20), mancais para rolamento 608, suportes L, placas perfuradas e gabinetes eletrônicos com tampa de encaixe. |
| `cad_assembly.js` | Gerenciador de montagens cinemáticas multi-corpos (`AssemblyManager`), articulações com limites de curso (*Revolute*, *Slider*, *Fixed*, *Ball*), cinemática direta, simulação interativa e serialização no projeto. |
| `cad_mesh.js` | Processamento de malhas: leitor binário/ASCII STL de alta capacidade com decimação automática, descompactador nativo 3MF (ZIP) preservando cores/objetos, e validação de malhas estanques (*watertight*). |
| `cad_project.js` | Esquema de documento de projeto versionado, validação transacional e integração com armazenamento local IndexedDB/localStorage. |
| `mcp_server.cjs` | Servidor Model Context Protocol (MCP) oficial: 8 ferramentas de automação CAD (`cad_get_status`, `cad_create_solid`, `cad_create_extrusion`, `cad_solve_sketch`, `cad_add_assembly_joint`, `cad_export_step`, `cad_export_stl`, `cad_clear_scene`) e 2 recursos (`cad://project/json`, `cad://project/summary`). |
| `ui_text.js` | Dicionários de internacionalização 100% bilíngues (`PT-BR` e `EN`), incluindo a Central de Ajuda com 11 seções técnicas completas. |
| `sw.js` | Service Worker para suporte PWA completo e funcionamento offline. |

---

## 3. 🧪 Suíte de Testes e Validação Obrigatória

Antes de qualquer commit ou deploy, a suíte de testes deve passar com **zero falhas**:

```bash
# 1. Validar sintaxe de todos os módulos JavaScript
npm run check

# 2. Executar toda a suíte de testes automatizados (atualmente 65 testes)
npm test

# 3. Testar servidor MCP
npm run mcp
```

### Arquivos de Testes (`tests/`):
- `tests/assembly.test.cjs`: Validação de juntas cinemáticas, restrições e cinemática direta.
- `tests/exact_engine.test.cjs`: Volumes analíticos exatos, revolução, acabamentos BRep (*Fillet*, *Chamfer*, *Shell*), histórico paramétrico e STEP B-Rep.
- `tests/export.test.cjs`: Exportação normalizada STL, 3MF compactado, STEP facetado e malhas.
- `tests/generators.test.cjs`: Engrenagens, cotas de esboço, furações, faturamento e unidades.
- `tests/mcp.test.cjs`: Ferramentas de automação e recursos MCP.
- `tests/project.test.cjs`: Persistência transacional, CSG, desfazer/refazer, recuperação IndexedDB, atalhos de teclado e tradução.
- `tests/regressions.test.cjs`: Testes de regressão cobrindo importação 3MF com transformação de unidades, estabilidade de juntas e integridade de esboços.
- `tests/sketch_solver.test.cjs`: Solver de restrições geométricas, matriz Jacobiana e graus de liberdade (DOF).
- `tests/sw.test.cjs`: Isolamento de cache, suporte offline e manifest PWA.

---

## 4. 🚀 URLs & Deploy em Produção

- **Ambiente de Produção:** `https://4u.ia.br/app/3dcad/`
- **Repositório GitHub Oficial:** `https://github.com/4u-Labs/3dcad`
- **Caminho Local:** `/home/fabiano/public_html/app/3dcad/`
- **Caminho na VPS Oracle:** `/home/fabiano/htdocs/4u.ia.br/app/3dcad/`
- **Deploy via Rsync:**
  ```bash
  rsync -avz --delete --exclude='.git' --exclude='node_modules' --exclude='.system_generated' --rsync-path="sudo rsync" /home/fabiano/public_html/app/3dcad/ ubuntu@137.131.249.105:/home/fabiano/htdocs/4u.ia.br/app/3dcad/
  ssh -i ~/.ssh/id_ed25519 ubuntu@137.131.249.105 "sudo chown -R fabiano:fabiano /home/fabiano/htdocs/4u.ia.br/app/3dcad && sudo chmod -R 755 /home/fabiano/htdocs/4u.ia.br/app/3dcad"
  ```

---

## 5. 🛡️ Diretrizes Permanentes de Desenvolvimento

1. **Privacidade e Processamento no Cliente:** Nunca envie malhas, coordenadas ou geometrias para APIs de nuvem externas. Todo o cálculo matemático e gráfico deve ocorrer na máquina do usuário via WebAssembly/GPU.
2. **Bilinguismo Completo (PT/EN):** Qualquer novo botão, rótulo, dica ou mensagem de erro deve ter tradução correspondente tanto no objeto `pt` quanto no objeto `en` de `ui_text.js` ou `app.js`.
3. **Redutor de Engrenagens como Projeto Padrão:** O exemplo padrão ao iniciar o aplicativo é o **Redutor de Engrenagens** (`gearbox`). O modelo JCB 3CX foi removido do início. O T-800 Endoskull está disponível como modelo de alta capacidade em STL.
4. **Cache & Service Worker:** Ao alterar qualquer arquivo do app, atualize a versão em `package.json` e a constante `CACHE_NAME` em `sw.js` (ex.: `v1.4.1`) para que os usuários recebam os novos arquivos imediatamente.
