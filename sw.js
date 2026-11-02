/* Caches are shared by origin: this worker owns only this prefix and scope. */
const CACHE_PREFIX = '3dcad-studio-';
const CACHE_NAME = `${CACHE_PREFIX}v1.4.1`;
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './cad_sketch_solver.js',
  './cad_exact_engine.js',
  './cad_assembly.js',
  './cad_kernel.js',
  './cad_worker.js',
  './cad_mesh.js',
  './cad_generators.js',
  './cad_project.js',
  './ui_text.js',
  './cad_assistant.js',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './icon.webp',
  './favicon-32x32.png',
  './favicon.ico',
  './libs/three.min.js',
  './libs/OrbitControls.js',
  './libs/STLExporter.js',
  './libs/STLLoader.js',
  './libs/three-csg.js',
  './libs/replicad.global.js',
  './libs/replicad.bundle.js',
  './libs/replicad_single.js',
  './libs/replicad_single.wasm',
  './libs/replicad_single.mjs'
];
const scope = self.registration.scope;
const ownedAssets = new Set(ASSETS.map(asset=>new URL(asset,scope).href));
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS.map(asset=>new Request(new URL(asset,scope).href,{cache:'reload'})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||!ownedAssets.has(event.request.url))return;
  // A successful installation keeps one coherent version; query strings,
  // external requests and other apps never enter this cache.
  event.respondWith(caches.open(CACHE_NAME).then(async cache=>{
    const cached=await cache.match(event.request);
    if(cached)return cached;
    return fetch(event.request);
  }).catch(()=>new Response('3DCad offline asset unavailable',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}})));
});
