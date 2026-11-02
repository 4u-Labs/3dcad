const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {app,core,plain}=require('./harness.cjs');

test('3MF import converts inches and applies build item placement',async()=>{
  const w=core();
  const bytes=fs.readFileSync(path.join(__dirname,'fixtures/units-transform.3mf'));
  const parts=await w.CadGenerators.parse3MF(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));
  assert.equal(parts.length,1);
  const xs=parts[0].geometry.positions.filter((_,i)=>i%3===0);
  assert.equal(Math.min(...xs),254);
  assert.equal(Math.max(...xs),279.4);
});

test('assembly changes survive JSON, undo and reopen without doubling the pose',t=>{
  const f=app();t.after(f.close);
  const {A,$,click,w}=f;
  const base=A.createParametricSolid('BOX',{name:'Base',pos:[0,10,0]});
  const child=A.createParametricSolid('BOX',{name:'Child',pos:[30,10,0]});
  $('#jointBodyASelect').value=base.userData.id;
  $('#jointBodyBSelect').value=child.userData.id;
  $('#jointTypeSelect').value='slider';
  $('#jointAxisSelect').value='X';
  $('#jointLimitMin').value='0';
  $('#jointLimitMax').value='20';
  $('#jointNameInput').value='<b id="injected">unsafe</b>';
  click('#btnAddJoint');
  assert.equal(A.assemblyManager.joints.length,1);
  assert.equal(A.assemblyManager.joints[0].limits.min,0);
  assert.equal($('#injected'),null);
  assert.equal(A.undoDepth,1);
  const slider=$('#rangeJointSimulate');slider.value='10';slider.dispatchEvent(new w.Event('input',{bubbles:true}));
  assert.equal(child.position.x,40);
  const doc=plain(w.CadProject.document(A.serializeSceneState(),A.assemblyManager.serialize(),A.assemblyManager.serializeBases()));
  assert.equal(doc.assemblyBases[child.userData.id].pos[0],30);
  A.restoreSceneFromItems(doc.solids,doc.joints,doc.assemblyBases);
  assert.equal(A.solids[1].position.x,40);
  A.assemblyManager.setJointValue(A.assemblyManager.joints[0].id,10);
  assert.equal(A.solids[1].position.x,40);
  A.restoreSceneFromItems(doc.solids,doc.joints);
  A.assemblyManager.setJointValue(A.assemblyManager.joints[0].id,10);
  assert.equal(A.solids[1].position.x,40);
  A.undo();
  assert.equal(A.assemblyManager.joints.length,0);
  A.redo();
  assert.equal(A.assemblyManager.joints.length,1);
  A.clearAllSolids();
  assert.equal(A.assemblyManager.joints.length,0);
  assert.equal(A.assemblyManager.bodies.size,0);
});

test('sketch distance changes rectangle width and survives project validation',t=>{
  const f=app();t.after(f.close);
  const {A,$,click}=f;
  A.sketchEntities=[{kind:'rect',x:0,y:0,w:60,h:25,id:'rect1'}];
  $('#skConstraintValue').value='30';
  click('#btnSkConstraintDist');
  assert(Math.abs(A.sketchEntities[0].w-30)<0.01);
  assert.equal(A.sketchConstraints[0].type,'distanceX');
  const params=f.P.validateParams('SKETCH_EXTRUDE',{height:15,bevel:0,entities:A.sketchEntities,constraints:A.sketchConstraints});
  assert.equal(params.constraints[0].value,30);
  assert.equal(params.entities[0].id,'rect1');
});

test('MCP exports real positioned meshes to STEP and STL',async()=>{
  const mcp=require('../mcp_server.cjs');const tools=mcp.server._registeredTools;
  await tools.cad_clear_scene.handler({});
  await tools.cad_create_solid.handler({type:'BOX',name:'Placed',params:{width:20,depth:30,height:40},pos:[100,20,50],rot:[0,90,0]});
  const dir=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'3dcad-mcp-'));
  try{
    const step=path.join(dir,'placed.step'),stl=path.join(dir,'placed.stl');
    await tools.cad_export_step.handler({filepath:step});
    await tools.cad_export_stl.handler({filepath:stl});
    assert.match(fs.readFileSync(step,'utf8'),/FACETED_BREP/);
    const bytes=fs.readFileSync(stl);assert(bytes.length>84);
    const vertices=[];
    for(let offset=84;offset<bytes.length;offset+=50)
      for(let vertex=0;vertex<3;vertex++)vertices.push([0,1,2].map(axis=>bytes.readFloatLE(offset+12+vertex*12+axis*4)));
    const min=[0,1,2].map(axis=>Math.min(...vertices.map(v=>v[axis])));
    const max=[0,1,2].map(axis=>Math.max(...vertices.map(v=>v[axis])));
    assert.deepEqual(min,[85,-60,0]);
    assert.deepEqual(max,[115,-40,40]);
  }finally{fs.rmSync(dir,{recursive:true,force:true});await tools.cad_clear_scene.handler({});}
});
