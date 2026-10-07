// Mapa principal: dibujo de zonas, carreteras, zoom y arrastre
function paint(z){const s=S.z[z.id];
if(z.id=='resto'){$('#rs').className='rs'+(s?' '+s:'');return}
z.e.setAttribute('class','z c'+z.g+(SUB.has(z.id)?' sub':'')+(s?' '+s:'')+(cur==z.id?' sel':''));[z.tx,z.tx2].forEach(t=>t&&t.setAttribute('class','lb'+(s=='v'?' v':'')));z.dt.setAttribute('class','dt'+(s=='v'?' v':''));
if(z.st&&s!='v'){z.st.remove();z.st=0}
if(s=='v'&&!z.st){z.st=mk('g',{class:'st'},z.so);mk('circle',{r:5.5,fill:'none',stroke:'#fff','stroke-width':1.2},z.st);const v=mk('text',{y:2.7,'text-anchor':'middle','font-size':7.5,'font-weight':700,fill:'#fff'},z.st);v.textContent='V'}}
function upd(){const v=Object.values(S.z).filter(x=>x=='v').length,w=Object.values(S.z).filter(x=>x=='w').length;
$('#pg').style.width=v/ALL.length*100+'%';$('#cn').textContent=v+' de '+ALL.length+' zonas pisadas, '+w+' por visitar'+(S.f?'. Rana encontrada 🐸':'');
$('#fr').style.opacity=S.f?1:.45;$('#cd').value=btoa(JSON.stringify(S));try{renderAch();if(vw=='list')renderList();if(vw=='prov')updProv()}catch(e){console.error(e)}}
function vb(){const AR=mapAR(),mw=Math.max(400,480/AR);V.w=Math.min(mw,Math.max(16,V.w));V.h=V.w*AR;V.x=V.w>=400?(400-V.w)/2:Math.max(0,Math.min(400-V.w,V.x));V.y=V.h>=480?(480-V.h)/2:Math.max(0,Math.min(480-V.h,V.y));
svg.setAttribute('viewBox',V.x+' '+V.y+' '+V.w+' '+V.h);const u=V.w/(svg.clientWidth||380);
Z.forEach(z=>{const cw=z.cw/u,ch=z.ch/u,kc=z.t?.64:.6,mx=z.t?13.5:11,f1=Math.min(mx,cw*.92/(z.w1*kc),ch*.85/1.25),f2=z.tx2?Math.min(mx,cw*.92/(z.w2*kc),ch*.85/2.5):0,force=(z.t&&V.w<=260)||cur==z.id;
let fs=Math.max(f1,f2),two=f2>f1;const sh=fs>=8||force;if(sh&&fs<8){fs=z.t?12:10.5;two=!!z.tx2}
const a=two?z.tx2:z.tx,b=two?z.tx:z.tx2;a.style.display=sh?'':'none';if(b)b.style.display='none';z.dt.style.display=sh?'none':'';z.dt.setAttribute('r',2.8*u);
a.style.fontSize=fs*u+'px';a.style.strokeWidth=2.5*u+'px';a.style.fontWeight=z.t?800:600;
z.sg.setAttribute('transform','translate('+z.x.toFixed(2)+' '+z.y.toFixed(2)+') scale('+u+')');z.so.setAttribute('transform','translate(0 '+(sh?-((two?2:1)*fs*.6+6.5):-9)+')')});
document.querySelectorAll('.avp').forEach(e=>e.style.display=V.w<=240?'':'none');AVL.forEach(t=>{let L=0;try{L=t._p.getTotalLength()/u}catch(e){}t.style.display=V.w<=130&&L>t._n*8.5*.52+6?'':'none';t.style.fontSize=8.5*u+'px';t.style.strokeWidth=2.5*u+'px'});
$('#rl').style.fontSize=11*u+'px';SHL.forEach(q=>q.g.setAttribute('transform','translate('+q.x.toFixed(2)+' '+q.y.toFixed(2)+') scale('+u+')'));if(typeof ME!='undefined'&&ME)ME.m.setAttribute('transform','translate('+ME.x.toFixed(2)+' '+ME.y.toFixed(2)+') scale('+u+')')}
function zoom(k,cx=V.x+V.w/2,cy=V.y+V.h/2){const w=Math.min(Math.max(400,480/mapAR()),Math.max(16,V.w/k)),r=w/V.w;V.x=cx-(cx-V.x)*r;V.y=cy-(cy-V.y)*r;V.w=w;vb()}
function build(arr,base){arr.forEach(z=>{let P=base;if(POLY[z.id])P=POLY[z.id].map(q=>pr(q[0],q[1]));else arr.forEach(o=>{if(o!=z)P=clip(P,[z.x,z.y],[o.x,o.y])});
const xs=P.map(q=>q[0]),ys=P.map(q=>q[1]);z.ch=Math.max(...ys)-Math.min(...ys);z.cw=Math.min(Math.max(...xs)-Math.min(...xs),z.ch*1.7);
z.e=mk('polygon',{points:P.map(f1).join(' ').replace(/ (?=\d)/g,' ')},$('#zg'));z.e.setAttribute('points',P.map(q=>q[0].toFixed(1)+','+q[1].toFixed(1)).join(' '));z.e.onclick=()=>{if(moved<=6)pick(z.id)};
z.dt=mk('circle',{cx:z.x,cy:z.y},$('#dg'));const L=z.l.split('|');z.w1=L.join(' ').length;z.w2=L.length>1?Math.max(...L.map(w=>w.length)):0;
z.tx=mk('text',{x:z.x,y:z.y},$('#lg'));mk('tspan',{x:z.x,dy:'.3em'},z.tx).textContent=L.join(' ');
if(L.length>1){z.tx2=mk('text',{x:z.x,y:z.y},$('#lg'));L.forEach((w,i)=>{mk('tspan',{x:z.x,dy:i?'1.1em':'-.2em'},z.tx2).textContent=w})}
z.sg=mk('g',{},$('#sg'));z.so=mk('g',{},z.sg);paint(z)})}
build(Z.filter(z=>z.g==5),[[0,0],[400,0],[400,480],[0,480]]);
build(Z.filter(z=>z.g<5),F.map(q=>pr(q[0],q[1])));
OB.forEach(P=>mk('path',{d:'M'+P.map(q=>f1(pr(q[0],q[1]))).join('L')+'Z',fill:'none',stroke:'var(--line)','stroke-width':'1.8px','vector-effect':'non-scaling-stroke','stroke-linejoin':'round'},$('#ob')));
$('#ol').setAttribute('d','M'+F.map(q=>f1(pr(q[0],q[1]))).join('L')+'Z');
{const rp=RV.map(q=>pr(q[0],q[1]));let d='M'+f1(rp[0])+'L'+f1(mid(rp[0],rp[1]));for(let i=1;i<rp.length-1;i++)d+='Q'+f1(rp[i])+' '+f1(mid(rp[i],rp[i+1]));$('#rv').setAttribute('d',d+'L'+f1(rp[rp.length-1]));
const q=pr(40.9615,-5.6175);$('#rl').setAttribute('x',q[0]);$('#rl').setAttribute('y',q[1])}
const AVL=[],RP=[];
Object.assign(RI,RIA);
try{const sm=P=>{const r=P.map(q=>pr(q[0],q[1])),n=r.length;let d='M'+f1(r[0]);for(let i=0;i<n-1;i++){const a=r[i-1]||r[i],b=r[i],c=r[i+1],e=r[i+2]||c;d+='C'+f1([b[0]+(c[0]-a[0])/6,b[1]+(c[1]-a[1])/6])+' '+f1([c[0]-(e[0]-b[0])/6,c[1]-(e[1]-b[1])/6])+' '+f1(c)}return d};
const at=(w,c,d,o,da)=>Object.assign({d,fill:'none',stroke:c,'stroke-width':w+'px','stroke-linecap':'round','stroke-linejoin':'round','vector-effect':'non-scaling-stroke',opacity:o},da?{'stroke-dasharray':da}:{});
const CC={a:'var(--auv)',n:'var(--nac)',c:'var(--cl)'},W={a:[8,4.2],n:[5.5,2.8],c:[4.5,2.2]},OR=['c','n','a'];
const AC=mk('g',{class:'avp'},$('#rd')),AF=mk('g',{class:'avp'},$('#rd')),AT=mk('g',{class:'avp'},$('#rd'));
AVN.forEach(([nm,k,PS])=>{const els=[];let lid='',lp=null;PS.forEach((P,j)=>{const d=sm(P);els.push(mk('path',at(k=='t'?5.8:4.4,'var(--line)',d,.8),AC));const w=mk('path',at(k=='t'?3.8:2.6,k=='t'?'var(--ronda)':'var(--street)',d,1),k=='t'?AT:AF);els.push(w);if(!j){lid='av'+AVL.length;w.id=lid;lp=w}});
if(nm){const t=mk('text',{class:'avl'},$('#al')),tp=mk('textPath',{startOffset:'50%','text-anchor':'middle'},t);tp.setAttribute('href','#'+lid);tp.textContent=nm.replace(/^Avenida /,'Av. ').replace(/^Paseo /,'P.º ');t._p=lp;t._n=tp.textContent.length;AVL.push(t)}RP.push({nm,els})});
OR.forEach(k=>ROADS.filter(r=>r[0]==k).forEach(([,nm,P])=>{const d=sm(P);RP.push({nm,k,d,els:[mk('path',at(W[k][0],'var(--card)',d,.9),$('#rd'))]})}));
OR.forEach(k=>RP.filter(r=>r.k==k).forEach(r=>r.els.push(mk('path',at(W[k][1],CC[k],r.d,1,k=='n'?'7 4':0),$('#rd')))))}catch(e){console.error(e)}
const SHL=[];
NDS.forEach(([p,k,r])=>{const[x,y]=pr(p[0],p[1]),g=mk('g',{},$('#sd'));mk('circle',{r,fill:'var(--card)',stroke:k=='a'?'var(--auv)':'var(--nac)','stroke-width':2.2},g);SHL.push({g,x,y})});
SHD.forEach(([t,k,la,lo])=>{const[x,y]=pr(la,lo),g=mk('g',{},$('#sd')),w=t.length*5.4+8;mk('rect',{x:-w/2,y:-7,width:w,height:14,rx:3,fill:k=='a'?'var(--auv)':k=='c'?'var(--cl)':'var(--nac)',stroke:'#fff','stroke-width':1},g);
const tx=mk('text',{y:3.3,'text-anchor':'middle','font-size':9,'font-weight':700,fill:'#fff'},g);tx.textContent=t;g.style.pointerEvents='auto';g.style.cursor='pointer';g.onclick=()=>pickRoad(t);SHL.push({g,x,y})});
$('#rb').onclick=()=>{const on=$('#rd').style.display!='none';$('#rd').style.display=$('#al').style.display=$('#sd').style.display=on?'none':'';$('#rb').style.opacity=on?.5:1};
paint(R);
function hl(t){RP.forEach(r=>r.els.forEach(e=>{e.style.opacity=t&&r.nm!=t?.2:''}))}
$('#zi').onclick=()=>zoom(1.6);
$('#zo').onclick=()=>zoom(1/1.6);
$('#zr').onclick=()=>{V=V.w<300?{x:0,y:0,w:9999,h:9999}:{x:131,y:200,w:DESK()?190:150,h:180};vb()};
const pt=e=>{const r=svg.getBoundingClientRect();return[V.x+(e.clientX-r.left)/r.width*V.w,V.y+(e.clientY-r.top)/r.height*V.h]};
svg.addEventListener('wheel',e=>{e.preventDefault();const p=pt(e);zoom(e.deltaY<0?1.25:1/1.25,p[0],p[1])},{passive:false});
const PT=new Map();
svg.addEventListener('pointerdown',e=>{PT.set(e.pointerId,[e.clientX,e.clientY]);moved=0;d0=0});
svg.addEventListener('pointermove',e=>{if(!PT.has(e.pointerId))return;const o=PT.get(e.pointerId),n=[e.clientX,e.clientY],r=svg.getBoundingClientRect();
if(PT.size==2){const q=[...PT.entries()].find(a=>a[0]!=e.pointerId)[1],d=Math.hypot(n[0]-q[0],n[1]-q[1]);if(d0){const p=pt({clientX:(n[0]+q[0])/2,clientY:(n[1]+q[1])/2});zoom(d/d0,p[0],p[1])}d0=d;moved=9}
else{const dx=n[0]-o[0],dy=n[1]-o[1];moved+=Math.abs(dx)+Math.abs(dy);if(moved>6){V.x-=dx/r.width*V.w;V.y-=dy/r.height*V.h;vb()}}
PT.set(e.pointerId,n)});
const up=e=>{PT.delete(e.pointerId);d0=0};
svg.addEventListener('pointerup',up);
svg.addEventListener('pointercancel',up);
