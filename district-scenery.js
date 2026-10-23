/* Fair-style district maps; existing destination buttons retain their handlers. */
(()=>{'use strict';
const districts={nw:'woods',ne:'edge',se:'entrance',fr:'reflection',os:'outskirts',pk:'park',ep:'entertainment',cc:'care',hh:'harmony',ts:'square',sq:'scholars',ms:'mainstreet',bv:'bridgeview',town:'overview'};
const points={woods:[[55,31],[19,30],[78,65],[86,83],[46,73],[88,23]],edge:[[22,25],[50,29],[83,30],[15,59],[49,59],[80,80]],entrance:[[17,25],[48,26],[85,28],[20,72],[64,76],[86,81]],reflection:[[16,24],[51,32],[85,28],[17,65],[53,76],[86,56]],outskirts:[[15,23],[49,26],[86,24],[18,57],[52,61],[86,76]]};
function mount(){for(const [key,art] of Object.entries(districts)){
 const scene=document.querySelector(key==='bv'?'.bridgeview-scene':'.'+key+'-scene');if(!scene||scene.dataset.fairScene)continue;
 scene.dataset.fairScene=art;scene.classList.add('fair-district-scene');
 const image=document.createElement('img');image.className='fair-district-art';image.src=art==='overview'?'games/honeybrook-craft-fair/img/honeybrook-town-map.jpg':'assets/district-scenes/'+art+'.webp';image.width=1536;image.height=1024;image.alt=scene.closest('section').querySelector('h2')?.textContent+' · Honeybrook Fair-style scenery';scene.prepend(image);
 const buttons=[...scene.querySelectorAll(':scope>button')];
 const routes=document.createElement('nav');routes.className='fair-district-routes';routes.setAttribute('aria-label','Places in '+scene.closest('section').querySelector('h2').textContent);
 buttons.forEach((button,i)=>{const columns=3,rows=Math.ceil(buttons.length/columns);const point=art==='overview'?[12+(i%4)*25,20+Math.floor(i/4)*24]:points[art]?.[i]||[16.7+(i%columns)*33.3,rows===3?24+Math.floor(i/columns)*28:28+Math.floor(i/columns)*42];button.style.setProperty('--door-x',point[0]+'%');button.style.setProperty('--door-y',point[1]+'%');button.classList.add('fair-district-door');const title=button.querySelector('b')?.textContent||button.textContent;button.setAttribute('aria-label','Enter '+title);button.title=title;
 const route=document.createElement('button');route.type='button';route.textContent=title;route.onclick=()=>button.click();routes.append(route);
 });
 scene.after(routes);
}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
