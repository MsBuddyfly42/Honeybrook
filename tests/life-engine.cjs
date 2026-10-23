const assert=require('node:assert/strict');
const E=require('../life-engine.js');
let checks=0;
function test(name,run){run();checks++;console.log('PASS '+name);}
const today='2026-10-22';
const act=(s,type,props={})=>E.action(s,{type,...props},today).state;
const visit=(s,id)=>act(s,'visit',{id});
function complete(s,id,place){s=visit(s,place);for(const p of E.tasks[id].steps)s=act(s,'task',{id,choice:p.correct});return s;}
test('New state, U.S. calendar, date rollovers and four seasons',()=>{
 const s=E.initial(today);assert(E.valid(s));assert.equal(s.balance,250000);assert.equal(s.balance+s.reserve,1e12);
 assert.equal(E.realDate(new Date('2026-10-23T01:00:00Z')),today);assert.equal(E.addDay('2026-12-31'),'2027-01-01');
 assert.deepEqual(['2026-01-01','2026-04-01','2026-07-01','2026-10-01'].map(E.season),['Winter','Spring','Summer','Autumn']);
});
test('Every location has a connected route to home and valid local activities',()=>{
 for(const [id,l] of Object.entries(E.locations)){assert(l.image);for(const t of l.activities)assert(E.tasks[t]);const seen=new Set();let p=id;while(p){assert(!seen.has(p));seen.add(p);assert(E.locations[p]);p=E.locations[p].parent;}assert(seen.has('home'),id);}
});
test('Wrong decisions preserve progress and funds; partial work survives serialization',()=>{
 let s=visit(E.initial(today),'dining');const wrong=E.tasks.cook.steps[0].correct===0?1:0;
 s=act(s,'task',{id:'cook',choice:wrong});assert.equal(s.balance,250000);assert.equal(s.completed,0);assert.equal(s.progress.cook,undefined);
 s=act(s,'task',{id:'cook',choice:E.tasks.cook.steps[0].correct});s=JSON.parse(JSON.stringify(s));assert(E.valid(s));assert.equal(s.progress.cook,1);
 s=act(s,'task',{id:'cook',choice:E.tasks.cook.steps[1].correct});assert.equal(s.completed,0);
});
test('Every weekly meal has a portion card, and a cooking assignment keeps its menu as time advances',()=>{
 for(let day=1;day<=7;day++)for(const hour of [9,13,17]){const r=E.recipe({...E.initial(today),day,hour});assert.equal(r.portions,12);assert(r.ingredients.length>=2);assert.equal(r.name,E.menu[day-1][hour===9?0:hour===13?1:2]);}
 let s=visit(E.initial(today),'dining');const breakfast=E.meal(s);s=act(s,'task',{id:'cook',choice:1,step:0});assert.throws(()=>act(s,'task',{id:'cook',choice:1,step:0}),/next step/);s=act(s,'hour',{hour:13});assert.equal(E.meal(s),breakfast);
 s=act(s,'task',{id:'cook',choice:0,step:1});s=act(s,'task',{id:'cook',choice:0,step:2});assert(s.history.at(-1).text.includes(breakfast));assert.equal(E.meal(s),E.menu[0][1]);
});
test('Completion awards once, shared relationships, skill, permanent menu record and three-per-day cap',()=>{
 let s=E.initial(today);s=act(s,'partner',{id:'maya'});s=complete(s,'cook','dining');assert.equal(s.balance,275000);assert.equal(s.completed,1);assert.equal(s.skills.Cooking,1);assert.equal(s.relationships.maya,1);assert.equal(s.relationships.sofia,1);assert(s.history.at(-1).text.includes(E.meal(s)));
 s=complete(s,'cook','dining');s=complete(s,'cook','dining');assert.equal(s.counts.cook,3);assert.throws(()=>act(s,'task',{id:'cook',choice:1}),/Three completions/);
 const history=s.history.length;s=act(s,'rest');assert.equal(s.date,'2026-10-23');assert.equal(s.counts.cook,undefined);assert(s.history.length>history);assert(!E.blocked(s,'cook'));
});
test('Every activity executes meaningful decision sequence and reaches a checked completion',()=>{
 for(const [id,t] of Object.entries(E.tasks).filter(([,t])=>!t.town)){
  let s=E.initial('2026-10-23'); // Suitable outdoor weather.
  const place=Object.keys(E.locations).find(p=>E.locations[p].activities.includes(id));assert(place,id);
  if(t.hour)s.hour=t.hour;if(t.item)s.inventory[t.item]=1;if(t.trip)s.trip=true;
  s=complete(s,id,place);assert.equal(s.completed,1,id);assert.equal(s.balance,250000+t.pay,id);assert.equal(s.keepsakes[0],t.name,id);assert(E.valid(s),id);
 }
});
test('Arrival story is a one-time discovery tied to Sammy and existing founders',()=>{
 let s=complete(E.initial(today),'welcome','home');assert.equal(s.balance,250000);assert(E.blocked(s,'welcome'));s=act(s,'rest');assert(E.blocked(s,'welcome'));assert(E.tasks.welcome.steps.some(p=>p.result.includes('Amelia')));
});
test('No remote task completion and all roles stay playable',()=>{
 const s=E.initial(today);assert.throws(()=>act(s,'task',{id:'cook',choice:1}),/location/);
 for(const id of ['Camper','Family member','Cook','Counselor','Worker','Owner'])assert.equal(act(s,'role',{id}).role,id);
 assert.throws(()=>act(s,'role',{id:'hacker'}));
});
test('Affordable properties, trust replenishment and no purchased standing',()=>{
 let s=E.initial(today);s.balance=25001;const trust=s.trust,rank=E.rank(s).name,reserve=s.reserve;
 assert.throws(()=>act(s,'buyBusiness',{id:'cabins'}),/enough/);
 s=act(s,'buyBusiness',{id:'garden'});assert.equal(s.balance,250000);assert.equal(s.reserve,reserve-(250000-13001));
 assert.equal(s.trust,trust);assert.equal(E.rank(s).name,rank);assert(s.history.some(h=>h.text.includes('transfer')));
});
test('Each enterprise needs staff, supplies and performed service; revenue cannot repeat',()=>{
 for(const [id,,place,,task] of E.enterprises){let s=E.initial('2026-10-23');s=act(s,'buyBusiness',{id});assert.throws(()=>act(s,'manage',{id,job:'revenue'}),/service/);
  s=act(s,'manage',{id,job:'staff'});s=act(s,'manage',{id,job:'supplies'});assert.throws(()=>act(s,'manage',{id,job:'revenue'}),/service/);
  s=complete(s,task,place);const balance=s.balance;s=act(s,'manage',{id,job:'revenue'});assert(s.balance>balance);assert.equal(s.businesses[id].supplies,2);assert(s.history.at(-1).text.includes('wages'));
  assert.throws(()=>act(s,'manage',{id,job:'revenue'}),/once/);s=act(s,'rest');assert.throws(()=>act(s,'manage',{id,job:'revenue'}),/service/);
 }
});
test('Camping requires all actual supplies and every inspected checklist; never starts automatically',()=>{
 let s=E.initial(today);assert.throws(()=>act(s,'beginTrip'),/checklist/);assert.throws(()=>act(s,'prepare',{id:'You'}),/Buy/);
 for(const [id] of E.gear.slice(0,8)){for(let i=0;i<(['sleep','water','wash'].includes(id)?3:1);i++)s=act(s,'buyGear',{id});}
 assert(!s.trip);assert(!E.ready(s));for(const id of [...E.people,'Shared'])s=act(s,'prepare',{id});assert(E.ready(s));assert(!s.trip);
 s=act(s,'beginTrip');assert(s.trip);assert.equal(s.location,'hills');assert.throws(()=>act(s,'beginTrip'),/already/);
 for(let n=0;n<7;n++)s=act(s,'rest');assert.equal(s.tripNights,7);assert.throws(()=>act(s,'rest'),/stay limit/);
 s=act(s,'endTrip');assert(!s.trip);assert.equal(s.location,'home');s=act(s,'rest');assert.equal(s.day,9);
});
test('Read mail leaves unread inbox but stays in permanent history; new morning news reflects events',()=>{
 let s=E.initial(today);s=act(s,'readMail',{id:'arrival'});assert.equal(s.unread.length,0);assert(s.history.at(-1).text.includes('Sammy'));assert.throws(()=>act(s,'readMail',{id:'arrival'}),/already/);
 s=complete(s,'cook','dining');s=act(s,'rest');assert.equal(s.unread.length,1);assert(s.unread[0].body.includes('1 completed activities'));
});
test('Real calendar quiz cannot be farmed through camp rest',()=>{
 let s=E.initial(today);s=act(s,'quiz',{choice:0});assert.equal(s.quizDates.length,0);s=act(s,'quiz',{choice:1});s=act(s,'rest');assert.throws(()=>act(s,'quiz',{choice:1}),/real-calendar/);
 s=E.action(s,{type:'quiz',choice:1},'2026-10-23').state;assert.equal(s.quizDates.length,2);
});
test('Night fires, s’mores and suitable weather are all required',()=>{
 let s=visit(E.initial('2026-10-23'),'gathering');assert(E.blocked(s,'campfire').includes('night'));s=act(s,'hour',{hour:21});assert(E.blocked(s,'campfire').includes('s’mores'));s=act(s,'buyGear',{id:'smores'});assert.equal(E.blocked(s,'campfire'),'');
 s=complete(s,'campfire','gathering');assert.equal(s.inventory.smores,0);s.date='2026-07-03';assert.equal(E.weather(s.date),'Thunderstorm');assert(E.blocked(s,'water').includes('Unsafe'));
});
test('Neglect changes maintenance needs; inspected service restores condition',()=>{
 let s=E.initial(today);s=act(s,'rest');assert.equal(s.condition,92);s=complete(s,'repair','workshop');assert.equal(s.condition,97);
});
test('Invalid and malicious save shapes are rejected before actions',()=>{
 for(const changes of [{balance:-1},{revision:-1},{progress:{cook:100}},{businesses:{fake:{}}},{counts:{cook:4}},{unread:[{id:'x'}]},{history:[null]},{inventory:{sleep:-1}},{role:'invalid'},{location:'missing'}])assert(!E.valid({...E.initial(today),...changes}));
 assert(!E.valid(null));assert(!E.valid([]));assert.throws(()=>act({...E.initial(today),balance:-1},'rest'),/invalid/);
});
console.log(`${checks} rule groups passed.`);
