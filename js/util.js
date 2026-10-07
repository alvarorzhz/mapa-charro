// Utilidades comunes: proyección, DOM, SVG y geometría
const pr=(la,lo)=>[200+(lo+5.671)*1850.2,240-(la-40.985)*2446.4];
const nrm=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const slug=s=>nrm(s).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const decR=r=>{const o=[];let a=0,b=0;for(let i=0;i<r.length;i+=2){a+=r[i];b+=r[i+1];o.push([a/1000,b/1000])}return o};
const $=s=>document.querySelector(s),NS='http://www.w3.org/2000/svg',svg=$('#m');
const mapAR=()=>{const w=svg.clientWidth,h=svg.clientHeight;return w&&h?h/w:1.2};
const DESK=()=>matchMedia('(min-width:900px)').matches;
const mk=(t,a,p)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);p&&p.appendChild(e);return e};
const toast=m=>{const t=$('#ts');t.textContent=m;t.className='on';clearTimeout(tt);tt=setTimeout(()=>t.className='',1700)};
const f1=q=>q[0].toFixed(1)+' '+q[1].toFixed(1),mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
function clip(P,a,b){const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,nx=b[0]-a[0],ny=b[1]-a[1],f=p=>(p[0]-mx)*nx+(p[1]-my)*ny,o=[];
for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length],fp=f(p),fq=f(q);if(fp<=0)o.push(p);if(fp*fq<0){const t=fp/(fp-fq);o.push([p[0]+t*(q[0]-p[0]),p[1]+t*(q[1]-p[1])])}}return o}
const inPoly=(P,la,lo)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[0]>la)!=(b[0]>la)&&lo<(b[1]-a[1])*(la-a[0])/(b[0]-a[0])+a[1])c=!c}return c};
const dkm=(a,b,c,d)=>Math.hypot((a-c)*111.2,(b-d)*84.2);
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
