(function(){
'use strict';

/* ───────── data ───────── */
const TOPICS=[
 {id:'mod',name:'Models & basics',de:'OSI, TCP/IP, Protokolle, Netzwerkarten',color:'#4da3ff'},
 {id:'phy',name:'Physical layer',de:'Kabel, Glasfaser, Funk, Bandbreite',color:'#c9a27e'},
 {id:'eth',name:'Ethernet & switching',de:'MAC-Adressen, Frames, Switches, ARP',color:'#5ac8f5'},
 {id:'ip4',name:'IPv4 & subnetting',de:'Adressen, Masken, Subnetze berechnen',color:'#ff7eb6'},
 {id:'ip6',name:'IPv6',de:'Adresstypen, Kürzen, SLAAC, ICMPv6',color:'#c08bff'},
 {id:'rte',name:'Routing',de:'Router, Routing-Tabelle, Default Gateway',color:'#8b8dff'},
 {id:'tra',name:'Transport layer',de:'TCP, UDP, Ports',color:'#5fe0d0'},
 {id:'app',name:'Application layer',de:'DNS, DHCP, HTTP, E-Mail',color:'#b8e04a'},
 {id:'sec',name:'Security',de:'Angriffe, Malware, Geräte absichern',color:'#ff9d8a'},
 {id:'ios',name:'Cisco IOS',de:'Befehle, Modi, Fehlersuche',color:'#d1d1d6'},
 {id:'imp',name:'Imported',de:'Von dir eingefügte Fragen',color:'#f5f5f7'}
];
const T={}; TOPICS.forEach(t=>T[t.id]=t);

function hash(s){let x=5381;for(let i=0;i<s.length;i++)x=((x<<5)+x+s.charCodeAt(i))|0;return (x>>>0).toString(36);}
const BUILTIN=BANK.map(r=>({id:'b'+hash(r[1]),t:r[0],q:r[1],o:r[3],c:r[3].slice(0,r[2]).map((_,i)=>i),e:r[4]}));

const mem={};
const store={
 get(k,d){try{const v=localStorage.getItem('ccna.'+k);if(v!=null)return JSON.parse(v);}catch(e){}return k in mem?mem[k]:d;},
 set(k,v){mem[k]=v;try{localStorage.setItem('ccna.'+k,JSON.stringify(v));}catch(e){}}
};
let prog=store.get('prog',{}), stars=store.get('stars',{}), imported=store.get('imported',[]), pool=store.get('pool','builtin');
if(!imported.length) pool='builtin';

function questions(){return pool==='imported'?imported:pool==='all'?BUILTIN.concat(imported):BUILTIN;}
function status(q){const p=prog[q.id];if(!p||!p.n)return 'new';return p.s>=2?'known':'shaky';}
function mark(q,ok){const p=prog[q.id]||(prog[q.id]={n:0,s:0,w:0,last:0});p.n++;if(ok)p.s++;else{p.s=0;p.w++;}p.last=Date.now();store.set('prog',prog);}
function counts(list){const c={new:0,shaky:0,known:0,all:list.length};list.forEach(q=>c[status(q)]++);return c;}
function gradable(q){return q.o.length>1&&q.c.length>0;}

/* ───────── helpers ───────── */
function h(tag,attrs){
 const e=document.createElement(tag);
 if(attrs)for(const k in attrs){const v=attrs[k];if(v==null||v===false)continue;
  if(k==='class')e.className=v;
  else if(k==='style'){for(const s in v){if(s.slice(0,2)==='--')e.style.setProperty(s,v[s]);else e.style[s]=v[s];}}
  else if(k.slice(0,2)==='on')e.addEventListener(k.slice(2),v);
  else if(k==='value')e.value=v;
  else e.setAttribute(k,v===true?'':v);}
 for(let i=2;i<arguments.length;i++)add(e,arguments[i]);
 return e;
}
function add(e,c){if(c==null||c===false||c===true)return;if(Array.isArray(c)){c.forEach(x=>add(e,x));return;}e.append(c.nodeType?c:document.createTextNode(String(c)));}
const SVG={
 check:'<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
 cross:'<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>',
 star:'<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.2-4.1 5.8-.8z"/></svg>',
 starOn:'<svg class="ico" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.2-4.1 5.8-.8z"/></svg>'
};
function icon(n){const d=document.createElement('div');d.innerHTML=SVG[n];return d.firstChild;}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=a[i];a[i]=a[j];a[j]=t;}return a;}
function rnd(n){return Math.floor(Math.random()*n);}
function setEq(set,arr){return set.size===arr.length&&arr.every(x=>set.has(x));}
function pill(q){const s=status(q);return h('span',{class:'pill '+s},s==='new'?'New':s==='shaky'?'Shaky':'Known');}
function starBtn(q,after){const on=!!stars[q.id];return h('button',{class:'star'+(on?' on':''),type:'button','aria-label':on?'Remove bookmark':'Bookmark this question','aria-pressed':String(on),onclick:e=>{e.stopPropagation();if(stars[q.id])delete stars[q.id];else stars[q.id]=1;store.set('stars',stars);(after||render)();}},icon(on?'starOn':'star'));}
function bar(c,thin){return h('div',{class:'bar'+(thin?' thin':''),role:'img','aria-label':c.known+' known, '+c.shaky+' shaky, '+c.new+' new'},h('i',{class:'k',style:{width:(c.all?c.known/c.all*100:0)+'%'}}),h('i',{class:'s',style:{width:(c.all?c.shaky/c.all*100:0)+'%'}}));}
function imgs(q){return (q.img||[]).map(src=>h('img',{class:'qimg',src:src,alt:'Exhibit for this question',loading:'lazy',referrerpolicy:'no-referrer'}));}
function why(q){if(!q.e)return null;return h('div',{class:'why'},h('b',null,q.t==='imp'?'Explanation':'Warum?'),h('span',{style:{whiteSpace:'pre-wrap'}},q.e));}

