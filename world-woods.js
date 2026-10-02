/* Walkable Northern Woods extends the existing Northern Edge, with evidence kept uncertain. */
(()=>{'use strict';
const world=document.querySelector('#playableWorld'),key='hb_northern_paths_v1';
const names={pond:'Singing Pond',ruins:'Old Creek Ruins',lookout:'Mistwood Lookout'};
const routes={pond:[['Northern Edge',null],['Old Creek Ruins','ruins']],ruins:[['Singing Pond','pond'],['Mistwood Lookout','lookout'],['Northern Edge',null]],lookout:[['Old Creek Ruins','ruins'],['Northern Edge',null]]};
let memory;try{memory=JSON.parse(localStorage.getItem(key)||'{}')}catch{memory={}}if(!memory||typeof memory!=='object'||Array.isArray(memory))memory={};
memory.observations=Array.isArray(memory.observations)?memory.observations.filter(x=>typeof x==='string').slice(-30):[];
let zone=null,lastScene='',time=0,film=null,elapsed=0,lastLine=-1,lastTone=-1,fade=0,target=null,stoneRipples=0;
const panel=document.createElement('div');panel.className='hb-object-actions hb-woods-actions';panel.hidden=true;world.append(panel);
const choices=document.createElement('div');choices.className='hb-story-choices';choices.hidden=true;world.append(choices);
const back=document.createElement('button');back.id='hbLeaveWoods';back.textContent='Back to Northern Edge';back.hidden=true;world.querySelector('.pw-hud').append(back);back.onclick=()=>walkTo(null);
const scene=()=>world.querySelector('.pw-scene:not([hidden])')?.dataset.scene||'';
function save(){try{localStorage.setItem(key,JSON.stringify({...memory,zone,scene:scene()}))}catch{}}
function say(who,line){const d=world.querySelector('.pw-scene:not([hidden]) .pw-dialogue');if(!d)return;const b=document.createElement('b'),s=document.createElement('span');b.textContent=who;s.textContent=line;d.replaceChildren(b,s)}
function button(label,action,container=panel){const b=document.createElement('button');b.textContent=label;b.onclick=action;container.append(b)}
function stop(){film=null;elapsed=0;lastLine=-1;choices.hidden=true;panel.hidden=true;world.dataset.woodsMoment='wandering';world.querySelector('#hbStoryStop').hidden=true;}
function enter(next,restore=false,from=null){if(scene()!=='woodsedge'||next!==null&&!names[next])return false;window.HBStory?.stop();window.HBActivities?.stop();stop();zone=next;fade=0;target=null;world.dataset.woods=zone||'edge';back.hidden=!zone;world.querySelector('#pwLocation').textContent=names[zone]||'Northern Edge';world.querySelector('#pwHint').textContent=zone?'Follow a sign, listen, or simply stay. You can always return to town.':'The village paths are here whenever you want to return.';const p=restore?window.HBWorld?.position?.():null;window.HBWorld?.arrive(p?p.x:zone?(from==='lookout'||from==='ruins'&&next==='pond'?850:130):500,p?p.y:550);say(names[zone]||'Northern Edge',zone==='pond'?'The pond opens between the trees. Water moves, reeds sway, and Jonesha waits along the bank.':zone==='ruins'?'A weathered stone crossing spans the creek. Who built it, and when, remain unknown.':zone==='lookout'?'Trees part around a distant ridge. Mist carries shapes across it. Seeing a shape is not knowing what it is.':'You return to the maintained trail. Every curiosity can wait.');save();return true}
function go(next){if(fade>0)return;stop();target=next;fade=.65;window.HBWorld?.sound(140,.25)}
function walkTo(next){stop();const label='Follow trail to '+(names[next]||'Northern Edge');if(!window.HBWorld?.useObject?.(label))go(next)}
function record(note){if(!memory.observations.includes(note))memory.observations.push(note);memory.observations=memory.observations.slice(-30);window.HBWorld?.recordObservation(note);save();say('Field observation',note+' Confirmed conclusions: none.');}
const evidence={pond:'Three tones and expanding ripples observed at Singing Pond. No source was visible.',ruins:'Weathered masonry, a broken parapet and an arch-shaped carving observed beside the creek. Age, builder and meaning are unconfirmed.',lookout:'A roof-like silhouette and a brief warm glimmer observed through mist beyond the ridge. Its location, identity and cause are unconfirmed.'};
function observed(){if(memory[zone+'Watched'])return evidence[zone];return zone==='pond'?'Moving water, lily pads and reeds observed at Singing Pond. No unexplained sound has been observed on this visit.':zone==='ruins'?evidence.ruins:'Moving mist and a wooded ridge observed at Mistwood Lookout. No distant structure or light has been established.'}
function toss(){stoneRipples=4;window.HBWorld?.sound(230,.13);say('Singing Pond','A pebble skips once and sinks. THESE ripples came from your pebble. The earlier sound remains unexplained.');}
function sit(){panel.hidden=true;if(zone==='pond')window.HBWorld?.seat?.(325,490);else window.HBWorld?.sit();say(names[zone],'The woods continue around you. You can let every question wait.');}
function controls(){const wasOpen=!panel.hidden;window.HBStory?.stop();window.HBActivities?.stop();stop();if(wasOpen)return;panel.replaceChildren();panel.hidden=false;
 if(!zone){button('Follow the path to Singing Pond',()=>walkTo('pond'));button('Watch the Northern Edge moment',()=>{panel.hidden=true;window.HBStory?.start()});}
 else{for(const [label,next] of routes[zone])button('Walk to '+label,()=>walkTo(next));button('Watch this place unfold',watch);button('Record an observation',()=>{panel.hidden=true;record(observed())});if(zone==='pond'){button('Skip a little pebble',()=>{panel.hidden=true;if(!window.HBWorld?.useObject?.('Skip a pebble'))toss()});button('Sit on the bank',()=>{panel.hidden=true;if(!window.HBWorld?.useObject?.('Sit on the bank'))sit()});}else button('Listen without solving anything',()=>{panel.hidden=true;say(names[zone],'Wind passes through the branches. You do not have to draw a conclusion.');});}
 button('Keep wandering',()=>panel.hidden=true);
}
const films={
 pond:{duration:24,lines:[[1,'Singing Pond','Jonesha follows the bank as a reed bends over the water.'],[6,'Jonesha','Wait. Those notes again.'],[10,'Field observation','Three tones carry across the pond. Ripples expand; no source is visible.'],[16,'Jonesha','Water can tell us what moved. Sometimes it cannot tell us what moved it.'],[22,'Jonesha','We can listen without deciding.']]},
 ruins:{duration:22,lines:[[1,'Old Creek Ruins','A leaf slips under the old stone crossing.'],[6,'Jonesha','Look at that mark on the stone.'],[11,'Field observation','An arch-shaped carving is visible. Similarity to the library marking does not establish a connection.'],[17,'Jonesha','A resemblance is a good question. It is not an answer.'],[21,'Old Creek Ruins','The leaf emerges downstream. The creek keeps going.']]},
 lookout:{duration:25,lines:[[1,'Mistwood Lookout','Jonesha stops beside the ridge. The mist thins.'],[7,'Jonesha','Something over there…'],[12,'Field observation','A roof-like outline briefly appears beyond the trees.'],[17,'Field observation','A warm glimmer shows, then vanishes as the mist closes.'],[22,'Jonesha','We saw a shape and a light. We do not know who—or what—is there.'],[24,'Mistwood Lookout','The ridge returns to trees and moving mist.']]}
};
function watch(){if(!zone)return;window.HBStory?.stop();window.HBActivities?.stop();stop();film=zone;elapsed=0;lastTone=-1;world.dataset.woodsMoment='playing';world.querySelector('#hbStoryStop').hidden=false;}
function finish(){memory[film+'Watched']=true;save();world.dataset.woodsMoment='choice';choices.replaceChildren();button('Keep the observation',()=>{const note=evidence[zone];stop();record(note)},choices);button('Stay with Jonesha',()=>{stop();say('Jonesha','“No deadline on wonder. I like that about this place.”')},choices);button('Return to the maintained trail',()=>walkTo(null),choices);choices.hidden=false;}
function update(dt,next){time+=dt;stoneRipples=Math.max(0,stoneRipples-dt);if(next!==lastScene){lastScene=next;if(next!=='woodsedge'){stop();zone=null;fade=0;target=null;delete world.dataset.woods;back.hidden=true;save()}}if(fade>0){fade=Math.max(0,fade-dt);if(!fade){const next=target;enter(next,false,zone)}}if(!film||world.dataset.woodsMoment!=='playing')return;const story=films[film];elapsed=Math.min(story.duration,elapsed+dt);for(let i=0;i<story.lines.length;i++)if(elapsed>=story.lines[i][0]&&i>lastLine){lastLine=i;say(story.lines[i][1],story.lines[i][2])}if(film==='pond'&&elapsed>=8&&elapsed<11){const beat=Math.floor(elapsed-8);if(beat!==lastTone){lastTone=beat;window.HBWorld?.sound([330,392,440][beat],.85)}}if(elapsed>=story.duration)finish();}
function sky(a){const {c,rect,ellipse,line,tree,night}=a;const gradient=c.createLinearGradient(0,0,0,430);gradient.addColorStop(0,night?'#142c44':'#7ca9aa');gradient.addColorStop(1,night?'#334f4e':'#adc1a3');rect(0,0,1000,650,gradient);ellipse(755,78,night?29:36,night?29:36,night?'#e5e4bd':'#f1ddb0');for(let layer=0;layer<3;layer++){ellipse(460+layer*190,365-layer*34,720,146,night?['#2e514a','#2b4a42','#365344'][layer]:['#668971','#628268','#789575'][layer]);for(let i=0;i<8;i++)tree(i*160+layer*37,376-layer*35,.5+layer*.15,true)}rect(0,410,1000,240,night?'#3b5143':'#6d8256');ellipse(500,563,660,91,'#bba382');for(let i=0;i<40;i++){const x=(i*139)%1000,y=435+(i*53)%188;line(x,y,x+Math.sin(time+i)*3,y-9,'#7f966a',2)}
}
function ripple(a,x,y,r,alpha){a.c.save();a.c.strokeStyle=`rgba(223,239,207,${alpha})`;a.c.lineWidth=1.8;a.c.beginPath();a.c.ellipse(x,y,r,r*.23,0,0,Math.PI*2);a.c.stroke();a.c.restore()}
function stone(a,x,y,w,h){a.rect(x,y,w,h,'#8c9884',4);a.line(x+4,y+3,x+w-5,y+3,'#c0c6a0',2);a.line(x+w*.5,y+2,x+w*.42,y+h-2,'#63775b',1)}
function forestDetails(a){const {c,rect,ellipse,line,night}=a;
 for(let i=0;i<11;i++){const x=(i*117+23)%1000,y=466+(i%3)*9;ellipse(x,y+5,25,7,'#354d3828');for(let j=-2;j<=2;j++){const sway=Math.sin(time*.8+i)*3;line(x,y,x+j*8+sway,y-23+Math.abs(j)*4,'#557546',2);for(let k=0;k<3;k++){ellipse(x+j*6+sway-3,y-8-k*5,5,2,'#73925c');ellipse(x+j*6+sway+4,y-9-k*5,5,2,'#829960')}}}
 for(const [x,y] of [[198,471],[806,462],[885,481]]){rect(x,y-9,5,14,'#d8c9a6',2);ellipse(x+2,y-10,13,7,'#ad8271');ellipse(x-3,y-12,2,2,'#edd6b1');ellipse(x+7,y-11,2,2,'#edd6b1')}
 for(let i=0;i<8;i++){const x=210+i*96,y=591+(i%2)*12;ellipse(x,y,5+i%3,3,'#9c9b7d');line(x-3,y-1,x+3,y-1,'#c4b99b',1)}
 // Overhanging branches sway independently of the distant forest.
 for(const side of [-1,1]){c.save();c.translate(side===-1?0:1000,72);c.scale(side===-1?1:-1,1);c.rotate(Math.sin(time*.45)*.018);line(-12,0,160,69,'#4e6347',13);for(let i=0;i<6;i++){const x=24+i*23,y=x*.43;line(x,y,x+14,y-29,'#4e6347',4);ellipse(x+15,y-29,23,9,'#496e48');ellipse(x+22,y+4,26,11,'#5a7e4d')}c.restore()}
 if(zone==='pond'&&!night){const x=620+Math.sin(time*.65)*78,y=346+Math.cos(time*.9)*14;line(x-9,y,x+8,y,'#8aa7a1',2);ellipse(x-3,y-4,7,2,'#d6e0cc77');ellipse(x+3,y+4,7,2,'#d6e0cc77')}
 if(zone==='lookout'){rect(915,403,7,92,'#746848',2);line(914,410,897,410,'#746848',4);rect(883,409,21,30,'#c1aa78',3);rect(886,413,15,21,night?'#ebd39b':'#82998c',2);if(night){ellipse(893,429,45,58,'#ecd09b14');ellipse(893,489,46,12,'#ead3981c')}}
}
function draw(a){if(!zone)return;const {c,rect,ellipse,line,text,hit,bear,tree,water,night}=a;sky(a);
 if(zone==='pond'){
  ellipse(630,424,303,92,'#738766');water(634,395,280,64);for(let i=0;i<7;i++){const x=436+i*61,y=389+Math.sin(i*4)*31;ellipse(x,y,17,5,'#839d68');line(x,y,x+8,y-2,'#b1bc7c',1)}
  for(let i=0;i<19;i++){const x=361+i*28,y=467+Math.sin(i*7)*15;line(x,y,x+Math.sin(time*1.1+i)*6,y-37-(i%3)*12,'#566f47',3);ellipse(x+Math.sin(time*1.1+i)*6,y-43-(i%3)*12,3,8,'#998361')}
  stone(a,278,465,99,24);ellipse(326,492,51,9,'#43563440');hit(271,446,113,57,sit,'Sit on the bank');hit(548,434,105,55,toss,'Skip a pebble');
  if(stoneRipples>2.5){const flight=(4-stoneRipples)/1.5;ellipse(325+flight*317,466-flight*61-Math.sin(flight*Math.PI)*61,5,3,'#b5b59c')}
  if(film==='pond'&&elapsed>8&&elapsed<17||stoneRipples>0&&stoneRipples<=2.5){const age=stoneRipples>0?2.5-stoneRipples:elapsed-8;for(let i=0;i<4;i++)ripple(a,642,405,17+age*16+i*18,Math.max(0,.5-age*.04))}
 }else if(zone==='ruins'){
  // The creek is behind the walking bank, so bears never slide across water.
  water(509,409,570,50);c.fillStyle='#84917b';c.beginPath();c.moveTo(273,363);c.lineTo(736,363);c.lineTo(739,441);c.lineTo(672,441);c.ellipse(507,443,135,58,0,0,Math.PI,true);c.lineTo(274,441);c.closePath();c.fill();for(let row=0;row<3;row++)for(let i=0;i<10;i++){const sx=275+i*46+(row%2)*12;if(row===0||sx<370||sx>638)stone(a,sx,357+row*22,43,20);}for(let i=0;i<9;i++){if(i===5)continue;stone(a,276+i*51,333,46,i===4?15:24)}
  for(let i=0;i<5;i++)stone(a,679+i*26,450+(i%2)*15,24,17);line(381,443,388,462,'#63845c',4);line(710,402,702,440,'#637e59',4);c.save();c.strokeStyle='#c1c7a2';c.lineWidth=3;c.beginPath();c.arc(339,397,15,Math.PI,0);c.stroke();c.restore();hit(282,360,114,111,()=>record(evidence.ruins),'Inspect the weathered carving');
  const leafX=film==='ruins'?205+Math.min(elapsed/22,1)*650:220+(time*22)%570;ellipse(leafX,424,10,4,'#d6bb7f');line(leafX-7,424,leafX+7,424,'#968451',1);
 }else{
  ellipse(713,338,420,88,night?'#3b514a':'#729179');ellipse(788,353,260,63,night?'#293f3b':'#5c7d65');
  if(film==='lookout'&&elapsed>=9&&elapsed<=19){const opacity=Math.min(1,(elapsed-9)/2,(19-elapsed)/2);c.save();c.globalAlpha=Math.max(0,opacity)*.75;rect(734,276,84,54,'#7e8271',2);c.fillStyle='#6b7668';c.beginPath();c.moveTo(724,279);c.lineTo(775,249);c.lineTo(829,280);c.fill();if(elapsed>14&&elapsed<18)rect(768,296,12,13,'#efd9a6');c.restore();}
  for(let i=0;i<8;i++)ellipse((i*169+time*8)%1150-70,290+(i%3)*25,160,30,'#c9d7cb35');stone(a,314,440,128,40);line(332,440,334,463,'#596e54',2);hit(310,423,139,60,()=>record(observed()),'Observe the distant ridge');
 }
 forestDetails(a);
 // Jonesha moves along a safe bank, then pauses to watch the scene.
 const walking=film&&elapsed<6,x=film?210+Math.min(elapsed/6,1)*235:450+Math.sin(time*.15)*17;
 bear(x,510,.88,'#b98a64','#9a7f9a',walking?'walk':film?'talk':'idle',3,'Jonesha');hit(x-43,400,86,116,watch,'Talk with Jonesha');
 for(const [i,[label,next]] of routes[zone].entries()){const x=routes[zone].length===3?95+i*370:i===0?95:900;rect(x,543,7,43,'#735b40',2);rect(x-77,513,162,31,'#e1d4ad',5);text((i===0?'‹ ':'')+label+(i>0?' ›':''),x+3,534,13,'#645540');hit(x-79,508,167,49,()=>go(next),'Follow trail to '+label)}
 for(let i=0;i<4;i++)tree(i<2?i*125-45:895+(i-2)*123,472,1.15,true);
 // A permanent layer of local mist is separate from the optional weather setting.
 for(let i=0;i<5;i++)ellipse((i*249+time*9)%1250-120,358+(i%3)*41,208,22,'#d5dfd51c');
 if(fade>0)rect(0,0,1000,650,`rgba(32,47,38,${Math.sin((.65-fade)/.65*Math.PI)*.65})`);
}
world.addEventListener('click',e=>{if(scene()!=='woodsedge')return;const b=e.target.closest('button');if(!b)return;if(b.id==='hbObjects'){e.stopImmediatePropagation();controls()}else if(zone&&b.id==='hbWatch'){e.stopImmediatePropagation();watch()}else if(zone&&b.id==='hbStoryStop'){e.stopImmediatePropagation();stop()}},true);
world.addEventListener('keydown',e=>{if(e.key==='Escape'&&scene()==='woodsedge'){stop();fade=0;target=null;window.HBWorld?.cancelMovement?.()}});
lastScene=scene();if(lastScene==='woodsedge'&&names[memory.zone])enter(memory.zone,true);
window.HBWoods={current:()=>zone,enter,go,walkTo,update,draw,watch,stop,active:()=>!!film,camera:()=>film?{x:zone==='lookout'?660:zone==='ruins'?510:600,zoom:1.09}:null,routes};
})();
