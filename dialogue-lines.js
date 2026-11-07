/* Split authored captions without changing their words or guessing unknown identities. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HoneybrookDialogueLines=api;})(globalThis,()=>{
 const escape=s=>String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const verbs='said|asked|whispered|replied|called|told|cried|added|murmured|answered|continued|shouted';
 function attribution(text,cast){let found=null;for(const p of cast){if(p.id==='narrator'||p.speechEnabled===false)continue;for(const alias of new Set([p.name,...(p.aliases||[])])){if(!alias||alias.length<3||alias.includes('story-')||alias.includes('game-'))continue;const name=escape(alias),re=new RegExp('(?:^|\\b)(?:'+name+')\\s+(?:'+verbs+')\\b|\\b(?:'+verbs+')\\s+(?:'+name+')(?:\\b|$)','i'),match=re.exec(text);if(match&&(!found||match.index<found.index))found={id:p.id,index:match.index};}}return found?.id||'';}
 function turns(text,fallback,cast=[]){text=String(text||'');const matches=[...text.matchAll(/“([^”]+)”|"([^"\n]+)"/g)];if(!matches.length)return [{text,speaker:fallback}];const out=[];let offset=0;
 for(let i=0;i<matches.length;i++){const match=matches[i],before=text.slice(offset,match.index),after=text.slice(match.index+match[0].length,matches[i+1]?.index??text.length);let speaker=attribution(after,cast)||attribution(before,cast)||fallback;
  // A remembered Goldilocks scene keeps the age selected by its chapter.
  if(speaker==='story-gold'&&/^gold-/.test(fallback))speaker=fallback;
  if(speaker==='story-baby'&&fallback==='baby-adult')speaker=fallback;
  if(before.trim())out.push({text:before.trim(),speaker:'narrator'});out.push({text:match[1]||match[2],speaker});offset=match.index+match[0].length;
 }
 if(text.slice(offset).trim())out.push({text:text.slice(offset).trim(),speaker:'narrator'});return out;
 }
 return {turns,attribution};
});
