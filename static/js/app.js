/* Interfaz de la Unidad 1. El visualizador se dibuja en el navegador (para que arrastrar cargas sea fluido);
   la calculadora de potencial y la trayectoria se calculan en Python (ver app.py y fisica.py). */
const $=i=>document.getElementById(i),K=8.99,E0=8.854e-12;
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const eng=(x,u)=>{if(!isFinite(x))return'—';if(x===0)return'0 '+u;const p=[[1e-12,'p'],[1e-9,'n'],[1e-6,'µ'],[1e-3,'m'],[1,''],[1e3,'k'],[1e6,'M'],[1e9,'G']];let a=Math.abs(x),c=p[0];for(const q of p)if(a>=q[0])c=q;return(+(x/c[0]).toPrecision(4))+' '+c[1]+u};
const num=(x,d=3)=>(+x.toFixed(d)).toString().replace('.',',');
const outs=(id,a)=>$(id).innerHTML=a.map(([l,v])=>`<div><span>${l}</span><strong>${v}</strong></div>`).join('');
const post=async(u,b)=>{try{const r=await fetch(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});if(!r.ok)return null;return await r.json()}catch(e){return null}};
let ch=[{x:2.2,y:2.2,q:3},{x:4.2,y:2.2,q:-3}];
const F=(x,y)=>{let ex=0,ey=0,v=0;for(const c of ch){const dx=x-c.x,dy=y-c.y,r2=dx*dx+dy*dy+1e-6,r=Math.sqrt(r2);v+=K*c.q/r;const e=K*c.q/(r2*r);ex+=e*dx;ey+=e*dy}return[ex,ey,v]};

/* Tabs */
const upd={t1:()=>draw(),t2:()=>{renderT();calc()},t3:()=>launch()};
function show(id){document.querySelectorAll('section').forEach(s=>s.hidden=s.id!==id);document.querySelectorAll('.tab').forEach(b=>b.setAttribute('aria-selected',b.dataset.t===id));upd[id]()}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>show(b.dataset.t));

/* Unidad 1: visualizador */
const cv=$('cv'),g=cv.getContext('2d'),W=640,H=440,S=100,px=x=>x*S,py=y=>H-y*S;
function draw(){
 const ink=css('--ink'),pos=css('--pos'),neg=css('--neg');
 g.globalAlpha=1;g.fillStyle=css('--panel');g.fillRect(0,0,W,H);
 if($('eq').checked){const dv=+$('dv').value,st=4;g.globalAlpha=.5;
  for(let i=0;i<W;i+=st)for(let j=0;j<H;j+=st){const[ex,ey,v]=F((i+st/2)/S,(H-j-st/2)/S),f=v/dv,d=Math.abs(f-Math.round(f)),gr=Math.hypot(ex,ey)*(st/S)/dv;
   if(gr<.9&&d<gr*.5+.002){g.fillStyle=v>=0?pos:neg;g.fillRect(i,j,st,st)}}
  g.globalAlpha=1}
 if($('fl').checked){g.strokeStyle=ink;g.fillStyle=ink;g.lineWidth=1.1;g.globalAlpha=.8;const hp=ch.some(a=>a.q>0);
  for(const c of ch){if(c.q===0||(hp?c.q<0:c.q>0))continue;const dir=c.q>0?1:-1,n=Math.min(24,Math.max(6,Math.round(8*Math.abs(c.q)))),ar=[];
   for(let k=0;k<n;k++){const a=2*Math.PI*(k+.5)/n;let x=c.x+.07*Math.cos(a),y=c.y+.07*Math.sin(a);g.beginPath();g.moveTo(px(x),py(y));
    for(let s=0;s<2500;s++){const[ex,ey]=F(x,y),m=Math.hypot(ex,ey);if(m<1e-9)break;x+=dir*.02*ex/m;y+=dir*.02*ey/m;g.lineTo(px(x),py(y));
     if(x<0||x>6.4||y<0||y>4.4||ch.some(o=>o!==c&&Math.hypot(x-o.x,y-o.y)<.06))break;if(s%100==50)ar.push([px(x),py(y),ex/m,-ey/m])}
    g.stroke()}
   for(const[x,y,ux,uy]of ar){g.beginPath();g.moveTo(x+6*ux,y+6*uy);g.lineTo(x-3*ux-3.5*uy,y-3*uy+3.5*ux);g.lineTo(x-3*ux+3.5*uy,y-3*uy-3.5*ux);g.fill()}}
  g.globalAlpha=1}
 for(const c of ch){const r=9+2*Math.abs(c.q);g.fillStyle=c.q>=0?pos:neg;g.beginPath();g.arc(px(c.x),py(c.y),r,0,7);g.fill();g.fillStyle='#fff';g.font='bold 14px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText(c.q>=0?'+':'−',px(c.x),py(c.y)+1)}
 $('p3').textContent=ch.length+' / 10'}
let drag=-1,md=()=>document.querySelector('input[name=md]:checked').value;
const pos=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width/S,(H-(e.clientY-r.top)*H/r.height)/S]};
const near=(x,y)=>{let b=-1,bd=.2;ch.forEach((c,i)=>{const d=Math.hypot(c.x-x,c.y-y);if(d<bd){bd=d;b=i}});return b};
cv.onpointerdown=e=>{const[x,y]=pos(e),m=md(),i=near(x,y);if(m==='mv'&&i>=0){drag=i;cv.setPointerCapture(e.pointerId)}
 else if(m==='del'&&i>=0)ch.splice(i,1);else if((m==='ap'||m==='an')&&ch.length<10)ch.push({x,y,q:(m==='ap'?1:-1)*+$('qv').value});draw()};
