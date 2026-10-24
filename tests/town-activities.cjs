const assert=require('node:assert/strict'),E=require('../life-engine.js'),C=E.Town,Q=E.Quiz;
const date='2026-10-23',act=(s,type,data={})=>E.action(s,{type,...data},date).state;
function answer(t,s,i){const p=C.profileFor(t,s),w=C.work(t,s,E.recipe);if(i===0)return p.tools;if(i===1)return p.plan;if(i===3)return ['Work matches the plan','The finished work passes inspection','The family or supervisor receives the result'];if(i===4)return t.artifact;switch(w.type){case 'numbers':case 'craft':case 'mail':return w.answers;case 'cook':return{quantities:w.answers,order:w.sequence};case 'garden':return Array(6).fill(2);case 'painting':return w.colors.slice(0,6);case 'route':return['DOWN','DOWN','RIGHT','RIGHT','RIGHT'];case 'targets':return w.targets;default:return w.sequence;}}
assert.equal(C.jobs.length,86);assert.equal(new Set(C.jobs.map(j=>j.id)).size,86);
for(const j of C.jobs){const t=E.tasks[j.id];let s=act(E.initial(date),'visit',{id:t.location});assert(E.valid(s));const start=s.balance;
 assert.throws(()=>act(s,'task',{id:t.id,choice:0}),/hands-on/);
 assert.throws(()=>act(s,'townTask',{id:t.id,step:4,input:t.artifact}),/another step/);
 const bad=act(s,'townTask',{id:t.id,step:0,input:[]});assert.equal(bad.balance,start);assert.equal(bad.completed,0);
 for(let cycle=0;cycle<3;cycle++){for(let i=0;i<5;i++){
 const before=s.balance,progress=s.completed;s=act(s,'townTask',{id:t.id,step:i,input:answer(t,s,i)});assert(E.valid(s),j.name+' step '+i);assert.equal(s.completed,progress+(i===4?1:0));if(i!==0&&i!==4)assert.equal(s.balance,before);s=JSON.parse(JSON.stringify(s));
 }assert.equal(s.counts[t.id],cycle+1);assert.equal(s.balance,start+(cycle+1)*(t.pay-t.cost));}
 assert.throws(()=>act(s,'townTask',{id:t.id,step:0,input:answer(t,s,0)}),/Three completions/);assert.equal(s.townResults[t.id].total,3);assert.equal(s.relationships[C.profiles[t.profile].person],3);assert(s.keepsakes.includes(t.artifact));assert.equal(s.history.filter(h=>h.kind==='accomplishment').length,3);
 s=act(s,'rest');assert.equal(s.counts[t.id],undefined);assert(E.valid(s));
 s=act(s,'townTask',{id:t.id,step:0,input:answer(t,s,0)});s=act(s,'rest');assert.equal(s.progress[t.id],1,'paid preparation survives rest');s=act(s,'townTask',{id:t.id,step:1,input:answer(t,s,1)});assert.equal(s.progress[t.id],2);
}
for(const level of Q.levels){const qs=Q.questions(date,level);assert.equal(qs.length,20);assert.equal(new Set(qs.map(q=>q.id)).size,20);assert.deepEqual(qs,Q.questions(date,level));assert.notDeepEqual(qs,Q.questions('2026-10-24',level));let s=act(E.initial(date),'dailyQuizStart',{level});for(let i=0;i<20;i++){s=act(s,'dailyQuizAnswer',{step:i,choice:qs[i].correct});assert(E.valid(JSON.parse(JSON.stringify(s))));}assert.equal(s.skills['Daily learning'],1);assert.equal(s.balance,250000);assert.throws(()=>act(s,'dailyQuizAnswer',{step:20,choice:0}));const saved=JSON.stringify(s.dailyQuiz);s=act(s,'rest');assert.equal(JSON.stringify(s.dailyQuiz),saved);assert.throws(()=>act(s,'dailyQuizStart',{level}));}
console.log('PASS all 86 assignments: hands-on work, no bypass, costs, delivery rewards, histories, save/reload, 3/day limits and rest. PASS 20-question real-day quiz at all six levels.');
