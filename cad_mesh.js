/** Mesh interchange: shared topology, world transforms and Z-up coordinates. */
(function (root) {
  "use strict";
  const EPS = 1e-5;
  const MAX_TRIANGLES = 1000000;
  const key = (a, b) => a < b ? `${a}:${b}` : `${b}:${a}`;
  const fail = (pt, en) => { throw new Error(`${pt} / ${en}`); };

  function signedVolume(vertices, triangles) {
    let volume = 0;
    for (const [i, j, k] of triangles) {
      const a = vertices[i], b = vertices[j], c = vertices[k];
      volume += (a[0] * (b[1]*c[2]-b[2]*c[1]) + a[1] * (b[2]*c[0]-b[0]*c[2]) + a[2] * (b[0]*c[1]-b[1]*c[0])) / 6;
    }
    return volume;
  }

  function topology(vertices, triangles) {
    const edges = new Map();
    triangles.forEach((t, face) => t.forEach((a, i) => {
      const b = t[(i + 1) % 3], k = key(a, b);
      if (!edges.has(k)) edges.set(k, []);
      edges.get(k).push({face, a, b});
    }));
    return {edges, boundaryEdges: [...edges.values()].filter(e => e.length === 1).length,
      nonManifoldEdges: [...edges.values()].filter(e => e.length > 2).length,
      inconsistentEdges: [...edges.values()].filter(e => e.length === 2 && e[0].a === e[1].a).length};
  }

  function normalize(vertices, triangles, repair = true) {
    if (triangles.length > MAX_TRIANGLES) fail("Malha excede o limite de triângulos", "Mesh exceeds triangle limit");
    const welded = [], mapped = new Map(), ids = [], uniqueFaces = new Set();
    const add = v => {
      if (!v.every(Number.isFinite)) fail("Coordenada inválida na malha", "Invalid mesh coordinate");
      const k = v.map(n => Math.round(n / EPS)).join(",");
      if (!mapped.has(k)) { mapped.set(k, welded.length); welded.push(v.slice()); }
      return mapped.get(k);
    };
    vertices.forEach(v => ids.push(add(v)));
    let removedDegenerate = 0;
    let faces = triangles.map(t => t.map(i => ids[i])).filter(t => {
      if (new Set(t).size < 3) { removedDegenerate++; return false; }
      const [a,b,c] = t.map(i => new THREE.Vector3(...welded[i]));
      if (b.sub(a).cross(c.sub(a)).lengthSq() < 1e-16) { removedDegenerate++; return false; }
      const k = t.slice().sort((a,b)=>a-b).join(":");
      if (uniqueFaces.has(k)) return false;
      uniqueFaces.add(k); return true;
    });
    let splitEdges = 0;
    if (repair) {
      const graph = topology(welded, faces), splits = new Map();
      // BSP output often contains T-junctions. Split boundary edges at existing
      // collinear vertices, then triangulate the affected convex face in-place.
      const sorted = [0,1,2].map(axis => welded.map((v,i)=>({n:v[axis],i})).sort((a,b)=>a.n-b.n));
      const lower = (list, n) => {let a=0,b=list.length;while(a<b){const m=(a+b)>>1;if(list[m].n<n)a=m+1;else b=m;}return a;};
      for (const [k, entries] of graph.edges) {
        if (entries.length !== 1) continue;
        const {a,b} = entries[0], p = welded[a], q = welded[b];
        const delta = q.map((v,i)=>v-p[i]), length2 = delta.reduce((s,n)=>s+n*n,0);
        const axis = delta.map(Math.abs).indexOf(Math.max(...delta.map(Math.abs)));
        const list=sorted[axis], candidates=[];
        for(let j=lower(list,Math.min(p[axis],q[axis])-EPS);j<list.length && list[j].n<=Math.max(p[axis],q[axis])+EPS;j++){
          const i=list[j].i;if(i===a||i===b)continue;
          const v=welded[i], t=v.reduce((s,n,c)=>s+(n-p[c])*delta[c],0)/length2;
          if(t<=EPS/Math.sqrt(length2)||t>=1-EPS/Math.sqrt(length2))continue;
          if(v.reduce((s,n,c)=>s+(n-p[c]-delta[c]*t)**2,0)<EPS*EPS) candidates.push({i,t});
        }
        if(candidates.length){splits.set(k,{a,points:candidates.sort((a,b)=>a.t-b.t).map(x=>x.i)});splitEdges++;}
      }
      if(splits.size){
        const next=[];
        for(const t of faces){
          const polygon=[];
          for(let i=0;i<3;i++){
            const a=t[i],b=t[(i+1)%3];polygon.push(a);
            const split=splits.get(key(a,b));if(split)polygon.push(...(split.a===a?split.points:split.points.slice().reverse()));
          }
          if(polygon.length===3){next.push(t);continue;}
          const center=add([0,1,2].map(axis=>t.reduce((s,i)=>s+welded[i][axis],0)/3));
          for(let i=0;i<polygon.length;i++) next.push([polygon[i],polygon[(i+1)%polygon.length],center]);
        }
        faces=next;
      }
    }
    if(faces.length>MAX_TRIANGLES) fail("Malha reparada excede o limite", "Repaired mesh exceeds the limit");
    const graph=topology(welded,faces), adjacency=faces.map(()=>[]);
    for(const entries of graph.edges.values())if(entries.length===2){
      const [a,b]=entries, same=a.a===b.a;
      adjacency[a.face].push([b.face,same]);adjacency[b.face].push([a.face,same]);
    }
    const flips=new Map(),components=[];
    for(let seed=0;seed<faces.length;seed++)if(!flips.has(seed)){
      const stack=[seed],component=[];flips.set(seed,false);
      while(stack.length){const i=stack.pop();component.push(i);for(const [j,same] of adjacency[i])if(!flips.has(j)){flips.set(j,flips.get(i)!==same);stack.push(j);}}
      components.push(component);
    }
    faces=faces.map((t,i)=>flips.get(i)?[t[0],t[2],t[1]]:t);
    // Keep the relative orientation of inner cavity shells.
    if(signedVolume(welded,faces)<0) faces=faces.map(([a,b,c])=>[a,c,b]);
    const final=topology(welded,faces);
    return {vertices:welded,triangles:faces,components,diagnostics:{boundaryEdges:final.boundaryEdges,nonManifoldEdges:final.nonManifoldEdges,inconsistentEdges:final.inconsistentEdges,removedDegenerate,splitEdges}};
  }

  function fromMesh(mesh, zUp = true, repair = true) {
    mesh.updateWorldMatrix(true, false);
    const geometry=mesh.geometry, p=geometry.attributes.position, ix=geometry.index;
    const vertices=[],triangles=[],v=new THREE.Vector3();
    for(let i=0;i<p.count;i++){
      v.fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld);
      vertices.push(zUp?[v.x,-v.z,v.y]:[v.x,v.y,v.z]);
    }
    const count=ix?ix.count:p.count, mirrored=mesh.matrixWorld.determinant()<0;
    for(let i=0;i<count;i+=3){const t=[0,1,2].map(j=>ix?ix.getX(i+j):i+j);triangles.push(mirrored?[t[0],t[2],t[1]]:t);}
    return {...normalize(vertices,triangles,repair),name:mesh.userData?.name||"Part",color:mesh.userData?.color||"#f97316"};
  }

  function collect(meshes, requireClosed = false) {
    const objects=meshes.filter(m=>m.visible!==false).map(m=>fromMesh(m));
    if(!objects.length)fail("Cena vazia", "Empty scene");
    if(objects.reduce((s,o)=>s+o.triangles.length,0)>MAX_TRIANGLES)fail("Projeto excede o limite de exportação", "Project exceeds the export limit");
    if(requireClosed)for(const o of objects){
      if(!o.triangles.length||o.diagnostics.boundaryEdges||o.diagnostics.nonManifoldEdges||o.diagnostics.inconsistentEdges)
        fail(`Malha aberta ou inválida: ${o.name}. Valide a malha antes de exportar`, `Open or invalid mesh: ${o.name}. Validate the mesh before exporting`);
    }
    return objects;
  }

  function toGeometry(data) {
    const g=new THREE.BufferGeometry();
    g.setAttribute("position",new THREE.Float32BufferAttribute(data.vertices.flat(),3));
    g.setIndex(data.triangles.flat());g.computeVertexNormals();g.computeBoundingBox();return g;
  }

  function stl(meshes) {
    const objects=collect(meshes), count=objects.reduce((s,o)=>s+o.triangles.length,0);
    const data=new DataView(new ArrayBuffer(84+50*count));data.setUint32(80,count,true);let offset=84;
    const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),normal=new THREE.Vector3();
    for(const o of objects)for(const face of o.triangles){
      a.fromArray(o.vertices[face[0]]);b.fromArray(o.vertices[face[1]]);c.fromArray(o.vertices[face[2]]);
      normal.crossVectors(b.clone().sub(a),c.clone().sub(a)).normalize();
      for(const p of [normal,a,b,c])for(const n of p.toArray()){data.setFloat32(offset,n,true);offset+=4;}
      data.setUint16(offset,0,true);offset+=2;
    }
    return new Blob([data],{type:"application/octet-stream"});
  }

  function obj(meshes) {
    let offset=1;const lines=["# 3DCad Studio | millimeters | Z up"];
    for(const o of collect(meshes)){
      lines.push(`o ${o.name.replace(/[^\w.-]/g,"_")}`);
      for(const v of o.vertices)lines.push(`v ${v.join(" ")}`);
      for(const f of o.triangles)lines.push(`f ${f.map(i=>i+offset).join(" ")}`);
      offset+=o.vertices.length;
    }
    return new Blob([lines.join("\n")+"\n"],{type:"text/plain;charset=utf-8"});
  }

  const stepText = s => String(s).replace(/[^\x20-\x7e]/g,"_").replace(/'/g,"''");
  const real = n => {const s=Number(n.toPrecision(12)).toString();return /[.eE]/.test(s)?s.replace(/e/i,"E"):s+".";};
  function step(meshes) {
    const objects=collect(meshes,true),lines=["ISO-10303-21;","HEADER;","FILE_DESCRIPTION(('Faceted mesh BRep; millimeters; no parametric history'),'2;1');",`FILE_NAME('3dcad.step','${new Date().toISOString()}',(''),('4u-Labs'),'3DCad Studio 1.2','3DCad Studio','');`,"FILE_SCHEMA(('AUTOMOTIVE_DESIGN'));","ENDSEC;","DATA;"];
    let id=0;const entity=s=>{lines.push(`#${++id} = ${s};`);return `#${id}`;};
    const app=entity("APPLICATION_CONTEXT('automotive design')");
    entity(`APPLICATION_PROTOCOL_DEFINITION('international standard','automotive_design',2000,${app})`);
    const productContext=entity(`PRODUCT_CONTEXT('',${app},'mechanical')`),definitionContext=entity(`PRODUCT_DEFINITION_CONTEXT('part definition',${app},'design')`);
    const length=entity("(LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.MILLI.,.METRE.))"),angle=entity("(NAMED_UNIT(*) PLANE_ANGLE_UNIT() SI_UNIT($,.RADIAN.))"),solidAngle=entity("(NAMED_UNIT(*) SI_UNIT($,.STERADIAN.) SOLID_ANGLE_UNIT())");
    const uncertainty=entity(`UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_MEASURE(0.00001),${length},'distance_accuracy_value','mesh tolerance')`);
    const context=entity(`(GEOMETRIC_REPRESENTATION_CONTEXT(3) GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT((${uncertainty})) GLOBAL_UNIT_ASSIGNED_CONTEXT((${length},${angle},${solidAngle})) REPRESENTATION_CONTEXT('','3D'))`);
    const origin=entity("CARTESIAN_POINT('',(0.,0.,0.))"),axisZ=entity("DIRECTION('',(0.,0.,1.))"),axisX=entity("DIRECTION('',(1.,0.,0.))"),placement=entity(`AXIS2_PLACEMENT_3D('',${origin},${axisZ},${axisX})`);
    for(const o of objects){
      const name=stepText(o.name),product=entity(`PRODUCT('${name}','${name}','Faceted mesh',(${productContext}))`);
      const formation=entity(`PRODUCT_DEFINITION_FORMATION('','',${product})`),definition=entity(`PRODUCT_DEFINITION('design','',${formation},${definitionContext})`),shape=entity(`PRODUCT_DEFINITION_SHAPE('','',${definition})`);
      const points=o.vertices.map(v=>entity(`CARTESIAN_POINT('',(${v.map(real).join(",")}))`));
      const faces=o.triangles.map(f=>{
        const a=new THREE.Vector3(...o.vertices[f[0]]),b=new THREE.Vector3(...o.vertices[f[1]]),c=new THREE.Vector3(...o.vertices[f[2]]);
        const x=b.sub(a).normalize(),z=new THREE.Vector3().crossVectors(x,c.sub(a)).normalize();
        const normal=entity(`DIRECTION('',(${z.toArray().map(real).join(',')}))`),reference=entity(`DIRECTION('',(${x.toArray().map(real).join(',')}))`);
        const frame=entity(`AXIS2_PLACEMENT_3D('',${points[f[0]]},${normal},${reference})`),plane=entity(`PLANE('',${frame})`);
        const loop=entity(`POLY_LOOP('',(${f.map(i=>points[i]).join(",")}))`),bound=entity(`FACE_OUTER_BOUND('',${loop},.T.)`);
        return entity(`FACE_SURFACE('',(${bound}),${plane},.T.)`);
      });
      // Each connected shell has a separate representation item. Nested voids
      // are refused rather than exporting a filled cavity as a separate solid.
      const items=[];
      for(const component of o.components){
        const tris=component.map(i=>o.triangles[i]);
        if(signedVolume(o.vertices,tris)<=EPS)fail("STEP facetado: casca interna ou volume nulo não suportado", "Faceted STEP: internal shell or zero volume is unsupported");
        const shell=entity(`CLOSED_SHELL('',(${component.map(i=>faces[i]).join(",")}))`);items.push(entity(`FACETED_BREP('${name}',${shell})`));
      }
      const rep=entity(`FACETED_BREP_SHAPE_REPRESENTATION('${name}',(${[placement,...items].join(",")}),${context})`);
      entity(`SHAPE_DEFINITION_REPRESENTATION(${shape},${rep})`);
    }
    lines.push("ENDSEC;","END-ISO-10303-21;");return new Blob([lines.join("\n")+"\n"],{type:"application/step;charset=utf-8"});
  }
  root.CadMesh={EPS,MAX_TRIANGLES,normalize,fromMesh,collect,toGeometry,topology,signedVolume,stl,obj,step};
  if (typeof module !== "undefined" && module.exports) module.exports = root.CadMesh;
})(typeof window!=="undefined"?window:globalThis);
