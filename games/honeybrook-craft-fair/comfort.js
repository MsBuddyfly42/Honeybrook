(() => {
 const stage=document.getElementById('stage');
 for(const id of ['scene-title','modal','hud','hud-toggle','toast','recipe-card','bake-controls']){const element=document.getElementById(id);if(element)document.body.appendChild(element);}
 const modal=document.getElementById('modal');const card=modal.querySelector('.modal-card');card.setAttribute('role','dialog');card.setAttribute('aria-modal','true');card.setAttribute('aria-label','Honeybrook Fair');
 document.addEventListener('keydown',event=>{if(modal.hidden||event.key!=='Tab')return;const items=[...card.querySelectorAll('button,input,select,textarea,a[href]')].filter(e=>!e.disabled&&e.getClientRects().length);if(!items.length)return;if(event.shiftKey&&document.activeElement===items[0]){event.preventDefault();items.at(-1).focus();}else if(!event.shiftKey&&document.activeElement===items.at(-1)){event.preventDefault();items[0].focus();}});
 const places=document.createElement('nav');places.className='fair-accessible-places';places.setAttribute('aria-label','Fair places');for(const button of document.querySelectorAll('#scene-village .spot')){const item=document.createElement('button');item.type='button';item.textContent=button.textContent;item.onclick=()=>button.click();places.appendChild(item);}document.body.appendChild(places);
 const townButton=document.createElement('a');townButton.className='fair-return-town';townButton.href='../../';townButton.textContent='← Honeybrook town';document.body.appendChild(townButton);
 function update(){const active=stage.querySelector('.scene.active');for(const id of ['recipe-card','bake-controls'])document.getElementById(id).hidden=active?.id!=='scene-bakery';places.hidden=active?.id!=='scene-village';document.getElementById('hud-toggle').hidden=!document.getElementById('scene-title').classList.contains('active')?false:true;}
 new MutationObserver(update).observe(stage,{subtree:true,attributes:true,attributeFilter:['class']});update();
})();
