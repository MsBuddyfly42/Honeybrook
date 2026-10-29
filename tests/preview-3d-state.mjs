import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fresh,valid,advance,KEY,CHECKPOINT} from '../preview-3d/state.js';
const s=fresh();assert.ok(valid(s));assert.equal(advance(s,'harvest'),false);assert.equal(s.stage,0);
for(const [action,stage,inventory] of [['accept',1,[]],['basket',2,['basket']],['harvest',3,['basket','vegetables']],['deliver',4,[]],['inspect',5,[]]]){assert.ok(advance(s,action));assert.equal(s.stage,stage);assert.deepEqual(s.inventory,inventory);assert.ok(valid(s));assert.ok(valid(JSON.parse(JSON.stringify(s))));assert.equal(advance(s,action),false);}
assert.equal(s.memories.length,1);assert.equal(advance(s,'inspect'),false);assert.equal(s.memories.length,1);
for(const patch of [{stage:-1},{stage:6},{inventory:['vegetables']},{inventory:['basket','basket']},{revision:-1},{revision:Infinity},{position:{x:NaN,z:0,yaw:0}},{vehicle:{x:999,z:0,yaw:0}},{weather:'tornado'},{light:'bad'},{volume:1},{memories:['x'.repeat(300)]}])assert.equal(valid({...fresh(),...patch}),false,JSON.stringify(patch));
const source=fs.readFileSync(new URL('../preview-3d/world.js',import.meta.url),'utf8');
assert.deepEqual([...source.matchAll(/localStorage\.setItem\(([^,]+)/g)].map(m=>m[1]).sort(),['CHECKPOINT','CHECKPOINT','KEY','KEY'].sort());
assert.ok(KEY.includes('3d_preview'));assert.ok(CHECKPOINT.includes('3d_preview'));
assert.ok(!source.includes('localStorage.clear'));assert.ok(source.includes('escapeHTML(m)'));
for(const path of ['index.html','world.css','world.js','state.js','vendor/three.module.min.js','vendor/BufferGeometryUtils.js','vendor/THREE-LICENSE.txt','fonts/nunito.ttf','fonts/NUNITO-OFL.txt'])assert.ok(fs.statSync(new URL('../preview-3d/'+path,import.meta.url)).size>0);
console.log('PASS: ordered physical delivery steps, duplicate prevention, inventory transitions, JSON round trips, malformed-state rejection, separate save writes, escaped imported journal text, and bundled assets.');
