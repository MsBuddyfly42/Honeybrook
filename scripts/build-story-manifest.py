"""Record the exact reviewed local imagery and source-to-scene coverage."""
from pathlib import Path
from PIL import Image
import hashlib, json
root=Path(__file__).resolve().parents[1]
assets=root/'assets/story-scenes'
manifest={}
for path in sorted(assets.glob('*.webp')):
    with Image.open(path) as im:
        im.load()
        width,height=im.size
    manifest[path.stem]={'src':str(path.relative_to(root)),'width':width,'height':height,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
assert len(manifest)==24
plan=json.loads((root/'story/image-plan.json').read_text())
for sheet in plan:
    manifest[sheet['id']]['views']=[{'tile':i,'id':v.get('id'),'place':v.get('place'),'cast':v.get('cast',[])} for i,v in enumerate(sheet['views'])]
(assets/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
m=json.loads((root/'story/manuscript.json').read_text())
rows=[line.split('|')for line in(root/'story/scene-plan.tsv').read_text().splitlines()if line.strip()]
coverage=[]
for n,(s,row)in enumerate(zip(m['sections'],rows)):
    sheet='book-'+str(n//4+1).zfill(2)
    coverage.append({'id':s['id'],'label':s['label'],'title':s['title'],'paragraphs':len(s['paragraphs']),'place':row[1],'cast':row[2].split(','),'activity':row[4],'photo':manifest[sheet]['src'],'tile':n%4,'photoSha256':manifest[sheet]['sha256']})
assert len(coverage)==71
(root/'story/scene-coverage.json').write_text(json.dumps({'sourceSha256':m['sha256'],'sections':coverage},ensure_ascii=False,indent=2)+'\n')
print('Decoded and hashed',len(manifest),'photographic sheets; mapped',len(coverage),'complete story sections.')
