const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(__dirname+'/../story-mode.js','utf8');
const dataSource=fs.readFileSync(__dirname+'/../interior-data.js','utf8');
const dataContext={};vm.runInNewContext(dataSource,dataContext);
const data=dataContext.HoneybrookInteriorsData||dataContext.HoneybrookInteriorData;
function boot(type='navigate',pathname='/index.html',hash='#citymap'){
 const entries=new Map([['honeybrook_story_mode_v1','{"version":1,"active":true}'],['honeybrook_journey_opening_v1','{"scene":0}'],['saved-finances','unchanged']]),before=JSON.stringify([...entries]),events={};
 const loc={origin:'https://honeybrook.onrender.com',pathname,hash,search:'',href:'https://honeybrook.onrender.com'+pathname+hash,replace(href){throw Error('Unexpected navigation: '+href);}};
 const w={top:{}};const ctx={window:w,URL,URLSearchParams,location:loc,performance:{getEntriesByType:()=>[{type}]},history:{replaceState(){},scrollRestoration:'auto'},scrollTo(){},document:{currentScript:{src:'https://honeybrook.onrender.com/story-mode.js'},documentElement:{style:{}},readyState:'loading',head:{append(){}},createElement:()=>({}),addEventListener(){}},localStorage:{getItem:k=>entries.get(k)||null,setItem:(k,v)=>entries.set(k,v)},sessionStorage:{getItem:()=> 'open',setItem(){}},addEventListener:(k,f)=>events[k]=f,MutationObserver:class{}};
 vm.runInNewContext(source,ctx);assert.equal(JSON.stringify([...entries]),before);return w.HoneybrookStoryMode;
}
const guard=boot();let count=0;
for(const name of ['Honeybrook Town Hall','Honeybrook Gazette','Honeybrook Post Office','Public Safety','Honeybrook Town Clock','Honeybrook founding trail','Honeybrook town map']){assert(guard.allowed('index.html#visit='+encodeURIComponent(name)),name);count++;}
for(const key of ['ts','town','bv','hollow','ms','sq','hh','ep','pk','cc','fr','se','os','ne','nw']){assert(guard.allowed('index.html#district='+key));count++;}
assert(data?.buildings?.length,'interior catalogue loaded');
for(const b of data.buildings)for(const r of b.rooms){assert(guard.allowed('interiors.html?building='+b.id+'&room='+r.id),b.name+' '+r.name);count++;}
for(const route of ['index.html','index.html#citymap','activities.html?name=Public%20Safety','welcome-office/index.html','reception.html','refuge.html','games/honeybrook-craft-fair/?portal=fair','storywood.html#region=lane']){assert(guard.allowed(route),route);count++;}
assert(!guard.allowed('https://example.com/'));assert(!guard.allowed('nell.html'));assert(!guard.allowed('nell-research.html'));
console.log(count+' town and room routes stay open with an unfinished Journey; story gates and existing saves preserved.');
