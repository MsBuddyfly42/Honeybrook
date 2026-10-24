/* Single-player Honeybrook life rules. No network, timers, or storage side effects. */
(function (root, factory) {
  const engine = factory(typeof module === 'object' && module.exports ? require('./town-activity-data.js') : root.HoneybrookTownActivities, typeof module === 'object' && module.exports ? require('./daily-quiz.js') : root.HoneybrookDailyQuiz,typeof module==='object'&&module.exports?require('./bear-hollow-data.js'):root.HoneybrookHollow,typeof module==='object'&&module.exports?require('./story-data.js'):root.HoneybrookStory);
  if (typeof module === 'object' && module.exports) module.exports = engine;
  else root.HoneybrookLife = engine;
})(typeof globalThis === 'object' ? globalThis : this, function (Town,Quiz,Hollow,Story) {
  'use strict';
  const VERSION = 1;
  const realDate = (now = new Date()) => new Intl.DateTimeFormat('en-CA', {timeZone: 'America/Chicago', year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
  const addDay = date => new Date(Date.parse(date + 'T12:00:00Z') + 86400000).toISOString().slice(0,10);
  const seasons = ['Winter','Spring','Summer','Autumn'];
  function season(date) {const month=Number(date.slice(5,7));return seasons[Math.floor((month%12)/3)];}
  function weather(date) {const n=Number(date.replaceAll('-',''));return ({Winter:['Snow','Clear and cold','Sleet'],Spring:['Gentle rain','Clear','Thunderstorm'],Summer:['Clear','Warm breeze','Thunderstorm'],Autumn:['Clear','Gentle rain','Cool breeze']})[season(date)][n%3];}
  const earlierResidents = [
    {id:'sammy',name:'Sammy Patchwell',family:'Welcoming bear · Amelia and Tom’s first welcomed neighbor',routine:'Morning: Welcome House · Afternoon: paths · Evening: cottage',intro:'You can eat first. A place to rest is offered before a story or a skill.'},
    {id:'wally',name:'Wally Crumbwell',family:'Bear baker · Harold’s longtime friend',routine:'Morning and afternoon: bakery · Evening: supper at home',intro:'Let’s make enough for our neighbors and save a loaf for supper.'},
    {id:'maya',name:'Maya Williams',family:'Black American mother · nurse · Williams family',routine:'Morning: infirmary · Afternoon: family cabins · Evening: sunset gathering',intro:'Care starts with listening and checking what each family actually needs.'},
    {id:'daniel',name:'Daniel Miller',family:'White American father · carpenter · Miller family',routine:'Morning: workshop · Afternoon: maintenance · Evening: family supper',intro:'Measure, make a safe plan, then inspect the work together.'},
    {id:'lin',name:'Lin Chen',family:'Chinese American grandmother · weaving teacher · Chen family',routine:'Morning: gardens · Afternoon: craft studio · Evening: family cabin',intro:'A careful first row gives the whole piece a good beginning.'},
    {id:'aiko',name:'Aiko Tanaka',family:'Japanese American parent · painter · Tanaka family',routine:'Morning: pond · Afternoon: painting studio · Evening: cottage porch',intro:'Look at the light before choosing your colors.'},
    {id:'sofia',name:'Sofía Rivera',family:'Puerto Rican mother · cook · Rivera family',routine:'Morning: kitchen · Afternoon: Camp Store · Evening: dining hall',intro:'Count the guests first, then check the portions and ingredients.'},
    {id:'arjun',name:'Arjun Patel',family:'Indian American father · supply steward · Patel family',routine:'Morning: stores · Afternoon: administration · Evening: games',intro:'A checklist is a promise to bring the right equipment for everybody.'},
    {id:'marie',name:'Marie Jean-Baptiste',family:'Haitian American aunt · gardening mentor · Jean-Baptiste family',routine:'Morning: gardens · Afternoon: school · Evening: family cabins',intro:'We can keep the soil healthy and share what grows.'},
    {id:'elijah',name:'Elijah Campbell',family:'Jamaican American grandfather · music mentor · Campbell family',routine:'Morning: recreation hall · Afternoon: waterfront · Evening: fellowship',intro:'There is room for your voice in our sunset songs.'},
    {id:'amina',name:'Amina Okafor',family:'Nigerian American mother · scout counselor · Okafor family',routine:'Morning: scout camp · Afternoon: hills preparation · Evening: gathering',intro:'Preparation and kindness help every camper belong.'}
  ];
  const canonicalIds=["amelia", "tom", "sammy", "templar", "buddy", "mary", "jonesha", "jamya", "jamon", "robin", "rheanna", "lena", "lance", "landis", "landric", "theodore", "harold", "wally", "patty", "daisy", "mabel", "toby", "nora", "milo", "carmen", "ranger", "older-cub"];
  const residents=Story.cast.filter(p=>canonicalIds.includes(p.id)).map(p=>({id:p.id,name:p.name,family:p.kind,routine:'Story place: '+p.place+' · '+(p.chapters.length?'Chapters '+p.chapters.join(', '):'Prologue'),intro:p.fact}));
  for(const p of earlierResidents)if(!residents.some(c=>c.id===p.id))residents.push({...p,archived:true});
  const canonicalPerson={maya:'nora',daniel:'tom',lin:'theodore',aiko:'templar',sofia:'wally',arjun:'buddy',marie:'jamya',elijah:'robin',amina:'buddy'};
  const companion=s=>residents.find(p=>p.id===s.partner)?.archived?'sammy':s.partner;
  const menu = [
    ['Oatmeal, eggs and berries','Chicken soup and bread','Roast chicken, rice and green beans'],
    ['Pancakes, yogurt and fruit','Turkey sandwiches and salad','Beef stew and potatoes'],
    ['Eggs, toast and oranges','Baked potatoes and beans','Baked fish, rice and carrots'],
    ['French toast and bananas','Chicken wraps and fruit','Spaghetti, salad and bread'],
    ['Porridge, eggs and apples','Vegetable soup and grilled cheese','Chicken casserole and peas'],
    ['Waffles, yogurt and berries','Burgers, beans and slaw','Roast turkey and vegetables'],
    ['Biscuits, eggs and peaches','Chicken salad sandwiches','Pot roast, potatoes and carrots']
  ];
  const meal = s => {const p=s.cookingPlan||s;return menu[(p.day-1)%7][p.hour<11?0:p.hour<16?1:2];};
  const portionCards = [
    [['3 cups oats','6 cups milk/water','12 eggs','6 cups berries'],['3 lb chicken','8 cups vegetables','12 cups broth','12 bread slices'],['4 lb chicken','4 cups dry rice','3 lb green beans']],
    [['24 pancakes from recipe batter','6 cups yogurt','6 cups fruit'],['24 bread slices','2 lb sliced turkey','12 cups salad'],['3 lb beef','3 lb potatoes','8 cups vegetables','12 cups stew stock']],
    [['12 eggs','24 toast slices','6 oranges'],['12 potatoes','6 cups cooked beans','12 cups salad'],['12 fish portions','4 cups dry rice','3 lb carrots']],
    [['24 French-toast slices','12 eggs for recipe batter','6 bananas'],['12 wraps','3 lb cooked chicken','6 cups fruit'],['3 lb dry spaghetti','12 cups sauce','12 cups salad','12 bread slices']],
    [['3 cups oats','6 cups milk/water','12 eggs','6 apples'],['12 cups vegetable soup','24 bread slices','12 cheese portions'],['3 lb chicken','4 cups dry rice for casserole','3 lb peas']],
    [['24 waffles from recipe batter','6 cups yogurt','6 cups berries'],['12 burger patties','12 buns','6 cups cooked beans','6 cups slaw'],['4 lb turkey','12 cups mixed vegetables']],
    [['12 biscuits','12 eggs','6 cups peaches'],['24 bread slices','3 lb chicken salad'],['4 lb pot roast','3 lb potatoes','12 cups carrots and other vegetables']]
  ];
  function recipe(s){const p=s.cookingPlan||s;return {name:meal(s),portions:12,ingredients:portionCards[(p.day-1)%7][p.hour<11?0:p.hour<16?1:2],tools:['Portion card and clean measuring tools','Separate preparation boards','Supervised cooker and food thermometer'],note:'Use the supervisor’s recipe for cooking and holding temperatures; set aside the checked allergy-safe alternative.'};}
  const gear = [
    ['tent','Shelter for the whole family',1200,'wilderness'],['sleep','Sleeping bag and pad per camper',400,'wilderness'],
    ['cook','Stove, cookware and safe fuel',500,'wilderness'],['light','Lanterns and charged power bank',150,'wilderness'],
    ['navigate','Map, compass and route plan',80,'wilderness'],['aid','First aid and weather protection',250,'wilderness'],
    ['water','Water and substantial meals per camper',100,'camp'],['wash','Toiletries and spare clothing per camper',80,'camp'],
    ['smores','S’mores ingredients',30,'camp'],['fish','Fishing tackle',120,'camp'],['craft','Craft materials',100,'camp'],
    ['book','Cub and kiddo camping activity book',25,'camp']
  ];
  // Additive camp stock; old item IDs and the first eight preparation items stay fixed.
  gear.push(...[
    ['rain','Rain layer and weatherproof spare bag',75,'wilderness'],['vest','Checked fitted flotation aid',120,'wilderness'],['kayak','Supervised practice kayak',1200,'wilderness'],['canoe','Supervised practice canoe',1400,'wilderness'],['fuel','Checked stove fuel supply',60,'wilderness'],['chair','Folding campsite chair',80,'wilderness'],['table','Folding campsite table',180,'wilderness'],['tool','Supervised practical tool kit',150,'wilderness'],['rv','Campsite and RV connection checklist kit',200,'wilderness'],['wood','Dry prepared firewood bundle',25,'camp'],['ice','Camp cooler ice',10,'camp'],['groceries','Weekly pantry groceries',180,'camp'],['drinks','Family drinks and water refill pack',30,'camp'],['snacks','Fruit and substantial snack basket',25,'camp'],['clothing','Camp clothing and spare shirt',35,'camp'],['souvenir','Honeybrook camp keepsake',15,'camp'],['recreation','Soft recreation equipment set',100,'camp'],['campingbook','A Cub’s Camping Companion',25,'camp'],['survivalbook','Woodland Readiness for Families',30,'camp'],['puzzlebook','Cubs’ Woodland Puzzle & Coloring Book',20,'camp'],['encouragementbook','A Quiet Page of Encouragement',20,'camp']
  ]);
  const enterprises = [
    ['bakery','Wally’s Bakery Partnership','bakery',18000,'bake'],['cafe','Honey Mug Café','dining',16000,'cook'],
    ['craft','Craft & Textile Studio','studio',14000,'textile'],['garden','Garden Produce Stand','garden',12000,'garden'],
    ['wilderness','Wilderness Equipment Store','wilderness',22000,'inventory'],['camp','General Camp Store','campstore',18000,'stock'],
    ['cabins','Family Cabin Guesthouse','cabins',30000,'housekeeping'],['outfit','Waterfront Outfitters','waterfront',20000,'water'],
    ['repair','Honeybrook Repair Workshop','workshop',16000,'repair'],['books','Learning & Books Cabin','school',14000,'teach']
  ];
  // Choices have practical feedback and a checked outcome, rather than a click counter.
  const step = (prompt, choices, correct, result) => ({prompt, choices, correct, result});
  const tasks = {
    welcome:{name:'Settle in with Sammy’s welcome',role:'Family member',skill:'Discovery',person:'sammy',pay:0,steps:[
      step('Sammy approaches at the Welcome Bridge. You are startled by a town of bears and people. What will help you feel safe?',['Run into the unmarked woods','Listen from the open Welcome House porch'],1,'Sammy gives you space, introduces Amelia and Tom, and offers a seat. Food and shelter come before questions about your past or skills.'),
      step('Your separate player account has a survey and trust papers. These are not Harold’s sealed ancestral letter. How should you care for your papers?',['Record the marked land and keep the originals safe','Dig anywhere immediately'],0,'You keep your player survey and account papers safe. They are an existing game extension, not a new claim about the founders or Carmen’s ancestry. Harold’s century-old letter stays part of her family story.'),
      step('A place here is already offered freely. What develops practical skill and responsibility without buying belonging?',['Buying everybody’s loyalty','Listening, learning and helping'],1,'You keep the survey as a separate player keepsake. Your existing $250,000 account and trillion-dollar inheritance reserve stay intact. Learning and service develop responsibilities; your bed, food and belonging were never conditional on either.')],once:true},
    cook:{name:'Prepare today’s cafeteria meal',role:'Cook',skill:'Cooking',person:'sofia',pay:25000,steps:[
      step('Read today’s menu and count 12 portions, including an allergy-safe alternative.',['Guess the ingredients','Check the menu, portion card and allergy notes'],1,'The portion card is ready for 12 diners. Sofía sets aside an appropriate alternative before preparation.'),
      step('Before preparing the ingredients, choose your tools.',['Wash hands; clean surfaces; separate raw ingredients','Use one unwashed board for everything'],0,'Clean boards, measuring tools and separate preparation stations are laid out.'),
      step('The meal is ready to serve. What inspection comes first?',['Check the recipe, safe cooking and holding temperatures with the supervisor','Serve without checking'],0,'The supervisor checks the prepared meal, portions and safe temperatures. Twelve substantial plates are served; the counter changes from ingredients to a finished tray.')]},
    bake:{name:'Bake and share honey bread',role:'Cook',skill:'Baking',person:'wally',pay:20000,steps:[step('Prepare six loaves.',['Measure flour, water, yeast and honey from Wally’s recipe','Add ingredients without measuring'],0,'Six measured dough portions wait on the counter.'),step('The dough has risen.',['Ask Wally to supervise the oven and bake to the recipe','Leave the oven unattended'],0,'Wally checks the oven; golden loaves replace the dough.'),step('Pack the bread.',['Keep one loaf for Wally and label the shared loaves','Give every loaf away, including supper'],0,'Five loaves go to the Welcome House. Wally’s supper loaf stays by his kettle.')]},
    repair:{name:'Repair and inspect a loose bench',role:'Worker',skill:'Carpentry',person:'daniel',pay:40000,steps:[step('A bench rocks on the path.',['Mark it out of use and inspect the loose joint','Invite someone to sit on it'],0,'The bench is cordoned off; Daniel finds a loose joint.'),step('Choose a safe repair.',['Use the correct fastener with Daniel’s supervision','Cover the loose joint with paint'],0,'The joint is secured and the rough edge is sanded.'),step('Return the bench to service.',['Check stability and sign the maintenance record','Remove the sign before checking'],0,'The steady bench is open again. The inspection joins the permanent history.')]},
    garden:{name:'Tend and gather a garden bed',role:'Worker',skill:'Gardening',person:'marie',pay:20000,steps:[step('Inspect the garden bed.',['Check soil moisture and identify ready crops','Pull every plant out'],0,'The bed needs a measured watering; mature carrots are marked.'),step('Care for the plants.',['Water at the roots and weed around seedlings','Flood the paths'],0,'The soil is moist and the seedlings are clear of weeds.'),step('Gather the crop.',['Harvest only mature carrots and record the basket','Pick the seedlings too'],0,'A basket of carrots replaces the marked mature plants. Seedlings remain for another day.')]},
    textile:{name:'Make a woven keepsake',role:'Camper',skill:'Textiles',person:'lin',pay:10000,steps:[step('Prepare your small loom.',['Check the frame and choose smooth yarn','Use tangled yarn on a broken frame'],0,'A checked loom and two colors of yarn are ready.'),step('Build the weave.',['Pass over and under, keeping even tension','Pull every row as tight as possible'],0,'Your alternating rows make a colorful square.'),step('Finish the piece.',['Secure the ends and inspect the edges with Lin','Cut through the middle'],0,'Your finished woven square becomes a scrapbook keepsake.')]},
    paint:{name:'Paint the pond’s changing light',role:'Camper',skill:'Painting',person:'aiko',pay:10000,steps:[step('Study the scene.',['Notice the sky, water and light direction','Paint without looking'],0,'You sketch the pond’s horizon and reflection.'),step('Build the painting.',['Layer sky, distant banks, water and foreground','Cover the entire sketch in one opaque color'],0,'The pond takes shape in layers on your canvas.'),step('Finish and review.',['Let the paint settle and sign the picture','Smear the wet picture into the bag'],0,'A signed pond study is added to your collection.')]},
    water:{name:'Prepare a supervised paddle outing',role:'Counselor',skill:'Water safety',person:'amina',pay:50000,steps:[step('Before approaching the water, inspect conditions.',['Check weather and ask the waterfront supervisor','Launch during thunder'],0,'The supervisor checks conditions. This practice stays ashore if weather is unsafe.'),step('Prepare every participant.',['Fit life jackets and count buddies','Let confident swimmers skip life jackets'],0,'Every camper has a fitted life jacket and a buddy.'),step('Close the outing.',['Check everyone back in and inspect stored boats','Leave boats loose on the bank'],0,'The headcount matches and boats are secured. The supervised practice is recorded.')]},
    care:{name:'Prepare the infirmary welcome station',role:'Worker',skill:'Care',person:'maya',pay:30000,steps:[step('Prepare the room.',['Clean surfaces and lay out fresh linens','Reuse soiled linens'],0,'Fresh linens and clean seating are ready.'),step('Check supplies.',['Count sealed supplies with the nurse','Give out medicine without the nurse'],0,'The supervising health worker checks sealed supplies; no medical treatment is simulated.'),step('Welcome families.',['Check privacy, drinking water and accessible paths','Leave private records on the table'],0,'The welcoming station is ready, with privacy and clear paths.')]},
    inventory:{name:'Inspect wilderness equipment orders',role:'Owner',skill:'Inventory',person:'arjun',pay:30000,steps:[step('Sort the delivery.',['Separate camping equipment from groceries','Mix fuel with food'],0,'Shelter, sleeping gear and tools go to Wilderness Store shelves.'),step('Inspect equipment.',['Check seals, instructions and weather protection','Sell damaged equipment'],0,'Damaged stock is set aside; usable equipment is labeled.'),step('Reconcile the order.',['Match counts to the order and record shortages','Invent missing items'],0,'The wilderness inventory matches the checked delivery.')]},
    stock:{name:'Stock the general Camp Store',role:'Worker',skill:'Retail',person:'arjun',pay:20000,steps:[step('Sort the shelves.',['Keep food, toiletries and crafts in their proper areas','Put toiletries beside unpackaged food'],0,'Groceries, toiletries and recreation shelves are organized.'),step('Check the food.',['Inspect dates, seals and safe storage','Ignore damaged packaging'],0,'Only suitable food reaches the shelf.'),step('Open the store.',['Check prices, access and the stock record','Open without prices'],0,'Affordable prices and checked stock are ready for visitors.')]},
    housekeeping:{name:'Prepare a family cabin',role:'Worker',skill:'Hospitality',person:'maya',pay:30000,steps:[step('Check the arrival plan.',['Count beds and accessibility needs','Guess which family is arriving'],0,'The family’s beds and access requirements are confirmed.'),step('Prepare connected spaces.',['Clean bathroom, make beds and set out drinking water','Skip the bathroom'],0,'Fresh beds and a clean bathroom welcome the family.'),step('Inspect before check-in.',['Test lights, exits and the room checklist','Hand over the key without inspection'],0,'The inspected cabin is ready for a comfortable stay.')]},
    teach:{name:'Lead a practical learning review',role:'Counselor',skill:'Teaching',person:'lin',pay:35000,steps:[step('Choose a helpful learning plan.',['Ask what the cubs already know','Give a test with no explanation'],0,'You plan a gentle map-reading practice around the cubs’ knowledge.'),step('Guide the practice.',['Demonstrate a map symbol, then let each cub try','Do all the work for them'],0,'Every cub locates the path and gathering place.'),step('Review learning.',['Ask each cub to explain a useful discovery','Award skill without practice'],0,'A learning review records their completed practice.')]},
    shelter:{name:'Complete the whole-camp shelter drill',role:'Counselor',skill:'Preparedness',person:'amina',pay:50000,steps:[step('Begin a calm practice drill for 24 campers and 6 staff.',['Use the roster and check everyone in','Assume nobody is missing'],0,'All 30 names are checked against the roster.'),step('Assign underground spaces.',['Count water, first aid, comfort rooms and accessible seating','Block the exit with supplies'],0,'Thirty places, supplies and clear exits are checked. Games and KJV Bibles are set out.'),step('Finish the drill.',['Reconcile all 30 check-outs with the supervisor','Dismiss the group without counting'],0,'All 30 people are accounted for. This was a practice drill, not a live weather warning.')]},
    firewood:{name:'Prepare and store firewood',role:'Worker',skill:'Fire care',person:'daniel',pay:25000,steps:[step('Select wood with the supervisor.',['Use dry seasoned wood and appropriate tools','Cut living trees without permission'],0,'Dry seasoned wood is selected; tool work is supervised.'),step('Store the wood.',['Stack it off the ground under a ventilated cover','Seal wet wood in a bag'],0,'A ventilated raised stack keeps the wood ready.'),step('Inspect the fire area.',['Check water, clearance and local conditions','Light a fire immediately in daylight'],0,'The fire area is checked. Lighting remains a separate nighttime activity.')]},
    fellowship:{name:'Share a peaceful KJV devotion',role:'Family member',skill:'Fellowship',person:'elijah',pay:0,steps:[step('Open the study together.',['Read Psalm 23:1 — “The LORD is my shepherd; I shall not want.”','Rush the group to finish'],0,'You read the KJV verse slowly and make room for quiet reflection.'),step('Put the lesson into practice.',['Ask how to help a neighbor today','Treat money as a measure of spiritual standing'],0,'Your family plans a practical kindness.'),step('Close the devotion.',['Listen, pray and record what you learned','Claim leadership without service'],0,'Your learning review records a peaceful shared devotion.')]},
    sunset:{name:'Join the whole-camp sunset gathering',role:'Camper',skill:'Community',person:'elijah',pay:0,hour:19,steps:[step('Welcome the families.',['Make space for every camper and staff member','Keep the seats for only your friends'],0,'Families gather with room for everyone.'),step('Share the evening.',['Sing, listen and share a thankful testimony','Tell frightening ghost stories'],0,'Music and wholesome stories carry across the gathering place.'),step('Return together.',['Check the group and walk back by the lit path','Leave cubs to find their own way'],0,'The checked group returns peacefully. The sunset gathering becomes a family memory.')]},
    campfire:{name:'Share a supervised nighttime campfire',role:'Camper',skill:'Fire care',person:'elijah',pay:10000,hour:21,item:'smores',steps:[step('Before lighting, check the fire area.',['Ask the supervisor to check weather, clearance and water','Light despite unsafe conditions'],0,'The supervisor checks the fire area and local conditions.'),step('Share the evening safely.',['Use supervised roasting tools for s’mores and wholesome stories','Run around with burning sticks'],0,'S’mores, worship and gentle storytelling fill the evening.'),step('Close the fire.',['Have the supervisor extinguish and inspect every ember','Leave a warm fire unattended'],0,'The fire is out and the area is inspected.')]},
    hiking:{name:'Walk the marked hills trail',role:'Camper',skill:'Navigation',person:'amina',pay:15000,trip:true,steps:[step('Check the route.',['Use the marked map and weather plan','Leave the marked trail'],0,'Your group follows the checked route.'),step('At the trail junction, choose a direction.',['Match the map symbol and stay together','Separate without a plan'],0,'Everyone reaches the viewpoint together.'),step('Finish the walk.',['Count the group and record the route','Skip the return check'],0,'Everyone returns to the campsite; the route joins your field journal.')]}
  };
  const craftProjects = [
    ['pottery','Pottery','aiko','clay, a work board and a damp sponge','Pinch an even wall and smooth the rim','Ask the studio supervisor to dry and fire the pot safely'],
    ['sewing','Sewing','lin','fabric, a threaded needle and a supervised cutting area','Use a steady running stitch along the marked seam','Secure the thread and inspect the seam before using the pouch'],
    ['knitting','Knitting','lin','smooth yarn and a matched pair of knitting needles','Work each loop without dropping the next live stitch','Bind off the final row and weave in the yarn ends'],
    ['crochet','Crochet','lin','smooth yarn and a matching crochet hook','Draw the yarn through the loops with even tension','Fasten off and weave in the loose yarn ends'],
    ['embroidery','Embroidery','lin','a hoop, fabric and embroidery floss','Follow the marked flower with evenly spaced stitches','Secure the floss at the back and inspect the flower'],
    ['crossstitch','Cross-stitch','lin','gridded fabric, a chart and a blunt tapestry needle','Count the chart squares and cross each stitch consistently','Check the count and secure the floss without distorting the fabric'],
    ['quilting','Quilting','lin','prepared fabric squares, batting and backing','Align the squares and stitch the marked seams','Layer and quilt the small mat before binding its edge'],
    ['punchneedle','Punch needle','lin','a supported hoop, suitable cloth and a punch needle','Keep the needle opening facing forward and form even loops','Inspect the looped surface and secure the project edges'],
    ['needlepoint','Needlepoint','lin','canvas, yarn and a blunt tapestry needle','Count the canvas and cover the marked area with consistent stitches','Secure the yarn on the back and inspect the canvas tension'],
    ['tapestry','Tapestry','lin','a small warped frame, a shuttle and colored weft','Weave over and under the warp to build the planned color areas','Secure and finish the woven edges with the teacher'],
    ['tatting','Tatting','lin','a tatting shuttle and smooth cotton thread','Practice forming double stitches that slide on the core thread','Close a small ring and secure the thread for a lace sample'],
    ['nalbinding','Nålebinding','lin','a blunt single needle and short lengths of suitable wool','Use the teacher’s looped stitch and join a fresh yarn length','Finish the small wool sample and inspect the connected loops'],
    ['macrame','Macramé','lin','cotton cord and a secure support','Tie a row of square knots with even spacing','Trim with supervision and inspect the secure hanging loop'],
    ['felting','Felting','lin','wool, warm soapy water and a washable mat','Layer and gently wet-felt the wool with steady rolling','Rinse, shape and dry the small felt coaster'],
    ['spinning','Spinning','lin','prepared wool and a supervised drop spindle','Draft a small amount of fiber and add a controlled twist','Wind off the sample yarn and inspect its evenness']
  ];
  for(const [id,name,person,tools,technique,finish] of craftProjects){tasks[id]={name:'Make a '+name.toLowerCase()+' keepsake',role:'Camper',skill:name,person,pay:10000,steps:[
    step('Choose the materials for your supervised '+name.toLowerCase()+' project.',['Prepare '+tools,'Use damaged tools and unidentified materials'],0,'Your '+name.toLowerCase()+' materials are laid out and checked with the teacher.'),
    step('Practice the project’s central technique.',[technique,'Skip the technique and claim a finished project'],0,'You practice carefully with the teacher: '+technique.toLowerCase()+'. The work takes shape.'),
    step('Finish and inspect your work.',[finish,'Store the unfinished project as if it were complete'],0,'Your '+name.toLowerCase()+' sample is inspected and added to the family keepsake collection.')
  ]};}
  tasks.fishing={name:'Practice supervised pond fishing',role:'Camper',skill:'Fishing',person:'amina',pay:15000,item:'fish',steps:[
    step('Prepare at the pond.',['Check permission, local rules, weather and supervised equipment','Cast without checking who is nearby'],0,'The supervisor checks local rules, weather, bank footing and the rod.'),
    step('Choose your place and cast.',['Keep space around the hook and use the marked fishing spot','Swing the hook toward the group'],0,'You make a careful supervised cast from the marked place.'),
    step('Finish with care.',['Follow the supervisor’s handling and release instructions, then store the hook safely','Leave line and hooks on the bank'],0,'Your practice is recorded; equipment is safely stored and the bank is clear.')
  ]};
  const location = (name,image,parent,activities,description) => ({name,image,parent,activities,description});
  const locations = {
    home:location('My Honeybrook cottage','bear-hollow-cottage.png',null,['welcome'],'A welcoming note from Sammy waits beside your separate player-account papers. Connected rooms lead through your own cottage; these game additions do not replace the original family story.'),
    living:location('Cottage living room','room.jpg','home',['fellowship'],'A connected family sitting room, with doors to your bedroom, kitchen, study and porch.'),
    bedroom:location('Cottage bedroom','rest.jpg','living',[],'A quiet room for deliberate rest. Use the calendar to advance to tomorrow; browsing never advances a day.'),
    bathroom:location('Cottage bathroom','room.jpg','bedroom',['housekeeping'],'Fresh linens and a connected doorway back to the bedroom.'),
    kitchen:location('Cottage kitchen','bakery.jpg','living',['cook','bake'],'A family kitchen for real preparation and substantial meals.'),
    study:location('Cottage study den','den.jpg','living',['teach','fellowship'],'Read learning reviews, keep Father’s survey safe, and plan tomorrow.'),
    office:location('Cottage management office','wood.jpg','study',['inventory'],'The enterprise ledger and camp accounts belong here.'),
    porch:location('Cottage porch and garden','garden.jpg','living',['garden','paint'],'Relax outdoors or take the path toward town and camp.'),
    square:location('Honeybrook Town Square','village.jpg','porch',['welcome','sunset'],'The bridge connects your story to Amelia, Tom and Sammy. The original illustrated town remains open from the navigation bar.'),
    bakery:location('Wally’s Bakery','bakery.jpg','square',['bake'],'Prepare bread with Wally and keep one loaf for his supper.'),
    campgate:location('Living Word family camp entrance','welcome-house.webp','square',['shelter'],'A peaceful family-camp game extension beside Honeybrook; its operations do not replace the book’s founding history. Security check-in leads to cabins and administration.'),
    cabins:location('Family cabins and staff quarters','bear-hollow-cabin.png','campgate',['housekeeping','fellowship'],'Family cabins, staff accommodation and connected facilities support a substantial stay.'),
    scouts:location('Boy and girl scout camp','hollow.jpg','cabins',['teach','inventory'],'Bunkhouses and tents share supervised practical learning, with separate sleeping arrangements and family meeting places.'),
    dining:location('Dining hall and cafeteria kitchen','cakes.jpg','cabins',['cook','bake'],'A rotating seven-day menu supplies breakfast, lunch and dinner. Preparation follows portions, ingredients and inspections.'),
    recreation:location('Recreation hall','carnival.png','cabins',['teach','fellowship'],'A place for family learning and calm indoor gatherings. Existing town sports and arcade games remain available in the original town.'),
    school:location('School and learning cabin','schoolroom.webp','cabins',['teach'],'Practical reviews reward what you actually practice.'),
    infirmary:location('Infirmary and healthcare','welcome-house.webp','cabins',['care'],'The nurse supervises supplies, comfort and privacy.'),
    bathhouse:location('Camp bathhouses','room.jpg','cabins',['housekeeping'],'Prepare clean facilities and check accessible paths.'),
    admin:location('Administration and security','wood.jpg','campgate',['inventory','shelter'],'Rosters, arrival planning and shelter assignments are checked here.'),
    workshop:location('Maintenance and firewood store','wood.jpg','admin',['repair','firewood'],'Repair tools, storage and raised firewood stacks support the whole camp.'),
    mail:location('Mail-room cabin','harold-home.png','admin',[],'Read fresh morning mail and the Gazette in your family dashboard. Read letters leave the unread inbox; the important events stay in history.'),
    shelter:location('Whole-camp storm shelter','den.jpg','admin',['shelter','fellowship'],'Practice check-in for 30 people, supply assignments, comfort areas, games and KJV fellowship. This is a story setting, not a real emergency service.'),
    well:location('Sacred well retreat','pond.jpg','cabins',['fellowship'],'A quiet place for Scripture and reflection.'),
    studio:location('Painting and textile studio','paint.jpg','school',['paint','textile'],'Supervised tools and step-by-step work turn practice into lasting keepsakes.'),
    garden:location('Camp gardens','garden.jpg','cabins',['garden'],'Garden work leaves recorded crops, maintained beds and shared produce.'),
    waterfront:location('Fishing pond and waterfront','pond.jpg','garden',['water','paint'],'Practice supervised water preparation and paint the pond’s light.'),
    wilderness:location('Wilderness Store — For Camping Equipment ONLY','barn.jpg','campgate',['inventory'],'Shelter, sleeping gear, safe cooking equipment, light, power, maps, tools, first aid and weather protection. Connected directly to the general Camp Store.'),
    campstore:location('General Camp Store','hive.jpg','wilderness',['stock'],'Food, drinks, s’mores, toiletries, fishing gear, recreation, souvenirs, clothing, crafts and books. Camping equipment belongs next door.'),
    hills:location('Hills campsite','hollow.jpg','scouts',['hiking','campfire'],'Check every camper and shared item first. Only the notification’s Begin camping trip button can start your stay.'),
    gathering:location('Sunset gathering and night fire circle','hollow.jpg','cabins',['sunset','campfire','firewood'],'Join the whole camp at sunset. Campfires happen only at night, with supervision and safe weather.')
  };
  locations.studio.activities.push(...craftProjects.map(p=>p[0]));
  locations.waterfront.activities.push('fishing');
  Town.install(tasks,locations);
  const roles=['Family member','Camper','Cook','Counselor','Worker','Owner','Villager','Manager'];
  const ranks = [{name:'New neighbor',work:0,trust:0,skills:0},{name:'Helpful camper',work:3,trust:3,skills:2},{name:'Camp worker',work:8,trust:8,skills:4},{name:'Counselor',work:16,trust:16,skills:6},{name:'Camp steward',work:30,trust:30,skills:8},{name:'Community leader',work:50,trust:50,skills:10}];
  function rank(s){return ranks.filter(r=>s.completed>=r.work&&s.trust>=r.trust&&Object.keys(s.skills).length>=r.skills).at(-1);}
  for(const t of Object.values(tasks))if(canonicalPerson[t.person])t.person=canonicalPerson[t.person];
  function initial(today=realDate()){return {version:VERSION,revision:0,updatedAt:0,date:today,day:1,hour:9,location:'home',role:'Family member',balance:250000,reserve:999999750000,trust:0,completed:0,skills:{},counts:{},progress:{},history:[],keepsakes:[],relationships:{},businesses:{},inventory:{},prepared:{},trip:false,tripNights:0,partner:'sammy',unread:[{id:'arrival',title:'A letter from Sammy',body:'You can eat first. Welcome to the town Amelia and Tom built. Harold’s sealed ancestral letter belongs to Carmen’s family story, not your account. Your existing player finances remain separate.'}],quizDates:[],condition:100};}
  function record(s,text,kind='memory'){s.history.push({day:s.day,date:s.date,hour:s.hour,text,kind});}
  function replenish(s){if(s.balance<25000&&s.reserve>0){const transfer=Math.min(250000-s.balance,s.reserve);s.balance+=transfer;s.reserve-=transfer;record(s,'Family trust transfer: $'+transfer.toLocaleString('en-US')+'.','finance');}}
  function valid(s){
    const plain=x=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype;
    if(!plain(s)||s.version!==VERSION||!Number.isSafeInteger(s.revision)||s.revision<0||!Number.isFinite(s.updatedAt)||s.updatedAt<0||!/^\d{4}-\d{2}-\d{2}$/.test(s.date)||!Number.isFinite(Date.parse(s.date+'T12:00:00Z'))||!Number.isSafeInteger(s.day)||s.day<1||![9,13,17,19,21].includes(s.hour)||!locations[s.location])return false;
    if(!roles.includes(s.role)||!residents.some(p=>p.id===s.partner))return false;
    if(!['balance','reserve','trust','completed','condition','tripNights'].every(k=>Number.isSafeInteger(s[k])&&s[k]>=0)||s.condition>100||typeof s.trip!=='boolean')return false;
    if(!['skills','counts','progress','relationships','businesses','inventory','prepared'].every(k=>plain(s[k])&&!Object.keys(s[k]).some(key=>['__proto__','constructor','prototype'].includes(key))))return false;
    if(!Object.values(s.skills).every(n=>Number.isSafeInteger(n)&&n>=0)||!Object.entries(s.counts).every(([id,n])=>tasks[id]&&Number.isInteger(n)&&n>=0&&n<=3))return false;
    if(!Object.entries(s.progress).every(([id,n])=>tasks[id]&&Number.isInteger(n)&&n>=0&&n<tasks[id].steps.length))return false;
    if(!Object.entries(s.relationships).every(([id,n])=>residents.some(p=>p.id===id)&&Number.isInteger(n)&&n>=0))return false;
    if(!Object.entries(s.inventory).every(([id,n])=>gear.some(g=>g[0]===id)&&Number.isInteger(n)&&n>=0&&n<=128))return false;
    if(!Object.entries(s.prepared).every(([id,n])=>['You','Noah','Grace','Shared'].includes(id)&&n===true))return false;
    if(!Object.entries(s.businesses).every(([id,b])=>enterprises.some(e=>e[0]===id)&&plain(b)&&Number.isInteger(b.staff)&&b.staff>=0&&b.staff<=3&&Number.isInteger(b.supplies)&&b.supplies>=0&&b.supplies<=9&&Number.isInteger(b.quality)&&b.quality>=0&&b.quality<=100&&Number.isInteger(b.servedDay)&&b.servedDay>=0&&Number.isInteger(b.collectedDay)&&b.collectedDay>=0))return false;
    if(!Array.isArray(s.history)||!s.history.every(h=>plain(h)&&typeof h.text==='string'&&typeof h.kind==='string'&&Number.isInteger(h.day)&&h.day>0&&typeof h.date==='string'&&Number.isInteger(h.hour)))return false;
    if(!Array.isArray(s.keepsakes)||!s.keepsakes.every(k=>typeof k==='string')||!Array.isArray(s.quizDates)||!s.quizDates.every(d=>typeof d==='string'))return false;
    if(s.cookingPlan!=null&&(!plain(s.cookingPlan)||!Number.isSafeInteger(s.cookingPlan.day)||s.cookingPlan.day<1||![9,13,17,19,21].includes(s.cookingPlan.hour)))return false;
    if(!Quiz.valid(s.dailyQuiz)||!Hollow.valid(s.hollow))return false;
    if(s.roomQuizzes!==undefined&&(!plain(s.roomQuizzes)||Object.entries(s.roomQuizzes).some(([room,q])=>!Object.hasOwn(Quiz.rooms,room)||q?.room!==room||!Quiz.valid(q))))return false;
    if(s.townPlans!=null&&(!plain(s.townPlans)||!Object.entries(s.townPlans).every(([id,p])=>tasks[id]?.town&&plain(p)&&Number.isInteger(p.day)&&p.day>0&&[9,13,17,19,21].includes(p.hour))))return false;
    if(s.townWorks!=null&&(!plain(s.townWorks)||!Object.entries(s.townWorks).every(([id,v])=>tasks[id]?.town&&v!=null&&typeof v==='object'&&JSON.stringify(v).length<=5000)))return false;
    if(s.townResults!=null&&(!plain(s.townResults)||!Object.entries(s.townResults).every(([id,p])=>tasks[id]?.town&&plain(p)&&Number.isInteger(p.day)&&p.day>0&&Number.isInteger(p.total)&&p.total>0)))return false;
    return Array.isArray(s.unread)&&s.unread.every(m=>plain(m)&&['id','title','body'].every(k=>typeof m[k]==='string'));
  }
  const people=['You','Noah','Grace']; // Stable legacy equipment-slot IDs, not new story characters.
  const participantName=id=>({You:'You',Noah:'Lance Hearthwell',Grace:'Landis Hearthwell',Shared:'Shared equipment'})[id]||id; // Authored single-player family companions.
  function ready(s){return people.every(p=>s.prepared[p])&&s.prepared.Shared&&gear.slice(0,8).every(g=>(s.inventory[g[0]]||0)>=(['sleep','water','wash'].includes(g[0])?3:1));}
  function blocked(s,id){const t=tasks[id];if(!t)return 'This activity is unavailable.';
    if(t.once&&(s.keepsakes.includes(t.name)||id==='welcome'&&s.keepsakes.includes('Open Father’s survey envelope with Sammy')))return 'This discovery is already preserved in your scrapbook.';
    if((s.counts[id]||0)>=3)return 'Three completions today. This activity refreshes after a deliberate night’s rest.';
    if(t.hour&&s.hour!==t.hour)return t.hour===21?'Return at night (9 PM) for the supervised campfire.':'Return at sunset (7 PM) for the whole-camp gathering.';
    if((t.outdoor||['water','campfire','hiking','fishing'].includes(id))&&['Thunderstorm','Sleet','Snow'].includes(weather(s.date)))return 'Unsafe outing weather. Choose indoor practice or wait for suitable weather.';
    if(t.item&&!s.inventory[t.item])return t.item==='fish'?'Collect fishing tackle from the Camp Store first.':'Collect s’mores supplies from the Camp Store first.';
    if(t.trip&&!s.trip)return 'Prepare the whole group and choose Begin camping trip in notifications first.';
    return '';
  }
  function action(state,a,today=realDate()){
    if(!valid(state))throw new Error('Save data is invalid; use a recovery checkpoint.');
    const s=JSON.parse(JSON.stringify(state));let message='';replenish(s);
    function spend(amount){if(s.balance<amount)throw new Error('There is not enough spending money for this purchase.');s.balance-=amount;replenish(s);}
    switch(a.type){
      case 'hollowDraft':{const t=Hollow.tasks[a.id];if(!t||s.hollow?.progress[a.id]?.stage!==1)throw Error('Open the making step first.');const value=JSON.stringify(a.input);if(value.length>5000)throw Error('This work draft is too large.');s.hollow.progress[a.id].draft=JSON.parse(value);message='Your work in progress is saved.';break;}
      case 'hollowWork':{const t=Hollow.tasks[a.id];if(!t)throw Error('Unknown Hollow work order.');const unsafe=['Thunderstorm','Sleet','Snow'].includes(weather(s.date));const result=Hollow.run(s,{...a,unsafe},spend);message=result.message;if(Hollow.check(t,a.stage,a.input))s.role=['porridge','bakery'].includes(t.kind)?'Cook':t.kind==='fellowship'?'Family member':t.kind==='welcome'?'Villager':'Worker';if(result.charged)record(s,t.name+': $'+result.charged+' in checked materials.','finance');if(result.completed){s.completed++;s.trust++;s.balance+=t.pay;s.skills[t.skill]=(s.skills[t.skill]||0)+1;s.relationships[t.person]=(s.relationships[t.person]||0)+1;s.keepsakes.push(t.artifact);s.condition=Math.min(100,s.condition+5);record(s,'Bear Hollow · '+t.name+' completed with '+t.mentor+'. Kept '+t.artifact+'. Earned $'+t.pay.toLocaleString('en-US')+'.','accomplishment');message+=' '+(t.pay?'Earned $'+t.pay.toLocaleString('en-US')+'. ':'')+'Practice, a keepsake and shared memories are saved.';}else if(Hollow.check(t,a.stage,a.input))record(s,'Bear Hollow · '+t.name+': '+message,'work');break;}

      case 'visit':if(!locations[a.id])throw new Error('Unknown location.');s.location=a.id;message='You arrived at '+locations[a.id].name+'.';break;
      case 'role':if(!roles.includes(a.id))throw new Error('Unknown role.');s.role=a.id;message='You are experiencing today as '+a.id+'. All roles remain playable.';break;
      case 'partner':if(!residents.some(p=>p.id===a.id&&!p.archived))throw new Error('Choose a neighbor from the original story.');s.partner=a.id;message='Your next completed activity will become a shared memory.';break;
      case 'task':{
        const t=tasks[a.id];if(t?.town)throw new Error('Use this location’s hands-on activity workbench.');const reason=blocked(s,a.id);if(reason)throw new Error(reason);
        if(!locations[s.location].activities.includes(a.id))throw new Error('Visit the activity’s location first.');
        const index=s.progress[a.id]||0,p=t.steps[index];if(a.step!==undefined&&a.step!==index)throw new Error('This project has moved to the next step. Choose a decision from the current step.');if(!Number.isInteger(a.choice)||!p.choices[a.choice])throw new Error('Choose one of the available tools or decisions.');
        if(a.choice!==p.correct){message='Try a safer, more useful approach. Your progress and money are unchanged.';break;}
        if(a.id==='cook'&&index===0)s.cookingPlan={day:s.day,hour:s.hour};
        s.role=t.role;s.progress[a.id]=index+1;message=p.result;
        if(s.progress[a.id]===t.steps.length){delete s.progress[a.id];s.counts[a.id]=(s.counts[a.id]||0)+1;s.completed++;s.trust++;s.skills[t.skill]=(s.skills[t.skill]||0)+1;s.balance+=t.pay;
          for(const id of new Set([t.person,companion(s)]))s.relationships[id]=(s.relationships[id]||0)+1;
          const shared=residents.find(p=>p.id===companion(s)).name;
          record(s,t.name+' completed with '+shared+'. '+(a.id==='cook'?'Menu: '+meal(s)+'. ':'')+'Earned $'+t.pay.toLocaleString('en-US')+'.','accomplishment');
          if(a.id==='cook')s.cookingPlan=null;
          s.keepsakes.push(t.name);s.condition=Math.min(100,s.condition+5);
          if(t.item==='smores')s.inventory[t.item]--;
          for(const e of enterprises.filter(e=>e[4]===a.id||e[4]===t.service)){const b=s.businesses[e[0]];if(b&&b.staff>0&&b.supplies>0){b.servedDay=s.day;b.quality=Math.min(100,b.quality+15);}}
          message+=' Completed: $'+t.pay.toLocaleString('en-US')+' earned; '+t.skill+' practice, trust and a shared memory recorded.';
        }break;}
      case 'townTask':{
        const t=tasks[a.id],reason=blocked(s,a.id);if(!t?.town)throw new Error('Unknown town assignment.');if(reason)throw new Error(reason);if(s.location!==t.location)throw new Error('Enter this activity’s actual location first.');
        const index=s.progress[a.id]||0;if(a.step!==index)throw new Error('This assignment has moved to another step. Use the current workbench.');
        if(!Town.check(t,s,index,a.input,recipe)){message='The work needs another check. Compare the work order and try again; nothing is charged or awarded.';break;}
        if(index===0){if(t.cost)spend(t.cost);s.townPlans=s.townPlans||{};s.townPlans[a.id]={day:s.day,hour:s.hour,activityVersion:2};if(t.cost)record(s,t.name+': $'+t.cost+' of materials issued.','finance');}
        if(index===2){s.townWorks=s.townWorks||{};s.townWorks[a.id]=JSON.parse(JSON.stringify(a.input));}message=Town.outcome(t,index,s);record(s,message,'work');s.progress[a.id]=index+1;s.role=t.role;
        if(index===4){const finished=Town.work(t,s,recipe).title;delete s.progress[a.id];delete s.townPlans[a.id];s.counts[a.id]=(s.counts[a.id]||0)+1;s.completed++;s.trust++;s.skills[t.skill]=(s.skills[t.skill]||0)+1;s.balance+=t.pay;
          for(const id of new Set([t.person,companion(s)]))s.relationships[id]=(s.relationships[id]||0)+1;s.keepsakes.push(t.artifact);s.condition=Math.min(100,s.condition+5);s.townResults=s.townResults||{};s.townResults[a.id]={workTitle:finished,day:s.day,total:(s.townResults[a.id]?.total||0)+1};
          const shared=residents.find(p=>p.id===companion(s)).name;record(s,t.name+' completed with '+shared+'. Kept: '+t.artifact+'. Earned $'+t.pay.toLocaleString('en-US')+'.','accomplishment');
          for(const e of enterprises.filter(e=>e[4]===t.service)){const b=s.businesses[e[0]];if(b&&b.staff>0&&b.supplies>0){b.servedDay=s.day;b.quality=Math.min(100,b.quality+15);}}
          message+=' '+t.skill+' practice and a shared memory recorded. '+(t.pay?'Earned $'+t.pay.toLocaleString('en-US')+'.':'Your accomplishment is kept in the family scrapbook.');
        }break;}
      case 'campConsume':{if(!gear.some(g=>g[0]===a.id)||!Number.isInteger(a.quantity)||a.quantity<1||a.quantity>128||(s.inventory[a.id]||0)<a.quantity)throw new Error('The checked camp supplies are not available.');s.inventory[a.id]-=a.quantity;record(s,'Used '+a.quantity+' '+gear.find(g=>g[0]===a.id)[1]+' for a completed camp gathering.','camp');message='Camp supplies used and recorded.';break;}
      case 'buyGear':{const g=gear.find(g=>g[0]===a.id);if(!g)throw new Error('Unknown item.');if((s.inventory[a.id]||0)>=128)throw new Error('You have enough of this item for your group.');spend(g[2]);s.inventory[a.id]=(s.inventory[a.id]||0)+1;record(s,'Purchased '+g[1]+' for $'+g[2]+'.','finance');message='Item added to your checked inventory.';break;}
      case 'prepare':{
        if(![...people,'Shared'].includes(a.id))throw new Error('Unknown checklist.');
        const needed=a.id==='Shared'?['tent','cook','light','navigate','aid']:['sleep','water','wash'];
        const missing=needed.filter(id=>(s.inventory[id]||0)<(a.id==='Shared'?1:3));
        if(missing.length)throw new Error('Buy the required '+(a.id==='Shared'?'shared gear':'three sets of sleeping gear, water/meals and toiletries/clothing')+' before inspecting this checklist.');
        s.prepared[a.id]=true;message=a.id+' checklist inspected and complete.';break;}
      case 'beginTrip':if(!ready(s))throw new Error('Every camper and shared checklist must be complete.');if(s.trip)throw new Error('Your camping trip is already in progress.');s.trip=true;s.tripNights=0;s.location='hills';record(s,'Began a prepared family hills camping trip.');message='Your group begins the camping trip. Nothing began automatically.';break;
      case 'endTrip':if(!s.trip)throw new Error('No trip is in progress.');s.trip=false;s.location='home';record(s,'Returned home after '+s.tripNights+' camping nights.');message='You are home; your visit can continue for as long as you like.';break;
      case 'hour':if(![9,13,17,19,21].includes(a.hour)||a.hour<=s.hour)throw new Error('Choose a later time; tomorrow begins only through rest.');s.hour=a.hour;message='You take your time. It is now '+a.hour+':00 in camp.';break;
      case 'rest':{
        if(s.trip&&s.tripNights>=(rank(s).work>=16?14:7))throw new Error('This visit has reached its stay limit. Return home to rest; a new prepared visit is always available. Counselor standing unlocks fourteen nights.');
        const done=s.history.filter(h=>h.day===s.day&&h.kind==='accomplishment').length;
        s.date=addDay(s.date);s.day++;s.hour=9;s.counts={};s.progress=Object.fromEntries(Object.entries(s.progress).filter(([id])=>tasks[id]?.town));s.cookingPlan=null;if(s.trip)s.tripNights++;
        s.condition=Math.max(0,s.condition-(done?1:8));
        for(const b of Object.values(s.businesses))b.quality=Math.max(0,b.quality-5);
        s.unread.push({id:'morning-'+s.day,title:'Honeybrook Gazette · Day '+s.day,body:'Yesterday: '+done+' completed activities. '+Object.keys(s.businesses).length+' owned enterprises. Camp condition '+s.condition+'/100. '+(done?'Neighbors remember your completed service.':'The paths and cabins could use a helping hand today.')});
        record(s,'Rested into a new camp day. Daily activities refreshed.');replenish(s);message='Good morning. Fresh mail is waiting. The real quiz calendar has not changed.';break;}
      case 'readMail':{const m=s.unread.find(m=>m.id===a.id);if(!m)throw new Error('That letter has already been read.');s.unread=s.unread.filter(m=>m.id!==a.id);record(s,'Read: '+m.title+'. '+m.body,'mail');message=m.body;break;}
      case 'buyBusiness':{const e=enterprises.find(e=>e[0]===a.id);if(!e||s.businesses[a.id])throw new Error('This enterprise is unavailable or already owned.');spend(e[3]);s.businesses[a.id]={staff:0,supplies:0,quality:75,servedDay:0,collectedDay:0};record(s,'Purchased '+e[1]+' for $'+e[3]+'.','finance');message='Ownership recorded. Hire staff, order supplies and complete the enterprise’s service task before collecting revenue.';break;}
      case 'manage':{
        const b=s.businesses[a.id];if(!b)throw new Error('Purchase this enterprise first.');
        if(a.job==='staff'){if(b.staff>=3)throw new Error('Three employees are sufficient for this enterprise.');spend(3000);b.staff++;message='An authored local employee joins the roster. Daily accounts include $1,000 per employee in wages.';}
        else if(a.job==='supplies'){if(b.supplies>=9)throw new Error('The store room is full.');spend(2000);b.supplies=Math.min(9,b.supplies+3);message='Three service-day supply units delivered.';}
        else if(a.job==='revenue'){if(!b.staff||!b.supplies||b.servedDay!==s.day||b.collectedDay===s.day)throw new Error('Complete today’s service with staff and supplies before closing the accounts once.');if(b.quality<50)throw new Error('Standards need another inspected service task before accounts can close.');
          const gross=10000+Math.floor(b.quality/10)*1000,wages=b.staff*1000,net=gross-wages;b.supplies--;b.collectedDay=s.day;s.balance+=net;record(s,enterprises.find(e=>e[0]===a.id)[1]+': customers served; gross $'+gross+', wages $'+wages+', net $'+net+'.','finance');message='Accounts closed. Gross $'+gross.toLocaleString('en-US')+'; staff wages $'+wages.toLocaleString('en-US')+'; net revenue $'+net.toLocaleString('en-US')+'.';}
        else throw new Error('Unknown management task.');break;}
      case 'dailyQuizStart':if(a.room!==undefined){if(s.location!==Town.lookup[a.room]?.location)throw Error('Enter this quiz’s actual location first.');if(!Object.hasOwn(Quiz.rooms,a.room)||!Quiz.levels.includes(a.level))throw Error('Choose a classroom and quiz level.');if(s.roomQuizzes?.[a.room]?.date===today)throw Error('Continue this classroom’s existing daily quiz.');s.roomQuizzes=s.roomQuizzes||{};s.roomQuizzes[a.room]={date:today,level:a.level,room:a.room,answers:[],questions:Quiz.roomQuestions(today,a.level,a.room)};message=Quiz.rooms[a.room].subject+' · twenty classroom questions are ready.';break;}if(!Quiz.levels.includes(a.level))throw new Error('Choose one of the six quiz levels.');if(s.dailyQuiz?.date===today)throw new Error('Continue today’s existing quiz. A camp rest does not reset it.');if(a.subject!==undefined&&!Quiz.subjects.includes(a.subject))throw new Error('Choose a learning subject.');s.dailyQuiz={date:today,level:a.level,answers:[],...(a.subject?{subject:a.subject,questions:Quiz.questions(today,a.level,a.subject)}:{})};message='Today’s twenty-question quiz is ready. Take your time.';break;
      case 'dailyQuizAnswer':{if(a.room!==undefined&&s.location!==Town.lookup[a.room]?.location)throw Error('Return to this quiz’s actual location.');const q=a.room===undefined?s.dailyQuiz:s.roomQuizzes?.[a.room];if(!q||q.date!==today)throw new Error('Start today’s real-calendar quiz.');const qs=Quiz.forSession(q),index=q.answers.length;if(index>=20)throw new Error('Today’s twenty questions are already recorded.');if(a.step!==index||!Number.isInteger(a.choice)||a.choice<0||a.choice>2)throw new Error('Choose an answer from the current question.');q.answers.push(a.choice);message=(a.choice===qs[index].correct?'Correct. ':'Review: ')+qs[index].review;if(q.answers.length===20){const score=q.answers.filter((v,i)=>v===qs[i].correct).length;const skill=a.room?'Daily learning · '+a.room:'Daily learning';s.skills[skill]=(s.skills[skill]||0)+1;record(s,'Completed '+(a.room?a.room+' · ':'the ')+q.level+' real-calendar quiz for '+today+': '+score+'/20.','learning');message+=' Quiz complete: '+score+'/20. Your review is saved.';}break;}
      case 'quiz':{
        if(s.quizDates.includes(today))throw new Error('Today’s real-calendar learning review is already recorded. Resting does not reset it.');
        if(a.choice!==1){message='A map shows your route and helps you find the way back. Try again.';break;}
        s.quizDates.push(today);record(s,'Real-calendar learning review completed for '+today+': use a map to plan a route and return.','learning');message='Correct. Your real-calendar learning review is recorded without advancing camp time.';break;}
      default:throw new Error('Unknown action.');
    }
    s.revision++;s.updatedAt=Date.now();if(!valid(s))throw new Error('The action could not be saved safely.');return {state:s,message};
  }
  return {VERSION,realDate,addDay,season,weather,residents,participantName,menu,meal,recipe,gear,enterprises,tasks,locations,ranks,rank,initial,valid,ready,blocked,people,action,roles,Town,Quiz,Hollow};
});
