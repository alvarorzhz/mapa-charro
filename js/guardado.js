// Guardado en la cuenta de Claude (capacidad db) con copia local
const CL={ref:null,busy:0,pend:0,last:'',tm:0,retry:0};
function setSync(k){const m={local:['Guardado en este navegador',''],sync:['Conectando con tu cuenta…','sy'],ok:['Guardado en tu cuenta','ok'],ro:['Solo lectura: tu progreso se guarda en este navegador',''],err:['No se pudo guardar en tu cuenta; queda en este navegador','er']}[k];const e=$('#sv');e.textContent=m[0];e.className='svs '+m[1]}
async function flush(){if(!CL.ref)return;if(CL.busy){CL.pend=1;return}const body=BODY(S),j=JSON.stringify(body);if(j===CL.last)return;CL.busy=1;
try{await CL.ref.set(body);CL.last=j;CL.retry=0;setSync('ok')}catch(e){const c=e&&e.code;if(c=='invalid_argument'||c=='not_granted'||c=='revoked'||c=='capability_disabled'||c=='capability_removed'){CL.ref=null;setSync('ro')}else if(c=='unavailable'&&!CL.retry){CL.retry=1;CL.busy=0;setTimeout(flush,600+Math.random()*900);return}else setSync('err')}
CL.busy=0;if(CL.pend){CL.pend=0;flush()}}
const save=()=>{S.t=Date.now();keep();if(CL.ref){clearTimeout(CL.tm);CL.tm=setTimeout(flush,700)}};
function applyCloud(c){S=c;keep();ALL.forEach(paint);upd()}
async function cloudInit(){setSync('local');try{if(!window.claude||!claude.use)return;const[db,user]=await Promise.all([claude.use('db'),claude.use('user')]);if(!db||!user)return;const id=await user.id();if(!id)return;
setSync('sync');const ref=db.doc('data/users/'+id+'/progreso');let snap;try{snap=await ref.get()}catch(e){if(e&&e.code=='unavailable'){await new Promise(r=>setTimeout(r,800));try{snap=await ref.get()}catch(e2){setSync('err');return}}else{setSync(e&&e.code=='invalid_argument'?'ro':'local');return}}
CL.ref=ref;const c=snap.exists?clean(snap.data()):null;
if(c){CL.last=JSON.stringify(BODY(c));if((c.t||0)>=(S.t||0))applyCloud(c);else flush();}else if(Object.keys(S.z).length||S.f){if(!S.t)S.t=Date.now();keep();flush()}
if(!CL.busy)setSync('ok');
ref.onSnapshot(sn=>{if(!sn.exists||sn.metadata.hasPendingWrites)return;const n=clean(sn.data());if((n.t||0)>(S.t||0)){CL.last=JSON.stringify(BODY(n));applyCloud(n);toast('Progreso actualizado desde otro dispositivo')}},()=>{});
}catch(e){console.error(e);setSync('local')}}
