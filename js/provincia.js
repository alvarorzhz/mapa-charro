// Pestaña Provincia: municipios, pedanías y minimapa
const stM=m=>m.z?S.z[m.z]:(S.p||{})[m.k];
const stK=k=>(S.p||{})[k];
const pedV=m=>m.P.some(p=>stK(p.k)=='v');
let pflt='all',psel=null,PV=null;
function markP(k,s,label){const bf=ach().filter(a=>a.c>=a.m).map(a=>a.id);S.p=S.p||{};S.gv=S.gv||[];
if(S.p[k]==s)delete S.p[k];else{S.p[k]=s;const live=LOC&&LOC.pid&&(LOC.pid==k||(k.startsWith('p'+LOC.pid.slice(1)+':')))&&Date.now()-LOC.t<18e5;
if(s=='v'&&live&&!S.gv.includes(k))S.gv.push(k);if(s=='v'&&S.z.resto!='v'){S.z.resto='v';paint(R)}toast(s=='v'?(live?'¡Vítor! '+label+', con GPS':'¡Vítor! '+label):label+' apuntado')}
if(S.p[k]!='v')S.gv=S.gv.filter(x=>x!=k);save();upd();const nw=ach().filter(a=>a.c>=a.m&&!bf.includes(a.id));if(nw.length)setTimeout(()=>toast('Logro: '+nw[0].n),1900)}
function markM(m,s){if(m.z){mark(m.z,s);updProv();return}markP(m.k,s,m.n)}
function btns(get,set){const w=document.createElement('span');w.className='qb';[['v','He estado'],['w','Quiero ir']].forEach(([k,t])=>{const q=document.createElement('button');q.className='q';q.dataset.s=k;q.textContent=t;q.onclick=e=>{e.stopPropagation();set(k)};w.appendChild(q)});w._get=get;return w}
function paintBtns(w){const s=w._get();w.querySelectorAll('.q').forEach(q=>q.className='q'+(s==q.dataset.s?' on '+s:''))}
function buildProv(){const box=$('#pv');box.textContent='';PV={rows:[],paths:new Map(),secs:[]};
const h=document.createElement('div');h.className='pvh';h.innerHTML='<input id="pq" type="search" placeholder="Buscar pueblo o pedanía..." autocomplete="off" aria-label="Buscar pueblo o pedanía"><div id="pcn" class="pcn"></div>';box.appendChild(h);
// minimapa
const mw=document.createElement('div');mw.className='pmw';box.appendChild(mw);
const sv=document.createElementNS(NS,'svg');sv.id='pm';sv.setAttribute('role','img');sv.setAttribute('aria-label','Mapa de los municipios de la provincia de Salamanca');mw.appendChild(sv);
const zb=document.createElement('div');zb.className='zb';zb.innerHTML='<button aria-label="Acercar">+</button><button aria-label="Alejar">−</button><button aria-label="Ver toda la provincia">⌂</button>';mw.appendChild(zb);
const LO0=-6.94,LA0=41.30,K=100,px=([la,lo])=>[(lo-LO0)*.755*K,(LA0-la)*K],W=1.86*.755*K,Hh=1.07*K;
const PM={x:0,y:0,w:W,h:Hh,W,H:Hh};const pvb=()=>{PM.w=Math.min(W,Math.max(W/8,PM.w));PM.h=PM.w*Hh/W;PM.x=Math.max(0,Math.min(W-PM.w,PM.x));PM.y=Math.max(0,Math.min(Hh-PM.h,PM.y));sv.setAttribute('viewBox',PM.x+' '+PM.y+' '+PM.w+' '+PM.h)};
const defs=mk('defs',{},sv),pt=mk('pattern',{id:'ph2',width:4,height:4,patternUnits:'userSpaceOnUse',patternTransform:'rotate(45)'},defs);mk('rect',{width:4,height:4,style:'fill:var(--b)'},pt);mk('rect',{width:1.6,height:4,style:'fill:var(--gold);opacity:.7'},pt);
const gm=mk('g',{},sv),gc=mk('g',{style:'pointer-events:none'},sv);
const d=R=>R.map(r=>'M'+r.map(q=>px(q).map(v=>v.toFixed(1)).join(' ')).join('L')+'Z').join('');
PRV.m.forEach(m=>{const p=mk('path',{d:d(m.R),class:'pmm'},gm);p.onclick=()=>{if(pmoved<=6)selP(m)};PV.paths.set(m,p)});
PRV.co.forEach(rs=>mk('path',{d:d(rs.map(decR)),class:'pmc'},gc));
let pmoved=0;const PT2=new Map();let d2=0;const ppt=e=>{const r=sv.getBoundingClientRect();return[PM.x+(e.clientX-r.left)/r.width*PM.w,PM.y+(e.clientY-r.top)/r.height*PM.h]};
const pz=(k,cx=PM.x+PM.w/2,cy=PM.y+PM.h/2)=>{const w=Math.min(W,Math.max(W/8,PM.w/k)),r=w/PM.w;PM.x=cx-(cx-PM.x)*r;PM.y=cy-(cy-PM.y)*r;PM.w=w;pvb()};
const [bi,bo,br]=zb.querySelectorAll('button');bi.onclick=()=>pz(1.6);bo.onclick=()=>pz(1/1.6);br.onclick=()=>{PM.x=0;PM.y=0;PM.w=W;pvb()};
sv.addEventListener('wheel',e=>{e.preventDefault();const p=ppt(e);pz(e.deltaY<0?1.25:1/1.25,p[0],p[1])},{passive:false});
sv.addEventListener('pointerdown',e=>{PT2.set(e.pointerId,[e.clientX,e.clientY]);pmoved=0;d2=0});
sv.addEventListener('pointermove',e=>{if(!PT2.has(e.pointerId))return;const o=PT2.get(e.pointerId),n=[e.clientX,e.clientY],r=sv.getBoundingClientRect();
if(PT2.size==2){const q=[...PT2.entries()].find(a=>a[0]!=e.pointerId)[1],dd=Math.hypot(n[0]-q[0],n[1]-q[1]);if(d2){const p=ppt({clientX:(n[0]+q[0])/2,clientY:(n[1]+q[1])/2});pz(dd/d2,p[0],p[1])}d2=dd;pmoved=9}
else{const dx=n[0]-o[0],dy=n[1]-o[1];pmoved+=Math.abs(dx)+Math.abs(dy);if(pmoved>6&&PM.w<W){PM.x-=dx/r.width*PM.w;PM.y-=dy/r.height*PM.h;pvb()}}PT2.set(e.pointerId,n)});
const pu=e=>{PT2.delete(e.pointerId);d2=0};sv.addEventListener('pointerup',pu);sv.addEventListener('pointercancel',pu);
PV.zoomTo=m=>{const ps=m.R.flat().map(px),xs=ps.map(q=>q[0]),ys=ps.map(q=>q[1]),cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2;PM.w=Math.max(W/6,PM.w>W/3?W/3:PM.w);PM.h=PM.w*Hh/W;PM.x=cx-PM.w/2;PM.y=cy-PM.h/2;pvb()};
pvb();
// barra de selección
const sb=document.createElement('div');sb.id='psb';sb.className='psb';sb.innerHTML='<p class="mu" style="margin:0">Toca un municipio del mapa para verlo aquí.</p>';box.appendChild(sb);
// filtros
const fb=document.createElement('div');fb.className='fl';[['all','Todos'],['v','He estado'],['w','Quiero ir'],['n','Sin pisar']].forEach(([k,t])=>{const b=document.createElement('button');b.textContent=t;b.dataset.f=k;b.onclick=()=>{pflt=k;applyPF()};fb.appendChild(b)});box.appendChild(fb);PV.fb=fb;
// resultados de búsqueda
const rs=document.createElement('div');rs.id='prs';box.appendChild(rs);
// comarcas
const lc=document.createElement('div');lc.id='pcl';box.appendChild(lc);
PRV.com.forEach((cn,ci)=>{const det=document.createElement('details');det.className='pcd';const su=document.createElement('summary');det.appendChild(su);const ms=PRV.m.filter(m=>m.c==ci).sort((a,b)=>a.n.localeCompare(b.n,'es'));
const body=document.createElement('div');det.appendChild(body);
ms.forEach(m=>{const g=document.createElement('div');g.className='pg';const r=document.createElement('div');r.className='pr';const nb=document.createElement('button');nb.className='nm';nb.textContent=m.n;nb.onclick=()=>selP(m,true);r.appendChild(nb);
if(m.cap){const s=document.createElement('small');s.className='mu';s.textContent='la capital: se marca por barrios en el mapa';r.appendChild(s)}
else{if(m.z){const s=document.createElement('small');s.className='tagm';s.textContent='en el mapa';nb.appendChild(s)}const w=btns(()=>stM(m),k=>markM(m,k));r.appendChild(w);PV.rows.push({w,m,el:r,g})}
g.appendChild(r);m.P.forEach(p=>{const pr=document.createElement('div');pr.className='pr pd';const pn=document.createElement('span');pn.className='nm';pn.textContent=p.n;pr.appendChild(pn);const w=btns(()=>stK(p.k),k=>markP(p.k,k,p.n));pr.appendChild(w);PV.rows.push({w,p,el:pr,g});g.appendChild(pr)});
body.appendChild(g)});lc.appendChild(det);PV.secs.push({det,su,ms,cn})});
const note=document.createElement('p');note.className='mu pvn';note.textContent='Municipios, pedanías y anejos según el anexo de municipios de Wikipedia; comarcas tradicionales según Llorente Maldonado (1976), que no son oficiales. Lindes de OpenStreetMap, simplificadas.';box.appendChild(note);
$('#pq').addEventListener('input',psearch);updProv()}
function selP(m,zoom){psel=m;const sb=$('#psb');sb.textContent='';const t=document.createElement('div');t.className='pst';const b=document.createElement('b');b.textContent=m.n;const c=document.createElement('small');c.textContent=' · '+PRV.com[m.c]+(m.P.length?' · '+m.P.length+(m.P.length==1?' pedanía':' pedanías'):'');t.append(b,c);sb.appendChild(t);
if(LOC&&LOC.pid==m.k&&Date.now()-LOC.t<18e5){const h=document.createElement('p');h.className='here';h.style.margin='6px 0';h.textContent='Estás en el término de '+m.n+'.';sb.appendChild(h)}
if(m.cap){const p=document.createElement('p');p.className='mu';p.style.margin='4px 0 0';p.textContent='La capital se marca por barrios en la pestaña Mapa.';sb.appendChild(p)}
else{const w=btns(()=>stM(m),k=>markM(m,k));w.classList.add('big');sb.appendChild(w);paintBtns(w);PV.selW=w}
PV.paths.forEach((p,mm)=>p.classList.toggle('sel',mm==m));enlaceVista();if(zoom){PV.zoomTo(m);$('#pm').scrollIntoView({behavior:'smooth',block:'center'})}}
function rowMatch(st){return pflt=='all'||(pflt=='n'?!st:st==pflt)}
function applyPF(){if(!PV)return;PV.fb.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.f==pflt));
const gs=new Map();PV.rows.forEach(r=>{const st=r.w._get(),ok=rowMatch(st);r.el.hidden=!ok;if(ok)gs.set(r.g,1)});
document.querySelectorAll('#pcl .pg').forEach(g=>{g.hidden=!gs.has(g);if(gs.has(g)){const h=g.firstChild;if(h.hidden){h.hidden=false;h.classList.add('ctx')}else h.classList.remove('ctx')}});
PV.secs.forEach(s=>{const any=[...s.det.querySelectorAll('.pg')].some(g=>!g.hidden);s.det.hidden=!any;if(pflt!='all'&&any)s.det.open=true})}
function updProv(){if(!PV)return;PV.rows.forEach(r=>paintBtns(r.w));if(PV.selW)paintBtns(PV.selW);
const capV=Z.some(z=>z.g<5&&S.z[z.id]=='v');
PV.paths.forEach((p,m)=>{const s=m.cap?(capV?'v':''):stM(m);p.setAttribute('class','pmm'+(s=='v'?' v':s=='w'?' w':pedV(m)?' pv':'')+(m==psel?' sel':''))});
const mv=PALL.filter(m=>stM(m)=='v').length,pv=PEDS.filter(p=>stK(p.k)=='v').length,pw=PALL.filter(m=>stM(m)=='w').length+PEDS.filter(p=>stK(p.k)=='w').length;
$('#pcn').textContent=mv+' de '+PALL.length+' pueblos y '+pv+' de '+PEDS.length+' pedanías pisados'+(pw?', '+pw+' por visitar':'');
PV.secs.forEach(s=>{const n=s.ms.filter(m=>!m.cap),v=n.filter(m=>stM(m)=='v').length;s.su.textContent=s.cn+' · '+v+'/'+n.length});
applyPF();if($('#pq').value)psearch()}
function psearch(){const q=nrm($('#pq').value.trim()),rs=$('#prs'),lc=$('#pcl');rs.textContent='';lc.hidden=!!q;PV.fb.hidden=!!q;if(!q)return;
const hits=[...PRV.m.map(m=>({m,n:m.n})),...PEDS.map(p=>({p,m:p.m,n:p.n}))].map(h=>[nrm(h.n).indexOf(q),h]).filter(a=>a[0]>=0).sort((a,b)=>a[0]-b[0]||a[1].n.length-b[1].n.length).slice(0,40);
if(!hits.length){const p=document.createElement('p');p.className='mu';p.textContent='Ningún pueblo ni pedanía con ese nombre.';rs.appendChild(p);return}
hits.forEach(([,h])=>{const r=document.createElement('div');r.className='pr sr2';const nb=document.createElement('button');nb.className='nm';nb.textContent=h.n;const sm=document.createElement('small');sm.textContent=h.p?'pedanía de '+h.m.n:PRV.com[h.m.c];nb.appendChild(sm);nb.onclick=()=>selP(h.m,true);r.appendChild(nb);
if(h.m.cap&&!h.p){}else{const w=h.p?btns(()=>stK(h.p.k),k=>markP(h.p.k,k,h.p.n)):btns(()=>stM(h.m),k=>markM(h.m,k));paintBtns(w);r.appendChild(w)}rs.appendChild(r)})}