/* ───────── state & router ───────── */
const S={view:'home',sess:null,exam:null,result:null,note:'',keys:null,tick:0,
 browse:{q:'',topic:'',status:'',star:false,open:null},sub:null,imp:null};
const app=document.getElementById('app');
const VIEWS={};
function render(){clearInterval(S.tick);S.keys=null;app.replaceChildren(VIEWS[S.view]());tabs();}
function go(v){S.view=v;render();window.scrollTo(0,0);}
function tabs(){
 const m=S.sess&&(S.view==='sess'||S.view==='done')?S.sess.mode:'';
 const items=[['Home',S.view==='home',()=>go('home')],['Learn',m==='learn',()=>startSession('learn')],['Quiz',m==='quiz',()=>startSession('quiz')],
  ['Exam',S.view==='exam'||S.view==='result',()=>{S.exam=null;go('exam');}],['Cheat sheets',S.view==='sheets',()=>go('sheets')],
  ['Subnetting',S.view==='subnet',()=>go('subnet')],['Search',S.view==='browse',()=>go('browse')]];
 document.getElementById('tabs').replaceChildren(...items.map(x=>h('button',{class:'tab'+(x[1]?' on':''),type:'button','aria-current':x[1]?'page':null,onclick:x[2]},x[0])));
}
document.getElementById('brand').addEventListener('click',()=>go('home'));
document.addEventListener('keydown',e=>{
 if(!S.keys||e.metaKey||e.ctrlKey||e.altKey)return;
 const t=e.target.tagName;if(t==='INPUT'||t==='TEXTAREA'||e.target.isContentEditable)return;
 if(e.key==='Enter'&&t==='BUTTON')return;
 S.keys(e);
});
function optKey(e,n){const k=e.key.toLowerCase();let i=-1;if(/^[1-9]$/.test(k))i=+k-1;else if(/^[a-h]$/.test(k))i=k.charCodeAt(0)-97;return i>=0&&i<n?i:-1;}

/* ───────── option list ───────── */
function optList(q,order,sel,o){
 return h('div',{class:'opts'},order.map((oi,i)=>{
  const isC=q.c.indexOf(oi)>=0,isS=sel.has(oi);let cls='opt',tag='',badge=String.fromCharCode(65+i);
  if(o.reveal){
   if(isC){cls+=' ok';badge=icon('check');if(!isS&&!o.learn){cls+=' miss';tag='Correct answer';}else tag='Correct';}
   else if(isS){cls+=' bad';badge=icon('cross');tag='Your answer';}
  }else if(isS)cls+=' sel';
  return h('button',{class:cls,type:'button',disabled:!o.pick,'aria-pressed':o.pick?String(isS):null,onclick:o.pick?()=>o.pick(oi):null},
   h('span',{class:'k'},badge),h('span',{class:'t'},q.o[oi]),tag?h('span',{class:'tag'},tag):null);
 }));
}

/* ───────── home ───────── */
function mondayLine(){
 const d=new Date();if(d.getDay()===1)return 'It is Monday. Good luck.';
 const m=new Date(d);m.setDate(d.getDate()+((8-d.getDay())%7||7));m.setHours(0,0,0,0);
 const hrs=Math.round((m-d)/36e5);return hrs<48?'Monday starts in '+hrs+' hours.':'Monday starts in '+Math.round(hrs/24)+' days.';
}
VIEWS.home=function(){
 const all=questions(),c=counts(all);
 const note=S.note;S.note='';
 const poolSeg=imported.length?h('div',{class:'row',style:{marginTop:'28px'}},h('span',{class:'small muted'},'Question pool'),
   h('div',{class:'seg',role:'group','aria-label':'Question pool'},[['builtin','Built-in ('+BUILTIN.length+')'],['imported','Imported ('+imported.length+')'],['all','Both']].map(x=>
    h('button',{type:'button',class:pool===x[0]?'on':'','aria-pressed':String(pool===x[0]),onclick:()=>{pool=x[0];store.set('pool',pool);render();}},x[1])))):null;
 const topicIds=TOPICS.filter(t=>all.some(q=>q.t===t.id));
 return h('div',{class:'page'},
  h('section',{class:'hero'},
   h('p',{class:'eyebrow'},'CCNA 1 · Introduction to Networks'),
   h('h1',null,'Know it by Monday.'),
   h('p',{class:'sub'},all.length+' questions in short rounds. Every answer comes with a plain explanation in German, and what you get wrong comes back until it sticks.'),
   h('div',{class:'row',style:{marginTop:'30px'}},
    h('button',{class:'btn primary',type:'button',onclick:()=>startSession('learn')},c.new===all.length?'Start learning':'Continue learning'),
    h('button',{class:'btn ghost',type:'button',onclick:()=>startSession('quiz')},'Quiz me')),
   h('p',{class:'tiny',style:{marginTop:'16px'}},mondayLine()),
   note?h('p',{class:'small',style:{marginTop:'16px',color:'var(--warn)'},role:'status'},note):null,
   h('div',{class:'stats'},
    h('div',{class:'stat'},h('div',{class:'n',style:{color:'var(--ok)'}},c.known),h('div',{class:'l'},'Known')),
    h('div',{class:'stat'},h('div',{class:'n',style:{color:'var(--warn)'}},c.shaky),h('div',{class:'l'},'Shaky')),
    h('div',{class:'stat'},h('div',{class:'n'},c.new),h('div',{class:'l'},'New'))),
   bar(c),
   h('p',{class:'tiny',style:{marginTop:'12px'}},'Known = answered right twice in a row. Shaky = seen, but not safe yet.'),
   poolSeg),
  h('h2',{class:'h2'},'Topics.'),
  h('div',{class:'grid'},topicIds.map(t=>{
   const list=all.filter(q=>q.t===t.id),tc=counts(list);
   return h('article',{class:'card tcard',style:{'--c':t.color}},
    h('h3',{class:'name'},h('span',{class:'dot'}),t.name),
    h('p',{class:'muted small'},t.de),
    bar(tc,true),
    h('p',{class:'small muted',style:{marginTop:'8px'}},tc.known+' of '+tc.all+' known'+(tc.shaky?' · '+tc.shaky+' shaky':'')),
    h('div',{class:'row tfoot'},
     h('button',{class:'btn dark sm',type:'button',onclick:()=>startSession('learn',{topic:t.id})},'Learn'),
     h('button',{class:'btn ghost sm',type:'button',onclick:()=>startSession('quiz',{topic:t.id})},'Quiz')));
  })),
  h('h2',{class:'h2'},'Tools.'),
  h('div',{class:'grid'},[
   ['Exam simulation','Timed, random questions, score at the end.','Start an exam',()=>{S.exam=null;go('exam');}],
   ['Repeat my mistakes',c.shaky?c.shaky+' shaky questions are waiting.':'Nothing shaky right now.','Practise them',()=>startSession('quiz',{only:'shaky',size:15})],
   ['Cheat sheets','Ports, layers, subnet table, IPv6, IOS commands.','Open the sheets',()=>go('sheets')],
   ['Subnetting trainer','Endless calculations with the solution step by step.','Start calculating',()=>go('subnet')],
   ['Search and bookmarks','Find any question, see the answer, star it.','Browse questions',()=>go('browse')],
   ['Import questions',imported.length?imported.length+' imported questions in your trainer.':'Paste questions you copied from a web page.','Open import',()=>go('import')]
  ].map(x=>h('button',{class:'card tool',type:'button',onclick:x[3]},h('span',null,h('span',{class:'h3',style:{display:'block'}},x[0]),h('span',{class:'muted',style:{display:'block',marginTop:'6px'}},x[1])),h('span',{class:'go'},x[2]+' ›')))),
  h('footer',{class:'foot'},
   h('span',null,'Progress is saved in this browser on this device.'),
   h('button',{class:'link',type:'button',onclick:()=>{if(confirm('Reset all progress and bookmarks?')){prog={};stars={};store.set('prog',prog);store.set('stars',stars);render();}}},'Reset progress')));
};

