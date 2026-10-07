// Estado: zonas construidas, progreso guardado y normalización
const Z=ZONAS.map(([id,n,l,g,la,lo,c])=>{const[x,y]=pr(la,lo);return{id,n,l,g,x,y,la,lo,t:T1.has(id)?1:0,c:c||'',cur:CUR[id]||[],ly:LEY[id]||[]}});
const R={id:'resto',n:'Resto de la provincia',g:6,ly:[],c:'Ciudad Rodrigo, Béjar, La Alberca, las Arribes... Márcala cuando salgas de la zona de la capital.'},ALL=[...Z,R];
PRV.m.forEach(m=>{m.k='m'+m.ine;m.z=ALFOZ[m.n]||null;m.cap=m.n=='Salamanca';m.R=m.r.map(decR);m.P=m.ped.map(p=>({n:p,k:'p'+m.ine+':'+slug(p),m}))});
const PKEYS=new Set();
PRV.m.forEach(m=>{if(!m.z&&!m.cap)PKEYS.add(m.k);m.P.forEach(p=>PKEYS.add(p.k))});
const PALL=PRV.m.filter(m=>!m.cap),PEDS=PRV.m.flatMap(m=>m.P);
const OKID=new Set(ALL.map(z=>z.id));
function clean(o){const z={};if(o&&typeof o.z=='object'&&o.z)for(const k in o.z){if(OKID.has(k)&&(o.z[k]=='v'||o.z[k]=='w'))z[k]=o.z[k]}const p={};if(o&&o.p&&typeof o.p=='object')for(const k in o.p){if(PKEYS.has(k)&&(o.p[k]=='v'||o.p[k]=='w'))p[k]=o.p[k]}const gv=Array.isArray(o&&o.gv)?[...new Set(o.gv.filter(k=>typeof k=='string'&&(z[k]=='v'||p[k]=='v')))]:[];return{z,f:o&&o.f?1:0,t:o&&+o.t>0?+o.t:0,gv,p}}
const BODY=o=>({z:o.z,f:o.f,t:o.t||0,gv:o.gv||[],p:o.p||{},v:1});
let S={z:{},f:0},vw='map',flt='all',cur=null,tt,moved=0,d0=0,V={x:131,y:200,w:150,h:180};
if(DESK())V.w=190;
try{S=JSON.parse(localStorage.getItem('charro2'))||S}catch(e){}
S=clean(S);
const keep=()=>{try{localStorage.setItem('charro2',JSON.stringify(S))}catch(e){}};
