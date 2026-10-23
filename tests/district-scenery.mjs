import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const width of [1440,390]){
 const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8792');await page.locator('.world-hotspots [data-frontgo="connectedTown"]').click();await page.addStyleTag({content:'*{scroll-behavior:auto!important;transition:none!important}'});
 await page.evaluate(()=>localStorage.setItem('honeybrook_life_v1','district-scenery-preserve'));
 const scenes=page.locator('.fair-district-scene:visible');assert.equal(await scenes.count(),13);
 const sources=new Set();
 for(let i=0;i<13;i++){
  const scene=scenes.nth(i),image=scene.locator('.fair-district-art');await image.evaluate(n=>n.decode());assert(await image.evaluate(n=>n.naturalWidth>=1000));sources.add(await image.getAttribute('src'));
  const box=await scene.boundingBox();assert(Math.abs(box.width/box.height-1.5)<.03);
  const doors=scene.locator('.fair-district-door'),count=await doors.count();assert(count>=5);
  const first=doors.first();await first.focus();assert.equal(await first.locator('b').evaluate(n=>getComputedStyle(n).opacity),'1');
  await page.locator('#travelGrid button').first().focus();await page.mouse.move(0,0);assert.equal(await first.locator('b').evaluate(n=>getComputedStyle(n).opacity),'0');
  const routes=scene.locator('xpath=following-sibling::nav[1]').locator('button');assert.equal(await routes.count(),count);
  for(const j of [0,count-1]){
   const door=doors.nth(j),name=await door.evaluate(n=>[...n.attributes].find(a=>/^data-(nw|ne|se|fr|os|pk|ep|cc|hh|ts|sq|ms|bv)$/.test(a.name)).value);
   if(name==='Return to Honeybrook')continue;
   await routes.nth(j).click();assert.equal(await page.locator('#destinationVisit h1').textContent(),name);await page.locator('.visit-room-photo').evaluate(n=>n.decode());await page.locator('[data-visit-back]').click();
  }
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 assert.equal(sources.size,13);assert.equal(await page.evaluate(()=>localStorage.getItem('honeybrook_life_v1')),'district-scenery-preserve');assert.deepEqual(errors,[]);await context.close();console.log('PASS '+width+'px: 13 distinct Fair-style district maps, scenery visible, focus/hover labels, readable direct routes, actual destination entry and return, no overflow or Life-save changes.');
}}finally{await browser.close();}