/* ───────── learn & quiz rounds ───────── */
function pick(list,n,pref){
 const byLast=(a,b)=>((prog[a.id]||{}).last||0)-((prog[b.id]||{}).last||0);
 const nw=list.filter(q=>status(q)==='new'),sh=list.filter(q=>status(q)==='shaky').sort(byLast),kn=list.filter(q=>status(q)==='known').sort(byLast);
 const half=Math.ceil(n/2);
 const order=pref==='new'?[nw.slice(0,n-Math.min(3,sh.length)),sh,nw.slice(n-Math.min(3,sh.length)),kn]:[sh.slice(0,half),nw,sh.slice(half),kn];
 const out=[];order.forEach(g=>g.forEach(q=>{if(out.length<n&&out.indexOf(q)<0)out.push(q);}));
 return out;
}
function startSession(mode,o){
 o=o||{};let list;
 if(o.list)list=o.list.slice();
 else{let p=questions().filter(q=>!o.topic||q.t===o.topic);if(o.only==='shaky')p=p.filter(q=>status(q)==='shaky');list=pick(p,o.size||10,mode==='learn'?'new':'shaky');}
 if(!list.length){S.note=o.only==='shaky'?'Nothing shaky right now. Shaky questions appear after you have answered some.':'No questions in this selection.';return go('home');}
 S.sess={mode:mode,o:o,queue:list,done:0,right:0,wrong:0,again:{},cur:null};
 nextCard();
}
function nextCard(){
 const s=S.sess;if(!s.queue.length)return go('done');
 const q=s.queue.shift();
 s.cur={q:q,order:shuffle(q.o.map((_,i)=>i)),sel:new Set(),phase:'ask',ok:null};
 go('sess');
}
function answer(ok){
 const s=S.sess,c=s.cur;c.ok=ok;mark(c.q,ok);
 if(ok)s.right++;else{s.wrong++;s.again[c.q.id]=(s.again[c.q.id]||0)+1;if(s.again[c.q.id]<=2)s.queue.splice(Math.min(3,s.queue.length),0,c.q);}
}
function advance(){S.sess.done++;nextCard();}
VIEWS.sess=function(){
 const s=S.sess,c=s.cur,q=c.q,t=T[q.t]||T.imp,shown=c.phase==='shown',flash=s.mode==='learn'||!gradable(q),multi=q.c.length>1;
 const total=s.done+s.queue.length+1;
 let body,actions;
 if(flash){
  body=q.o.length?optList(q,c.order,new Set(),{reveal:shown,learn:true}):null;
  if(!shown){
   actions=h('div',{class:'row'},h('button',{class:'btn primary',type:'button',onclick:()=>{c.phase='shown';render();}},'Show answer'));
   S.keys=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();c.phase='shown';render();}};
  }else{
   actions=h('div',{class:'row'},
    h('button',{class:'btn dark',type:'button',onclick:()=>{answer(false);advance();}},'Not yet'),
    h('button',{class:'btn primary',type:'button',onclick:()=>{answer(true);advance();}},'I knew it'));
   S.keys=e=>{if(e.key==='Enter'){answer(true);advance();}else if(e.key==='Backspace'||e.key.toLowerCase()==='n'){answer(false);advance();}};
  }
 }else{
  const pickOpt=oi=>{if(multi){if(c.sel.has(oi))c.sel.delete(oi);else c.sel.add(oi);}else{c.sel=new Set([oi]);}render();};
  const ready=multi?c.sel.size===q.c.length:c.sel.size===1;
  const check=()=>{c.phase='shown';answer(setEq(c.sel,q.c));render();};
  body=optList(q,c.order,c.sel,{reveal:shown,pick:shown?null:pickOpt});
  if(!shown){
   actions=h('div',{class:'row'},h('button',{class:'btn primary',type:'button',disabled:!ready,onclick:check},'Check'),
    h('button',{class:'btn dark',type:'button',onclick:()=>{c.sel=new Set();check();}},'I don’t know'));
   S.keys=e=>{const i=optKey(e,c.order.length);if(i>=0)pickOpt(c.order[i]);else if(e.key==='Enter'&&ready)check();};
  }else{
   actions=h('div',{class:'row'},h('button',{class:'btn primary',type:'button',onclick:advance},s.queue.length?'Next question':'Finish round'));
   S.keys=e=>{if(e.key==='Enter')advance();};
  }
 }
 const verdict=shown&&!flash?h('p',{class:'verdict '+(c.ok?'ok':'bad'),role:'status'},icon(c.ok?'check':'cross'),c.ok?'Right.':'Not quite. This one comes back in a moment.'):null;
 return h('section',{class:'sess narrow',style:{'--c':t.color}},
  h('div',{class:'shead'},h('span',{class:'chip'},h('span',{class:'dot'}),t.name),pill(q),
   h('span',{class:'sp'},h('span',{class:'small muted'},(s.done+1)+' / '+total),starBtn(q))),
  h('div',{class:'prog'},h('i',{style:{width:(s.done/total*100)+'%'}})),
  h('h1',{class:'q'},q.q),
  multi&&!shown&&!flash?h('p',{class:'hint'},'Select '+q.c.length+' answers.'):null,
  imgs(q),
  body||h('div',{style:{height:'28px'}}),
  verdict,
  shown?why(q):null,
  shown&&flash&&!q.e&&!q.c.length?h('p',{class:'muted',style:{marginBottom:'22px'}},'No marked answer was found for this imported question.'):null,
  actions,
  h('p',{class:'tiny',style:{marginTop:'26px'}},flash?'Keys: Enter shows the answer, then Enter = I knew it, N = Not yet.':'Keys: 1–'+c.order.length+' or A–'+String.fromCharCode(64+c.order.length)+' select, Enter checks.'));
};
VIEWS.done=function(){
 const s=S.sess,c=counts(questions());
 return h('section',{class:'sess narrow center',style:{paddingTop:'72px'}},
  h('p',{class:'eyebrow'},s.mode==='learn'?'Learning round finished':'Quiz round finished'),
  h('p',{class:'big',style:{margin:'10px 0 6px'}},s.right),
  h('p',{class:'muted'},(s.right===1?'answer right':'answers right')+(s.wrong?' · '+s.wrong+' missed and repeated':'')),
  h('div',{class:'narrow',style:{maxWidth:'420px',margin:'34px auto 0'}},bar(c),h('p',{class:'small muted',style:{marginTop:'10px'}},c.known+' known · '+c.shaky+' shaky · '+c.new+' new')),
  h('div',{class:'row',style:{justifyContent:'center',marginTop:'36px'}},
   h('button',{class:'btn primary',type:'button',onclick:()=>startSession(s.mode,s.o.list?{}:s.o)},'Next round'),
   h('button',{class:'btn dark',type:'button',onclick:()=>go('home')},'Home')));
};

