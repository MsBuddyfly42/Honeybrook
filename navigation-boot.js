/* Set the saved route's layout before paint; let the browser restore its scroll. */
(()=>{'use strict';
const hash=location.hash;
if(/^#(citymap|find)(?:&|$)/.test(hash))document.documentElement.dataset.hbView='map';
else if(/^#district=\w+$/.test(hash))document.documentElement.dataset.hbView='district';
else if(hash.startsWith('#visit='))document.documentElement.dataset.hbView='room';
else if(/^#life=[a-z0-9-]+$/.test(hash))document.documentElement.dataset.hbView='life';
else if(hash==='#walk')document.documentElement.dataset.hbView='walk';
})();
