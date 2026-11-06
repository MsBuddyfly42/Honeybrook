/* Shared direct entrances. Resolving a doorway never reads or changes a save. */
(()=>{'use strict';const base=new URL('.',document.currentScript.src),D=window.StorywoodData;if(!D)return;
const hollow=new URL('games/honeybrook-craft-fair/?portal=town&place=hollow#place=hollow&view=outside',base).href;
const elderHref=id=>hollow.split('#')[0]+'#place=hollow-'+encodeURIComponent(id)+'&view=inside';
const make=(id,name,hash,parent)=>({id:'storywood:'+id,name,href:hash.startsWith('elder=')?elderHref(decodeURIComponent(hash.slice(6))):new URL('storywood.html#'+hash,base).href,parent,kind:'storywood'});
const entries=[...D.tales.map(t=>make(t.id,t.place+' · '+t.name,'tale='+encodeURIComponent(t.id),'nw')),...D.woods.map(w=>make(w.id,w.name,'region=woods&wood='+encodeURIComponent(w.id),'nw')),...D.elders.map(e=>make(e.id,e.place+' · '+e.name,'elder='+encodeURIComponent(e.id),'hollow'))];
const normalize=x=>String(x||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const aliases=new Map([['Storybook Lane','region=lane'],['Northern Woods','region=woods'],['The Northern Woods','region=woods'],['Northern Woods boundary','region=woods'],['Bear Hollow memories','region=hollow']].map(([name,hash])=>[normalize(name),new URL('storywood.html#'+hash,base).href]));
for(const t of [...D.tales,...D.elders])for(const name of[t.name,t.place])aliases.set(normalize(name),D.tales.includes(t)?new URL('storywood.html#tale='+encodeURIComponent(t.id),base).href:elderHref(t.id));
function resolve(name){if(['bear hollow','bear hollow memories'].includes(normalize(name)))return hollow;return aliases.get(normalize(name));}
function route(href,name){const named=resolve(name);if(named)return named;try{const u=new URL(href,base);if(u.origin!==base.origin)return href;if(u.pathname.includes('/honeybrook-craft-fair/')&&u.searchParams.get('portal')==='town'){const p=u.searchParams.get('place');if(p==='hollow'||p==='bear-hollow'){const h=new URLSearchParams(u.hash.slice(1)),child=h.get('place');return child&&child.startsWith('hollow-')?hollow.split('#')[0]+'#'+h:hollow;}if(['storybook-lane','woods-boundary'].includes(p))return new URL('storywood.html#region='+(p==='storybook-lane'?'lane':'woods'),base).href;u.searchParams.set('city','1');return u.href;}}catch{}return href;}
window.HoneybrookStorywoodRoutes={entries,resolve,route,hollow,elderHref};
addEventListener('click',e=>{const a=e.target.closest?.('a[href]');if(!a)return;const next=route(a.href);if(next!==a.href)a.href=next;},true);
addEventListener('honeybrook-enter-place',e=>{const href=resolve(e.detail?.name);if(href){e.preventDefault();e.stopImmediatePropagation();location.assign(href);}},true);
const canonical=route(location.href);if(canonical!==location.href&&location.pathname.includes('/honeybrook-craft-fair/')&&['hollow','bear-hollow'].includes(new URLSearchParams(location.search).get('place'))){location.replace(canonical);}
// Old bookmarks and directory links must enter the new place, not the legacy start screen.
const q=new URLSearchParams(location.search);if(location.pathname.includes('/honeybrook-craft-fair/')&&q.get('portal')==='town'&&['storybook-lane','woods-boundary'].includes(q.get('place'))){location.replace(new URL('storywood.html#region='+(q.get('place')==='storybook-lane'?'lane':'woods'),base));}
})();

