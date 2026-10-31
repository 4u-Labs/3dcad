# Third-party notices

The application's own source is MIT licensed. Bundled libraries retain their
original copyright and license terms; they are not relicensed by this project.

- Three.js and its OrbitControls, STLLoader and STLExporter examples: MIT,
  copyright Three.js authors. https://github.com/mrdoob/three.js/blob/master/LICENSE
- CSG implementation: MIT, copyright Evan Wallace (2011), with Three.js work by
  thrax/manthrax. Attribution and license notice are retained in `libs/three-csg.js`.
  https://github.com/manthrax/THREE-CSGMesh
- Development-only tests use jsdom (MIT) and fake-indexeddb (Apache-2.0).
  Their license files are supplied by npm and excluded from the static deployment.

FreeCAD and SolidCraft are independent projects, cited as interface/workflow
inspirations. This application does not bundle either project's CAD kernel or
claim compatibility with their native project formats.

Full MIT notices for the bundled Three.js and CSG code are included in `licenses/`.
