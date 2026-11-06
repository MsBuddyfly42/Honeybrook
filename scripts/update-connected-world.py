"""Apply the authorised connected-world prose without removing earlier paragraphs."""
import json, pathlib, copy
from docx import Document
from docx.oxml import OxmlElement
from docx.text.paragraph import Paragraph
ROOT = pathlib.Path(__file__).resolve().parents[1]
source = ROOT / 'story/revised-manuscript.json'
book = json.loads(source.read_text())
before = copy.deepcopy(book)
additions = {
 'r-31': [(1, [
  "Her golden curls reached her shoulders, catching on the collar of the plum coat she had brought in from the cold. A camera rested against her cream blouse; her notebook fitted into the worn brown satchel at her side. Her grandfather knew that face before she arranged it into a reassuring smile."
 ])],
 'r-34': [(36, [
  "The creek road brought them into the Bear Hollow Nell had already visited. The old square, porridge kitchen, honey house, garden and cottages were still there. New cottage doors continued along the existing paths; they had not made another town beyond the one she knew.",
  "Amelia showed her where the elders' cottage path joined the lane. Twenty older neighbours had made room for regular visitors, and Harold had his familiar visiting chair among them. A caller could go from the square to a cottage, leave by its front door, and return to the same square. The footbridge still led home towards Honeybrook.",
  "Nell did not hurry from one name to the next. She noticed the quilt folded over a chair, waited while a cup was moved within reach, and asked before opening her notebook. What she would remember was a bear in a particular home, telling a particular part of Abigail's life."
 ])],
 'r-36': [(8, [
  "Doing the work changed what was in front of her. At the kitchen table she measured flour into the bowl, poured the milk, and felt the mixture thicken under the spoon. When the dough was ready, she shaped the biscuits on the tray. The baker checked the hot oven; Nell counted the portions that came back out.",
  "In the garden she pressed each seedling into its own space and watered the soil around it. At the honey house, inspected honey rose inside a clean jar before she fitted its lid. A label belonged on a sealed jar that somebody could use, not on a promise that the honey had been bottled.",
  "At a workbench she compared prepared wooden pieces, fitted them in order, and checked the joint with Tom. At another table a stitch pulled two edges of cloth together. She could turn the piece over and see where the thread had missed. The guide stayed beside her hands so that she could try the difficult part again.",
  "Reception work had its own visible results: a guest's answer entered into the right place, a room allocation checked against the occupied beds, and the closed register returned to the desk. Practice pages and private guest records remained separate. When she counted supplies, the next worker could compare the shelf with the written total.",
  "Nell kept sketches and agreed photographs of these ordinary actions beside her notes. A picture of a kitchen could help her find the door; the next picture needed to show the bowl, the measured ingredients and the hands doing the work. She wanted a learner to recognise what they were being asked to attempt."
 ])],
 'r-39': [(8, [
  "Their route brought them first to Northern Edge. The ranger's boundary and inspected public approach belonged to Honeybrook; the woodland entrance stood beyond them. Nell wrote both names on her route page. Northern Edge was the place to prepare and meet the others before entering the Northern Woods.",
  "They checked the way back as carefully as the way forward. The same woodland entrance would bring them out at Northern Edge, where Harold would know to expect them. Beyond the trees, Storybook Lane would have its own gate. None of those paths needed to become another Bear Hollow."
 ])],
 'r-44': [(44, [
  "On a later visit, Nell followed Ash's sketch from his bakery to the split oak. She stopped at a trail marker, compared the bend in the roots with his drawing, and went closer. The book was partly hidden by leaves. She worked a soft brush from the edge of its cover until its whole outline could be seen.",
  "At the stream bend, another path led towards the moss arch; a quieter turn reached the fern hollow. They left the stream clear and kept away from unstable stone. The remembering clearing offered room to compare their notes, and the storytelling circle gave the recovered pages a place to be heard. From the rise they could look back towards the village before taking the marked way to the gate.",
  "Each walk brought them into the place they had chosen. A cottage door opened onto a host's room. A woodland turn led to another stretch of path, with its own ground underfoot and its own reason to stop. They could listen, inspect a keepsake, work over a waiting book, or turn back. Nell did not mark a place explored merely because she had read its name.",
  "After the telling, they returned through Northern Edge to Honeybrook and took the creek road into the familiar Hollow. The new elders' cottages were still part of that same neighbourhood. A story heard in one of those rooms could now travel with them into the woods and home again, keeping its teller's name."
 ])]
}
doc_path = ROOT / 'story/Honeybrook_Expanded_Manuscript.docx'
doc = Document(doc_path)
insertions=[]
for id, groups in additions.items():
 section=next(s for s in book['sections'] if s['id']==id)
 original=list(section['paragraphs'])
 for index, paragraphs in sorted(groups,reverse=True):
  anchor=original[index]
  if paragraphs[0] in section['paragraphs']: continue
  at=section['paragraphs'].index(anchor)+1
  section['paragraphs'][at:at]=paragraphs
  matches=[p for p in doc.paragraphs if p.text==anchor]
  if len(matches)!=1: raise ValueError('Ambiguous manuscript anchor '+id)
  previous=matches[0]
  for text in paragraphs:
   el=OxmlElement('w:p');previous._p.addnext(el);new=Paragraph(el,previous._parent)
   new.style=previous.style;new.add_run(text);previous=new
  insertions.extend(paragraphs)
# Preserve all previous paragraphs and chapter IDs in order, including the complete ending.
assert [s['id'] for s in book['sections']]==[s['id'] for s in before['sections']]
for old,new in zip(before['sections'],book['sections']):
 cursor=iter(new['paragraphs'])
 assert all(any(p==candidate for candidate in cursor) for p in old['paragraphs'])
assert book['sections'][-1]['paragraphs']==before['sections'][-1]['paragraphs']
book['edition']='Expanded Nell edition · Connected Bear Hollow and woodland paths · November 6 2026'
for p in doc.paragraphs:
 if p.text.startswith('Expanded manuscript review draft'):
  p.text='Expanded author edition\nNovember 6 2026'
source.write_text(json.dumps(book,ensure_ascii=False,indent=2)+'\n')
(ROOT/'revised-story-data.js').write_text('window.HoneybrookRevisedStory='+json.dumps(book,ensure_ascii=False)+';\n')
text=[book['title'],book['subtitle'],book['author'],'']
for s in book['sections']:
 text.extend([s.get('label',''),s['title'],'',*s['paragraphs'],''])
(ROOT/'story/revised-manuscript.txt').write_text('\n'.join(text)+'\n')
doc.save(doc_path)
assert all(t in [p.text for p in Document(doc_path).paragraphs] for t in insertions)
print('Updated complete 50-section manuscript; added',len(insertions),'paragraphs; preserved all earlier prose and the exact epilogue.')
