/* Independent companion-game records. No Journey, finances or existing keys are written. */
(function(root,factory){const E=factory();if(typeof module==='object')module.exports=E;else root.StorywoodEngine=E;})(typeof window==='object'?window:globalThis,()=>{'use strict';
const initial=()=>({version:1,revision:0,tales:{},memories:{},notes:'',chapters:[],visits:[]});
const plain=x=>x&&typeof x==='object'&&!Array.isArray(x),unique=a=>Array.isArray(a)&&new Set(a).size===a.length;
function valid(s,D){return plain(s)&&s.version===1&&Number.isSafeInteger(s.revision)&&s.revision>=0&&plain(s.tales)&&Object.entries(s.tales).every(([id,t])=>D.tales.some(v=>v.id===id)&&plain(t)&&unique(t.objects)&&t.objects.every(x=>['keepsake','account','route'].includes(x))&&typeof t.found==='boolean'&&typeof t.recovered==='boolean'&&Number.isSafeInteger(t.tellings)&&t.tellings>=0&&(!t.recovered||t.found)&&(!t.tellings||t.recovered))&&plain(s.memories)&&Object.entries(s.memories).every(([id,n])=>D.elders.some(e=>e.memories.some(m=>e.id+':'+m.id===id))&&Number.isSafeInteger(n)&&n>0)&&typeof s.notes==='string'&&s.notes.length<=20000&&unique(s.chapters)&&s.chapters.every(x=>typeof x==='string'&&/^r-(prologue|epilogue|\d+)$/.test(x))&&unique(s.visits)&&s.visits.every(x=>typeof x==='string'&&[...D.tales,...D.elders,...D.woods].some(v=>v.id===x));}
function run(s,a,D){if(!valid(s,D))throw Error('This record needs recovery before it can be changed.');let n=JSON.parse(JSON.stringify(s));const tale=D.tales.find(t=>t.id===a.id);let t;if(tale)t=n.tales[a.id]??={objects:[],found:false,recovered:false,tellings:0};
switch(a.type){case'visit':if(![...D.tales,...D.elders,...D.woods].some(x=>x.id===a.id))throw Error('Unknown destination.');if(!n.visits.includes(a.id))n.visits.push(a.id);break;
case'examine':if(!t||!['keepsake','account','route'].includes(a.object))throw Error('Choose an object at this home.');if(!t.objects.includes(a.object))t.objects.push(a.object);break;
case'find':if(!t||t.objects.length!==3||a.marker!==tale.marker)throw Error('Compare the three observations with the woodland marker first.');t.found=true;break;
case'recover':if(!t?.found||!Array.isArray(a.parts)||a.parts.join(',')!=='0,1,2')throw Error('Place the account in its proper sequence.');t.recovered=true;break;
case'tell':if(!t?.recovered)throw Error('Recover the account before carrying it onward.');if(a.understanding!==tale.omitted)throw Error('Keep the resident’s missing part in the telling.');t.tellings++;break;
case'memory':{const e=D.elders.find(e=>e.id===a.elder),m=e?.memories.find(m=>m.id===a.memory);if(!m||a.object!==m.object)throw Error('Listen to the teller and examine the keepsake first.');const key=e.id+':'+m.id;n.memories[key]=(n.memories[key]||0)+1;break;}
case'note':if(typeof a.text!=='string'||a.text.length>20000)throw Error('Keep notebook text under 20,000 characters.');n.notes=a.text;break;
case'chapter':if(!/^r-(prologue|epilogue|\d+)$/.test(a.id))throw Error('Unknown chapter.');if(!n.chapters.includes(a.id))n.chapters.push(a.id);break;
default:throw Error('Unknown activity.');}n.revision++;if(!valid(n,D))throw Error('The proposed change could not be checked.');return n;}
function awakening(s,D){const told=D.tales.filter(t=>(s.tales[t.id]?.tellings||0)>0).length;return{told,total:D.tales.length,stage:told===0?0:told<D.tales.length?1:2};}
return{initial,valid,run,awakening};});
