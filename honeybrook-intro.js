/* Source-grounded opening overview. It never completes a story scene or writes a game save. */
(()=>{'use strict';window.HoneybrookIntro=function(done){const slides=[
  [
    "The beekeepers’ little girl",
    "Before the bears called her Goldilocks, her name was Abigail Kensington. She was seven, golden-haired, and growing up among a family of beekeepers. Her mother taught her to watch a hive patiently; her father hummed while closing honey jars. On a spring journey, her mother wrapped a jar in blue-flowered cloth and put it in her satchel. They expected to come home. The river would change that ordinary family morning forever.",
    "assets/intro/goldilocks-early-life.webp",
    0
  ],
  [
    "The river takes them",
    "A sudden flood struck the road beside the river. Abigail’s father freed the horse, then became trapped by the shifting wagon. Her mother lifted Abigail onto higher ground, gave her the honey satchel, and returned to help him. For a moment they nearly escaped. Then timber struck, the bank collapsed, and the water carried both parents away. Abigail survived above them, calling their names. That night, she kept an empty place beside her under a tree.",
    "assets/intro/goldilocks-early-life.webp",
    1
  ],
  [
    "Three days beneath the trees",
    "For three days, the honey kept her alive. She tasted it one careful lick at a time, cried beneath unfamiliar trees, and walked until her legs trembled. At night, she wound her mother’s blue-flowered cloth around her hand and remembered the steady song of the hives. She carried very little, but every small thing held a memory. On the fourth day, something new reached her: the smell of porridge.",
    "assets/intro/goldilocks-early-life.webp",
    2
  ],
  [
    "The cottage with an unlatched door",
    "She followed that smell to a cottage. Inside were three bowls, a staircase, and a little bed. Hungry and exhausted, she ate and fell asleep. When the three bears returned, Papa Bear saw the empty bowls; Mama Bear saw the lost child beneath the blanket. “She stays,” Mama said. When the girl woke, there was warm water and a clean blanket. No one made her earn the welcome.",
    "assets/intro/goldilocks-early-life.webp",
    3
  ],
  [
    "Living and growing with the bears",
    "They called her Goldilocks for her golden hair. Baby Bear shared his toys and his world; Mama Bear taught her the patient rhythm of making porridge. She tended the hives, carrying her parents’ beloved work forward with her own hands. Grief did not disappear, but little by little she learned to laugh again. The cottage became her home—and its open door began drawing others who needed one.",
    "assets/story-scenes/book-01.webp",
    2
  ],
  [
    "Bear Hollow takes root",
    "Other lost bears came to the cottage, and Goldilocks welcomed them: “You’re home now.” Cabins, gardens, a square and a fountain formed Bear Hollow. One of her first friends beyond the Three Bears’ household was Missy, a cub whose family lived beside a brook. Missy loved honey and treated people lovingly. Goldilocks gave her the name Honeybrook. Missy would become the grandmother of a bear named Amelia, carrying that kindness into another generation.",
    "assets/story-scenes/book-01.webp",
    3
  ],
  [
    "The years that shaped the Hollow",
    "Goldilocks grew old after a life of beekeeping, friendship and welcome. A hard winter had taken Mama and Papa Bear; grief and ordinary love both belonged to the Hollow’s history. Later, its leaders let pride turn the principle “LOVE. Treat everybody right” into rules that excluded neighbours. Amelia Honeybrook would not accept that as love. She left rather than live under those decisions. In later years, Bear Hollow became the woodland’s senior bear community.",
    "assets/story-scenes/book-02.webp",
    0
  ],
  [
    "A broken bridge—and Honeybrook’s beginning",
    "Leaving Bear Hollow did not immediately give Amelia a home. She reached a valley in the rain with half an apple and sheltered beneath a broken wooden bridge. A strange, gentle woman’s presence felt like a guardian angel. Tom Bridgewell arrived with tools, and neighbours helped repair the crossing. Amelia asked for a path-facing door, a covered bench and water. Their welcome grew into Honeybrook, carrying the kindness behind Amelia’s family name into a town.",
    "assets/story-scenes/book-03.webp",
    1
  ],
  [
    "A welcome becomes a town",
    "The shelter became the Welcome House, offering food, rest, and room to choose a next step. Sammy arrived in his patched coat and found belonging before usefulness. The Hearthwells brought family life; Templar learned again, teachers practiced patience, and Wally baked with help from Miss Patty. Homes, classrooms, workshops, and shared tables gave Honeybrook its daily rhythm. Its neighbors kept old memories—and made room for whoever might arrive next. Long before Nell’s arrival, Honeybrook was already a flourishing town, with generations of welcome, work and shared life behind it.",
    "assets/story-scenes/book-07.webp",
    1
  ],
  [
    "Now Nell arrives",
    "Centuries after Abigail’s childhood, and long after Honeybrook had taken root and bloomed, you arrive as Nell: a British human woman, a private investigator by choice, and a beekeeper by trade. A promise to your grandfather and a goddess’s voice in a dream have brought you here. The bears see your golden hair and feel something familiar, though they do not yet know your story. Harold’s name is waiting in your mind. First, there is a town to discover: neighbors to meet, work to learn, a Fair to visit, and a Welcome House door opening for you.",
    "assets/welcome-house/welcome-house-exterior.png",
    null
  ]
];
const box=document.createElement('section');box.id='honeybrookIntro';box.setAttribute('aria-label','Honeybrook story introduction');box.innerHTML='<div class="intro-picture" aria-hidden="true"></div><div class="intro-shade"></div><div class="intro-copy" aria-live="polite"><p class="intro-eyebrow">THE HONEYBROOK CHRONICLES · A STORY BY TEMPLAR HUGHES-BRYANT</p><p id="introCount"></p><h1>Honeybrook</h1><p id="introCaption">A story of lost paths, open doors, and the courage to belong.</p><p id="introSource">The story leading to Nell’s arrival. Your Journey will uncover what the opening leaves unanswered.</p><button type="button" id="introStart">Play the introduction</button></div><nav class="intro-navigation" aria-label="Introduction playback"><button id="introPrevious" hidden>Previous scene</button><button id="introPause" hidden>Pause introduction</button><button id="introNext" hidden>Next scene</button><button id="introSkip">Skip to Honeybrook</button></nav>';document.body.append(box);let index=-1,paused=false,timer,ended=false;const picture=box.querySelector('.intro-picture'),heading=box.querySelector('h1'),caption=box.querySelector('#introCaption'),counter=box.querySelector('#introCount');
function image(src,tile){picture.replaceChildren();if(tile===null){const img=document.createElement('img');img.src=src;img.alt='';picture.append(img);}else{const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),img=document.createElementNS(ns,'image');svg.setAttribute('viewBox',`${tile%2*768} ${Math.floor(tile/2)*512} 768 512`);svg.setAttribute('preserveAspectRatio','xMidYMid slice');img.setAttribute('href',src);img.setAttribute('width','1536');img.setAttribute('height','1024');svg.append(img);picture.append(svg);}}
image(slides[9][2],slides[9][3]);
function finish(){if(ended)return;ended=true;clearTimeout(timer);try{localStorage.setItem('honeybrook_intro_seen_v1',JSON.stringify({version:1,seen:true}));}catch{}HoneybrookAudio.prelude(false);box.remove();done();}
function sceneDuration(){return Math.max(15000,Math.ceil((slides[Math.max(0,index)][1].trim().split(/\s+/).length)/3.5)*1000+2500);}
function schedule(){clearTimeout(timer);if(!paused)timer=setTimeout(()=>show(index+1),sceneDuration());}
function show(next){if(next>=slides.length){finish();return;}index=Math.max(0,next);const [title,text,src,tile]=slides[index];image(src,tile);heading.textContent=title;caption.textContent=text;counter.textContent='Scene '+(index+1)+' of '+slides.length;box.dataset.scene=String(index);box.scrollTop=0;box.querySelector('#introPrevious').disabled=index===0;box.querySelector('#introNext').textContent=index===slides.length-1?'Enter Honeybrook':'Next scene';for(const a of box.getAnimations({subtree:true}))a.cancel();picture.animate([{transform:'scale(1.02)',opacity:.5},{transform:'scale(1.09)',opacity:1}],{duration:sceneDuration(),fill:'both'});if(paused)for(const a of box.getAnimations({subtree:true}))a.pause();if(matchMedia('(prefers-reduced-motion: reduce)').matches)for(const a of box.getAnimations({subtree:true}))a.cancel();schedule();}
box.querySelector('#introStart').onclick=async()=>{await HoneybrookAudio.unlock();HoneybrookAudio.set({music:true});HoneybrookAudio.prelude(true);box.querySelector('#introStart').hidden=true;box.querySelector('#introSource').hidden=true;for(const id of ['introPrevious','introPause','introNext'])box.querySelector('#'+id).hidden=false;show(0);box.querySelector('#introPause').focus();};box.querySelector('#introSkip').onclick=finish;box.querySelector('#introNext').onclick=()=>show(index+1);box.querySelector('#introPrevious').onclick=()=>show(index-1);box.querySelector('#introPause').onclick=()=>{paused=!paused;box.querySelector('#introPause').textContent=paused?'Resume introduction':'Pause introduction';for(const a of box.getAnimations({subtree:true}))paused?a.pause():a.play();if(paused)clearTimeout(timer);else schedule();};box.querySelector('#introStart').focus();return{finish};};})();
