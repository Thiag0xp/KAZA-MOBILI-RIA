const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
$$('.yr').forEach(e=>e.textContent=new Date().getFullYear());
const hd=$('header');if(hd){const f=()=>hd.classList.toggle('sc',scrollY>40);addEventListener('scroll',f,{passive:true});f()}
const bg=$('#burger');if(bg){bg.onclick=()=>{const o=document.body.classList.toggle('menu');bg.setAttribute('aria-expanded',o);bg.setAttribute('aria-label',o?'Fechar menu':'Abrir menu')}}
const closeMenu=()=>{document.body.classList.remove('menu');if(bg){bg.setAttribute('aria-expanded',false);bg.setAttribute('aria-label','Abrir menu')}};
$$('nav a').forEach(a=>a.addEventListener('click',closeMenu));
// fecha ao tocar fora da gaveta ou com Esc
document.addEventListener('click',e=>{if(e.target===document.body&&document.body.classList.contains('menu'))closeMenu()});
addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
addEventListener('resize',()=>{if(innerWidth>900)closeMenu()});
// animações ao fazer scroll
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
$$('.rv').forEach((e,i)=>{e.style.transitionDelay=(i%4)*90+'ms';io.observe(e)});
const co=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;co.unobserve(e.target);const n=+e.target.dataset.n;let i=0;const t=setInterval(()=>{i+=Math.ceil(n/40);if(i>=n){i=n;clearInterval(t)}e.target.textContent=i+(e.target.dataset.s||'')},35)}));
$$('[data-n]').forEach(e=>co.observe(e));
// lightbox (fecha com Esc)
$$('.gal img').forEach(i=>i.onclick=()=>{const l=document.createElement('div');l.id='lb';const im=new Image();im.src=i.src;im.alt=i.alt;l.append(im);const c=()=>{l.remove();removeEventListener('keydown',k)},k=e=>e.key==='Escape'&&c();l.onclick=c;addEventListener('keydown',k);document.body.append(l)});
// cookies (só guardamos a escolha; não usamos cookies de análise nem marketing)
const ck=$('#cookies');
if(ck){try{if(!localStorage.getItem('kaza_cookies'))ck.hidden=false}catch(e){ck.hidden=false}
 $$('[data-ck]',ck).forEach(b=>b.onclick=()=>{try{localStorage.setItem('kaza_cookies',b.dataset.ck)}catch(e){}ck.hidden=true});
 $$('.gc').forEach(a=>a.onclick=e=>{e.preventDefault();ck.hidden=false})}
// pré-visualização de ficheiros com botão de remover
$$('input[type=file]').forEach(inp=>{const box=document.createElement('div');box.className='prev';inp.after(box);const dt=new DataTransfer(),max=inp.multiple?6:1;
 const draw=()=>{box.replaceChildren();[...dt.files].forEach((f,k)=>{const d=document.createElement('div');d.className='th';
  if(f.type.startsWith('image/')){const im=new Image();im.src=URL.createObjectURL(f);im.alt='';d.append(im)}else d.textContent='📄 '+f.name.slice(0,14);
  const x=document.createElement('button');x.type='button';x.textContent='×';x.title='Remover';x.onclick=()=>{dt.items.remove(k);inp.files=dt.files;draw()};d.append(x);box.append(d)})};
 inp.addEventListener('change',()=>{[...inp.files].forEach(f=>{if(dt.items.length<max)dt.items.add(f)});inp.files=dt.files;draw()});
 inp.form.addEventListener('reset',()=>{while(dt.items.length)dt.items.remove(0);draw()})});
// formulário de orçamento por passos
$$('form[data-tipo=orcamento]').forEach(f=>{
 const st=$$('fieldset',f),last=st.length-1,cons=$('.chk',f),cb=$('.chk input',f),sub=$('button[type=submit]',f);let i=0;
 const pr=document.createElement('div');pr.className='prog';pr.innerHTML='<div class="bar"><i></i></div><p></p>';f.prepend(pr);
 const nv=document.createElement('div');nv.className='nav';nv.innerHTML='<button type="button" class="btn o2">← Anterior</button><button type="button" class="btn">Seguinte →</button>';cons.before(nv);
 const [bk,nx]=$$('button',nv);
 const show=n=>{i=n;st.forEach((s,k)=>s.hidden=k!==i);cons.hidden=sub.hidden=i!==last;cb.required=i===last;bk.hidden=!i;nx.hidden=i===last;
  $('i',pr).style.width=((i+1)/st.length*100)+'%';$('p',pr).textContent=`Passo ${i+1} de ${st.length} — ${$('legend',st[i]).textContent.replace(/^\d+\.\s*/,'')}`;if(n)pr.scrollIntoView({behavior:'smooth',block:'center'})};
 const next=()=>{if($$('input,select,textarea',st[i]).every(e=>e.reportValidity()))show(i+1)};
 nx.onclick=next;bk.onclick=()=>show(i-1);
 f.addEventListener('submit',e=>{if(i<last){e.preventDefault();e.stopImmediatePropagation();next()}},true);
 f.addEventListener('reset',()=>setTimeout(()=>show(0)));show(0)});
