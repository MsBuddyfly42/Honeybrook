/* Every game page shares the browser's existing tab history, without a game-imposed cap. */
(()=>{'use strict';if(window.HoneybrookBack)return;
function back(){if(history.length>1)history.back();else{let note=document.getElementById('honeybrook-back-status');if(!note){note=document.createElement('p');note.id='honeybrook-back-status';note.setAttribute('role','status');document.querySelector('[data-honeybrook-back]')?.after(note);}note.textContent='This is the first page visited in this tab.';}}
window.HoneybrookBack={back};
function mount(){if(document.querySelector('[data-honeybrook-back]'))return;const button=document.createElement('button');button.type='button';button.dataset.honeybrookBack='';button.textContent='← Back';button.title='Go back one page. Press again to keep going back.';button.style.cssText='font:inherit;min-height:44px;padding:8px 16px;margin:6px;border:1px solid #ac986e;border-radius:8px;background:#fff7e1;color:#304a34;cursor:pointer;flex-shrink:0';const host=document.querySelector('header nav,header,[role=navigation],nav');if(host)host.prepend(button);else{const bar=document.createElement('nav');bar.setAttribute('aria-label','Page history');bar.append(button);document.body.prepend(bar);}}
document.addEventListener('click',e=>{const control=e.target.closest('button,a');if(control&&(control.matches('[data-honeybrook-back],[data-city-back],[data-visit-back]'))){e.preventDefault();e.stopImmediatePropagation();back();}},true);
// pushState does not redraw a screen on Back/Forward. Restore that screen explicitly.
function restore(){if(!document.getElementById('honeybrookHome'))return;const hash=location.hash;if(hash.startsWith('#visit='))return;
if(hash.startsWith('#citymap')){window.HoneybrookCity?.show(undefined,{restore:true});return;}
const district=hash.match(/^#district=(\w+)$/);if(district){window.HoneybrookRoutes?.travel(district[1],{restore:true});return;}
if(hash==='#walk'){window.HoneybrookNavigation?.walk();return;}
if(!hash){window.HoneybrookDestination?.close();window.HoneybrookNavigation?.leave();document.getElementById('honeybrookHome').scrollIntoView({block:'start',behavior:'instant'});}}
addEventListener('popstate',restore);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
