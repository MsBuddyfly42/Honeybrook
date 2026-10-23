"""Build the runtime story index without summarizing or changing the manuscript."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
m=json.loads((root/'story/manuscript.json').read_text());cast=json.loads((root/'story/cast.json').read_text());rows=[line.split('|')for line in(root/'story/scene-plan.tsv').read_text().splitlines()if line.strip()]
assert len(rows)==71
section_start=m['paragraphs'].index('Prologue')
for n,(s,row)in enumerate(zip(m['sections'],rows)):
 key,place,people,visual,kind,props,prompt,answer,wrong=row
 assert key.strip()==('prologue'if n==0 else 'epilogue'if n==70 else str(n))
 s.update(place=place,cast=people.split(','),visual=visual,activity={'kind':kind,'props':props.split(';'),'prompt':prompt,'answer':answer.split(';')if kind in ['pack','sequence','sort','layout']else answer,'wrong':wrong.split(';')},photo={'src':'assets/story-scenes/book-'+str(n//4+1).zfill(2)+'.webp','tile':n%4})
 before=m['paragraphs'][section_start:m['paragraphs'].index(s['label'],section_start)]
 parts=[p for p in before if p.startswith('Part ')]
 s['part']='Prologue'if n==0 else 'Epilogue'if n==70 else parts[-1]
for p in cast:
 assert all(isinstance(n,int)and 1<=n<=69 for n in p['chapters'])
for s in m['sections']:assert all(any(c['id']==id for c in cast)for id in s['cast'])
m['cast']=cast
m['locations']={s['place']:[t['id']for t in m['sections']if t['place']==s['place']]for s in m['sections']}
(root/'story-data.js').write_text("/* Author's complete manuscript and traceable scene index. No storage side effects. */\n(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f();else r.HoneybrookStory=f();})(typeof globalThis!=='undefined'?globalThis:this,function(){return "+json.dumps(m,ensure_ascii=False,separators=(',',':'))+";});\n")
plan=[]
views=m['sections']+[{'id':'cover','place':'Honeybrook','visual':'Photographic Honeybrook valley in warm morning light, repaired wooden bridge at town entrance, distant ancient stone arch upstream, welcome-house bench, timber Hearthwell family home, small bakery and school, woodland bear neighbors and one adult HUMAN Carmen, distinct human Goldilocks represented only by bronze monument WITH three bears in square, no elves or castles','cast':[]}]
for n in range(18):plan.append({'id':'book-'+str(n+1).zfill(2),'views':views[n*4:n*4+4]})
plan+=json.loads((root/'story/additional-scene-plan.json').read_text())if(root/'story/additional-scene-plan.json').exists()else []
(root/'story/image-plan.json').write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n')
print(len(m['sections']),'complete sections;',len(cast),'source-grounded character entries;',len(m['locations']),'story places')
