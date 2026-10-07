// Pestañas, lista, buscador, copia de seguridad y teclado
function setView(v){vw=v;const m=v=='map',sm=m||DESK();document.querySelector('.mw').style.display=document.querySelector('.lg').style.display=sm?'':'none';$('#gm').hidden=sm?!$('#gm').textContent:true;$('#ls').style.display=v=='list'?'':'none';$('#pv').style.display=v=='prov'?'':'none';$('#vmap').classList.toggle('on',m);$('#vlist').classList.toggle('on',v=='list');$('#vprov').classList.toggle('on',v=='prov');if(v=='list')renderList();else if(v=='prov'){if(!PV)buildProv();else updProv()}else vb();if(DESK())vb()}
function renderList(){const box=$('#ls');box.textContent='';const fb=document.createElement('div');fb.className='fl';
[['all','Todos'],['v','He estado'],['w','Quiero ir'],['n','Sin pisar']].forEach(([k,t])=>{const b=document.createElement('button');b.textContent=t;if(k==flt)b.className='on';b.onclick=()=>{flt=k;renderList()};fb.appendChild(b)});box.appendChild(fb);let any=0;
ZN.forEach((zn,g)=>{const tot=ALL.filter(z=>z.g==g),zs=tot.filter(z=>flt=='all'||(flt=='n'?!S.z[z.id]:S.z[z.id]==flt)).sort((a,b)=>a.n.localeCompare(b.n,'es'));if(!zs.length)return;any=1;
const h=document.createElement('div');h.className='lh';h.textContent=zn+' · '+tot.filter(z=>S.z[z.id]=='v').length+'/'+tot.length;box.appendChild(h);
zs.forEach(z=>{const r=document.createElement('div'),n=document.createElement('button');r.className='lr';n.className='nm';n.textContent=z.n;n.onclick=()=>pick(z.id);r.appendChild(n);
[['v','He estado'],['w','Quiero ir']].forEach(([k,t])=>{const q=document.createElement('button');q.className='q'+(S.z[z.id]==k?' on '+k:'');q.textContent=t;q.onclick=()=>mark(z.id,k);r.appendChild(q)});box.appendChild(r)})});
if(!any){const p=document.createElement('p');p.className='mu';p.textContent='Nada que mostrar con este filtro.';box.appendChild(p)}}
$('#vmap').onclick=()=>setView('map');
$('#vprov').onclick=()=>setView('prov');
$('#vlist').onclick=()=>setView('list');
$('#cp').onclick=()=>{try{navigator.clipboard.writeText($('#cd').value);toast('Código copiado')}catch(e){$('#cd').select()}};
$('#ld').onclick=()=>{try{const n=JSON.parse(atob($('#cd').value.trim()));if(!n||typeof n.z!='object')throw 0;S=clean(n);save();ALL.forEach(paint);upd();toast('Mapa cargado')}catch(e){toast('Código no válido')}};
function srch(){const q=norm($('#q').value.trim()),box=$('#sr');box.textContent='';if(!q)return;
const h=[...ALL.map(z=>[z.n,ZN[z.g],()=>pick(z.id)]),...Object.entries(EAT).flatMap(([id,a])=>a.map(e=>[e.n,'Dónde comer · '+ALL.find(z=>z.id==id).n,()=>pick(id)])),...Object.keys(RI).map(k=>[k+' · '+RI[k][1],RI[k][0],()=>pickRoad(k)])].map(a=>[norm(a[0]).indexOf(q),a]).filter(a=>a[0]>=0).sort((a,b)=>a[0]-b[0]).slice(0,6);
if(!h.length){box.textContent='Sin resultados';return}
h.forEach(([,a])=>{const b=document.createElement('button'),m=document.createElement('small');b.append(a[0]);m.textContent=a[1];b.append(m);b.onclick=()=>{a[2]();$('#q').value='';box.textContent='';document.querySelector('.mw').scrollIntoView({behavior:'smooth',block:'start'})};box.appendChild(b)})}
$('#q').addEventListener('input',srch);
$('#q').addEventListener('keydown',e=>{if(e.key=='Enter'){const b=document.querySelector('#sr button');b&&b.click()}});
addEventListener('resize',vb);
matchMedia('(min-width:900px)').addEventListener('change',()=>{setView(vw);vb()});
addEventListener('keydown',e=>{if(e.key=='Escape'&&$('#sh').classList.contains('o'))$('#x').click();else if(e.target.tagName!='INPUT'&&e.target.tagName!='TEXTAREA'&&(vw=='map'||DESK())){if(e.key=='+'||e.key=='=')zoom(1.6);else if(e.key=='-')zoom(1/1.6)}});
