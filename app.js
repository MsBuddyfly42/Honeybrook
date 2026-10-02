const places=[
{id:'woods',name:'Northern Woods',icon:'🌲',zone:'mystery',desc:'The maintained trail ends here. Beyond it, Honeybrook’s oldest mysteries begin.',detail:'Official maps become incomplete beyond the ranger sign. An ancient bridge, disputed Three Bears history and ruins older than Honeybrook wait deeper inside.',locked:true},
{id:'outskirts',name:'Honeybrook Outskirts',icon:'🌾',zone:'north',desc:'Farms, orchards, barns and covered bridges.',detail:'Country roads wind past orchards, old barns, creek branches and the old mill.'},
{id:'scholars',name:"Scholars’ Quarter",icon:'📚',zone:'north',desc:'School, library, technology and lifelong learning.',detail:'Home to Honeybrook School, Professor Bear’s Learning Hall, the Library, Learning Commons, Technology Center and Achievement Center.'},
{id:'harmony',name:'Harmony Hill',icon:'🎤',zone:'east',desc:'Music, art, dance and performance.',detail:'Harmony Hall anchors a lively hill of rehearsal rooms, art studios and outdoor performances.'},
{id:'square',name:'Town Square',icon:'🏛️',zone:'center',desc:'The civic heart of Honeybrook.',detail:'Town Hall, the town clock, Gazette, Post Office and the Goldilocks & Three Bears Monument surround the plaza.'},
{id:'main',name:'Main Street',icon:'🛍️',zone:'east',desc:'Shops, cafés and bear-owned businesses.',detail:'BEARcessities, The Honey Mug Café, Cub Cakes & Crumbs, Paws & Threads and many more line Main Street.'},
{id:'care',name:'Care District',icon:'🏥',zone:'west',desc:'Health, wellness and community care.',detail:'Honeybrook’s clinic, dental care, wellness services and emergency support are centered here.'},
{id:'welcome',name:'Welcome House',icon:'🧳',zone:'west',desc:'Every newcomer starts with a place to land.',detail:'Run by the Welcome Wagon Bears: warm meals, temporary rooms, supplies, guidance and absolutely no requirement to have life figured out.'},
{id:'play',name:'Play & Entertainment',icon:'🎡',zone:'east',desc:'Games, skating, movies, sports and fun.',detail:'Game Show Studio, Honeybrook Theater, Rollin’ Bears Skate Palace, arcade, bowling, mini golf, pool and BearFit Gym.'},
{id:'park',name:'Community Park',icon:'🌳',zone:'south',desc:'Playgrounds, picnics, gardens and little bridges.',detail:'A broad green space for everyday life, outdoor movies, food carts, community cookouts and seasonal events.'},
{id:'bridgeview',name:'Bridgeview',icon:'🏡',zone:'south',desc:'Honeybrook’s oldest residential neighborhood.',detail:'Porches, cottages, Bridgeview Commons, the Hearthwells, Big Mama and generations of “Pull up a paw.”'},
{id:'faith',name:'Faith & Reflection',icon:'⛪',zone:'south',desc:'Worship, reflection, outreach and quiet.',detail:'A church, reflection garden and community outreach spaces welcome residents while the town itself remains open to every bear.'}
];
const residents=[['Amelia Honeybrook','Founder Bear'],['Tom Bridgewell','Builder Bear'],['Sammy Patchwell','First Bear Welcomed Home'],['Professor Theodore Honeywell','Professor Bear'],['Templar Hearthwell','First Techie Bear & Entrepreneur'],['John “Buddy” Hearthwell','Community Protector'],['Big Mama Mary','Matriarch'],['Jonesha Hearthwell','Adventurer'],['Ja’Mya Hearthwell','Dependable Helper'],['Jamon Hearthwell','Quiet Protector'],['Robin Hearthwell','Wild Card & Singer'],['Rheanna Hearthwell','Superstar'],['Lena Hearthwell','Honeybrook’s Light'],['Lance “Lil Bruh” Hearthwell','Gamer Cub'],['Landis Hearthwell','Dino Cub'],['Landric Hearthwell','The Baby'],['Wally Crumbwell','Baker Bear'],['Miss Patty Peaches','Café Bear'],['Ernest Grumblepaw','Retired Complainer'],['Daisy Bellweather','Undecided Bear'],['Marcus Gearpaw','Mechanic Bear'],['Rosa Honeyfield','Bridgeview Neighbor'],['Harold Pawst','Mail Bear'],['Benny Scoops','Ice-Cream Bear'],['Mabel Welcomeberry','Welcome House Director'],['Toby Trailpaw','Welcome Wagon Guide'],['Nora Kindpaw','Youth Welcome Bear'],['Calvin Stillwater','Transition Bear']];
const roles=['Visitor','Narrator','Amelia Honeybrook','Templar Hearthwell','Buddy Hearthwell','Big Mama Mary','Sammy Patchwell','Professor Honeywell','Jonesha Hearthwell','Robin Hearthwell','Lance Hearthwell','Landis Hearthwell','Landric Hearthwell'];
const bearWords=[['BEARilliant','Brilliant; wonderfully done.'],['BEARable','Pleasant or manageable.'],['UnBEARable','Intolerable—Ernest Grumblepaw’s favorite word.'],['Cubbing','Joking or kidding.'],['No cub!','No joke; seriously.'],['Pull up a paw','Come sit with us; you’re welcome here.'],['Give me a paw','Help me out.'],['Pawcorn','Honeybrook popcorn.'],['BEARcessities','The things a bear needs—and a Main Street store.'],['BEARfect','Perfect, Honeybrook-style.']];
let role='Visitor';
const $=s=>document.querySelector(s); const modal=$('#modal'), modalContent=$('#modalContent');
function season(){let m=new Date().getMonth()+1;if([12,1,2].includes(m))return['❄️','Winter','Warm lights, cocoa and cozy gatherings'];if([3,4,5].includes(m))return['🌷','Spring','Bridges, blossoms and fresh beginnings'];if([6,7,8].includes(m))return['☀️','Summer','Outdoor movies, music and park days'];return['🍂','Autumn','Harvest treats, changing leaves and festival season']}
function formatDate(){return new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'})}
function init(){ $('#welcomeDate').textContent=formatDate(); $('#dateNow').textContent=formatDate();let s=season();$('#seasonIcon').textContent=s[0];$('#seasonText').textContent=s[2];$('#seasonLabel').textContent=`${s[1].toUpperCase()} IN HONEYBROOK`;renderLivingMap();renderLifeStrip();renderMap();renderNav() }

const mapPositions={
woods:['42%','3%'],outskirts:['16%','13%'],scholars:['64%','17%'],harmony:['79%','31%'],square:['42%','34%'],main:['68%','45%'],care:['17%','42%'],welcome:['8%','60%'],play:['75%','61%'],park:['43%','62%'],bridgeview:['25%','76%'],faith:['57%','80%']
};
function renderLivingMap(){
 const lm=$('#livingMap');
 lm.innerHTML=`<div class="map-title-sign"><b>🗺️ Honeybrook</b><small>There's a place for every bear.</small></div>
 <span class="road-label" style="left:7%;bottom:11%">WELCOME ROAD</span>
 <span class="road-label" style="right:8%;top:52%">MAIN STREET</span>
 <span class="bridge-mark" style="left:44%;top:27%">🌉</span><span class="bridge-mark" style="left:48%;top:51%">🌉</span><span class="bridge-mark" style="left:43%;bottom:13%">🌉</span>
 <span class="tree" style="left:3%;top:9%">🌲</span><span class="tree" style="right:4%;top:8%">🌲</span><span class="tree" style="left:3%;bottom:4%">🌳</span><span class="tree" style="right:3%;bottom:5%">🌳</span>`+
 places.map(p=>{let pos=mapPositions[p.id];return `<button class="town-spot ${p.locked?'locked':''}" style="left:${pos[0]};top:${pos[1]}" data-map-id="${p.id}"><span class="spot-icon">${p.icon}</span><b>${p.name}</b><small>${p.locked?'Discovery required':p.desc}</small></button>`}).join('');
 document.querySelectorAll('[data-map-id]').forEach(b=>b.onclick=()=>openPlace(b.dataset.mapId));
}
function renderLifeStrip(){
 const s=season();
 const items=[['🔔','Around Town','Benny Scoops’ bell has already been heard near the park.'],['📬','Bridgeview','Harold Pawst is making his neighborhood route.'],['☕','Main Street','The Honey Mug is serving breakfast and unsolicited updates.'],[s[0],`${s[1]} Life`,s[2]+'.']];
 $('#lifeStrip').innerHTML=items.map(x=>`<div class="life-card"><b>${x[0]} ${x[1]}</b><small>${x[2]}</small></div>`).join('');
}

function renderMap(){ $('#map').innerHTML=places.map(p=>`<button class="place ${p.zone}" data-id="${p.id}"><span class="icon">${p.icon}</span><b>${p.name}</b><small>${p.desc}${p.locked?' 🔒':''}</small></button>`).join('');document.querySelectorAll('.place').forEach(b=>b.onclick=()=>openPlace(b.dataset.id))}
function renderNav(){ $('#nav').innerHTML=places.map(p=>`<button class="nav-btn" data-id="${p.id}">${p.icon} ${p.name}</button>`).join('')+`<button class="nav-btn" id="residentsBtn">🧸 Residents</button>`;document.querySelectorAll('.nav-btn[data-id]').forEach(b=>b.onclick=()=>openPlace(b.dataset.id));$('#residentsBtn').onclick=showResidents}
function openPlace(id){let p=places.find(x=>x.id===id);$('#locationTitle').textContent=`${p.icon} ${p.name}`;$('#locationDesc').textContent=p.detail;$('#map').classList.add('hidden');$('#livingMap').classList.add('hidden');$('#lifeStrip').classList.add('hidden');document.querySelector('.map-legend').classList.add('hidden');document.querySelector('.district-list-heading').classList.add('hidden');let c=$('#content');c.classList.remove('hidden');if(p.locked){c.innerHTML=`<h3>🌲 UNKNOWN TERRITORY</h3><p>The maintained Honeybrook trail ends ahead.</p><div class="card"><h4>Ranger Notice</h4><p><b>Travel beyond this point is at your own risk.</b><br>Honeybrook Rangers recommend returning before nightfall.</p></div><p>🔒 Deeper locations have not been discovered yet. Clues found elsewhere in Honeybrook will eventually unlock them.</p>`}else{c.innerHTML=`<span class="tag">${p.zone.toUpperCase()} DISTRICT</span><h3>Welcome to ${p.name}</h3><p>${p.detail}</p><div class="cards"><div class="card"><h4>What’s happening?</h4><p>${activityFor(id)}</p></div><div class="card"><h4>While playing as ${role}</h4><p>${roleLine(id)}</p></div><div class="card"><h4>Honeybrook Note</h4><p>${noteFor(id)}</p></div></div><div class="district-actions"><button class="primary inline-primary" data-show-destinations="${id}">Explore places inside ${p.name} →</button></div>`}}

const destinations={
 square:[['Town Hall','🏛️','Civic meetings, records and town business.'],['Goldilocks & Three Bears Monument','🐻','Honeybrook’s most famous heritage landmark.'],['Honeybrook Gazette','📰','Town news, notices and local stories.'],['Honeybrook Post Office','📬','Harold Pawst’s home base.']],
 main:[['The Honey Mug Café','☕','Miss Patty serves breakfast, coffee and entirely too much information.'],['BEARcessities','🧺','Everyday groceries, toiletries, school supplies and household basics.'],['Cub Cakes & Crumbs','🧁','Wally Crumbwell’s bakery and frequent profit-margin emergency.'],['Paws & Threads','👕','Clothing, Cubwear and Grizzly Gear.'],['Honeybrook Business Center','💼','Practical help for entrepreneurs, records, pricing and business learning.'],['Honeybrook Market','🥕','Groceries, produce and local farm goods.']],
 scholars:[['Honeybrook School','🏫','The town’s main school for cubs.'],["Professor Bear’s Learning Hall",'🎓','Lessons and tutoring for learners of every age.'],['Honeybrook Library','📚','Stories, research, archives and suspiciously old books.'],['Honeybrook Technology Center','💻','Computer learning, technology practice and the legacy of the First Techie Bear.'],['Learning Commons','✏️','Open learning space for the whole community.'],['Achievement Center','🏅','Goal-setting, graduation and continuing education support.']],
 bridgeview:[['Hearthwell House','🏠','A large, lively family home where there is almost always another project happening.'],["Big Mama’s Cottage",'🪑','Porch headquarters. Somebody’s cub is being watched.'],['Bridgeview Commons','🌳','Playground, court, grills, picnic tables and neighborhood green.'],['Community Garden','🌻','Shared growing space and neighborhood gathering place.'],['Old Bridgeview Bridge','🌉','One of the neighborhood’s oldest crossings.']],
 welcome:[['The Welcome House','🏡','Temporary rooms, warm meals, supplies and a place to land.'],['Welcome Wagon Yard','🛻','Home base for Honeybrook’s recognizable newcomer wagon.'],['Newcomer Porch','🪑','A quiet place to sit before deciding what comes next.']],
 harmony:[['Harmony Hall','🎭','Honeybrook’s primary performance venue.'],['Music Rooms','🎵','Lessons, rehearsals and vocal practice.'],['Art Studios','🎨','Painting, crafts and community workshops.'],['Outdoor Stage','🎤','Open-air concerts and seasonal performances.']],
 play:[['Gamer Bear’s Game Show Studio','🎮','Educational competitions, challenges and game-show rounds.'],['Honeybrook Theater','🎬','Movies beneath an old-fashioned marquee.'],["Rollin’ Bears Skate Palace",'🛼','Open skate, parties and couples skate.'],['Honeybrook Lanes','🎳','Bowling for families and leagues.'],['BearFit Gym','💪','Fitness and recreation.'],['Honeybrook Arcade','🕹️','Games, tickets and friendly competition.']],
 park:[['Central Playground','🛝','A busy play area for Honeybrook cubs.'],['Picnic Meadow','🧺','Cookouts, blankets and unscheduled community time.'],['Garden Walk','🌷','Flowers, ponds and several small unnamed bridges.'],['Outdoor Movie Lawn','🎞️','Seasonal evening movies under the stars.'],['Food Cart Loop','🍦','Rotating Pawcorn, ice cream, lemonade and seasonal treats.']],
 care:[['Honeybrook Clinic','🩺','Everyday medical care.'],['Dental Center','🦷','Routine dental care for residents.'],['Wellness Center','❤️','Community wellness and support services.'],['Emergency Station','🚑','Preparedness and emergency response.']],
 outskirts:[['Honeybrook Orchards','🍎','Fruit trees and seasonal farm stands.'],['Old Mill Road','⚙️','A country road leading toward Honeybrook’s old mill.'],['Covered Bridge','🌉','A rural crossing on the outskirts.'],['Farm Market','🌽','Local produce and goods from nearby farms.']],
 faith:[['Honeybrook Church','⛪','Worship, gatherings and community outreach.'],['Reflection Garden','🕊️','A peaceful space open for quiet reflection.'],['Outreach Hall','🤝','Food drives, charity work and neighborhood support.']]
};
function destinationActivity(name){
 const lines={
 'The Honey Mug Café':'Miss Patty has a fresh pot going. Sit down long enough and you may leave knowing more than you intended.',
 'Cub Cakes & Crumbs':'Wally is glazing Honey Buns and has probably given somebody a free pastry already.',
 'BEARcessities':'Residents are picking up ordinary supplies; seasonal displays change throughout the year.',
 'Honeybrook Library':'Storytime, research and town archives share space here. Some records hint at older Honeybrook stories.',
 'Honeybrook Technology Center':'Practice stations are open. Honeybrook’s rule applies here: if you forgot it, you can learn it again.',
 'Hearthwell House':'The house is busy. Templar has an idea. Buddy has concerns. Landric has misplaced something.',
 "Big Mama’s Cottage":'The porch is occupied. Approach respectfully—and be prepared to answer where you are going.',
 'Gamer Bear’s Game Show Studio':'The scoreboard is lit and a new round is preparing to start.',
 'Harmony Hall':'A rehearsal can be heard from backstage.',
 'The Welcome House':'A newcomer can eat, rest and get oriented before making any decisions.',
 'Goldilocks & Three Bears Monument':'Visitors stop here to read the inscription and debate how much of the familiar story is true.'
 };
 return lines[name]||'This destination is open as part of Honeybrook’s everyday town life.';
}
function renderDestinations(id,p){
 const list=destinations[id]||[];
 if(!list.length)return `<div class="card"><h4>Foundation Ready</h4><p>${activityFor(id)}</p><p class="soft-note">Detailed destinations for this area will be added as Honeybrook expands.</p></div>`;
 return `<div class="destination-head"><div><span class="tag">${p.zone.toUpperCase()} DISTRICT</span><h3>Places inside ${p.name}</h3><p>Select a destination. These become the future doors, rooms and interactive scenes of Honeybrook.</p></div><button class="small-action" data-back-district="${id}">← District overview</button></div><div class="destination-grid">${list.map((d,i)=>`<button class="destination-card" data-district="${id}" data-destination="${i}"><span>${d[1]}</span><b>${d[0]}</b><small>${d[2]}</small></button>`).join('')}</div>`;
}
function openDestination(id,index){
 const p=places.find(x=>x.id===id),d=(destinations[id]||[])[Number(index)]; if(!d)return;
 $('#locationTitle').textContent=`${d[1]} ${d[0]}`; $('#locationDesc').textContent=d[2];
 $('#content').innerHTML=`<button class="small-action" data-show-destinations="${id}">← All ${p.name} destinations</button><div class="interior-foundation"><div class="interior-sign">${d[1]}<small>INTERIOR FOUNDATION</small></div><div><span class="tag">${p.name}</span><h3>${d[0]}</h3><p>${d[2]}</p><div class="cards"><div class="card"><h4>What’s happening here?</h4><p>${destinationActivity(d[0])}</p></div><div class="card"><h4>Your role: ${role}</h4><p>${roleLine(id)}</p></div><div class="card"><h4>Future interaction slot</h4><p>This location now has its own address in Honeybrook’s data structure. Later it can receive rooms, characters, tasks, dialogue, games, inventory or story events without rebuilding the district.</p></div></div></div></div>`;
}
function activityFor(id){let a={square:'The community board is being updated while bears cross the plaza beneath the town clock.',main:'Shops are open and a Pawcorn cart has appeared near the corner.',scholars:'Classes, library visits and technology practice are underway.',bridgeview:'Porches are occupied, cubs are outside, and Big Mama has already asked where somebody is going.',park:'Benny Scoops is somewhere nearby. Parents have heard the bell.',harmony:'Rehearsal rooms are active and somebody is warming up on the outdoor stage.',play:'The game studio scoreboard is lit and the roller rink is preparing for open skate.',welcome:'The Welcome Wagon is parked outside. A new arrival may be checking in.',outskirts:'Farm stands are open along the country road.',care:'The district is operating on its normal community-care schedule.',faith:'The reflection garden is open for quiet visits.'};return a[id]||'Honeybrook is moving through an ordinary day.'}
function roleLine(id){if(role==='Narrator')return `You may describe the scene, introduce a resident, or move the story from ${places.find(x=>x.id===id)?.name||'here'} to another part of town.`;if(role.includes('Big Mama'))return 'You notice who is outside, who looks hungry, and which cub is somewhere they probably should not be.';if(role.includes('Templar'))return 'You immediately notice three things that could be improved and accidentally invent another project.';if(role.includes('Buddy'))return 'You check whether everything is safe, practical and—most importantly—whether Templar has started another project.';if(role.includes('Jonesha'))return id==='woods'?'That warning sign is doing very little to discourage you.':'You wonder whether anything interesting is happening closer to the woods.';if(role.includes('Landric'))return 'Everything is enormous. Snacks remain the highest priority.';return `Explore ${places.find(x=>x.id===id)?.name||'Honeybrook'} and see what the town reveals.`}
function noteFor(id){let n={bridgeview:'Old Bridgeview saying: “Pull up a paw.”',square:'The Goldilocks & Three Bears monument honors a story Honeybrook believes is older—and stranger—than the familiar tale.',main:'Bear-Speak appears naturally on signs and products, but Honeybrook does not replace every word with “bear.”',scholars:'Honeybrook tradition: nobody ages out of learning.',welcome:'You do not have to bring anything but yourself.',woods:'The woods are old, not automatically evil.'};return n[id]||'There’s a place for every bear.'}
function showResidents(){ $('#locationTitle').textContent='🧸 Honeybrook Residents';$('#locationDesc').textContent='Founders, families, workers, newcomers and ordinary neighbors make the town alive.';$('#map').classList.add('hidden');$('#livingMap').classList.add('hidden');$('#lifeStrip').classList.add('hidden');document.querySelector('.map-legend').classList.add('hidden');document.querySelector('.district-list-heading').classList.add('hidden');let c=$('#content');c.classList.remove('hidden');c.innerHTML=`<div class="cards">${residents.map(r=>`<div class="card"><h4>${r[0]}</h4><span class="tag">${r[1]}</span></div>`).join('')}</div>`}
function showModal(html){modalContent.innerHTML=html;modal.classList.remove('hidden')}
$('#enterBtn').onclick=()=>{$('#welcome').classList.remove('active');$('#town').classList.add('active')};$('#homeBtn').onclick=()=>{$('#locationTitle').textContent='Honeybrook Town Map';$('#locationDesc').textContent='Choose a place to explore. Honeybrook Creek winds through town, joining neighborhoods, businesses, parks and stories by bridge.';$('#content').classList.add('hidden');$('#map').classList.remove('hidden');$('#livingMap').classList.remove('hidden');$('#lifeStrip').classList.remove('hidden');document.querySelector('.map-legend').classList.remove('hidden');document.querySelector('.district-list-heading').classList.remove('hidden')};
$('#roleBtn').onclick=()=>showModal(`<h2>🎭 Who Are You Today?</h2><p>Switch perspective without leaving Honeybrook.</p><div class="role-grid">${roles.map(r=>`<button class="role-option" data-role="${r}"><b>${r}</b><br><small>${r==='Narrator'?'Guide the story and move between scenes.':r==='Visitor'?'Explore Honeybrook as yourself.':'Experience town from this character’s perspective.'}</small></button>`).join('')}</div>`);
modal.addEventListener('click',e=>{let b=e.target.closest('[data-role]');if(b){role=b.dataset.role;$('#roleBtn').textContent=`🎭 ${role} Mode`;$('#footerRole').textContent=role;modal.classList.add('hidden')}});
$('#todayBtn').onclick=()=>{let s=season();showModal(`<h2>📅 Today in Honeybrook</h2><p><b>${formatDate()}</b> · ${s[1]}</p><div class="event">🏛️ <b>Town Square</b><br>Community board and everyday town activity.</div><div class="event">☕ <b>Honey Mug Café</b><br>Miss Patty is serving breakfast—and receiving information she did not ask for.</div><div class="event">🌳 <b>Community Park</b><br>Open recreation and rotating food carts.</div><div class="event">📚 <b>Scholars’ Quarter</b><br>Learning spaces are open to bears of every age.</div><div class="event">🌲 <b>Northern Woods</b><br>Ranger advisory remains in effect beyond the maintained trail.</div>`)};

document.addEventListener('click',e=>{
 let show=e.target.closest('[data-show-destinations]'); if(show){let id=show.dataset.showDestinations,p=places.find(x=>x.id===id);$('#locationTitle').textContent=`${p.icon} ${p.name}`;$('#locationDesc').textContent=p.detail;$('#content').innerHTML=renderDestinations(id,p);return}
 let dest=e.target.closest('[data-destination]'); if(dest){openDestination(dest.dataset.district,dest.dataset.destination);return}
 let back=e.target.closest('[data-back-district]'); if(back){openPlace(back.dataset.backDistrict);return}
});
$('#bearBtn').onclick=()=>showModal(`<h2>📖 Honeybrook Beartionary</h2><p>Local words and expressions heard around town.</p>${bearWords.map(w=>`<div class="event"><b>${w[0]}</b><br>${w[1]}</div>`).join('')}`);$('#closeModal').onclick=()=>modal.classList.add('hidden');modal.onclick=e=>{if(e.target===modal)modal.classList.add('hidden')};init();

// ---- Phase 4: Social & encounter foundation ----
const socialProfiles={
'Amelia Honeybrook':{home:'Founder’s Cottage',base:'Town Square',circle:['Tom Bridgewell','Sammy Patchwell','Professor Theodore Honeywell'],traits:['welcoming','observant','steady'],greeting:'If you need a place, we’ll make one.'},
'Tom Bridgewell':{home:'Old Bridgeview',base:'Honeybrook Works Yard',circle:['Amelia Honeybrook','John “Buddy” Hearthwell','Sammy Patchwell'],traits:['practical','loyal','craftsman'],greeting:'Build it strong enough for bears you’ll never meet.'},
'Sammy Patchwell':{home:'Bridgeview',base:'Welcome House',circle:['Amelia Honeybrook','Mabel Welcomeberry','Calvin Stillwater'],traits:['quiet','empathetic','watchful'],greeting:'You can sit here if you want. You don’t have to talk.'},
'Professor Theodore Honeywell':{home:'Scholars’ Quarter',base:'Professor Bear’s Learning Hall',circle:['Templar Hearthwell','Sammy Patchwell','Lena Hearthwell'],traits:['proper','curious','adaptable'],greeting:'We shall begin with what you know, not what you do not.'},
'Templar Hearthwell':{home:'Hearthwell House',base:'Honeybrook Technology Center',circle:['John “Buddy” Hearthwell','Big Mama Mary','Professor Theodore Honeywell'],traits:['inventive','curious','ambitious'],greeting:'Okay, hear me out—I just thought of something.'},
'John “Buddy” Hearthwell':{home:'Hearthwell House',base:'Bridgeview',circle:['Templar Hearthwell','Tom Bridgewell','Jamon Hearthwell'],traits:['steady','protective','practical'],greeting:'Baby…what did you start now?'},
'Big Mama Mary':{home:'Big Mama’s Cottage',base:'Bridgeview Commons',circle:['Templar Hearthwell','Miss Patty Peaches','Lena Hearthwell'],traits:['maternal','direct','watchful'],greeting:'Come on up here and pull up a paw.'},
'Jonesha Hearthwell':{home:'Hearthwell House',base:'Honeybrook Outskirts',circle:['Ja’Mya Hearthwell','Robin Hearthwell','Rheanna Hearthwell'],traits:['adventurous','gritty','smart'],greeting:'So…how far exactly did they say we’re NOT supposed to go?'},
'Ja’Mya Hearthwell':{home:'Hearthwell House',base:'Main Street',circle:['Jonesha Hearthwell','Jamon Hearthwell','Rheanna Hearthwell'],traits:['caring','dependable','hardworking'],greeting:'What needs doing?'},
'Jamon Hearthwell':{home:'Hearthwell House',base:'Bridgeview',circle:['John “Buddy” Hearthwell','Lance “Lil Bruh” Hearthwell','Landis Hearthwell'],traits:['quiet','loyal','protective'],greeting:'I’m good. Everybody else good?'},
'Robin Hearthwell':{home:'Hearthwell House',base:'Harmony Hall',circle:['Jonesha Hearthwell','Rheanna Hearthwell','Lance “Lil Bruh” Hearthwell'],traits:['bold','musical','unpredictable'],greeting:'Who said I was in trouble? …Okay, what did they tell you?'},
'Rheanna Hearthwell':{home:'Hearthwell House',base:'Scholars’ Quarter',circle:['Robin Hearthwell','Ja’Mya Hearthwell','Daisy Bellweather'],traits:['bright','athletic','social'],greeting:'I got it. Probably.'},
'Lena Hearthwell':{home:'Hearthwell House',base:'Bridgeview',circle:['Templar Hearthwell','Big Mama Mary','Professor Theodore Honeywell'],traits:['joyful','connected','beloved'],greeting:'A bright smile answers the familiar voice nearby.'},
'Lance “Lil Bruh” Hearthwell':{home:'Hearthwell House',base:'Gamer Bear’s Game Show Studio',circle:['Landis Hearthwell','Jamon Hearthwell','Landric Hearthwell'],traits:['goofy','competitive','playful'],greeting:'Landis cheated. I’m just telling you now.'},
'Landis Hearthwell':{home:'Hearthwell House',base:'Game & Arcade Center',circle:['Lance “Lil Bruh” Hearthwell','Landric Hearthwell','Templar Hearthwell'],traits:['strong-willed','musical','dinosaur-obsessed'],greeting:'I did NOT lose. The game was wrong.'},
'Landric Hearthwell':{home:'Hearthwell House',base:'Wherever the snacks are',circle:['Templar Hearthwell','Lance “Lil Bruh” Hearthwell','Landis Hearthwell'],traits:['three','busy','the baby'],greeting:'Snack?'},
'Wally Crumbwell':{home:'Bridgeview',base:'Cub Cakes & Crumbs',circle:['Miss Patty Peaches','Benny Scoops','Daisy Bellweather'],traits:['generous','messy','cheerful'],greeting:'Try this! No, no—don’t worry about paying.'},
'Miss Patty Peaches':{home:'Bridgeview',base:'The Honey Mug Café',circle:['Big Mama Mary','Wally Crumbwell','Harold Pawst'],traits:['caring','talkative','informed'],greeting:'Sit down, honey. Now…you didn’t hear this from me.'},
'Ernest Grumblepaw':{home:'Bridgeview Creek Cottage',base:'Bridgeview',circle:['Big Mama Mary','Harold Pawst','Benny Scoops'],traits:['grumpy','reliable','soft-hearted'],greeting:'What do you want? And wipe your paws first.'},
'Daisy Bellweather':{home:'Bridgeview Apartments',base:'The Honey Mug Café',circle:['Rheanna Hearthwell','Miss Patty Peaches','Wally Crumbwell'],traits:['uncertain','curious','young'],greeting:'I’m still figuring it out. Is that allowed?'},
'Marcus Gearpaw':{home:'South Bridgeview',base:'Paws & Pistons Garage',circle:['Tom Bridgewell','John “Buddy” Hearthwell','Harold Pawst'],traits:['quiet','skilled','content'],greeting:'I can look at it tomorrow. I’m going fishing.'},
'Rosa Honeyfield':{home:'Bridgeview Apartments',base:'Bridgeview',circle:['Mabel Welcomeberry','Big Mama Mary','Daisy Bellweather'],traits:['resilient','caring','independent'],greeting:'We’re doing okay. Better than okay, actually.'},
'Harold Pawst':{home:'Bridgeview',base:'Honeybrook Post Office',circle:['Miss Patty Peaches','Ernest Grumblepaw','Marcus Gearpaw'],traits:['patient','private','dependable'],greeting:'I deliver MAIL. …Fine. What’s the message?'},
'Benny Scoops':{home:'Main Street Flats',base:'BEARy Cold Ice Cream Cart',circle:['Wally Crumbwell','Ernest Grumblepaw','Lance “Lil Bruh” Hearthwell'],traits:['friendly','mobile','popular'],greeting:'You heard the bell. What’ll it be?'},
'Mabel Welcomeberry':{home:'Welcome House Residence',base:'Welcome House',circle:['Sammy Patchwell','Nora Kindpaw','Calvin Stillwater'],traits:['calm','warm','organized'],greeting:'First things first: are you hungry?'},
'Toby Trailpaw':{home:'West Honeybrook',base:'Welcome Wagon',circle:['Mabel Welcomeberry','Nora Kindpaw','Harold Pawst'],traits:['upbeat','chatty','helpful'],greeting:'Welcome to Honeybrook! I can give you the short tour or the seventeen-hour tour.'},
'Nora Kindpaw':{home:'West Honeybrook',base:'Welcome House',circle:['Mabel Welcomeberry','Calvin Stillwater','Daisy Bellweather'],traits:['patient','youthful','supportive'],greeting:'You don’t have to decide anything today.'},
'Calvin Stillwater':{home:'West Honeybrook',base:'Welcome House Porch',circle:['Sammy Patchwell','Mabel Welcomeberry','Nora Kindpaw'],traits:['quiet','patient','grounded'],greeting:'Take your time. I’ll be right here.'}
};
const placePeople={
 square:['Amelia Honeybrook','Harold Pawst'],main:['Miss Patty Peaches','Wally Crumbwell','Daisy Bellweather','Harold Pawst'],scholars:['Professor Theodore Honeywell','Templar Hearthwell','Rheanna Hearthwell'],harmony:['Robin Hearthwell'],bridgeview:['Big Mama Mary','John “Buddy” Hearthwell','Lena Hearthwell','Jamon Hearthwell','Ernest Grumblepaw','Rosa Honeyfield'],park:['Benny Scoops','Landric Hearthwell'],play:['Lance “Lil Bruh” Hearthwell','Landis Hearthwell'],welcome:['Mabel Welcomeberry','Toby Trailpaw','Nora Kindpaw','Calvin Stillwater','Sammy Patchwell'],outskirts:['Jonesha Hearthwell','Marcus Gearpaw'],care:[],faith:['Big Mama Mary']
};
function profileFor(name){return socialProfiles[name]||{home:'Honeybrook',base:'Around Town',circle:[],traits:['resident'],greeting:'Have yourself a BEARable day!'};}
function relationshipLine(a,b){if(a===b)return 'You are experiencing Honeybrook from this bear’s own perspective.';let p=profileFor(a);if(p.circle.includes(b))return `${b} is part of ${a}’s close Honeybrook circle.`;let q=profileFor(b);if(q.circle.includes(a))return `${a} matters to ${b}, even if they do not always say it out loud.`;return 'These residents know each other through town life, but their relationship can still grow.';}
function encounterText(name){let p=profileFor(name);if(role==='Visitor')return `<b>${name}</b> notices you. “${p.greeting}”`;if(role==='Narrator')return `<b>Narrator:</b> ${name} is here. You can introduce them into the scene, follow them, or let the ordinary day continue.`;let active=role==='Buddy Hearthwell'?'John “Buddy” Hearthwell':role==='Professor Honeywell'?'Professor Theodore Honeywell':role==='Lance Hearthwell'?'Lance “Lil Bruh” Hearthwell':role;return `<b>${name}</b><br>${relationshipLine(active,name)}<br><em>“${p.greeting}”</em>`;}
function peopleAt(id){return (placePeople[id]||[]).map(n=>`<button class="resident-chip" data-person="${n.replaceAll('"','&quot;')}">🧸 ${n}</button>`).join('')||'<span class="soft-note">No named resident is scheduled here right now. Ordinary background residents still come and go.</span>';}
function showPerson(name){let p=profileFor(name),r=residents.find(x=>x[0]===name);showModal(`<h2>🧸 ${name}</h2><p><span class="tag">${r?r[1]:'Honeybrook Resident'}</span></p><div class="profile-grid"><div class="event"><b>🏡 Home</b><br>${p.home}</div><div class="event"><b>📍 Usual Place</b><br>${p.base}</div><div class="event"><b>🐾 Personality</b><br>${p.traits.join(' · ')}</div><div class="event"><b>🤝 Close Circle</b><br>${p.circle.length?p.circle.join(', '):'Still developing connections'}</div></div><div class="event"><b>Encounter as ${role}</b><br>${encounterText(name)}</div>`);}

// enrich every district and destination after the original render functions run
const originalOpenPlace=openPlace;
openPlace=function(id){originalOpenPlace(id);let p=places.find(x=>x.id===id);if(!p||p.locked)return;let c=$('#content');c.insertAdjacentHTML('beforeend',`<section class="encounter-panel"><span class="tag">RESIDENT ACTIVITY</span><h3>Who might you meet here?</h3><div class="resident-chips">${peopleAt(id)}</div><p class="soft-note">Resident locations are routines, not cages. Bears can appear elsewhere for work, errands, family, events and ordinary life.</p></section>`);};
const originalOpenDestination=openDestination;
openDestination=function(id,index){originalOpenDestination(id,index);let c=$('#content');c.insertAdjacentHTML('beforeend',`<section class="encounter-panel"><span class="tag">SOCIAL FOUNDATION</span><h3>Residents connected to this area</h3><div class="resident-chips">${peopleAt(id)}</div></section>`);};
const originalShowResidents=showResidents;
showResidents=function(){originalShowResidents();$('#content').innerHTML=`<div class="resident-directory">${residents.map(r=>{let p=profileFor(r[0]);return `<button class="resident-profile-card" data-person="${r[0].replaceAll('"','&quot;')}"><b>${r[0]}</b><span class="tag">${r[1]}</span><small>🏡 ${p.home}<br>📍 ${p.base}</small></button>`}).join('')}</div>`;};
document.addEventListener('click',e=>{let person=e.target.closest('[data-person]');if(person){showPerson(person.dataset.person);}});

// === Honeybrook Phase 5: Town Memory & Discovery State ===
const HB_SAVE_KEY='honeybrook_save_v1';
const defaultState={version:1,role:'Visitor',visitedDistricts:[],visitedDestinations:[],metResidents:[],discoveries:['Welcome Bridge'],journal:[],lastVisit:null};
function loadHBState(){try{return {...defaultState,...JSON.parse(localStorage.getItem(HB_SAVE_KEY)||'{}')}}catch(e){return {...defaultState}}}
let hbState=loadHBState();
if(hbState.role&&roles.includes(hbState.role)){role=hbState.role;$('#roleBtn').textContent=`🎭 ${role} Mode`;$('#footerRole').textContent=role;}
function saveHBState(){hbState.role=role;hbState.lastVisit=new Date().toISOString();localStorage.setItem(HB_SAVE_KEY,JSON.stringify(hbState));updateMemoryBadge();}
function uniquePush(arr,val){if(!arr.includes(val)){arr.push(val);return true}return false}
function rememberDistrict(id){if(uniquePush(hbState.visitedDistricts,id)){let p=places.find(x=>x.id===id);hbState.journal.unshift(`Visited ${p?.name||id}.`);saveHBState();}}
function rememberDestination(id,index){let d=(destinations[id]||[])[Number(index)];if(!d)return;let key=`${id}:${d[0]}`;if(uniquePush(hbState.visitedDestinations,key)){hbState.journal.unshift(`Discovered ${d[0]}.`);uniquePush(hbState.discoveries,d[0]);saveHBState();}}
function rememberResident(name){if(uniquePush(hbState.metResidents,name)){hbState.journal.unshift(`Met ${name}.`);saveHBState();}}
function updateMemoryBadge(){let el=$('#memoryBadge');if(el)el.textContent=`🐾 ${hbState.visitedDistricts.length} districts · 🧸 ${hbState.metResidents.length} bears · 🔎 ${hbState.discoveries.length} discoveries`;}
function showJourney(){showModal(`<h2>📖 My Honeybrook Journey</h2><p>Honeybrook remembers this browser's journey through town.</p><div class="profile-grid"><div class="event"><b>🎭 Current Role</b><br>${role}</div><div class="event"><b>🗺️ Districts Visited</b><br>${hbState.visitedDistricts.length}</div><div class="event"><b>🧸 Bears Met</b><br>${hbState.metResidents.length}</div><div class="event"><b>🔎 Discoveries</b><br>${hbState.discoveries.length}</div></div><h3>Discovery Shelf</h3><div class="resident-chips">${hbState.discoveries.map(x=>`<span class="memory-chip">🔎 ${x}</span>`).join('')}</div><h3>Recent Journal</h3><div class="journey-log">${hbState.journal.length?hbState.journal.slice(0,12).map(x=>`<div class="event">${x}</div>`).join(''):'<p>Your Honeybrook story is just beginning.</p>'}</div><div class="memory-actions"><button class="small-action" id="exportJourney">Copy Journey Summary</button><button class="small-action danger-soft" id="resetJourney">Start Fresh</button></div>`);}
const phase5OpenPlace=openPlace;openPlace=function(id){rememberDistrict(id);phase5OpenPlace(id);};
const phase5OpenDestination=openDestination;openDestination=function(id,index){rememberDistrict(id);rememberDestination(id,index);phase5OpenDestination(id,index);};
const phase5ShowPerson=showPerson;showPerson=function(name){rememberResident(name);phase5ShowPerson(name);};
const oldRoleHandler=modal.onclick;
modal.addEventListener('click',e=>{let b=e.target.closest('[data-role]');if(b){setTimeout(()=>{hbState.role=role;saveHBState();},0)}});
document.addEventListener('click',e=>{if(e.target.closest('#journeyBtn'))showJourney();if(e.target.closest('#resetJourney')){if(confirm('Start a fresh Honeybrook journey on this browser?')){localStorage.removeItem(HB_SAVE_KEY);location.reload();}}if(e.target.closest('#exportJourney')){let summary=`Honeybrook Journey — Role: ${role}\nDistricts visited: ${hbState.visitedDistricts.length}\nBears met: ${hbState.metResidents.join(', ')||'None yet'}\nDiscoveries: ${hbState.discoveries.join(', ')}`;navigator.clipboard?.writeText(summary);e.target.textContent='Copied!';}});
updateMemoryBadge();

// Phase 6 — Honeybrook daily rhythm/activity engine
(function(){
  const schedules = {
    weekday: {
      morning: [
        ["☕","Breakfast Rush","The Honey Mug Café","Miss Patty is pouring coffee while Wally's fresh pastries disappear fast."],
        ["📚","School Arrival","Scholars' Quarter","Cubs are arriving for lessons while Professor Honeywell prepares the day's work."],
        ["📬","Morning Mail Route","Around Honeybrook","Harold Pawst is making his first neighborhood deliveries."],
        ["🔧","Garage Opens","Paws & Pistons","Marcus Gearpaw has opened the bay doors and started the first repair."]
      ],
      afternoon: [
        ["🥪","Lunch Around Town","Main Street","Workers, students and neighbors are taking lunch breaks across Main Street."],
        ["💻","Open Tech Lab","Technology Center","The lab is open for practice, troubleshooting and learning."],
        ["🍦","Ice-Cream Bell","Community Park","Benny Scoops has parked somewhere near the park. Follow the bell."],
        ["📖","Library Hours","Honeybrook Library","Storytime Bear is helping readers, researchers and curious cubs."]
      ],
      evening: [
        ["🏡","Porch Time","Bridgeview","Neighbors are coming home, children are outside, and somebody is definitely grilling."],
        ["🛼","Evening Skate","Rollin' Bears Skate Palace","Music is up and the rink is filling for open skate."],
        ["🎤","Harmony Rehearsal","Harmony Hill","Musicians and singers are rehearsing inside Harmony Hall."],
        ["🎬","Tonight's Showing","Honeybrook Theater","The marquee is lit for the evening feature."]
      ],
      night: [
        ["🌙","Town Settles Down","Honeybrook","Most shops are closing while porch lights and street lamps come on."],
        ["🌲","Northern Woods Advisory","Northern Woods","The maintained trail is closed beyond the warning marker after dark."],
        ["🚑","Night Services","Care District","Emergency and care services remain available through the night."]
      ]
    },
    weekend: {
      morning: [
        ["🥞","Slow Saturday Breakfast","Main Street","Breakfast spots are busy and nobody seems in much of a hurry."],
        ["🌻","Garden Morning","Bridgeview Commons","Neighbors are tending plots, talking across fences and trading produce."],
        ["🛍️","Weekend Market","Town Square","Local sellers are setting up tables and small carts around the square."]
      ],
      afternoon: [
        ["🎮","Game Time","Game Show Studio","Open competitions and family games are running this afternoon."],
        ["🍦","Park Crowd","Community Park","Picnic blankets are out, cubs are playing and Benny's cart is doing excellent business."],
        ["🎳","Family Bowling","Honeybrook Lanes","Lanes are open for families, friends and extremely competitive bears."]
      ],
      evening: [
        ["🎶","Honeybrook After Five","Harmony Hill","Music, food and casual performances are bringing bears outside."],
        ["🛼","Saturday Skate","Rollin' Bears Skate Palace","The lights are low, the music is loud and couples skate is coming."],
        ["🎬","Family Movie Night","Honeybrook Theater","The evening feature is drawing families downtown."]
      ],
      night: [
        ["✨","Quiet Honeybrook","Bridgeview & Town Square","Most cubs are home while a few cafés and entertainment spots wind down."],
        ["🌲","Stay on This Side","Northern Woods","Rangers recommend no travel beyond the public trail after nightfall."]
      ]
    }
  };

  const seasonal = {
    0:["❄️","Winter Warm-Up","Town Square","Hot cocoa and warm pastries are especially popular in the winter chill."],
    1:["💌","Sweetheart Season","Main Street","Shop windows carry little hearts, honey treats and friendship gifts."],
    2:["🌱","First Signs of Spring","Community Park","Garden beds and walking paths are waking up for spring."],
    3:["🌷","Spring in Honeybrook","Community Park","Flowers are opening and outdoor gathering spaces are getting busier."],
    4:["🌉","Bridge Season","Across Honeybrook","Residents are cleaning paths and bridges for spring community activities."],
    5:["☀️","Summer Days","Community Park","Outdoor games, cold treats and long evenings are back."],
    6:["🎆","Summer Celebration Season","Town Square","Cookouts, games and community gatherings fill the summer calendar."],
    7:["🎒","Back-to-School Season","Scholars' Quarter","School supplies, schedules and learning spaces are preparing for a new term."],
    8:["🍯","Honey Harvest Season","Outskirts","Farm stands and honey-season preparations are beginning."],
    9:["🎃","Autumn in Honeybrook","Around Town","Pumpkins, cider and fall decorations are appearing around town."],
    10:["🍂","Gathering Season","Bridgeview","Community meals and family gatherings become part of the town rhythm."],
    11:["✨","Winter Lights","Town Square","Lights and seasonal decorations begin appearing across bridges and storefronts."]
  };

  function partOfDay(h){
    if(h>=5 && h<12) return "morning";
    if(h>=12 && h<17) return "afternoon";
    if(h>=17 && h<21) return "evening";
    return "night";
  }
  function renderHoneybrookRhythm(){
    const now = new Date();
    const weekend = now.getDay()===0 || now.getDay()===6;
    const period = partOfDay(now.getHours());
    const kind = weekend ? "weekend" : "weekday";
    const activities = [...schedules[kind][period], seasonal[now.getMonth()]];
    const summary = document.getElementById("rhythmSummary");
    const grid = document.getElementById("rhythmGrid");
    if(!summary || !grid) return;
    const label = period.charAt(0).toUpperCase()+period.slice(1);
    summary.textContent = `${weekend ? "Weekend" : "Weekday"} ${label} • Honeybrook follows the real-world calendar and adjusts its ordinary routines accordingly.`;
    grid.innerHTML = activities.map(a => `
      <article class="rhythm-card">
        <div class="when">${a[0]} ${label}</div>
        <h3>${a[1]}</h3>
        <div class="place">📍 ${a[2]}</div>
        <p>${a[3]}</p>
        <span class="rhythm-badge">${a===activities[activities.length-1] ? "Seasonal" : "Happening now"}</span>
      </article>`).join("");
  }
  document.addEventListener("DOMContentLoaded", renderHoneybrookRhythm);
})();

// Phase 7 — stateful Honeybrook story/event engine
(function(){
 const EVENT_KEY="honeybrook_event_history_v1";
 const events=[
  {id:"mail-mixup",type:"Community",icon:"📬",title:"Harold's Mixed-Up Parcel",place:"Bridgeview",
   text:"Harold Pawst has one parcel with a smudged address. Three porches look possible, and Harold refuses to become the neighborhood detective.",
   choices:[
    ["Check with Miss Patty","Miss Patty remembers who mentioned expecting a package. Harold sighs, delivers it, and says this is exactly why he tries not to know everybody's bear-ness."],
    ["Ask around Bridgeview","A few neighbors compare clues and the parcel finds its owner. Big Mama knew the answer the whole time."],
    ["Let Harold solve it","Harold eventually matches the sender name to the right resident. He looks extremely pleased that nobody had to involve Miss Patty."]
   ]},
  {id:"bakery-overflow",type:"Everyday",icon:"🥐",title:"Wally Baked Too Much. Again.",place:"Cub Cakes & Crumbs",
   text:"Wally has produced far more Honey Buns than he can sell before closing. Templar is already asking whether he understands inventory.",
   choices:[
    ["Take extras to Welcome House","The Welcome House gets fresh pastries for newcomers. Wally calls it a perfect solution; Templar reminds him it is not a business model."],
    ["Run an afternoon special","A quick Honeybrook special clears most of the extras and Wally accidentally learns something about promotions."],
    ["Invite the neighborhood","Bridgeview gets an impromptu pastry table. Financially questionable. Socially excellent."]
   ]},
  {id:"bridgeview-cleanup",type:"Community",icon:"🧹",title:"Bridgeview Cleanup Morning",place:"Bridgeview Commons",
   text:"Wind scattered leaves, paper, and one mysteriously ownerless toy dinosaur across Bridgeview Commons.",
   choices:[
    ["Join the cleanup","Neighbors finish quickly. Landis claims the dinosaur is definitely not his while holding it."],
    ["Organize the cubs","The cubs turn cleanup into a competition and somehow become intensely serious about trash bags."],
    ["Bring snacks instead","Cleanup volunteers are extremely appreciative. Big Mama says feeding workers counts as working."]
   ]},
  {id:"welcome-newcomer",type:"Welcome",icon:"🧸",title:"A Quiet Newcomer",place:"The Welcome House",
   text:"A new bear has arrived with one small bag and very little to say. Calvin Stillwater is giving them space instead of demanding answers.",
   choices:[
    ["Sit quietly nearby","No questions. No pressure. After a while, the newcomer asks where they can get something warm to eat."],
    ["Offer a town map","The newcomer studies it carefully and circles the library. That's enough of a first step."],
    ["Ask Mabel how to help","Mabel reminds you: help should make room, not take control. She suggests preparing a meal and letting the newcomer choose what comes next."]
   ]},
  {id:"learning-game",type:"Learning",icon:"🎮",title:"Professor Bear vs. Gamer Bear",place:"Scholars' Quarter",
   text:"Professor Honeywell and Gamer Bear disagree about whether today's math lesson can be turned into a game-show round.",
   choices:[
    ["Try the game-show lesson","The students get loud, competitive, and surprisingly accurate. Professor Honeywell takes notes while pretending not to be impressed."],
    ["Keep part of both methods","Half the lesson is direct teaching and half is a timed challenge. It works well enough that both bears claim the idea."],
    ["Let the students vote","The vote is not remotely close. Professor Honeywell adjusts his glasses and agrees to one game round."]
   ]},
  {id:"old-symbol",type:"Mystery",icon:"🌲",title:"A Mark Beneath the Bridge",place:"Northern Edge",
   text:"After heavy rain, a small carved stone is visible near an old bridge approach. Its symbol doesn't match modern Honeybrook markings.",
   gated:true,
   choices:[
    ["Report it to the library","The stone is documented rather than disturbed. Storytime Bear recognizes part of the shape—but refuses to guess aloud."],
    ["Tell Professor Honeywell","The Professor records measurements and insists nobody carry unknown artifacts home."],
    ["Leave it exactly where it is","A marker is placed nearby so researchers can return in daylight. Sometimes the smartest discovery is the one you don't pocket."]
   ]}
 ];
 function history(){try{return JSON.parse(localStorage.getItem(EVENT_KEY)||"[]")}catch(e){return[]}}
 function save(h){localStorage.setItem(EVENT_KEY,JSON.stringify(h.slice(-30)))}
 function daySeed(){const d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate()}
 function available(){
   const h=history();
   // Mystery is uncommon: only appears on certain deterministic dates or after several events.
   return events.filter(e=>!e.gated || h.length>=3 || daySeed()%7===0);
 }
 function todaysEvent(){
   const pool=available(); return pool[daySeed()%pool.length];
 }
 function renderHistory(){
   const el=document.getElementById("eventHistory"); if(!el)return;
   const h=history();
   if(!h.length){el.textContent="No events completed yet.";return}
   el.innerHTML=h.slice().reverse().map(x=>`<div class="event-history-item"><strong>${x.icon} ${x.title}</strong><br><small>${x.date} • ${x.choice}</small></div>`).join("");
 }
 function render(){
   const panel=document.getElementById("eventPanel");if(!panel)return;
   const e=todaysEvent(), h=history();
   const completed=h.find(x=>x.eventId===e.id && x.day===daySeed());
   panel.innerHTML=`
    <div class="event-topline"><span class="event-tag ${e.type==="Mystery"?"mystery":""}">${e.icon} ${e.type}</span><span class="event-tag">📍 ${e.place}</span></div>
    <h3>${e.title}</h3><p>${e.text}</p>
    ${completed?`<div class="event-outcome"><strong>Today's choice: ${completed.choice}</strong><p>${completed.outcome}</p><small>Honeybrook remembered this.</small></div>`:
    `<div class="event-choice-grid">${e.choices.map((c,i)=>`<button class="event-choice" data-event-choice="${i}">${c[0]}</button>`).join("")}</div>`}`;
   panel.querySelectorAll("[data-event-choice]").forEach(btn=>btn.addEventListener("click",()=>{
      const c=e.choices[+btn.dataset.eventChoice];
      const rec={eventId:e.id,day:daySeed(),icon:e.icon,title:e.title,choice:c[0],outcome:c[1],date:new Date().toLocaleDateString()};
      const nh=history().filter(x=>!(x.eventId===e.id&&x.day===daySeed())); nh.push(rec); save(nh);
      render();renderHistory();
   }));
 }
 document.addEventListener("DOMContentLoaded",()=>{render();renderHistory()});
})();

// Phase 8 — Narrator / character-play foundation
(function(){
 const ROLE_KEY="honeybrook_play_mode_v1";
 const residents=[
  ["Amelia Honeybrook","Founder Bear","belonging, patience, and making room for others","Town Square"],
  ["Tom Bridgewell","Builder Bear","practical solutions, structure, and things that need fixing","Bridgeview"],
  ["Sammy Patchwell","Welcome Bear","who seems left out or uncomfortable","Welcome House"],
  ["Professor Theodore Honeywell","Professor Bear","what can be learned, explained, or taught better","Scholars' Quarter"],
  ["Templar Hearthwell","First Techie Bear","ideas, systems, business possibilities, and seventeen future projects","Technology Center"],
  ["John “Buddy” Hearthwell","Community Protector","safety, logistics, preparedness, and whether Templar has started another project","Bridgeview"],
  ["Big Mama Mary","Matriarch","family, food, children, neighbors, and everybody else's business","Bridgeview"],
  ["Jonesha Hearthwell","Adventurer","unexplored places, challenges, and anything somebody told her not to investigate","Northern Edge"],
  ["Robin Hearthwell","Wild Card","music, fun, children, trouble, and whether rules are really necessary","Harmony Hill"],
  ["Lance “Lil Bruh” Hearthwell","Gamer Cub","games, competition, jokes, and arguing with Landis","Game Show Studio"],
  ["Landis Hearthwell","Dino Cub","dinosaurs, music, winning, and why Lance is obviously cheating","Bridgeview"],
  ["Miss Patty Peaches","Café Bear","people, conversations, who needs feeding, and information she absolutely did not ask to receive","Honey Mug Café"],
  ["Ernest Grumblepaw","Retired Bear","noise, foolishness, bad parking, and events he claims he will not attend","Bridgeview"],
  ["Daisy Bellweather","Undecided Bear","what she might try next without needing to have her whole life figured out","Main Street"],
  ["Harold Pawst","Mail Bear","routes, parcels, addresses, and avoiding neighborhood gossip","Around Town"],
  ["Grandpa Newberry","Newberry Elder","what was wrong with the old way, suspicious friendliness, and secretly enjoyable town traditions","Bridgeview"]
 ];
 const locations=["Town Square","Bridgeview","Main Street","Scholars' Quarter","Honeybrook Library","Technology Center","Welcome House","Community Park","Harmony Hill","Game Show Studio","Honeybrook Theater","Rollin' Bears Skate Palace","Care District","Outskirts","Northern Edge"];
 const tones=["Ordinary day","Funny","Warm & heartfelt","Learning moment","Family moment","Community problem","Mild mystery"];
 let mode=localStorage.getItem(ROLE_KEY)||"visitor";
 function options(arr){return arr.map(x=>`<option>${x}</option>`).join("")}
 function workspace(){
  const w=document.getElementById("modeWorkspace");if(!w)return;
  document.querySelectorAll(".mode-btn").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));
  if(mode==="visitor"){
   w.innerHTML=`<h3>👀 Visitor Mode</h3><p>You experience Honeybrook as a guest. Explore locations, meet bears, see today's activities, and let the town introduce itself naturally.</p><div class="scene-card"><strong>Visitor principle:</strong> You do not need a talent, mission, or goal to enter Honeybrook. You can simply explore.</div>`;
  } else if(mode==="narrator"){
   w.innerHTML=`<h3>📖 Narrator Mode</h3><p>Frame the next scene without rewriting who the characters are.</p>
   <div class="story-controls">
    <label>Scene location<select id="sceneLocation">${options(locations)}</select></label>
    <label>Scene tone<select id="sceneTone">${options(tones)}</select></label>
    <label>Lead character<select id="sceneLead">${residents.map(r=>`<option>${r[0]}</option>`).join("")}</select></label>
   </div><button class="scene-button" id="frameScene">“Meanwhile, across Honeybrook…”</button><div id="sceneOutput"></div>`;
   document.getElementById("frameScene").onclick=frameScene;
  } else {
   w.innerHTML=`<h3>🐻 Character Mode</h3><p>Step into a resident's perspective. Their personality stays theirs; you choose how to move through their day.</p>
    <label><strong>Play as:</strong><select id="playCharacter" style="margin-left:.5rem;padding:.55rem;border-radius:10px">${residents.map(r=>`<option>${r[0]}</option>`).join("")}</select></label>
    <div id="characterOutput"></div>`;
   const s=document.getElementById("playCharacter");s.onchange=renderCharacter;s.value=localStorage.getItem("honeybrook_character_v1")||residents[0][0];renderCharacter();
  }
 }
 function frameScene(){
  const loc=document.getElementById("sceneLocation").value,tone=document.getElementById("sceneTone").value,lead=document.getElementById("sceneLead").value;
  const r=residents.find(x=>x[0]===lead);
  const openings={
   "Ordinary day":"Nothing extraordinary is happening—and that's perfectly fine.",
   "Funny":"Something small has already gone slightly ridiculous.",
   "Warm & heartfelt":"The scene begins quietly, with room for somebody to be seen or welcomed.",
   "Learning moment":"A question has come up, and more than one bear has an opinion about the answer.",
   "Family moment":"Family has gathered, which means love, noise, and at least one disagreement are nearby.",
   "Community problem":"Honeybrook has a small problem that will take neighbors, not heroes, to solve.",
   "Mild mystery":"Something is out of place. Not dangerous—at least, nobody knows that it is."
  };
  document.getElementById("sceneOutput").innerHTML=`<div class="scene-card"><small>📍 ${loc} • ${tone}</small><h4>Meanwhile, across Honeybrook…</h4><blockquote>${openings[tone]}</blockquote><p><strong>${lead}</strong> enters the scene noticing ${r[2]}.</p><div class="cast-checks"><span class="cast-chip">Lead: ${lead}</span><span class="cast-chip">Location: ${loc}</span><span class="cast-chip">Tone: ${tone}</span></div><p><em>The narrator has framed the scene. The characters still decide how they behave according to who they are.</em></p></div>`;
 }
 function renderCharacter(){
  const sel=document.getElementById("playCharacter"),out=document.getElementById("characterOutput");if(!sel||!out)return;
  const r=residents.find(x=>x[0]===sel.value)||residents[0];localStorage.setItem("honeybrook_character_v1",r[0]);
  out.innerHTML=`<div class="character-perspective"><div class="perspective-card"><strong>Your perspective</strong><p>As ${r[0]}, you naturally pay attention to ${r[2]}.</p></div><div class="perspective-card"><strong>Usual starting point</strong><p>📍 ${r[3]}</p></div><div class="perspective-card"><strong>Role</strong><p>${r[1]}</p></div></div><div class="scene-card"><strong>Today begins:</strong><p>You are ${r[0]}. Honeybrook is already moving around you. You may explore the town without needing to trigger a quest.</p></div>`;
 }
 document.addEventListener("DOMContentLoaded",()=>{
  document.querySelectorAll(".mode-btn").forEach(b=>b.onclick=()=>{mode=b.dataset.mode;localStorage.setItem(ROLE_KEY,mode);workspace()});workspace();
 });
})();

