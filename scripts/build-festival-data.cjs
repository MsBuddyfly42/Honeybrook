/* Build the static Fair catalog from its reviewed source. */
const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..'),D=require('../festival-data.json');
const ids=new Set();if(D.areas.length!==7||D.programs.length!==47)throw Error('Expected seven areas and 47 Fair programs.');
for(const p of D.programs){if(ids.has(p.id)||!D.areas.some(a=>a.id===p.area)||p.tools.length!==3||p.steps.length!==4||!['pattern','cue','order','recipe','judge','aim'].includes(p.kind))throw Error('Invalid program '+p.id);ids.add(p.id);}
fs.writeFileSync(path.join(root,'festival-data.js'),'/* Purpose-specific optional Fair programs. Original manuscript remains unchanged. */\n(function(r){const data='+JSON.stringify(D)+';if(typeof module===\'object\'&&module.exports)module.exports=data;else r.HoneybrookFestivalData=data;})(globalThis);\n');console.log('47 reviewed Fair programs across seven areas.');
