/** Versioned, validated documents and recoverable browser persistence. */
(function(root){
  "use strict";
  const FORMAT="3dcad-project", VERSION=2, MAX_BYTES=32*1024*1024, MAX_SOLIDS=150;
  const MESH_TYPES=new Set(["CSG_SOLID","STL_IMPORT","MESH"]);
  const fail=(pt,en)=>{throw new Error(`${pt} / ${en}`);};
  const copy=value=>JSON.parse(JSON.stringify(value));
  function finite(n,min=-100000,max=100000){return typeof n==="number"&&Number.isFinite(n)&&n>=min&&n<=max;}
  function vector(v,fallback,min=-100000,max=100000){
    if(v===undefined)return fallback.slice();
    if(!Array.isArray(v)||v.length!==3||!v.every(n=>finite(n,min,max)))fail("Transformação inválida", "Invalid transform");
    return v.slice();
  }
  function validateParams(type,params={}){
    const schema=root.CadGenerators.PARAM_SCHEMA[type];
    if(!schema)fail(`Tipo desconhecido: ${type}`,`Unknown type: ${type}`);
    if(!params||typeof params!=="object"||Array.isArray(params))fail("Parâmetros inválidos", "Invalid parameters");
    const allowed=new Set(schema.map(f=>f.key));if(type==="SKETCH_EXTRUDE")allowed.add("entities");
    const result={};
    for(const [k,v] of Object.entries(params)){
      if(!allowed.has(k))fail(`Parâmetro desconhecido: ${k}`,`Unknown parameter: ${k}`);
      if(k==="entities")continue;
      const f=schema.find(f=>f.key===k);
      if(!finite(v,f.min,f.max)||(["teeth","segments","gusset","nutBore","ventSlots"].includes(k)&&!Number.isInteger(v)))
        fail(`Valor inválido: ${k} (${f.min}–${f.max})`,`Invalid value: ${k} (${f.min}–${f.max})`);
      result[k]=v;
    }
    const smaller=(a,b)=>result[a]!==undefined&&result[b]!==undefined&&result[a]>=result[b];
    if(smaller("innerDiameter","diameter")||smaller("boreDiameter","grooveDiameter")||smaller("grooveDiameter","outerDiameter")||smaller("bearingBore","outerRingDia"))fail("Diâmetro interno deve ser menor que o externo", "Inner diameter must be smaller than outer diameter");
    if(result.wallThickness!==undefined&&result.width!==undefined&&result.depth!==undefined&&result.wallThickness*2>=Math.min(result.width,result.depth))fail("Parede maior que o espaço disponível", "Wall exceeds the available space");
    if(type==="BOX"&&result.boreDiameter>0&&result.width!==undefined&&result.depth!==undefined&&result.boreDiameter>=Math.min(result.width,result.depth)-1)fail("Furo maior que a peça", "Bore exceeds the part");
    if(type==="SPUR_GEAR"&&result.module!==undefined&&result.teeth!==undefined&&result.boreDiameter>=result.module*(result.teeth-2.5))fail("Furo ultrapassa a raiz dos dentes", "Bore exceeds the tooth root");
    if(type==="SKETCH_EXTRUDE"){
      const entities=params.entities;
      if(!Array.isArray(entities)||!entities.length||entities.length>100)fail("Esboço precisa de 1 a 100 entidades", "Sketch needs 1 to 100 entities");
      result.entities=entities.map(e=>{
        if(!e||!['rect','circle','slot','polygon'].includes(e.kind)||!finite(e.x,-2000,2000)||!finite(e.y,-2000,2000))fail("Entidade de esboço inválida", "Invalid sketch entity");
        const next={kind:e.kind,x:e.x,y:e.y,isHole:e.isHole===true};
        if(next.isHole&&e.kind!=="circle")fail("Somente furos circulares são aceitos", "Only circular holes are supported");
        if(['circle','polygon'].includes(e.kind)){
          if(!finite(e.r,0.5,1000))fail("Raio inválido", "Invalid radius");next.r=e.r;
          if(e.kind==='polygon'){if(!Number.isInteger(e.sides)||e.sides<3||e.sides>32)fail("Polígono inválido", "Invalid polygon");next.sides=e.sides;}
        }else{
          if(!finite(e.w,1,2000)||!finite(e.h,1,2000)||(e.kind==='slot'&&e.w<e.h))fail("Dimensões de esboço inválidas", "Invalid sketch dimensions");next.w=e.w;next.h=e.h;
        }
        return next;
      });
      if(!result.entities.some(e=>!e.isHole))fail("Esboço sem contorno externo", "Sketch has no outer profile");
    }
    return result;
  }
  function validateGeometry(value){
    if(!value||!Array.isArray(value.positions)||value.positions.length<9||value.positions.length%3||value.positions.length>root.CadMesh.MAX_TRIANGLES*9||!value.positions.every(n=>finite(n,-10000,10000)))fail("Malha inválida ou grande demais", "Invalid or oversized mesh");
    const count=value.positions.length/3;
    if(value.index!==null&&value.index!==undefined&&(!Array.isArray(value.index)||value.index.length%3||value.index.length>root.CadMesh.MAX_TRIANGLES*3||!value.index.every(i=>Number.isInteger(i)&&i>=0&&i<count)))fail("Índices de malha inválidos", "Invalid mesh indices");
    if(!value.index&&count%3)fail("Triângulos incompletos", "Incomplete triangles");
    return {positions:value.positions.slice(),index:value.index?value.index.slice():null};
  }
  function validateItems(items){
    if(!Array.isArray(items)||items.length>MAX_SOLIDS)fail("Projeto inválido ou excede 150 peças", "Invalid project or exceeds 150 parts");
    const used=new Set();let triangles=0;
    return items.map((item,i)=>{
      if(!item||typeof item!=="object"||Array.isArray(item)||typeof item.type!=="string")fail("Registro de peça inválido", "Invalid part record");
      const isMesh=MESH_TYPES.has(item.type);
      if(!isMesh&&!root.CadGenerators.PARAM_SCHEMA[item.type])fail(`Tipo desconhecido: ${item.type}`,`Unknown type: ${item.type}`);
      let id=typeof item.id==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(item.id)?item.id:`import_${i+1}`;
      const baseId=id.slice(0,60);let suffix=1;while(used.has(id))id=`${baseId}_${suffix++}`;used.add(id);
      if(item.color!==undefined&&(typeof item.color!=='string'||!/^#[0-9a-f]{6}$/i.test(item.color)))fail("Cor inválida", "Invalid color");
      if(item.name!==undefined&&(typeof item.name!=='string'||item.name.length>160||/[\u0000-\u001f\u007f]/.test(item.name)))fail("Nome inválido ou longo demais", "Invalid or oversized name");
      const result={id,type:item.type,name:item.name||`${item.type}_${i+1}`,color:item.color||'#f97316',params:isMesh?{}:validateParams(item.type,item.params||{}),pos:vector(item.pos,[0,0,0]),rot:vector(item.rot,[0,0,0],-36000,36000),scale:vector(item.scale,[1,1,1],-100,100),visible:item.visible!==false};
      if(result.scale.some(n=>Math.abs(n)<0.001))fail("Escala nula ou pequena demais", "Zero or excessively small scale");
      if(isMesh){result.geometry=validateGeometry(item.geometry);triangles+=(result.geometry.index?.length||result.geometry.positions.length/3)/3;}
      if(triangles>root.CadMesh.MAX_TRIANGLES)fail("Projeto excede o limite de malha", "Project exceeds the mesh limit");
      return result;
    });
  }
  function document(items){return {format:FORMAT,version:VERSION,units:'mm',coordinates:'three-y-up',solids:items};}
  function read(value){
    if(typeof value==='string'){
      if(value.length>MAX_BYTES)fail("Arquivo excede 32 MB", "File exceeds 32 MB");
      value=JSON.parse(value);
    }
    // Legacy v1 stored an array and used a proprietary protocol label.
    if(Array.isArray(value))return document(validateItems(value));
    if(!value||typeof value!=='object'||value.preview===true||(value.format!==undefined&&value.format!==FORMAT)||(value.version!==undefined&&value.version!==VERSION)||(value.units!==undefined&&value.units!=='mm')||(value.coordinates!==undefined&&value.coordinates!=='three-y-up')||(value.protocol!==undefined&&value.protocol!=='3dcad-mcp/1.0'))fail("Formato, versão ou unidades incompatíveis", "Incompatible format, version or units");
    return document(validateItems(value.solids));
  }
  function serialize(mesh){
    const d=mesh.userData;
    const result={id:d.id,type:d.type,name:d.name,color:d.color,params:copy(d.params||{}),pos:mesh.position.toArray(),rot:[mesh.rotation.x,mesh.rotation.y,mesh.rotation.z].map(THREE.MathUtils.radToDeg),scale:mesh.scale.toArray(),visible:mesh.visible};
    if(!d.isParametric){const g=mesh.geometry;result.geometry={positions:Array.from(g.attributes.position.array),index:g.index?Array.from(g.index.array):null};}
    return result;
  }
  function geometry(record){
    if(!record.geometry)return root.CadGenerators.buildParametricGeometry(record.type,record.params);
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(record.geometry.positions,3));
    if(record.geometry.index)g.setIndex(record.geometry.index);g.computeVertexNormals();return g;
  }
  function createStore(){
    const KEY='3dcad_project_v2',BACKUP=KEY+'_backup';let dbPromise,queue=Promise.resolve();
    function db(){
      if(!root.indexedDB)return Promise.resolve(null);
      if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{const request=root.indexedDB.open('3dcad-projects',1);request.onupgradeneeded=()=>request.result.createObjectStore('projects');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);request.onblocked=()=>reject(new Error('IndexedDB blocked'));});
      return dbPromise;
    }
    async function get(slot){const connection=await db();if(!connection)return null;return new Promise((resolve,reject)=>{const tx=connection.transaction('projects','readonly'),request=tx.objectStore('projects').get(slot);request.onsuccess=()=>resolve(request.result||null);request.onerror=()=>reject(request.error);});}
    async function saveNow(doc){
      const serialized=JSON.stringify(doc);if(serialized.length>MAX_BYTES)fail("Projeto excede 32 MB", "Project exceeds 32 MB");
      let connection;try{connection=await db();}catch{}
      if(connection){
        await new Promise((resolve,reject)=>{const tx=connection.transaction('projects','readwrite'),store=tx.objectStore('projects'),previous=store.get('current');previous.onsuccess=()=>{if(previous.result)store.put(previous.result,'backup');store.put(serialized,'current');};tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Storage aborted'));});
        // Keep a small redundant copy without making localStorage quota a save failure.
        try{if(serialized.length<1500000){const old=root.localStorage.getItem(KEY);if(old)root.localStorage.setItem(BACKUP,old);root.localStorage.setItem(KEY,serialized);}else root.localStorage.removeItem(KEY);}catch{}
        return 'indexeddb';
      }
      const old=root.localStorage.getItem(KEY);if(old)root.localStorage.setItem(BACKUP,old);root.localStorage.setItem(KEY,serialized);return 'localStorage';
    }
    return {
      save(doc){const snapshot=copy(doc);const run=queue.then(()=>saveNow(snapshot));queue=run.catch(()=>{});return run;},
      async load(backup=false){
        let raw;try{raw=await get(backup?'backup':'current');}catch{}
        if(!raw){try{raw=root.localStorage.getItem(backup?BACKUP:KEY);if(!raw&&!backup)raw=root.localStorage.getItem('3dcad_autosave_v1');}catch{}}
        return raw?read(raw):null;
      },
      async flush(){await queue;}
    };
  }
  root.CadProject={FORMAT,VERSION,MAX_BYTES,MAX_SOLIDS,validateParams,validateItems,document,read,serialize,geometry,createStore};
})(typeof window!=='undefined'?window:globalThis);
