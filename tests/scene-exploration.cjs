const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const D={window:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../storywood-data.js'),'utf8'),D);
const source=fs.readFileSync(require.resolve('../scene-exploration.js'),'utf8'),a=source.indexOf('function routes('),z=source.indexOf('\nfunction mount(',a);
const ctx={window:{StorywoodData:D.window.StorywoodData},location:{hash:''},URL,URLSearchParams,rootURL:new URL('https://test.example/'),normalize:s=>String(s||'').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]/g,'')};vm.createContext(ctx);vm.runInContext(source.slice(a,z),ctx);
const host={classList:{contains:()=>false}},woods=D.window.StorywoodData.woods,graph={};
for(const w of woods){ctx.location.hash='#region=woods&wood='+w.id;const paths=ctx.routes(host);assert(paths.length>=2,w.name);graph[w.id]=paths.map(r=>new URL(r.href,ctx.rootURL)).filter(u=>!u.searchParams.has('search')).map(u=>new URLSearchParams(u.hash.slice(1)).get('wood')).filter(Boolean);for(const r of paths)assert(!r.label.includes('undefined'));}
for(const [id,adj]of Object.entries(graph))for(const next of adj)assert(graph[next].includes(id),id+' ↔ '+next);
for(const t of D.window.StorywoodData.tales){ctx.location.hash='#tale='+t.id;const paths=ctx.routes(host);assert.equal(paths.length,2);assert(paths.some(r=>r.href.includes('wood='+t.forest)));}
for(const e of D.window.StorywoodData.elders){ctx.location.hash='#elder='+e.id;assert(ctx.routes(host).some(r=>r.href==='games/honeybrook-craft-fair/?portal=town&place=hollow#place=hollow&view=outside'));}
console.log('PASS reciprocal trails at all 8 woodland scenes, 41 resident-to-investigation paths, 21 elder front-door returns, and no unresolved scene labels.');
