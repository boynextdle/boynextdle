// [album, release year]
const AL=[["WHO!","2023-05-30"],["WHY..","2023-09-04"],["HOW?","2024-04-15"],["19.99","2024-09-09"],["No Genre","2025-05-13"],["The Action","2025-10-20"],["HOME","2026-06-08"],["AND,","2024-07-10"],["BOYLIFE","2025-08-18"],["HOME (Deluxe)","2026-09-28"]];// [song name, index album, track, member co writing(1/0)]
const SG=[
 ["But I Like You",0,1,1],["One and Only",0,2,0],["Serenade",0,3,1],
 ["Crying",1,4,1],["But Sometimes",1,5,1],["ABCDLOVE",1,6,1],
 ["OUR",2,1,0],["Amnesia",2,2,1],["So let’s go see the stars",2,3,1],["Earth, Wind & Fire",2,4,1],["l i f e i s c o o l",2,5,1],["Dear. My Darling",2,6,1],
 ["Dangerous",3,1,1],["Gonna Be A Rock",3,2,1],["Nice Guy",3,4,1],["20",3,5,1],["Call Me",3,6,1],
 ["123-78",4,1,1],["I Feel Good",4,2,1],["Step By Step",4,3,1],["Is That True?",4,4,1],["Next Mistake",4,5,1],["IF I SAY, I LOVE YOU",4,6,1],
 ["Live In Paris",5,1,1],["Hollywood Action",5,2,1],["JAM!",5,3,1],["Bathroom",5,4,1],["As Time Goes By",5,5,1],
 ["06070",6,1,1],["VIRAL",6,2,1],["ddok ddok ddok",6,3,1],["ADIOS!",6,4,1],["Upside Down",6,5,1],["DIVE",6,6,1],["Forever You",6,7,1],["I Wonder",6,8,1],
 ["GOOD DAY",7,4,0],
 ["Count to Love (Japanese ver.)",8,1,1],
 ["Animal",9,1,1],["Cliche",9,2,1],["Count to Love (Korean ver.)",9,11,1],["400 Years",9,12,1],["Boom Boom Boom",9,13,0]
].map((s,i)=>({id:i,t:s[0],a:s[1],n:s[2],c:s[3]}));
const MAX=5, LAUNCH=Date.UTC(2026,9,27)/864e5;
const $=id=>document.getElementById(id);
const yr=a=>AL[a][1].slice(0,4), dt=a=>AL[a][1];

function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const order=(()=>{const r=rng(20261027),a=SG.map(s=>s.id);for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a})();
const now=new Date(), dayNum=Math.floor(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())/864e5);
const puzzle=Math.max(1,dayNum-LAUNCH+1);
const ans=SG[order[((dayNum-LAUNCH)%SG.length+SG.length)%SG.length]];
const KEY="bnd-songdle:v2:"+dayNum;
let guesses=[];

try{const v=JSON.parse(localStorage.getItem(KEY)||"null");
  if(v&&Array.isArray(v.g))guesses=v.g.map(t=>SG.find(s=>s.t===t)).filter(Boolean).map(s=>s.id)}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify({g:guesses.map(i=>SG[i].t)}))}catch(e){}}
function save(){try{localStorage.setItem(KEY,JSON.stringify({g:guesses}))}catch(e){}}
const SK="bnd-songdle-stats";
let stats={streak:0,max:0,last:-1};
try{const v=JSON.parse(localStorage.getItem(SK)||"null");if(v&&typeof v.streak==="number")stats=Object.assign(stats,v)}catch(e){}
function saveStats(){try{localStorage.setItem(SK,JSON.stringify(stats))}catch(e){}}
function curStreak(){return(stats.last===dayNum||stats.last===dayNum-1)?stats.streak:0}
function recordResult(s){
  if(stats.last===dayNum)return;
  if(s==="win"){stats.streak=(stats.last===dayNum-1?stats.streak:0)+1;stats.max=Math.max(stats.max,stats.streak)}
  else stats.streak=0;
  stats.last=dayNum;saveStats();
}

