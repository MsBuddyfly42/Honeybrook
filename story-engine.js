/* Chapter practice and memories; independent of every existing Honeybrook account. */
(function(root,f){if(typeof module==='object'&&module.exports)module.exports=f(require('./story-data.js'));else root.HoneybrookStoryEngine=f(root.HoneybrookStory);})(typeof globalThis!=='undefined'?globalThis:this,function(D){'use strict';
const ids=new Set(D.sections.map(s=>s.id)),lookup=Object.fromEntries(D.sections.map(s=>[s.id,s])),plain=x=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype;
function initial(){return{version:1,revision:0,updatedAt:0,current:'prologue',inspected:{},answers:{},solved:[],completed:[],read:[],bookmarks:[],notes:{},history:[]};}
const list=(a,max=71)=>Array.isArray(a)&&a.length<=max&&new Set(a).size===a.length&&a.every(x=>ids.has(x));
function valid(s){if(!plain(s)||s.version!==1||!Number.isSafeInteger(s.revision)||s.revision<0||!Number.isFinite(s.updatedAt)||s.updatedAt<0||!ids.has(s.current)||!['solved','completed','read','bookmarks'].every(k=>list(s[k]))||!['inspected','answers','notes'].every(k=>plain(s[k])&&Object.keys(s[k]).every(id=>ids.has(id))))return false;
 if(!Object.values(s.inspected).every(a=>Array.isArray(a)&&a.length<=3&&new Set(a).size===a.length&&a.every(n=>Number.isInteger(n)&&n>=0&&n<3)))return false;
 if(!Object.values(s.answers).every(a=>Array.isArray(a)&&a.length<=6&&a.every(t=>typeof t==='string'&&t.length<=300)))return false;
 if(!Object.values(s.notes).every(t=>typeof t==='string'&&t.length<=2000)||!Array.isArray(s.history)||s.history.length>500||!s.history.every(h=>plain(h)&&ids.has(h.chapter)&&typeof h.text==='string'&&h.text.length<600&&Number.isFinite(h.at)))return false;
 return s.solved.every(id=>s.inspected[id]?.length===3)&&s.completed.every(id=>s.solved.includes(id));}
function check(section,answers){const a=section.activity;if(!Array.isArray(answers))return false;if(['inspect','numbers'].includes(a.kind))return answers.length===1&&answers[0].trim()===a.answer;if(a.kind==='pack')return answers.length===a.answer.length&&new Set(answers).size===answers.length&&a.answer.every(t=>answers.includes(t));return answers.length===a.answer.length&&a.answer.every((t,i)=>answers[i]===t);}
function run(source,action){if(!valid(source))throw Error('This story save needs recovery; it was not changed.');const s=JSON.parse(JSON.stringify(source)),id=action.chapter||s.current,section=lookup[id];if(!ids.has(id)||!section)throw Error('Unknown chapter.');let message='Saved.';s.current=id;
 switch(action.type){case'visit':break;
 case'inspect':if(!Number.isInteger(action.index)||action.index<0||action.index>2)throw Error('Choose one of the three scene details.');s.inspected[id]=[...new Set([...(s.inspected[id]||[]),action.index])];message=section.activity.props[action.index]+' observed. The original passage is available below.';break;
 case'answer':if(!Array.isArray(action.values)||action.values.length>6||action.values.some(t=>typeof t!=='string'||t.length>300))throw Error('Choose the scene materials.');s.answers[id]=action.values;break;
 case'check':if(s.inspected[id]?.length!==3)throw Error('Observe all three scene details first.');if(!check(section,s.answers[id]||[]))throw Error('Check the manuscript and try again. Your place and materials are kept; nothing is lost.');s.solved=[...new Set([...s.solved,id])];message='Your arrangement fits this chapter. The result is ready to keep.';break;
 case'finish':if(!s.solved.includes(id))throw Error('Complete and inspect this chapter’s practice first.');if(!s.completed.includes(id)){s.completed.push(id);s.history.push({chapter:id,at:Date.now(),text:section.label+' · '+section.title+': '+section.activity.prompt+'. Kept a scene memory; welcome was never conditional on this work.'});}message='Scene memory kept. Continue, revisit, or enjoy the town at your own pace.';break;
 case'read':s.read=[...new Set([...s.read,id])];message='Reading place kept. The whole manuscript stays available.';break;
 case'bookmark':s.bookmarks=s.bookmarks.includes(id)?s.bookmarks.filter(k=>k!==id):[...s.bookmarks,id];break;
 case'note':if(typeof action.text!=='string'||action.text.length>2000)throw Error('Notes may contain up to 2,000 characters.');s.notes[id]=action.text;message='Your note is saved separately from the author’s words.';break;
 default:throw Error('Unknown story action.');}
 if(!valid(s))throw Error('The change did not pass its save check.');return{state:s,message};}
return{initial,valid,check,run,lookup};});
