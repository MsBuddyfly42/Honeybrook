/* Photography presentation for Enter Honeybrook only. No game-state writes. */
(() => {
  'use strict';
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const aliases={'The Welcome House':'Welcome House','Amelia & Tom’s Creek Bridge':'Welcome Bridge','The Neighbors’ Homes':'Hearthwell Home','Wally’s Bakery':"Wally's Bakery",'Town Square & Honeybrook Fair':'Enter Honeybrook town','Town Square':'Enter Honeybrook town','The Road to Bear Hollow':'Old Northern Road'};
  const houses=['Hearthwell Home',"Big Mama's Cottage",'Country Homes','Goodberry Outreach House','Welcome House'];
  const choices={light:['auto','day','sunset','night'],season:['auto','spring','summer','autumn','winter'],weather:['clear','rain','sleet','snow','thunderstorm','blizzard','tornado']};
  let appearance={light:'auto',season:'auto',weather:'clear'};
  try{const saved=JSON.parse(localStorage.getItem('honeybrook_scene_appearance_v1')||'{}');for(const key of Object.keys(choices))if(choices[key].includes(saved[key]))appearance[key]=saved[key];}catch{}
  function applyAppearance(){
    const now=new Date(),parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',month:'numeric',hour:'numeric',hourCycle:'h23'}).formatToParts(now),month=Number(parts.find(p=>p.type==='month').value),hour=Number(parts.find(p=>p.type==='hour').value);
    const light=appearance.light==='auto'?(hour<6||hour>=21?'night':hour>=17?'sunset':'day'):appearance.light;
    const season=appearance.season==='auto'?['winter','spring','summer','autumn'][Math.floor((month%12)/3)]:appearance.season;
    for(const scene of document.querySelectorAll('#hbPlayableWorld .hb-world-art,#destinationVisit .visit-room')){scene.dataset.sceneLight=light;scene.dataset.sceneSeason=season;scene.dataset.sceneWeather=appearance.weather;}
    for(const select of document.querySelectorAll('[data-scene-appearance]'))select.value=appearance[select.dataset.sceneAppearance];
  }
  function appearanceControls(){const box=document.createElement('details');box.className='scene-appearance';box.innerHTML='<summary>Scenery, seasons & lighting</summary><p>Preview the scenery without advancing your day. Weather previews apply outdoors; these are not live forecasts.</p><div>'+Object.entries(choices).map(([key,values])=>'<label>'+({light:'Lighting',season:'Season',weather:'Weather'})[key]+'<select data-scene-appearance="'+key+'">'+values.map(value=>'<option value="'+value+'">'+({auto:'Follow the real calendar / clock',day:'Daylight',sunset:'Sunset',night:'Night',spring:'Spring',summer:'Summer',autumn:'Autumn',winter:'Winter',clear:'Clear',rain:'Rain',sleet:'Sleet',snow:'Snow',thunderstorm:'Thunderstorm',blizzard:'Blizzard',tornado:'Tornado practice scenery'})[value]+'</option>').join('')+'</select></label>').join('')+'</div>';return box;}
  document.addEventListener('change',event=>{const key=event.target.dataset.sceneAppearance;if(!choices[key]?.includes(event.target.value))return;appearance[key]=event.target.value;try{localStorage.setItem('honeybrook_scene_appearance_v1',JSON.stringify(appearance));}catch{}applyAppearance();});
  function record(name,area){
    name=aliases[name]||name;
    const catalog=window.HoneybrookPhotoCatalog||{};
    if(!area&&houses.includes(name)){try{area=JSON.parse(localStorage.getItem('honeybrook_lantern_trail_v1')||'{}').rooms?.[name]?.area||'porch';}catch{area='porch';}}
    return catalog[area?name+' '+area:name]||catalog[name];
  }
  function imageMarkup(p,alt,cls=''){if(!p)return '';const style=Number.isInteger(p.tile)?'position:absolute;width:200%;height:200%;max-width:none;left:'+(-(p.tile%2)*100)+'%;top:'+(-Math.floor(p.tile/2)*100)+'%;':'';return '<div class="fair-scene-frame"><img class="'+esc(cls)+'" src="'+esc(p.src)+'" width="1536" height="1024" alt="'+esc(alt)+'" style="'+style+'"></div>';}
  function path(name,area){return record(name,area)?.src;}
  function clock(){const now=new Date(),date=new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',dateStyle:'full'}).format(now),time=new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',hour:'numeric',minute:'2-digit'}).format(now);return date+' · '+time+' Central';}
  function tileImage(image,p){if(!image||!p)return;const tiled=Number.isInteger(p.tile);for(const key of ['position','width','height','left','top'])image.style[key]='';if(tiled){image.style.position='absolute';image.style.width='200%';image.style.height='200%';image.style.left=-(p.tile%2)*100+'%';image.style.top=-Math.floor(p.tile/2)*100+'%';}image.dataset.sceneTile=tiled?String(p.tile):'';}
  function background(panel,p){panel.style.backgroundImage='url("'+p.src+'")';panel.style.backgroundSize=Number.isInteger(p.tile)?'200% 200%':'cover';panel.style.backgroundPosition=Number.isInteger(p.tile)?(p.tile%2)*100+'% '+Math.floor(p.tile/2)*100+'%':'center';}
  function presentation(root,name,area){
    const p=record(name,area),room=root.querySelector('.visit-room'),image=root.querySelector('.visit-room-photo');
    if(!p||!room||!image)return;tileImage(image,p);
    image.alt='Honeybrook setting for '+name+(area?' · '+area:'');
    room.dataset.photoScene=name;room.dataset.sceneArea=area||'';room.dataset.sceneInterior=String(p.interior===true);
    room.style.setProperty('--scene-photo','url("'+p.src+'")');
    root.style.setProperty('--scene-photo','url("'+p.src+'")');root.style.setProperty('--scene-photo-size',Number.isInteger(p.tile)?'200% 200%':'cover');root.style.setProperty('--scene-photo-position',Number.isInteger(p.tile)?(p.tile%2)*100+'% '+Math.floor(p.tile/2)*100+'%':'center');
    if(!room.querySelector('.scene-weather')){const weather=document.createElement('div');weather.className='scene-weather';weather.setAttribute('aria-hidden','true');room.append(weather);}
    if(!root.querySelector('.scene-appearance'))root.querySelector('.visit-heading')?.append(appearanceControls());
    applyAppearance();
    const visitor=root.querySelector('.visit-bear');
    let visitorCard=root.querySelector('.scene-visitor');
    if(visitor&&!visitorCard){visitorCard=document.createElement('div');visitorCard.className='scene-visitor';const label=document.createElement('span');visitorCard.append(visitor,label);room.after(visitorCard);}
    if(visitorCard)visitorCard.querySelector('span').textContent='You are here · '+name+(area?' · '+area:'');
    let credit=root.querySelector('.scene-photo-credit');
    if(!credit){credit=document.createElement('p');credit.className='scene-photo-credit';room.after(credit);}
    credit.innerHTML='Photographic scene · <a href="'+esc(p.page)+'" target="_blank" rel="noopener noreferrer">'+esc(p.artist||'Wikimedia Commons contributor')+'</a> · <a href="'+esc(p.licenseUrl||p.page)+'" target="_blank" rel="noopener noreferrer">'+esc(p.license)+'</a>';
    let date=root.querySelector('.scene-real-clock');
    if(!date){date=document.createElement('p');date.className='scene-real-clock';root.querySelector('.visit-heading')?.append(date);}
    date.textContent=clock();
  }
  function replace(image,name,area){const src=path(name,area);if(!image||!src)return false;if(image.getAttribute('src')!==src)image.src=src;const root=image.closest('#destinationVisit');if(root)presentation(root,name,area);return true;}
  function activity(stage,kind,state){
    const panel=stage.querySelector('.living-action-room');if(!panel)return;
    let key;
    if(kind==='bake')key={measure:'Activity · Measure baking ingredients',mix:'Activity · Mix dough',oven:'Activity · Oven baking',done:'Activity · Finished baking'}[state.phase];
    if(kind==='garden')key=Date.now()<(state.wateringUntil||0)?'Activity · Watering':state.harvest?'Activity · Harvest':'Activity · Seedlings';
    const p=key?record(key):null;if(!p)return;
    background(panel,p);panel.dataset.photographic='true';
    let credit=stage.querySelector('.scene-activity-credit');if(!credit){credit=document.createElement('p');credit.className='scene-activity-credit scene-photo-credit';stage.append(credit);}
    credit.innerHTML='Activity scenery: <a href="'+esc(p.page)+'" target="_blank" rel="noopener noreferrer">'+esc(p.artist||'Wikimedia Commons contributor')+'</a> · '+esc(p.license);
  }
  window.HoneybrookPhotos={record,path,presentation,replace,activity,tileImage,imageMarkup};
  document.addEventListener('DOMContentLoaded',()=>{
    const world=document.getElementById('hbPlayableWorld'),art=world?.querySelector('.hb-world-art');if(!world||!art)return;
    const wayfinding=document.createElement('nav');wayfinding.className='hb-photo-wayfinding';wayfinding.setAttribute('aria-label','Paths from Honeybrook town square');
    const markers=art.querySelector('.hb-world-markers');if(markers){markers.querySelectorAll('.hb-world-marker').forEach((button,i)=>{button.dataset.photoX=String(.55+i*.06);button.dataset.photoY='.82';});wayfinding.append(markers);}
    const heading=document.createElement('div');heading.className='hb-photo-heading';
    for(const selector of ['.hb-world-sign','.hb-world-date']){const node=art.querySelector(selector);if(node)heading.append(node);}
    world.insertBefore(heading,art);art.after(wayfinding);art.querySelector('.hb-world-map-button')?.remove();art.dataset.photographic='true';
    const photo=record('Enter Honeybrook town');if(photo){const image=art.querySelector(':scope>img');image.src=photo.src;tileImage(image,photo);const credit=document.createElement('p');credit.className='scene-photo-credit';credit.innerHTML='Town-square scenery: <a href="'+esc(photo.page)+'" target="_blank" rel="noopener noreferrer">'+esc(photo.artist||'Wikimedia Commons contributor')+'</a> · '+esc(photo.license)+' · <a href="assets/scene-photos/credits.html">All scene photo credits</a>';art.after(credit);}
    const date=heading.querySelector('.hb-world-date');if(date){const now=document.createElement('time');now.className='scene-real-clock';now.textContent=clock();date.append(now);}
    const weather=document.createElement('div');weather.className='scene-weather';weather.setAttribute('aria-hidden','true');art.append(weather);world.insertBefore(appearanceControls(),art);applyAppearance();
  });
  setInterval(()=>{for(const date of document.querySelectorAll('#destinationVisit:not([hidden]) .scene-real-clock,#hbPlayableWorld .scene-real-clock'))date.textContent=clock();applyAppearance();},60000);
})();