// Phase 9 — Honeybrook learning/activity registry
(function(){
 const KEY="honeybrook_learning_progress_v1";
 const content=[
 {id:"tech-basics",icon:"💻",title:"Computer Basics",type:"Lesson",place:"Technology Center",audience:"Beginner • All ages",desc:"Foundational computer skills with patient, step-by-step practice."},
 {id:"troubleshoot-101",icon:"🛠️",title:"Troubleshooting Classroom",type:"Practice Lab",place:"Technology Center",audience:"Beginner–Intermediate",desc:"Practice diagnosing common computer and browser problems one clear action at a time."},
 {id:"coding-return",icon:"⌨️",title:"Back to Coding",type:"Lesson",place:"Technology Center",audience:"Returning learner",desc:"Rebuild coding confidence from fundamentals without pretending forgotten skills are gone forever."},
 {id:"office-practice",icon:"📊",title:"Office Skills Lab",type:"Practice Lab",place:"Learning Commons",audience:"Career & practical skills",desc:"Practice documents, spreadsheets, presentations, organization, and office workflows."},
 {id:"business-lab",icon:"🏪",title:"Honeybrook Business Lab",type:"Practice Lab",place:"Business Center",audience:"Entrepreneurship",desc:"Practice pricing, client service, records, planning, branding, and everyday business decisions."},
 {id:"game-show",icon:"🎮",title:"Honeybrook Game Show",type:"Game",place:"Game Show Studio",audience:"Children & adults",desc:"Educational rounds inspired by classic game-show energy without copying any one show."},
 {id:"greek-library",icon:"🏛️",title:"Myths of the Ancient World",type:"Story",place:"Honeybrook Library",audience:"Readers & mythology fans",desc:"Explore Greek mythology learning material while Honeybrook's own ancient mythology remains distinct."},
 {id:"fairytale-library",icon:"📖",title:"Fairy-Tale Collection",type:"Story",place:"Honeybrook Library",audience:"All ages",desc:"Read and explore classic public-domain fairy tales and Honeybrook's storytelling traditions."},
 {id:"three-bears",icon:"🥣",title:"The Honeybrook Three Bears File",type:"Story",place:"Honeybrook Library",audience:"Town history",desc:"Study what Honeybrook believes about Goldilocks, the Three Bears, and the missing pieces of the familiar tale."},
 {id:"creative-harmony",icon:"🎤",title:"Harmony Creative Studio",type:"Creative Activity",place:"Harmony Hill",audience:"All ages",desc:"Singing, writing, art, performance, and creative-expression activities."},
 {id:"event-practice",icon:"🎈",title:"Community Event Lab",type:"Practice Lab",place:"Learning Commons",audience:"Planning skills",desc:"Plan a Honeybrook event from idea through schedule, materials, communication, and follow-up."},
 {id:"research-room",icon:"🔎",title:"Research & Writing Room",type:"Lesson",place:"Honeybrook Library",audience:"Student & adult learner",desc:"Practice research, source evaluation, organization, and original writing."}
 ];
 function progress(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){return{}}}
 function save(p){localStorage.setItem(KEY,JSON.stringify(p))}
 function render(){
  const reg=document.getElementById("contentRegistry"),tf=document.getElementById("contentTypeFilter"),pf=document.getElementById("contentPlaceFilter");if(!reg||!tf||!pf)return;
  const p=progress(), type=tf.value, place=pf.value;
  const shown=content.filter(x=>(type==="all"||x.type===type)&&(place==="all"||x.place===place));
  reg.innerHTML=shown.map(x=>{const s=p[x.id]||"Not started";return `<article class="content-card"><div>${x.icon} <strong>${x.type}</strong></div><h3>${x.title}</h3><div class="content-meta">📍 ${x.place}<br>🎯 ${x.audience}</div><p>${x.desc}</p><span class="content-status">${s}</span><div class="content-actions"><button class="start-activity" data-start="${x.id}">${s==="Not started"?"Start":"Open"}</button><button class="complete-activity" data-complete="${x.id}">Mark complete</button></div></article>`}).join("")||"<p>No activities match those filters.</p>";
  const vals=Object.values(p), done=vals.filter(x=>x==="Completed").length, started=vals.filter(x=>x==="In progress").length;
  document.getElementById("learningStats").innerHTML=`<span class="learning-stat">📚 ${content.length} activities</span><span class="learning-stat">▶️ ${started} in progress</span><span class="learning-stat">✅ ${done} completed</span>`;
  reg.querySelectorAll("[data-start]").forEach(b=>b.onclick=()=>{const q=progress();if(!q[b.dataset.start])q[b.dataset.start]="In progress";save(q);render()});
  reg.querySelectorAll("[data-complete]").forEach(b=>b.onclick=()=>{const q=progress();q[b.dataset.complete]="Completed";save(q);render()});
 }
 document.addEventListener("DOMContentLoaded",()=>{
  const pf=document.getElementById("contentPlaceFilter"),tf=document.getElementById("contentTypeFilter");if(!pf||!tf)return;
  [...new Set(content.map(x=>x.place))].sort().forEach(x=>pf.insertAdjacentHTML("beforeend",`<option>${x}</option>`));
  pf.onchange=render;tf.onchange=render;render();
 });
})();

