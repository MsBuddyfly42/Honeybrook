const assert=require('node:assert/strict'),fs=require('node:fs'),E=require('../journey-actions-engine'),J=require('../journey-engine'),D=require('../community-life-data');
let checks=0;
function solve(p){let s=E.initial();assert(!E.ready(p,s),p.title+' cannot complete on opening');const original=JSON.stringify(s);
 if(p.kind==='notebook')p.cards.forEach((c,i)=>s=E.update(p,s,{type:'classify',index:i,target:c[1]}));
 else if(['inspect','reading','count'].includes(p.kind)){p.details.forEach((_,i)=>s=E.update(p,s,{type:'open',index:i}));if(p.kind==='count'){assert(!E.ready(p,s));s=E.update(p,s,{type:'note',text:'6'});}}
 else if(p.kind==='conversation')s=E.update(p,s,{type:'response',index:0});
 else if(p.kind==='record')s=E.update(p,s,{type:'note',text:'I will keep the source and my next question together.'});
 else if(p.kind==='clean')for(let i=0;i<12;i++)s=E.update(p,s,{type:'wipe',index:i});
 else if(p.kind==='sew'){s=E.update(p,s,{type:'stitch',index:5});assert.equal(s.stitches,0);for(let i=0;i<8;i++)s=E.update(p,s,{type:'stitch',index:i});}
 else if(p.kind==='pour')for(let i=0;i<3;i++)s=E.update(p,s,{type:'pour'});
 else if(['sequence','route'].includes(p.kind)){p.items.forEach((_,i)=>s=E.update(p,s,{type:'order',index:i}));}
 else p.items.forEach((_,i)=>s=E.update(p,s,{type:'place',index:i,target:i}));
 assert(E.ready(p,s),p.title);assert.notEqual(JSON.stringify(s),original);assert(E.ready(p,JSON.parse(JSON.stringify(s))),'draft reload keeps work');checks++;
}
for(const [id,list]of Object.entries(E.opening)){assert.equal(list.length,2);for(const [i,p]of list.entries())solve({...E.plan(p),...p,id:id+i});}
for(const x of [...D.jobs.flatMap(x=>x.steps.map(title=>({title,source:x.name}))),...D.rooms.flatMap(x=>x.steps.map(([,title])=>({title,source:x.name}))),...D.beeSeasons.flatMap(x=>x.steps.map(([,title])=>({title,source:x.name})))])solve(E.plan({...x,items:['Prepared object'],zones:['Work position']}));
solve(E.plan({title:'Compare the source evidence',kind:'evidence',items:['Object mark','Checked record','Received object'],zones:['Object source','Written source','Receipt source']}));
solve(E.plan({title:'Goldilocks’s letter',kind:'reading',details:[['First page','Source prose'],['Signature','Goldilocks']]}));
let sequence=E.plan({title:'First afternoon',kind:'sequence',items:['Room','Wash','Meal','Apiary']}),work=E.initial();for(const index of [3,2,1,0])work=E.update(sequence,work,{type:'order',index});assert(!E.ready(sequence,work),'wrong story order remains unfinished');for(let i=0;i<4;i++)work=E.update(sequence,work,{type:'undo'});assert.equal(work.order.length,0);
let state=J.run(J.initial(),{type:'intro'});for(let scene=0;scene<8;scene++){assert.throws(()=>J.run(state,{type:'choose',scene,choice:0}));for(let object=0;object<2;object++)state=J.run(state,{type:'observe',scene,object});state=J.run(state,{type:'choose',scene,choice:0});assert(J.valid(JSON.parse(JSON.stringify(state))));}assert.equal(state.scene,8);assert(J.scenes.findIndex(x=>x.id==='room')<J.scenes.findIndex(x=>x.id==='bees'));
for(let scene=0;scene<8;scene++)for(const observed of [[],[0],[0,1]]){const old={version:1,revision:15,introduced:true,scene,observed,choices:Array(scene).fill(0)};assert(J.valid(old));const before=JSON.stringify(old),next=J.run(old,{type:'observe',scene,object:1});assert(J.valid(next));assert.equal(JSON.stringify(old),before);assert.equal(next.scene,old.scene);assert(next.observed.includes(1));if(scene===5&&observed.length)assert.equal(J.scenesFor(next)[5].id,'bees','mid-apiary older progress retains its original index');}
const ui=fs.readFileSync(__dirname+'/../journey.js','utf8');for(const name of ['observe','sceneAction','board','close','job','order','cozy'])assert(ui.includes("'"+name+"'in d)perform("),name+' opens a workspace');
for(const html of ['journey.html','nell.html']){const text=fs.readFileSync(__dirname+'/../'+html,'utf8');for(const script of ['journey-actions-engine.js','journey-actions.js','action-photography.js'])assert(text.includes(script));}
console.log('PASS '+checks+' authored activity/step plans; no opening-only completion, all work mechanics, wrong-order retry, draft reload, 24 legacy save positions, scene order and UI entry wiring.');