function compare(g){
  const sameAlbum=g.a===ans.a;
  const gy=+yr(g.a),ay=+yr(ans.a);const arrow=gy===ay?"=":(gy<ay?"↑":"↓");
  return [
    {v:g.t,ok:g.id===ans.id},
    {v:AL[g.a][0],ok:sameAlbum},
    {v:"#"+g.n,ok:g.n===ans.n},
    {v:g.c?"✓ Yes":"✗ No",ok:g.c===ans.c},
    {v:yr(g.a),ok:yr(g.a)===yr(ans.a)},
    {v:arrow,ok:gy===ay}
  ];
}
function addRow(g,animate){
  const row=document.createElement("div");row.className="gr";
  compare(g).forEach((c,i)=>{
    const d=document.createElement("div");d.className="c "+(c.ok?"ok":"bad");d.textContent=c.v;
    d.style.animationDelay=(animate?i*.28:0)+"s";row.appendChild(d)});
  $("rows").prepend(row);
}
function renderList(){
  const q=$("q").value.trim().toLowerCase(), l=$("list");l.innerHTML="";let any=false;
  const ss=SG.filter(s=>!guesses.includes(s.id)&&s.t.toLowerCase().includes(q)).sort((x,y)=>x.t.localeCompare(y.t,"en",{sensitivity:"base",numeric:true}));
  any=ss.length>0;
  ss.forEach(s=>{const b=document.createElement("button");b.className="so";b.textContent=s.t;b.onclick=()=>guess(s.id);l.appendChild(b)});
  if(!any){const n=document.createElement("div");n.className="none";n.textContent="No songs found";l.appendChild(n)}
}
function state(){
  if(guesses.includes(ans.id))return "win";
  if(guesses.length>=MAX)return "lose";
  return "play";
}
function guess(id){
  if(state()!=="play"||guesses.includes(id))return;
  guesses.push(id);save();addRow(SG[id],true);$("q").value="";
  const s=state();if(s!=="play")recordResult(s);
  setTimeout(update,s==="play"?0:1900);
  if(s==="play")update();
}

function update(){
  const s=state();
  if(s!=="play")recordResult(s);
  $("status").textContent=s==="play"?"Guess "+guesses.length+" of "+MAX:"";
  renderList();
  const st=$("streak"),bs=$("best");
  if(st)st.textContent=curStreak();
  if(bs)bs.textContent=stats.max;
  if(s==="play"){$("search").style.display="block";$("end").style.display="none";return}
  $("search").style.display="none";$("end").style.display="block";
  $("eh").textContent=s==="win"?"🎉 Correct! Solved in "+guesses.length+"/"+MAX:"Game over";
  $("ep").textContent="Today’s song is "+ans.t+" (album: "+AL[ans.a][0]+")";
}

$("q").addEventListener("input",renderList);
$("q").addEventListener("keydown",e=>{
  if(e.key==="Enter"||e.keyCode===13){e.preventDefault();const f=$("list").querySelector(".so");if(f)f.click()}
});
function shareText(){
  const lines=guesses.map(i=>compare(SG[i]).map(c=>c.ok?"🟩":"🟥").join(""));
  return "BOYNEXTDOOR Songdle #"+puzzle+" "+(state()==="win"?guesses.length:"X")+"/"+MAX+"\n"+lines.join("\n");
}
$("share").onclick=async()=>{
  try{await navigator.clipboard.writeText(shareText());$("share").textContent="Copied ✓"}
  catch(e){$("share").textContent="Couldn’t copy"}
};
$("tweet").onclick=()=>{
  const url="https://x.com/intent/post?text="+encodeURIComponent(shareText()+"\n"+location.href)+"&hashtags=BOYNEXTDOOR";
  window.open(url,"_blank","noopener");
};
function tick(){
  const n=new Date(),m=new Date(n.getFullYear(),n.getMonth(),n.getDate()+1),s=Math.max(0,Math.floor((m-n)/1000));
  const p=x=>String(x).padStart(2,"0");
  $("cd").textContent=p(Math.floor(s/3600))+":"+p(Math.floor(s%3600/60))+":"+p(s%60);
  if(s===0&&dayNum!==Math.floor(Date.UTC(n.getFullYear(),n.getMonth(),n.getDate())/864e5))location.reload();
}
$("sub").textContent="Guess the BOYNEXTDOOR song of the day · Puzzle #"+puzzle+" · "+MAX+" guesses";
guesses.forEach(i=>addRow(SG[i],false));
update();tick();setInterval(tick,1000);
