import type {Fields} from "./practice-engine";
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]!));
export function promoSVG(values:Fields){
 const wrap=(s:string,width:number)=>{
  const rows:string[]=[];let row="";
  for(const word of s.trim().split(/\s+/)){if((row+" "+word).trim().length>width&&row){rows.push(row);row=word;}else row=(row+" "+word).trim();}
  if(row)rows.push(row);return rows;
 };
 const title=wrap(values.headline||"Harbor Reading Day",26).slice(0,3),details=wrap(values.details||"Your event invitation will appear here.",49).slice(0,14);
 return '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1100" viewBox="0 0 800 1100"><rect width="800" height="1100" fill="#fff2d9"/><rect x="35" y="35" width="730" height="1030" rx="4" fill="none" stroke="#9b784c" stroke-width="2"/><text x="400" y="125" text-anchor="middle" font-family="Georgia,serif" font-size="18" fill="#795639">YOU ARE WARMLY INVITED</text>'+title.map((t,i)=>'<text x="400" y="'+(220+i*62)+'" text-anchor="middle" font-family="Georgia,serif" font-size="48" fill="#553a27">'+escape(t)+'</text>').join("")+'<line x1="140" y1="405" x2="660" y2="405" stroke="#bb9b68"/>'+details.map((t,i)=>'<text x="400" y="'+(475+i*30)+'" text-anchor="middle" font-family="Georgia,serif" font-size="23" fill="#61462f">'+escape(t)+'</text>').join("")+'<text x="400" y="990" text-anchor="middle" font-family="Georgia,serif" font-size="16" fill="#8a704c">Honeybrook Office · PRACTICE DESIGN</text></svg>';
}