/* ───────── exam ───────── */
VIEWS.exam=function(){
 if(!S.exam)return examSetup();
 const x=S.exam,q=x.qs[x.i],t=T[q.t]||T.imp,sel=x.ans[q.id]||(x.ans[q.id]=new Set()),multi=q.c.length>1;
 const pickOpt=oi=>{if(multi){if(sel.has(oi))sel.delete(oi);else sel.add(oi);}else{sel.clear();sel.add(oi);}render();};
 const timer=h('span',{class:'timer',role:'timer','aria-label':'Time left'});
 const upd=()=>{const left=Math.max(0,Math.round((x.end-Date.now())/1000));timer.textContent=Math.floor(left/60)+':'+('0'+left%60).slice(-2);timer.style.color=left<120?'var(--bad)':'';if(left<=0)finishExam();};
 const move=d=>{x.i=Math.max(0,Math.min(x.qs.length-1,x.i+d));render();window.scrollTo(0,0);};
 const finish=()=>{const open=x.qs.filter(k=>!(x.ans[k.id]&&x.ans[k.id].size)).length;if(!open||confirm(open+' questions are unanswered. Finish anyway?'))finishExam();};
 S.keys=e=>{const i=optKey(e,x.order[q.id].length);if(i>=0)pickOpt(x.order[q.id][i]);else if(e.key==='Enter'||e.key==='ArrowRight')move(1);else if(e.key==='ArrowLeft')move(-1);};
 const el=h('section',{class:'sess narrow',style:{'--c':t.color}},
  h('div',{class:'shead'},h('span',{class:'chip',style:{'--c':'#f5f5f7'}},'Exam'),h('span',{class:'small muted'},'Question '+(x.i+1)+' of '+x.qs.length),h('span',{class:'sp'},timer)),
  h('div',{class:'prog'},h('i',{style:{width:((x.i+1)/x.qs.length*100)+'%',background:'var(--tx)'}})),
  h('h1',{class:'q'},q.q),
  multi?h('p',{class:'hint'},'Select '+q.c.length+' answers.'):null,
  imgs(q),
  optList(q,x.order[q.id],sel,{pick:pickOpt}),
  h('div',{class:'spread'},
   h('div',{class:'row'},h('button',{class:'btn dark',type:'button',disabled:x.i===0,onclick:()=>move(-1)},'Back'),
    x.i<x.qs.length-1?h('button',{class:'btn primary',type:'button',onclick:()=>move(1)},'Next'):h('button',{class:'btn primary',type:'button',onclick:finish},'Finish exam')),
   x.i<x.qs.length-1?h('button',{class:'btn ghost',type:'button',onclick:finish},'Finish exam'):null),
  h('div',{class:'pal','aria-label':'All questions'},x.qs.map((k,i)=>h('button',{type:'button',class:(x.ans[k.id]&&x.ans[k.id].size?'done':'')+(i===x.i?' cur':''),'aria-label':'Question '+(i+1)+(x.ans[k.id]&&x.ans[k.id].size?', answered':''),onclick:()=>{x.i=i;render();window.scrollTo(0,0);}},i+1))));
 upd();S.tick=setInterval(upd,1000);
 return el;
};
function examSetup(){
 const avail=questions().filter(gradable);
 const sizes=[20,40,60].filter(n=>n<=avail.length);if(!sizes.length)sizes.push(avail.length);
 if(!S.examN||sizes.indexOf(S.examN)<0)S.examN=sizes[Math.min(1,sizes.length-1)];
 return h('section',{class:'sess narrow',style:{paddingTop:'56px'}},
  h('p',{class:'eyebrow'},'Exam simulation'),
  h('h1',{class:'h2',style:{marginTop:'6px'}},'Test yourself under exam conditions.'),
  h('p',{class:'muted',style:{maxWidth:'600px'}},'Random questions from all topics, one minute per question, no feedback until the end. Afterwards you see your score, your weakest topics and every mistake with its explanation.'),
  h('div',{class:'row',style:{margin:'30px 0'}},h('span',{class:'small muted'},'Questions'),
   h('div',{class:'seg',role:'group','aria-label':'Number of questions'},sizes.map(n=>h('button',{type:'button',class:S.examN===n?'on':'','aria-pressed':String(S.examN===n),onclick:()=>{S.examN=n;render();}},n)))),
  h('p',{class:'small muted',style:{marginBottom:'26px'}},S.examN+' questions · '+S.examN+' minutes · target 70% (my own practice target, not an official pass mark)'),
  h('button',{class:'btn primary',type:'button',onclick:()=>{
   const qs=shuffle(avail).slice(0,S.examN),order={};qs.forEach(q=>order[q.id]=shuffle(q.o.map((_,i)=>i)));
   S.exam={qs:qs,order:order,ans:{},i:0,start:Date.now(),end:Date.now()+S.examN*60000};go('exam');}},'Start exam'));
}
function finishExam(){
 const x=S.exam;if(!x)return;clearInterval(S.tick);
 const items=x.qs.map(q=>{const sel=x.ans[q.id]||new Set(),ok=setEq(sel,q.c);mark(q,ok);return {q:q,order:x.order[q.id],sel:sel,ok:ok};});
 S.result={items:items,right:items.filter(i=>i.ok).length,secs:Math.round((Math.min(Date.now(),x.end)-x.start)/1000)};
 S.exam=null;go('result');
}
VIEWS.result=function(){
 const r=S.result,n=r.items.length,pct=Math.round(r.right/n*100),pass=pct>=70,wrong=r.items.filter(i=>!i.ok);
 const per=TOPICS.map(t=>{const it=r.items.filter(i=>i.q.t===t.id);return {t:t,n:it.length,r:it.filter(i=>i.ok).length};}).filter(p=>p.n).sort((a,b)=>a.r/a.n-b.r/b.n);
 return h('section',{class:'narrow',style:{paddingTop:'64px'}},
  h('div',{class:'center'},
   h('p',{class:'eyebrow'},'Exam result'),
   h('p',{class:'big',style:{margin:'8px 0',color:pass?'var(--ok)':'var(--warn)'}},pct+'%'),
   h('p',{class:'h3'},pass?'Target reached.':'Not there yet.'),
   h('p',{class:'muted',style:{marginTop:'6px'}},r.right+' of '+n+' right · '+Math.floor(r.secs/60)+' min '+r.secs%60+' s · target 70%'),
   h('div',{class:'row',style:{justifyContent:'center',marginTop:'28px'}},
    wrong.length?h('button',{class:'btn primary',type:'button',onclick:()=>startSession('quiz',{list:wrong.map(i=>i.q)})},'Practise my mistakes'):null,
    h('button',{class:'btn '+(wrong.length?'dark':'primary'),type:'button',onclick:()=>{S.exam=null;go('exam');}},'New exam'),
    h('button',{class:'btn dark',type:'button',onclick:()=>go('home')},'Home'))),
  h('h2',{class:'h2'},'By topic.'),
  h('div',{class:'card',style:{gap:'16px'}},per.map(p=>h('div',{style:{'--c':p.t.color}},
   h('div',{class:'spread'},h('span',{style:{display:'inline-flex',alignItems:'center',gap:'10px'}},h('span',{class:'dot'}),p.t.name),h('span',{class:'small muted'},p.r+' / '+p.n)),
   h('div',{class:'bar thin',style:{marginTop:'8px'}},h('i',{style:{width:(p.r/p.n*100)+'%',background:'var(--c)'}}))))),
  wrong.length?[h('h2',{class:'h2'},'Your mistakes.'),wrong.map(i=>h('div',{class:'card',style:{marginBottom:'14px','--c':(T[i.q.t]||T.imp).color}},
   h('div',{class:'row'},h('span',{class:'chip'},h('span',{class:'dot'}),(T[i.q.t]||T.imp).name),i.sel.size?null:h('span',{class:'pill'},'Not answered')),
   h('h3',{class:'h3',style:{margin:'10px 0 0',whiteSpace:'pre-wrap'}},i.q.q),
   imgs(i.q),optList(i.q,i.order,i.sel,{reveal:true}),why(i.q)))]:null);
};