// Phase 10 — Just Visit / Cozy Day
(function(){
 const KEY="honeybrook_cozy_mode_v1";
 const moments=[
  ["☕","Sit at the Honey Mug","Miss Patty gives you a comfortable spot. You don't need to talk. The café hums around you and somebody laughs near the counter."],
  ["🏡","Pull up a paw in Bridgeview","A porch chair is open. Children are somewhere nearby, a screen door closes, and Big Mama is keeping an eye on absolutely everything."],
  ["🌳","Wander through the park","No destination. No step counter. Just paths, little bridges, trees, benches, and whatever Honeybrook is doing today."],
  ["📚","Read something for fun","The library has stories you can read because you want to—not because there will be a quiz."],
  ["🍦","Find Benny Scoops","Listen for the bell. Getting ice cream is the entire objective, and even that is optional."],
  ["🎶","Listen at Harmony Hill","You can sing, listen, or sit in the back and let somebody else make the music."],
  ["📬","Watch town life","Harold is delivering mail, shops are opening or closing, neighbors are talking, and none of it requires your assistance."],
  ["🎬","Catch a show","Take a seat at the theater and let Honeybrook entertain you for a while."],
  ["🌉","Sit by the creek","Find a safe spot near Honeybrook Creek and watch the water move under the bridges."],
  ["😴","Do absolutely nothing","Yes. This is a real Honeybrook activity. You are allowed to exist without turning the moment into a project."]
 ];
 function render(){
  const box=document.getElementById("cozyWorkspace"),btn=document.getElementById("cozyToggle"); if(!box||!btn)return;
  const active=localStorage.getItem(KEY)==="on";
  document.body.classList.toggle("cozy-active",active);box.hidden=!active;
  btn.textContent=active?"🏠 End Cozy Day":"🍯 Start a Cozy Day";
  if(active) box.innerHTML=`<h3>Today has no checklist.</h3><p>Pick something if it sounds nice. Ignore every option if it doesn't.</p><div class="cozy-choices">${moments.map((m,i)=>`<button class="cozy-choice" data-cozy="${i}"><strong>${m[0]} ${m[1]}</strong><span>Go here only if you feel like it.</span></button>`).join("")}</div><div id="cozyScene"></div><p class="cozy-note">Honeybrook can teach you, entertain you, and challenge you. It never requires you to be productive to belong here.</p>`;
  if(active) box.querySelectorAll("[data-cozy]").forEach(b=>b.onclick=()=>{const m=moments[+b.dataset.cozy];document.getElementById("cozyScene").innerHTML=`<div class="cozy-scene"><h4>${m[0]} ${m[1]}</h4><p>${m[2]}</p><p><strong>Stay as long as you want. Leave whenever you want.</strong></p></div>`});
 }
 document.addEventListener("DOMContentLoaded",()=>{const b=document.getElementById("cozyToggle");if(!b)return;b.onclick=()=>{localStorage.setItem(KEY,localStorage.getItem(KEY)==="on"?"off":"on");render()};render()});
})();

