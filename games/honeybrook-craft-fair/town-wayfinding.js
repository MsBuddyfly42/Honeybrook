/* The established town and Bear Hollow share the district geography. */
(()=>{'use strict';
const geography=window.HoneybrookGeography;
function element(tag,text){const n=document.createElement(tag);if(text)n.textContent=text;return n;}
function refresh(){const api=window.HoneybrookTownNavigation;if(!api?.isTown)return;const c=api.context();let map=document.querySelector('.city-map-launch');if(!map){map=element('a','🗺️ Whole Honeybrook City Map');map.className='city-map-launch';document.body.append(map);}const cityKey=c.parent==='hollow'||c.key==='hollow'?'hollow':c.key==='town'?'town':geography.districts[c.parent]?c.parent:'ts';map.href='../../index.html#citymap&from='+cityKey;let drawer=document.getElementById('connected-town-paths');if(c.scene==='title'){if(drawer)drawer.hidden=true;return;}
if(!drawer){drawer=element('details');drawer.id='connected-town-paths';document.body.append(drawer);}drawer.hidden=false;const wasOpen=drawer.open;drawer.replaceChildren();drawer.append(element('summary','Town paths · '+c.name));const body=element('div');drawer.append(body);body.append(element('p','You are in '+c.name+'. The Fairgrounds have their own entrance from Town Square.'));
function open(text,key){const b=element('button',text);b.type='button';b.dataset.townRoute=key;b.onclick=()=>{api.open(key);drawer.open=false;};body.append(b);}
function district(text,key){const a=element('a',text);a.href='../../index.html#district='+key;a.dataset.districtRoute=key;body.append(a);}
if(c.scene!=='town')open('Return along the town paths → Honeybrook town map','town');
if(c.parent==='hollow'){open('Return to Bear Hollow square','hollow');}else if(geography.districts[c.parent])district('Exit to '+geography.districts[c.parent].title,c.parent);
if(c.scene==='town'){
 body.append(element('h3','Honeybrook districts'));
 for(const [key,d]of Object.entries(geography.districts)){const route=geography.path('ts',key).map(k=>geography.districts[k].name).join(' → ');const a=element('a',d.title);a.href='../../index.html#district='+key;a.dataset.districtRoute=key;a.title='Walking route: '+route;body.append(a);}
 body.append(element('h3','Town places'));
 for(const key of ['village','den','hive','rest','welcome','school','bridge','bakery','pond','garden','history','woods-boundary'])open(geography.places[key].name,key);
 open('Old creek road, across the bridge → Bear Hollow','hollow');
}
if(c.key==='woods-boundary'&&c.woodsOpen)open('Follow the unlocked story trail → Storybook Lane','storybook-lane');
if(c.key==='hollow'){
 body.append(element('h3','Bear Hollow · connected places'));
 for(const key of ['hollow-cottage','hollow-cabins','hollow-work'])open(geography.places[key].name,key);
 for(const sp of c.spots){const b=element('button',sp.label);b.type='button';b.dataset.hollowSpot=sp.id;b.onclick=()=>{api.spot(sp.id);drawer.open=false;};body.append(b);}
 const bridge=element('a','Cross the footbridge → Old Bridge, Bridgeview');bridge.href='../../index.html#visit='+encodeURIComponent('Old Bridge');body.append(bridge);
 district('Follow the creek road → Honeybrook Outskirts','os');
}
if(c.scene==='town'||c.key==='hollow'){
 body.append(element('h3','Route guide'));body.append(element('p','Town Square → Main Street → Bridgeview → Old Bridge → Bear Hollow. The outskirts road leads to the Northern Edge; the public trail continues to the Northern Woods. Return by the same connected paths.'));
}
if(c.scene==='town'){
 const fair=element('a','Town Square gate → Fairgrounds (separate portal)');fair.href='?portal=fair&return=ts';fair.className='connected-fair-gate';body.append(fair);
}
drawer.open=wasOpen;document.title=c.name+' · Honeybrook town';const back=document.querySelector('.town-return-portal');if(back&&new URLSearchParams(location.search).get('city')==='1'){back.textContent='← Whole Honeybrook City Map';back.href=map.href;}else if(back){const parent=c.parent==='hollow'?'bv':c.parent;back.textContent='← Exit to '+(geography.districts[parent]?.name||'Honeybrook districts');back.href='../../index.html#district='+parent;}
}
if(new URLSearchParams(location.search).get('city')==='1'){addEventListener('DOMContentLoaded',()=>{if(window.HoneybrookTownNavigation?.isTown&&!document.querySelector('#continue-box')?.hidden)document.querySelector('#btn-continue')?.click();});}
addEventListener('honeybrook-scene-change',refresh);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh);else refresh();
})();
