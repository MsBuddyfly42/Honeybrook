/* Source-grounded opening overview. It never completes a story scene or writes a game save. */
(()=>{'use strict';window.HoneybrookIntro=function(done){const slides=[
  [
    "The beekeepers’ little girl",
    "Before she was called Goldilocks, she was a seven-year-old girl growing up beside her parents’ hives. Her mother lifted honeycomb frames with sure, gentle hands. Her father hummed while tying lids onto honey jars, and their wagon smelled of warm beeswax. This was the work her family loved—the life she knew. One spring morning, her mother wrapped a jar in blue-flowered cloth and tucked it into her satchel.",
    "assets/intro/goldilocks-early-life.webp",
    0
  ],
  [
    "The river takes them",
    "Then the sky darkened, and the river rose too quickly. Through the rain came a shout. Her mother pushed the satchel into her arms and told her, “Hold tight.” The little girl held on. The water carried the rest away. In a moment, the familiar world of her parents’ voices, the wagon, and the hives was gone. She was alive—but she was alone.",
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
    "First came a lonely cub, then two orphaned brothers, and then more bears with nowhere to go. Goldilocks welcomed them as she had been welcomed: “You’re home now.” Cabins rose around the cottage. A square, a fountain, gardens, and a footbridge followed. Baby Bear helped build, Mama kept a pot warm, and Goldilocks remembered every newcomer’s loneliness. They called their growing home Bear Hollow.",
    "assets/story-scenes/book-01.webp",
    3
  ],
  [
    "The years that shaped the Hollow",
    "The years brought love and sorrow together. A hard winter took Mama and Papa Bear; when spring returned, Goldilocks and the grown Baby Bear warmed the pots and tended the bees again. Goldilocks’s hair silvered, and her welcome became part of the town’s memory. Bear Hollow’s rule was love. Yet fear sometimes closed doors that kindness had opened. Beyond its pines, travelers followed the creek toward another valley.",
    "assets/story-scenes/book-02.webp",
    0
  ],
  [
    "A broken bridge—and Honeybrook’s beginning",
    "In that valley, Amelia arrived on a stormy evening with half an apple, tired feet, and no home. A gentle woman’s reassurance helped her face another morning. Then Tom Bridgewell came with his tools. Together, with others who gathered to help, they repaired the broken wooden crossing. Amelia asked for a door facing the path, a covered bench, and water. Across that bridge, a different welcome began to grow.",
    "assets/story-scenes/book-03.webp",
    1
  ],
  [
    "A welcome becomes a town",
    "The shelter became the Welcome House, offering food, rest, and room to choose a next step. Sammy arrived in his patched coat and found belonging before usefulness. The Hearthwells brought family life; Templar learned again, teachers practiced patience, and Wally baked with help from Miss Patty. Homes, classrooms, workshops, and shared tables gave Honeybrook its daily rhythm. Its neighbors kept old memories—and made room for whoever might arrive next.",
    "assets/story-scenes/book-07.webp",
    1
  ],
  [
    "Now Nell arrives",
    "Now you arrive as Nell: a British human woman, a private investigator by choice, and a beekeeper by trade. A promise to your grandfather and a goddess’s voice in a dream have brought you here. The bears see your golden hair and feel something familiar, though they do not yet know your story. Harold’s name is waiting in your mind. First, there is a town to discover: neighbors to meet, work to learn, a Fair to visit, and a Welcome House door opening for you.",
    "assets/welcome-house/welcome-house-exterior.png",
    null
  ]
];
const box=document.createElement('section');box.id='honeybrookIntro';box.setAttribute('aria-label','Honeybrook story introduction');box.innerHTML='<div class="intro-picture" aria-hidden="true"></div><div class="intro-shade"></div><div class="intro-copy" aria-live="polite"><p class="intro-eyebrow">THE HONEYBROOK CHRONICLES · A STORY BY TEMPLAR HUGHES-BRYANT</p><p id="introCount"></p><h1>Honeybrook</h1><p id="introCaption">A story of lost paths, open doors, and the courage to belong.</p><p id="introSource">A brief overview of Book One, followed by Nell’s game adaptation. Discover the full story inside Honeybrook.</p><button type="button" id="introStart">Play the introduction</button></div><nav class="intro-navigation" aria-label="Introduction playback"><button id="introPrevious" hidden>Previous scene</button><button id="introPause" hidden>Pause introduction</button><button id="introNext" hidden>Next scene</button><button id="introSkip">Skip to Honeybrook</button></nav>';document.body.append(box);let index=-1,paused=false,timer,ended=false;const picture=box.querySelector('.intro-picture'),heading=box.querySelector('h1'),caption=box.querySelector('#introCaption'),counter=box.querySelector('#introCount');
function image(src,tile){picture.replaceChildren();if(tile===null){const img=document.createElement('img');img.src=src;img.alt='';picture.append(img);}else{const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),img=document.createElementNS(ns,'image');svg.setAttribute('viewBox',`${tile%2*768} ${Math.floor(tile/2)*512} 768 512`);svg.setAttribute('preserveAspectRatio','xMidYMid slice');img.setAttribute('href',src);img.setAttribute('width','1536');img.setAttribute('height','1024');svg.append(img);picture.append(svg);}}
image(slides[9][2],slides[9][3]);
function finish(){if(ended)return;ended=true;clearTimeout(timer);try{localStorage.setItem('honeybrook_intro_seen_v1',JSON.stringify({version:1,seen:true}));}catch{}HoneybrookAudio.prelude(false);box.remove();done();}
function sceneDuration(){return Math.max(15000,Math.ceil((slides[Math.max(0,index)][1].trim().split(/\s+/).length)/3.5)*1000+2500);}
function schedule(){clearTimeout(timer);if(!paused)timer=setTimeout(()=>show(index+1),sceneDuration());}
function show(next){if(next>=slides.length){finish();return;}index=Math.max(0,next);const [title,text,src,tile]=slides[index];image(src,tile);heading.textContent=title;caption.textContent=text;counter.textContent='Scene '+(index+1)+' of '+slides.length;box.dataset.scene=String(index);box.scrollTop=0;box.querySelector('#introPrevious').disabled=index===0;box.querySelector('#introNext').textContent=index===slides.length-1?'Enter Honeybrook':'Next scene';for(const a of box.getAnimations({subtree:true}))a.cancel();picture.animate([{transform:'scale(1.02)',opacity:.5},{transform:'scale(1.09)',opacity:1}],{duration:sceneDuration(),fill:'both'});if(paused)for(const a of box.getAnimations({subtree:true}))a.pause();if(matchMedia('(prefers-reduced-motion: reduce)').matches)for(const a of box.getAnimations({subtree:true}))a.cancel();schedule();}
box.querySelector('#introStart').onclick=async()=>{await HoneybrookAudio.unlock();HoneybrookAudio.set({music:true});HoneybrookAudio.prelude(true);box.querySelector('#introStart').hidden=true;box.querySelector('#introSource').hidden=true;for(const id of ['introPrevious','introPause','introNext'])box.querySelector('#'+id).hidden=false;show(0);box.querySelector('#introPause').focus();};box.querySelector('#introSkip').onclick=finish;box.querySelector('#introNext').onclick=()=>show(index+1);box.querySelector('#introPrevious').onclick=()=>show(index-1);box.querySelector('#introPause').onclick=()=>{paused=!paused;box.querySelector('#introPause').textContent=paused?'Resume introduction':'Pause introduction';for(const a of box.getAnimations({subtree:true}))paused?a.pause():a.play();if(paused)clearTimeout(timer);else schedule();};box.querySelector('#introStart').focus();return{finish};};})();
