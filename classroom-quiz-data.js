/* Authored subject-only daily question banks for the four connected classrooms. */
(function(r,f){const d=f(typeof module==='object'&&module.exports?require('./town-activity-data'):r.HoneybrookTownActivities);if(typeof module==='object'&&module.exports)module.exports=d;else r.HoneybrookClassroomQuizData=d;})(globalThis,(Town)=>{'use strict';
const source={troubleshooting:`
A classroom computer will not turn on. What should you check first?|Power connection and outlet|Browser bookmarks|Printer paper|Begin with the power supply before investigating software.
One computer cannot reach the network but its neighbors can. Where should you start?|That computer’s connection and settings|Replacing every network device|Reinstalling every classroom computer|The limited scope points first to the affected workstation.
All classroom devices lose internet together. Which shared point is worth checking?|The router or upstream connection|Each keyboard battery|One student’s document|A shared failure suggests a shared connection or service.
A monitor says No signal. What is a useful first check?|Its input selection and display cable|The spelling checker|The email signature|Check the display signal path before replacing the screen.
A printer queue is paused. What should you inspect before sending more copies?|Queue status and the reported printer condition|The desktop wallpaper|The music volume|Repeated submissions do not resolve a paused queue.
A problem appears immediately after an update. What should your notes include?|The update and when the symptom began|Only the computer’s color|An assumed diagnosis without a test|The change timeline is evidence, not proof of cause.
Why change one setting at a time during diagnosis?|So you can identify which change affected the result|So you never need notes|So every setting is changed eventually|Controlled changes make results interpretable.
An application freezes but other applications work. What is the initial scope?|The affected application|The entire power grid|Every keyboard on the network|Investigate the observed scope before broad changes.
A website fails by name while a known IP connection succeeds. What may need checking?|Name resolution such as DNS|The mouse pointer speed|The printer toner level|DNS translates names; this symptom suggests checking resolution.
What should you collect before dismissing an error message?|Its exact wording and the action that triggered it|A guessed paraphrase only|A different user’s password|Precise error details help reproduce and investigate a failure.
How do you verify that a repair worked?|Repeat the original failing task and check related functions|Close the ticket without testing|Assume a restart proves success|Verify the reported problem and look for unintended effects.
A fault returns after a temporary fix. What helps the next investigation?|A record of symptoms, tests and changes|Deleting the earlier notes|Repeating unrelated changes at random|A diagnostic history prevents repeated guesses.
A keyboard types nothing. Which test helps isolate the cause?|Try a known working keyboard or port|Delete the user’s files|Change the screen brightness|Substitution can help distinguish device and connection faults.
What does a successful ping test establish?|The target responded to that network test|Every web application is healthy|Every DNS record is correct|A ping response does not prove every service works.
A computer becomes slow when storage is nearly full. What should be checked?|Available space and safe cleanup options|Whether the monitor is blue|Whether the keyboard is wireless|Check the actual resource constraint; preserve user data.
When should a troubleshooting change be rolled back?|When testing shows it caused a new problem|Whenever a different wallpaper is preferred|Before recording what was changed|A reversible change and documented rollback limit unintended effects.
What should happen before a change that could affect saved work?|Protect the work and obtain the appropriate permission|Delete the work to simplify testing|Assume the owner kept another copy|Protect data before disruptive diagnostic changes.
A support request says It does not work. What should you ask?|What failed, when it began and what result was expected|For the user’s secret password|Only which chair they used|Clarify the symptom and expected behavior before diagnosing.
Why test with a known working cable?|To compare the suspected connection against a reliable one|To prove every software setting is correct|To erase the network history|A controlled substitution helps isolate the cable or port.
The network cable is unplugged. What should happen after reconnecting it?|Test the original network task|Replace the operating system immediately|Declare every service healthy without testing|Restoring a connection still requires verification.
An issue occurs only under one user account. What does that suggest checking?|That account’s settings and permissions|Only the building’s electricity|Every computer’s processor|An account-specific symptom helps narrow the investigation.
What should a useful support handover contain?|The symptom, tests, changes and verification result|Only a claim that it is fixed|The user’s private credentials|A clear handover allows safe continuation and review.
When should you escalate an unresolved fault?|When it exceeds your permission or expertise, with evidence|Only after deleting diagnostic notes|After inventing a successful result|Escalation includes the facts and tests already completed.
Why reproduce a fault before attempting a fix?|To establish a reliable starting condition|To make the fault more mysterious|To avoid understanding the user’s task|A repeatable starting point supports meaningful comparisons.
`,coding:`
What is a variable used for?|Storing a value a program can use|Replacing every instruction|Changing the monitor hardware|Variables hold values referenced by program instructions.
What does a conditional do?|Chooses a branch when a condition is evaluated|Repeats every line forever|Deletes every input|A condition controls which branch executes.
What does a loop help a program do?|Repeat a defined action|Guarantee that no errors exist|Replace all data with pictures|Loops repeat work according to their control condition.
A robot must move right twice. Which instructions match?|RIGHT, RIGHT|RIGHT, LEFT|UP, DOWN|The two right moves produce the specified displacement.
Why test a program with a small example?|To compare actual behavior with an expected result|To prove every possible case works|To avoid reading the requirements|A small test makes discrepancies easier to inspect.
What is an algorithm?|An ordered method for solving a problem|A kind of monitor cable|Any random list of words|An algorithm describes a method with purposeful steps.
What does a function allow you to do?|Group a reusable operation|Skip all input checks|Store no instructions|A function encapsulates behavior that can be called.
What is a Boolean value?|True or false|Any image file|A list of printer jobs|Booleans represent two truth values.
What is an array commonly used for?|An ordered collection of values|A guarantee of unique values|Only a single fixed word|Arrays hold items in indexed order.
Why validate a program’s input?|To check that it meets the program’s requirements|To guarantee every user is correct|To replace all testing|Validation handles unacceptable input before using it.
What does debugging involve?|Finding and correcting causes of incorrect behavior|Only changing visual colors|Removing all tests|Debugging connects symptoms to causes in the program.
What should happen at the end of a finite loop?|Its stopping condition is reached|Its condition becomes irrelevant|It must always run forever|A finite loop needs a reachable termination condition.
Which comparison checks equality in JavaScript without type conversion?|===|=|+=|Strict equality compares values without coercing their types.
What does x = 3 assign to x?|The number 3|The text x|A comparison result|The assignment stores the value in the variable.
A zero-based array has three items. Which indexes address them?|0, 1, 2|1, 2, 3|0, 2, 4|Zero-based indexes start at zero and proceed one per item.
What should a useful code comment explain?|Intent or a decision that helps a reader|A password needed for login|An unrelated shopping list|Comments should support understanding without exposing secrets.
What is a syntax error?|Code that does not follow the language’s grammar|A correct result with a different color|Any slow internet connection|The parser cannot interpret invalid grammatical structure.
What is a logical error?|Code runs but its reasoning produces the wrong result|A loose power cable only|Always a missing semicolon|A logical error concerns the program’s intended behavior.
Why break a large programming task into functions?|To organize responsibilities and test smaller parts|To prevent any reuse|To avoid naming operations|Focused parts are easier to understand and verify.
What should a test’s expected result come from?|The requirement for the chosen input|Whatever the program currently prints|A random value chosen afterward|Tests compare behavior with a defined requirement.
A robot must avoid a blocked square. What should the program check?|The next position before moving|Only the final wallpaper|Only the robot’s name|Validate a proposed move against the route constraints.
What is an edge case?|A boundary condition that may need special handling|Any line at the edge of the screen|Only the most common input|Empty collections and boundary values are typical edge cases.
What does returning a value from a function do?|Makes a result available to its caller|Prints it automatically in every language|Changes every variable to that value|A returned result can be used by the calling code.
Why keep a working version before changing code?|To compare behavior and recover if needed|To avoid testing the new version|To make errors permanent|Version history supports comparisons and recovery.
`,office:`
Two appointments overlap. What should you do first?|Compare times and confirm an agreed alternative|Delete both without asking|Assume both can use one room|Resolve scheduling conflicts with the affected people.
What belongs in a clear meeting invitation?|Purpose, time, location and necessary preparation|Only a decorative image|Everyone’s private passwords|An invitation must tell attendees what to prepare and where to be.
How should confidential documents be stored?|With access limited to authorized people|On a public noticeboard|In an unlocked visitor folder|Office records need appropriate access controls.
Why proofread a letter before sending it?|To check its recipient, facts and wording|To change its purpose secretly|To guarantee a response|Proofreading helps catch preventable mistakes.
What should you check before attaching a file?|That it is the correct version for the intended recipient|Only that its name is short|That it includes unrelated private records|Check content, version and permission before sending.
What makes a useful filing name?|A consistent name identifying its contents and version|A different random name each time|Only the word document|Consistent naming helps retrieval and version identification.
A spreadsheet total seems wrong. What is a useful check?|The formula range and included entries|The desk color|The font alone|Missing or repeated cells can cause incorrect totals.
Why keep meeting minutes?|To record decisions, responsibilities and agreed follow-up|To replace everyone’s consent|To record unrelated private conversations|Minutes preserve an accurate account of agreed business.
What should a task handover state?|What is done, what remains and who is responsible|Only the previous worker’s favorite color|That all unfinished work disappeared|A handover makes remaining responsibilities clear.
What is a sensible way to prioritize office work?|Consider deadlines, importance and dependencies|Do the shortest task regardless of urgency|Ignore all promised dates|Priority depends on consequences and timing.
What should a phone message include?|Caller, callback details, time and the message|A guessed request|Another caller’s private record|Accurate messages allow appropriate follow-up.
Why check a photocopy’s page count and order?|To confirm the copy is complete and usable|To change the source silently|To avoid reviewing the result|Copying is complete only when the output is checked.
What should you do with an uncertain delivery address?|Verify it before dispatch|Guess the missing number|Use any nearby address|An address check prevents misdelivery.
What helps avoid duplicate office bookings?|One maintained booking record|Several conflicting private lists|Deleting bookings after reading them|A current shared record reduces conflicts.
Which record helps track an office supply order?|Items, quantities, supplier and delivery status|Only the packaging color|An unrelated attendance list|A supply record links the request to its fulfillment.
What does an email subject line need to convey?|The message’s purpose|The sender’s password|Every attachment’s complete contents|A clear subject helps recipients recognize the action or information.
What should you do when a deadline cannot be met?|Notify the responsible person early with a realistic plan|Change the date without telling anyone|Mark the work complete|Early, truthful communication supports replanning.
Why distinguish a draft from an approved document?|So unfinished material is not treated as final|So approval can be invented|To remove the need for review|Version status affects what can be distributed or acted upon.
What should you check before sharing a calendar?|Which details and permissions the recipient needs|Whether it includes every private appointment|Only the calendar’s color|Share only appropriate information with suitable access.
What belongs on an office action list?|Specific tasks, owners and due dates|Only completed tasks with no dates|Unrelated personal secrets|Action lists support accountable follow-through.
A receipt and invoice disagree. What should you do?|Compare the entries and ask for clarification|Alter the receipt without a record|Pay a guessed amount|Reconcile the evidence before finalizing the account.
What helps make an office document accessible?|Clear headings, readable text and suitable alternatives|Using color as the only instruction|Replacing all headings with pictures|Accessible structure helps different readers use the document.
What should happen after completing an assigned office task?|Check the result and hand it to the intended person|Hide the result in an unrelated folder|Claim every other task is complete|Completion includes a usable and correctly delivered outcome.
Why follow a document retention policy?|To keep and dispose of records appropriately|To keep every private record forever|To destroy current work at random|Retention rules guide appropriate record handling.
`,research:`
What should guide a research search?|A clear question|The first attractive picture|A conclusion chosen before reading|A question helps decide what evidence is relevant.
What is a primary source?|A firsthand record or original evidence|Always a later summary|Any unsigned social post|Primary sources originate with the event or work being studied.
Why compare independent sources?|To check agreement and identify differences|To count copied versions as new evidence|To avoid reading either source|Independent corroboration is stronger than repeated copying.
What should you record when taking research notes?|The finding and where it came from|Only the paper color|An unsupported conclusion without a source|Source-linked notes can be checked later.
How does an inference differ from an observation?|An inference interprets evidence; an observation records what was noticed|They are always identical|An inference needs no evidence|Keep interpretation distinct from the underlying evidence.
Why check a source’s publication date?|Its information may reflect a different time|Older sources are always wrong|Dates prove every claim true|Relevance can depend on the time being described.
What is a direct quotation?|The source’s exact words clearly marked and attributed|A changed sentence presented as exact|Any personal opinion|Quotation requires accurate wording and attribution.
What is paraphrasing?|Restating an idea accurately in your own words with attribution|Changing one word and claiming authorship|Adding unsupported facts|A paraphrase preserves meaning while using new wording.
A source makes a claim without evidence. What should you do?|Look for supporting evidence before relying on it|Treat confident wording as proof|Copy it as an established fact|Confidence alone does not establish a claim.
Why identify a source’s author and purpose?|To understand expertise, perspective and possible limitations|To prove every sentence is false|To avoid reading the source|Authorship and purpose help evaluate a source.
What makes a research note relevant?|It helps address the current question|It is the longest note|It contains the most decorative language|Relevance depends on the question being investigated.
Two sources disagree. What should you compare?|Their evidence, scope, dates and definitions|Only their page colors|Which title is louder|Differences may arise from scope or evidence rather than dishonesty.
What is a citation used for?|Helping readers locate the supporting source|Guaranteeing the conclusion is correct|Replacing the need to understand the source|A citation provides a traceable reference.
Why use precise search terms?|To focus results on the question|To guarantee the first result is true|To avoid checking results|Search terms improve relevance, not automatic reliability.
What should a summary preserve?|The source’s main ideas and important qualifications|Only the writer’s preferred detail|Claims absent from the source|Summaries should represent the source fairly.
What is corroboration?|Independent evidence supporting a finding|Several copies of one unsupported claim|A personal preference|Corroboration draws support from independent evidence.
What should you do with an uncertain family connection?|Mark it as unproven while seeking evidence|Treat a resemblance as a complete genealogy|Erase every related note|Uncertainty should stay visible until evidence supports the link.
Why distinguish fact from opinion when reading?|They make different kinds of claims|Opinions can never be discussed|Facts need no checking|A factual claim is checkable; an opinion expresses a judgment.
What should an archive request specify?|The record or question and relevant identifying details|An unrelated shopping list|A demand to invent missing pages|Specific requests help locate appropriate records.
A quotation is separated from its surrounding paragraph. What should you check?|Whether its context changes its meaning|Only whether it sounds convincing|Whether the font is attractive|Context can qualify or explain a sentence.
What does absence of a record establish by itself?|Only that the record has not been found in the searched material|That the event could never have happened|That every witness was dishonest|A missing record alone does not prove nonexistence.
Why record conflicting findings rather than hide them?|They show what the evidence has not resolved|They make all research useless|They can always be ignored|Transparent notes help later investigation.
What makes a conclusion well supported?|It follows from the evidence and acknowledges limits|It repeats a guess confidently|It ignores contrary findings|Conclusions should fit the available evidence and its limits.
What should you do before accepting a historical map as current?|Compare its date and features with checked references|Assume paths never change|Replace the date with today’s|Maps describe particular conditions and may become outdated.
`};
const banks=Object.fromEntries(Object.entries(source).map(([topic,text])=>[topic,text.trim().split('\n').map((line,i)=>{const[prompt,answer,a,b,review]=line.split('|');if(!review)throw Error('Incomplete classroom question');return{id:'classroom-'+topic+'-'+i,topic,prompt,answer,wrong:[a,b],review};})]));
const rooms={'Troubleshooting Classroom':{topic:'troubleshooting',subject:'Troubleshooting'},'Coding Classroom':{topic:'coding',subject:'Coding'},'Office Skills Classroom':{topic:'office',subject:'Office skills'},'Reading & Research Classroom':{topic:'research',subject:'Reading & research'}};
// The remaining locations test their actual local assignment, equipment and work plan.
for(const j of Town.jobs){if(rooms[j.name])continue;const p=Town.profileFor(j,{}),topic='location-'+Town.slug(j.name),rows=[];
const add=(prompt,answer,wrong,review)=>rows.push({id:topic+'-'+rows.length,topic,prompt:j.name+' · '+prompt,answer,wrong:[...new Set([...wrong,'Skip the documented step','Replace it with an unrelated task'])].filter(v=>v!==answer).slice(0,2),review});
const others=Town.jobs.filter(x=>x.name!==j.name);
add('Which assignment belongs here?',j.title,[others[0].title,others[1].title],'The local work order is '+j.title+'.');
add('What completed outcome does this work produce?',j.artifact,[others[0].artifact,others[1].artifact],'The local handover records '+j.artifact+'.');
add('Which skill does this assignment practice?',j.skill,['An unrelated assignment at '+others[0].name,'An unrelated assignment at '+others[1].name],j.title+' practices '+j.skill+'.');
add('Which plan matches the local work order?',p.plan,['Change the work order before checking it','Perform a different location’s assignment'],p.plan+'.');
const otherTools=Object.values(Town.profiles).flatMap(v=>v.tools).filter(v=>!p.tools.includes(v));
p.tools.forEach((tool,i)=>add('Which item belongs in equipment slot '+(i+1)+' of this assignment?',tool,[otherTools[i],otherTools[i+3]],'The local kit requires '+p.tools.join(', ')+'.'));
const steps=p.sequence;
steps.forEach((step,i)=>add(i===0?'Which action begins the demonstrated local plan?':'After “'+steps[i-1]+'”, which local step follows?',step,[steps[(i+1)%steps.length],steps[(i+2)%steps.length]],'The local sequence is '+steps.join(' → ')+'.'));
add('What should you confirm before using this location’s kit?','That the listed items suit this work order',['That an unrelated kit has the same color','That no local instructions need checking'],'Use '+p.tools.join(', ')+' for '+j.title.toLowerCase()+'.');
add('What should the local inspection compare?',j.artifact+' against the agreed plan',['Only the result’s decorative color','A result from a different room'],'Inspect the actual '+j.artifact+' against this assignment.');
add('What belongs in the completion note?',j.title+' and the checked result',['An unrelated visitor’s private information','A claimed result from a task not done'],'A local work record identifies the task and its actual result.');
add('If the result does not match this work order, what happens next?','Correct the identified mismatch and inspect again',['Deliver it as if the check passed','Replace the task with a different room’s work'],'Only a checked '+j.artifact+' is ready for handover.');
add('A required item from this kit is missing. What should happen?','Arrange the missing local equipment before continuing',['Claim the equipment check passed','Use a tool unrelated to this assignment'],'The required local kit is '+p.tools.join(', ')+'.');
add('Which action belongs immediately before this work is handed over?','Check the finished '+j.artifact,['Erase the local work order','Record an unperformed task as complete'],'The outcome must be inspected before local handover.');
add('What should stay consistent throughout this assignment?','The agreed purpose: '+j.title.toLowerCase(),['A different task chosen without telling anyone','An unrelated room’s checklist'],'Keep the stated local purpose while following '+p.plan.toLowerCase()+'.');
add('Which local item helps identify the intended result?',j.artifact,['An outcome from '+others[0].name,'An outcome from '+others[1].name],'The expected result is '+j.artifact+'.');
add('What makes a handover of this assignment useful?','A checked result and an accurate explanation of what was done',['Only a statement that every town task is finished','An unrelated quiz score'],'The handover concerns '+j.artifact+', not work elsewhere.');
add('Which local plan should a helper read before starting?',p.plan,['A plan belonging only to '+others[0].name,'A plan belonging only to '+others[1].name],'Read the plan for '+j.title.toLowerCase()+'.');if(rows.length<20)throw Error('Local quiz needs twenty distinct checks: '+j.name);banks[topic]=rows;rooms[j.name]={topic,subject:j.skill};}
return{banks,rooms};});