/* ───────── cheat sheets ───────── */
VIEWS.sheets=function(){
 return h('section',{class:'page'},
  h('h1',{class:'h2'},'Cheat sheets.'),
  h('p',{class:'muted',style:{maxWidth:'640px'}},'Das sind die Dinge, die man einfach auswendig wissen muss. Einmal durchlesen, dann im Quiz festigen.'),
  h('div',{class:'filters'},SHEETS.map(s=>h('button',{class:'fchip',type:'button',style:{'--c':T[s.t].color},onclick:()=>document.getElementById('sh-'+s.id).scrollIntoView({behavior:'smooth'})},h('span',{class:'dot'}),s.title))),
  SHEETS.map(s=>h('article',{class:'sheet',id:'sh-'+s.id,style:{'--c':T[s.t].color}},
   h('h2',{class:'h3',style:{display:'flex',alignItems:'center',gap:'10px'}},h('span',{class:'dot'}),s.title),
   h('p',{class:'note'},s.note),
   h('div',{class:'tblbox',tabindex:'0',role:'region','aria-label':s.title},h('table',null,
    h('thead',null,h('tr',null,s.head.map(x=>h('th',{scope:'col'},x)))),
    h('tbody',null,s.rows.map(r=>h('tr',null,r.map(x=>h('td',null,x))))))))));
};

