const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function core(){const context={console,Blob,TextEncoder,TextDecoder,Uint8Array,Uint32Array,DataView,ArrayBuffer,URL,setTimeout,clearTimeout,ReadableStream:globalThis.ReadableStream,DecompressionStream:globalThis.DecompressionStream};context.window=context;vm.createContext(context);for(const file of ['libs/three.min.js','libs/three-csg.js','libs/STLLoader.js','cad_mesh.js','cad_generators.js','cad_project.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});return context;}
function app(){
 const {JSDOM}=require('jsdom'),{IDBFactory}=require('fake-indexeddb');
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'http://localhost/3dcad/',runScripts:'outside-only',pretendToBeVisual:true});
 const context=dom.getInternalVMContext(),w=dom.window,downloads=[];
 w.Blob=Blob;w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.indexedDB=new IDBFactory();
 w.requestAnimationFrame=()=>0;w.URL.createObjectURL=blob=>{downloads.push(blob);return 'blob:test';};w.URL.revokeObjectURL=()=>{};
 w.HTMLAnchorElement.prototype.click=()=>{};
 w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({},{get:()=>()=>{}});
 w.HTMLElement.prototype.scrollIntoView=()=>{};
 for(const file of ['libs/three.min.js','libs/three-csg.js','libs/STLLoader.js','cad_mesh.js','cad_generators.js','cad_project.js','ui_text.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
 w.THREE.WebGLRenderer=class {constructor(){this.shadowMap={};}setPixelRatio(){}setSize(){}render(){}};
 w.THREE.OrbitControls=class {constructor(){this.target=new w.THREE.Vector3();}update(){}};
 let source=fs.readFileSync(path.join(root,'app.js'),'utf8');
 source=source.replace('  bootStudio();\n})();',`  window.audit={createParametricSolid,serializeSceneState,restoreSceneFromItems,pushUndoSnapshot,undo,redo,clearAllSolids,drillQuickHoleOnSelected,runBooleanOp,rebuildSolidGeometry,exportStl,importFile,flushEdits,bootStudio,projectStore,saveAutoSave,applyLanguage,selectSolid,previewCommand,applyCommand,DEFAULT_PARAMS,get solids(){return solids;},get selected(){return selectedSolid;},get undoDepth(){return undoStack.length;},get nextId(){return idCounter;},set booting(v){isBooting=v;},reset(){flushEdits();clearAllSolids(false);undoStack=[];redoStack=[];}};\n})();`);
 vm.runInContext(source,context,{filename:'app.js'});
 return {w,A:w.audit,C:w.CadGenerators,P:w.CadProject,M:w.CadMesh,T:w.THREE,downloads,$:s=>w.document.querySelector(s),close:()=>dom.window.close(),edit(selector,value){const el=w.document.querySelector(selector);el.value=String(value);el.dispatchEvent(new w.Event('input',{bubbles:true}));el.dispatchEvent(new w.Event('change',{bubbles:true}));},click:selector=>w.document.querySelector(selector).click()};
}
module.exports={core,app,root,plain:value=>JSON.parse(JSON.stringify(value))};