// Honeybrook Explorer Release — arrival, calendar, discovery progression, visitor bear
(function(){
 const VKEY="honeybrook_visitor_bear_v1", DKEY="honeybrook_explorer_discoveries_v1";
 const places=[
 ["🏛️","Town Square","Civic heart, monument, Gazette, Town Hall and community gatherings."],
 ["🏡","Bridgeview","Oldest neighborhood. Porches, Hearthwells, Big Mama and Bridgeview Commons."],
 ["☕","Main Street","Cafés, shops, bakery, market and everyday town business."],
 ["📚","Scholars' Quarter","School, library, Technology Center and learning spaces."],
 ["🎶","Harmony Hill","Music, singing, art, performance and evening rehearsals."],
 ["🌳","Community Park","Paths, little bridges, picnics, games and Benny Scoops."],
 ["🎮","Entertainment District","Games, skating, bowling, theater and family fun."],
 ["❤️","Care & Community","Health, wellness, emergency support and nearby Welcome House."],
 ["🎒","Welcome House","A soft landing for newcomers. No résumé required."],
 ["🌾","Honeybrook Outskirts","Farms, orchards, old roads, barns and the road north."],
 ["🌲","Northern Edge","The maintained public trail ends before the deepest woods."]
 ];
 const festivals=[
  [2,20,"🌉 Festival of Bridges","Spring community celebration of connection and Honeybrook's bridges."],
  [4,15,"🏡 Welcome Home Week","A townwide celebration of newcomers, neighbors and belonging."],
  [5,21,"🎶 Harmony Festival","Summer music, art, food and performances around Harmony Hill."],
  [8,19,"🍯 Honey Harvest Fair","Early-autumn food, farm stands, honey treats and community activities."],
  [9,10,"🧸 Founders' Day","Honeybrook remembers Amelia, Tom, Sammy and the settlement's beginnings."],
  [10,7,"🧥 Patchwell Kindness Day","A day centered on welcome, dignity and noticing who might be sitting alone."],
  [10,21,"🥣 Three Bears Heritage Weekend","Stories, porridge contests, research, reenactments and town history."]
 ];
 function discoveries(){try{return JSON.parse(localStorage.getItem(DKEY)||'["Welcome Bridge"]')}catch(e){return["Welcome Bridge"]}}
 function addDiscovery(x){let d=discoveries();if(!d.includes(x)){d.push(x);localStorage.setItem(DKEY,JSON.stringify(d))}}
 function visitor(){try{return JSON.parse(localStorage.getItem(VKEY)||"null")}catch(e){return null}}
 function panel(x){const p=document.getElementById("explorerPanel");p.innerHTML=x;return p}
 function enter(){
  const v=visitor(), name=v?.name||"friend"; addDiscovery("Honeybrook");
  panel(`<div class="visitor-form"><h3>🍯 Welcome BEARck, ${name}.</h3><p>You crossed the Welcome Bridge. Pick anywhere that sounds good. This is not a quest list.</p><div class="explore-grid">${places.map((p,i)=>`<button class="explore-card" data-place="${p[1]}"><strong>${p[0]} ${p[1]}</strong><span>${p[2]}</span></button>`).join("")}</div></div>`)
   .querySelectorAll("[data-place]").forEach(b=>b.onclick=()=>visit(b.dataset.place));
 }
 function visit(name){
  addDiscovery(name);const p=places.find(x=>x[1]===name);
  let extra="";
  if(name==="Northern Edge"){
   const d=discoveries(), unlocked=d.length>=6;
   extra=`<div class="woods-warning"><strong>⚠️ NORTHERN WOODS</strong><p>Travel beyond this point is at your own risk. Honeybrook Rangers recommend returning before nightfall.</p>${unlocked?`<p>You've explored enough of Honeybrook to notice something others might miss: an old bridge approach and a weathered marking near the public trail.</p><button id="recordWoods" class="explorer-secondary">Record the old marking</button>`:`<p class="locked-trail">The deeper trail remains undiscovered. Explore Honeybrook first; the woods aren't going anywhere.</p>`}</div>`;
  }
  panel(`<div class="visitor-form"><button id="backTown" class="explorer-secondary">← Around Town</button><h3>${p[0]} ${p[1]}</h3><p>${p[2]}</p>${extra}<p><em>You can stay, wander elsewhere, or do nothing at all.</em></p></div>`);
  document.getElementById("backTown").onclick=enter;const rw=document.getElementById("recordWoods");if(rw)rw.onclick=()=>{addDiscovery("Old Northern Marking");rw.outerHTML="<p><strong>🗺️ Discovery recorded:</strong> Old Northern Marking. No conclusion has been drawn yet.</p>"}
 }
 function makeVisitor(){
  const v=visitor()||{};
  panel(`<div class="visitor-form"><h3>🎒 My Visitor Bear</h3><p>Your bear does not need a job, talent, or destiny.</p><label>Name<input id="vbName" value="${v.name||""}" placeholder="Your bear's name"></label><label>What brings you to Honeybrook?<select id="vbReason"><option>I don't know yet</option><option>I'm exploring</option><option>I want to learn something</option><option>I need a cozy day</option><option>I came for fun</option><option>I'm looking for a new beginning</option></select></label><label>Favorite kind of stop<select id="vbFav"><option>Anywhere</option><option>Quiet places</option><option>Games & entertainment</option><option>Books & learning</option><option>Food & cafés</option><option>Music & creativity</option><option>Neighborhood life</option></select></label><button id="saveVB" class="explorer-primary">Save My Bear</button><div id="vbSaved"></div></div>`);
  if(v.reason)document.getElementById("vbReason").value=v.reason;if(v.favorite)document.getElementById("vbFav").value=v.favorite;
  document.getElementById("saveVB").onclick=()=>{const x={name:document.getElementById("vbName").value.trim()||"Visitor Bear",reason:document.getElementById("vbReason").value,favorite:document.getElementById("vbFav").value};localStorage.setItem(VKEY,JSON.stringify(x));document.getElementById("vbSaved").innerHTML=`<p><strong>BEARilliant.</strong> Welcome to Honeybrook, ${x.name}. “${x.reason}” is a perfectly good reason to be here.</p>`}
 }
 function calendar(){
  const now=new Date(), month=now.getMonth()+1, day=now.getDate();
  const season=month<=2||month===12?"Winter":month<=5?"Spring":month<=8?"Summer":"Autumn";
  const upcoming=festivals.map(f=>{let y=now.getFullYear(),d=new Date(y,f[0]-1,f[1]);if(d<new Date(now.getFullYear(),now.getMonth(),now.getDate()))d=new Date(y+1,f[0]-1,f[1]);return [d,...f]}).sort((a,b)=>a[0]-b[0]);
  panel(`<div class="visitor-form"><h3>📅 Today in Honeybrook</h3><p><strong>${now.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"})}</strong> • ${season}</p><p>Honeybrook follows the real-world calendar. Ordinary routines continue underneath festivals and seasonal decorations.</p><h4>Coming up</h4>${upcoming.slice(0,4).map(x=>`<div class="calendar-card"><strong>${x[3]}</strong><br>${x[0].toLocaleDateString(undefined,{month:"long",day:"numeric",year:"numeric"})}<br><small>${x[4]}</small></div>`).join("")}</div>`)
 }
 function book(){
  const d=discoveries();
  panel(`<div class="visitor-form"><h3>🗺️ Discovery Book</h3><p>${d.length} discoveries recorded. Honeybrook does not require you to complete this book.</p>${d.map((x,i)=>`<div class="discovery-card"><strong>${i+1}. ${x}</strong></div>`).join("")}<p>${d.length>=6?"🌲 You've explored enough for subtle Northern Edge clues to begin appearing.":"Explore naturally. Some things reveal themselves only after you've spent time around town."}</p></div>`)
 }
 document.addEventListener("DOMContentLoaded",()=>{
  const e=document.getElementById("enterTown"),m=document.getElementById("makeVisitor"),c=document.getElementById("townCalendar"),d=document.getElementById("discoveryBook");if(!e)return;
  e.onclick=enter;m.onclick=makeVisitor;c.onclick=calendar;d.onclick=book;
  const v=visitor();if(v)document.getElementById("welcomeLine").textContent=`Welcome BEARck, ${v.name}. Cross the Welcome Bridge and begin wherever you want.`;
 });
})();

// Visual town map interactions
(function(){
 const descriptions={
 "Town Square":"🏛️ The civic heart of Honeybrook. The Goldilocks & Three Bears monument watches over festivals, markets and ordinary town business.",
 "Bridgeview":"🏡 Honeybrook's oldest neighborhood. Porch culture, the Hearthwells, Big Mama, playground noise and neighbors who know your mama.",
 "Main Street":"☕ Shops, food, errands and gossip-that-is-definitely-not-gossip. Miss Patty and Wally are nearby.",
 "Scholars' Quarter":"📚 School, library, Technology Center and Learning Commons. Nobody ages out of learning here.",
 "Harmony Hill":"🎶 Singing, music, art, theater and creativity live up the hill.",
 "Community Park":"🌳 Trails, picnics, playgrounds, little bridges—and listen carefully for Benny Scoops' bell.",
 "Entertainment District":"🎮 Game shows, skating, bowling, theater, arcade fun and family nights.",
 "Care & Community":"❤️ Health, wellness and community support. Honeybrook takes care of its bears.",
 "Welcome House":"🎒 New here? Start here. You don't need to prove what you can do before somebody offers you a chair.",
 "Northern Edge":"🌲 The maintained trail ends ahead. The official map becomes less certain from here."
 };
 document.addEventListener("DOMContentLoaded",()=>{
  document.querySelectorAll("[data-town-place]").forEach(b=>b.onclick=()=>{
   const n=b.dataset.townPlace, box=document.getElementById("townSceneInfo");if(box)box.innerHTML=`<strong>${n}</strong><br>${descriptions[n]||"A place in Honeybrook."}`;
   try{let d=JSON.parse(localStorage.getItem("honeybrook_explorer_discoveries_v1")||"[]");if(!d.includes(n)){d.push(n);localStorage.setItem("honeybrook_explorer_discoveries_v1",JSON.stringify(d))}}catch(e){}
  });
 });
})();

// Bridgeview district scene
(function(){
 const details={
 "Hearthwell Home":"🏠 The Hearthwell house is bigger because the family is bigger—not because anybody is trying to impress the neighbors. Templar has probably started something in one room while Buddy is asking what happened to the last project.",
 "Big Mama's Cottage":"🏡 Big Mama's porch has excellent seating and even better neighborhood visibility. Sit down long enough and somebody will be asked: “WHO YOUR MAMA?”",
 "Bridgeview Commons":"🛝 Shared green space with a playground, basketball, picnic tables, grills and enough room for ordinary neighborhood life.",
 "Community Garden":"🌻 Neighbors grow vegetables, flowers and herbs here. Some plots are neat. Some look like the bear responsible forgot they existed.",
 "Old Bridge":"🌉 One of Bridgeview's oldest living landmarks. It is used, maintained and crossed—not trapped behind museum glass."
 };
 document.addEventListener("DOMContentLoaded",()=>{
  document.querySelectorAll("[data-bv]").forEach(b=>b.onclick=()=>{
   const n=b.dataset.bv,box=document.getElementById("bridgeviewInfo");if(box)box.innerHTML=`<strong>${n}</strong><br>${details[n]}`;
   try{let d=JSON.parse(localStorage.getItem("honeybrook_explorer_discoveries_v1")||"[]");const tag="Bridgeview: "+n;if(!d.includes(tag)){d.push(tag);localStorage.setItem("honeybrook_explorer_discoveries_v1",JSON.stringify(d))}}catch(e){}
  });
 });
})();

// Main Street interactions
(function(){
 const d={
 "The Honey Mug Café":"☕ Miss Patty Peaches runs the kind of café where breakfast comes with conversation. She knows a great deal because bears keep telling her things. She also quietly makes sure hungry neighbors eat.",
 "Cub Cakes & Crumbs":"🥐 Wally Crumbwell can bake. Wally cannot reliably stop giving away the merchandise. Templar has explained the phrase “profit margin” more than once.",
 "BEARcessities":"🛒 Everyday supplies under one roof. Its promise is simple: Everything a Bear Needs. Honeybrook residents will absolutely debate whether every item qualifies.",
 "Honeybrook Market":"🍎 Groceries, household basics, produce and ordinary errands—the sort of place where town life crosses paths naturally.",
 "Paws & Threads":"👕 Clothes and accessories for cubs, adults, workdays, celebrations and bears who came in for socks but left with an entire outfit.",
 "Honeybrook Business Center":"💼 Planning, records, pricing, entrepreneurship and practical business learning. It grew from Honeybrook's belief that helping a bear can include teaching them how to do it themselves."
 };
 document.addEventListener("DOMContentLoaded",()=>document.querySelectorAll("[data-ms]").forEach(b=>b.onclick=()=>{
  const n=b.dataset.ms,x=document.getElementById("mainStreetInfo");if(x)x.innerHTML=`<strong>${n}</strong><br>${d[n]}`;
  try{let a=JSON.parse(localStorage.getItem("honeybrook_explorer_discoveries_v1")||"[]"),t="Main Street: "+n;if(!a.includes(t)){a.push(t);localStorage.setItem("honeybrook_explorer_discoveries_v1",JSON.stringify(a))}}catch(e){}
 }));
})();

// Town Square interactions
(function(){
 const d={
 "Honeybrook Town Hall":"🏛️ Honeybrook's ordinary civic government works here. Town leaders handle roads, permits, services and community matters; the Guardian Goddess does not run council meetings.",
 "Honeybrook Gazette":"📰 Town news, announcements, festivals, odd little incidents and occasionally the sort of headline Grandpa Newberry reads aloud just to complain about it.",
 "Honeybrook Post Office":"📮 Mail for homes and businesses passes through here. Harold Pawst would like everyone reminded that he delivers MAIL—not messages, gossip, favors, or whatever Miss Patty just asked him to tell somebody.",
 "Public Safety":"🚒 Emergency response, preparedness and everyday public safety. Buddy's practical influence can be felt in Honeybrook's early preparedness traditions.",
 "Goldilocks & The Three Bears Monument":"🥣 Goldilocks stands WITH Papa Bear, Mama Bear and Baby Bear. Honeybrook remembers them as figures from a story rooted in this land—but residents disagree about how much of the familiar tale is true.",
 "Honeybrook Town Clock":"🕰️ A familiar meeting point in the square. Festivals, markets and ordinary afternoons pass beneath it."
 };
 document.addEventListener("DOMContentLoaded",()=>document.querySelectorAll("[data-ts]").forEach(b=>b.onclick=()=>{
  const n=b.dataset.ts,x=document.getElementById("townSquareInfo");if(x)x.innerHTML=`<strong>${n}</strong><br>${d[n]}`;
  try{let a=JSON.parse(localStorage.getItem("honeybrook_explorer_discoveries_v1")||"[]"),t="Town Square: "+n;if(!a.includes(t)){a.push(t);localStorage.setItem("honeybrook_explorer_discoveries_v1",JSON.stringify(a))}}catch(e){}
 }));
})();

(function(){
 const d={
 "Honeybrook School":"🏫 Professor Theodore Honeywell helped turn Honeybrook's first rough schoolhouse into a tradition of flexible learning. Different bears may need different ways in.",
 "Bear Claw Library":"📚 Stories, research, town records, fairy tales and old Honeybrook history live here. Some Northern Woods references are incomplete—and that is intentional.",
 "Honeybrook Technology Center":"💻 Honeybrook traces its technology-learning tradition to Templar Hearthwell, its first Techie Bear: “If you don't understand it, learn it. If you forgot it, learn it again.”",
 "Learning Commons":"📝 A flexible practice space for Office skills, research, writing, projects and hands-on learning. Starting over is normal here.",
 "Learning Hall":"🎓 Classes and workshops for cubs AND adults. Sammy's history helped Honeybrook understand that embarrassment should never be a barrier to learning.",
 "Achievement Center":"⭐ A place to recognize milestones, finished projects and personal growth. Achievement is celebrated here—but it never determines whether a bear deserves to belong."
 };
 document.addEventListener("DOMContentLoaded",()=>document.querySelectorAll("[data-sq]").forEach(b=>b.onclick=()=>{
  const n=b.dataset.sq,x=document.getElementById("scholarsInfo");if(x)x.innerHTML=`<strong>${n}</strong><br>${d[n]}`;
  try{let a=JSON.parse(localStorage.getItem("honeybrook_explorer_discoveries_v1")||"[]"),t="Scholars' Quarter: "+n;if(!a.includes(t)){a.push(t);localStorage.setItem("honeybrook_explorer_discoveries_v1",JSON.stringify(a))}}catch(e){}
 }));
})();

(function(){
 const d={
 "Harmony Hall":"🎼 Honeybrook's main home for music, singing and rehearsal. Robin Hearthwell's love of singing fits here—but she remains Robin, not a polished little mascot.",
 "Honeybrook Outdoor Stage":"🎤 Community concerts, summer performances, open-mic nights and Harmony Festival events happen here. Some performers are excellent. Some are enthusiastic. Both may receive applause.",
 "Poppy's Art Studio":"🎨 Painting, drawing and creative work with Poppy Brushwood. Finished masterpieces are welcome; crooked first attempts are welcome too.",
 "Dance & Theater Studio":"🎭 Acting, movement, dance and stage practice. Bears can perform, learn backstage work or discover that theater is absolutely not their thing.",
 "Rehearsal Rooms":"🎹 Small practice rooms for music and voice. A bear can work privately without being pushed onto a stage.",
 "Listening Lawn":"🧺 Bring a blanket. Sit down. Listen to the music drifting across the hill. You are not required to produce anything whatsoever."
 };
 document.addEventListener("DOMContentLoaded",()=>document.querySelectorAll("[data-hh]").forEach(b=>b.onclick=()=>{
  const n=b.dataset.hh,x=document.getElementById("harmonyInfo");if(x)x.innerHTML=`<strong>${n}</strong><br>${d[n]}`;
  try{let a=JSON.parse(localStorage.getItem("honeybrook_explorer_discoveries_v1")||"[]"),t="Harmony Hill: "+n;if(!a.includes(t)){a.push(t);localStorage.setItem("honeybrook_explorer_discoveries_v1",JSON.stringify(a))}}catch(e){}
 }));
})();

(function(){
 const d={
 "Honeybrook Health Center":"🏥 Everyday medical care and wellness support live here. Honeybrook's magical layers do not replace ordinary care.",
 "Honeybrook Dental":"🦷 Routine dental care for cubs and adults—because even a magical bear town still has teeth.",
 "Emergency Services":"🚑 Emergency response and preparedness. Honeybrook plans for problems instead of expecting magic to rescue everybody.",
 "Welcome House":"🏠 Mabel Welcomeberry helps run the home-like first stop for newcomers. Temporary rooms, necessities, information and patient guidance are available without a talent audition.",
 "Welcome House Kitchen":"🍲 A shared kitchen and meal space. Sometimes practical welcome begins with something warm to eat and a chair at the table.",
 "Welcome House Porch":"🪑 Sit down. Think. Talk if you want. Stay quiet if you don't. Sammy Patchwell's legacy lives in Honeybrook's belief that a bear can arrive with nothing to prove."
 };
 document.addEventListener("DOMContentLoaded",()=>document.querySelectorAll("[data-cc]").forEach(b=>b.onclick=()=>{
  const n=b.dataset.cc,x=document.getElementById("careInfo");if(x)x.innerHTML=`<strong>${n}</strong><br>${d[n]}`;
  try{let a=JSON.parse(localStorage.getItem("honeybrook_explorer_discoveries_v1")||"[]"),t="Care & Community: "+n;if(!a.includes(t)){a.push(t);localStorage.setItem("honeybrook_explorer_discoveries_v1",JSON.stringify(a))}}catch(e){}
 }));
})();

(function(){
 const d={
 "Gamer Bear Game Show Studio":"📺 Gavin Playmore's favorite place: timed rounds, buzzers, word games, trivia and game-show chaos. Some games can teach; some can exist purely because hitting a buzzer is fun.",
 "Rollin' Bears Skate Palace":"🛼 Music, lights and bears discovering whether they can stop before reaching the wall.",
 "Honeybrook Lanes":"🎳 Bowling for families, friends and extremely confident bears who immediately throw a gutter ball.",
 "Honeybrook Arcade":"🕹️ Video games, classic arcade challenges and high scores. Lance and Landis are strongly advised to remember that losing one round is survivable.",
 "Honeybrook Theater":"🎬 Movies, community screenings and live special events. Pawcorn is available and somebody will inevitably crunch it during the quietest scene.",
 "Bear Creek Mini Golf":"⛳ A playful course with little bridges, creek features and enough obstacles to produce completely unnecessary family rivalries.",
 "Honeybrook Pool":"🏊 Swim, splash, take lessons or sit beside the water. Poolside lounging counts as using the pool.",
 "BearFit Gym":"🏀 Open gym, sports and fitness activities for bears who want them. Exercise is available—not a condition of belonging."
 };
 document.addEventListener("DOMContentLoaded",()=>document.querySelectorAll("[data-ep]").forEach(b=>b.onclick=()=>{
  const n=b.dataset.ep,x=document.getElementById("funInfo");if(x)x.innerHTML=`<strong>${n}</strong><br>${d[n]}`;
  try{let a=JSON.parse(localStorage.getItem("honeybrook_explorer_discoveries_v1")||"[]"),t="Entertainment: "+n;if(!a.includes(t)){a.push(t);localStorage.setItem("honeybrook_explorer_discoveries_v1",JSON.stringify(a))}}catch(e){}
 }));
})();

(function(){
 const d={
 "Honeybrook Playground":"🛝 A place for cubs to climb, run, invent games and occasionally insist they are NOT tired immediately before falling asleep on the ride home.",
 "Picnic Lawn":"🧺 Picnic tables, open grass, shade and grills. Families gather here; friends meet here; solo bears are equally welcome.",
 "Park Gardens":"🌻 Flower beds, Honeyblossoms, Pawpetals, benches and wandering paths. Looking at flowers counts as the entire activity.",
 "Sports Lawn":"⚽ Open space for casual games, practices and community play. Participation is optional; sideline commentary is plentiful.",
 "Creekside Trail":"🥾 A walking trail follows Honeybrook Creek and crosses several small bridges. Most of these bridges have no names—because Tom Bridgewell would insist they haven't earned one.",
 "The Quiet Tree":"🌳 Shade. Grass. A good view. No score, lesson, assignment, badge, streak or productivity goal. Sit down."
 };
 document.addEventListener("DOMContentLoaded",()=>document.querySelectorAll("[data-pk]").forEach(b=>b.onclick=()=>{
  const n=b.dataset.pk,x=document.getElementById("parkInfo");if(x)x.innerHTML=`<strong>${n}</strong><br>${d[n]}`;
  try{let a=JSON.parse(localStorage.getItem("honeybrook_explorer_discoveries_v1")||"[]"),t="Community Park: "+n;if(!a.includes(t)){a.push(t);localStorage.setItem("honeybrook_explorer_discoveries_v1",JSON.stringify(a))}}catch(e){}
 }));
})();

(function(){
 const d={
 "Honeyfield Farm":"🚜 A working farm with fields, barns and ordinary chores. Honeybrook's food doesn't magically appear in the market every morning.",
 "Honeybrook Orchard":"🍎 Fruit trees, seasonal picking and harvest activity. In autumn this road gets considerably busier.",
 "Old Honeybrook Mill":"⚙️ One of the older working sites along the creek. Parts have been repaired many times, but some foundation stones appear older than the settlement itself.",
 "Covered Bridge":"🌉 An old country crossing used by residents and farm traffic. It has no official name. Tom Bridgewell would approve.",
 "Country Homes":"🏡 Rural Honeybrook families live along these roads with porches, gardens, sheds and enough distance between houses to yell very loudly without immediately involving the whole neighborhood.",
 "Old Northern Road":"🛤️ The ordinary maintained route grows narrower farther north. Beyond the public trail, Honeybrook's official map becomes less certain."
 };
 document.addEventListener("DOMContentLoaded",()=>document.querySelectorAll("[data-os]").forEach(b=>b.onclick=()=>{
  const n=b.dataset.os,x=document.getElementById("outskirtsInfo");if(x)x.innerHTML=`<strong>${n}</strong><br>${d[n]}`;
  try{let a=JSON.parse(localStorage.getItem("honeybrook_explorer_discoveries_v1")||"[]"),t="Outskirts: "+n;if(!a.includes(t)){a.push(t);localStorage.setItem("honeybrook_explorer_discoveries_v1",JSON.stringify(a))}}catch(e){}
 }));
})();

(function(){
 const d={
 "Honeybrook Community Church":"⛪ Miss Grace Goodberry is often here. Worship, fellowship and community life have a home in Honeybrook without deciding whether another bear belongs.",
 "Reflection Gardens":"🌷 Flower-lined paths and benches for prayer, thinking, conversation or silence. A bear does not owe the garden an explanation.",
 "Goodberry Outreach House":"🤝 Practical community help—meals, supplies and neighbor-to-neighbor support. Care is more useful when it reaches beyond good intentions.",
 "Remembrance Grove":"🕯️ A peaceful place to honor bears who are loved and remembered. Honeybrook allows memory to remain part of family and community life.",
 "Stillwater Pond":"🪷 Sit beside the water. Pray if you want. Think if you want. Say nothing if you want. Quiet is a complete activity.",
 "South Bridge Overlook":"🌉 From here, bears can watch the southern road and the bridge newcomers cross into Honeybrook—a gentle reminder that somebody is always arriving."
 };
 document.addEventListener("DOMContentLoaded",()=>document.querySelectorAll("[data-fr]").forEach(b=>b.onclick=()=>{
  const n=b.dataset.fr,x=document.getElementById("reflectionInfo");if(x)x.innerHTML=`<strong>${n}</strong><br>${d[n]}`;
  try{let a=JSON.parse(localStorage.getItem("honeybrook_explorer_discoveries_v1")||"[]"),t="Faith & Reflection: "+n;if(!a.includes(t)){a.push(t);localStorage.setItem("honeybrook_explorer_discoveries_v1",JSON.stringify(a))}}catch(e){}
 }));
})();

(function(){
 const d={
 "Welcome Bridge":"🌉 The southern crossing into Honeybrook. You do not need an invitation, résumé, special talent or completed quest to cross it.",
 "Visitor Welcome Stop":"🏡 Pick up a town map, ask for directions or simply look around. Nobody here immediately hands you a checklist.",
 "Welcome Wagon Stop":"🚐 The Welcome Wagon can meet newcomers who need help getting settled. Assistance is available without making every arrival an emergency.",
 "Honeybrook Road":"🛤️ Follow this road through town toward Town Square. Branch roads lead to Bridgeview, Main Street, the park and the rest of Honeybrook.",
 "Creek Overlook":"💧 A small stopping place beside Honeybrook Creek. Some visitors stand here for a while before deciding where to go next.",
 "Just Visit Bench":"🪑 No quest begins when you sit here. No progress bar appears. You are allowed to enter Honeybrook because you wanted to visit."
 };
 document.addEventListener("DOMContentLoaded",()=>document.querySelectorAll("[data-se]").forEach(b=>b.onclick=()=>{
  const n=b.dataset.se,x=document.getElementById("entranceInfo");if(x)x.innerHTML=`<strong>${n}</strong><br>${d[n]}`;
  try{let a=JSON.parse(localStorage.getItem("honeybrook_explorer_discoveries_v1")||"[]"),t="Southern Entrance: "+n;if(!a.includes(t)){a.push(t);localStorage.setItem("honeybrook_explorer_discoveries_v1",JSON.stringify(a))}}catch(e){}
 }));
})();

