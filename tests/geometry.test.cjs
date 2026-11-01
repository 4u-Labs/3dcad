const {test}=require('node:test'),assert=require('node:assert/strict'),{core,plain}=require('./harness.cjs');
const w=core(),T=w.THREE,C=w.CadGenerators,M=w.CadMesh,P=w.CadProject;
function mesh(type='BOX',params={width:40,depth:30,height:20,cornerRadius:0}){return new T.Mesh(C.buildParametricGeometry(type,params));}
function unzip(blob){return blob.arrayBuffer().then(buffer=>{const b=Buffer.from(buffer),files=new Map();let i=0;while(b.readUInt32LE(i)===0x04034b50){assert.equal(b.readUInt16LE(i+8),0);const n=b.readUInt16LE(i+26),extra=b.readUInt16LE(i+28),len=b.readUInt32LE(i+18),name=b.subarray(i+30,i+30+n).toString(),data=b.subarray(i+30+n+extra,i+30+n+extra+len);let crc=0xffffffff;for(const byte of data){crc^=byte;for(let k=0;k<8;k++)crc=crc&1?(crc>>>1)^0xedb88320:crc>>>1;}assert.equal((crc^0xffffffff)>>>0,b.readUInt32LE(i+14));files.set(name,data.toString());i+=30+n+extra+len;}return files;});}
test('all showcase parts and new mechanical generators export closed normalized topology',()=>{
 const rows=Object.values(C.DEMO_PROJECTS).flatMap(p=>p.items);
 rows.push({type:'PILLOW_BLOCK',params:{bearingBore:22.2,outerRingDia:34,baseWidth:68,thickness:14,baseHeight:6,mountHoleDia:4.4}},{type:'SNAP_LID_BOX',params:{width:85,depth:58,topThickness:3,lipHeight:4,wallThickness:2.5,clearance:0.3,ventSlots:1}});
 for(const item of rows){const data=M.fromMesh(mesh(item.type,item.params));assert.equal(data.diagnostics.boundaryEdges,0,item.type);assert.equal(data.diagnostics.nonManifoldEdges,0,item.type);assert.equal(data.diagnostics.inconsistentEdges,0,item.type);assert(M.signedVolume(data.vertices,data.triangles)>0,item.type);}
});
test('STL preserves world placement, orientation and Z-up coordinates',async()=>{
 const m=mesh();m.position.set(50,10,60);m.rotation.y=Math.PI/2;const blob=M.stl([m]);const g=new T.STLLoader().parse(await blob.arrayBuffer());g.computeBoundingBox();
 assert.deepEqual(plain(g.boundingBox.min.toArray()),[35,-80,0]);assert.deepEqual(plain(g.boundingBox.max.toArray()),[65,-40,20]);
});
test('negative determinant keeps outward winding in every interchange pipeline',async()=>{
 const m=mesh();m.scale.x=-1;const data=M.fromMesh(m);assert.equal(Math.round(M.signedVolume(data.vertices,data.triangles)),24000);
 const obj=await C.exportMeshesToOBJ([m]).text();const vertices=obj.split('\n').filter(l=>l.startsWith('v ')).map(l=>l.split(' ').slice(1).map(Number));const faces=obj.split('\n').filter(l=>l.startsWith('f ')).map(l=>l.split(' ').slice(1).map(n=>Number(n)-1));assert.equal(Math.round(M.signedVolume(vertices,faces)),24000);
 const geometry=new T.STLLoader().parse(await M.stl([m]).arrayBuffer());const imported=new T.Mesh(geometry);const stlData=M.fromMesh(imported,false);assert.equal(Math.round(M.signedVolume(stlData.vertices,stlData.triangles)),24000);
});
test('3MF ZIP has valid CRC, closed shared indices, separate objects and colors',async()=>{
 const a=mesh(),b=mesh('SPHERE',{diameter:10,segments:16});a.userData={name:'Part <A> & "B"',color:'#ff0000'};b.userData={name:'Sphere',color:'#00ff00'};b.position.x=50;
 const files=await unzip(C.exportMeshesTo3MF([a,b]));assert(files.has('[Content_Types].xml'));assert(files.has('_rels/.rels'));
 const {JSDOM}=require('jsdom'),dom=new JSDOM(),doc=new dom.window.DOMParser().parseFromString(files.get('3D/3dmodel.model'),'text/xml');assert.equal(doc.querySelector('parsererror'),null);
 const objects=doc.querySelectorAll('object');assert.equal(objects.length,2);assert.equal(objects[0].getAttribute('name'),a.userData.name);assert.equal(doc.querySelector('base').getAttribute('displaycolor'),'#FF0000FF');
 for(const o of objects){const vs=[...o.querySelectorAll('vertex')].map(v=>['x','y','z'].map(a=>Number(v.getAttribute(a))));const ts=[...o.querySelectorAll('triangle')].map(v=>['v1','v2','v3'].map(a=>Number(v.getAttribute(a))));const d=M.topology(vs,ts);assert.equal(d.boundaryEdges,0);assert.equal(d.nonManifoldEdges,0);}
 assert.equal(objects[0].querySelectorAll('vertex').length,8);dom.window.close();
});
test('3MF parse3MF unpacks packages, extracts vertices/triangles and preserves names and colors',async()=>{
 const a=mesh(),b=mesh('SPHERE',{diameter:10,segments:16});a.userData={name:'BoxPart',color:'#ff0000'};b.userData={name:'SpherePart',color:'#00ff00'};b.position.x=50;
 const blob=C.exportMeshesTo3MF([a,b]);
 const parts=await C.parse3MF(await blob.arrayBuffer());
 assert.equal(parts.length,2);
 assert.equal(parts[0].name,'BoxPart');
 assert.equal(parts[0].geometry.positions.length,24);
 assert.equal(parts[0].geometry.index.length,36);
 assert.equal(parts[0].color.toLowerCase(),'#ff0000');
 assert.equal(parts[1].name,'SpherePart');
 assert.equal(parts[1].color.toLowerCase(),'#00ff00');
});
test('invalid/open mesh is refused by 3MF and STEP while STL remains explicit mesh exchange',()=>{
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([0,0,0,10,0,0,0,10,0],3));const m=new T.Mesh(g);
 assert.throws(()=>C.exportMeshesTo3MF([m]),/Open or invalid/);assert.throws(()=>C.exportMeshesToSTEP([m]),/Open or invalid/);assert(M.stl([m]).size>84);
});
test('STEP contains the full solid/product/context graph and never truncates 4,000 faces',async()=>{
 const m=mesh('SPHERE',{diameter:32,segments:96}),count=M.fromMesh(m).triangles.length;
 const step=await C.exportMeshesToSTEP([m]).text();assert.equal((step.match(/POLY_LOOP/g)||[]).length,count);assert(count>4000);
 for(const entity of ['FACETED_BREP(','CLOSED_SHELL(','FACE_OUTER_BOUND(','FACETED_BREP_SHAPE_REPRESENTATION(','SHAPE_DEFINITION_REPRESENTATION(','GLOBAL_UNIT_ASSIGNED_CONTEXT'])assert(step.includes(entity),entity);
 const definitions=new Set([...step.matchAll(/^#(\d+) =/gm)].map(m=>m[1]));for(const match of step.matchAll(/#(\d+)/g))assert(definitions.has(match[1]),'dangling reference '+match[0]);
});
test('sketch dimensions stay exact with bevel and with a zero/tiny bevel',()=>{
 for(const bevel of [0,0.02,0.4,2]){const m=mesh('SKETCH_EXTRUDE',{height:18,bevel,entities:[{kind:'rect',x:0,y:0,w:70,h:44}]});const b=new T.Box3().setFromObject(m),size=b.getSize(new T.Vector3());assert(Math.abs(size.x-70)<1e-4);assert(Math.abs(size.z-44)<1e-4);assert(Math.abs(size.y-18)<1e-4);}
});
test('holes belong to one profile; outside, overlapping or tangent holes are rejected',()=>{
 const rect={kind:'rect',x:0,y:0,w:40,h:30};
 assert.throws(()=>mesh('SKETCH_EXTRUDE',{height:10,bevel:0,entities:[rect,{kind:'circle',x:50,y:0,r:3,isHole:true}]}),/Hole must be inside/);
 assert.throws(()=>mesh('SKETCH_EXTRUDE',{height:10,bevel:0,entities:[rect,{kind:'circle',x:0,y:0,r:4,isHole:true},{kind:'circle',x:4,y:0,r:4,isHole:true}]}),/Overlapping/);
 const m=mesh('SKETCH_EXTRUDE',{height:10,bevel:0,entities:[{...rect,x:-30},{...rect,x:30},{kind:'circle',x:-30,y:0,r:3,isHole:true}]});const v=C.analyzeMeshFor3DPrint([m]).volumeMm3;assert(Math.abs(v-(24000-Math.PI*9*10))<2);
});
test('zero gear bore produces a solid gear and explicit invalid parameters reject',()=>{
 const zero=C.analyzeMeshFor3DPrint([mesh('SPUR_GEAR',{module:2,teeth:24,thickness:8,boreDiameter:0})]).volumeMm3;
 const hole=C.analyzeMeshFor3DPrint([mesh('SPUR_GEAR',{module:2,teeth:24,thickness:8,boreDiameter:6})]).volumeMm3;assert(zero-hole>220);
 for(const [type,p]of [['UNKNOWN',{}],['BOX',{width:-10}],['BOX',{width:Infinity}],['CYLINDER',{diameter:20,innerDiameter:25}],['SPUR_GEAR',{teeth:5000}]])assert.throws(()=>mesh(type,p));
});
test('build plate validation considers placement and height, not only size',()=>{
 const m=mesh();m.position.y=10;assert.equal(C.analyzeMeshFor3DPrint([m]).fitsBed220,true);
 m.position.x=500;assert.equal(C.analyzeMeshFor3DPrint([m]).fitsBed220,false);m.position.x=0;m.position.y=0;assert.equal(C.analyzeMeshFor3DPrint([m]).fitsBed220,false);m.position.y=260;assert.equal(C.analyzeMeshFor3DPrint([m]).fitsBed220,false);
});
test('volume, zero infill, empty estimates and resin units are consistent',()=>{
 const m=mesh(),solid=C.analyzeMeshFor3DPrint([m],{infill:100}),empty=C.analyzeMeshFor3DPrint([],{}),shell=C.analyzeMeshFor3DPrint([m],{infill:0}),five=C.analyzeMeshFor3DPrint([m],{infill:5});
 assert.equal(solid.volumeMm3,24000);assert(shell.weightGrams<five.weightGrams);assert.equal(empty.timeFormatted,'0 min');assert.equal(C.analyzeMeshFor3DPrint([m],{material:'RESIN'}).filamentMeters,0);
});
test('PT and EN commands are equivalent and unknown requests never create fallback boxes',()=>{
 const pt=C.parseCadPrompt('Engrenagem 26 dentes modulo 2 espessura 10mm furo 8mm'),en=C.parseCadPrompt('gear 26 teeth module 2 thickness 10mm bore 8mm');assert.deepEqual(plain(pt),plain(en));
 assert.equal(C.parseCadPrompt('hello world'),null);assert.equal(C.parseCadPrompt('box 2x3x4 cm'),null);assert.equal(C.parseCadPrompt('esfera diametro 30mm').type,'SPHERE');assert.equal(C.parseCadPrompt('sphere diameter 30mm').type,'SPHERE');
 assert.equal(C.parseCadPrompt('alterar largura da peça selecionada para 80 mm').params.width,80);assert.equal(C.parseCadPrompt('change width of selected part to 80mm').params.width,80);
 assert.equal(C.parseCadPrompt('drill bore 6mm').diameter,6);assert.equal(C.parseCadPrompt('furar peca com furo de 6mm').diameter,6);
});
test('JSON validation bounds content, versions, mesh indices, IDs and numeric types',()=>{
 const base={type:'BOX',params:{width:40}};for(const bad of [{...base,params:{width:'40'}},{...base,color:'red;position:fixed'},{...base,name:'x'.repeat(161)},{...base,pos:[NaN,0,0]},{...base,scale:[0,1,1]},{type:'MESH',geometry:{positions:[0,0,0,1,0,0,0,1,0],index:[0,1,100]}}])assert.throws(()=>P.validateItems([bad]));
 const records=P.validateItems([{...base,id:'same'},{...base,id:'same'}]);assert.notEqual(records[0].id,records[1].id);assert.equal(P.read({protocol:'3dcad-mcp/1.0',units:'mm',solids:[base]}).version,2);
});
