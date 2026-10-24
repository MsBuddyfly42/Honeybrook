/* An explicitly begun journey stays in its authored story routes. No old gameplay save is reset. */
(()=>{'use strict';const KEY='honeybrook_story_mode_v1',base=new URL('.',document.currentScript.src),url=name=>new URL(name,base),read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null');}catch{return null;}},active=()=>localStorage.getItem(KEY)!==null;
// A new tab starts at the Welcome House; refresh and travel keep their current route.
const entrance=url('index.html');
let newTab=false;try{newTab=sessionStorage.getItem('honeybrook_tab_open_v1')!=='open';sessionStorage.setItem('honeybrook_tab_open_v1','open');}catch{}
if(newTab){
 if('scrollRestoration'in history)history.scrollRestoration='manual';
 if(location.pathname!==entrance.pathname&&location.pathname!==base.pathname){document.documentElement.style.visibility='hidden';location.replace(entrance.href);return;}
 history.replaceState(null,'',entrance.pathname);scrollTo(0,0);
}
// Refresh visits Welcome House; reopening a tab starts at the front page.
else if(performance.getEntriesByType('navigation')[0]?.type==='reload'){
 if('scrollRestoration'in history)history.scrollRestoration='manual';
 const welcome=new URL('index.html#visit=Welcome%20House',base);
 if(location.pathname!==welcome.pathname){document.documentElement.style.visibility='hidden';location.replace(welcome.href);return;}
 history.replaceState(null,'',welcome.href);scrollTo(0,0);
 addEventListener('pageshow',()=>{scrollTo(0,0);},{once:true});
}
function atEntrance(u){return u.pathname===entrance.pathname&&!u.search&&!u.hash||u.pathname===base.pathname&&!u.search&&!u.hash;}
function startedOpening(){return read('honeybrook_journey_opening_v1')?.scene>=8||(read('honeybrook_nell_v1')?.journal?.length||0)>0;}
function emergency(){return ['alert','sheltering'].includes(read('honeybrook_community_refuge_v1')?.phase);}
function allowed(target){let u;try{u=new URL(target,location.href);}catch{return false;}if(u.origin!==base.origin)return false;if(atEntrance(u)||u.pathname===entrance.pathname&&!u.search&&u.hash==='#visit=Welcome%20House')return true;const path=u.pathname.slice(base.pathname.length);if(path==='journey.html')return true;if(path==='interiors.html'){const n=read('honeybrook_nell_v1');return !!read('honeybrook_community_life_v1')?.stayed&&!!n?.letterOpened&&(n.chapter>3||n.chapter===3&&n.step>=3);}if(path==='nell.html')return startedOpening();if(path==='nell-research.html')return startedOpening()&&(read('honeybrook_nell_v1')?.chapter||0)>=1;if(path==='refuge.html')return emergency();return false;}
function enforce(){if(active()&&!allowed(location.href)){location.replace(url('journey.html').href);return false;}return true;}
function start(){if(!active())localStorage.setItem(KEY,JSON.stringify({version:1,active:true}));refresh();}
function refresh(){if(!active()||!enforce()||!document.body)return;document.documentElement.classList.add('hb-story-mode');let bar=document.getElementById('storyModeBar');if(!bar){bar=document.createElement('aside');bar.id='storyModeBar';bar.setAttribute('aria-label','Journey mode');bar.innerHTML='<strong>Nell’s journey · story mode</strong><span>Your place is saved. Close the game to pause; return to continue the same story.</span><a href="'+url('journey.html').href+'">Continue my episode</a>';document.body.prepend(bar);}for(const a of document.querySelectorAll('a[href]')){if(a.matches('.community-brand')&&a.href!==url('journey.html').href)a.href=url('journey.html').href;if(a.download||a.href.startsWith('blob:'))continue;const hide=!allowed(a.href);if(a.hasAttribute('data-story-blocked')!==hide)a.toggleAttribute('data-story-blocked',hide);}}
window.HoneybrookStoryMode={active,allowed,start};const style=document.createElement('style');style.textContent='.hb-story-mode [data-story-blocked]{display:none!important}#storyModeBar{position:sticky;top:var(--storm-height,0px);z-index:90;display:flex;flex-wrap:wrap;align-items:center;gap:.5rem 1rem;padding:.8rem 1rem;background:#f6efd9;color:#2e4434;border-bottom:2px solid #627557;font:15px/1.5 Georgia,serif}#storyModeBar span{flex:1 1 280px}#storyModeBar a{color:#294530;padding:.5rem;border:1px solid #74836b;border-radius:8px}.hb-story-mode .journey-status{position:static}.hb-story-mode body.visit-open>#storyModeBar{display:flex!important}.hb-story-mode #destinationVisit header{position:static}.hb-story-mode #destinationVisit .visit-workspace,.hb-story-mode #destinationVisit .visit-neighbors,.hb-story-mode #destinationVisit .visit-find,.hb-story-mode #destinationVisit .world-location-routes,.hb-story-mode #destinationVisit header button,.hb-story-mode #honeybrookHome [data-frontgo],.hb-story-mode .hb-sticky-nav{display:none!important}.hb-story-mode #destinationVisit .honeybrook-sound button{display:inline-block!important}@media(max-width:600px){#storyModeBar span{display:none}#storyModeBar strong{flex:1 1 100%}}';document.head.append(style);
if(!enforce())return;
document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!active()||!a||a.download||a.href.startsWith('blob:'))return;if(!allowed(a.href)){e.preventDefault();e.stopImmediatePropagation();location.assign(url('journey.html').href);}},true);
addEventListener('storage',e=>{if(e.key===KEY||e.key==='honeybrook_journey_opening_v1'||e.key==='honeybrook_nell_v1')refresh();});addEventListener('pageshow',refresh);addEventListener('popstate',refresh);addEventListener('honeybrook-refuge-change',refresh);
function mount(){refresh();new MutationObserver(()=>{if(active())refresh();}).observe(document.body,{childList:true,subtree:true});}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();})();