(function(){
 const d={
 "Ranger Boundary":"🛖 Honeybrook Rangers maintain the public trail to this point, post conditions and remind travelers to return before nightfall. They do not claim to understand everything beyond it.",
 "End of Public Trail":"🥾 The maintained path ends. Continuing farther is a choice, not an ordinary town stroll.",
 "Ancient Bridge":"🌉 This bridge predates Amelia Honeybrook and Tom Bridgewell. Its builders are unknown. A worn carving suggests it may once have had a name, but too little remains to read it.",
 "Incomplete Map Stone":"🗺️ Older route lines are visible, then stop abruptly. Honeybrook's modern maps label the region beyond as UNKNOWN TERRITORY rather than inventing details.",
 "Weathered Marking":"🪨 A symbol appears on old stone near the boundary. Similar markings have been reported elsewhere. No official interpretation has been accepted.",
 "Return to Honeybrook":"🏘️ Turn around and the ordinary town is still there—cafés, mail routes, school days, porches and all. Mystery does not erase everyday Honeybrook."
 };
 document.addEventListener("DOMContentLoaded",()=>document.querySelectorAll("[data-ne]").forEach(b=>b.onclick=()=>{
  const n=b.dataset.ne,x=document.getElementById("northernEdgeInfo");if(x)x.innerHTML=`<strong>${n}</strong><br>${d[n]}`;
  try{let a=JSON.parse(localStorage.getItem("honeybrook_explorer_discoveries_v1")||"[]"),t="Northern Edge: "+n;if(!a.includes(t)){a.push(t);localStorage.setItem("honeybrook_explorer_discoveries_v1",JSON.stringify(a))}}catch(e){}
 }));
})();

(function(){
 const d={
 "Ancient Pillars":"🏛️ Broken pillars stand among roots and moss. Their style does not match Amelia-era Honeybrook, the Three Bears legend as commonly told, or any confirmed modern structure.",
 "Ancient Beartree":"🌳 An enormous Beartree with paw-shaped leaves. Rings cannot be counted without damaging it, so Honeybrook has left the question of its age alone.",
 "Singing Pond":"🪷 By daylight, the pond appears calm. Old accounts claim music can sometimes be heard here around midnight. Rangers have not issued an official explanation.",
 "Giant Mushroom Hollow":"🍄 Mushrooms grow to unusual sizes in this hollow. They are impressive, slightly ridiculous, and not currently evidence of anything except very large mushrooms.",
 "Broken Path Marker":"🪧 A weathered marker points toward what looks like solid woodland. Older notes describe a path here. Modern visitors do not always find one.",
 "Distant Cottage Glimpse":"🏚️ Several travelers have reported seeing a cottage through the trees. Descriptions conflict, locations do not match, and no official map marks a building here. This is NOT confirmation of the Three Bears cottage."
 };
 document.addEventListener("DOMContentLoaded",()=>document.querySelectorAll("[data-nw]").forEach(b=>b.onclick=()=>{
  const n=b.dataset.nw,x=document.getElementById("woodsInfo");if(x)x.innerHTML=`<strong>${n}</strong><br>${d[n]}`;
  try{let a=JSON.parse(localStorage.getItem("honeybrook_explorer_discoveries_v1")||"[]"),t="Northern Woods: "+n;if(!a.includes(t)){a.push(t);localStorage.setItem("honeybrook_explorer_discoveries_v1",JSON.stringify(a))}}catch(e){}
 }));
})();

(function(){
 const states={
 morning:{label:"Morning",town:"The Honey Mug is serving breakfast, school paths are busy, Harold has started his mail route, and Main Street shutters are opening.",bears:"Miss Patty, Harold Pawst, Professor Honeywell, school cubs and early shoppers are easiest to encounter.",woods:"Morning mist sits low among the trees. Rangers consider daylight the clearest time to use the maintained routes."},
 afternoon:{label:"Afternoon",town:"Main Street is busiest, classes and errands overlap, Benny Scoops is roaming, and the park begins filling up.",bears:"Wally, Templar, Benny Scoops, students, shoppers and park visitors move through several districts.",woods:"Sunlight reaches farther between the trees. Ancient stonework is easier to notice, but distant landmarks remain unreliable."},
 evening:{label:"Evening",town:"Porches fill in Bridgeview, restaurants get busy, Harmony Hill warms up, and recreation shifts toward shows, skating and bowling.",bears:"Big Mama, the Hearthwells, performers, diners and neighborhood families are more likely to be out.",woods:"The light thins quickly beneath the canopy. Rangers begin encouraging casual visitors to turn back."},
 night:{label:"Night",town:"Streetlamps glow, late shows continue, porches quiet down, emergency services remain active, and most ordinary businesses close.",bears:"Night-shift workers, theater crowds, older teens with permission, and a few stubborn porch-sitters remain out.",woods:"The maintained public trail is no longer recommended for casual exploration. Some landmarks are reported differently after dark."}
 };
 function actual(){let h=new Date().getHours();return h<12?"morning":h<17?"afternoon":h<21?"evening":"night"}
 function setTime(k){
   if(k==="auto"){localStorage.removeItem("honeybrook_time_preview");k=actual()}else localStorage.setItem("honeybrook_time_preview",k);
   document.body.classList.remove("hb-morning","hb-afternoon","hb-evening","hb-night");document.body.classList.add("hb-"+k);
   let s=states[k], clock=document.getElementById("hbClock"),period=document.getElementById("hbPeriod");
   if(clock)clock.textContent="Honeybrook Time — "+s.label;
   if(period)period.textContent=(localStorage.getItem("honeybrook_time_preview")?"Preview mode":"Following your current local hour")+" • "+new Date().toLocaleTimeString([], {hour:"numeric",minute:"2-digit"});
   ["town","bear","woods"].forEach(x=>{let e=document.getElementById(x+"Rhythm");if(e)e.textContent=s[x]});
   document.querySelectorAll("[data-time]").forEach(b=>b.classList.toggle("active",(b.dataset.time===k)||(!localStorage.getItem("honeybrook_time_preview")&&b.dataset.time==="auto")));
 }
 document.addEventListener("DOMContentLoaded",()=>{
   document.querySelectorAll("[data-time]").forEach(b=>b.onclick=()=>setTime(b.dataset.time));
   setTime(localStorage.getItem("honeybrook_time_preview")||"auto");
   let scene=document.querySelector(".nw-scene");
   if(scene&&!scene.querySelector(".night-only-clue")){
     let c=document.createElement("div");c.className="night-only-clue";c.innerHTML="🌙 <strong>After-dark report:</strong> A faint sound seems to come from the direction of the Singing Pond. The source is not visible.";
     c.style.cssText="position:absolute;z-index:10;left:50%;bottom:1%;transform:translateX(-50%);width:70%;padding:.45rem .7rem;border-radius:10px;background:#18232ddd;color:#f1e7bd;text-align:center;font-size:.68rem";
     scene.appendChild(c);
   }
 });
})();

(function(){
 const R={
 "Harold Pawst":{icon:"📬",home:"Bridgeview",close:"Miss Patty • Big Mama • half the town whether he admits it or not",r:{morning:["Post Office → Main Street","Sorting and beginning deliveries.","I DELIVER MAIL. I DO NOT DELIVER MESSAGES."],afternoon:["Bridgeview → Scholars' Quarter","Finishing neighborhood and school deliveries.","Yes, I already gave Big Mama her mail. No, I am not telling you what she said."],evening:["Post Office","Closing out the route and sorting tomorrow's bundles.","My shift is OVER. ...Who needs what?"],night:["Home","Off duty. Allegedly.","If that package is not on fire, it can wait until morning."]}},
 "Miss Patty Peaches":{icon:"☕",home:"Near Main Street",close:"Wally • Harold • regular café crowd",r:{morning:["Honey Mug Café","Breakfast rush.","Sit down, baby. You look like you haven't eaten."],afternoon:["Honey Mug Café","Lunch, coffee and everybody's business.","I don't gossip. Bears simply tell me things."],evening:["Honey Mug Café","Dinner crowd and cleanup.","Take this plate with you. Don't argue."],night:["Home","Resting after closing.","The café will still be there tomorrow."]}},
 "Big Mama Mary":{icon:"🪑",home:"Bridgeview Cottage",close:"The entire Hearthwell family",r:{morning:["Big Mama's Cottage","Breakfast, family check-ins and porch surveillance.","WHOSE CHILD IS THAT?"],afternoon:["Bridgeview / errands","Checking on family and somehow knowing everything.","Your mama know you over here?"],evening:["Front Porch","Prime porch-watch hours.","Pull up a paw. And don't start no mess."],night:["Big Mama's Cottage","Inside—still somehow aware of outside.","I know y'all ain't headed toward them damn woods."]}},
 "Professor Honeywell":{icon:"📚",home:"Scholars' Quarter",close:"Students • Sammy's educational legacy",r:{morning:["Honeybrook School","Classes and individual help.","Never ask whether a bear can learn. Ask how."],afternoon:["Learning Commons","Lessons, tutoring and adult learners.","We can try another way."],evening:["Bear Claw Library","Reading, planning and occasional evening study.","Learning does not have an expiration date."],night:["Home","Reading and preparing tomorrow's lessons.","Even professors eventually close the book."]}},
 "Templar Hearthwell":{icon:"💻",home:"Bridgeview",close:"Buddy • Hearthwell family • half her unfinished ideas",r:{morning:["Technology Center","Projects, learning and fixing something she touched yesterday.","If I forgot it, I'll learn it again."],afternoon:["Business Center / Main Street","Helping businesses, making things and starting three new ideas.","Wait—what if Honeybrook ALSO had—"],evening:["Hearthwell Home","Family time, studying and probably another project.","Baby, I got one more idea."],night:["Hearthwell Home","Supposed to be resting.","I'm just checking ONE thing."]}},
 "Buddy Hearthwell":{icon:"🧰",home:"Bridgeview",close:"Templar • Hearthwell family • Tom's builder legacy",r:{morning:["Bridgeview / town errands","Practical jobs, safety checks and family logistics.","Baby...we ain't even built the building yet."],afternoon:["Around Town","Helping where needed and preventing unnecessary disasters.","Wasn't nothing wrong with that before you touched it."],evening:["Hearthwell Home","Family time.","It's smoking."],night:["Hearthwell Home","Trying to convince Templar that sleep exists.","Put the project DOWN."]}},
 "Jonesha Hearthwell":{icon:"🧭",home:"Bridgeview",close:"Hearthwell siblings • adventure crowd",r:{morning:["Bridgeview / Town","Normal errands before adventure finds her.","I ain't doing nothing."],afternoon:["Outskirts","Exploring old roads and noticing things.","Okay...THAT wasn't on the map."],evening:["Northern Edge","Only if conditions allow; she knows the warnings.","I'm just LOOKING."],night:["Bridgeview","She is absolutely supposed to be home.","I ain't even say nothing!"]}},
 "Benny Scoops":{icon:"🍦",home:"South Honeybrook",close:"Every cub who hears his bell",r:{morning:["Preparing Cart","Stocking BEARy Cold treats.","Too early for ice cream? Says who?"],afternoon:["Park → Bridgeview → Main Street","Roaming route. The bell causes financial distress.","ICE CREAM!" ],evening:["Community Park","Last rounds near families and events.","Last call before I roll home!"],night:["Home","Cart parked.","Even the ice cream bear sleeps."]}}
 };
 function period(){let p=localStorage.getItem("honeybrook_time_preview");if(p)return p;let h=new Date().getHours();return h<12?"morning":h<17?"afternoon":h<21?"evening":"night"}
 function show(n){let x=R[n],p=period(),v=x.r[p],e=document.getElementById("residentCard");if(!e)return;e.innerHTML=`<h3>${x.icon} ${n}</h3><div class="resident-meta"><div><strong>Home</strong><br>${x.home}</div><div><strong>Close Circle</strong><br>${x.close}</div></div><p><strong>Current likely location:</strong> ${v[0]}</p><p><strong>What they're doing:</strong> ${v[1]}</p><p><strong>If you meet them:</strong> “${v[2]}”</p>`}
 function route(){let p=period(),h=R["Harold Pawst"].r[p],b=R["Benny Scoops"].r[p],e=document.getElementById("movingRoute");if(e)e.innerHTML=`<strong>Harold:</strong> ${h[0]} — ${h[1]}<br><strong>Benny Scoops:</strong> ${b[0]} — ${b[1]}`}
 document.addEventListener("DOMContentLoaded",()=>{let box=document.getElementById("residentButtons");if(box){Object.keys(R).forEach(n=>{let b=document.createElement("button");b.innerHTML=`${R[n].icon}<br>${n}`;b.onclick=()=>show(n);box.appendChild(b)});show("Harold Pawst")}route();document.querySelectorAll("[data-time]").forEach(b=>b.addEventListener("click",()=>setTimeout(()=>{show("Harold Pawst");route()},20)))});
})();

(function(){
 const E={
 morning:[
 ["☕ Honey Mug Café","Breakfast Business","Miss Patty slides a plate toward Harold before he can object.<br><b>Harold:</b> “I came in for coffee.”<br><b>Miss Patty:</b> “And left with breakfast. Look at God.”<br><b>Harold:</b> “...thank you, Patty.”"],
 ["📚 Honeybrook School","The Missing Pencil","Professor Honeywell watches Benny Newberry search every pocket twice.<br><b>Professor:</b> “Check behind your ear.”<br><b>Benny:</b> “...I knew that.”<br><b>Professor:</b> “Naturally.”"],
 ["🏡 Bridgeview","Porch Radar","Big Mama spots a cub moving suspiciously fast past her cottage.<br><b>Big Mama:</b> “WHERE YOU GOING?”<br><b>Cub:</b> “School!”<br><b>Big Mama:</b> “THEN WHY SCHOOL THE OTHER WAY?”"]
 ],
 afternoon:[
 ["📬 Bridgeview","Special Delivery","Harold approaches Big Mama's porch carrying a box.<br><b>Harold:</b> “Miss Mary, package for Templar.”<br><b>Big Mama:</b> “What she done ordered now?”<br><b>Harold:</b> “I don't know.”<br><b>Big Mama:</b> 👀<br><b>Harold:</b> “...technology equipment.”<br><b>Big Mama:</b> “I THOUGHT YOU DIDN'T KNOW.”"],
 ["🧁 Cub Cakes & Crumbs","Wally Did It Again","Wally stares at six trays of cupcakes and one very empty order sheet.<br><b>Templar:</b> “Wally. How many did they ORDER?”<br><b>Wally:</b> “Two dozen.”<br><b>Templar:</b> “WHY ARE THERE NINE DOZEN?”<br><b>Wally:</b> “I got inspired.”"],
 ["🍦 Community Park","That Bell","Benny Scoops rings the cart bell once.<br>Three cubs appear from directions that should not be physically possible.<br><b>Parent on bench:</b> “Benny, I JUST paid you yesterday.”<br><b>Benny:</b> “And I appreciate your continued support.”"]
 ],
 evening:[
 ["🪑 Bridgeview Porch","Pull Up a Paw","Miss Patty brings Big Mama coffee and sits down without asking.<br><b>Big Mama:</b> “You heard what happened on Main Street?”<br><b>Miss Patty:</b> “No.”<br>They stare at each other.<br><b>Miss Patty:</b> “Start from the beginning.”"],
 ["🎮 Hearthwell Home","Sore Loser Championship","Lance wins a game. Landis objects to reality.<br><b>Landis:</b> “THAT DIDN'T COUNT.”<br><b>Lance:</b> “It counted when YOU was winning!”<br><b>Buddy, from another room:</b> “If I have to come in there, BOTH controllers belong to me.”"],
 ["🎵 Harmony Hill","No Audition Required","Robin starts singing near the outdoor stage. Melody joins in. A few bears stop walking just to listen.<br>Nobody awards points. Nobody announces a winner. For a few minutes, Honeybrook simply has music."]
 ],
 night:[
 ["🏠 Hearthwell Home","One More Thing","Buddy finds Templar staring at a project after midnight.<br><b>Buddy:</b> “Baby.”<br><b>Templar:</b> “I'm almost done.”<br><b>Buddy:</b> “You said that two ideas ago.”"],
 ["📬 Harold's Home","OFF DUTY","A knock comes at Harold's door.<br><b>Harold:</b> “If that package is not on FIRE—”<br><b>Voice outside:</b> “It's Miss Patty. I brought pie.”<br>Pause.<br><b>Harold:</b> “...that's different.”"],
 ["🌲 Bridgeview","Grandmama Radar","Jonesha quietly reaches for the front door.<br><b>Big Mama, from somewhere impossible to locate:</b> “JONESHA.”<br><b>Jonesha:</b> “I AIN'T EVEN DO NOTHING.”<br><b>Big Mama:</b> “YOUR FACE DID.”"]
 ]};
 let last=-1;
 function p(){let q=localStorage.getItem("honeybrook_time_preview");if(q)return q;let h=new Date().getHours();return h<12?"morning":h<17?"afternoon":h<21?"evening":"night"}
 function draw(){let k=p(),a=E[k],i=Math.floor(Math.random()*a.length);if(a.length>1&&i===last)i=(i+1)%a.length;last=i;let x=a[i],c=document.getElementById("encounterCard"),s=document.getElementById("encounterPeriod");if(c)c.innerHTML=`<span class="encounter-tag">${k.toUpperCase()} • ${x[0]}</span><h3>${x[1]}</h3><div class="encounter-dialogue">${x[2]}</div><small>Ordinary Honeybrook moment • No quest required.</small>`;if(s)s.textContent=`Showing a ${k} encounter.`}
 document.addEventListener("DOMContentLoaded",()=>{let b=document.getElementById("newEncounter");if(b)b.onclick=draw;draw();document.querySelectorAll("[data-time]").forEach(x=>x.addEventListener("click",()=>setTimeout(draw,30)))});
})();

(function(){
 const bears={
 "Harold Pawst":["📬","First meeting: Harold gives a professional nod and checks the address twice.","Harold recognizes you now. He still insists this does NOT mean he is available for gossip.","“Morning. Your mail ain't here, but since you're standing there—how you doing?”"],
 "Miss Patty Peaches":["☕","First meeting: Miss Patty asks your name and whether you've eaten.","Miss Patty remembers your face—and probably your usual table before you do.","“There you are, baby. Sit down. Coffee?”"],
 "Big Mama Mary":["🪑","First meeting: Big Mama asks who your people are, then immediately makes room on the porch anyway.","Big Mama knows you now. This comes with warmth, questions and absolutely no sneaking past the porch.","“Come on over here. Pull up a paw.”"],
 "Professor Honeywell":["📚","First meeting: Professor Honeywell asks what you're curious about—not what you're already good at.","The Professor remembers how you like to learn and doesn't make you start over proving yourself.","“Good to see you again. What are we wondering about today?”"],
 "Templar Hearthwell":["💻","First meeting: Templar is probably halfway through explaining three projects before remembering to introduce herself.","Templar remembers you—and may have had another idea since last time.","“Okay, hear me out. I thought of something.”"],
 "Buddy Hearthwell":["🧰","First meeting: Buddy offers a steady hello and quietly figures out whether anything nearby needs fixing.","Buddy remembers you. If Templar has involved you in a project, his expression already says he knows.","“Good to see you. She got you helping with something, didn't she?”"],
 "Jonesha Hearthwell":["🧭","First meeting: Jonesha sizes you up, says little, and notices whether you keep looking toward the woods.","Jonesha remembers whether you seem adventurous—but she does not automatically invite you beyond ranger boundaries.","“You back. Good. And no, I wasn't headed nowhere.”"],
 "Benny Scoops":["🍦","First meeting: Benny rings the bell and presents the menu like this is a major civic ceremony.","Benny remembers returning customers with alarming accuracy.","“Look who came back! Same thing, or we being adventurous today?”"]
 };
 const key="honeybrook_relationship_memory_v1";
 function get(){try{return JSON.parse(localStorage.getItem(key)||"{}")}catch(e){return {}}}
 function put(x){localStorage.setItem(key,JSON.stringify(x))}
 function renderList(){let box=document.getElementById("relationshipList");if(!box)return;let m=get();box.innerHTML="";Object.entries(bears).forEach(([n,v])=>{let b=document.createElement("button");if(m[n])b.classList.add("met");b.innerHTML=`${v[0]} ${n}<br><small>${m[n]?"✓ We've met":"Not introduced yet"}</small>`;b.onclick=()=>show(n);box.appendChild(b)})}
 function show(n){let v=bears[n],m=get(),met=!!m[n],c=document.getElementById("relationshipCard");if(!c)return;c.innerHTML=`<h3>${v[0]} ${n}</h3><div class="memory-note">${met?v[2]:v[1]}</div>${met?`<p><strong>Honeybrook remembers:</strong> ${v[2]}</p><p><em>${v[3]}</em></p>`:`<button class="meet-action" id="meetBear">👋 Introduce Yourself</button><p><small>No friendship points. No streak. Just a hello.</small></p>`}`;if(!met){document.getElementById("meetBear").onclick=()=>{m=get();m[n]={met:true,when:new Date().toISOString()};put(m);renderList();show(n)}}}
 document.addEventListener("DOMContentLoaded",()=>{renderList();show("Miss Patty Peaches")});
})();

(function(){
 const K="honeybrook_continuity_v1";
 function state(){try{return JSON.parse(localStorage.getItem(K)||"{}")}catch(e){return {}}}
 function save(s){localStorage.setItem(K,JSON.stringify(s))}
 function discoveries(){try{return JSON.parse(localStorage.getItem("honeybrook_explorer_discoveries_v1")||"[]")}catch(e){return []}}
 function relationships(){try{return JSON.parse(localStorage.getItem("honeybrook_relationship_memory_v1")||"{}")}catch(e){return {}}}
 function result(t){let e=document.getElementById("continuityResult");if(e)e.innerHTML="<strong>Honeybrook Thread:</strong> "+t}
 function update(){let s=state(),d=discoveries(),r=relationships();
  let a=document.getElementById("cupcakesState");if(a)a.textContent=s.cupcakes?"✓ You helped Wally share the extras.":"Nothing recorded yet.";
  let b=document.getElementById("mailState");if(b)b.textContent=s.mail?"✓ A delivery remembered you.":(r["Harold Pawst"]?"Harold knows you; a callback is available.":"Meet Harold first for a personal callback.");
  let seen=d.some(x=>String(x).includes("Weathered Marking")||String(x).includes("Old Northern Marking"));
  let c=document.getElementById("markingState");if(c)c.textContent=s.marking?"✓ The library connected your observation to an older record.":(seen?"You have something specific to ask about.":"You haven't personally recorded the old marking yet.");
  let q=document.getElementById("cafeState");if(q)q.textContent=s.cafe?"✓ Miss Patty heard about the cupcake rescue.":(s.cupcakes?"Word may have traveled.":"No special callback yet.");
 }
 function act(x){let s=state(),d=discoveries(),r=relationships();
  if(x==="cupcakes"){s.cupcakes=true;save(s);result("You help Wally box the extras for the Welcome House, Community Kitchen and a few neighbors. Wally is grateful. Templar reminds him this does not count as inventory management.")}
  if(x==="mail"){if(r["Harold Pawst"]){s.mail=true;save(s);result('Harold spots you before checking the label. “Oh—it’s you. Hold on, I think I got something for your side of town.” Honeybrook remembered the introduction.')}else result("Harold is polite but doesn't know you yet. Introduce yourself in Relationship Memory first, then this delivery can change.")}
  if(x==="marking"){let seen=d.some(v=>String(v).includes("Weathered Marking")||String(v).includes("Old Northern Marking"));if(seen){s.marking=true;save(s);result("At Bear Claw Library, an old field sketch shows a symbol similar to the one you recorded. The note beside it is incomplete. This confirms a connection—not an explanation.")}else result("The librarian can show general Northern Woods records, but you haven't personally found the weathered marking yet. Honeybrook won't pretend you did.")}
  if(x==="cafe"){if(s.cupcakes){s.cafe=true;save(s);result('Miss Patty sets down your cup. “Wally told me you helped him with that cupcake situation. Bless him—good baker, absolutely no sense of quantity.” A small act followed you across town.')}else result("Miss Patty chats with you about the day. Nothing special needs to happen every time you visit.")}
  update()
 }
 document.addEventListener("DOMContentLoaded",()=>{document.querySelectorAll("[data-thread]").forEach(b=>b.onclick=()=>act(b.dataset.thread));update()});
})();

