/* Owner-directed game adaptation. No original manuscript prose is replaced. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.HoneybrookNellResearch=factory();})(globalThis,()=>{'use strict';
const tasks=[
  {
    "id": "welcome",
    "name": "A welcome before a name",
    "place": "Welcome House",
    "route": "index.html#visit=Welcome%20House",
    "photo": "arrival",
    "intro": "The bears welcome a golden-haired stranger before knowing her family. They speak of Goldilocks with the affection usually reserved for someone from their own household. Nell decides to listen before asking Harold anything.",
    "steps": [
      {
        "question": "Listen to the welcome. What do the bears actually know?",
        "options": [
          "They already know Nell’s complete ancestry.",
          "They see a resemblance and feel Goldilocks’s spirit in her.",
          "They have already given Nell the missing letter."
        ],
        "answer": 1,
        "note": "A resemblance and a belief are clues to their affection, not proof of reincarnation or family identity."
      },
      {
        "question": "Choose Nell’s next research question.",
        "options": [
          "Why is Goldilocks remembered so deeply here?",
          "How much must Nell pay to be welcomed?",
          "Where is Nell’s royal coronation?"
        ],
        "answer": 0,
        "note": "Follow the community’s memory of Goldilocks. Nell’s welcome is freely given."
      },
      {
        "question": "Record what remains private.",
        "options": [
          "Harold has already heard everything.",
          "The family mystery is solved.",
          "Nell has not explained her ancestry or spoken to Harold."
        ],
        "answer": 2,
        "note": "Her grandfather’s promise and the dream are still hers to share. Next: the library’s woodland account."
      }
    ],
    "scenery": {
      "src": "assets/fair-scenes/bear-country/country-13.webp",
      "tile": 1
    }
  },
  {
    "id": "archive",
    "name": "Famous beyond human hearing",
    "place": "Honeybrook Library",
    "route": "index.html#visit=Honeybrook%20Library",
    "photo": "room",
    "intro": "Compare two accounts: the human family’s years of searching and the woodland community’s beloved Goldilocks. Every kind of animal in the deep woods knew about her. Her fame never reached the people looking from outside.",
    "steps": [
      {
        "question": "Sort the woodland account into the right audience.",
        "options": [
          "Deep-woodland animals who knew Goldilocks.",
          "Every human newspaper in the country.",
          "Nell’s grandfather, who already knew the answer."
        ],
        "answer": 0,
        "note": "Goldilocks was famous within the woods, deep inside them. Human searchers did not share that network."
      },
      {
        "question": "Compare fame with being found. What is missing?",
        "options": [
          "Proof the family did not care.",
          "A route by which woodland knowledge could reach the human family.",
          "A reason to erase the old searches."
        ],
        "answer": 1,
        "note": "Being loved and widely known in one community did not make her whereabouts known outside it."
      },
      {
        "question": "Choose the next source to examine.",
        "options": [
          "An invented royal decree.",
          "A claim that the family never searched.",
          "The family’s search notes and the point where fear stopped them."
        ],
        "answer": 2,
        "note": "Next: compare the search record at a safe creek-side stop. The depth of the woods matters."
      }
    ],
    "scenery": {
      "src": "assets/fair-scenes/bear-country/country-16.webp",
      "tile": 0
    }
  },
  {
    "id": "names",
    "name": "One girl, two kinds of record",
    "place": "Honeybrook Library",
    "route": "index.html#visit=Honeybrook%20Library",
    "photo": "room",
    "intro": "The library account says “Goldilocks.” The family account follows a missing beekeeper’s child. Nell has no recovered birth certificate linking the descriptions. Separate a nickname, a family relationship and a resemblance instead of merging them because the answer feels right.",
    "steps": [
      {
        "question": "Sort “Goldilocks” into the evidence it actually supplies.",
        "options": [
          "A woodland name people remember.",
          "A complete human genealogy.",
          "Proof that Nell is the same person."
        ],
        "answer": 0,
        "note": "A remembered name can be the start of a search without being a certified identity."
      },
      {
        "question": "What would connect the two accounts responsibly?",
        "options": [
          "Nell’s hair alone.",
          "Details about the beekeepers, the child and who personally knew her.",
          "How expensive the family estate is."
        ],
        "answer": 1,
        "note": "Look for shared events and personal testimony rather than wealth or resemblance."
      },
      {
        "type": "order",
        "question": "Arrange the research method before following a name.",
        "cards": [
          "Compare the shared details",
          "Find the two accounts",
          "Keep the unproven link marked as a question"
        ],
        "order": [
          1,
          0,
          2
        ],
        "note": "Nell keeps a possible connection on the board. She has not turned it into a fact."
      }
    ],
    "scenery": {
      "src": "assets/fair-scenes/bear-country/country-16.webp",
      "tile": 0
    }
  },
  {
    "id": "search",
    "name": "The search that stopped too soon",
    "place": "Old Bridge",
    "route": "index.html#visit=Old%20Bridge",
    "photo": "arrival",
    "intro": "At this safe crossing, lay out the family’s old search account. The family researched the woods thoroughly, returned over the years, and still never went deep enough. They feared bears and did not imagine them offering sanctuary.",
    "steps": [
      {
        "question": "Put the two search boundaries in order: human search area → ?",
        "options": [
          "Deep woodland settlements unknown to the family.",
          "A settlement the family had already visited.",
          "The end of all woodland life."
        ],
        "answer": 0,
        "note": "Their efforts were real. The search account must also acknowledge the deep places they never reached."
      },
      {
        "question": "Why did they stop short of the sanctuary?",
        "options": [
          "Goldilocks had told them to stop looking.",
          "They were naturally afraid of bears and never imagined bears as protectors of their kin.",
          "They knew the exact cottage address."
        ],
        "answer": 1,
        "note": "Fear hid a possibility from them: the bears might have saved and sheltered someone they loved."
      },
      {
        "question": "Label this conclusion honestly.",
        "options": [
          "If they had known, finding her was guaranteed.",
          "The family deliberately abandoned her.",
          "Had they known about Bear Hollow and Honeybrook, they might have found Goldilocks."
        ],
        "answer": 2,
        "note": "“Might have” preserves the heartbreak without inventing certainty or blaming the searchers. Next: follow the beekeeping thread."
      }
    ],
    "scenery": {
      "src": "assets/fair-scenes/bear-country/country-22.webp",
      "tile": 1
    }
  },
  {
    "id": "map",
    "name": "The empty space on the family map",
    "place": "Old Bridge",
    "route": "index.html#visit=Old%20Bridge",
    "photo": "room",
    "intro": "The human search account feels thorough until Nell lays it beside a map of the places she can actually enter. An unsearched depth is not an empty forest. Map the human boundary and the known bear settlements without inventing an exact flood route.",
    "steps": [
      {
        "question": "Which blank belongs on the human search map?",
        "options": [
          "No animals lived beyond this point.",
          "The family did not know what lay farther inside.",
          "The family had already visited Bear Hollow."
        ],
        "answer": 1,
        "note": "A gap in the searchers’ knowledge is not proof of a gap in the world."
      },
      {
        "question": "What does the safe crossing let Nell study?",
        "options": [
          "The guaranteed exact site of the tragedy.",
          "A route nobody else has ever seen.",
          "How paths and settlements extend beyond the search boundary."
        ],
        "answer": 2,
        "note": "Keep the old bridges distinct. This research stop does not relocate the river tragedy."
      },
      {
        "type": "order",
        "question": "Build the map overlay from the known to the unknown.",
        "cards": [
          "Bear Hollow and Honeybrook, now known to Nell",
          "The family’s documented search area",
          "The deeper woodland area they did not reach"
        ],
        "order": [
          1,
          2,
          0
        ],
        "note": "The map begins to explain how real searching could coexist with a missing answer."
      }
    ],
    "scenery": {
      "src": "assets/fair-scenes/bear-country/country-22.webp",
      "tile": 1
    }
  },
  {
    "id": "hearsay",
    "name": "The frightening story at the edge",
    "place": "Welcome House",
    "route": "index.html#visit=Welcome%20House",
    "photo": "room",
    "intro": "Nell returns with the map. Compare what the family feared with what she has personally experienced. She need not mock their fear to recognize that it hid the possibility of sanctuary.",
    "steps": [
      {
        "question": "Keep the searchers’ fear in the correct column.",
        "options": [
          "A belief that influenced their choices.",
          "Proof every bear was dangerous.",
          "Proof they did not love their relatives."
        ],
        "answer": 0,
        "note": "Nell can grieve the consequences of fear without condemning those who searched."
      },
      {
        "question": "Choose an observation Nell can support herself.",
        "options": [
          "Every woodland mystery is solved.",
          "She has been welcomed and offered a place to stay.",
          "Her human family already knew this town."
        ],
        "answer": 1,
        "note": "Present experience can challenge an assumption without proving the whole family history."
      },
      {
        "type": "order",
        "question": "Separate the two columns, then form the question.",
        "cards": [
          "Ask whether the bears could have offered sanctuary",
          "Record the family’s fear",
          "Record Nell’s own welcome"
        ],
        "order": [
          1,
          2,
          0
        ],
        "note": "The next question grows from evidence: what if the place they feared held the people they sought?"
      }
    ],
    "scenery": {
      "src": "assets/fair-scenes/bear-country/country-13.webp",
      "tile": 1
    }
  },
  {
    "id": "honey",
    "name": "The beekeeper’s thread",
    "place": "The Honey House",
    "route": "games/honeybrook-craft-fair/?portal=town&place=hollow-honey&city=1",
    "photo": "room",
    "intro": "Among honey jars and beekeeping tools, Nell explains that she is a private investigator and keeps bees in her spare time. She knows beekeeping thoroughly and belongs to a whole lineage of beekeepers. Almost everyone in the family loves bees. Her patient familiarity gives the bears another reason to see Goldilocks in her. Match the family trade to the missing-beekeeper account; do not treat resemblance as proof.",
    "steps": [
      {
        "question": "Match Nell’s knowledge to the family account.",
        "options": [
          "A new royal title.",
          "Beekeeping, honey and care for the hives.",
          "A letter she has not yet read."
        ],
        "answer": 1,
        "note": "The trade is a real family thread Nell can bring to the conversation."
      },
      {
        "question": "What does shared beekeeping establish?",
        "options": [
          "A meaningful lead to investigate, not the full answer.",
          "An automatic meeting with Harold.",
          "Proof that Nell and Goldilocks are the same person."
        ],
        "answer": 0,
        "note": "Their affection can be sincere while the family evidence still needs careful work."
      },
      {
        "question": "Choose the next place to understand the bears’ care.",
        "options": [
          "Leave the mystery behind.",
          "Invent a new human witness.",
          "Bear Hollow, where the animals remember Goldilocks."
        ],
        "answer": 2,
        "note": "Next: listen in Bear Hollow before assuming that the family’s fear described the bears who lived there."
      }
    ],
    "scenery": {
      "src": "assets/bear-country/workplaces-a.webp",
      "tile": 0
    }
  },
  {
    "id": "trade",
    "name": "A family trade is not a family tree",
    "place": "The Honey House",
    "route": "games/honeybrook-craft-fair/?portal=town&place=hollow-honey&city=1",
    "photo": "room",
    "intro": "The scent of honey feels familiar, but familiarity can mislead. Compare the tools of a shared trade, Nell’s known family branch and the parts she still cannot prove. Her expert knowledge is her part in a shared family lineage of beekeepers; almost everyone in that family loves bees. Her professional investigation still requires evidence.",
    "steps": [
      {
        "question": "Which detail belongs to Nell’s own account?",
        "options": [
          "She has already read Goldilocks’s letter.",
          "Beekeeping is the family business.",
          "All beekeepers are related."
        ],
        "answer": 1,
        "note": "Her experience is a useful thread, not a shortcut through the investigation."
      },
      {
        "question": "What must stay separate for now?",
        "options": [
          "Shared trade and a proven connection to the missing child.",
          "Honey and the care of bees.",
          "The notebook and its paper."
        ],
        "answer": 0,
        "note": "The missing personal account must connect details the trade alone cannot connect."
      },
      {
        "type": "order",
        "question": "Lay out the family branch Nell already knows.",
        "cards": [
          "Nell",
          "Goldilocks’s mother’s brother",
          "His child",
          "His grandson: Nell’s grandfather",
          "Nell’s parent"
        ],
        "order": [
          1,
          2,
          3,
          4,
          0
        ],
        "note": "This is the maternal-uncle branch. Do not replace it with a descent from Goldilocks’s brother."
      }
    ],
    "scenery": {
      "src": "assets/bear-country/workplaces-a.webp",
      "tile": 0
    }
  },
  {
    "id": "garden",
    "name": "The ordinary life behind a legend",
    "place": "Goldilocks’ Kitchen Garden",
    "route": "games/honeybrook-craft-fair/?portal=town&place=hollow-garden&city=1",
    "photo": "room",
    "intro": "Nell pauses at the garden. The old woodland accounts contain a person living ordinary days, while the family’s missing-person account stops at the disappearance. Consider the difference between being remembered as a legend and having had a life. Here, everyday tending gives Nell a quieter way to think about the person behind the legend.",
    "steps": [
      {
        "question": "Which question follows the missing-person account forward?",
        "options": [
          "What life might she have had after the day the family lost her?",
          "Why did she become a queen?",
          "Why did the family never care?"
        ],
        "answer": 0,
        "note": "Nell begins looking for the life beyond the disappearance rather than only its last known moment."
      },
      {
        "question": "What can this present garden tell Nell by itself?",
        "options": [
          "The exact contents of an unseen letter.",
          "The answer to every ancestral question.",
          "How the community values the ordinary work of tending and feeding."
        ],
        "answer": 2,
        "note": "A place can help Nell understand the community without being a preserved original artifact."
      },
      {
        "type": "order",
        "question": "Arrange the questions from loss toward a possible life.",
        "cards": [
          "Who remembered her as a person?",
          "What happened at the river?",
          "What might have happened afterward?"
        ],
        "order": [
          1,
          2,
          0
        ],
        "note": "There may be grief and a life beyond it. Nell still needs someone’s own account."
      }
    ],
    "scenery": {
      "src": "assets/bear-country/workplaces-b.webp",
      "tile": 0
    }
  },
  {
    "id": "hollow",
    "name": "What the family could not imagine",
    "place": "Bear Hollow",
    "route": "games/honeybrook-craft-fair/?portal=town&place=hollow&city=1",
    "photo": "arrival",
    "intro": "Nell listens to Bear Hollow’s oldest bears. They remember Goldilocks as someone cherished, not a stranger from a distant human tale. Other woodland animals knew her too. Nell begins to understand why her family’s searches and the animals’ memories never met.",
    "steps": [
      {
        "question": "Compare the human fear with the community you encounter.",
        "options": [
          "The bears are capable of hospitality and protection.",
          "Every bear must behave exactly as the family feared.",
          "The family already knew this community."
        ],
        "answer": 0,
        "note": "The sanctuary was a possibility the frightened searchers had never imagined."
      },
      {
        "question": "Whose knowledge stayed inside the deep woods?",
        "options": [
          "Only a human newspaper editor’s.",
          "The animals’ knowledge of Goldilocks and her place among them.",
          "Nell’s already-opened letter."
        ],
        "answer": 1,
        "note": "Goldilocks’s woodland fame could not answer relatives who did not know where or whom to ask."
      },
      {
        "question": "What is still needed before Nell tells her family what happened?",
        "options": [
          "A guess presented as a recovered document.",
          "A claim that nobody ever searched.",
          "A personal account entrusted to someone who can explain it."
        ],
        "answer": 2,
        "note": "Next: gather your questions at the monument. Harold may hold the personal thread that public remembrance cannot supply."
      }
    ],
    "scenery": {
      "src": "assets/bear-country/hollow-places.webp",
      "tile": 0
    }
  },
  {
    "id": "animals",
    "name": "A name passed through the woodland",
    "place": "Bear Hollow",
    "route": "games/honeybrook-craft-fair/?portal=town&place=hollow&city=1",
    "photo": "room",
    "intro": "Listen again, now with better questions. The animals knew Goldilocks, but a name shared along woodland paths did not reach relatives who never entered those paths. Build the missing communication chain.",
    "steps": [
      {
        "question": "Who knew about Goldilocks deep in the woods?",
        "options": [
          "Only Nell’s human family.",
          "The woodland animals.",
          "Nobody at all."
        ],
        "answer": 1,
        "note": "Goldilocks was known throughout woodland animal life, beyond just the bears."
      },
      {
        "question": "Where did the communication chain fail?",
        "options": [
          "Between a woodland community and human relatives who did not know it existed.",
          "Between Nell and a letter she has already mailed.",
          "Because every animal forgot her."
        ],
        "answer": 0,
        "note": "The tragedy includes a missing connection between two communities, not an absence of remembrance."
      },
      {
        "type": "order",
        "question": "Reconstruct the broken chain.",
        "cards": [
          "The human family still without the woodland account",
          "Goldilocks known inside the woodland",
          "Accounts passed among its animals"
        ],
        "order": [
          1,
          2,
          0
        ],
        "note": "Nell can finally explain why woodland fame did not end the human search."
      }
    ],
    "scenery": {
      "src": "assets/bear-country/hollow-places.webp",
      "tile": 0
    }
  },
  {
    "id": "years",
    "name": "Two lives measured in waiting",
    "place": "Honeybrook Library",
    "route": "index.html#visit=Honeybrook%20Library",
    "photo": "room",
    "intro": "Back in the library, place the known events in order without adding dates. Goldilocks grew older and died before Nell’s arrival. The family’s questions continued through generations. Nell cannot promise a reunion that time has already taken away.",
    "steps": [
      {
        "question": "Which detail belongs to the preserved chronology?",
        "options": [
          "Goldilocks is still seven when Nell arrives.",
          "Nell’s deceased grandfather is waiting at home.",
          "Goldilocks’s life and death precede Nell’s arrival."
        ],
        "answer": 2,
        "note": "The answer can still matter deeply even though a living reunion with Goldilocks is no longer possible."
      },
      {
        "question": "Why must Nell tell this carefully?",
        "options": [
          "The family needs truth about survival, loss and years apart.",
          "A happy ending requires erasing every death.",
          "The bears should invent a reunion."
        ],
        "answer": 0,
        "note": "Relief will not erase grief. Both belong in the discovery."
      },
      {
        "type": "order",
        "question": "Build the timeline without inventing years.",
        "cards": [
          "Nell follows the promise and arrives",
          "The family’s unanswered search continues through generations",
          "The child disappears in the river tragedy",
          "Goldilocks grows older among woodland bears"
        ],
        "order": [
          2,
          3,
          1,
          0
        ],
        "note": "The searches span the story’s generations; this ordering does not supply unrecorded calendar dates."
      }
    ],
    "scenery": {
      "src": "assets/fair-scenes/bear-country/country-16.webp",
      "tile": 0
    }
  },
  {
    "id": "packet",
    "name": "What Nell can carry to Harold",
    "place": "Welcome House",
    "route": "index.html#visit=Welcome%20House",
    "photo": "room",
    "intro": "Nell opens her notebook at Welcome House. Lay the clues in three groups: things she knows, things the bears believe, and questions that require a personal account. Her grandfather’s promise and the dream finally meet a researched reason to seek Harold.",
    "steps": [
      {
        "question": "Keep the reincarnation theory where it belongs.",
        "options": [
          "A confirmed answer to Nell’s identity.",
          "The bears’ sincere belief, separate from proven ancestry.",
          "A reason to discard their kindness."
        ],
        "answer": 1,
        "note": "Their embrace stays meaningful without turning belief into a certified family record."
      },
      {
        "question": "Which question has not been answered by the public trail?",
        "options": [
          "Whether Nell has been welcomed.",
          "Whether beekeeping is her family trade.",
          "What the beekeepers’ daughter herself wanted her human family to know."
        ],
        "answer": 2,
        "note": "Public remembrance cannot replace a personal message. Harold is the next source, not the game’s automatic next action."
      },
      {
        "type": "order",
        "question": "Pack Nell’s questions for the post office.",
        "cards": [
          "Ask whether a personal message was left",
          "Explain the missing-beekeeper inquiry",
          "Describe the family’s long search",
          "Listen to Harold when Nell chooses"
        ],
        "order": [
          1,
          2,
          0,
          3
        ],
        "note": "The packet leads to Harold after research. No conversation or letter opening is completed for you."
      }
    ],
    "scenery": {
      "src": "assets/fair-scenes/bear-country/country-13.webp",
      "tile": 1
    }
  },
  {
    "id": "questions",
    "name": "Questions worth carrying",
    "place": "Goldilocks & Three Bears Monument",
    "route": "index.html#visit=Goldilocks%20%26%20Three%20Bears%20Monument",
    "photo": "arrival",
    "intro": "At the monument, arrange six research notes: a familiar stranger; a woodland name; a long human search; fear at the woodland boundary; the family’s beekeeping; the bears’ hospitality. Nell now knows why she needs Harold, without yet knowing what his kept letter says.",
    "steps": [
      {
        "question": "Separate the bears’ belief from a verified family account.",
        "options": [
          "They believe Goldilocks has returned in Nell; the family history still needs its own evidence.",
          "Their belief alone proves reincarnation.",
          "Nell has already solved every mystery."
        ],
        "answer": 0,
        "note": "Keep their loving belief intact without making it an answer Nell has already received."
      },
      {
        "question": "Choose the questions to take to Harold.",
        "options": [
          "Why did the family refuse to search at all?",
          "What happened to the beekeepers, what became of their daughter, and did she leave word for family?",
          "Can he explain every secret of the Northern Woods?"
        ],
        "answer": 1,
        "note": "Nell’s questions now grow from her research, her grandfather’s promise and the dream’s instruction."
      },
      {
        "question": "Choose what happens next.",
        "options": [
          "The game speaks to Harold automatically.",
          "The letter is silently opened.",
          "Keep the research and approach Harold only when I choose."
        ],
        "answer": 2,
        "note": "Your fourteen case files are ready. You can continue exploring. Harold’s first conversation remains your next deliberate story choice."
      }
    ],
    "scenery": {
      "src": "assets/fair-scenes/bear-country/country-19.webp",
      "tile": 1
    }
  }
];
const initial=()=>({version:1,revision:0,files:{},mail:{draft:'',posted:false,copy:''}});
function valid(s){try{if(!s||s.version!==1||!Number.isSafeInteger(s.revision)||s.revision<0||!s.files||Array.isArray(s.files)||Object.keys(s.files).some(id=>!tasks.some(t=>t.id===id)))return false;let closed=false;for(const t of tasks){const f=s.files[t.id];if(f){if(closed||f.visited!==true||!Number.isInteger(f.step)||f.step<0||f.step>3)return false;if(f.step<3)closed=true;}else closed=true;}const m=s.mail;return !!m&&typeof m.draft==='string'&&m.draft.length<=4000&&typeof m.posted==='boolean'&&typeof m.copy==='string'&&m.copy.length<=4000&&(m.posted?!!m.copy.trim():m.copy==='');}catch{return false;}}
const complete=s=>valid(s)&&tasks.every(t=>s.files[t.id]?.step===3);
const letterRead=s=>!!s?.letterOpened&&(s.chapter>3||s.chapter===3&&s.step>=3);
function run(input,a,journey){if(!valid(input))throw Error('Research save needs recovery; it has not been overwritten.');const s=JSON.parse(JSON.stringify(input));if(a.type==='draft'||a.type==='post'){if(!letterRead(journey))throw Error('Read Goldilocks’s letter before writing this discovery home.');if(s.mail.posted)throw Error('Your letter is already in Harold’s outgoing family post.');const text=String(a.text||'').trim();if(!text||text.length>4000)throw Error('Write 1–4000 characters for your family.');s.mail.draft=text;if(a.type==='post'){s.mail.posted=true;s.mail.copy=text;}}else{const t=tasks.find(t=>t.id===a.id);if(!t)throw Error('Choose a research file.');if(tasks.slice(0,tasks.indexOf(t)).some(x=>s.files[x.id]?.step!==3))throw Error('Follow the next lead from your last research file.');if(a.type==='visit'){if(!s.files[t.id])s.files[t.id]={visited:true,step:0};else return {state:s,message:'This place is already in your research notebook.'};}else if(a.type==='answer'){const f=s.files[t.id];if(!f)throw Error('Enter the actual research place before working on its evidence.');if(f.step>=3)throw Error('This file is complete. Follow its next lead.');if(a.step!==f.step)throw Error('This research file changed. Reload before continuing.');const st=t.steps[f.step],right=st.type==='order'?Array.isArray(a.sequence)&&JSON.stringify(a.sequence)===JSON.stringify(st.order):a.choice===st.answer;if(!right)return{state:s,message:'Paws and ponder: '+t.steps[f.step].note,correct:false};f.step++;}else throw Error('Choose a research action.');}s.revision++;if(!valid(s))throw Error('This research action could not be saved.');return{state:s,message:a.type==='post'?'Your family letter is posted in the game. A copy remains here.':a.type==='draft'?'Your family letter draft is saved.':'Research notebook updated.',correct:true};}
const familyDraft='My dear family,\n\nI have found the part of our story we could never reach. The beekeepers were lost in the river, but their little girl survived. Goldilocks was sheltered and loved by bears, deep in the woods, in a community we did not know existed.\n\nWe searched for years. We were afraid to go far enough into bear country, never imagining that bears could be the sanctuary of our own kin. She was known and loved by the woodland animals while we still thought her lost. Had we known about Bear Hollow and Honeybrook, perhaps we could have found her.\n\nGoldilocks left a letter for whichever member of our family came looking. Harold kept it. I cried as I read it. She wanted us to know she lived, that she was loved, and that she had not forgotten us. There is grief in this answer, but there is love in it too.\n\nGranddad did not live to hear it, but I have kept my promise. I wanted you to know as soon as I knew. I will bring her words home.\n\nWith love,\nNell';
return{tasks,initial,valid,complete,run,letterRead,familyDraft};});
