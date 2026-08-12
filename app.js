const $=s=>document.querySelector(s);
const screens=[...document.querySelectorAll(".screen")];
const state={step:0,answers:{name:"",mood:"",number:"",symbol:"",fear:"",fate:""}};
const qs=[
{key:"name",eye:"BEGINNING",title:"What should the Oracle call you?",help:"A name makes a prediction a little more personal.",type:"text",placeholder:"Enter a name..."},
{key:"mood",eye:"TEMPERAMENT",title:"How do you feel right now?",help:"Go with your first instinct.",opts:["Calm","Curious","Confident","Chaotic"]},
{key:"number",eye:"CHANCE",title:"Choose a number from 1 to 9.",help:"Do not overthink it. Your first choice matters.",opts:["1","2","3","4","5","6","7","8","9"]},
{key:"symbol",eye:"PATH",title:"Which symbol pulls your attention first?",help:"Pick the one you would normally ignore.",opts:["☾ Moon","✦ Star","☀ Sun","◇ Mirror"]},
{key:"fear",eye:"SHADOW",title:"What would you rather not lose?",help:"Keep the answer honest.",type:"text",placeholder:"A person, a goal, a memory..."},
{key:"fate",eye:"BELIEF",title:"Do you believe fate can be changed?",help:"There is no wrong answer.",opts:["Yes","No","Sometimes","I don't know"]}
];
const pred={
Calm:["Your future is quieter than expected.","A small choice will carry more weight than a dramatic one. Patience becomes your advantage.","You notice more than you reveal.","☾"],
Curious:["Your future contains an interruption.","Something unexpected crosses your usual path. You will investigate it instead of walking away.","Curiosity keeps opening doors you did not plan to visit.","✦"],
Confident:["You are approaching a decisive moment.","The next opportunity may not look important at first. Trust the first clear instinct.","You act first and understand the consequences later.","☀"],
Chaotic:["Your future refuses to behave.","Plans change, people surprise you, and somehow you still land on your feet.","Your best outcomes rarely follow the original plan.","◇"]
};
function show(id){screens.forEach(s=>s.classList.remove("active"));$(id).classList.add("active")}
function progress(n){$("#progressBar").style.width=Math.min(100,n/7*100)+"%"}
function render(){
 const q=qs[state.step], v=state.answers[q.key]||"", a=$("#answers");
 $("#count").textContent=String(state.step+1).padStart(2,"0");
 $("#qbar").style.width=((state.step+1)/qs.length*100)+"%";
 $("#eyebrow").textContent=q.eye;$("#qtitle").textContent=q.title;$("#qhelp").textContent=q.help;a.innerHTML="";
 if(q.type==="text"){const i=document.createElement("input");i.className="text-input";i.placeholder=q.placeholder;i.value=v;i.maxLength=48;i.addEventListener("input",()=>{state.answers[q.key]=i.value.trim();$("#next").disabled=!state.answers[q.key]});a.appendChild(i);setTimeout(()=>i.focus(),60)}
 else{const g=document.createElement("div");g.className="options";q.opts.forEach(x=>{const b=document.createElement("button");b.className="option"+(x===v?" sel":"");b.textContent=x;b.type="button";b.onclick=()=>{state.answers[q.key]=x;g.querySelectorAll(".option").forEach(y=>y.classList.remove("sel"));b.classList.add("sel");$("#next").disabled=false};g.appendChild(b)});a.appendChild(g);$("#next").disabled=!v}
 $("#back").style.visibility=state.step?"visible":"hidden";progress(state.step+1)
}
async function analyze(){
 show("#analysis");$("#logs").innerHTML="";$("#analysisBar").style.width="0%";
 const n=state.answers.name||"traveler", logs=[
 `Recording the name "${n}"...`,
 "Comparing your choices against the Oracle's pattern library...",
 `Your chosen number: ${state.answers.number}.`,
 `Your symbol: ${state.answers.symbol}.`,
 "Measuring the balance between instinct and caution...",
 "Cross-referencing your answers...",
 "The Oracle has noticed something unusual.",
 "Finalizing the reading..."
 ];
 for(let i=0;i<logs.length;i++){const p=Math.round((i+1)/logs.length*100);$("#analysisBar").style.width=p+"%";$("#analysisPct").textContent=p+"%";$("#analysisText").textContent=i===6?"Something is unusual...":"Interpreting the pattern...";const d=document.createElement("div");d.textContent="› "+logs[i];$("#logs").appendChild(d);await new Promise(r=>setTimeout(r,i===7?650:500))}
 const p=pred[state.answers.mood]||pred.Curious;$("#pTitle").textContent=p[0];$("#pText").textContent=p[1]+(n?` For ${n}, the pattern is unusually clear.`:"");$("#pattern").textContent=`${p[2]} Your answer to the fate question was "${state.answers.fate}".`;$("#symbol").textContent=p[3];show("#prediction")
}
async function reveal(){
 show("#revealScreen");await new Promise(r=>setTimeout(r,2400));show("#troll");const v=$("#video");v.currentTime=0;try{await v.play()}catch(e){}progress(7)
}
function restart(){Object.keys(state.answers).forEach(k=>state.answers[k]="");state.step=0;$("#video").pause();$("#video").currentTime=0;progress(0);show("#intro")}
$("#enter").onclick=()=>{state.step=0;render();show("#questions")};
$("#next").onclick=()=>{if(!state.answers[qs[state.step].key])return;if(state.step<qs.length-1){state.step++;render()}else analyze()};
$("#back").onclick=()=>{if(state.step){state.step--;render()}};
$("#toConfirm").onclick=()=>{const n=state.answers.name;$("#cTitle").textContent=n?`${n}, your future is ready.`:"Your future is ready.";show("#confirm")};
$("#reveal").onclick=reveal;$("#restart").onclick=restart;$("#home").onclick=e=>{e.preventDefault();restart()};
render();