(function(){
 const K="honeybrook_wandering_day_v1";
 const P={
 "Honey Mug Café":["☕","Main Street","Miss Patty is usually somewhere nearby.","Sit for coffee, breakfast, conversation—or simply occupy a table without accomplishing anything."],
 "Bridgeview":["🏡","Bridgeview","Big Mama, Hearthwells, Harold or neighborhood bears may cross your path.","Walk the neighborhood, sit on a porch, visit the Commons or listen to ordinary neighborhood life."],
 "Town Square":["🏛️","Town Square","Civic workers, shoppers, Harold and event traffic come through here.","Check the town clock, monument, Gazette, Post Office or just people-watch."],
 "Scholars' Quarter":["📚","Scholars' Quarter","Professor Honeywell, students and adult learners are common here.","Learn something if you want. Read something if you want. Leaving without studying is also allowed."],
 "Technology Center":["💻","Scholars' Quarter","Templar may be working here during the day.","Explore computers, projects and practical learning—or watch Templar start something Buddy specifically did not request."],
 "Harmony Hill":["🎵","Harmony Hill","Robin, Melody, artists and performers drift through.","Listen, sing, draw, rehearse, watch—or sit on the lawn and enjoy somebody else's creativity."],
 "Community Park":["🌳","Community Park","Families, Benny Scoops and ordinary park visitors rotate through.","Walk, picnic, play, fish, buy ice cream or sit under the Quiet Tree."],
 "Main Street":["🛍️","Main Street","Wally, Miss Patty, shoppers and business owners are busiest here.","Browse, eat, shop, help somebody—or mind your own bear business."],
 "Entertainment District":["🎳","Entertainment & Play","Gamers, families, teens and show crowds appear by time of day.","Bowling, skating, arcade, theater, game show, pool, mini golf—or just watch."],
 "Welcome House":["🤝","Care & Community","Mabel, Toby, Nora and Calvin help newcomers settle in.","Visit the porch, ask questions, share a meal or meet somebody new."],
 "Faith & Reflection":["🌷","Faith & Reflection","Miss Grace and community visitors may be nearby.","Worship, reflect, help with outreach, remember someone, or sit quietly."],
 "Northern Edge":["🌲","Northern Edge","Rangers and occasional curious bears pass through.","Observe the boundary and old bridge. Going farther is never required."]
 };
 function period(){let q=localStorage.getItem("honeybrook_time_preview");if(q)return q;let h=new Date().getHours();return h<12?"morning":h<17?"afternoon":h<21?"evening":"night"}
 function journal(){try{return JSON.parse(localStorage.getItem(K)||"[]")}catch(e){return []}}
 function save(a){localStorage.setItem(K,JSON.stringify(a))}
 function renderJournal(){let a=journal(),e=document.getElementById("dayJournal");if(!e)return;e.innerHTML=a.length?a.map(x=>`<div class="wander-entry"><strong>${x.icon} ${x.place}</strong> <small>• ${x.period}</small><br>${x.note}</div>`).join(""):"You haven't gone anywhere yet—and that is completely fine."}
 function go(n){let v=P[n],p=period(),e=document.getElementById("arrivalCard");let timeNote=p==="night"&&n==="Northern Edge"?"Rangers recommend casual visitors remain on the town side after dark. You can look without continuing into the woods.":`It's ${p} in Honeybrook. ${v[2]}`;if(e)e.innerHTML=`<h3>${v[0]} ${n}</h3><p><strong>${v[1]}</strong></p><p>${timeNote}</p><p>${v[3]}</p><p><em>No objective has been assigned.</em></p>`;let a=journal();a.push({place:n,icon:v[0],period:p,note:v[3]});if(a.length>12)a=a.slice(-12);save(a);renderJournal()}
 document.addEventListener("DOMContentLoaded",()=>{let g=document.getElementById("travelGrid");if(g){Object.keys(P).forEach(n=>{let b=document.createElement("button");b.innerHTML=`${P[n][0]}<br>${n}`;b.onclick=()=>go(n);g.appendChild(b)})}let c=document.getElementById("clearDay");if(c)c.onclick=()=>{localStorage.removeItem(K);renderJournal();let a=document.getElementById("arrivalCard");if(a)a.innerHTML="<h3>🧸 Fresh Wandering Day</h3><p>Go somewhere, stay somewhere, or do nothing for a minute. Honeybrook is still here.</p>"};renderJournal()});
})();

(function(){
 const R={
 "Honey Mug Café":{icon:"☕",intro:"The bell above the door gives one little chime. Warm light, coffee, breakfast smells and low conversation make the room feel occupied without feeling crowded.",zones:[["Counter","Miss Patty works here and notices more than she admits."],["Window Booth","A good place to eat, read, watch Main Street or do absolutely nothing."],["Community Table","Neighbors drift in and out; nobody owns the chair forever."]],actions:[["Order Something","Miss Patty: “Sit down, baby. I got you.” No productivity required."],["Sit by the Window","Main Street carries on outside. For once, nobody needs anything from you."],["Listen a Minute","You catch ordinary conversation—weather, somebody's garden, Wally's latest baking math."]]},
 "Hearthwell Home":{icon:"🏡",intro:"A lived-in family home in Bridgeview: shoes, chargers, toys, projects, voices and evidence that several bears were just in this room.",zones:[["Front Porch","Big Mama may be within conversational range whether she is technically here or not."],["Family Room","Games, arguments, television, laughter and somebody looking for a remote."],["Templar's Work Corner","A project is open. There are probably three more behind it."]],actions:[["Sit With the Family","Nothing major happens. That is the point."],["Check the Work Corner","Buddy: “Don't encourage her.” Templar: “I didn't even say anything!”"],["Find the Remote","Lance says Landis had it. Landis says Lance had it. The remote is under a cushion."]]},
 "Honeybrook Post Office":{icon:"📬",intro:"Mail slots, parcel shelves, route maps and Harold's extremely organized counter make this one of Honeybrook's quiet little circulatory systems.",zones:[["Service Counter","Stamps, parcels and Harold Pawst's professional patience."],["Sorting Wall","Routes branch toward every district and several bridges."],["Community Board","Notices, lost-and-found cards, event flyers and handwritten reminders."]],actions:[["Check the Board","Today's board has a bake sale notice, a lost scarf and a reminder about the Festival of Bridges."],["Say Hello to Harold","Harold: “Hello. And before you ask—I deliver MAIL.”"],["Mail a Note","You can leave a simple Bear Mail note. Honeybrook does not require a reason."]]},
 "Technology Center":{icon:"💻",intro:"Computers, repair benches, learning stations and half-finished ideas fill the space descended from Templar Hearthwell's first little workshop.",zones:[["Computer Lab","Practice, explore, code, research or relearn something forgotten."],["Repair Bench","Old devices and harmless practice equipment wait to be understood."],["Idea Wall","Notes remind visitors that forgetting is not the same as failing."]],actions:[["Practice Something","The center opens a learning mindset: try it, mess up, learn, try again."],["Read the Plaque","“If you don't understand it, learn it. If you forgot it, learn it again.”"],["Do Nothing Technical","You sit in a chair. The computers survive this decision."]]},
 "Welcome House":{icon:"🤝",intro:"The porch light stays warm. Inside are temporary rooms, a community kitchen, practical supplies and people who know that arriving without a plan is still arriving.",zones:[["Welcome Porch","A place to sit before deciding anything."],["Community Kitchen","Food, tea and conversation without an entrance exam."],["Information Room","Maps, town basics, school information and help figuring out next steps."]],actions:[["Ask for a Town Map","A Welcome Wagon Bear gives you one without asking what you intend to accomplish."],["Share a Meal","Somebody passes the bread. Nobody asks what talent you brought to Honeybrook."],["Just Sit","You are allowed to need a minute."]]},
 "Bear Claw Library":{icon:"📚",intro:"Shelves hold stories, town records, old newspapers, research notes and a growing collection of things Honeybrook still does not understand.",zones:[["Reading Room","Soft chairs, long tables and books that do not care how fast you read."],["Town Archives","Founding records, Gazette issues, bridge plans and family histories."],["Northern Woods Cabinet","Restricted only by preservation rules—not dramatic secrecy. Several records contradict each other."]],actions:[["Read for Pleasure","No quiz appears afterward."],["Browse Town History","Amelia, Tom, Sammy and the early settlement appear across old records."],["Check Woods Records","The oldest notes disagree. The library labels uncertainty instead of inventing certainty."]]}
 };
 let current="";
 function openRoom(n){current=n;let r=R[n],e=document.getElementById("interiorRoom");if(!e)return;e.innerHTML=`<h3>${r.icon} Inside ${n}</h3><p>${r.intro}</p><div class="room-zones">${r.zones.map(z=>`<div class="room-zone"><strong>${z[0]}</strong><p>${z[1]}</p></div>`).join("")}</div><div class="room-actions">${r.actions.map((a,i)=>`<button data-room-action="${i}">${a[0]}</button>`).join("")}</div><div class="room-result" id="roomResult">Choose something—or don't. The room won't rush you.</div>`;document.querySelectorAll("[data-room-action]").forEach(b=>b.onclick=()=>{document.getElementById("roomResult").textContent=r.actions[+b.dataset.roomAction][1]})}
 document.addEventListener("DOMContentLoaded",()=>{let t=document.getElementById("interiorTabs");if(t){Object.keys(R).forEach(n=>{let b=document.createElement("button");b.textContent=R[n].icon+" "+n;b.onclick=()=>openRoom(n);t.appendChild(b)})}openRoom("Honey Mug Café")});
})();

(function(){
 const F={
 "Papa Newberry":{icon:"👔",need:"A new direction for work",place:"Business Center",scene:'Papa studies the business board longer than he means to.<br><b>Boss Bear:</b> “Looking to start something?”<br><b>Papa:</b> “I don’t even know what I’m looking to do yet.”<br><b>Boss Bear:</b> “Good. Then we don’t have to pretend you do.”'},
 "Mama Newberry":{icon:"🌷",need:"Remembering what she enjoys",place:"Harmony Hill",scene:'Mama pauses outside Harmony Hall when she hears singing.<br><b>Mama:</b> “I used to love music.”<br><b>Welcome Bear:</b> “Used to?”<br>She smiles, but doesn’t answer yet.'},
 "Bailey":{icon:"🎮",need:"Tech, games and an uncertain future",place:"Technology Center",scene:'Bailey checks out the gaming and computer stations.<br><b>Templar:</b> “You trying to pick a career?”<br><b>Bailey:</b> “Everybody keeps asking me that.”<br><b>Templar:</b> “Then I won’t. What do you want to mess with first?”'},
 "Benny Newberry":{icon:"📘",need:"Learning without feeling stupid",place:"Scholars' Quarter",scene:'Benny stares at a worksheet like it personally offended him.<br><b>Professor Honeywell:</b> “Want to try it another way?”<br><b>Benny:</b> “There’s another way?”<br><b>Professor:</b> “There is now.”'},
 "Bella":{icon:"📖",need:"A quiet place for imagination",place:"Bear Claw Library",scene:'Bella finds the story corner and disappears into a chair twice her size.<br><b>Storytime Bear:</b> “You like fairy tales?”<br>Bella nods.<br><b>Storytime Bear:</b> “Honeybrook has a few stories of its own.”'},
 "Grandpa Newberry":{icon:"🧓",need:"Absolutely nothing, according to Grandpa",place:"Bridgeview",scene:'Grandpa folds his arms on the Welcome House porch.<br><b>Grandpa:</b> “I was fine where I was.”<br>Later, Benny Scoops rings the ice-cream bell.<br><b>Grandpa:</b> “…what kind they got?”'}
 };
 function show(n){let f=F[n],r=document.getElementById("arrivalResult");if(r)r.innerHTML=`<strong>${f.icon} Following ${n} → ${f.place}</strong><p>${f.scene}</p><small>Honeybrook offers a doorway, not a destiny.</small>`}
 document.addEventListener("DOMContentLoaded",()=>{let fam=document.getElementById("newberryFamily"),acts=document.getElementById("arrivalActions");Object.entries(F).forEach(([n,f])=>{if(fam){let d=document.createElement("button");d.className="newberry-bear";d.innerHTML=`<strong>${f.icon} ${n}</strong><small>${f.need}</small>`;d.onclick=()=>show(n);fam.appendChild(d)}if(acts){let b=document.createElement("button");b.textContent="Follow "+n.split(" ")[0];b.onclick=()=>show(n);acts.appendChild(b)}})});
})();

(function(){
 const T=[
 ["Festival of Bridges","April 18","A spring celebration of connection, old bridges and the bears who keep building new ones."],
 ["Harmony Festival","July 11","Music, singing, dance, art and outdoor performances across Harmony Hill."],
 ["Honey Harvest Fair","September 19","Food, crafts, harvest displays, games and autumn town life."],
 ["Founders' Day","October 8","Amelia, Tom, Sammy and the early settlement are remembered without turning founders into royalty."],
 ["Three Bears Heritage Weekend","November 7","Storytelling, porridge contests, museum exhibits and debate about Honeybrook's oldest legend."],
 ["Welcome Home Week","January 17","A winter tradition centered on newcomers, neighbors, shared meals and belonging."],
 ["Patchwell Kindness Day","February 21","Quiet acts of welcome inspired by Sammy Patchwell—no prizes for being kind."]
 ];
 function season(m){return m>=2&&m<=4?["🌷 Spring","Creek paths brighten and Honeybrook starts spending more time outside."]:m>=5&&m<=7?["☀️ Summer","Longer evenings bring music, park activity and late food-cart rounds."]:m>=8&&m<=10?["🍯 Autumn","Harvest season settles over town; porches, fairs and old stories get busier."]:["❄️ Winter","Honeybrook draws inward toward warm rooms, community meals and story nights."]}
 function notice(d){let day=d.getDay(),m=d.getMonth()+1,date=d.getDate();for(let x of T){let [name,md]=[x[0],x[1]],parts=md.split(" "),months={January:1,February:2,April:4,July:7,September:9,October:10,November:11};if(months[parts[0]]===m&&+parts[1]===date)return `<b>🎉 ${name} is today.</b><br>${x[2]}<br><small>Participation remains optional.</small>`}return day===0?"<b>🪑 Sunday pace:</b> Faith & Reflection, family meals, parks and quieter shops shape the day.":day===6?"<b>🌳 Weekend Honeybrook:</b> Parks, entertainment, Main Street and family visits tend to stay busier.":"<b>🏘️ Ordinary Honeybrook day:</b> School, work, errands, deliveries and little encounters carry the town. Nothing historic has to happen today."}
 document.addEventListener("DOMContentLoaded",()=>{let d=new Date(),s=season(d.getMonth());let a=document.getElementById("hbTodayDate"),b=document.getElementById("hbSeason"),c=document.getElementById("hbTodayNotice"),t=document.getElementById("hbTraditions");if(a)a.textContent=d.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"});if(b)b.innerHTML=`<b>${s[0]}</b> — ${s[1]}`;if(c)c.innerHTML=notice(d);if(t)t.innerHTML=T.map(x=>`<div class="tradition-row"><span><b>${x[0]}</b><br><small>${x[2]}</small></span><span>${x[1]}</span></div>`).join("")});
})();

(function(){
 const A=[
 {n:"Coding Classroom",i:"💻",m:["learn","build"],p:"Technology Center",d:"Rebuild coding skills through guided lessons, examples and practice projects.",x:"The computer lab opens a coding workspace. Start small, experiment, break something harmless, fix it, learn why."},
 {n:"Help Desk Lab",i:"🛠️",m:["learn","solve"],p:"Technology Center",d:"Practice common computer problems with specific troubleshooting steps.",x:"A practice machine has a problem waiting. Honeybrook gives you the symptoms—not the panic."},
 {n:"Microsoft Practice",i:"📊",m:["learn","build"],p:"Learning Commons",d:"Word, Excel, PowerPoint and office-skill practice in practical scenarios.",x:"Choose an Office practice lab whenever you're ready. No timed exam appears."},
 {n:"Greek Mythology Reading Room",i:"🏺",m:["read","explore"],p:"Bear Claw Library",d:"Read mythology, study figures and follow stories through the ancient world.",x:"The mythology shelves are open. Read one story or disappear into them for hours."},
 {n:"Fairy-Tale Collection",i:"🏰",m:["read","explore"],p:"Bear Claw Library",d:"Classic fairy tales, folklore and storybook reading.",x:"Storytime Bear points toward the fairy-tale shelves. No book report required."},
 {n:"Honeybrook History Mysteries",i:"🔎",m:["solve","explore"],p:"Town Archives",d:"Investigate founding clues, bridges, old records and unresolved local questions.",x:"An archive case file opens. Evidence is labeled separately from rumor."},
 {n:"Northern Woods Research",i:"🌲",m:["solve","explore"],p:"Library / Northern Edge",d:"Compare sightings, symbols and contradictory records without forcing an answer.",x:"The file contains observations, disagreements and blank spaces. Some mysteries stay mysteries."},
 {n:"Gamer Bear Game Shows",i:"🎤",m:["play"],p:"Gamer Bear Studio",d:"Game-show-style rounds inspired by word, quiz, survey and puzzle formats.",x:"Studio lights come up. Pick a game when you want competition; walk out when you don't."},
 {n:"Creative Workshop",i:"🎨",m:["build","play"],p:"Harmony Hill",d:"Write, design, sing, draw or make something simply because you feel like it.",x:"The workshop has supplies and no rubric."},
 {n:"Story Studio",i:"🎭",m:["play","explore"],p:"Honeybrook Theater",d:"Role-play as narrator, visitor or resident and create a scene around town.",x:"The curtain opens on whatever kind of Honeybrook day you want to tell."},
 {n:"Cozy Reading",i:"🫖",m:["read","rest"],p:"Library / Honey Mug",d:"Read quietly with no questions afterward.",x:"You find a comfortable spot. That is the entire activity."},
 {n:"Just Visit",i:"🪑",m:["rest"],p:"Anywhere",d:"No lesson. No game. No progress. Be in Honeybrook.",x:"Nothing launches. Honeybrook simply keeps existing around you."}
 ];
 function render(filter="all"){let e=document.getElementById("activityDirectory");if(!e)return;let list=filter==="all"?A:A.filter(a=>a.m.includes(filter));e.innerHTML=list.map((a,i)=>`<article class="activity-card"><span class="activity-place">${a.i} ${a.p}</span><h3>${a.n}</h3><p>${a.d}</p><button data-act="${A.indexOf(a)}">Enter</button></article>`).join("");document.querySelectorAll("[data-act]").forEach(b=>b.onclick=()=>launch(+b.dataset.act))}
 function launch(i){let a=A[i],e=document.getElementById("activityLaunch");if(e)e.innerHTML=`<h3>${a.i} ${a.n}</h3><p><b>${a.p}</b></p><p>${a.x}</p><small>Honeybrook rule: you may stop whenever you want.</small>`}
 document.addEventListener("DOMContentLoaded",()=>{let moods=[["all","🏘️ Everything"],["learn","📚 Learn"],["play","🎮 Play"],["read","📖 Read"],["solve","🔎 Solve"],["build","🧰 Create"],["explore","🧭 Explore"],["rest","🪑 Just Be"]],m=document.getElementById("moodButtons");if(m)moods.forEach(x=>{let b=document.createElement("button");b.textContent=x[1];b.onclick=()=>render(x[0]);m.appendChild(b)});render()});
})();

(function(){
 const K="honeybrook_visitor_passport_v1";
 function get(){try{return JSON.parse(localStorage.getItem(K)||"null")}catch(e){return null}}
 function render(p){let c=document.getElementById("passportCard");if(!c)return;if(!p){c.innerHTML="<h3>🍯 HONEYBROOK VISITOR</h3><p>There's a place for every bear.</p><p>Create your visitor bear whenever you feel like it.</p>";return}let rel={};try{rel=JSON.parse(localStorage.getItem("honeybrook_relationship_memory_v1")||"{}")}catch(e){}let wander=[];try{wander=JSON.parse(localStorage.getItem("honeybrook_wandering_day_v1")||"[]")}catch(e){};c.innerHTML=`<span class="passport-stamp">HONEYBROOK<br>VISITOR</span><h3>${p.name||"Unnamed Bear"} 🧸</h3><p><b>Here because:</b> ${p.reason}</p><p><b>Today's style:</b> ${p.style}</p><p><b>Might enjoy:</b> ${p.likes.length?p.likes.join(", "):"Still figuring that out"}</p><div class="passport-memory"><b>Town memory</b><br>${Object.keys(rel).length} resident introduction${Object.keys(rel).length===1?"":"s"} remembered • ${wander.length} wandering stop${wander.length===1?"":"s"} in the current journal</div><p><small>Issued with no career requirement, talent test or expiration date.</small></p>`}
 document.addEventListener("DOMContentLoaded",()=>{let p=get(),f=document.getElementById("passportForm");if(p&&f){document.getElementById("bearName").value=p.name||"";document.getElementById("bearReason").value=p.reason;document.getElementById("bearStyle").value=p.style;document.querySelectorAll('input[name="likes"]').forEach(x=>x.checked=p.likes.includes(x.value))}render(p);if(f)f.onsubmit=e=>{e.preventDefault();let q={name:document.getElementById("bearName").value.trim()||"Unnamed Bear",reason:document.getElementById("bearReason").value,style:document.getElementById("bearStyle").value,likes:[...document.querySelectorAll('input[name="likes"]:checked')].map(x=>x.value)};localStorage.setItem(K,JSON.stringify(q));render(q)}})
})();

(function(){
 const PK="honeybrook_visitor_passport_v1";
 const choices={
 "Reading":[["📚 Bear Claw Library","Find a chair, a story or the town archives."],["☕ Honey Mug Café","Read beside the window with something warm."]],
 "Games":[["🎤 Gamer Bear Studio","Play a game-show round if competition sounds fun."],["🎳 Entertainment District","Bowling, arcade, skating or whatever catches you."]],
 "Learning":[["💻 Technology Center","Practice coding, troubleshooting or computer skills."],["📊 Learning Commons","Try an Office lab or learn something practical."]],
 "Mysteries":[["🔎 Town Archives","Open a Honeybrook history case."],["🌲 Northern Woods Research","Compare clues without forcing an answer."]],
 "Creating":[["🎨 Harmony Hill","Write, sing, draw, design or experiment."],["💻 Technology Center","Build something digital just to see if you can."]],
 "Just visiting":[["🪑 Bridgeview Porch","Pull up a paw and watch the neighborhood."],["🌳 Community Park","Walk, sit, snack or do absolutely nothing."]]
 };
 function get(){try{return JSON.parse(localStorage.getItem(PK)||"null")}catch(e){return null}}
 function build(){let p=get(),g=document.getElementById("guideGreeting"),box=document.getElementById("guideSuggestions"),card=document.getElementById("guideCard");if(!box||!card)return;if(!p){box.innerHTML='<div class="guide-suggestion"><b>🧸 No passport yet</b><p>That is fine. Honeybrook still welcomes you.</p></div>';return}if(g)g.textContent=`🍯 Welcome Back, ${p.name}`;let likes=p.likes||[],items=[];likes.forEach(l=>(choices[l]||[]).forEach(x=>{if(!items.some(y=>y[0]===x[0]))items.push(x)}));if(!items.length){let map={"Curious explorer":[["🧭 Town Square","Start in the middle and wander from there."]],"Cozy visitor":[["☕ Honey Mug Café","Warm drink. Window seat. No agenda."]],"Story seeker":[["📚 Bear Claw Library","Stories and town records are waiting."]],"Game-day bear":[["🎤 Gamer Bear Studio","The studio can make some noise today."]],"Learning mood":[["💻 Technology Center","Try something, relearn something, or just look around."]],"Go with the flow":[["🌳 Community Park","Start somewhere easy and decide later."]]};items=map[p.style]||map["Go with the flow"]}items=items.slice(0,4);box.innerHTML=items.map((x,i)=>`<div class="guide-suggestion"><b>${x[0]}</b><p>${x[1]}</p><button data-guide="${i}">Tell Me More</button></div>`).join("");document.querySelectorAll("[data-guide]").forEach(b=>b.onclick=()=>{let x=items[+b.dataset.guide];card.innerHTML=`<h3>${x[0]}</h3><p>${x[1]}</p><div class="guide-freedom"><b>Welcome Wagon reminder:</b> This is a suggestion, not an assignment. Go somewhere completely different if you want.</div>`});card.innerHTML=`<h3>🪧 ${p.name}'s Suggestion Board</h3><p>Based gently on your passport—not a prediction of what you should do.</p><div class="guide-freedom"><b>Today's most important option:</b> Change your mind.</div>`}
 document.addEventListener("DOMContentLoaded",()=>{build();let f=document.getElementById("passportForm");if(f)f.addEventListener("submit",()=>setTimeout(build,20))});
})();

(function(){
 function period(){let q=localStorage.getItem("honeybrook_time_preview");if(q)return q;let h=new Date().getHours();return h<12?"morning":h<17?"afternoon":h<21?"evening":"night"}
 const pulse={
 morning:"School doors open, Honey Mug is busy, Harold starts his route, and Bridgeview begins moving.",
 afternoon:"Main Street, Scholars' Quarter and Community Park carry most of the daytime traffic.",
 evening:"Porches fill, Harmony Hill gets louder, entertainment opens up and families drift home.",
 night:"Shops quiet down, homes light up, Harold is OFF DUTY, and the Northern Edge feels very different."
 };
 const cross={
 morning:[
 ["Harold + Miss Patty","Harold stops for coffee. Miss Patty hands him breakfast too. He objects for approximately four seconds."],
 ["Professor + Benny Newberry","Benny tries a problem another way. Professor Honeywell treats the new method as normal, not special treatment."],
 ["Buddy + Templar","Buddy drops off coffee at the Technology Center. “I'm not asking what you're building. I learned my lesson.”"]
 ],
 afternoon:[
 ["Templar + Wally","Templar discovers Wally's cupcake inventory situation. Again. “WALLY. WE HAVE DISCUSSED NUMBERS.”"],
 ["Big Mama + Harold","A package for Templar reaches the porch. Harold accidentally knows what's in it and immediately regrets speaking."],
 ["Benny Scoops + Grandpa Newberry","Grandpa claims he is only buying ice cream because the children wanted some. There are no children with him."]
 ],
 evening:[
 ["Big Mama + Miss Patty","Two chairs. Two cups. One porch. Honeybrook's unofficial information network is fully operational."],
 ["Lance + Landis + Buddy","A video-game dispute reaches appellate court. Judge Buddy confiscates both controllers."],
 ["Robin + Melody","A casual song at Harmony Hill gathers listeners without becoming a contest."]
 ],
 night:[
 ["Templar + Buddy","Buddy finds one more project open. “Baby.” Templar does not look up. “I'm almost done.”"],
 ["Jonesha + Big Mama","Jonesha touches the front door. Big Mama says her name from another room. No further evidence is required."],
 ["Harold + Miss Patty","A late knock interrupts Harold's peace. He prepares a speech about office hours. It's Patty with pie. Office hours are suspended."]
 ]};
 function read(k,fallback){try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(fallback))}catch(e){return fallback}}
 function drawCross(){let a=cross[period()],x=a[Math.floor(Math.random()*a.length)],e=document.getElementById("crossPath");if(e)e.innerHTML=`<div class="pulse-note"><b>${x[0]}</b><br>${x[1]}</div><small>Ordinary town life • no quest created.</small>`}
 function dashboard(){let p=read("honeybrook_visitor_passport_v1",null),r=read("honeybrook_relationship_memory_v1",{}),w=read("honeybrook_wandering_day_v1",[]),c=read("honeybrook_continuity_v1",{}),d=read("honeybrook_explorer_discoveries_v1",[]),e=document.getElementById("myHoneybrook");if(!e)return;e.innerHTML=`<p><b>${p?p.name:"Visitor Bear"}</b></p><div class="memory-stat"><span>Residents met</span><b>${Object.keys(r).length}</b></div><div class="memory-stat"><span>Today's wandering stops</span><b>${w.length}</b></div><div class="memory-stat"><span>Continuity threads</span><b>${Object.keys(c).filter(k=>c[k]).length}</b></div><div class="memory-stat"><span>Recorded discoveries</span><b>${d.length}</b></div><div class="pulse-note">Honeybrook remembers experiences—not productivity streaks.</div>`}
 function refresh(){let e=document.getElementById("townPulse"),p=period();if(e)e.innerHTML=`<b>${p.toUpperCase()}</b><div class="pulse-note">${pulse[p]}</div><small>The pulse follows your real or previewed time.</small>`;drawCross();dashboard()}
 document.addEventListener("DOMContentLoaded",()=>{refresh();let b=document.getElementById("anotherCrossover");if(b)b.onclick=drawCross;document.querySelectorAll("[data-time]").forEach(x=>x.addEventListener("click",()=>setTimeout(refresh,30)));document.addEventListener("click",()=>setTimeout(dashboard,20))});
})();

