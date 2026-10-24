"use client";
import "./office-animals.css";
import {useEffect,useRef,useState} from "react";
import {officePets,petLedger,careForOfficePet,fedPetCount,parrotRemarks,type OfficePetId,type PetCareAction,type PracticeState} from "../lib/practice-engine";
import HandsOn,{petSteps} from "./office-hands";
type View=OfficePetId|"all"|null;
type Props={state:PracticeState;today:string;view:View;onView:(v:View)=>void;onChange:(s:PracticeState)=>void;onGo:(room:string)=>void;sound:boolean;onSound:()=>void;saveStatus:string;saveError:string;onSave:()=>void};
export function AnimalRoomPoints({state,today,onOpen}:{state:PracticeState;today:string;onOpen:(id:OfficePetId)=>void}){
 const ledger=petLedger(state.pets);
 return <>{officePets.filter(p=>p.room===state.room).map(p=><button key={p.id} className={"po-animal-point "+(ledger[p.id].fedOn===today?"cared":"waiting")} style={{left:Math.max(18,Math.min(82,p.x))+"%",top:p.y+"%"}} onClick={()=>onOpen(p.id)}><span>{ledger[p.id].fedOn===today?"✓":"•"}</span> {ledger[p.id].name}</button>)}</>;
}
export default function OfficeAnimals({state,today,view,onView,onChange,onGo,sound,onSound,saveStatus,saveError,onSave}:Props){
 const [action,setAction]=useState<PetCareAction|null>(null),[step,setStep]=useState(0),[message,setMessage]=useState(""),[name,setName]=useState(""),[door,setDoor]=useState(false),[quiet,setQuiet]=useState(false),[remark,setRemark]=useState("");
 const remarkIndex=useRef(0),dialog=useRef<HTMLElement|null>(null);
 const ledger=petLedger(state.pets),pet=officePets.find(p=>p.id===view),care=pet?ledger[pet.id]:null,fed=fedPetCount(state.pets,today);
 function chatter(){
  const line=parrotRemarks[remarkIndex.current++%parrotRemarks.length];setRemark(line);
  if(sound&&"speechSynthesis" in window){speechSynthesis.cancel();const voice=new SpeechSynthesisUtterance(line);voice.pitch=1.7;voice.rate=1.12;voice.volume=.6;speechSynthesis.speak(voice);}
 }
 useEffect(()=>{
  if(state.room!=="break"||quiet)return;
  chatter();const timer=setInterval(()=>chatter(),45000);
  return()=>{clearInterval(timer);if("speechSynthesis" in window)speechSynthesis.cancel();};
 },[state.room,quiet,sound]);
 useEffect(()=>{
  setAction(null);setStep(0);setMessage("");setDoor(false);setName(pet?ledger[pet.id].name:"");
 },[view]);
 useEffect(()=>{
  if(!view)return;
  const oldFocus=document.activeElement as HTMLElement|null;
  const first=dialog.current?.querySelector<HTMLElement>("button");first?.focus();
  const trap=(e:KeyboardEvent)=>{
   if(e.key==="Escape"){onView(null);return;}
   if(e.key!=="Tab")return;
   const items=Array.from(dialog.current?.querySelectorAll<HTMLElement>("button:not(:disabled),input:not(:disabled),select:not(:disabled),summary")||[]);
   if(e.shiftKey&&document.activeElement===items[0]){e.preventDefault();items[items.length-1]?.focus();}
   else if(!e.shiftKey&&document.activeElement===items[items.length-1]){e.preventDefault();items[0]?.focus();}
  };
  document.addEventListener("keydown",trap);return()=>{document.removeEventListener("keydown",trap);oldFocus?.focus();setDoor(false);};
 },[view]);
 function choose(a:PetCareAction){
  if(!pet||!care)return;
  if(pet.id==="guinea"&&!door){setMessage("Unlock your private pet nook first. The closed door keeps the cat outside.");return;}
  setAction(a);setStep(0);setMessage("");
  if(a==="feed"&&care.fedOn===today){setStep(3);setMessage(care.name+" has already had today’s portion. A little company is always welcome.");}
  if(a==="water"&&care.waterOn===today){setStep(3);setMessage("Today’s "+(pet.id==="fish"?"tank check":"fresh water")+" is already recorded.");}
 }
 function finish(){
  if(!pet||!action)return;
  onChange({...state,pets:careForOfficePet(state.pets,pet.id,action,today)});setStep(3);
  setMessage(action==="feed"?care!.name+" has been fed for today. Your care record will save automatically.":action==="water"?(pet.id==="fish"?"Filter and water level checked. The aquarium looks peaceful.":"Fresh water is ready. Your care record will save automatically."):pet.reaction.replace(pet.name,care!.name));
  if(pet.id==="parrot")chatter();
 }
 function rename(){
  if(!pet||!care)return;const value=name.trim();
  if(!value||value.length>40){setMessage("Choose a name between 1 and 40 characters.");return;}
  onChange({...state,pets:{...ledger,[pet.id]:{...care,name:value}}});setMessage("Name saved.");
 }
 const roomBubble=state.room==="break"&&!view&&remark;
 return <>
  {roomBubble&&<aside className="po-parrot-bubble" aria-live="polite"><b>{ledger.parrot.name} says…</b><p>“{remark}”</p><button onClick={()=>chatter()}>Another remark</button><button onClick={()=>setQuiet(true)}>Quiet for now</button></aside>}
  {view&&<div className="po-animal-backdrop"><section className="po-animal-dialog" role="dialog" aria-modal="true" aria-label={view==="all"?"Your animal friends":"Care for "+care?.name} ref={dialog}>
   <header><div><small>{view==="all"?"A LITTLE COMPANY MAKES A HOUSE A HOME":pet?.place}</small><h2>{view==="all"?"Your six animal friends":care?.name}</h2><span className="po-pet-save-status" aria-live="polite">{saveStatus}</span></div><button onClick={()=>onView(null)}>Return to the house ×</button>{saveError&&<div className="po-pet-save-error" role="alert">{saveError}<button onClick={onSave}>Retry save</button></div>}</header>
   {view==="all"?<>
    <p className="po-animal-intro">A little breakfast before your working day. <b>{fed} of 6 friends fed today.</b> Feeding follows the real day in Central time; refreshing or starting another shift will not ask you to feed them twice.</p>
    <div className="po-animal-grid">{officePets.map(p=><article key={p.id}><button className="po-animal-card-photo" style={{backgroundImage:"url('"+p.photo+"')",backgroundPosition:p.x+"% "+p.y+"%"}} aria-label={"Visit "+ledger[p.id].name} onClick={()=>{onGo(p.room);onView(p.id);}}/><div><h3>{ledger[p.id].name}</h3><span>{p.kind} · {p.place}</span><p>{ledger[p.id].fedOn===today?"✓ Today’s meal served":"Breakfast is waiting"} · {ledger[p.id].waterOn===today?"Water checked":"Water to freshen"}</p><button onClick={()=>{onGo(p.room);onView(p.id);}}>Visit & care →</button></div></article>)}</div>
    <footer><span>Your friends stay safe and cared for while you are away.</span><button className="po-primary" onClick={()=>{onGo("studio");onView(null);}}>{fed===6?"Everyone’s fed. Back to my desk →":"Back to the house"}</button></footer>
   </>:pet&&care&&<>
    <div className={"po-animal-photo "+(step===3?"settled":"")} style={{backgroundImage:"url('"+pet.photo+"')"}} role="region" aria-label={pet.place}>

     {step===3&&<span className="po-care-stamp">✓ {action==="feed"?"Meal served":action==="water"?"Water checked":"A little company"}</span>}
    </div>
    <div className="po-animal-body">
     <div className="po-pet-day"><span>{care.fedOn===today?"✓ Fed today":"Meal waiting"}</span><span>{care.waterOn===today?"✓ Water checked":"Water waiting"}</span><span>{care.playedOn===today?"✓ Time together":"A little attention"}</span></div>
     {pet.id==="guinea"&&<div className="po-safe-nook"><b>{door?"Your private pet nook is open for care.":care.name+"’s pet nook is closed and latched."}</b><p>The cat stays on the office side of the closed partition. The nook latches again when you leave.</p><button onClick={()=>{setDoor(!door);setAction(null);setStep(0);setMessage("");}}>{door?"Close & latch the nook":"Unlock my pet nook"}</button></div>}
     <div className="po-care-tabs"><button onClick={()=>choose("feed")}>Feeding time</button><button onClick={()=>choose("water")}>{pet.id==="fish"?"Check the aquarium":"Fresh water"}</button><button onClick={()=>choose("play")}>{pet.id==="parrot"?"Talk to "+care.name:"A little company"}</button></div>
     {action&&step<3&&<HandsOn key={pet.id+action} title={action==="feed"?"Prepare & serve "+care.name+"’s breakfast":action==="water"?"Fresh water for "+care.name:"Spend time with "+care.name} steps={petSteps(pet.id,action,care.name,pet.food)} photo={pet.photo} onComplete={finish}/>}
     {message&&<div className="po-care-message" role="status">{message}</div>}
     {pet.id==="parrot"&&<div className="po-parrot-corner"><b>“{remark||"I’m not annoying. I’m management!"}”</b><div><button onClick={()=>chatter()}>Hear another remark</button><button onClick={()=>setQuiet(!quiet)}>{quiet?"Let him chatter":"Quiet for now"}</button><button onClick={onSound}>{sound?"Animal sounds on ♪":"Turn animal sounds on"}</button></div></div>}
     <details className="po-pet-name"><summary>Give your {pet.kind.toLowerCase()} a name</summary><label>Name<input value={name} maxLength={40} onChange={e=>setName(e.target.value)}/></label><button onClick={rename}>Save name</button></details>
     <button className="po-pet-directory-link" onClick={()=>onView("all")}>← Visit my other animal friends</button>
    </div>
   </>}
  </section></div>}
 </>;
}

