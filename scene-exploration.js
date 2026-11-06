/* Travel through the actual photographed scenes using their existing routes. No save writes. */
(()=>{'use strict';
const rootURL=new URL('.',document.currentScript.src),url=p=>{const u=new URL(p,rootURL);if(u.pathname===location.pathname)u.search=location.search;return u.href;};
const normalize=s=>String(s||'').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]/g,'');
function routes(host){
 const out=[],add=(label,href)=>{if(href&&!out.some(x=>x.href===href))out.push({label,href});};
 if(host.classList.contains('visit-room')){
  const name=document.querySelector('#destinationVisit h1')?.textContent;
  const building=window.HoneybrookInteriorData?.buildings.find(b=>normalize(b.name)===normalize(name)||new URL(b.route,rootURL).hash==='#visit='+encodeURIComponent(name));
  if(building)add('Front door → '+building.rooms.find(r=>r.entrance)?.name,'interiors.html?building='+encodeURIComponent(building.id));
  const G=window.HoneybrookRoutes,key=G?.venues[name],node=G?.nodes[key];
  const list=node?.locations||[];const at=list.indexOf(name);
  if(at>=0&&list.length>1)for(const i of[(at-1+list.length)%list.length,(at+1)%list.length])add('Path → '+list[i],'index.html#visit='+encodeURIComponent(list[i]));
  if(node)add('Return path → '+node.name,'index.html#district='+key);
 }else{
  const D=window.StorywoodData;if(!D)return out;
  const q=new URLSearchParams(location.hash.slice(1)),wood=D.woods.find(w=>w.id===q.get('wood')),tale=D.tales.find(t=>t.id===q.get('tale')),elder=D.elders.find(e=>e.id===q.get('elder'));
  if(elder){add('Front door → Bear Hollow','games/honeybrook-craft-fair/?portal=town&place=hollow');add('Forest path → Northern Woods','storywood.html#region=woods');}
  else if(tale){add('Front door → Storybook Lane','storywood.html#region=lane');add('Follow the sketch → '+D.woods.find(w=>w.id===tale.forest)?.name,'storywood.html#region=woods&wood='+tale.forest+'&search='+tale.id);}
  else if(wood){
   const paths={gate:['roots','stream','rise'],roots:['gate','arch'],stream:['gate','ferns'],arch:['roots','clearing'],ferns:['stream','clearing'],clearing:['arch','ferns','circle'],circle:['clearing','rise'],rise:['circle','gate']};
   for(const id of paths[wood.id]||[])add('Trail → '+D.woods.find(w=>w.id===id)?.name,'storywood.html#region=woods&wood='+id);
   const account=D.tales.find(t=>t.id===q.get('search'))||D.tales.find(t=>t.forest===wood.id);
   if(account)add('Investigate → '+account.name+'’s resting account','storywood.html#region=woods&wood='+wood.id+'&search='+account.id);
   if(wood.id==='gate')add('Village gate → Storybook Lane','storywood.html#region=lane');
  }else if(q.get('region')==='woods'){
   for(const id of['gate','roots','stream'])add('Walk to '+D.woods.find(w=>w.id===id)?.name,'storywood.html#region=woods&wood='+id);
   add('Return gate → Storybook Lane','storywood.html#region=lane');
  }else{
   for(const t of D.tales.slice(0,2))add('Door → '+t.place,'storywood.html#tale='+t.id);
   add('Forest gate → Northern Woods','storywood.html#region=woods&wood=gate');
   add('Creek path → Bear Hollow','games/honeybrook-craft-fair/?portal=town&place=hollow');
  }
 }
 return out;
}
const mounted=new WeakMap();
function mount(host){
 const picture=host.querySelector('.visit-room-photo,.heroImage');if(!picture||mounted.get(host)===picture)return;
 const links=routes(host);if(!links.length)return;
 host.querySelectorAll('.scene-explore-tools,.scene-paths').forEach(n=>n.remove());if(host.nextElementSibling?.classList.contains('scene-explore-hint'))host.nextElementSibling.remove();mounted.set(host,picture);host.classList.add('scene-explorable');
 if(!picture.parentElement.classList.contains('scene-photo-window')){const windowFrame=document.createElement('div');windowFrame.className='scene-photo-window';picture.before(windowFrame);windowFrame.append(picture);}
 const controls=document.createElement('div');controls.className='scene-explore-tools';controls.setAttribute('aria-label','Look around this scene');
 let zoom=1,x=0,y=0,drag=null;
 function paint(){picture.style.transformOrigin='center';picture.style.transform='translate('+x+'px,'+y+'px) scale('+zoom+')';}
 for(const [label,fn] of [['+ Closer',()=>{zoom=Math.min(2.5,zoom+.25);paint();}],['− Wider',()=>{zoom=Math.max(1,zoom-.25);if(zoom===1)x=y=0;paint();}],['Reset view',()=>{zoom=1;x=y=0;paint();}]]){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=fn;controls.append(b);}
 host.append(controls);
 const nav=document.createElement('nav');nav.className='scene-paths';nav.setAttribute('aria-label','Walk through this scene');
 links.slice(0,5).forEach((r,i)=>{const a=document.createElement('a');a.href=url(r.href);a.className='scene-path';a.setAttribute('aria-label',r.label);a.style.setProperty('--path-x',[9,72,38,5,68][i]+'%');a.style.setProperty('--path-y',[63,63,77,38,38][i]+'%');const mark=document.createElement('span');mark.textContent='Go';const label=document.createElement('span');label.className='scene-path-label';label.textContent=r.label;a.append(mark,label);if(r.label.startsWith('Investigate'))a.addEventListener('click',()=>{const focusWork=()=>requestAnimationFrame(()=>{const work=document.getElementById('digWorkspace');if(work){work.tabIndex=-1;work.focus({preventScroll:true});work.scrollIntoView({block:'center'});}});if(a.href===location.href)focusWork();else addEventListener('hashchange',focusWork,{once:true});});nav.append(a);});host.append(nav);
 const tip=document.createElement('p');tip.className='scene-explore-hint';tip.textContent='Follow a path marker to walk into the next scene. Drag the photograph to look around after zooming.';host.after(tip);
 picture.style.touchAction='pan-y';picture.addEventListener('pointerdown',e=>{if(zoom<=1)return;drag={x:e.clientX-x,y:e.clientY-y};picture.setPointerCapture(e.pointerId);});picture.addEventListener('pointermove',e=>{if(!drag)return;const limit=host.clientWidth*(zoom-1)/2;x=Math.max(-limit,Math.min(limit,e.clientX-drag.x));y=Math.max(-100,Math.min(100,e.clientY-drag.y));paint();});picture.addEventListener('pointerup',()=>drag=null);picture.addEventListener('pointercancel',()=>drag=null);
}
let queued=false;function update(){queued=false;document.querySelectorAll('#destinationVisit:not([hidden]) .visit-room,#world>.hero').forEach(mount);}
new MutationObserver(()=>{if(!queued){queued=true;requestAnimationFrame(update);}}).observe(document.body,{childList:true,subtree:true});update();
})();
