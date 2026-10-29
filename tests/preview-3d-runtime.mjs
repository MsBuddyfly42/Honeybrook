// Logic/geometry harness, deliberately not a GPU or browser visual test.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {createCanvas}=require(process.env.CANVAS_MODULE||'@napi-rs/canvas');
const elements=new Map(),events=new Map(),store=new Map([['honeybrook_life_v1','legacy-sentinel'],['honeybrook_chronicles_v1','story-sentinel']]);
const element=id=>{if(!elements.has(id))elements.set(id,{id,open:false,hidden:true,textContent:'',value:'',tagName:'DIV',append(){},focus(){},click(){},setAttribute(){},setPointerCapture(){},addEventListener(){},showModal(){this.open=true},close(){this.open=false}});return elements.get(id)};
globalThis.window=globalThis;globalThis.innerWidth=1280;globalThis.innerHeight=800;globalThis.devicePixelRatio=1;globalThis.location={reload(){}};
globalThis.document={getElementById:element,createElement:t=>t==='canvas'?createCanvas(256,256):element('new-'+t),querySelectorAll:()=>[],addEventListener:(n,f)=>events.set(n,f),hidden:false};
globalThis.addEventListener=(n,f)=>events.set(n,f);globalThis.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};
let frame;globalThis.requestAnimationFrame=fn=>frame=fn;
let meshes=0,triangles=0;
globalThis.TestRenderer=class{constructor(){this.domElement=element('canvas');this.info={render:{calls:0,triangles:0}};}setPixelRatio(){}setSize(){}render(scene){meshes=0;triangles=0;scene.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;}});this.info.render={calls:meshes,triangles};}};
const source=fs.readFileSync(new URL('../preview-3d/world.js',import.meta.url),'utf8').replace("import * as THREE from './vendor/three.module.min.js';","import * as RealThree from './vendor/three.module.min.js'; const THREE={...RealThree,WebGLRenderer:globalThis.TestRenderer};");
const tmp=new URL('../preview-3d/.runtime-check.mjs',import.meta.url);fs.writeFileSync(tmp,source);
try{
 await import(tmp.href+'?t='+Date.now());let now=performance.now();const step=(seconds)=>{for(let i=0;i<Math.ceil(seconds*60);i++){now+=1000/60;frame(now)}};
 const key=(name,down)=>events.get(down?'keydown':'keyup')({key:name,repeat:false,target:{tagName:'CANVAS'},preventDefault(){}});
 const hold=(name,sec)=>{key(name,true);step(sec);key(name,false);};const press=name=>{key(name,true);key(name,false);step(.1);};
 assert.equal(element('intro').open,true);element('begin').onclick();step(.1);
 assert.ok(meshes<220,`Static batching left ${meshes} mesh draws`);assert.ok(triangles<100000);
 // Walk into the closed doorway; collision stops the player outside.
 hold('w',5);let s=honeybrook3D.snapshot();assert.ok(s.position.z>=1.4&&s.position.z<2,JSON.stringify(s));assert.equal(element('target').textContent,'Open door');
 press('e');hold('w',2);assert.ok(honeybrook3D.snapshot().position.z<0,'Walk through opened door');assert.match(element('location').textContent,/reception/);
 // Return outside and drive via actual interaction selection.
 element('home').onclick();hold('r',1.5);hold('d',1.3);press('e');assert.equal(honeybrook3D.snapshot().driving,true);hold('w',1.2);assert.ok(honeybrook3D.snapshot().vehicle.z<12);press('e');assert.equal(honeybrook3D.snapshot().driving,true,'Cannot exit at speed');step(5);press('e');assert.equal(honeybrook3D.snapshot().driving,false);
 // Reach reception and accept only through its visible control handler.
 element('home').onclick();hold('w',4.5);hold('q',.9);step(.1);assert.match(element('target').textContent,/Reception/);press('e');assert.equal(element('panel').open,true);element('accept').onclick();assert.equal(honeybrook3D.snapshot().stage,1);
 // Garden pickup and harvest: route around the building, not through walls.
 element('home').onclick();hold('q',4.05);hold('w',5.2);step(.1);assert.match(element('target').textContent,/basket/i);press('e');assert.equal(honeybrook3D.snapshot().stage,2);hold('q',1.1);hold('w',.6);press('e');assert.equal(honeybrook3D.snapshot().stage,3);
 // Return through the real front door, then reach the kitchen table.
 element('home').onclick();hold('w',4.5);hold('r',1.1);hold('w',2.6);step(.1);assert.match(element('target').textContent,/kitchen table/);press('e');assert.equal(honeybrook3D.snapshot().stage,4);press('e');assert.equal(honeybrook3D.snapshot().stage,5);
 events.get('blur')();const saved=JSON.parse(store.get('honeybrook_3d_preview_v1'));assert.equal(saved.stage,5);assert.equal(saved.memories.length,1);assert.equal(store.get('honeybrook_life_v1'),'legacy-sentinel');assert.equal(store.get('honeybrook_chronicles_v1'),'story-sentinel');
 // Cross-tab conflict preserves the newer bytes.
 const changed=JSON.stringify({...saved,revision:saved.revision+1});store.set('honeybrook_3d_preview_v1',changed);events.get('storage')({key:'honeybrook_3d_preview_v1',newValue:changed});element('home').onclick();assert.equal(store.get('honeybrook_3d_preview_v1'),changed);assert.equal(honeybrook3D.snapshot().saveBlocked,true);
 console.log(`PASS geometry/logic harness: ${meshes} mesh draws, ${Math.round(triangles)} triangles; real movement/closed-door collision/open entry; driving/stop-before-exit; all five delivery actions via interactions; legacy sentinels untouched; stale-tab protection. GPU rendering remains unverified.`);
}finally{fs.unlinkSync(tmp);}