(function(){
 const WK="honeybrook_newberry_week_v1", EK="honeybrook_event_memory_v1", NK="honeybrook_woods_notes_v1";
 const week=[
 ["🏠 Settling In","Welcome House → Bridgeview","Neighbors bring food. Big Mama starts with “Who your people?” then waves it away: “Never mind. Come sit down.”"],
 ["👔 Papa's Direction","Business Center","Papa explores possibilities. Nobody assumes he must become an entrepreneur."],
 ["🌷 Mama's Return","Harmony Hill","Mama hears music again and chooses, on her own, to stay awhile."],
 ["🎮 Bailey's Two Stops","Tech Center → Arcade","Bailey experiments with tech, then goes to play. A future does not have to be decided today."],
 ["📘 Benny's Different Way","Scholars' Quarter","Professor Honeywell lets Benny solve something another way. The goal is learning—not looking like everybody else."],
 ["📖 Bella's Story Corner","Bear Claw Library","Bella discovers Honeybrook stories and asks whether the Three Bears really lived here. Storytime Bear smiles: “Depends who you ask.”"],
 ["🍦 Grandpa's Routine","Bridgeview","Grandpa complains Honeybrook is too friendly while returning to the same porch and ice-cream cart."]
 ];
 const events=[
 ["🎉 Attend","Join the crowd, food, music and town traditions."],
 ["👀 Watch From the Edge","See what is happening without joining the center of it."],
 ["☕ Go Somewhere Quieter","Honey Mug and the library remain valid choices during festivals."],
 ["🏠 Stay Home","The event continues outside. Your bear owes the town no attendance."]
 ];
 const woodsNotes=[
 ["Weathered Marking","A repeated symbol appears in an old field sketch and near the ancient bridge. Connection confirmed; meaning unknown."],
 ["Singing Pond","Several accounts mention sound after dark. They disagree on whether it is a voice, wind or something else."],
 ["Cottage Glimpse","A cottage has been observed at a distance. Its location has not been confirmed, and it is NOT proof of the Three Bears cottage."],
 ["Ancient Pillars","Stonework appears older than Honeybrook and older than the Three Bears legend. Builders unknown."],
 ["Old Bridge","The bridge predates Amelia and Tom. A worn name or word remains unreadable."]
 ];
 const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch(e){return d}},save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
 function newberry(){let seen=read(WK,[]);return `<div class="bundle-panel"><h3>🧳 The Newberrys' First Week</h3><p>Witness moments in any order. This is family life, not a completion meter.</p><div class="bundle-grid">${week.map((x,i)=>`<div class="bundle-card"><b>${x[0]}</b><p><small>${x[1]}</small></p><p>${x[2]}</p><button class="bundle-action" data-week="${i}">${seen.includes(i)?"Revisit":"Witness Moment"}</button></div>`).join("")}</div><p><b>Family dinner callback:</b> ${seen.length?"Everybody has a different answer when asked how Honeybrook is going. Grandpa says “Fine” while eating ice cream he supposedly doesn't like.":"Their first week is still unfolding."}</p></div>`}
 function event(){let mem=read(EK,[]);return `<div class="bundle-panel"><h3>🎪 A Town Event Is Happening</h3><p>Honeybrook can celebrate without making you perform community spirit.</p><div class="bundle-grid">${events.map((x,i)=>`<div class="bundle-card"><b>${x[0]}</b><p>${x[1]}</p><button class="bundle-action" data-event="${i}">Choose This Today</button></div>`).join("")}</div><p><small>Previous event-day choices remembered: ${mem.length}. No streak. No reward. No penalty.</small></p></div>`}
 function woods(){let notes=read(NK,[]);return `<div class="bundle-panel"><h3>🌲 Northern Woods Field Notes</h3><p><b>Official status:</b> UNKNOWN TERRITORY. Honeybrook records observations separately from conclusions.</p>${woodsNotes.map((x,i)=>`<div class="field-note"><b>${x[0]}</b><p>${x[1]}</p><button class="bundle-action" data-note="${i}">${notes.includes(i)?"Recorded":"Record Field Note"}</button></div>`).join("")}<p><b>Ranger reminder:</b> The maintained public trail ends before the deepest woods. Night changes the risk and the reports.</p></div>`}
 function show(t){let p=document.getElementById("storyBundlePanel");if(!p)return;p.innerHTML=t==="event"?event():t==="woods"?woods():newberry();bind()}
 function bind(){document.querySelectorAll("[data-week]").forEach(b=>b.onclick=()=>{let a=read(WK,[]),i=+b.dataset.week;if(!a.includes(i))a.push(i);save(WK,a);show("newberry")});document.querySelectorAll("[data-event]").forEach(b=>b.onclick=()=>{let a=read(EK,[]);a.push({choice:+b.dataset.event,date:new Date().toDateString()});save(EK,a);show("event")});document.querySelectorAll("[data-note]").forEach(b=>b.onclick=()=>{let a=read(NK,[]),i=+b.dataset.note;if(!a.includes(i))a.push(i);save(NK,a);show("woods")})}
 document.addEventListener("DOMContentLoaded",()=>{document.querySelectorAll("[data-storytab]").forEach(b=>b.onclick=()=>show(b.dataset.storytab));show("newberry")});
})();

(function(){
 const scenes={
 ordinary:["☀️ Ordinary Honeybrook","Harold is halfway through his route, somebody is arguing over a parking space on Main Street, and Benny Scoops' bell has caused three cubs to appear from nowhere.","Go wherever you want. Nothing historic is required."],
 story:["📖 Story Day","Storytime Bear has placed an old Honeybrook volume on the library table. One page mentions a bridge that existed before the town—and before Amelia.","Read, investigate, or close the book and get lunch."],
 mystery:["🔎 Mystery Day","A field note from the Northern Edge does not match an older library sketch. Jonesha has already noticed. Big Mama has already noticed Jonesha noticing.","Compare evidence without assuming the strangest explanation is correct."],
 roleplay:["🎭 Role-Play Day","The scene is yours. Enter as your Visitor Bear, narrate the town, or borrow a resident for a while.","Try: Narrator → “Meanwhile, across Honeybrook…” • Resident → choose a familiar bear • Visitor → simply walk in."],
 cozy:["🪑 Cozy Day","Honeybrook keeps running without needing anything from you. The Honey Mug has a window seat, Bridgeview has porches, and the library has chairs nobody quizzes you in.","No quest. No score. No progress goal. Stay as long as you like."]
 };
 const routes=[
 ["☕ Easy & Cozy","Honey Mug → Bear Claw Library → Community Park"],
 ["💻 Curious & Practical","Technology Center → Learning Commons → Main Street"],
 ["🎮 Fun Day","Gamer Bear Studio → Arcade → Bowling → BEARy Cold"],
 ["🏘️ Neighborhood Day","Bridgeview → Big Mama's porch → Commons → Hearthwell Home"],
 ["🌲 Edge of Mystery","Town Archives → Northern Edge → Ranger Boundary — stop before deepest woods"],
 ["🎨 Creative Day","Harmony Hill → Theater → outdoor performance lawn"]
 ];
 const threads=[
 ["The Bridge Before Honeybrook","Who built the ancient bridge, and what does its worn marking mean?"],
 ["The Golden Visitor","How much of the familiar Goldilocks story is history, and how much changed in retelling?"],
 ["The Cottage That Moves","Why do credible observers disagree about where a distant cottage appears?"],
 ["Amelia's Rainy-Night Visitor","Who was the mysterious woman who appeared before Honeybrook existed?"],
 ["The Goddess & the Angel","They are related somehow. Honeybrook does not yet know how."]
 ];
 function scene(k){let x=scenes[k],e=document.getElementById("dayScene");if(e)e.innerHTML=`<h3>${x[0]}</h3><p>${x[1]}</p><div class="scene-choice"><b>Freedom note:</b> ${x[2]}</div>`}
 document.addEventListener("DOMContentLoaded",()=>{document.querySelectorAll("[data-daymode]").forEach(b=>b.onclick=()=>scene(b.dataset.daymode));let r=document.getElementById("quickRoutes");if(r)r.innerHTML=routes.map(x=>`<button class="route-btn"><b>${x[0]}</b><br><small>${x[1]}</small></button>`).join("");let t=document.getElementById("storyThreads");if(t)t.innerHTML=threads.map(x=>`<button class="thread-btn" data-thread="${x[0]}"><b>${x[0]}</b><br><small>${x[1]}</small></button>`).join("");document.querySelectorAll("[data-thread]").forEach(b=>b.onclick=()=>{let x=threads.find(y=>y[0]===b.dataset.thread),e=document.getElementById("roleStage");if(e)e.innerHTML=`<b>📖 Open thread: ${x[0]}</b><br>${x[1]}<br><small>No final answer has been revealed. This thread remains available for future stories and investigation.</small>`});scene("ordinary")});
})();

(function(){
 const D={
 "Town Square":{i:"🏛️",d:"Honeybrook's civic heart: Town Hall, Gazette, post office, clock and heritage monument.",n:["Main Street","Scholars' Quarter","Care & Community","Bridgeview"]},
 "Main Street":{i:"🛍️",d:"Shops, cafés, practical businesses and the everyday noise of town commerce.",n:["Town Square","Entertainment","Harmony Hill"]},
 "Scholars' Quarter":{i:"📚",d:"School, library, Technology Center, Learning Commons and places where nobody ages out of learning.",n:["Town Square","Northern Edge","Care & Community"]},
 "Care & Community":{i:"❤️",d:"Health, wellness, emergency support and the Welcome House.",n:["Town Square","Bridgeview","Faith & Reflection"]},
 "Bridgeview":{i:"🏘️",d:"Honeybrook's oldest lived-in neighborhood: porches, families, Commons and the Hearthwell home.",n:["Town Square","Care & Community","Community Park","Faith & Reflection"]},
 "Community Park":{i:"🌳",d:"Trails, gardens, ponds, playgrounds, lawns and little bridges made for ordinary days.",n:["Bridgeview","Entertainment","Southern Entrance"]},
 "Entertainment":{i:"🎮",d:"Game shows, skating, bowling, arcade, mini golf, sports and noisy fun.",n:["Main Street","Community Park","Harmony Hill"]},
 "Harmony Hill":{i:"🎵",d:"Music, singing, dance, theater and art—participation optional, applause not required.",n:["Main Street","Entertainment","Scholars' Quarter"]},
 "Faith & Reflection":{i:"🕊️",d:"Church, gardens, outreach, remembrance and room for quiet or questions.",n:["Bridgeview","Care & Community","Southern Entrance"]},
 "Southern Entrance":{i:"🌉",d:"Welcome Bridge, visitor stop and the sign that says: There's a place for every bear.",n:["Community Park","Faith & Reflection","Outskirts"]},
 "Outskirts":{i:"🌾",d:"Farms, orchards, barns, old roads and the rural edge of Honeybrook.",n:["Southern Entrance","Northern Edge"]},
 "Northern Edge":{i:"🌲",d:"The maintained public trail ends here. Beyond it, the official map becomes UNKNOWN TERRITORY.",n:["Scholars' Quarter","Outskirts"]}
 };
 const K="honeybrook_current_district_v1";
 function go(name){let x=D[name];if(!x)return;localStorage.setItem(K,name);let a=document.getElementById("currentDistrict"),v=document.getElementById("districtView");if(a)a.textContent=name;if(v)v.innerHTML=`<h3>${x.i} ${name}</h3><p>${x.d}</p><p><b>From here you can walk toward:</b></p><div class="neighbor-links">${x.n.map(n=>`<button data-neighbor="${n}">${D[n].i} ${n}</button>`).join("")}</div>${name==="Northern Edge"?'<p><small>Ranger notice: Casual town navigation stops at the boundary. Entering deeper woods belongs to the separate discovery system.</small></p>':""}`;document.querySelectorAll("[data-neighbor]").forEach(b=>b.onclick=()=>go(b.dataset.neighbor))}
 document.addEventListener("DOMContentLoaded",()=>{let nav=document.getElementById("districtNav");if(nav)nav.innerHTML=Object.keys(D).map(n=>`<button data-district="${n}">${D[n].i} ${n}</button>`).join("");document.querySelectorAll("[data-district]").forEach(b=>b.onclick=()=>go(b.dataset.district));go(localStorage.getItem(K)||"Town Square")});
})();

document.addEventListener("DOMContentLoaded",()=>{document.querySelectorAll("[data-frontgo]").forEach(b=>b.addEventListener("click",()=>{let e=document.getElementById(b.dataset.frontgo);if(e)e.scrollIntoView({behavior:"smooth",block:"start"})}))});

(function(){
 function read(k,d){try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch(e){return d}}
 function part(){let q=localStorage.getItem("honeybrook_time_preview");if(q)return q[0].toUpperCase()+q.slice(1);let h=new Date().getHours();return h<12?"Morning":h<17?"Afternoon":h<21?"Evening":"Night"}
 function sync(){let p=read("honeybrook_visitor_passport_v1",null),d=localStorage.getItem("honeybrook_current_district_v1")||"Town Square";let a=document.getElementById("sessionBear"),b=document.getElementById("sessionDistrict"),c=document.getElementById("sessionTime"),s=document.getElementById("sessionStyle");if(a)a.textContent=p?.name||"Visitor Bear";if(b)b.textContent=d;if(c)c.textContent=part();if(s)s.textContent=p?.style||"Go with the flow"}
 document.addEventListener("DOMContentLoaded",()=>{sync();document.querySelectorAll("[data-jump]").forEach(b=>b.onclick=()=>document.getElementById(b.dataset.jump)?.scrollIntoView({behavior:"smooth",block:"start"}));document.getElementById("refreshSession")?.addEventListener("click",sync);document.addEventListener("click",()=>setTimeout(sync,30));document.getElementById("passportForm")?.addEventListener("submit",()=>setTimeout(sync,40))});
})();

