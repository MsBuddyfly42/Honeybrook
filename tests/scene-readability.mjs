import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.TEST_URL||'http://127.0.0.1:8792';
if(!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?/.test(base))throw Error('Use an isolated local test server.');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const width of [1440,390]){
 const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.evaluate(()=>localStorage.setItem('honeybrook_life_v1','scene-test-does-not-change-life'));
 await page.locator('.world-hotspots [data-frontgo="connectedTown"]').click();
 const marker=page.locator('#hbPlayableWorld [data-hb-place="school"]');await page.keyboard.press('Tab');await marker.focus();assert.equal(await marker.locator('span').last().evaluate(n=>getComputedStyle(n).visibility),'visible');
 await page.locator('.hb-world-rail [data-hb-tool="places"]').click();await page.locator('#hbWorldDialog [data-hb-place="school"]').click();await page.locator('[data-hb-enter="Honeybrook School"]').click();
 assert.equal(await page.locator('#destinationVisit h1').textContent(),'Honeybrook School');assert(await page.locator('[data-visit-home]').isVisible());assert(await page.locator('[data-visit-back]').isVisible());
 await page.locator('#visitFind input').fill('Post Office');await page.locator('#visitFind button').click();assert.equal(await page.locator('#destinationVisit h1').textContent(),'Honeybrook Post Office');
 await page.locator('#visitFind input').fill('A location that does not exist');await page.locator('#visitFind button').click();assert.match(await page.locator('.visit-find-result').textContent(),/No location found/);assert.equal(await page.locator('#destinationVisit h1').textContent(),'Honeybrook Post Office');
 await page.mouse.move(0,0);await page.locator('#visitFind input').focus();await page.waitForTimeout(180);assert.equal(await page.locator('.visit-room-sign').evaluate(n=>getComputedStyle(n).opacity),'0');
 await page.locator('.visit-room').focus();await page.waitForTimeout(180);assert.equal(await page.locator('.visit-room-sign').evaluate(n=>getComputedStyle(n).opacity),'1');
 const box=await page.locator('.visit-room').boundingBox();assert(Math.abs(box.width/box.height-1.5)<.02);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 const ratios=await page.locator('[data-visit-home],[data-visit-back],#visitFind button,.visit-neighbors button').evaluateAll(nodes=>{
  const luminance=color=>{const parts=color.match(/[\d.]+/g).slice(0,3).map(Number).map(n=>{n/=255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;});return parts[0]*.2126+parts[1]*.7152+parts[2]*.0722;};
  return nodes.map(n=>{const css=getComputedStyle(n),a=luminance(css.color),b=luminance(css.backgroundColor);return(Math.max(a,b)+.05)/(Math.min(a,b)+.05);});
 });assert(ratios.every(n=>n>=4.5));
 await page.locator('[data-visit-home]').click();assert.equal(await page.locator('#destinationVisit').isVisible(),false);assert(await page.locator('#honeybrookHome').isVisible());
 await page.goto(base+'/#visit='+encodeURIComponent('Welcome House Kitchen'));assert.equal(await page.locator('.house-rooms').count(),0);assert.equal(await page.locator('.visit-workspace').getAttribute('data-venue'),'picnic');
 await page.goto(base+'/#visit='+encodeURIComponent('Welcome House Porch'));assert.equal(await page.locator('.house-rooms').count(),0);
 await page.locator('#destinationVisit .scene-appearance summary').click();
 for(const weather of ['clear','rain','sleet','snow','thunderstorm','blizzard','tornado']){await page.locator('#destinationVisit [data-scene-appearance="weather"]').selectOption(weather);assert.equal(await page.locator('.visit-room').getAttribute('data-scene-weather'),weather);}
 for(const season of ['spring','summer','autumn','winter']){await page.locator('#destinationVisit [data-scene-appearance="season"]').selectOption(season);assert.equal(await page.locator('.visit-room').getAttribute('data-scene-season'),season);}
 await page.locator('#destinationVisit [data-scene-appearance="light"]').selectOption('night');assert.equal(await page.locator('.visit-room').getAttribute('data-scene-light'),'night');
 await page.locator('#destinationVisit [data-scene-appearance="weather"]').selectOption('rain');await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('#destinationVisit .scene-weather').evaluate(n=>getComputedStyle(n).animationName),'none');
 await page.reload();await page.locator('#destinationVisit h1').waitFor();assert.equal(await page.locator('.visit-room').getAttribute('data-scene-weather'),'rain');assert.equal(await page.locator('.visit-room').getAttribute('data-scene-light'),'night');
 assert.equal(await page.evaluate(()=>localStorage.getItem('honeybrook_life_v1')),'scene-test-does-not-change-life');assert.deepEqual(errors,[]);await context.close();
 console.log(`PASS ${width}px: exact Enter Honeybrook route, map-label keyboard visibility, current location, Home/Back, search and no-match handling, scenery labels/fixed aspect ratio, navigation contrast, correct Welcome House subrooms, no changes to Life save.`);
}}finally{await browser.close();}
