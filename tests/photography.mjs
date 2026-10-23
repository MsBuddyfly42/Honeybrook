import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const manifest=JSON.parse(readFileSync(new URL('../assets/fair-scenes/manifest.json',import.meta.url)));
for(const [name,p]of Object.entries(manifest)){
 assert.match(p.src,/^assets\/fair-scenes\/[a-z0-9-]+\.(jpg|png|webp)$/);
 assert.equal(p.generated,true);assert.equal(p.page,'assets/fair-scenes/credits.html');assert.match(p.license,/Generated Fair-style scenery/);assert(p.artist,name+' attribution');
 assert.equal(createHash('sha256').update(readFileSync(new URL('../'+p.src,import.meta.url))).digest('hex'),p.sha256,name+' verified photo');
}
assert.equal(Object.keys(manifest).length,102);assert.equal(new Set(Object.values(manifest).map(p=>p.src+'#'+(p.tile??''))).size,95);
console.log('PASS 102 Fair-style scene records and 95 distinct, checksum-verified scenery views.');
const base=process.env.TEST_URL||'http://127.0.0.1:8792';if(!/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/?/.test(base))throw Error('Use a local test server only.');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const width of [1440,390]){
 const context=await browser.newContext({viewport:{width,height:1000},timezoneId:'America/Chicago'}),p=await context.newPage(),errors=[],failed=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.url().includes('/assets/fair-scenes/')&&r.status()>=400)failed.push(r.status()+' '+r.url());});
 await p.goto(base);await p.evaluate(()=>localStorage.setItem('honeybrook_life_v1','photography-must-not-replace-life-save'));
 await p.locator('.world-hotspots [data-frontgo="connectedTown"]').click();assert.match(await p.locator('#hbPlayableWorld .hb-world-art>img').getAttribute('src'),/^assets\/fair-scenes\//);
 assert.equal(await p.locator('#hbPlayableWorld .hb-world-art .hb-world-marker').count(),0,'location buttons must not cover the scenery');
 await p.locator('.hb-world-rail [data-hb-tool="places"]').click();
 for(const key of ['welcome','bridge','homes','school','bakery','square','hollow']){
  if(!await p.locator(`#hbWorldDialog [data-hb-place="${key}"]`).count()){await p.keyboard.press('Escape');await p.locator('.hb-world-rail [data-hb-tool="places"]').click();}
  await p.locator(`#hbWorldDialog [data-hb-place="${key}"]`).click();const image=p.locator('#hbWorldDialog .hb-place-art');await image.evaluate(n=>n.decode());assert.match(await image.getAttribute('src'),/^assets\/fair-scenes\//);
 }
 await p.keyboard.press('Escape');await p.evaluate(()=>dispatchEvent(new CustomEvent('honeybrook-enter-place',{detail:{name:'Honeybrook School'}})));
 const destinations=await p.locator('#visitLocations option').evaluateAll(options=>options.map(n=>n.value));assert.equal(destinations.length,78);
 await p.evaluate(()=>{window.outdatedSceneSources=[];new MutationObserver(records=>{for(const r of records){for(const n of r.addedNodes){if(n.nodeType!==1)continue;for(const im of [...(n.matches?.('.visit-room-photo')?[n]:[]),...n.querySelectorAll('.visit-room-photo')])if(!im.getAttribute('src').startsWith('assets/fair-scenes/'))window.outdatedSceneSources.push(im.getAttribute('src'));}if(r.type==='attributes'&&r.target.matches('.visit-room-photo')&&!r.target.getAttribute('src').startsWith('assets/fair-scenes/'))window.outdatedSceneSources.push(r.target.getAttribute('src'));}}).observe(document.querySelector('#destinationVisit'),{subtree:true,childList:true,attributes:true,attributeFilter:['src']});});
 const go=async name=>{await p.locator('#visitFind input').fill(name);await p.locator('#visitFind button').click();await p.waitForFunction(n=>document.querySelector('#destinationVisit h1')?.textContent===n,name);};
 for(const name of destinations){
  await go(name);const photo=p.locator('.visit-room-photo');await photo.evaluate(n=>n.decode());const actual=await photo.getAttribute('src'),expected=await p.evaluate(n=>HoneybrookPhotos.path(n),name);assert.equal(actual,expected,name);assert(await photo.evaluate(n=>n.naturalWidth>=750),name);
  assert.match(await p.locator('#destinationVisit > main > .scene-photo-credit').textContent(),/Generated Fair-style scenery/);assert(await p.locator('.scene-visitor .visit-bear').isVisible());assert(await p.locator('[data-visit-home]').isVisible());assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),name+' overflow');
 }
 assert.deepEqual(await p.evaluate(()=>window.outdatedSceneSources),[]);
 console.log(`PASS ${width}px: all 78 destination Fair-style scenes, both navigation entries, seven town previews, credits, visible visitor context, no old-scene image flashes or overflow.`);
 for(const name of ['Hearthwell Home',"Big Mama's Cottage",'Country Homes','Goodberry Outreach House','Welcome House']){
  await go(name);const seen=[];for(const room of ['porch','kitchen','attic']){if(room==='porch'&&await p.locator('[data-room="porch"]').isHidden())await p.locator('[data-room="kitchen"]').click();await p.locator(`[data-adventure="room"][data-room="${room}"]`).click();await p.locator('.visit-room-photo').evaluate(n=>n.decode());seen.push(await p.locator('.visit-room-photo').evaluate(n=>n.getAttribute('src')+'#'+n.dataset.sceneTile));assert.equal(seen.at(-1),manifest[name+' '+room].src+'#'+(manifest[name+' '+room].tile??''));}
  assert.equal(new Set(seen).size,3,name+' distinct rooms');await p.reload();await p.locator('#destinationVisit h1').waitFor();assert.equal(await p.locator('.visit-room-photo').evaluate(n=>n.getAttribute('src')+'#'+n.dataset.sceneTile),manifest[name+' attic'].src+'#'+(manifest[name+' attic'].tile??''),name+' reload');
 }
 await go('Cub Cakes & Crumbs');const phases=[];
 phases.push(await p.locator('.living-action-room').evaluate(n=>getComputedStyle(n).backgroundImage+getComputedStyle(n).backgroundPosition));for(const name of ['Flour','Butter','Honey'])await p.locator(`[data-living="measure"][data-ingredient="${name}"]`).click();await p.locator('[data-living="mix"]').click();phases.push(await p.locator('.living-action-room').evaluate(n=>getComputedStyle(n).backgroundImage+getComputedStyle(n).backgroundPosition));for(let n=0;n<5;n++)await p.locator('[data-living="stir"]').click();phases.push(await p.locator('.living-action-room').evaluate(n=>getComputedStyle(n).backgroundImage+getComputedStyle(n).backgroundPosition));await p.clock.install();await p.clock.fastForward(5500);await p.locator('[data-living="finish"]').click();phases.push(await p.locator('.living-action-room').evaluate(n=>getComputedStyle(n).backgroundImage+getComputedStyle(n).backgroundPosition));assert.equal(new Set(phases).size,4);assert(phases.every(src=>src.includes('/assets/fair-scenes/')));
 assert.equal(await p.evaluate(()=>localStorage.getItem('honeybrook_life_v1')),'photography-must-not-replace-life-save');assert.deepEqual(failed,[]);assert.deepEqual(errors,[]);await context.close();
 console.log(`PASS ${width}px: 15 distinct house-room views, saved room restored on reload, four cooking scenery stages, existing progress retained and separate Life save unchanged.`);
}}finally{await browser.close();}
