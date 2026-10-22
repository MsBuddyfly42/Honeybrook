import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const url=process.env.TEST_URL||'http://127.0.0.1:8792';
if(!/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/?/.test(url))throw Error('Use a local test server only.');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const key='honeybrook_life_v1';
try{
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:1000},timezoneId:'America/Chicago',acceptDownloads:true});
  const p=await context.newPage(),errors=[],requests=[];p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(r.url().includes('/api/'))requests.push(r.url());});
  await p.goto(url);await p.evaluate(()=>localStorage.setItem('honeybrook_test_original_v1',JSON.stringify({kept:'untouched'})));
  const root=p.locator('#honeybrookLife'),button=(type,id)=>root.locator(`[data-life="${type}"]${id?`[data-id="${id}"]`:''}`),snapshot=async()=>{await p.waitForFunction(()=>document.querySelector('#honeybrookLife').dataset.busy!=='true');return p.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);};
  const tab=async id=>{await snapshot();await root.locator(`.life-tabs [data-id="${id}"]`).click();};const visit=async id=>{await button('visit',id).last().click();await snapshot();};
  await p.locator('[data-life-open="continue"]').first().click();assert.equal((await snapshot()).balance,250000);
  await button('task','welcome').filter({hasText:'Listen from'}).click();assert.equal((await snapshot()).progress.welcome,1);
  await p.reload();await p.locator('[data-life-open="continue"]').first().click();assert.match(await root.textContent(),/Step 2 of 3/);
  await button('task','welcome').filter({hasText:'Record the marked'}).click();await button('task','welcome').filter({hasText:'Listening, learning'}).click();assert.equal((await snapshot()).completed,1);
  assert.match(await root.textContent(),/survey/);assert.equal(await button('task','welcome').first().isDisabled(),true);
  const places=await p.evaluate(()=>Object.keys(HoneybrookLife.locations));
  for(const id of places){await visit(id);const photo=root.locator('.life-scene>img');await photo.evaluate(n=>n.decode());assert(await photo.evaluate(n=>n.naturalWidth>0));assert.match(await root.locator('.eyebrow').last().textContent(),/YOU ARE HERE/);assert(await root.evaluate(n=>n.scrollWidth<=n.clientWidth+1),id+' layout');}
  await visit('dining');
  const completeCook=async()=>{await button('task','cook').filter({hasText:'Check the menu'}).click();await button('task','cook').filter({hasText:'Wash hands'}).click();await button('task','cook').filter({hasText:'Check the recipe'}).click();};
  const balance=(await snapshot()).balance;await button('task','cook').filter({hasText:'Guess the ingredients'}).click();assert.equal((await snapshot()).balance,balance);
  for(let n=0;n<3;n++)await completeCook();assert.equal((await snapshot()).balance,balance+75000);assert.equal(await button('task','cook').first().isDisabled(),true);
  await tab('ownership');await button('buyBusiness','cafe').click();await button('manage','cafe').filter({hasText:'Hire employee'}).click();await button('manage','cafe').filter({hasText:'Order supplies'}).click();await button('manage','cafe').filter({hasText:'close today'}).click();await snapshot();assert.match(await root.locator('#lifeMessage').textContent(),/Complete today/);
  await tab('calendar');await button('askRest').click();await button('rest').click();assert.equal((await snapshot()).day,2);assert.equal((await snapshot()).counts.cook,undefined);
  await tab('places');await visit('dining');await completeCook();await tab('ownership');await button('manage','cafe').filter({hasText:'close today'}).click();await snapshot();assert.equal(await button('manage','cafe').filter({hasText:'close today'}).isDisabled(),true);
  await tab('family');await button('readMail','arrival').click();assert.equal((await snapshot()).unread.some(m=>m.id==='arrival'),false);assert((await snapshot()).history.some(h=>h.kind==='mail'));
  await tab('camping');await button('prepare','You').click();await snapshot();assert.match(await root.locator('#lifeMessage').textContent(),/Buy the required/);
  for(const id of ['tent','sleep','cook','light','navigate','aid','water','wash'])for(let n=0;n<(['sleep','water','wash'].includes(id)?3:1);n++)await button('buyGear',id).click();
  for(const id of ['You','Noah','Grace','Shared'])await button('prepare',id).click();assert.equal((await snapshot()).trip,false);
  assert.equal(await button('beginTrip').count(),0);await tab('family');await button('beginTrip').click();assert.equal((await snapshot()).trip,true);assert.equal((await snapshot()).location,'hills');
  await p.reload();await p.locator('[data-life-open="continue"]').first().click();assert.match(await root.textContent(),/YOU ARE HERE · Hills campsite/);
  await root.locator('#lifeSearch').fill('kitchen');assert(await root.locator('#lifeSearchResults [data-life="visit"]').count()>=2);assert.equal(await root.locator('#lifeSearchResults [data-id="waterfront"]').count(),0);
  await root.locator('#lifeSearch').fill('');await tab('saves');
  const downloaded=p.waitForEvent('download');await button('backup').click();const download=await downloaded;assert.match(download.suggestedFilename(),/^honeybrook-world-backup/);
  const chunks=[];for await(const chunk of await download.createReadStream())chunks.push(chunk);const exported=JSON.parse(Buffer.concat(chunks).toString());assert(exported.entries.honeybrook_test_original_v1);assert(exported.entries[key]);
  const before=await snapshot();await root.locator('#lifeImport').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...exported,entries:{[key]:JSON.stringify({...before,balance:-1})}}))});await p.waitForFunction(()=>document.querySelector('#lifeMessage').textContent.includes('rejected'));assert.equal((await snapshot()).balance,before.balance);
  await button('checkpoint').click();assert.match(await root.locator('#lifeRestorePreview').textContent(),/Review before restoring/);await button('cancelRestore').click();assert.equal((await snapshot()).revision,before.revision);
  await root.locator('#lifeImport').setInputFiles({name:'good.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});await p.waitForFunction(()=>document.querySelector('#lifeRestorePreview').textContent.includes('Review before restoring'));assert.equal((await snapshot()).revision,before.revision);
  const restored=p.waitForEvent('load');await button('restore').click();await restored;await p.locator('[data-life-open="continue"]').first().click();assert.equal((await snapshot()).balance,before.balance);assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('honeybrook_test_original_v1')).kept),'untouched');
  await tab('saves');await button('sound').click();await p.waitForFunction(()=>document.querySelector('[data-life="sound"]').textContent==='Mute atmosphere');await root.locator('#lifeVolume').fill('8');await button('sound').click();assert.equal(await button('sound').textContent(),'Play gentle atmosphere');
  const other=await context.newPage();await other.goto(url);await other.locator('[data-life-open="continue"]').first().click();await other.locator('#honeybrookLife [data-life="tab"][data-id="family"]').click();await other.locator('[data-life="role"][data-id="Owner"]').click();await other.waitForFunction(()=>document.querySelector('#honeybrookLife').dataset.busy!=='true');
  const newer=await snapshot();await tab('family');await button('role','Cook').click();await snapshot();assert.match(await root.locator('#lifeMessage').textContent(),/another tab|newer save/);assert.equal((await snapshot()).revision,newer.revision);
  assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);await context.close();console.log(`PASS ${width}px: every new location/image, decisions and partial reload, rewards and daily caps, business service/accounts, real rest, unread mail, supply-gated camping, search, backup preview/invalid restore/checkpoint/restore, original save preservation, sound controls, cross-tab conflict protection, no API uploads or runtime errors.`);
 }
 // A corrupt life save must remain recoverable without changing any original game keys.
 const c=await browser.newContext(),p=await c.newPage();await p.goto(url);await p.evaluate(k=>{localStorage.setItem(k,'broken');localStorage.setItem('honeybrook_test_original_v1','{"kept":true}');},key);await p.reload();await p.locator('[data-life-open="continue"]').first().click();assert.equal(await p.evaluate(k=>localStorage.getItem(k),key),'broken');assert.match(await p.locator('#lifeMessage').textContent(),/not been overwritten/);await c.close();console.log('PASS corrupt life save is preserved and recovery controls remain available.');
}finally{await browser.close();}
