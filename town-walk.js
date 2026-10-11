/* Honeybrook's illustrated walk-and-discover loop. Optional, free-roam, saved on this device. */
(function () {
  'use strict';
  function start() {
    const town = document.getElementById('town');
    const world = document.getElementById('hbPlayableWorld');
    const art = world && world.querySelector('.hb-world-art');
    if (!town || !world || !art || art.dataset.walkReady) return;
    art.dataset.walkReady = '1';

    const canvas = document.createElement('canvas');
    canvas.className = 'hb-walk-canvas';
    canvas.tabIndex = 0;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Playable Honeybrook town scene. Use arrow keys or WASD to walk, click the path to move, and press E to interact.');
    const tools=art.querySelector('.hb-world-rail'),toolbar=art.querySelector('.hb-world-toolbar');if(tools)world.insertBefore(tools,art);if(toolbar)world.appendChild(toolbar);for(const marker of art.querySelectorAll('[data-hb-place]'))marker.setAttribute('aria-label',marker.querySelector('b')?.textContent||'Visit this place');
    const shade = art.querySelector('.hb-world-shade');
    if (shade) shade.after(canvas); else art.prepend(canvas);

    const hud = document.createElement('div');
    hud.className = 'hb-walk-hud';
    hud.innerHTML = '<div class="hb-walk-head"><span class="hb-walk-paw">🐾</span><div><small>FREE ROAM · NO ROUTE REQUIRED</small><b id="hbWalkStatus">Your Honeybrook walk is ready.</b></div></div><p id="hbWalkNearby">Walk with WASD or the arrow keys. Click anywhere on the town path to stroll there.</p><div id="hbWalkResponse" class="hb-walk-response" aria-live="polite" hidden></div><div id="hbWalkChoices" class="hb-walk-choices"></div><button type="button" id="hbWalkAction" class="hb-walk-action" hidden></button><small class="hb-walk-help">WASD / arrows to walk <span>·</span> E to interact</small></div>';
    world.appendChild(hud);

    const pad = document.createElement('div');
    pad.className = 'hb-walk-pad';
    pad.setAttribute('role', 'group');
    pad.setAttribute('aria-label', 'Walk around Honeybrook');
    pad.innerHTML = '<button type="button" data-walk-dir="up" aria-label="Walk up">▲</button><button type="button" data-walk-dir="left" aria-label="Walk left">◀</button><button type="button" data-walk-dir="down" aria-label="Walk down">▼</button><button type="button" data-walk-dir="right" aria-label="Walk right">▶</button>';
    world.appendChild(pad);

    const ctx = canvas.getContext('2d');
    const status = document.getElementById('hbWalkStatus');
    const nearby = document.getElementById('hbWalkNearby');
    const response = document.getElementById('hbWalkResponse');
    const choices = document.getElementById('hbWalkChoices');
    const action = document.getElementById('hbWalkAction');
    const storageKey = 'honeybrook_walk_memory_v1';
    function readMemory() {
      try { return Object.assign({ x:.5, y:.73, visits:[], moments:[], clues:0 }, JSON.parse(localStorage.getItem(storageKey) || '{}')); }
      catch (_) { return { x:.5, y:.73, visits:[], moments:[], clues:0 }; }
    }
    const memory = readMemory();
    memory.visits = Array.isArray(memory.visits) ? memory.visits : [];
    memory.moments = Array.isArray(memory.moments) ? memory.moments : [];
    memory.friendships = memory.friendships && typeof memory.friendships === 'object' && !Array.isArray(memory.friendships) ? memory.friendships : {};
    const routines = {
      Amelia: ['setting out welcome flowers by the bridge','visiting neighbors along the bridge path','lighting the welcome lantern'],
      'Harold Pawst': ['sorting letters for his rounds','delivering the afternoon post','taking his last letters home'],
      Sammy: ['checking the garden seedlings','sharing a picnic beside the path','watching fireflies near the garden'],
      Wally: ['kneading the morning bread','setting warm rolls on the bakery counter','putting the bakery kitchen to bed'],
      'Benny Scoops': ['getting his ice-cream cart ready','ringing his cart bell for the neighborhood','cleaning his cart after the last scoop']
    };
    const happenings = [
      {title:'Welcome flowers at the bridge',watch:'Amelia straightens a vase. Harold pauses with his mailbag while Sammy picks a fallen petal from the path.',join:'You hold the vase steady while Amelia adds the last flower. “There. A welcome for whoever comes next.”',bear:'Amelia'},
      {title:'A little afternoon picnic',watch:'Sammy spreads a cloth beside the path. Wally brings bread, and Benny parks his cart nearby. There is an empty seat for you.',join:'You set out the cups. Sammy slides the bread closer. “Stay as long as you like.”',bear:'Sammy'},
      {title:'Lanterns and a goodnight wave',watch:'Amelia lights the welcome lantern. Wally closes his shutters while Harold tips his cap to the neighbors heading home.',join:'You help carry a lantern to the bridge. Its warm light dances on the creek as Amelia waves goodnight.',bear:'Amelia'}
    ];
    let chosenTime='auto', dailySlot=-1, activity=null, watchTimer=null;
    const activitySteps=[['Place the first flower','Place the second flower','Place the last flower'],['Spread the picnic blanket','Set out the cups','Bring the honey bread','Share the berry bowl'],['Light your lantern','Walk to the creek path','Carry it across the bridge','Walk to the welcome post','Hang the lantern']];
    const flowerColors={honey:'#edb94d',rose:'#ce6d87',lavender:'#9b85cd'};
    memory.dailyPlay=memory.dailyPlay&&typeof memory.dailyPlay==='object'&&!Array.isArray(memory.dailyPlay)?memory.dailyPlay:{};
    function activityDay(){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
    function activityState(slot,old){
      const today=activityDay(), valid=old&&old.day===today;
      return {day:today,step:valid&&Number.isInteger(old.step)?Math.max(0,Math.min(activitySteps[slot].length,old.step)):0,color:valid&&Object.hasOwn(flowerColors,old.color)?old.color:'honey',recorded:!!(valid&&old.recorded)};
    }
    function advanceActivity(slot,state){if(state.step>=activitySteps[slot].length)return false;state.step++;return true;}
    function timeSlot() {
      if(chosenTime!=='auto')return Number(chosenTime);
      const hour=Number(new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',hour:'numeric',hourCycle:'h23'}).format(new Date()));
      return hour<12?0:hour<18?1:2;
    }
    function friendship(name) {
      const old=memory.friendships[name];
      if(!old || typeof old!=='object' || Array.isArray(old))memory.friendships[name]={visits:0};
      if(typeof memory.friendships[name].help!=='string')delete memory.friendships[name].help;
      return memory.friendships[name];
    }
    const daily=document.createElement('section');
    daily.className='hb-walk-hud';daily.style.position='relative';daily.style.inset='auto';daily.style.width='auto';daily.style.maxWidth='none';daily.style.margin='16px 0';
    daily.setAttribute('aria-label','Honeybrook daily life');
    daily.innerHTML='<h3>A cozy day in Honeybrook</h3><p>The neighbors have their own day. Watch, join in, or carry on wandering—nothing is required.</p><label>Town time <select id="hbDailyTime"><option value="auto">Follow Arkansas time</option><option value="0">Morning</option><option value="1">Afternoon</option><option value="2">Evening</option></select></label><p id="hbDailyClock"></p><ul id="hbDailyRoutines"></ul><h4 id="hbDailyEvent"></h4><div class="hb-walk-choices"><button type="button" id="hbDailyWatch">Watch the neighborhood moment</button><button type="button" id="hbDailyJoin">Join in for a moment</button></div><div id="hbDailyStage"></div><div id="hbDailyControls" class="hb-walk-choices"></div><p id="hbDailyReply" role="status"></p><p><small>Conversations and completed shared moments are remembered on this browser. Your adventure progress stays saved when a new day begins.</small></p>';
    world.appendChild(daily);
    function renderDaily() {
      const slot=timeSlot();if(slot===dailySlot)return;dailySlot=slot;
      stopWatch();activity=null;
      daily.querySelector('#hbDailyClock').textContent=['Morning: the town is waking up.','Afternoon: neighbors cross paths.','Evening: the welcome lights come on.'][slot];
      const list=daily.querySelector('#hbDailyRoutines');list.replaceChildren();
      Object.entries(routines).forEach(([name,activities])=>{const li=document.createElement('li');li.textContent=name+' is '+activities[slot]+'.';list.appendChild(li);});
      daily.querySelector('#hbDailyEvent').textContent=happenings[slot].title;
      daily.querySelector('#hbDailyReply').textContent='You can just enjoy being here.';
      renderActivity();
    }
    daily.querySelector('#hbDailyTime').addEventListener('change',e=>{chosenTime=e.target.value;renderDaily();paint();});
    function stopWatch(){clearTimeout(watchTimer);watchTimer=null;}
    function beginActivity(watching){
      renderDaily();stopWatch();
      activity={slot:dailySlot,watching,state:activityState(dailySlot,watching?null:memory.dailyPlay[dailySlot])};
      renderActivity();
      daily.querySelector('#hbDailyReply').textContent=watching?'Watch the neighbors act out their little moment.':activity.state.step===activitySteps[dailySlot].length?'You already shared this moment today. You can play it again.':'Take each step at your own pace. Leaving and coming back keeps your place.';
      if(watching)watchTimer=setTimeout(watchNext,1400);
    }
    function watchNext(){
      if(!activity?.watching)return;
      if(document.hidden||!town.classList.contains('active')||document.body.classList.contains('visit-open')){stopWatch();daily.querySelector('#hbDailyReply').textContent='The scene is paused. Choose Watch to start it again, or Join to take part.';return;}
      advanceActivity(activity.slot,activity.state);renderActivity();
      if(activity.state.step<activitySteps[activity.slot].length)watchTimer=setTimeout(watchNext,1400);
      else daily.querySelector('#hbDailyReply').textContent=happenings[activity.slot].watch+' You can join whenever you like.';
    }
    function finishActivity(){
      if(!activity||activity.watching||activity.state.step!==activitySteps[activity.slot].length)return;
      const event=happenings[activity.slot];
      if(!activity.state.recorded){activity.state.recorded=true;friendship(event.bear).help=event.title;memory.dailyPlay[activity.slot]={...activity.state};addMemory('Joined '+event.title);}
      daily.querySelector('#hbDailyReply').textContent=event.join+' Your shared moment is saved.';
    }
    function renderActivity(){
      const host=daily.querySelector('#hbDailyStage'), controls=daily.querySelector('#hbDailyControls');
      controls.replaceChildren();
      const slot=activity?.slot??dailySlot, step=activity?.state.step||0,color=flowerColors[activity?.state.color||'honey'];
      const person=slot===1?'sammy':'amelia';
      const posed=(who,pose)=>pose===null?'<img src="assets/'+who+'.webp" alt="">':'<span class="hb-action-pose" data-pose="'+pose+'" aria-hidden="true"></span>';
      const neighborPose=slot===0&&step>0?0:slot===1&&step===4?1:null;
      const visitorPose=slot===0&&step>0?3:slot===1&&step===4?2:slot===2&&step>0&&step<5?3:null;
      const visitorName=document.getElementById('sessionBear')?.textContent||'Visitor Bear';
      host.innerHTML='<div class="hb-daily-scene" data-scene="'+slot+'" data-step="'+step+'" role="img" aria-label="'+(slot===0?'Amelia and your bear reaching to arrange flowers beside the bridge':slot===1&&step===4?'Sammy and your bear sitting at their creekside picnic':slot===1?'Sammy and your bear setting a creekside picnic':'Your bear carrying a lantern across the bridge')+'"><div class="hb-daily-sky"></div><div class="hb-daily-creek"></div><div class="hb-daily-bridge"><i></i><i></i><i></i></div><div class="hb-daily-post"></div><div class="hb-daily-neighbor">'+posed(person,neighborPose)+'<b>'+(slot===1?'Sammy':'Amelia')+'</b></div><div class="hb-daily-visitor">'+posed('visitor',visitorPose)+'<b></b><span class="hb-daily-carried" aria-hidden="true"></span></div><div class="hb-daily-props"></div><div class="hb-daily-caption"></div></div>';
      const scene=host.firstElementChild;
      scene.querySelector('.hb-daily-visitor b').textContent=visitorName;
      const props=scene.querySelector('.hb-daily-props');
      let caption='';
      if(slot===0){
        props.innerHTML='<div class="hb-daily-vase"></div>'+Array.from({length:step},(_,i)=>'<span class="hb-daily-flower" style="--flower:'+color+';--stem:'+i+'"><i></i><b>✿</b></span>').join('');
        caption=step===3?'A full vase—and a welcome for the next visitor.':step?step+' of 3 flowers placed in the vase.':'An empty vase waits on the bridge table.';
      }else if(slot===1){
        props.innerHTML=(step>0?'<div class="hb-daily-blanket"></div>':'<div class="hb-daily-folded">🧺</div>')+(step>1?'<span class="hb-daily-cups">☕ ☕ ☕</span>':'')+(step>2?'<span class="hb-daily-bread">🍞</span>':'')+(step>3?'<span class="hb-daily-berries">🫐</span>':'');
        caption=['Sammy has brought the picnic basket.','The blanket opens beside the creek.','Everyone has a cup.','Honey bread sits in the middle.','The picnic is ready. There is a seat for you.'][step];
      }else{
        const lantern='<span class="hb-daily-lantern '+(step?'is-lit':'')+'">🏮</span>';
        if(step>=5)props.innerHTML='<span class="hb-daily-hung">'+lantern+'</span>';
        else scene.querySelector('.hb-daily-carried').innerHTML=lantern;
        caption=['Your bear holds an unlit lantern.','The lantern lights up in your paw.','You reach the creek path.','Warm light crosses the bridge with you.','Amelia waits beside the welcome post.','Your lantern glows on the welcome post.'][step];
      }
      scene.querySelector('.hb-daily-caption').textContent=caption;
      if(!activity)return;
      function control(label,fn){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',fn);controls.appendChild(b);return b;}
      if(activity.watching){control('Stop watching',()=>{stopWatch();activity=null;renderActivity();daily.querySelector('#hbDailyReply').textContent='You are free to wander, watch again, or join in.';});return;}
      if(slot===0&&step===0)Object.keys(flowerColors).forEach(name=>{const b=control('Choose '+name+' flowers',()=>{activity.state.color=name;memory.dailyPlay[slot]={...activity.state};save();renderActivity();});b.setAttribute('aria-pressed',String(activity.state.color===name));});
      if(step<activitySteps[slot].length)control(activitySteps[slot][step],()=>{
        if(!activity||activity.watching||activity.slot!==slot)return;
        advanceActivity(slot,activity.state);memory.dailyPlay[slot]={...activity.state};save();renderActivity();
        daily.querySelector('#hbDailyReply').textContent=host.querySelector('.hb-daily-caption').textContent;
        finishActivity();
        // Keep keyboard users on the next hands-on action as the controls change.
        controls.querySelector('button:last-child')?.focus({preventScroll:true});
      });
      else control('Play this moment again',()=>{const recorded=activity.state.recorded;activity.state={day:activityDay(),step:0,color:activity.state.color,recorded};memory.dailyPlay[slot]={...activity.state};save();renderActivity();daily.querySelector('#hbDailyReply').textContent='Ready for another little moment together.';});
    }
    daily.querySelector('#hbDailyWatch').addEventListener('click',()=>beginActivity(true));
    daily.querySelector('#hbDailyJoin').addEventListener('click',()=>beginActivity(false));
    document.addEventListener('visibilitychange',()=>{if(document.hidden&&activity?.watching){stopWatch();daily.querySelector('#hbDailyReply').textContent='Watching is paused. Choose Watch to start again.';}});
    window.addEventListener('pagehide',stopWatch);
    const encounters=[
      {name:'Harold Pawst',image:'harold',line:'Harold pauses on his rounds. “A new neighbor has a parcel at the Welcome House. I deliver mail—not gossip!”',reply:'You help straighten the parcel label. Harold checks the address and tips his cap.',help:'the parcel on your mail route'},
      {name:'Benny Scoops',image:'benny',line:'Benny rings his cart bell. “I brought honey-vanilla today. Care to keep me company while I park?”',reply:'You guide Benny to a clear spot beside the path. He raises a scoop in thanks.',help:'parking your ice-cream cart'},
      {name:'Amelia',image:'amelia',line:'Amelia arrives with a small welcome basket. “Someone new is settling in. A friendly wave makes a difference.”',reply:'You carry the basket together. Amelia leaves it by the Welcome House door and waves.',help:'welcoming our new neighbor'},
      {name:'Wally',image:'wally',line:'Wally comes out carrying extra rolls. “The dough rose beautifully. Let’s find somebody to share these with.”',reply:'You help Wally set the rolls in a basket by the path. The first passerby stops with a smile.',help:'sharing the extra rolls'},
      {name:'Sammy',image:'sammy',line:'Sammy stops to show you a fallen leaf. “Look at the colors! Would you help me clear a little space for the seedlings?”',reply:'You move the leaves beside the garden instead of throwing them away. Sammy waters the newly cleared patch.',help:'clearing the garden path'}
    ];
    let encounterIndex=0,encounterDay='';
    const passing=document.createElement('section');passing.className='hb-passing-neighbor';passing.innerHTML='<h4>Around the neighborhood</h4><p>A different mix of neighbors crosses your path each day. Every visit is optional.</p><button type="button" id="hbMeetPassing">Meet a passing neighbor</button><div id="hbPassingScene"></div><p id="hbPassingReply" role="status"></p><div id="hbPassingChoices" class="hb-walk-choices"></div>';daily.appendChild(passing);
    passing.querySelector('#hbMeetPassing').addEventListener('click',()=>{
      const day=activityDay();if(day!==encounterDay){encounterDay=day;encounterIndex=0;}
      const seed=Array.from(day).reduce((total,c)=>total+c.charCodeAt(0),0), event=encounters[(seed+encounterIndex++)%encounters.length];
      const stage=passing.querySelector('#hbPassingScene');stage.innerHTML='<div class="hb-passing-walk"><img src="assets/'+event.image+'.webp" alt="'+event.name+' arriving along the path"></div>';
      passing.querySelector('#hbPassingReply').textContent=event.line;
      const controls=passing.querySelector('#hbPassingChoices');controls.replaceChildren();
      for(const [label,reply,help] of [['Wave hello',event.name+' waves back. There is no hurry to do anything else.',false],['Lend a paw',event.reply,true],['Keep wandering','You carry on at your own pace. '+event.name+' continues the day.',false]]){
        const b=document.createElement('button');b.type='button';b.textContent=label;controls.appendChild(b);b.addEventListener('click',()=>{passing.querySelector('#hbPassingReply').textContent=reply;if(help){friendship(event.name).help=event.help;addMemory('Helped '+event.name+' around the neighborhood');}stage.classList.toggle('hb-passing-helped',help);controls.replaceChildren();});
      }
    });
    renderDaily();setInterval(renderDaily,60000);
    let x = Math.max(.03, Math.min(.97, Number(memory.x) || .5));
    let y = Math.max(.06, Math.min(.94, Number(memory.y) || .73));
    let W = 1, H = 1, lastTime = 0, elapsed = 0, goal = null, goalDone = null;
    let activeNpc = null, facing = 1, walkPhase = 0, footstep = 0;
    const held = new Set();
    const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');const reduceMotion=()=>motionPreference.matches||document.body.classList.contains('hb-reduced-motion');
    const spriteNames=['visitor','amelia','harold','sammy','wally','benny'];const bearSprites=spriteNames.map(name=>{const image=new Image();image.src='assets/'+name+'.webp';image.onload=()=>paint();return image;});
    const names = ['Amelia','Harold Pawst','Sammy','Wally','Benny Scoops'];
    const bears = [
      {name:names[0], fur:'#b88655', coat:'#618a69', path:[[.55,.66],[.59,.68],[.62,.70],[.61,.73],[.56,.71]], speed:.038},
      {name:names[1], fur:'#9b9289', coat:'#486087', path:[[.40,.61],[.44,.64],[.49,.65],[.47,.69],[.42,.68]], speed:.05},
      {name:names[2], fur:'#9a693e', coat:'#897858', path:[[.25,.62],[.28,.66],[.31,.68],[.30,.71],[.26,.69]], speed:.03},
      {name:names[3], fur:'#bb925f', coat:'#bd5962', path:[[.77,.70],[.81,.73],[.84,.75],[.83,.78],[.79,.76]], speed:.027},
      {name:names[4], fur:'#a7774b', coat:'#4d8b9d', path:[[.61,.66],[.64,.69],[.67,.72],[.65,.75],[.62,.73]], speed:.044}
    ];
    const dialogue = {
      'Amelia':['“Tom and I only meant to fix a bridge. Look what grew out of it.”','“A light in the window can change somebody’s whole night.”','“You don’t have to know what comes next before you come in.”'],
      'Harold Pawst':['“I DELIVER MAIL. I DO NOT DELIVER MESSAGES.”','“The route is quiet today. That never lasts.”','“I saved a letter for Wally. The loaf beside it is not mail.”'],
      'Sammy':['“You can eat first.”','“You don’t have to tell me where you came from.”','“I saved you a seat. You can leave it empty if you want.”'],
      'Wally':['“I kept one loaf for supper. Amelia will be proud.”','“Want to smell the cinnamon? The oven’s almost ready.”','“Take a warm roll. I made plenty.”'],
      'Benny Scoops':['“I rang my cart bell one time. Everybody heard it.”','“Blueberry, honey-vanilla, or just a wave today?”','“The cubs say my cart is impossible to miss.”']
    };
    const places = () => Array.from(art.querySelectorAll('.hb-world-marker')).map(button => {
      const r = button.getBoundingClientRect(), a = art.getBoundingClientRect();
      return { button:button, x:(r.left+r.width/2-a.left)/a.width, y:(r.top+r.height/2-a.top)/a.height, name:(button.querySelector('b')||button).textContent.trim() };
    });
    function save() {
      memory.x=x; memory.y=y;
      try { localStorage.setItem(storageKey, JSON.stringify(memory)); } catch (_) {}
    }
    function say(text) { nearby.textContent=text; }
    function clearChoices() { choices.replaceChildren(); response.hidden=true; response.textContent=''; }
    function addMemory(text) {
      memory.moments.push({ text:text, when:new Date().toLocaleString([], {month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}) });
      memory.moments=memory.moments.slice(-20); save();
    }
    function showResponse(text) { response.hidden=false; response.textContent=text; }
    function makeChoice(label, fn) {
      const b=document.createElement('button'); b.type='button'; b.textContent=label; b.addEventListener('click',fn); choices.appendChild(b); return b;
    }
    function updateHud() {
      const a=art.getBoundingClientRect();
      const px=x*a.width, py=y*a.height;
      let nearestPlace=null, pd=Infinity;
      places().forEach(p=>{const d=Math.hypot((p.x-x)*a.width,(p.y-y)*a.height);if(d<pd){pd=d;nearestPlace=p;}});
      let nearestBear=null, bd=Infinity;
      bears.forEach((b,i)=>{const p=npcPoint(b,elapsed+i*8),d=Math.hypot((p.x-x)*a.width,(p.y-y)*a.height);if(d<bd){bd=d;nearestBear={bear:b,point:p,index:i};}});
      action.hidden=true;
      action.onclick=null;
      activeNpc=null;
      if (pd < Math.min(a.width*.105, 145)) {
        say('You are beside ' + nearestPlace.name + '. Press E or open the place.');
        action.textContent='Enter ' + nearestPlace.name + ' →';
        action.hidden=false;
        action.onclick=()=>activate(nearestPlace);
      } else if (bd < Math.min(a.width*.12, 155)) {
        activeNpc=nearestBear;
        say(nearestBear.bear.name + ' is nearby. Press E or say hello.');
        action.textContent='Talk with ' + nearestBear.bear.name + ' →';
        action.hidden=false;
        action.onclick=()=>talk(nearestBear.bear);
      } else {
        const total=memory.visits.length;
        say('A quiet Honeybrook stroll · ' + total + ' place' + (total===1?'':'s') + ' visited');
      }
      void px; void py;
    }
    function npcPoint(bear, t) {
      const slot=timeSlot(), p=bear.path, k=(t*bear.speed)%(p.length+2), i=Math.min(p.length-1,Math.floor(k)), q=k>=p.length?1:k-i, a=p[i], b=p[(i+1)%p.length];
      return {x:a[0]+(b[0]-a[0])*q+(slot===0?-.025:slot===2?.025:0),y:a[1]+(b[1]-a[1])*q+(slot===2?.015:0),walking:k<p.length};
    }
    function resize() {
      const r=art.getBoundingClientRect(), d=Math.min(window.devicePixelRatio||1,2);
      if (!r.width || !r.height) return;
      W=r.width; H=r.height;
      canvas.width=Math.round(W*d); canvas.height=Math.round(H*d);
      canvas.style.width=W+'px'; canvas.style.height=H+'px';
      ctx.setTransform(d,0,0,d,0,0);
      paint();
    }
    function ellipse(cx,cy,rx,ry,color) { ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.fill(); }
    function drawBear(nx,ny,fur,coat,t,moving,label,isPlayer) {
      const u=Math.max(.78,Math.min(1.35,Math.min(W,H)/510)), px=nx*W, py=ny*H;
      const bob=reduceMotion()?0:moving?Math.abs(Math.sin(t*11))*2.1*u:Math.sin(t*2.2)*.8*u;
      const swing=moving?Math.sin(t*11)*.22:Math.sin(t*1.4)*.035;
      ctx.save();ctx.translate(px,py+bob);
      ellipse(0,4*u,19*u,5*u,'rgba(29,25,17,.24)');
      const image=bearSprites[isPlayer?0:names.indexOf(label)+1];if(image?.complete&&image.naturalWidth){const size=label==='Sammy'?62*u:80*u;const width=size*image.naturalWidth/image.naturalHeight;ctx.drawImage(image,-width/2,4*u-size,width,size);}else{
      ctx.strokeStyle=fur;ctx.lineWidth=5*u;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(-7*u,-8*u);ctx.lineTo(-10*u+12*swing*u,1*u);ctx.moveTo(7*u,-8*u);ctx.lineTo(10*u-12*swing*u,1*u);ctx.stroke();
      ellipse(-8*u,-1*u,4*u,5*u,fur);ellipse(8*u,-1*u,4*u,5*u,fur);
      ellipse(0,-12*u,9*u,13*u,coat);
      ctx.strokeStyle=coat;ctx.lineWidth=5*u;ctx.beginPath();ctx.moveTo(-6*u,-17*u);ctx.lineTo(-10*u+14*swing*u,-9*u);ctx.moveTo(6*u,-17*u);ctx.lineTo(10*u-14*swing*u,-9*u);ctx.stroke();
      ellipse(0,-29*u,13*u,12*u,fur);ellipse(-8*u,-38*u,4.3*u,5*u,fur);ellipse(8*u,-38*u,4.3*u,5*u,fur);
      ellipse(-4*u,-30*u,1.25*u,1.6*u,'#21180f');ellipse(4*u,-30*u,1.25*u,1.6*u,'#21180f');
      ellipse(0,-25*u,4.6*u,3.3*u,'#e6c397');ellipse(0,-26*u,1.8*u,1.4*u,'#39251a');
      ctx.strokeStyle='#39251a';ctx.lineWidth=1*u;ctx.beginPath();ctx.arc(0,-24*u,2.6*u,.2,2.8);ctx.stroke();
      }
      if (isPlayer) { ctx.strokeStyle='#ffe18c';ctx.lineWidth=2*u;ctx.beginPath();ctx.arc(0,-18*u,23*u,0,Math.PI*2);ctx.stroke();ellipse(14*u,-19*u,4*u,4*u,'#ffe18c'); }
      ctx.font='800 '+Math.max(14,12*u)+'px Nunito, sans-serif';ctx.textAlign='center';ctx.lineWidth=3*u;ctx.strokeStyle='rgba(42,30,19,.72)';if(W>600||isPlayer)ctx.strokeText(label,0,(isPlayer?-86:24)*u);ctx.fillStyle=isPlayer?'#fff1c9':'#fff9eb';if(W>600||isPlayer)ctx.fillText(label,0,(isPlayer?-86:24)*u);
      ctx.restore();
    }
    function paint(t) {
      if (!ctx || !W || !H) return;
      ctx.clearRect(0,0,W,H);
      const a=art.getBoundingClientRect();
      if (goal) {
        ctx.save();ctx.setLineDash([7,8]);ctx.strokeStyle='rgba(255,238,183,.88)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x*W,y*H);ctx.lineTo(goal.x*W,goal.y*H);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='rgba(255,222,132,.8)';ctx.beginPath();ctx.arc(goal.x*W,goal.y*H,7+Math.sin(elapsed*5)*2,0,Math.PI*2);ctx.fill();ctx.restore();
      }
      bears.forEach((b,i)=>{const p=npcPoint(b,elapsed+i*8);drawBear(p.x,p.y,b.fur,b.coat,elapsed+i,p.walking,b.name,false);});
      drawBear(x,y,'#a87549','#527e67',elapsed,held.size>0||!!goal,document.getElementById('sessionBear')?.textContent||'Visitor Bear',true);
      if (goal && Math.hypot((goal.x-x)*W,(goal.y-y)*H)<18) {
        const done=goalDone;goal=null;goalDone=null;save();updateHud();if(done)done();
      }
      if (a.width!==W || a.height!==H) resize();
    }
    function loop(now) {
      const dt=Math.min(.05, lastTime ? (now-lastTime)/1000 : .016);lastTime=now;
      if(!reduceMotion())elapsed+=dt;
      if (town.classList.contains('active') && !document.body.classList.contains('visit-open') && !document.hidden && !document.getElementById('hbWorldDialog')?.open && document.getElementById('modal')?.classList.contains('hidden')) {
        if (goal) {
          const dx=(goal.x-x)*W,dy=(goal.y-y)*H,d=Math.hypot(dx,dy);
          if(d>3){const step=Math.min(d,235*dt);x+=dx/d*step/W;y+=dy/d*step/H;facing=dx>=0?1:-1;walkPhase+=dt*9;}
        } else if(held.size){
          let dx=0,dy=0;
          if(held.has('left'))dx--;if(held.has('right'))dx++;if(held.has('up'))dy--;if(held.has('down'))dy++;
          const m=Math.hypot(dx,dy)||1,s=210*dt; x=Math.max(.025,Math.min(.975,x+dx/m*s/W));y=Math.max(.04,Math.min(.96,y+dy/m*s/H));facing=dx<0?-1:dx>0?1:facing;walkPhase+=dt*9;
        }
        paint(now);
        updateHud();
      }
      requestAnimationFrame(loop);
    }
    function walkTo(tx,ty,done,message) {
      goal={x:Math.max(.025,Math.min(.975,tx)),y:Math.max(.04,Math.min(.96,ty))};goalDone=done||null;held.clear();
      status.textContent='Visitor Bear is on the move.';
      say(message||'Taking the town path at your own pace.');
      clearChoices();canvas.focus({preventScroll:true});
    }
    function rememberPlace(p) {
      const key=p.button.dataset.hbPlace||p.button.querySelector('b')?.textContent||p.name;
      if(!memory.visits.includes(key)){memory.visits.push(key);memory.visits=memory.visits.slice(-40);}
      status.textContent='Arrived at '+p.name+'.';
      say('The path opens right into the scene. Take your time.');
      addMemory('Walked to '+p.name);
      save();updateHud();
    }
    function activate(p) {
      if(!p)return;
      rememberPlace(p);
      p.button.dataset.hbWalkPass='1';
      p.button.click();
    }
    function nearestPlace() {
      const a=art.getBoundingClientRect();let best=null,d0=Infinity;
      places().forEach(p=>{const d=Math.hypot((p.x-x)*a.width,(p.y-y)*a.height);if(d<d0){d0=d;best=p;}});
      return best?Object.assign({distance:d0},best):null;
    }
    function talk(bear) {
      activeNpc=bear;clearChoices();
      status.textContent=bear.name+' is here with you.';
      const lines=dialogue[bear.name]||['“Good to see you. Stay awhile if you like.”'];
      const friend=friendship(bear.name), count=Number(friend.visits)||0;
      const line=lines[count%lines.length];
      const welcome=count?'“Good to see you again.” '+(friend.help?'“I remember '+friend.help.toLowerCase()+'. Thank you for being there.” ':''):'';
      friend.visits=count+1;
      showResponse(bear.name+': '+welcome+line);
      addMemory('Talked with '+bear.name);
      makeChoice('Ask what is happening',()=>{showResponse(bear.name+' is '+routines[bear.name][timeSlot()]+'. '+lines[(count+1)%lines.length]+' You can keep me company if you like.');addMemory('Shared a conversation with '+bear.name);});
      makeChoice('Offer a hand',()=>{const reply=bear.name==='Sammy'?'Sammy moves a plate closer. “You can eat first.”':bear.name+' smiles and lets you help for a moment. Together, the small job gets done.';friend.help='our little helping moment';showResponse(reply);addMemory('Helped '+bear.name+' for a moment');});
      makeChoice('Wave goodbye',()=>{showResponse(bear.name+' waves back. You can meet again whenever you like.');choices.replaceChildren();});
      canvas.focus({preventScroll:true});
    }
    function talkNearest() {
      const a=art.getBoundingClientRect();let best=null,d0=Infinity;
      bears.forEach((b,i)=>{const p=npcPoint(b,elapsed+i*8),d=Math.hypot((p.x-x)*a.width,(p.y-y)*a.height);if(d<d0){d0=d;best=b;}});
      if(!best)return;
      if(d0<Math.min(a.width*.12,155))talk(best);
      else walkTo(npcPoint(best,elapsed+bears.indexOf(best)*8).x,npcPoint(best,elapsed+bears.indexOf(best)*8).y,()=>talk(best),'Walking over to '+best.name+'.');
    }
    const clues=[
      {place:'bridge',line:'A thin golden strand is caught beneath one rail of Amelia and Tom’s bridge. It glimmers when the creek turns.',name:'Amelia & Tom’s Bridge'},
      {place:'square',line:'Someone has tucked a tiny paper bee beside the statue. On its wing is a penciled mark shaped like a map.',name:'Town Square & Fair'},
      {place:'bakery',line:'A floury pawprint leads away from Wally’s back door, carrying a little piece of honey bread.',name:'Wally’s Bakery'}
    ];
    function explore() {
      const clue=clues[memory.clues%clues.length];memory.clues++;save();
      status.textContent='You noticed something in Honeybrook.';
      showResponse(clue.line);choices.replaceChildren();
      makeChoice('Follow the clue',()=>{const p=places().find(v=>v.button.dataset.hbPlace===clue.place);if(p)walkTo(p.x,p.y,()=>{showResponse('You reach '+clue.name+'. The clue rests here, waiting for you to decide what it means.');addMemory('Followed a small clue to '+clue.name);},'Following the small clue toward '+clue.name+'.');});
      makeChoice('Keep a note',()=>{addMemory('Noted a clue near '+clue.name);showResponse('A note is tucked safely into your visit journal. You can follow it another time.');});
      makeChoice('Leave it for now',()=>{showResponse('The town keeps its little mystery. You are free to come back—or wander elsewhere.');});
      canvas.focus({preventScroll:true});
    }
    function activateNearest() {
      const p=nearestPlace();if(!p)return;
      if(p.distance<Math.min(W*.12,165)) activate(p);
      else walkTo(p.x,p.y,()=>activate(p),'Walking toward '+p.name+'.');
    }
    function captureClick(event) {
      if(!town.classList.contains('active'))return;
      const marker=event.target.closest && event.target.closest('.hb-world-marker');
      if(marker && art.contains(marker)) {
        if(marker.dataset.hbWalkPass==='1'){delete marker.dataset.hbWalkPass;return;}
        event.preventDefault();event.stopPropagation();
        const p=places().find(v=>v.button===marker);if(p)walkTo(p.x,p.y,()=>activate(p),'Walking to '+p.name+' before stepping inside.');
        return;
      }
      const tool=event.target.closest && event.target.closest('.hb-world-toolbar [data-hb-tool]');
      if(!tool)return;
      const kind=tool.dataset.hbTool;
      if(kind==='walk'){event.preventDefault();event.stopPropagation();clearChoices();status.textContent='Free walk';say('Click any open path, use WASD or the arrows, or choose a place marker.');canvas.focus({preventScroll:true});}
      if(kind==='characters'){event.preventDefault();event.stopPropagation();talkNearest();}
      if(kind==='interact'){event.preventDefault();event.stopPropagation();activateNearest();}
      if(kind==='explore'){event.preventDefault();event.stopPropagation();explore();}
    }
    world.addEventListener('click',captureClick,true);
    canvas.addEventListener('click',event=>{
      const r=canvas.getBoundingClientRect(),tx=(event.clientX-r.left)/r.width,ty=(event.clientY-r.top)/r.height;
      walkTo(tx,ty,()=>{status.textContent='A quiet moment in Honeybrook.';say('You pause along the path. The creek moves, neighbors pass, and nothing needs to happen next.');addMemory('Paused along a Honeybrook path');},'Walking along the path.');
    });
    canvas.addEventListener('keydown',event=>{if(event.key===' '){event.preventDefault();activateNearest();}});
    function keyName(k){return ({ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'})[k];}
    document.addEventListener('keydown',event=>{
      if(!town.classList.contains('active')||document.getElementById('hbWorldDialog')?.open)return;
      if(event.target.closest && event.target.closest('input,textarea,select,button,a,[contenteditable="true"]'))return;
      const k=keyName(event.key);if(k && (document.activeElement===canvas||art.contains(document.activeElement))){event.preventDefault();goal=null;goalDone=null;held.add(k);}
      if((event.key==='e'||event.key==='E'||event.key==='Enter')&&(document.activeElement===canvas||art.contains(document.activeElement))){event.preventDefault();activateNearest();}
    });
    document.addEventListener('keyup',event=>{const k=keyName(event.key);if(k){held.delete(k);save();}});
    function stopWalking(){held.clear();goal=null;goalDone=null;save();}
    window.addEventListener('honeybrook-visit-open',stopWalking);window.addEventListener('blur',stopWalking);window.addEventListener('pagehide',stopWalking);document.addEventListener('visibilitychange',()=>{if(document.hidden)stopWalking();});
    canvas.addEventListener('blur',()=>{held.clear();save();});
    document.getElementById('hbWorldDialog')?.addEventListener('close',()=>held.clear());
    setInterval(()=>{if(held.size||goal)save();},1000);
    pad.addEventListener('pointerdown',event=>{const b=event.target.closest('[data-walk-dir]');if(!b)return;event.preventDefault();const dir=b.dataset.walkDir;held.add(dir);goal=null;goalDone=null;b.dataset.walkDown=String(Date.now());b.setPointerCapture&&b.setPointerCapture(event.pointerId);});
    pad.addEventListener('pointerup',event=>{const b=event.target.closest('[data-walk-dir]');if(b){held.delete(b.dataset.walkDir);b.dataset.walkTap=String(Date.now()-Number(b.dataset.walkDown)<160);b.dataset.walkDown='';save();}});
    pad.addEventListener('pointercancel',event=>{const b=event.target.closest('[data-walk-dir]');if(b){held.delete(b.dataset.walkDir);save();}});
    pad.addEventListener('lostpointercapture',()=>{held.clear();save();});
    pad.addEventListener('click',event=>{const b=event.target.closest('[data-walk-dir]');if(!b)return;const a=art.getBoundingClientRect(),step=70/Math.max(a.width,a.height);if(event.detail===0||b.dataset.walkDown===undefined||b.dataset.walkTap==='true'){const dirs={up:[0,-step],down:[0,step],left:[-step,0],right:[step,0]},d=dirs[b.dataset.walkDir];if(d){x=Math.max(.025,Math.min(.975,x+d[0]));y=Math.max(.04,Math.min(.96,y+d[1]));save();}}delete b.dataset.walkTap;canvas.focus({preventScroll:true});});
    document.getElementById('hbWorldDialog')?.addEventListener('close',()=>canvas.focus({preventScroll:true}));
    window.addEventListener('resize',resize);
    if('ResizeObserver' in window)new ResizeObserver(resize).observe(art);
    document.getElementById('enterTown')?.addEventListener('click',()=>setTimeout(()=>canvas.focus({preventScroll:true}),500));
    resize();status.textContent='Your Honeybrook walk is ready.';updateHud();requestAnimationFrame(loop);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
