const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const d=JSON.parse(fs.readFileSync('story/revised-manuscript.json')),s=Object.fromEntries(d.sections.map(x=>[x.id,x]));
assert(s['r-39'].paragraphs.includes('"Abigail?"'),'Keep initial private encounter');
for(const id of ['r-44','r-45','r-46','r-47']){
 const text=s[id].paragraphs.join('\n');
 assert(!/Goldilocks (joined|asked|listened|met|answered|looked|turned|was beside|stayed)|Goldilocks, sitting|Nell took her hand/.test(text),id+' repeats the spirit appearance');
}
assert(s['r-44'].paragraphs.some(p=>p.includes('Sammy brought a second lamp')));
assert(s['r-45'].paragraphs.some(p=>p.includes('I wish he knew you found her')));
assert(s['r-46'].paragraphs.some(p=>p.includes('Sammy was beside her')));
assert(s['r-48'].paragraphs.some(p=>p.includes('This time, no one had to let go.')));
const context={window:{}};vm.runInNewContext(fs.readFileSync('revised-story-data.js','utf8'),context);
assert.equal(JSON.stringify(context.window.HoneybrookRevisedStory),JSON.stringify(d));
console.log('PASS no repeated guardian appearances in Chapters 44–47; replacements, initial private encounter, finale and game/book parity.');