cv.onpointermove=e=>{const[x,y]=pos(e);if(drag>=0){ch[drag].x=Math.min(6.4,Math.max(0,x));ch[drag].y=Math.min(4.4,Math.max(0,y));draw()}
 const[ex,ey,v]=F(x,y);$('p0').textContent=`(${num(x,2)}; ${num(y,2)})`;$('p1').textContent=eng(v,'V');$('p2').textContent=eng(Math.hypot(ex,ey),'V/m')};
cv.onpointerup=()=>drag=-1;
$('qv').oninput=()=>$('qvl').textContent=$('qv').value+' nC';
['fl','eq','dv'].forEach(i=>$(i).onchange=draw);
document.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{const p=b.dataset.p;
 ch=p==='dip'?[{x:2.2,y:2.2,q:3},{x:4.2,y:2.2,q:-3}]:p==='cua'?[{x:2.7,y:1.7,q:3},{x:3.7,y:1.7,q:-3},{x:3.7,y:2.7,q:3},{x:2.7,y:2.7,q:-3}]:p==='iw'?[{x:2.4,y:2.2,q:3},{x:4,y:2.2,q:3}]:[];draw()});

/* Unidad 1: calculadora de potencial */
function renderT(){$('tb').innerHTML=ch.map((c,i)=>`<div class="cr"><b>Q${i+1}</b><input type="number" step="any" value="${c.q}" data-i="${i}" data-k="q" aria-label="Carga ${i+1} en nC"> nC <input type="number" step="0.1" value="${+c.x.toFixed(2)}" data-i="${i}" data-k="x" aria-label="x"> x <input type="number" step="0.1" value="${+c.y.toFixed(2)}" data-i="${i}" data-k="y" aria-label="y"> y <button class="g" data-del="${i}" aria-label="Quitar carga ${i+1}">Quitar</button></div>`).join('')||'<p class="s">Sin cargas. Agrega una.</p>';
 $('tb').querySelectorAll('input').forEach(n=>n.oninput=()=>{ch[n.dataset.i][n.dataset.k]=+n.value;calc()});
 $('tb').querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{ch.splice(+b.dataset.del,1);renderT();calc()})}
$('addc').onclick=()=>{if(ch.length<10){ch.push({x:3,y:2,q:1});renderT();calc()}};
['cx','cy'].forEach(i=>$(i).oninput=calc);
async function calc(){const x=+$('cx').value,y=+$('cy').value;
 if(!ch.length){outs('co',[['Potencial V','—']]);$('cd').textContent='Agrega al menos una carga.';return}
 const r=await post('/api/potencial',{cargas:ch,x,y});
 if(!r){$('cd').textContent='No se pudo calcular. ¿Está activo el servidor de Python?';return}
 outs('co',[['Potencial V',eng(r.V,'V')],['Eₓ',eng(r.Ex,'V/m')],['E_y',eng(r.Ey,'V/m')],['|E|',eng(r.E,'V/m')],['Dirección de E',num(r.angulo,1)+'°']]);
 $('cd').textContent=r.desglose.map(d=>`Q${d.i} = ${d.q} nC, r = ${num(d.r,3)} m, V = ${d.V===null?'—':eng(d.V,'V')}`).join('\n')+`\nSuma = ${eng(r.V,'V')}`}