/* HONEYBROOK CINEMATIC DIRECTOR */
(()=>{const q=s=>document.querySelector(s), bubble=()=>q("#cinemaBubble");
const moments=[
["Harold Pawst is making his morning mail route across Bridgeview.","Harold: “I DELIVER MAIL. I DO NOT DELIVER GOSSIP.”"],
["Benny Scoops rings the ice-cream-cart bell near Community Park.","Somewhere in Honeybrook, three parents just reached for their wallets."],
["Smoke curls above Cub Cakes & Crumbs.","Wally: “I may have made…a few extra.”"],
["Big Mama has spotted somebody crossing Bridgeview Commons.","Big Mama: “WHO YOUR MAMA?”"],
["The Hearthwell house is already busy.","Buddy: “Baby…we ain’t even built the building yet.”"]
];let n=0;
function show(){const b=bubble();if(!b)return;b.textContent=moments[n++%moments.length][Math.random()>.45?1:0]}
setInterval(show,7000);show();
document.addEventListener("click",e=>{if(e.target?.id==="cinemaEnter"){q("#visualTown")?.scrollIntoView({behavior:"smooth",block:"start"});}});
const h=new Date().getHours(),stage=q("#hbCinema");if(stage&&(h>=19||h<6))stage.classList.add("cinema-night");
})();
/* CINEMATIC DISTRICT BRIDGE */
(()=>{const stage=document.querySelector("#hbCinema"), bubble=document.querySelector("#cinemaBubble");if(!stage||!bubble)return;
const districtLines={Bridgeview:"Big Mama is on the porch. A basketball bounces across the Commons while neighbors call to one another.",MainStreet:"Shop doors open along Main Street. The Honey Mug is steaming and Wally is already giving away something he was supposed to sell.",TownSquare:"The town clock marks another Honeybrook hour while bears cross the square beneath the Three Bears monument.",NorthernWoods:"The maintained trail grows quiet. Beyond the ranger sign, the trees seem to be listening.",HarmonyHill:"Music drifts down Harmony Hill as rehearsal begins inside Harmony Hall.",Scholars:"Books, lessons, experiments and questions are already moving through the Scholars’ Quarter."};
document.addEventListener("click",e=>{const el=e.target.closest("[data-district], .town-building");if(!el)return;const raw=el.dataset.district||el.getAttribute("data-place")||el.textContent||"";const key=Object.keys(districtLines).find(k=>raw.toLowerCase().includes(k.toLowerCase()));if(!key)return;stage.classList.add("scene-focus");bubble.textContent=districtLines[key];setTimeout(()=>stage.classList.remove("scene-focus"),5000);});
})();
/* CINEMATIC CAMERA */
(()=>{document.addEventListener("click",e=>{if(e.target.closest("#cinemaEnter,.town-building,[data-district]")){document.body.classList.add("hb-transitioning");setTimeout(()=>document.body.classList.remove("hb-transitioning"),900);}});
const woods=[...document.querySelectorAll('[id*="woods" i],[class*="woods" i]')];woods.forEach(w=>{w.classList.add("woods-cinematic");const h=new Date().getHours();if(h>=19||h<6)w.classList.add("woods-night");});
})();
/* LIVING WEATHER AND RHYTHM */
(()=>{const stage=document.querySelector("#hbCinema"),bubble=document.querySelector("#cinemaBubble");if(!stage)return;
const h=new Date().getHours();stage.dataset.period=h>=19||h<6?"night":h>=17?"sunset":h<11?"morning":"day";
const month=new Date().getMonth();const rainChance=[2,3,4,9,10].includes(month)&&Math.random()<.16;if(rainChance){stage.dataset.weather="rain";if(bubble)bubble.textContent="A soft rain moves across Honeybrook Creek. Porch conversations have shifted under the awnings."}
document.addEventListener("visibilitychange",()=>{stage.classList.toggle("hb-paused",document.hidden)});
})();
/* VISIBLE CHARACTER MOMENTS */
(()=>{const card=document.createElement("div");card.className="hb-scene-card";card.setAttribute("role","status");document.body.appendChild(card);
const scenes=[
["Big Mama • Bridgeview","Big Mama leans forward on the porch as a cub races past.","“WHO YOUR MAMA?”"],
["Harold Pawst • Mail Route","Harold stops, checks the address twice, then looks toward Miss Patty’s café.","“I deliver MAIL. I do not deliver gossip.”"],
["Wally Crumbwell • Cub Cakes","Wally slides another tray into the window even though the display is already full.","“I may have made…a few extra.”"],
["Lance & Landis • Hearthwell Home","Two controllers click furiously. Buddy appears in the doorway.","Buddy: “If I hear ONE more argument over that game…”"],
["Benny Scoops • Community Park","The ice-cream bell rings. Three cubs change direction instantly.","Somewhere nearby, a parent sighs."]
];let i=0;
function play(){const s=scenes[i++%scenes.length];card.innerHTML="<strong>"+s[0]+"</strong><span class='action'>"+s[1]+"</span><br>"+s[2];card.classList.add("show");setTimeout(()=>card.classList.remove("show"),4300)}
setInterval(play,16000);
})();
/* HONEYBROOK UX ACCESSIBILITY PASS */
(()=>{const interactive=[...document.querySelectorAll('.town-building,[data-district]')];interactive.forEach((el,i)=>{if(!['BUTTON','A','INPUT','SELECT','TEXTAREA'].includes(el.tagName)){el.tabIndex=el.tabIndex>=0?el.tabIndex:0;el.setAttribute('role',el.getAttribute('role')||'button');if(!el.getAttribute('aria-label')){const label=(el.dataset.district||el.dataset.place||el.textContent||'Honeybrook location').replace(/\s+/g,' ').trim();el.setAttribute('aria-label','Visit '+label)}}});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('.town-building,[data-district]')){e.preventDefault();e.target.click()}});
const enter=document.querySelector('#cinemaEnter');if(enter){enter.setAttribute('aria-label','Enter Honeybrook town');}
const bubble=document.querySelector('#cinemaBubble');if(bubble){bubble.setAttribute('aria-atomic','true');}
})();
/* PLAYABLE HONEYBROOK WORLD ENGINE */
(()=>{const scenes=[...document.querySelectorAll("#playableWorld .pw-scene")],loc=document.querySelector("#pwLocation"),hint=document.querySelector("#pwHint");
function show(name){const next=scenes.find(s=>s.dataset.scene===name),cur=scenes.find(s=>!s.hidden);if(!next||next===cur)return;if(cur){cur.classList.add("pw-fadeout");setTimeout(()=>{cur.hidden=true;cur.classList.remove("pw-fadeout");next.hidden=false;next.classList.add("pw-fadein");setTimeout(()=>next.classList.remove("pw-fadein"),650)},430)}else next.hidden=false;const names={bridge:"Welcome Bridge",mainstreet:"Main Street",cafe:"Honey Mug Café"};loc.textContent=names[name]||"Honeybrook";hint.textContent=name==="mainstreet"?"Walk Main Street or enter the Honey Mug.":name==="cafe"?"Miss Patty noticed you. Talk to her or return outside.":"Cross the bridge to enter Honeybrook.";localStorage.setItem("honeybrook_playable_scene_v1",name)}
document.querySelector("#pwEnterTown")?.addEventListener("click",()=>{const p=document.querySelector(".pw-bridge .pw-player");if(p){p.style.left="70%";p.style.bottom="26%"}setTimeout(()=>show("mainstreet"),1350)});
document.querySelector("#pwCafe")?.addEventListener("click",()=>show("cafe"));document.querySelector("#pwExitCafe")?.addEventListener("click",()=>show("mainstreet"));
let pattyLines=["There you are, baby. Sit down. You hungry?","Coffee? Tea? Pie? Don't tell me ‘nothing’—I know that look.","Harold came through here five minutes ago claiming he does NOT gossip.","You can stay as long as you want. Honeybrook ain't rushing you."],pi=0;
document.querySelector("#pwTalkPatty")?.addEventListener("click",()=>{const p=document.querySelector("#pwPatty"),d=document.querySelector("#pwCafeDialogue");p?.classList.remove("react");void p?.offsetWidth;p?.classList.add("react");if(d)d.innerHTML="<b>Miss Patty</b><span>“"+pattyLines[pi++%pattyLines.length]+"”</span>"});
const saved=localStorage.getItem("honeybrook_playable_scene_v1");if(saved&&saved!=="bridge"){scenes.forEach(s=>s.hidden=s.dataset.scene!==saved);const names={mainstreet:"Main Street",cafe:"Honey Mug Café"};loc.textContent=names[saved]||"Honeybrook"}
})();
/* PLAYABLE AMBIENT DIRECTOR */
(()=>{const scene=document.querySelector('.pw-mainstreet'),hint=document.querySelector('#pwHint');if(!scene)return;
const beats=["Harold pauses at a mailbox, checks an envelope, and keeps moving.","The Honey Mug door swings as another neighbor slips inside.","Benny Scoops rings the cart bell farther down Main Street.","A breeze moves through the trees beside Honeybrook Creek.","Somebody inside Cub Cakes laughs loud enough to hear from the sidewalk."];
let i=0;setInterval(()=>{if(scene.hidden)return;if(hint)hint.textContent=beats[i++%beats.length]},6500);
})();
/* PLAYABLE DIALOGUE CHOICES */
(()=>{const talk=document.querySelector('#pwTalkPatty'),panel=document.querySelector('#pwChoicePanel'),d=document.querySelector('#pwCafeDialogue'),p=document.querySelector('#pwPatty');if(!talk||!panel)return;
talk.addEventListener('click',()=>{panel.hidden=false;talk.textContent='Choose what to say'});
const replies={coffee:["Miss Patty","“Coffee it is, sugar. Sit wherever you like.”"],town:["Miss Patty","“Main Street's busy, Harmony Hill got rehearsal, and Big Mama has apparently appointed herself mayor of Bridgeview again.”"],harold:["Miss Patty","“Harold? He'll tell you he doesn't gossip. Ask him why he knows everybody's business.”"],quiet:["Miss Patty","“Then don't do a thing. I'll bring you something warm and leave you be.”"]};
panel.addEventListener('click',e=>{const b=e.target.closest('[data-pwchoice]');if(!b)return;const r=replies[b.dataset.pwchoice];if(d)d.innerHTML='<b>'+r[0]+'</b><span>'+r[1]+'</span>';panel.hidden=true;p?.classList.add('react');setTimeout(()=>p?.classList.remove('react'),800);localStorage.setItem('honeybrook_patty_last_choice_v1',b.dataset.pwchoice)});
})();
/* MAIN STREET NPC CONVERSATIONS */
(()=>{const hint=document.querySelector('#pwHint');function talk(sel,lines){const n=document.querySelector(sel);if(!n)return;n.addEventListener('click',e=>{e.stopPropagation();n.classList.add('paused');const line=lines[Math.floor(Math.random()*lines.length)];if(hint)hint.textContent=line;setTimeout(()=>n.classList.remove('paused'),4200)})}
talk('#pwHaroldTalk',["Harold: “Morning. And no, I don't know what Miss Patty told you.”","Harold: “Special delivery! ...Not for you. Sorry.”","Harold: “I am ON my route. This is not gossip time.”"]);
talk('#pwBennyTalk',["Benny Scoops: “Vanilla, chocolate, honey swirl—or you just browsing?”","Benny Scoops: “That bell works better than advertising.”","Benny Scoops: “Grandpa Newberry? Haven't seen him. ...He'll be here.”"]);
})();
/* CUB CAKES PLAYABLE SCENE */
(()=>{const bakery=document.querySelector('#pwBakery'),exit=document.querySelector('#pwExitBakery'),talk=document.querySelector('#pwTalkWally'),d=document.querySelector('#pwBakeryDialogue'),w=document.querySelector('#pwWally');function fire(name){const scenes=[...document.querySelectorAll('#playableWorld .pw-scene')],next=scenes.find(s=>s.dataset.scene===name),cur=scenes.find(s=>!s.hidden);if(!next)return;if(cur)cur.hidden=true;next.hidden=false;document.querySelector('#pwLocation').textContent=name==='bakery'?'Cub Cakes & Crumbs':'Main Street';localStorage.setItem('honeybrook_playable_scene_v1',name)}bakery?.addEventListener('click',()=>fire('bakery'));exit?.addEventListener('click',()=>fire('mainstreet'));let n=0;const lines=["“Okay, technically I doubled the recipe twice.”","“I can explain. Actually...no, I cannot.”","“You want one? Please say yes. Templar is going to count these.”"];talk?.addEventListener('click',()=>{if(d)d.innerHTML='<b>Wally Crumbwell</b><span>'+lines[n++%lines.length]+'</span>';w?.animate([{transform:'rotate(-5deg)'},{transform:'rotate(5deg)'},{transform:'rotate(0)'}],{duration:650})})})();
/* BRIDGEVIEW PLAYABLE SCENE */
(()=>{const go=document.querySelector('#pwBridgeview'),exit=document.querySelector('#pwExitBridgeview'),talk=document.querySelector('#pwTalkBigMama'),m=document.querySelector('#pwBigMama'),d=document.querySelector('#pwBridgeviewDialogue');function show(name){const scenes=[...document.querySelectorAll('#playableWorld .pw-scene')],next=scenes.find(s=>s.dataset.scene===name),cur=scenes.find(s=>!s.hidden);if(!next)return;if(cur)cur.hidden=true;next.hidden=false;document.querySelector('#pwLocation').textContent=name==='bridgeview'?'Bridgeview Commons':'Main Street';localStorage.setItem('honeybrook_playable_scene_v1',name)}go?.addEventListener('click',()=>show('bridgeview'));exit?.addEventListener('click',()=>show('mainstreet'));let n=0;const lines=["“Well, come on up here. Don't stand in the yard looking lost.”","“WHO YOUR MAMA? ...Never mind, baby. Come sit down.”","“You hungry? Miss Patty feeds everybody, but I got food too.”","“And don't you even THINK about following Jonesha toward them woods after dark.”"];talk?.addEventListener('click',()=>{m?.classList.remove('calling');void m?.offsetWidth;m?.classList.add('calling');if(d)d.innerHTML='<b>Big Mama</b><span>'+lines[n++%lines.length]+'</span>'})})();
/* NORTHERN EDGE PLAYABLE SCENE */
(()=>{const go=document.querySelector('#pwWoodsGate'),exit=document.querySelector('#pwExitWoods'),listen=document.querySelector('#pwListenWoods'),d=document.querySelector('#pwWoodsDialogue');function show(name){const scenes=[...document.querySelectorAll('#playableWorld .pw-scene')],next=scenes.find(s=>s.dataset.scene===name),cur=scenes.find(s=>!s.hidden);if(!next)return;if(cur)cur.hidden=true;next.hidden=false;document.querySelector('#pwLocation').textContent=name==='woodsedge'?'Northern Edge':'Main Street';localStorage.setItem('honeybrook_playable_scene_v1',name)}go?.addEventListener('click',()=>show('woodsedge'));exit?.addEventListener('click',()=>show('mainstreet'));let n=0;const sounds=["The wind moves through the pines. Then—three soft notes from the direction of the pond.","A branch snaps deeper in the woods. Nothing appears on the maintained trail.","For several seconds, you could swear there is a cottage between the trees.","The pond makes a sound almost like singing. Almost."];listen?.addEventListener('click',()=>{if(d)d.innerHTML='<b>Field observation</b><span>'+sounds[n++%sounds.length]+'</span>'})})();
/* HARMONY HILL PLAYABLE SCENE */
(()=>{const go=document.querySelector('#pwHarmonyGate'),exit=document.querySelector('#pwExitHarmony'),watch=document.querySelector('#pwHarmonyMoment'),d=document.querySelector('#pwHarmonyDialogue'),s=document.querySelector('#pwSinger');function show(name){const scenes=[...document.querySelectorAll('#playableWorld .pw-scene')],next=scenes.find(x=>x.dataset.scene===name),cur=scenes.find(x=>!x.hidden);if(!next)return;if(cur)cur.hidden=true;next.hidden=false;document.querySelector('#pwLocation').textContent=name==='harmony'?'Harmony Hall':'Main Street';localStorage.setItem('honeybrook_playable_scene_v1',name)}go?.addEventListener('click',()=>show('harmony'));exit?.addEventListener('click',()=>show('mainstreet'));let n=0;const beats=["The pianist changes keys and the singer follows without missing a beat.","A little bear in the audience starts swaying. Nobody tells them to sit still.","The singer laughs halfway through the verse. Rehearsal keeps going.","For one chorus, the whole room joins in. Participation remains optional."];watch?.addEventListener('click',()=>{if(d)d.innerHTML='<b>Rehearsal</b><span>'+beats[n++%beats.length]+'</span>';s?.animate([{transform:'scale(1)'},{transform:'scale(1.12)'},{transform:'scale(1)'}],{duration:700})})})();
/* HEARTHWELL PLAYABLE SCENE */
(()=>{const go=document.querySelector('#pwHomeGate'),exit=document.querySelector('#pwExitHome'),watch=document.querySelector('#pwHomeMoment'),d=document.querySelector('#pwHomeDialogue');function show(name){const scenes=[...document.querySelectorAll('#playableWorld .pw-scene')],next=scenes.find(x=>x.dataset.scene===name),cur=scenes.find(x=>!x.hidden);if(!next)return;if(cur)cur.hidden=true;next.hidden=false;document.querySelector('#pwLocation').textContent=name==='hearthwell'?'Hearthwell Home':'Main Street';localStorage.setItem('honeybrook_playable_scene_v1',name)}go?.addEventListener('click',()=>show('hearthwell'));exit?.addEventListener('click',()=>show('mainstreet'));let n=0;const beats=["Buddy: “If I hear ONE more argument over that controller, both of y'all are gonna discover outside.”","Lance: “He had it longer!” Landis: “Did not!” The controller is placed on the table by executive order.","Templar walks through with another Honeybrook idea. Buddy looks at the ceiling.","Somebody asks where the remote is. Every person in the room points at somebody else."];watch?.addEventListener('click',()=>{if(d)d.innerHTML='<b>At home</b><span>'+beats[n++%beats.length]+'</span>'})})();
/* TOWN SQUARE PLAYABLE SCENE */
(()=>{const go=document.querySelector('#pwTownSquareGate'),exit=document.querySelector('#pwExitSquare'),watch=document.querySelector('#pwSquareMoment'),d=document.querySelector('#pwSquareDialogue');function show(name){const scenes=[...document.querySelectorAll('#playableWorld .pw-scene')],next=scenes.find(x=>x.dataset.scene===name),cur=scenes.find(x=>!x.hidden);if(!next)return;if(cur)cur.hidden=true;next.hidden=false;document.querySelector('#pwLocation').textContent=name==='townsquare'?'Town Square':'Main Street';localStorage.setItem('honeybrook_playable_scene_v1',name)}go?.addEventListener('click',()=>show('townsquare'));exit?.addEventListener('click',()=>show('mainstreet'));let n=0;const beats=["The town clock rings. Harold checks his watch like the clock personally offended him.","A Gazette reporter hurries toward Town Hall while two neighbors continue a conversation beside the fountain.","A visitor stops at the Three Bears heritage marker. Two residents immediately disagree about the story.","The fountain catches the sunlight while Main Street traffic drifts through the square."];watch?.addEventListener('click',()=>{if(d)d.innerHTML='<b>Town Square</b><span>'+beats[n++%beats.length]+'</span>'})})();
/* PLAYABLE WORLD TIME DIRECTOR */
(()=>{const world=document.querySelector('#playableWorld');if(!world)return;function setTime(){const h=new Date().getHours();world.dataset.time=h<6||h>=20?'night':h>=17?'evening':'day'}setTime();setInterval(setTime,60000);
document.addEventListener('visibilitychange',()=>{world.querySelectorAll('*').forEach(el=>el.style.animationPlayState=document.hidden?'paused':'')});
})();
/* COMMUNITY PARK PLAYABLE SCENE */
(()=>{const go=document.querySelector('#pwParkGate'),exit=document.querySelector('#pwExitPark'),watch=document.querySelector('#pwParkMoment'),d=document.querySelector('#pwParkDialogue');function show(name){const ss=[...document.querySelectorAll('#playableWorld .pw-scene')],n=ss.find(x=>x.dataset.scene===name),cur=ss.find(x=>!x.hidden);if(!n)return;if(cur)cur.hidden=true;n.hidden=false;document.querySelector('#pwLocation').textContent=name==='park'?'Community Park':'Main Street';localStorage.setItem('honeybrook_playable_scene_v1',name)}go?.addEventListener('click',()=>show('park'));exit?.addEventListener('click',()=>show('mainstreet'));let i=0;const b=["A kite dips over Honeybrook Creek and a cub takes off running after it.","Two bears stop on the little bridge and toss crumbs toward the pond.","Benny Scoops' bell can be heard somewhere beyond the trees.","Nothing important happens for a while. It is a very good while."];watch?.addEventListener('click',()=>{if(d)d.innerHTML='<b>Community Park</b><span>'+b[i++%b.length]+'</span>'})})();
/* PLAYABLE SCENE RECOVERY */
(()=>{const valid=['bridge','mainstreet','welcomehouse','games','tech','library','park','townsquare','hearthwell','harmony','woodsedge','bridgeview','bakery','cafe'];let saved=localStorage.getItem('honeybrook_playable_scene_v1');if(saved&&!valid.includes(saved)){localStorage.setItem('honeybrook_playable_scene_v1','bridge');saved='bridge'}const scenes=[...document.querySelectorAll('#playableWorld .pw-scene')];if(saved&&scenes.some(s=>s.dataset.scene===saved)){scenes.forEach(s=>s.hidden=s.dataset.scene!==saved)}document.querySelector('#pwSound')?.addEventListener('click',e=>{e.currentTarget.textContent=e.currentTarget.textContent.includes('🔇')?'🔊 Ambient sound ready':'🔇 Sound-ready';e.currentTarget.setAttribute('aria-pressed',e.currentTarget.textContent.includes('🔊')?'true':'false')})})();
/* LIBRARY PLAYABLE SCENE */
(()=>{const go=document.querySelector('#pwLibraryGate'),exit=document.querySelector('#pwExitLibrary'),watch=document.querySelector('#pwLibraryMoment'),d=document.querySelector('#pwLibraryDialogue');function show(name){const ss=[...document.querySelectorAll('#playableWorld .pw-scene')],n=ss.find(x=>x.dataset.scene===name),cur=ss.find(x=>!x.hidden);if(!n)return;if(cur)cur.hidden=true;n.hidden=false;document.querySelector('#pwLocation').textContent=name==='library'?'Bear Claw Library':'Main Street';localStorage.setItem('honeybrook_playable_scene_v1',name)}go?.addEventListener('click',()=>show('library'));exit?.addEventListener('click',()=>show('mainstreet'));let i=0;const clues=["The page shows an old bridge sketched decades before Honeybrook was founded.","A margin note mentions a golden-haired visitor, but the handwriting is much newer than the original text.","One map places a cottage north of the creek. Another copy of the same map does not.","Storytime Bear watches you notice the discrepancy and says nothing."];watch?.addEventListener('click',()=>{if(d)d.innerHTML='<b>Old Honeybrook volume</b><span>'+clues[i++%clues.length]+'</span>'})})();
/* TECH CENTER PLAYABLE SCENE */
(()=>{const go=document.querySelector('#pwTechGate'),exit=document.querySelector('#pwExitTech'),watch=document.querySelector('#pwTechMoment'),d=document.querySelector('#pwTechDialogue');function show(name){const ss=[...document.querySelectorAll('#playableWorld .pw-scene')],n=ss.find(x=>x.dataset.scene===name),cur=ss.find(x=>!x.hidden);if(!n)return;if(cur)cur.hidden=true;n.hidden=false;document.querySelector('#pwLocation').textContent=name==='tech'?'Technology Center':'Main Street';localStorage.setItem('honeybrook_playable_scene_v1',name)}go?.addEventListener('click',()=>show('tech'));exit?.addEventListener('click',()=>show('mainstreet'));let i=0;const b=["A tiny program runs successfully. Nobody makes you turn it into a business.","A help-desk simulation flashes: PRINTER OFFLINE. Somewhere, a bear groans.","One screen opens a map of Honeybrook's network. The Northern Edge has no node.","You close the laptop and look out the window. That counts too."];watch?.addEventListener('click',()=>{if(d)d.innerHTML='<b>Technology Center</b><span>'+b[i++%b.length]+'</span>'})})();
/* ENTERTAINMENT PLAYABLE SCENE */
(()=>{const go=document.querySelector('#pwGameGate'),exit=document.querySelector('#pwExitGame'),play=document.querySelector('#pwGameMoment'),d=document.querySelector('#pwGameDialogue');function show(name){const ss=[...document.querySelectorAll('#playableWorld .pw-scene')],n=ss.find(x=>x.dataset.scene===name),cur=ss.find(x=>!x.hidden);if(!n)return;if(cur)cur.hidden=true;n.hidden=false;document.querySelector('#pwLocation').textContent=name==='games'?'Entertainment District':'Main Street';localStorage.setItem('honeybrook_playable_scene_v1',name)}go?.addEventListener('click',()=>show('games'));exit?.addEventListener('click',()=>show('mainstreet'));let score=0;play?.addEventListener('click',()=>{score=Math.floor(Math.random()*901)+100;if(d)d.innerHTML='<b>Quick arcade round</b><span>You scored '+score+' points. No leaderboard. No streak. Play again because you want to.</span>'})})();
/* PLAYABLE WORLD NAVIGATION */
(()=>{const nav=document.querySelector('#pwWorldNav'),loc=document.querySelector('#pwLocation');if(!nav)return;const names={mainstreet:'Main Street',cafe:'Honey Mug Café',bakery:'Cub Cakes & Crumbs',bridgeview:'Bridgeview Commons',townsquare:'Town Square',park:'Community Park',library:'Bear Claw Library',tech:'Technology Center',games:'Entertainment District',harmony:'Harmony Hall',woodsedge:'Northern Edge',hearthwell:'Hearthwell Home',welcomehouse:'Welcome House'};function jump(name){const ss=[...document.querySelectorAll('#playableWorld .pw-scene')],n=ss.find(x=>x.dataset.scene===name),cur=ss.find(x=>!x.hidden);if(!n)return;if(cur)cur.hidden=true;n.hidden=false;if(loc)loc.textContent=names[name]||'Honeybrook';localStorage.setItem('honeybrook_playable_scene_v1',name);nav.querySelectorAll('[data-pwjump]').forEach(b=>b.setAttribute('aria-current',String(b.dataset.pwjump===name)))}nav.addEventListener('click',e=>{const b=e.target.closest('[data-pwjump]');if(b)jump(b.dataset.pwjump)});const saved=localStorage.getItem('honeybrook_playable_scene_v1');if(saved)nav.querySelector('[data-pwjump="'+saved+'"]')?.setAttribute('aria-current','true')})();
/* PLAYABLE WORLD PRIMARY MODE */
(()=>{const world=document.querySelector('#playableWorld');if(!world)return;document.title='Honeybrook — Playable Bear World';world.setAttribute('tabindex','-1');setTimeout(()=>world.focus({preventScroll:true}),50)})();
/* WELCOME HOUSE PLAYABLE SCENE */
(()=>{const go=document.querySelector('#pwWelcomeGate'),exit=document.querySelector('#pwExitWelcome'),watch=document.querySelector('#pwWelcomeMoment'),d=document.querySelector('#pwWelcomeDialogue');function show(name){const ss=[...document.querySelectorAll('#playableWorld .pw-scene')],n=ss.find(x=>x.dataset.scene===name),cur=ss.find(x=>!x.hidden);if(!n)return;if(cur)cur.hidden=true;n.hidden=false;document.querySelector('#pwLocation').textContent=name==='welcomehouse'?'Welcome House':'Main Street';localStorage.setItem('honeybrook_playable_scene_v1',name)}go?.addEventListener('click',()=>show('welcomehouse'));exit?.addEventListener('click',()=>show('mainstreet'));let i=0;const b=["Toby: “Welcome to Honeybrook! You folks looking for somebody?”","Papa Newberry: “Actually…we're looking for a place.” Toby grins. “Well, that's convenient. We got one.”","Bella Newberry spots the library sign before anybody finishes unloading.","Grandpa Newberry says the town is too friendly. He does not leave."];watch?.addEventListener('click',()=>{if(d)d.innerHTML='<b>Welcome Wagon</b><span>'+b[i++%b.length]+'</span>'})})();