/* ───────── subnetting trainer ───────── */
function ip2n(s){const p=String(s).trim().split('.');if(p.length!==4)return null;let n=0;for(let i=0;i<4;i++){if(!/^\d{1,3}$/.test(p[i])||+p[i]>255)return null;n=n*256+ +p[i];}return n;}
function n2ip(n){return [Math.floor(n/16777216)%256,Math.floor(n/65536)%256,Math.floor(n/256)%256,n%256].join('.');}
function maskOf(p){return p===0?0:(0xFFFFFFFF<<(32-p))>>>0;}
function newTask(type){
 if(type==='size'){
  const need=[2,6,10,12,14,20,25,28,30,45,50,60,62,90,100,120,126,200,250,300,500,1000,2000][rnd(23)];
  let hb=2;while(Math.pow(2,hb)-2<need)hb++;
  const p=32-hb;
  S.sub={type:type,need:need,hb:hb,p:p,ans:{prefix:'/'+p,mask:n2ip(maskOf(p)),hosts:String(Math.pow(2,hb)-2)},vals:{},checked:false};
 }else{
  const p=Math.random()<.75?24+rnd(7):17+rnd(7);
  const base=[[10,rnd(256)],[172,16+rnd(16)],[192,168]][rnd(3)];
  const ip=((base[0]*256+base[1])*256+rnd(256))*256+1+rnd(254);
  const size=Math.pow(2,32-p),net=Math.floor(ip/size)*size,bc=net+size-1;
  S.sub={type:'addr',ip:ip,p:p,net:net,bc:bc,size:size,ans:{net:n2ip(net),bc:n2ip(bc),first:n2ip(net+1),last:n2ip(bc-1),hosts:String(size-2),mask:n2ip(maskOf(p))},vals:{},checked:false};
 }
}
function subSteps(t){
 const c=x=>h('code',null,x);
 if(t.type==='size')return [
  h('li',null,'Gesucht ist die kleinste Zahl an Host-Bits h, für die 2^h − 2 mindestens ',c(t.need),' ergibt.'),
  h('li',null,'Mit ',c(t.hb-1),' Host-Bits: 2^'+(t.hb-1)+' − 2 = ',c(Math.pow(2,t.hb-1)-2),' → zu wenig. Mit ',c(t.hb),' Host-Bits: 2^'+t.hb+' − 2 = ',c(Math.pow(2,t.hb)-2),' → reicht.'),
  h('li',null,'Prefix = 32 − '+t.hb+' = ',c('/'+t.p),'. Als Maske geschrieben: ',c(t.ans.mask),'.')];
 const mask=t.ans.mask.split('.').map(Number),ipo=n2ip(t.ip).split('.').map(Number),out=[];
 out.push(h('li',null,c('/'+t.p),' heißt: die ersten '+t.p+' Bit sind der Netzanteil. Maske: ',c(t.ans.mask),'.'));
 if(t.p%8===0){
  out.push(h('li',null,'Die Maske endet genau an einer Oktettgrenze: Die ersten '+(t.p/8)+' Oktette sind Netz, der Rest sind Host-Bits. Netzadresse = Host-Teil auf 0, Broadcast = Host-Teil auf 255.'));
 }else{
  const i=Math.floor(t.p/8),blk=256-mask[i],lo=Math.floor(ipo[i]/blk)*blk;
  out.push(h('li',null,'Das interessante Oktett ist Oktett '+(i+1)+' (Maskenwert ',c(mask[i]),'). Blockgröße = 256 − '+mask[i]+' = ',c(blk),'.'));
  out.push(h('li',null,'Die Netze beginnen bei Vielfachen von '+blk+'. Der Wert ',c(ipo[i]),' liegt im Block ',c(lo+' – '+(lo+blk-1)),'.'));
 }
 out.push(h('li',null,'Netzadresse (alle Host-Bits 0): ',c(t.ans.net),'. Broadcast (alle Host-Bits 1, also eine Adresse vor dem nächsten Netz): ',c(t.ans.bc),'.'));
 out.push(h('li',null,'Erster Host = Netzadresse + 1 = ',c(t.ans.first),'. Letzter Host = Broadcast − 1 = ',c(t.ans.last),'.'));
 out.push(h('li',null,'Nutzbare Hosts = 2^'+(32-t.p)+' − 2 = ',c(Number(t.ans.hosts).toLocaleString('de-DE')),'.'));
 return out;
}
VIEWS.subnet=function(){
 if(!S.sub)newTask('addr');
 const t=S.sub;
 const fields=t.type==='size'?[['prefix','Prefix','/26'],['mask','Subnet mask','255.255.255.192'],['hosts','Usable hosts in that subnet','62']]
  :[['net','Network address','192.168.1.0'],['bc','Broadcast address','192.168.1.255'],['first','First usable host','192.168.1.1'],['last','Last usable host','192.168.1.254'],['hosts','Usable hosts','254'],['mask','Subnet mask','255.255.255.0']];
 const norm=(k,v)=>{v=String(v||'').trim();if(k==='hosts')return v.replace(/[.,\s']/g,'');if(k==='prefix')return '/'+v.replace(/^\//,'');return v.replace(/\s/g,'');};
 const right=k=>norm(k,t.vals[k])===t.ans[k];
 const check=()=>{t.checked=true;render();};
 const allOk=t.checked&&fields.every(f=>right(f[0]));
 return h('section',{class:'narrow',style:{paddingTop:'48px','--c':T.ip4.color}},
  h('div',{class:'spread'},h('span',{class:'chip'},h('span',{class:'dot'}),'Subnetting trainer'),
   h('div',{class:'seg',role:'group','aria-label':'Task type'},[['addr','Analyse an address'],['size','Size a subnet']].map(x=>h('button',{type:'button',class:t.type===x[0]?'on':'','aria-pressed':String(t.type===x[0]),onclick:()=>{newTask(x[0]);render();}},x[1])))),
  t.type==='size'
   ?[h('p',{class:'muted',style:{marginTop:'34px'}},'A subnet must hold this many hosts. Find the smallest subnet that fits.'),h('p',{class:'task'},t.need+' hosts')]
   :[h('p',{class:'muted',style:{marginTop:'34px'}},'A host has this address. Work out everything about its subnet.'),h('p',{class:'task'},n2ip(t.ip)+' /'+t.p)],
  h('form',{onsubmit:e=>{e.preventDefault();check();}},
   h('div',{class:'fgrid'},fields.map(f=>{const ok=t.checked&&right(f[0]);return h('div',null,
    h('label',{for:'f-'+f[0]},f[1]),
    h('input',{class:'field'+(t.checked?(ok?' ok':' bad'):''),id:'f-'+f[0],type:'text',inputmode:f[0]==='hosts'?'numeric':'decimal',autocomplete:'off',spellcheck:'false',placeholder:'e.g. '+f[2],value:t.vals[f[0]]||'',oninput:e=>{t.vals[f[0]]=e.target.value;}}),
    h('div',{class:'sol '+(ok?'ok':'bad'),role:t.checked?'status':null},t.checked?(ok?'Correct':'Correct: '+t.ans[f[0]]):''));})),
   h('div',{class:'row'},
    h('button',{class:'btn '+(t.checked?'dark':'primary'),type:'submit'},'Check'),
    h('button',{class:'btn '+(t.checked?'primary':'dark'),type:'button',onclick:()=>{newTask(t.type);render();window.scrollTo(0,0);}},'New task'))),
  t.checked?h('div',{class:'why',style:{marginTop:'28px'}},h('b',null,allOk?'Alles richtig. So kommt man darauf:':'Lösungsweg'),h('ol',{class:'steps'},subSteps(t))):
   h('p',{class:'tiny',style:{marginTop:'24px'}},'Tipp: Die Subnet table in den Cheat sheets zeigt Maske und Blockgröße für jeden Prefix.'));
};

/* ───────── search & bookmarks ───────── */
VIEWS.browse=function(){
 const b=S.browse,all=questions(),list=h('div'),info=h('p',{class:'small muted',style:{marginBottom:'12px'},role:'status'}),filters=h('div',{class:'filters'});
 function chips(){
  const mk=(label,on,fn,color)=>h('button',{class:'fchip'+(on?' on':''),type:'button','aria-pressed':String(on),style:color?{'--c':color}:null,onclick:()=>{fn();chips();fill();}},color?h('span',{class:'dot'}):null,label);
  filters.replaceChildren(
   mk('Bookmarked',b.star,()=>{b.star=!b.star;}),
   ...[['new','New'],['shaky','Shaky'],['known','Known']].map(x=>mk(x[1],b.status===x[0],()=>{b.status=b.status===x[0]?'':x[0];})),
   ...TOPICS.filter(t=>all.some(q=>q.t===t.id)).map(t=>mk(t.name,b.topic===t.id,()=>{b.topic=b.topic===t.id?'':t.id;},t.color)));
 }
 function fill(){
  const words=b.q.toLowerCase().split(/\s+/).filter(Boolean);
  const res=all.filter(q=>{
   if(b.topic&&q.t!==b.topic)return false;if(b.status&&status(q)!==b.status)return false;if(b.star&&!stars[q.id])return false;
   if(!words.length)return true;const hay=(q.q+' '+q.o.join(' ')+' '+(q.e||'')).toLowerCase();return words.every(w=>hay.indexOf(w)>=0);});
  info.textContent=res.length+' of '+all.length+' questions';
  list.replaceChildren(...res.map(q=>{
   const t=T[q.t]||T.imp,open=b.open===q.id;
   return h('div',{class:'item',style:{'--c':t.color}},
    h('button',{class:'head',type:'button','aria-expanded':String(open),onclick:()=>{b.open=open?null:q.id;fill();}},h('span',{class:'dot'}),h('span',{class:'t'},q.q),stars[q.id]?h('span',{style:{color:'var(--warn)',display:'grid'}},icon('starOn')):null,pill(q)),
    open?h('div',{class:'body'},imgs(q),
     q.o.length?h('ul',null,q.o.map((o,i)=>{const ok=q.c.indexOf(i)>=0;return h('li',{class:ok?'ok':''},ok?'✓ ':'– ',o);})):null,
     why(q),
     h('div',{class:'row'},starBtn(q,fill),h('button',{class:'btn dark sm',type:'button',onclick:()=>startSession('quiz',{list:[q]})},'Quiz this question'))):null);
  }));
  if(!res.length)list.append(h('p',{class:'muted',style:{padding:'24px 0'}},'Nothing matches. Try fewer words or remove a filter.'));
 }
 chips();fill();
 return h('section',{class:'narrow',style:{paddingTop:'8px'}},
  h('h1',{class:'h2',style:{marginTop:'44px'}},'Search.'),
  h('input',{class:'field',type:'search',placeholder:'Search questions, answers and explanations','aria-label':'Search questions',value:b.q,oninput:e=>{b.q=e.target.value;fill();}}),
  filters,info,list);
};

/* ───────── import ───────── */
function parseHtml(html){
 const doc=new DOMParser().parseFromString(html,'text/html'),out=[];let cur=null;
 const txt=el=>{const c=el.cloneNode(true);c.querySelectorAll('br').forEach(b=>b.replaceWith('\n'));c.querySelectorAll('script,style').forEach(b=>b.remove());return c.textContent.replace(/ /g,' ').replace(/[ \t]+/g,' ').replace(/\s*\n\s*/g,'\n').trim();};
 const red=el=>{const s=((el.getAttribute('style')||'')+';color:'+(el.getAttribute('color')||'')).toLowerCase().replace(/\s+/g,'');return /color:(red|#f00|#ff0000|rgb\(255,0,0\))(;|$)/.test(s);};
 const liOk=li=>/correct/i.test(li.className||'')||!!li.querySelector('[class*="correct"]')||red(li)||Array.prototype.some.call(li.querySelectorAll('[style],font'),red);
 const pics=el=>(el.tagName==='IMG'?[el]:Array.from(el.querySelectorAll('img'))).map(i=>i.getAttribute('src')||'').filter(s=>/^https:\/\//i.test(s));
 const isBox=el=>/message_box|explan/i.test(typeof el.className==='string'?el.className:'');
 (function walk(node){
  for(const el of Array.from(node.children)){
   const tag=el.tagName;
   if(/^(SCRIPT|STYLE|NAV|FORM|HEADER|FOOTER|ASIDE|NOSCRIPT|IFRAME)$/.test(tag))continue;
   if(isBox(el)){if(cur){const t=txt(el).replace(/^Explanation:?\s*/i,'');if(t)cur.e=(cur.e?cur.e+'\n':'')+t;cur.img.push(...pics(el));}continue;}
   if(tag==='UL'||tag==='OL'){if(cur)for(const li of Array.from(el.children)){if(li.tagName!=='LI')continue;const t=txt(li);if(!t)continue;if(liOk(li))cur.c.push(cur.o.length);cur.o.push(t);}continue;}
   if(tag==='TABLE'){if(cur){const rows=Array.from(el.querySelectorAll('tr')).map(r=>Array.from(r.children).map(txt).filter(Boolean).join(' → ')).filter(Boolean);if(rows.length)cur.e=(cur.e?cur.e+'\n':'')+rows.join('\n');cur.img.push(...pics(el));}continue;}
   if(tag==='IMG'){if(cur)cur.img.push(...pics(el));continue;}
   if(tag==='PRE'){if(cur&&!cur.o.length)cur.q+='\n'+txt(el);continue;}
   if(tag==='P'){
    const t=txt(el),m=/^(\d{1,3})\.\s+(\S[\s\S]*)$/.exec(t);
    if(m){cur={q:m[2],o:[],c:[],e:'',img:pics(el)};out.push(cur);}
    else if(cur){
     /* an unnumbered paragraph after a finished answer list is another variant of the same question */
     if(t&&cur.o.length){const same=t.length<40,b=cur.b||cur.q;cur={q:same?b:t,b:same?b:null,o:[],c:[],e:'',img:same?cur.img.slice():pics(el),v:1};out.push(cur);}
     else{if(t&&!cur.o.length&&!cur.e)cur.q+='\n'+t;cur.img.push(...pics(el));}
    }
    continue;
   }
   if(/^H[1-6]$/.test(tag))continue;
   walk(el);
  }
 })(doc.body);
 for(let i=out.length-2;i>=0;i--)if(out[i+1].v&&!out[i].e)out[i].e=out[i+1].e;
 const seen={};
 return out.filter(q=>q.q.length>8&&!(q.v&&!q.o.length)).map(q=>({id:'i'+hash(q.q+'|'+q.o.join('|')),t:'imp',q:q.q,o:q.o,c:q.c,e:q.e,img:q.img.filter((s,i,a)=>a.indexOf(s)===i)})).filter(q=>seen[q.id]?false:(seen[q.id]=1));
}
VIEWS.import=function(){
 const r=S.imp;
 const zone=h('div',{class:'paste',contenteditable:'true',role:'textbox','aria-label':'Paste copied questions here',spellcheck:'false',
  onpaste:e=>{e.preventDefault();const cd=e.clipboardData;const html=cd.getData('text/html');
   if(!html){S.imp={err:'The clipboard only contained plain text, so the correct answers are not marked. Copy directly from the web page in your browser and paste again.'};}
   else{const qs=parseHtml(html);S.imp=qs.length?{qs:qs}:{err:'No numbered questions were found in what you pasted.'};}
   render();},
  onbeforeinput:e=>{if(e.inputType&&e.inputType.indexOf('insertFromPaste')<0)e.preventDefault();}},'Click here, then paste (⌘V)');
 return h('section',{class:'narrow',style:{paddingTop:'8px'}},
  h('h1',{class:'h2',style:{marginTop:'44px'}},'Import questions.'),
  h('p',{class:'muted'},'Bring in questions from a web page for your own private study. They are stored only in this browser.'),
  h('ol',{class:'steps',style:{margin:'18px 0 24px'}},
   h('li',null,'Open the page with the questions in your browser.'),
   h('li',null,'Select everything (⌘A) and copy it (⌘C).'),
   h('li',null,'Click the box below and paste (⌘V).')),
  zone,
  r&&r.err?h('p',{style:{color:'var(--bad)',marginTop:'16px'},role:'alert'},r.err):null,
  r&&r.qs?h('div',{class:'card',style:{marginTop:'16px'}},
   h('p',{class:'h3'},r.qs.length+' questions found'),
   h('p',{class:'muted'},r.qs.filter(gradable).length+' with marked answers (usable in quiz and exam) · '+r.qs.filter(q=>!gradable(q)).length+' as reveal-only cards · '+r.qs.filter(q=>q.img.length).length+' with pictures (need an Internet connection)'),
   h('div',{class:'row',style:{marginTop:'12px'}},
    h('button',{class:'btn primary',type:'button',onclick:()=>{const ids={};imported.forEach(q=>ids[q.id]=1);imported=imported.concat(r.qs.filter(q=>!ids[q.id]));store.set('imported',imported);pool='all';store.set('pool',pool);S.imp=null;S.note='Imported. Your question pool now contains both sets.';go('home');}},'Add to my trainer'),
    h('button',{class:'btn dark',type:'button',onclick:()=>{S.imp=null;render();}},'Discard'))):null,
  imported.length?h('div',{class:'spread',style:{marginTop:'36px'}},h('span',{class:'muted'},imported.length+' imported questions are in your trainer.'),
   h('button',{class:'btn dark sm',type:'button',onclick:()=>{if(confirm('Remove all imported questions?')){imported=[];pool='builtin';store.set('imported',imported);store.set('pool',pool);render();}}},'Remove imported')):null);
};

window.__ccna={parseHtml:parseHtml,BUILTIN:BUILTIN,go:go};
render();
})();