/* Unidad 1: trayectoria */
let tr=null,an=0;const ct=$('ct'),t=ct.getContext('2d');
async function launch(){
 const p={q:+$('tq').value,m:+$('tm').value,ex:+$('tex').value,ey:+$('tey').value,v0:+$('tv').value,ang:+$('ta').value,T:+$('tT').value,gravedad:$('tg').checked,parar:$('ts').checked};
 const r=await post('/api/trayectoria',p);
 if(!r){outs('to',[['Error','No se pudo calcular. ¿Está activo el servidor de Python?']]);return}
 tr={P:r.puntos,ex:p.ex,ey:p.ey};an=matchMedia('(prefers-reduced-motion: reduce)').matches?tr.P.length-1:0;
 outs('to',[['Tiempo de vuelo',num(r.t_vuelo,3)+' s'],['Alcance x',num(r.alcance,3)+' m'],['Altura máxima',num(r.h_max,3)+' m'],['Velocidad final',num(r.v_final,3)+' m/s'],['Aceleración (aₓ; a_y)',`${num(r.ax,2)}; ${num(r.ay,2)} m/s²`],['ΔK (energía cinética)',num(r.dK,4)+' µJ'],['W = m·a·Δr',num(r.W,4)+' µJ'],['Error numérico vs exacto',eng(r.error,'m')]]);
 (function loop(){an=Math.min(tr.P.length-1,an+Math.ceil(tr.P.length/120));dT(an);if(an<tr.P.length-1&&!$('t3').hidden)requestAnimationFrame(loop)})()}
function dT(n){const P=tr.P,w=640,h=380,xs=P.map(p=>p[0]).concat(0),ys=P.map(p=>p[1]).concat(0),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),
 sc=Math.min((w-80)/Math.max(x1-x0,1e-6),(h-70)/Math.max(y1-y0,1e-6)),ox=40-x0*sc,oy=h-35+y0*sc,X=x=>ox+x*sc,Y=y=>oy-y*sc,ink=css('--ink'),mu=css('--mut');
 t.fillStyle=css('--panel');t.fillRect(0,0,w,h);t.strokeStyle=css('--line');t.lineWidth=1;t.beginPath();t.moveTo(0,Y(0));t.lineTo(w,Y(0));t.moveTo(X(0),0);t.lineTo(X(0),h);t.stroke();
 const em=Math.hypot(tr.ex,tr.ey);if(em>0){t.strokeStyle=mu;t.globalAlpha=.4;for(let i=1;i<9;i++)for(let j=1;j<5;j++){const x=i*w/9,y=j*h/5,ux=tr.ex/em*10,uy=-tr.ey/em*10;t.beginPath();t.moveTo(x-ux,y-uy);t.lineTo(x+ux,y+uy);t.lineTo(x+ux-(ux+uy*.6)*.5,y+uy-(uy-ux*.6)*.5);t.moveTo(x+ux,y+uy);t.lineTo(x+ux-(ux-uy*.6)*.5,y+uy-(uy+ux*.6)*.5);t.stroke()}t.globalAlpha=1}
 t.strokeStyle=css('--acc');t.lineWidth=2.5;t.beginPath();for(let i=0;i<=n;i++)t[i?'lineTo':'moveTo'](X(P[i][0]),Y(P[i][1]));t.stroke();
 t.fillStyle=css('--pos');t.beginPath();t.arc(X(P[n][0]),Y(P[n][1]),6,0,7);t.fill();t.fillStyle=mu;t.font='12px system-ui';t.textAlign='left';t.fillText('Las flechas tenues indican la dirección de E · escala: '+eng(40/sc,'m')+' ≈ 40 px'.replace('·',','),10,16)}
$('go').onclick=launch;

$('qvl').textContent='3 nC';show('t1');
