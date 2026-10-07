// Botón Estoy aquí (geolocalización)
let LOC=null;
function whereIs(la,lo){for(const id in POLY)if(inPoly(POLY[id],la,lo))return id;
const near=g=>Z.filter(z=>g(z.g)).map(z=>[dkm(la,lo,z.la,z.lo),z.id]).sort((a,b)=>a[0]-b[0])[0];
const c=near(g=>g<5);if(c&&c[0]<.4)return c[1];const p=near(g=>g==5);if(p&&p[0]<3.5)return p[1];return inPoly(PROV,la,lo)?'resto':null}
function hereBanner(id){const h=$('#here'),live=LOC&&LOC.id==id&&Date.now()-LOC.t<18e5,gv=(S.gv||[]).includes(id);h.hidden=!(live||gv);if(!live&&!gv)return;
if(live){h.className='here';h.textContent=(S.z[id]=='v'?'Estás aquí ahora mismo.':'Estás aquí ahora mismo: márcalo con «He estado» y quedará pisado con GPS.')+(LOC.acc>1500?' Ojo: la ubicación es poco precisa (±'+Math.round(LOC.acc/100)/10+' km).':'')}
else{h.className='here ok';h.textContent='✓ Pisado estando allí, con GPS'}}
function drawMe(la,lo,acc){const g=$('#me');g.textContent='';const[x,y]=pr(la,lo);if(x<0||x>400||y<0||y>480)return;const r=Math.max(.5,acc/1000*22);
mk('circle',{cx:x,cy:y,r,fill:'var(--auv)','fill-opacity':.12,stroke:'var(--auv)','stroke-opacity':.5,'stroke-width':'1px','vector-effect':'non-scaling-stroke'},g);
const m=mk('g',{},g);m.setAttribute('transform','translate('+x+' '+y+')');ME={m,x,y};mk('circle',{r:7,fill:'var(--auv)',class:'mepulse'},m);mk('circle',{r:5,fill:'var(--auv)',stroke:'#fff','stroke-width':2},m);vb()}
let ME=null;
function gmsg(t,tab){const e=$('#gm');e.hidden=!t;e.textContent=t||'';if(t&&tab&&/^https?:/.test(location.protocol)){const a=document.createElement('a');a.href=location.href;a.target='_blank';a.rel='noopener';a.className='gbtn';a.textContent='Abrir en una pestaña aparte';e.appendChild(document.createElement('br'));e.appendChild(a)}if(t)e.scrollIntoView({behavior:'smooth',block:'nearest'})}
const FRAMED=(()=>{try{return window.self!==window.top}catch(e){return true}})();
const GEO_BLOCKED=()=>{try{return !!(document.featurePolicy&&document.featurePolicy.allowsFeature&&!document.featurePolicy.allowsFeature('geolocation'))}catch(e){return false}};
const MSG_FRAME='Dentro de Claude esta app todavía no puede usar tu ubicación: Claude aún no le da ese permiso. Ábrela en una pestaña aparte y la brújula funcionará. Lo que marques allí se guardará en ese navegador.';
$('#zl').onclick=()=>{const b=$('#zl');gmsg('');if(GEO_BLOCKED()){toast('Aquí no puedo usar tu ubicación');gmsg(MSG_FRAME,true);return}if(!navigator.geolocation||!window.isSecureContext){gmsg('Este navegador no permite saber dónde estás.');return}
b.classList.add('busy');b.disabled=true;
navigator.geolocation.getCurrentPosition(p=>{b.classList.remove('busy');b.disabled=false;const la=p.coords.latitude,lo=p.coords.longitude,acc=p.coords.accuracy||0,id=whereIs(la,lo);
let pm=null;if(id=='resto'){pm=PRV.m.find(m=>m.R.some(r=>inPoly(r,la,lo)))||null;if(pm&&pm.z)id=pm.z}
LOC={id,t:Date.now(),acc,pid:pm&&!pm.z&&!pm.cap?pm.k:null};drawMe(la,lo,acc);
if(LOC.pid){toast('Estás en '+pm.n);setView('prov');selP(pm,true);return}
if(!id){gmsg('Estás fuera de la provincia de Salamanca. ¡Aquí te esperamos!');return}
const z=ALL.find(q=>q.id==id);toast(id=='resto'?'Estás en la provincia, fuera del mapa':'Estás en '+z.n);pick(id);
if(id=='resto'||z.g==5){if(ME){V.w=Math.min(V.w,id=='resto'?400:120);V.h=V.w*mapAR();V.x=ME.x-V.w/2;V.y=ME.y-V.h*.3;vb()}}},
e=>{b.classList.remove('busy');b.disabled=false;LOC=null;
toast('No te he podido localizar');if(e.code==1&&FRAMED){gmsg(MSG_FRAME,true);return}gmsg(e.code==1?'No hay permiso para usar tu ubicación. Actívalo en los ajustes de ubicación del navegador y vuelve a pulsar la brújula.':e.code==3?'Ha tardado demasiado en encontrarte. Prueba otra vez, mejor al aire libre.':'No se ha podido calcular tu posición. Prueba otra vez en un momento.')},
{enableHighAccuracy:true,timeout:15000,maximumAge:60000})};
