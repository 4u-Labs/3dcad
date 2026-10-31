# 3DCad Studio 1.2

[Português](#português) · [English](#english) · [Abrir / Open](https://4u.ia.br/app/3dcad/)

## Português

Modelador 3D por malhas, local e sem login. Interface CAD, parâmetros em mm,
13 geradores, esboços com cotas numéricas, extrusão, CSG, padrões configuráveis,
espelhamento, estimativas de impressão e comandos locais em PT/EN.

- Projetos JSON v2 preservam malhas STL/CSG, parâmetros, transformações,
  visibilidade e identificadores. Autosave em IndexedDB com cópia anterior;
  fallback em localStorage. Exporte JSON para backup fora do navegador.
- Importação validada e transacional. A falha não substitui a cena atual.
- STL/OBJ/3MF usam mm e Z vertical. 3MF preserva objetos e cores. Exportadores
  consolidam vértices, tratam espelhos, removem degenerações e dividem T-junctions.
- STEP **facetado** inclui produto, contexto, faces planas explícitas e sólidos.
  Não preserva superfícies analíticas ou histórico. Malhas abertas ou inválidas
  são recusadas por 3MF/STEP; cascas internas desconectadas não são suportadas
  pelo STEP atual. Verifique os arquivos no software de destino.
- Comandos são interpretados por regras e exigem revisão antes de aplicar;
  não há IA generativa nem servidor MCP. Arquivos JSON legados são migrados.
- Ajuda bilíngue, atalhos, controles por teclado e instalação PWA com fallback
  para Safari/iOS e menus de Android/Desktop. Ícone fornecido por Fabiano.
- Service worker cacheia somente os recursos do próprio app, com prefixo
  exclusivo. A instalação offline falha se um recurso obrigatório faltar.

### Uso local e testes

```bash
python3 -m http.server 8080
# abrir http://127.0.0.1:8080/
npm ci
npm run check
npm test
```

O app não precisa de npm em produção. Publique os arquivos HTML/CSS/JS, manifest,
ícones e `libs/`; não publique `.git`, `node_modules`, testes ou projetos pessoais.
Os testes usam DOM/IndexedDB emulados e executam as funções reais; a validação de
geometria e exportação independe de WebGL. Validação adicional de STEP foi feita
com Open CASCADE através do leitor Python OCP.

### Limites

É um modelador por malhas, sem núcleo BRep de edição, solver de restrições,
juntas de montagem, fatiamento ou G-code. A visualização sequencial de corpos não
é histórico paramétrico. CSG mantém o resultado, sem dependências editáveis das
operações anteriores. Engrenagens são aproximadas; parafusos sem rosca helicoidal;
polias sem dentes GT2; tampas com rebordo e folga, sem trava snap-fit.

Limites de proteção: 150 peças, 250.000 triângulos por projeto/exportação,
32 MB por arquivo JSON/STL e 30.000 triângulos por operando CSG. Use um CAD e
um fatiador adequados para validar geometria, tolerâncias e fabricação.

### Evolução de arquitetura

A próxima geração de modelagem exata deve usar Open CASCADE/OCCT em WebAssembly,
com grafo de operações versionado, seleção persistente de faces e tolerâncias
explícitas. O solver de esboços e as relações de montagem devem operar sobre esse
grafo, com transações e recomputação, sem simular BRep em malhas. Esta versão
estabiliza o fluxo de malhas e o intercâmbio facetado; essa arquitetura futura
não está implementada nem é anunciada como recurso disponível.

## English

Local, login-free mesh modeler. CAD interface, millimeter parameters, 13 part
generators, numerically editable sketches, extrusion, mesh CSG, configurable
patterns, mirrors, print estimates and rule-based PT/EN local commands.

JSON v2 keeps imported/Boolean meshes, transforms, visibility and IDs. IndexedDB
autosave includes a previous copy and localStorage fallback. Keep external JSON
backups: clearing browser storage removes local projects. Imports are validated
and staged before replacing the scene. Legacy projects are migrated.

STL/OBJ/3MF preserve world transforms in mm and Z up; 3MF keeps separate parts and
colors. Faceted STEP writes explicit planar faces and solids, without analytic
surfaces or history. 3MF/STEP reject invalid/open meshes; disconnected internal
shells are currently unsupported in STEP. Always check exports independently.

The PWA includes an installation prompt when available, iOS/Android/Desktop
fallback instructions and an isolated offline cache. The supplied artwork is used
for standard icons and a separate safe-area maskable icon. All work stays in the
browser; no paid API, account or backend is required.

Run the static server and tests using the commands above. npm dependencies are
for development only. Editing BRep, sketch constraint solving, assembly joints,
generative AI, MCP, slicing and G-code are not implemented. Gears are approximate;
bolts have no helical thread, pulleys no GT2 teeth, and lids no snap latch.

[Portal](https://4u.ia.br/) · [Apps](https://4u.ia.br/loja/) ·
[Support](https://4u.ia.br/suporte.html) · [GitHub](https://github.com/4u-Labs) ·
[Donate / Apoiar](https://www.paypal.com/ncp/payment/L7YRCS984T33N)
