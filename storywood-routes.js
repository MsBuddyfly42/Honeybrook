/* Shared direct entrances. Resolving a doorway never reads or changes a save. */
(()=>{'use strict';const base=new URL('.',document.currentScript.src),D=window.StorywoodData;if(!D)return;
const make=(id,name,hash,parent)=>({id:'storywood:'+id,name,href:new URL('storywood.html#'+hash,base).href,parent,kind:'storywood'});
const entries=[...D.tales.map(t=>make(t.id,t.place+' · '+t.name,'tale='+encodeURIComponent(t.id),'nw')),...D.woods.map(w=>make(w.id,w.name,'region=woods&wood='+encodeURIComponent(w.id),'nw')),...D.elders.map(e=>make(e.id,e.place+' · '+e.name,'elder='+encodeURIComponent(e.id),'hollow'))];
const normalize=x=>String(x||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const aliases=new Map([['Storybook Lane','region=lane'],['Northern Woods','region=woods'],['The Northern Woods','region=woods'],['Northern Woods boundary','region=woods'],['Bear Hollow memories','region=hollow']].map(([name,hash])=>[normalize(name),new URL('storywood.html#'+hash,base).href]));
for(const t of [...D.tales,...D.elders])for(const name of[t.name,t.place])aliases.set(normalize(name),new URL('storywood.html#'+(D.tales.includes(t)?'tale=':'elder=')+encodeURIComponent(t.id),base).href);
function resolve(name){return aliases.get(normalize(name));}
function route(href,name){const named=resolve(name);if(named)return named;try{const u=new URL(href,base);if(u.origin!==base.origin)return href;if(u.pathname.includes('/honeybrook-craft-fair/')&&u.searchParams.get('portal')==='town'){const p=u.searchParams.get('place');if(['storybook-lane','woods-boundary'].includes(p))return new URL('storywood.html#region='+(p==='storybook-lane'?'lane':'woods'),base).href;u.searchParams.set('city','1');return u.href;}}catch{}return href;}
window.HoneybrookStorywoodRoutes={entries,resolve,route};
addEventListener('honeybrook-enter-place',e=>{const href=resolve(e.detail?.name);if(href){e.preventDefault();e.stopImmediatePropagation();location.assign(href);}},true);
// Old bookmarks and directory links must enter the new place, not the legacy start screen.
const q=new URLSearchParams(location.search);if(location.pathname.includes('/honeybrook-craft-fair/')&&q.get('portal')==='town'&&['storybook-lane','woods-boundary'].includes(q.get('place'))){location.replace(new URL('storywood.html#region='+(q.get('place')==='storybook-lane'?'lane':'woods'),base));}
})();
