// Run with: node tests/daily-life.cjs
const assert=require('node:assert/strict'), vm=require('node:vm'), fs=require('node:fs');
const source=fs.readFileSync(require('node:path').join(__dirname,'../town-walk.js'),'utf8');
const engine=source.slice(source.indexOf('    const activitySteps='),source.indexOf('    function timeSlot()'));
const context={memory:{},Intl,Date};vm.createContext(context);
vm.runInContext(engine+';this.state=activityState;this.advance=advanceActivity;this.day=activityDay;',context);
for(const [slot,total] of [[0,3],[1,4],[2,5]]){
  let state=context.state(slot,null);assert.equal(state.step,0);
  for(let n=1;n<=total;n++){assert.equal(context.advance(slot,state),true);assert.equal(state.step,n);state=context.state(slot,JSON.parse(JSON.stringify(state)));assert.equal(state.step,n);}
  assert.equal(context.advance(slot,state),false);assert.equal(state.step,total);
  const nextDay=context.state(slot,{...state,day:'yesterday',recorded:true});assert.equal(nextDay.step,0);assert.equal(nextDay.recorded,false);
  assert.equal(context.state(slot,{day:context.day(),step:999,color:'unsafe'}).step,total);
  assert.equal(context.state(slot,{day:context.day(),step:-5}).step,0);
  assert.equal(context.state(slot,{day:context.day(),step:'2'}).step,0);
}
let records=0;Object.assign(context,{activity:{slot:0,watching:true,state:{step:3}},activitySteps:[['a','b','c']],happenings:[{title:'Flowers',bear:'Amelia',join:'Thanks'}],friendship:()=>({}),addMemory:()=>records++,daily:{querySelector:()=>({textContent:''})}});
vm.runInContext(source.slice(source.indexOf('    function finishActivity()'),source.indexOf('    function renderActivity()'))+';this.finish=finishActivity;',context);
context.finish();assert.equal(records,0,'Watching cannot award completion');
context.activity.watching=false;context.activity.state.step=2;context.finish();assert.equal(records,0,'Partial progress cannot award completion');
context.activity.state.step=3;context.finish();context.finish();assert.equal(records,1,'Repeated completion records once');
assert.equal(context.memory.dailyPlay[0].recorded,true);
console.log('All three activity sequences, saved progress, new-day reset, watch-only behavior and one-time completion passed.');
