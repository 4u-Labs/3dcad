const {test}=require('node:test'),assert=require('node:assert/strict');
const {app,plain}=require('./harness.cjs');
function fixture(t){const f=app();t.after(f.close);return f;}
test('CSG survives document, reload, undo and redo with exact mesh positions',t=>{
 const {A,P}=fixture(t);A.createParametricSolid('BOX');A.drillQuickHoleOnSelected(6);
 assert.equal(A.solids[0].userData.type,'CSG_SOLID');const original=plain(A.serializeSceneState());
 assert.equal(original.length,1);assert(original[0].geometry.positions.length>0);
 A.restoreSceneFromItems(P.read(JSON.stringify(P.document(original))).solids);assert.deepEqual(plain(A.serializeSceneState()),original);
 A.pushUndoSnapshot();A.createParametricSolid('BOX');A.undo();assert.deepEqual(plain(A.serializeSceneState()),original);A.redo();assert.equal(A.solids.length,2);assert.equal(A.solids[0].userData.type,'CSG_SOLID');
});
test('STL import applies inverse axis transform and survives project roundtrip',async t=>{
 const {A,M,T}=fixture(t);const mesh=new T.Mesh(new T.BoxGeometry(40,20,30));mesh.position.set(50,10,60);mesh.rotation.y=Math.PI/2;
 const blob=M.stl([mesh]);await A.importFile({name:'fixture.stl',size:blob.size,arrayBuffer:()=>blob.arrayBuffer()});
 const state=plain(A.serializeSceneState());assert.equal(state[0].type,'STL_IMPORT');A.restoreSceneFromItems(state);assert.deepEqual(plain(A.serializeSceneState()),state);
 const box=new T.Box3().setFromObject(A.solids[0]);assert(box.min.distanceTo(new T.Vector3(35,0,40))<1e-8);assert(box.max.distanceTo(new T.Vector3(65,20,80))<1e-8);
});
test('mirror, visibility and full precision survive save/reopen; new IDs remain unique',t=>{
 const {$,A,click}=fixture(t);A.createParametricSolid('BOX',{pos:[0.123456789,10,7.234567891],rot:[1.23456789,12.3456789,0]});click('#btnMirrorX');assert(Math.abs(A.solids[1].scale.x+1)<1e-12);
 A.solids[0].visible=false;const saved=plain(A.serializeSceneState());A.restoreSceneFromItems(saved);const restored=plain(A.serializeSceneState());for(let i=0;i<saved.length;i++){assert.equal(restored[i].visible,saved[i].visible);for(const key of ['pos','rot','scale'])saved[i][key].forEach((n,j)=>assert(Math.abs(n-restored[i][key][j])<1e-10));}
 A.createParametricSolid('BOX');assert.equal(new Set(A.solids.map(m=>m.userData.id)).size,3);
});
test('failed import, unsupported version and invalid geometry preserve the current scene',async t=>{
 const {A,P}=fixture(t);A.createParametricSolid('BOX');const saved=plain(A.serializeSceneState());
 for(const bad of [[null],[{type:'UNKNOWN'}],[{type:'STL_IMPORT',geometry:{positions:[0,0,0]}}]]){assert.throws(()=>A.restoreSceneFromItems(bad));assert.deepEqual(plain(A.serializeSceneState()),saved);}
 assert.throws(()=>P.read({format:'3dcad-project',version:99,solids:[]}));assert.throws(()=>P.read({units:'inch',solids:[]}));
 await assert.rejects(()=>A.importFile({name:'bad.json',size:20,text:async()=>'{"solids":[null]}'}));assert.deepEqual(plain(A.serializeSceneState()),saved);
});
test('geometry construction failure is transactional, including earlier staged objects',t=>{
 const {A}=fixture(t);A.createParametricSolid('BOX');const before=plain(A.serializeSceneState());
 const invalidSketch={type:'SKETCH_EXTRUDE',params:{height:10,bevel:0,entities:[{kind:'rect',x:0,y:0,w:20,h:20},{kind:'circle',x:90,y:0,r:3,isHole:true}]}};
 assert.throws(()=>A.restoreSceneFromItems([{type:'BOX'},invalidSketch]));assert.deepEqual(plain(A.serializeSceneState()),before);
});
test('numeric parameters, transforms, colors and names can be undone',t=>{
 const {A,edit,click}=fixture(t);A.createParametricSolid('BOX');edit('#param_width',80);assert.equal(A.selected.userData.params.width,80);A.undo();assert.equal(A.selected.userData.params.width,40);A.redo();assert.equal(A.selected.userData.params.width,80);
 edit('#posX',35.125);assert.equal(A.selected.position.x,35.125);A.undo();assert.equal(A.selected.position.x,0);
 edit('#inspNameInput','Part <b>literal</b>');assert.equal(A.selected.userData.name,'Part <b>literal</b>');A.undo();assert.equal(A.selected.userData.name,'BOX_1');
 const before=A.selected.userData.color;click('[data-color="#10b981"]');assert.equal(A.selected.userData.color,'#10b981');A.undo();assert.equal(A.selected.userData.color,before);
});
test('injection-like names remain text both in tree and Boolean selector',t=>{
 const {A,$,edit}=fixture(t);A.createParametricSolid('BOX');edit('#inspNameInput','<img id="injected" src=x onerror=alert(1)>');A.createParametricSolid('BOX');
 assert.equal($('#injected'),null);assert($('#featureTree').textContent.includes('<img'));assert($('#csgTargetSelect').textContent.includes('<img'));
});
test('empty project remains empty after boot rather than restoring demo',async t=>{
 const {A,P}=fixture(t);await A.projectStore.save(P.document([]));await A.bootStudio();assert.equal(A.solids.length,0);
});
test('IndexedDB current and backup preserve mixed scene and permit recovery',async t=>{
 const {A,P}=fixture(t);A.createParametricSolid('BOX');A.drillQuickHoleOnSelected(6);const first=plain(A.serializeSceneState());await A.projectStore.save(P.document(first));A.createParametricSolid('SPHERE');const second=plain(A.serializeSceneState());await A.projectStore.save(P.document(second));
 assert.deepEqual(plain((await A.projectStore.load()).solids),second);assert.deepEqual(plain((await A.projectStore.load(true)).solids),first);
});
test('quota errors are reported and never silently treated as successful saves',async t=>{
 const {w,P}=fixture(t);w.indexedDB=undefined;const storage=w.localStorage;storage.setItem('3dcad_project_v2','{"solids":[]}');const proto=Object.getPrototypeOf(storage),original=proto.setItem;proto.setItem=()=>{throw new Error('Quota exceeded');};
 try{await assert.rejects(P.createStore().save(P.document([])),/Quota/);}finally{proto.setItem=original;}
});
test('rotated part remains seated after parameter rebuild',t=>{
 const {A,T,click,edit}=fixture(t);A.createParametricSolid('BOX',{rot:[90,0,0]});click('#btnLayFlatBed');edit('#param_depth',60);assert(Math.abs(new T.Box3().setFromObject(A.selected).min.y)<1e-4);
});
test('patterns use configurable count and position; mirror at X=0 has no arbitrary offset',t=>{
 const {A,$,click,T}=fixture(t);A.createParametricSolid('BOX',{pos:[0,10,0]});click('#btnMirrorX');assert.equal(A.selected.position.x,0);A.reset();A.createParametricSolid('BOX',{pos:[10,10,20]});$('#patternCount').value=4;click('#btnCircularPattern');
 assert.equal(A.solids.length,4);assert(Math.abs(A.solids[1].position.x-20)<1e-8);assert(Math.abs(A.solids[1].position.z+10)<1e-8);
 A.reset();A.createParametricSolid('BOX');$('#patternCount').value=3;$('#patternStep').value=62;click('#btnLinearPattern');assert.deepEqual(plain(A.solids.map(m=>m.position.x)),[0,62,124]);
});
test('interpreted commands require explicit application and target consistency',t=>{
 const {A,$,click}=fixture(t);A.createParametricSolid('BOX');A.previewCommand('gear 26 teeth module 2 thickness 10mm bore 8mm');assert.equal(A.solids.length,1);assert.equal($('#btnApplyCommand').disabled,false);A.applyCommand();assert.equal(A.solids.length,2);assert.equal(A.selected.userData.type,'SPUR_GEAR');
 A.previewCommand('hello world');assert.equal($('#btnApplyCommand').disabled,true);
});
test('JSON export always serializes the live scene rather than an uncommitted textarea draft',async t=>{
 const {A,$,click,downloads}=fixture(t);A.createParametricSolid('BOX');$('#mcpJsonConsole').value='uncommitted junk';click('#btnExportJson');const doc=JSON.parse(await downloads.at(-1).text());assert.equal(doc.version,2);assert.equal(doc.solids.length,1);
});
test('modal Escape returns focus and English tooltips/labels translate',t=>{
 const {A,$,click,w}=fixture(t);A.createParametricSolid('BOX');$('#btnHelp').focus();click('#btnHelp');assert.equal($('#helpModal').hidden,false);$('#helpModal').dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal($('#helpModal').hidden,true);assert.equal(w.document.activeElement,$('#btnHelp'));
 click('#langEn');assert.equal(w.document.documentElement.lang,'en');assert.equal($('#hudZoomFit').title,'Fit all parts (F)');assert.equal($('#posY').getAttribute('aria-label'),'Y Depth (mm)');assert.equal($('#param_width').labels[0].textContent,'Width X (mm)');
});
test('large JSON panel is a non-applicable summary, while export preserves the complete mesh',async t=>{
 const {A,$,click,downloads,P}=fixture(t);A.createParametricSolid('BOX');A.drillQuickHoleOnSelected(6);const displayed=JSON.parse($('#mcpJsonConsole').value);assert.equal(displayed.preview,true);assert.equal($('#btnApplyMcpJson').disabled,true);assert.throws(()=>P.read(displayed));click('#btnSaveProject');const full=JSON.parse(await downloads.at(-1).text());assert(full.solids[0].geometry.positions.length>0);assert.equal(full.preview,undefined);
});
test('PWA install prompt is deferred, requested on click and hidden after installation',async t=>{
 const {w,$,click}=fixture(t);let prompted=0;const event=new w.Event('beforeinstallprompt',{cancelable:true});event.prompt=async()=>{prompted++};event.userChoice=Promise.resolve({outcome:'accepted'});w.dispatchEvent(event);assert.equal(event.defaultPrevented,true);assert.equal(prompted,0);click('#btnInstall');await Promise.resolve();assert.equal(prompted,1);w.dispatchEvent(new w.Event('appinstalled'));assert.equal($('#btnInstall').hidden,true);
});
