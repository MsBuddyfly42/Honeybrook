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
      const p=bear.path, k=(t*bear.speed)%p.length, i=Math.floor(k), q=k-i, a=p[i], b=p[(i+1)%p.length];
      return {x:a[0]+(b[0]-a[0])*q,y:a[1]+(b[1]-a[1])*q,walking:true};
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
      const line=lines[Math.floor(elapsed*1.7)%lines.length];
      showResponse(bear.name+': '+line);
      addMemory('Talked with '+bear.name);
      makeChoice('Ask what is happening',()=>{showResponse(bear.name+': '+lines[(Math.floor(elapsed*1.7)+1)%lines.length]+' The day can wait a little.');addMemory('Shared a conversation with '+bear.name);});
      makeChoice('Offer a hand',()=>{const reply=bear.name==='Sammy'?'Sammy moves a plate closer. “You can eat first.”':bear.name+' smiles and lets you help for a moment. Together, the small job gets done.';showResponse(reply);addMemory('Helped '+bear.name+' for a moment');});
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
    art.addEventListener('click',captureClick,true);
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
    pad.addEventListener('pointerup',event=>{const b=event.target.closest('[data-walk-dir]');if(b){held.delete(b.dataset.walkDir);b.dataset.walkDown='';save();}});
    pad.addEventListener('pointercancel',event=>{const b=event.target.closest('[data-walk-dir]');if(b){held.delete(b.dataset.walkDir);save();}});
    pad.addEventListener('lostpointercapture',()=>{held.clear();save();});
    pad.addEventListener('click',event=>{const b=event.target.closest('[data-walk-dir]');if(!b)return;const a=art.getBoundingClientRect(),step=70/Math.max(a.width,a.height);if(b.dataset.walkDown===undefined){const dirs={up:[0,-step],down:[0,step],left:[-step,0],right:[step,0]},d=dirs[b.dataset.walkDir];if(d){x=Math.max(.025,Math.min(.975,x+d[0]));y=Math.max(.04,Math.min(.96,y+d[1]));save();}}canvas.focus({preventScroll:true});});
    document.getElementById('hbWorldDialog')?.addEventListener('close',()=>canvas.focus({preventScroll:true}));
    window.addEventListener('resize',resize);
    if('ResizeObserver' in window)new ResizeObserver(resize).observe(art);
    document.getElementById('enterTown')?.addEventListener('click',()=>setTimeout(()=>canvas.focus({preventScroll:true}),500));
    resize();status.textContent='Your Honeybrook walk is ready.';updateHud();requestAnimationFrame(loop);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();