// envio -> /api/ticket
const toData=f=>new Promise(res=>{const r=new FileReader();r.onload=()=>{
 if(!f.type.startsWith('image/'))return res({nome:f.name,data:r.result});
 const i=new Image();i.onload=()=>{const k=Math.min(1,1600/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=i.width*k;c.height=i.height*k;c.getContext('2d').drawImage(i,0,0,c.width,c.height);res({nome:f.name.replace(/\.\w+$/,'.jpg'),data:c.toDataURL('image/jpeg',.82)})};
 i.onerror=()=>res({nome:f.name,data:r.result});i.src=r.result};r.readAsDataURL(f)});
$$('form[data-tipo]').forEach(f=>{const t0=Date.now();f.onsubmit=async e=>{e.preventDefault();
 const m=$('.msg',f),b=$('button[type=submit]',f),dados={},files=[];
 for(const [k,v] of new FormData(f)){if(v instanceof File){if(v.size)files.push(v)}else dados[k]=dados[k]?dados[k]+', '+v:v}
 if(files.some(x=>x.size>15e6)){m.className='msg err';m.textContent='Cada ficheiro pode ter no máximo 15 MB.';return}
 b.disabled=true;m.className='msg';m.textContent='A enviar…';
 try{const fotos=await Promise.all(files.map(toData));
  const r=await fetch('/api/ticket',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tipo:f.dataset.tipo,dados,fotos,t:Date.now()-t0})}),j=await r.json();
  if(!r.ok)throw j;f.reset();m.className='msg ok';m.textContent=`✔ Pedido enviado! O seu número de ticket é ${j.id}. Entraremos em contacto em breve.`;m.scrollIntoView({behavior:'smooth',block:'center'});
 }catch(err){m.className='msg err';m.textContent=(err&&err.erro)||'Não foi possível enviar. Ligue-nos para 969 364 807.'}
 b.disabled=false}});
// ===== v3: animações e interações =====
const mk=(t,id)=>{const e=document.createElement(t);e.id=id;document.body.append(e);return e};
const sp=mk('div','sp'),up=mk('button','up'),tt=mk('div','toast');up.textContent='↑';up.setAttribute('aria-label','Voltar ao topo');up.onclick=()=>scrollTo({top:0,behavior:'smooth'});
const hero=$('.hero');
const onS=()=>{const m=document.documentElement.scrollHeight-innerHeight;sp.style.width=(m>0?scrollY/m*100:0)+'%';up.classList.toggle('show',scrollY>700)};
addEventListener('scroll',onS,{passive:true});onS();
const toast=m=>{tt.textContent=m;tt.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>tt.classList.remove('show'),2800)};
// menu ativo conforme a secção
const links=$$('nav a[href^="#"]:not(.btn)'),so=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)links.forEach(l=>l.classList.toggle('on',l.getAttribute('href')==='#'+e.target.id))}),{rootMargin:'-45% 0px -50% 0px'});
links.forEach(l=>{const s=$(l.getAttribute('href'));s&&so.observe(s)});
// acabamentos -> preenchem o pedido de orçamento
$$('.sw').forEach(b=>b.onclick=()=>{const f=$('form[data-tipo=orcamento]');if(!f)return;f.elements.cor_principal.value=b.dataset.c;const d=f.elements.cores_descricao,l=d.value?d.value.split(', '):[];if(!l.includes(b.dataset.nome))l.push(b.dataset.nome);d.value=l.join(', ');
 toast(`✔ “${b.dataset.nome}” adicionado ao seu pedido`);setTimeout(()=>$('#orcamento').scrollIntoView({behavior:'smooth'}),800)});
