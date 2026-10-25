'use strict';
/* Percha · armario personal (datos solo en este dispositivo). Formato en localStorage.percha: {items:[], outfits:[]} */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const DB={items:[],outfits:[]};
const CATS=['Camisetas','Camisas','Jerséis','Chaquetas','Pantalones','Faldas/Vestidos','Calzado','Accesorios','Otros'];
const STATES={tiene:'Lo tengo',tuvo:'Lo tuve',deseo:'Deseo'};
const SEAS=['Primavera','Verano','Otoño','Invierno'];
const THEMES=[
  {id:'noche',name:'Noche',desc:'Oscuro y sereno',chrome:'#0f1014'},
  {id:'marfil',name:'Marfil',desc:'Claro y cálido',chrome:'#f6f1e9'},
  {id:'bosque',name:'Bosque',desc:'Verde profundo',chrome:'#0d1813'},
  {id:'coral',name:'Coral',desc:'Rosa vivo',chrome:'#fff3f0'}
];

function load(){try{Object.assign(DB,JSON.parse(localStorage.percha||'{}'));DB.items||=[];DB.outfits||=[]}catch(e){}}
function save(){try{localStorage.percha=JSON.stringify(DB);return true}catch(e){alert('Sin espacio: exporta una copia y reduce fotos');return false}}

let view='home',F={cat:'Todas',st:'tiene',q:''},pick=new Set(),bcat='Todas',oname='';
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hasPrice=v=>v!==null&&v!==undefined&&v!==''&&!isNaN(v);
const money=v=>(+v).toLocaleString('es-ES',{style:'currency',currency:'EUR'});
const plural=(n,a,b)=>n+' '+(n==1?a:b);
const bgImg=p=>p?' style="background-image:url(\''+esc(p)+'\')"':'';

/* ---------- Iconos propios (trazo 1.8, 24×24) ---------- */
const IC={
  home:'<path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z"/>',
  closet:'<path d="M10 6a2 2 0 1 1 2 2v1.6l8.2 5.5c.8.5.4 1.9-.6 1.9H4.4c-1 0-1.4-1.4-.6-1.9L12 9.6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  outfits:'<rect x="3.5" y="7" width="10.5" height="13" rx="2.5"/><path d="M8 4.5h9.5A2.5 2.5 0 0 1 20 7v10.5"/>',
  settings:'<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  search:'<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  back:'<path d="M15 5l-7 7 7 7"/>',
  camera:'<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.5-2.5h6L16.5 7h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="13" r="3.5"/>',
  image:'<rect x="4" y="5" width="16" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.6"/><path d="m5 18 5-5 3 3 2.5-2.5L20 17"/>',
  edit:'<path d="M5 19v-3.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5z"/><path d="M13.5 7l3 3"/>',
  trash:'<path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/>',
  check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  down:'<path d="M12 4v11m-5-5 5 5 5-5M5 20h14"/>',
  up:'<path d="M12 16V5m-5 5 5-5 5 5M5 20h14"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>'
};
const ico=(n,s)=>'<svg class="i" width="'+(s||22)+'" height="'+(s||22)+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+IC[n]+'</svg>';

/* ---------- Siluetas de prenda (para prendas sin foto e ilustraciones) ---------- */
const GS={
  top:'<path class="gf" d="M23 10 9 17l5 12 6-3v28h24V26l6 3 5-12-14-7a9 9 0 0 1-18 0z"/>',
  jacket:'<path class="gf" d="M23 9 11 14 6 50h8l4-20v24h28V30l4 20h8L53 14 41 9a9 9 0 0 1-18 0z"/><path class="gs" d="M32 18v36"/>',
  pants:'<path class="gf" d="M19 8h26l4 48H36l-4-32-4 32H15z"/><path class="gs" d="M19 15h26"/>',
  dress:'<path class="gf" d="M25 8h14l-1 12 12 36H14l12-36z"/><path class="gs" d="M26 20h12"/>',
  shoe:'<path class="gf" d="M8 44V24h13c2 6 9 9 16 10l14 3c5 1 7 4 7 9v2H8z"/><path class="gs" d="M8 48h50"/>',
  bag:'<path class="gf" d="M13 24h38l-3 30H16z"/><path class="gs" d="M24 24v-4a8 8 0 0 1 16 0v4"/>'
};
const CATG={'Camisetas':'top','Camisas':'top','Jerséis':'jacket','Chaquetas':'jacket','Pantalones':'pants','Faldas/Vestidos':'dress','Calzado':'shoe','Accesorios':'bag','Otros':'top'};
const garm=c=>'<svg class="gm" viewBox="0 0 64 64" aria-hidden="true">'+GS[CATG[c]||'top']+'</svg>';
function ill(k){
  const g=(n,x,y,s)=>'<g transform="translate('+x+' '+y+') scale('+s+')">'+GS[n].replace(/class="gf"/g,'class="il-f"').replace(/class="gs"/g,'class="il-g"')+'</g>';
  const shadow='<ellipse class="il-sh" cx="80" cy="110" rx="52" ry="6"/>';
  const shirt='<path class="il-f" d="M68 44 50 52l6 14 8-4v36h32V62l8 4 6-14-18-8a12 12 0 0 1-24 0z"/>';
  let b='';
  if(k=='outfits')b=shadow+'<g class="il-float">'+g('top',18,26,1.05)+g('pants',70,30,1)+'</g><circle class="il-a" cx="128" cy="28" r="13"/><path class="il-ai" d="M128 22v12M122 28h12"/><path class="il-sp" d="M26 20v6M23 23h6"/>';
  else if(k=='search')b=shadow+g('top',50,30,.75)+'<circle class="il-l" cx="74" cy="54" r="30"/><path class="il-h" d="M96 76l18 18"/><path class="il-sp" d="M126 30v8M122 34h8"/>';
  else if(k=='wish')b=shadow+'<g class="il-float" transform="translate(0 -6)">'+shirt+'</g><path class="il-a" d="M118 46c-9-5.5-14-10-14-15.5a7 7 0 0 1 14-2.2 7 7 0 0 1 14 2.2c0 5.5-5 10-14 15.5z"/><path class="il-sp" d="M34 58v8M30 62h8M40 30v6M37 33h6"/>';
  else b=shadow+'<path class="il-l" d="M26 18h108"/><circle class="il-a" cx="26" cy="18" r="4"/><circle class="il-a" cx="134" cy="18" r="4"/><g class="il-float"><path class="il-l" d="M76 22a4 4 0 1 1 4 4v4M80 30 58 42h44z"/>'+shirt+'</g><path class="il-sp" d="M34 58v8M30 62h8M128 70v8M124 74h8M120 34v6M117 37h6"/>';
  return '<svg class="ill" viewBox="0 0 160 120" aria-hidden="true">'+b+'</svg>';
}
function empty(k,t,x,btn,act){return '<div class="empty">'+ill(k)+'<h3>'+t+'</h3><p>'+x+'</p>'+(btn?'<button class="btn" data-act="'+(act||'add')+'">'+ico('plus',18)+btn+'</button>':'')+'</div>'}

/* ---------- Temas ---------- */
function applyTheme(id,animate){
  if(!THEMES.some(t=>t.id==id))id='noche';
  const h=document.documentElement;
  if(animate){h.classList.add('theming');clearTimeout(applyTheme.t);applyTheme.t=setTimeout(()=>h.classList.remove('theming'),450)}
  h.setAttribute('data-theme',id);
  try{localStorage.perchaTema=id}catch(e){}
  const m=$('meta[name=theme-color]');if(m)m.content=THEMES.find(t=>t.id==id).chrome;
}
const curTheme=()=>{try{return localStorage.perchaTema||'noche'}catch(e){return 'noche'}};

/* ---------- Utilidades de interfaz ---------- */
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),1900)}
function fecha(){const s=new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'});return s.charAt(0).toUpperCase()+s.slice(1)}
function fmtDate(s){const d=new Date(s+'T00:00:00');return isNaN(d)?(s||'—'):d.toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'})}
function linkify(t){return esc(t).replace(/(https?:\/\/[^\s<]+)/g,'<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')}
function tile(v,l,goTo){return goTo?'<button class="tile" data-go="'+goTo+'"><b>'+v+'</b><span>'+l+'</span></button>':'<div class="tile"><b>'+v+'</b><span>'+l+'</span></div>'}

function set(t,h,o){
  o=o||{};
  $('#title').textContent=t;
  const k=$('#kicker');k.textContent=o.kicker||'';k.hidden=!o.kicker;
  const b=$('#back');b.hidden=!o.back;b.onclick=o.back||null;
  const v=$('#view');v.dataset.v=view;v.innerHTML=h;
  if(!o.still){v.classList.remove('enter');void v.offsetWidth;v.classList.add('enter')}
  const dk=$('#dock');dk.innerHTML=o.dock||'';dk.hidden=!o.dock;
  document.body.classList.toggle('has-dock',!!o.dock);
}
function go(v,keep){
  view=v;
  $$('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.v==(v=='build'?'outfits':v)));
  const fn={home,closet,outfits,settings,build}[v];
  if(fn)fn(!!keep);
  if(!keep)window.scrollTo(0,0);
}

function card(i){
  const sel=view=='build'&&pick.has(i.id);
  return '<button type="button" class="item'+(sel?' sel':'')+'" data-id="'+esc(i.id)+'"><div class="ph"'+bgImg(i.photo)+'>'+(i.photo?'':garm(i.cat))+(hasPrice(i.price)&&view!='build'?'<span class="tag">'+money(i.price)+'</span>':'')+'<span class="ck">'+ico('check',16)+'</span></div><div class="tx"><b>'+esc(i.name||'Sin nombre')+'</b><small>'+(esc([i.brand,i.cat].filter(Boolean).join(' · '))||'&nbsp;')+'</small></div></button>';
}

/* ---------- Inicio ---------- */
function home(still){
  const own=DB.items.filter(i=>i.st=='tiene'),n=own.length,w=DB.items.filter(i=>i.st=='deseo').length,p=Math.min(n,5),last=DB.items.slice(-8).reverse();
  const hr=new Date().getHours(),gr=hr<6?'Buenas noches':hr<14?'Buenos días':hr<21?'Buenas tardes':'Buenas noches';
  let h='<section class="hero"><p class="kick">'+gr+'</p><h2>'+(n?'Tienes '+plural(n,'prenda','prendas'):'Tu armario empieza aquí')+'</h2><div class="tiles">'+tile(n,'Prendas','closet:tiene')+tile(w,'Deseos','closet:deseo')+tile(DB.outfits.length,'Conjuntos','outfits')+'</div></section>';
  if(n<5)h+='<section class="card prog"><div class="top"><h3>Añade 5 prendas para ver tus estadísticas</h3><span>'+p+' / 5</span></div><div class="bar"><i style="width:'+p*20+'%"></i></div><button class="btn" data-act="add">'+ico('plus',18)+'Añadir prenda</button></section>';
  h+=last.length?'<div class="sec"><h3>Últimas añadidas</h3><button class="link" data-go="closet">Ver armario</button></div><div class="hscroll">'+last.map(card).join('')+'</div>':empty('closet','Aún no hay prendas','Haz una foto a tu prenda favorita y empieza a llenar tu armario.');
  set('Hola 🐾',h,{kicker:fecha(),still});
}

/* ---------- Armario ---------- */
function closet(still){
  const cnt=k=>DB.items.filter(i=>i.st==k).length;
  set('Armario','<div class="search">'+ico('search',20)+'<input id="q" type="search" placeholder="Buscar por nombre, marca o color" value="'+esc(F.q)+'" autocomplete="off" enterkeyhint="search"></div>'
    +'<div class="seg">'+Object.entries(STATES).map(([k,v])=>'<button type="button" class="'+(F.st==k?'on':'')+'" data-st="'+k+'">'+v+' <span class="n">'+cnt(k)+'</span></button>').join('')+'</div>'
    +'<div class="chips" id="cc">'+['Todas',...CATS].map(c=>'<button type="button" class="chip'+(F.cat==c?' on':'')+'" data-c="'+esc(c)+'">'+esc(c)+'</button>').join('')+'</div><div id="cg"></div>',
    {kicker:plural(DB.items.length,'prenda guardada','prendas guardadas'),still});
  closetGrid();
  $('#q').oninput=e=>{F.q=e.target.value;closetGrid()};
  $$('[data-st]').forEach(b=>b.onclick=()=>{F.st=b.dataset.st;closet(true)});
  $$('[data-c]').forEach(b=>b.onclick=()=>{F.cat=b.dataset.c;$$('[data-c]').forEach(x=>x.classList.toggle('on',x==b));closetGrid()});
  const on=$('#cc .on');if(on)$('#cc').scrollLeft=Math.max(0,on.offsetLeft-60);
}
function closetGrid(){
  const q=F.q.trim().toLowerCase();
  const L=DB.items.filter(i=>i.st==F.st&&(F.cat=='Todas'||i.cat==F.cat)&&(!q||[i.name,i.brand,i.color,i.cat].join(' ').toLowerCase().includes(q)));
  $('#cg').innerHTML=L.length?'<p class="count">'+plural(L.length,'prenda','prendas')+'</p><div class="grid">'+L.slice().reverse().map(card).join('')+'</div>'
    :(q||F.cat!='Todas')?empty('search','Sin coincidencias','Prueba con otra palabra o quita el filtro de categoría.')
    :F.st=='deseo'?empty('wish','Tu lista de deseos está vacía','Guarda aquí lo que te gustaría tener algún día.','Añadir deseo')
    :F.st=='tuvo'?empty('closet','Nada por aquí','Las prendas que ya no tienes aparecerán en esta sección.')
    :empty('closet','Tu armario está vacío','Añade tu primera prenda con una foto.','Añadir prenda');
}

/* ---------- Hojas (modal) ---------- */
function modal(h,cls){const m=$('#modal');m.classList.remove('out');m.innerHTML='<div class="sheet'+(cls?' '+cls:'')+'" role="dialog" aria-modal="true"><div class="grab"></div>'+h+'</div>';m.hidden=false;document.body.classList.add('lock')}
function closeModal(){const m=$('#modal');if(m.hidden||m.classList.contains('out'))return;m.classList.add('out');document.body.classList.remove('lock');setTimeout(()=>{if(m.classList.contains('out')){m.hidden=true;m.innerHTML='';m.classList.remove('out')}},220)}

/* ---------- Ficha de prenda ---------- */
function detail(i){
  const ofs=DB.outfits.filter(o=>(o.ids||[]).includes(i.id));
  const rows=[['Color',i.color],['Estaciones',(i.seas||[]).join(', ')],['Añadida',i.added?fmtDate(i.added):''],['En conjuntos',ofs.map(o=>o.name).join(', ')]].filter(r=>r[1]);
  modal('<div class="dph"'+bgImg(i.photo)+'>'+(i.photo?'':garm(i.cat))+'</div>'
    +'<div class="dhead"><div><h2>'+esc(i.name||'Sin nombre')+'</h2><p class="muted">'+esc([i.brand,i.cat].filter(Boolean).join(' · '))+'</p></div>'+(hasPrice(i.price)?'<span class="price">'+money(i.price)+'</span>':'')+'</div>'
    +'<div class="seg" id="dst">'+Object.entries(STATES).map(([k,v])=>'<button type="button" class="'+(i.st==k?'on':'')+'" data-k="'+k+'">'+v+'</button>').join('')+'</div>'
    +(rows.length?'<div class="kv">'+rows.map(r=>'<div><span>'+r[0]+'</span><b>'+esc(r[1])+'</b></div>').join('')+'</div>':'')
    +(i.notes?'<div class="notes">'+linkify(i.notes)+'</div>':'')
    +'<div class="actions"><button type="button" class="btn ghost" id="de">'+ico('edit',18)+'Editar</button><button type="button" class="btn danger" id="dd">'+ico('trash',18)+'Borrar</button></div>');
  $$('#dst button').forEach(b=>b.onclick=()=>{if(i.st==b.dataset.k)return;const prev=i.st;i.st=b.dataset.k;if(!save()){i.st=prev;return}$$('#dst button').forEach(x=>x.classList.toggle('on',x==b));toast('Movida a «'+STATES[i.st]+'»');go(view,true)});
  $('#de').onclick=()=>edit(i);
  $('#dd').onclick=()=>delItem(i);
}
function delItem(i){
  if(!confirm('¿Borrar «'+(i.name||'Sin nombre')+'»? No se puede deshacer.'))return;
  const prev=DB.items;DB.items=DB.items.filter(x=>x.id!=i.id);
  if(!save()){DB.items=prev;return}
  closeModal();toast('Prenda borrada');go(view,true);
}

/* ---------- Alta / edición ---------- */
function resize(file){return new Promise(r=>{const im=new Image,u=URL.createObjectURL(file);im.onload=()=>{const k=Math.min(1,480/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);r(c.toDataURL('image/jpeg',.72))};im.onerror=()=>{URL.revokeObjectURL(u);r(null)};im.src=u})}
function edit(it){
  const base=it||{id:uid(),cat:(view=='closet'&&F.cat!='Todas')?F.cat:CATS[0],st:view=='closet'?F.st:'tiene',seas:[],added:new Date().toISOString().slice(0,10)};
  const d=Object.assign({},base,{seas:[...(base.seas||[])]});
  modal('<h2 class="mt">'+(it?'Editar prenda':'Nueva prenda')+'</h2>'
    +'<label class="pick-ph" id="pv" for="fg"></label>'
    +'<div class="row2"><label class="btn ghost">'+ico('camera',18)+'Cámara<input type="file" id="fc" accept="image/*" capture="environment" hidden></label><label class="btn ghost">'+ico('image',18)+'Galería<input type="file" id="fg" accept="image/*" hidden></label></div>'
    +'<label class="fl">Nombre<input id="n" value="'+esc(d.name)+'" placeholder="Ej.: Camisa de lino" autocomplete="off"></label>'
    +'<div class="row2"><label class="fl">Marca<input id="b" value="'+esc(d.brand)+'" autocomplete="off"></label><label class="fl">Color<input id="c" value="'+esc(d.color)+'" autocomplete="off"></label></div>'
    +'<label class="fl">Categoría<span class="selw"><select id="k">'+CATS.map(c=>'<option'+(c==d.cat?' selected':'')+'>'+esc(c)+'</option>').join('')+'</select></span></label>'
    +'<span class="fl">Estado</span><div class="seg" id="es">'+Object.entries(STATES).map(([k,v])=>'<button type="button" class="'+(k==d.st?'on':'')+'" data-k="'+k+'">'+v+'</button>').join('')+'</div>'
    +'<label class="fl" style="margin-top:2px">Precio (€)<input id="p" type="number" inputmode="decimal" step="0.01" min="0" value="'+(hasPrice(d.price)?esc(d.price):'')+'"></label>'
    +'<span class="fl">Estaciones</span><div class="chips wrap">'+SEAS.map(s=>'<button type="button" class="chip'+(d.seas.includes(s)?' on':'')+'" data-se="'+s+'">'+s+'</button>').join('')+'</div>'
    +'<label class="fl">Enlace o notas<textarea id="o" rows="3" placeholder="Talla, tienda, enlace…">'+esc(d.notes)+'</textarea></label>'
    +(it?'<button type="button" class="btn danger block" id="dl" style="margin-top:14px">'+ico('trash',18)+'Borrar prenda</button>':'')
    +'<div class="actions sticky"><button type="button" class="btn ghost" id="cx">Cancelar</button><button type="button" class="btn" id="sv">Guardar</button></div>','form');
  const paint=()=>{const pv=$('#pv');pv.classList.toggle('has',!!d.photo);pv.style.backgroundImage=d.photo?'url("'+d.photo+'")':'';
    pv.innerHTML=d.photo?'<button type="button" class="iconbtn rm" id="rm" aria-label="Quitar foto">'+ico('x',18)+'</button>':'<span class="phe">'+garm(d.cat)+'Toca para añadir una foto</span>';
    const rm=$('#rm');if(rm)rm.onclick=e=>{e.preventDefault();e.stopPropagation();d.photo=null;paint()}};
  paint();
  const onFile=async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const r=await resize(f);e.target.value='';if(r){d.photo=r;paint()}else toast('No se pudo leer la imagen')};
  $('#fc').onchange=onFile;$('#fg').onchange=onFile;
  $('#k').onchange=e=>{d.cat=e.target.value;if(!d.photo)paint()};
  $$('#es button').forEach(b=>b.onclick=()=>{d.st=b.dataset.k;$$('#es button').forEach(x=>x.classList.toggle('on',x==b))});
  $$('[data-se]').forEach(b=>b.onclick=()=>{const s=b.dataset.se;d.seas=d.seas.includes(s)?d.seas.filter(x=>x!=s):[...d.seas,s];b.classList.toggle('on')});
  $('#cx').onclick=closeModal;
  if(it)$('#dl').onclick=()=>delItem(it);
  $('#sv').onclick=()=>{
    const pr=$('#p').value;
    Object.assign(d,{name:$('#n').value.trim(),brand:$('#b').value.trim(),color:$('#c').value.trim(),cat:$('#k').value,price:pr===''?null:+pr,notes:$('#o').value});
    if(!d.photo)delete d.photo;
    if(it){const snap=Object.assign({},it);Object.assign(it,d);if(!d.photo)delete it.photo;if(!save()){Object.keys(it).forEach(x=>delete it[x]);Object.assign(it,snap);return}}
    else{DB.items.push(d);if(!save()){DB.items.pop();return}}
    closeModal();toast(it?'Cambios guardados':'Prenda añadida');
    if(!it&&view!='build'){F.st=d.st;F.cat='Todas';F.q='';go('closet')}else go(view,true);
  };
}

/* ---------- Conjuntos ---------- */
function outfitItems(o){return (o.ids||[]).map(id=>DB.items.find(x=>x.id==id)).filter(Boolean)}
function ocard(o){const its=outfitItems(o),c=Math.min(its.length,4);
  return '<button type="button" class="ocard" data-o="'+esc(o.id)+'"><div class="collage c'+c+'">'+(c?its.slice(0,4).map(x=>'<span'+bgImg(x.photo)+'>'+(x.photo?'':garm(x.cat))+'</span>').join(''):'<span>'+garm('Otros')+'</span>')+'</div><div class="otx"><b>'+esc(o.name)+'</b><small>'+plural(its.length,'prenda','prendas')+'</small></div></button>'}
function outfits(still){
  set('Conjuntos','<button type="button" class="btn block" data-act="newo">'+ico('plus',18)+'Crear conjunto</button>'+(DB.outfits.length?'<div class="olist">'+DB.outfits.slice().reverse().map(ocard).join('')+'</div>':empty('outfits','Sin conjuntos todavía','Combina prendas de tu armario y guárdalas para no pensar cada mañana.')),
    {kicker:DB.outfits.length?plural(DB.outfits.length,'conjunto guardado','conjuntos guardados'):'',still});
}
function outfitSheet(o){const its=outfitItems(o);
  modal('<h2>'+esc(o.name)+'</h2><p class="muted mt">'+plural(its.length,'prenda','prendas')+'</p>'+(its.length?'<div class="grid">'+its.map(card).join('')+'</div>':'<p class="muted">Las prendas de este conjunto ya no existen.</p>')
    +'<div class="actions"><button type="button" class="btn ghost" id="orn">'+ico('edit',18)+'Renombrar</button><button type="button" class="btn danger" id="od">'+ico('trash',18)+'Borrar</button></div>');
  $('#orn').onclick=()=>{const n=prompt('Nombre del conjunto',o.name);if(!n||!n.trim())return;const prev=o.name;o.name=n.trim();if(!save()){o.name=prev;return}closeModal();go('outfits',true)};
  $('#od').onclick=()=>{if(!confirm('¿Borrar el conjunto «'+o.name+'»? Las prendas no se borran.'))return;const prev=DB.outfits;DB.outfits=DB.outfits.filter(x=>x.id!=o.id);if(!save()){DB.outfits=prev;return}closeModal();toast('Conjunto borrado');go('outfits',true)};
}
function startBuild(){pick=new Set();bcat='Todas';oname='Conjunto '+(DB.outfits.length+1);go('build')}
function build(still){
  const own=DB.items.filter(i=>i.st=='tiene'),cats=CATS.filter(c=>own.some(i=>i.cat==c)),L=own.filter(i=>bcat=='Todas'||i.cat==bcat);
  if(!own.length){set('Nuevo conjunto',empty('closet','Primero, algunas prendas','Para crear un conjunto necesitas prendas en «Lo tengo».','Añadir prenda'),{back:()=>go('outfits'),still});return}
  set('Nuevo conjunto','<label class="fl" style="margin:0 0 14px">Nombre<input id="on" value="'+esc(oname)+'" autocomplete="off"></label>'
    +(cats.length>1?'<div class="chips">'+['Todas',...cats].map(c=>'<button type="button" class="chip'+(bcat==c?' on':'')+'" data-bc="'+esc(c)+'">'+esc(c)+'</button>').join('')+'</div>':'')
    +(L.length?'<div class="grid">'+L.map(card).join('')+'</div>':'<p class="muted">No hay prendas en esta categoría.</p>'),
    {kicker:'Toca las prendas que combinan',back:()=>go('outfits'),still,dock:'<span><b id="cnt">'+pick.size+'</b> elegidas</span><button type="button" class="btn" id="sv2"'+(pick.size?'':' disabled')+'>'+ico('check',18)+'Guardar</button>'});
  $('#on').oninput=e=>oname=e.target.value;
  $$('[data-bc]').forEach(b=>b.onclick=()=>{bcat=b.dataset.bc;build(true)});
  $('#sv2').onclick=()=>{if(!pick.size){toast('Elige al menos una prenda');return}
    const o={id:uid(),name:oname.trim()||'Conjunto '+(DB.outfits.length+1),ids:[...pick]};DB.outfits.push(o);if(!save()){DB.outfits.pop();return}
    toast('Conjunto guardado');go('outfits')};
}
function updDock(){const c=$('#cnt');if(c)c.textContent=pick.size;const s=$('#sv2');if(s)s.disabled=!pick.size}

/* ---------- Ajustes y estadísticas ---------- */
function settings(still){
  const own=DB.items.filter(i=>i.st=='tiene'),tot=own.reduce((s,i)=>s+(hasPrice(i.price)?+i.price:0),0);
  const by=k=>Object.entries(own.reduce((a,i)=>{const v=String(i[k]||'').trim()||'—';a[v]=(a[v]||0)+1;return a},{})).sort((a,b)=>b[1]-a[1]);
  const bars=(t,l)=>{const mx=l.length?l[0][1]:1;return '<section class="card"><h3>'+t+'</h3>'+(l.length?l.map(([k,v])=>'<div class="brow"><span>'+esc(k)+'</span><b>'+v+'</b><div class="bar"><i style="width:'+Math.max(4,Math.round(v/mx*100))+'%"></i></div></div>').join(''):'<p class="muted">Sin datos</p>')+'</section>'};
  const cur=curTheme();
  set('Ajustes','<h3 class="lbl">Apariencia</h3><div class="themes">'+THEMES.map(t=>'<button type="button" class="tp'+(cur==t.id?' on':'')+'" data-theme="'+t.id+'" data-t="'+t.id+'" aria-pressed="'+(cur==t.id)+'"><span class="mini"><span class="mb"></span><span class="mc"><i></i><i></i></span><span class="mn"><i></i><i></i><i class="a"></i><i></i><i></i></span></span><span class="tn"><b>'+t.name+'</b><small>'+t.desc+'</small></span><span class="tk">'+ico('check',14)+'</span></button>').join('')+'</div>'
    +'<h3 class="lbl">Estadísticas</h3><div class="tiles">'+tile(own.length,'Prendas')+tile(money(tot),'Valor total')+tile(own.length?money(tot/own.length):'—','Precio medio')+'</div>'
    +bars('Por categoría',by('cat'))+bars('Por marca',by('brand'))+bars('Por color',by('color'))
    +'<h3 class="lbl">Tus datos</h3><section class="card"><p class="muted" style="margin-bottom:12px">Todo se guarda solo en este dispositivo. Haz una copia de vez en cuando.</p><div class="row2"><button type="button" class="btn ghost" id="ex">'+ico('down',18)+'Exportar</button><button type="button" class="btn ghost" id="im">'+ico('up',18)+'Importar</button></div><input type="file" id="fi" accept=".json,application/json" hidden></section>'
    +'<p class="foot">Percha · tus datos no salen de este dispositivo</p>',{kicker:'Tema, estadísticas y copias',still});
  $$('[data-t]').forEach(b=>b.onclick=()=>{applyTheme(b.dataset.t,true);$$('[data-t]').forEach(x=>{x.classList.toggle('on',x==b);x.setAttribute('aria-pressed',x==b)});toast('Tema '+THEMES.find(t=>t.id==b.dataset.t).name)});
  $('#ex').onclick=()=>{const a=document.createElement('a'),u=URL.createObjectURL(new Blob([JSON.stringify(DB)],{type:'application/json'}));a.href=u;a.download='percha-copia.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000);toast('Copia exportada')};
  $('#im').onclick=()=>$('#fi').click();
  $('#fi').onchange=async e=>{const f=e.target.files&&e.target.files[0];e.target.value='';if(!f)return;
    try{const j=JSON.parse(await f.text());if(!confirm('Esto sustituirá tus prendas y conjuntos por los de la copia. ¿Continuar?'))return;
      const prev={items:DB.items,outfits:DB.outfits};DB.items=j.items||[];DB.outfits=j.outfits||[];if(!save()){Object.assign(DB,prev);return}toast('Copia importada');go('home')}
    catch(err){alert('Archivo no válido')}};
}

/* ---------- Eventos globales ---------- */
$('#view').addEventListener('click',e=>{
  const t=e.target.closest('[data-go],[data-act],[data-o],.item');if(!t)return;
  if(t.classList.contains('item')){const i=DB.items.find(x=>x.id==t.dataset.id);if(!i)return;
    if(view=='build'){pick.has(i.id)?pick.delete(i.id):pick.add(i.id);t.classList.toggle('sel',pick.has(i.id));updDock()}else detail(i);return}
  if(t.dataset.act=='add')return edit();
  if(t.dataset.act=='newo')return startBuild();
  if(t.dataset.o){const o=DB.outfits.find(x=>x.id==t.dataset.o);if(o)outfitSheet(o);return}
  if(t.dataset.go){const [v,st]=t.dataset.go.split(':');if(st){F.st=st;F.cat='Todas';F.q=''}go(v)}
});
$('#modal').addEventListener('click',e=>{
  if(e.target.id=='modal')return closeModal();
  const it=e.target.closest('.item');if(it){const i=DB.items.find(x=>x.id==it.dataset.id);if(i)detail(i)}
});
document.addEventListener('keydown',e=>{if(e.key=='Escape')closeModal()});
$$('#nav button').forEach(b=>{b.insertAdjacentHTML('afterbegin',ico(b.dataset.i,b.dataset.v=='add'?28:22));b.onclick=()=>{if(b.dataset.v=='add')edit();else go(b.dataset.v)}});
$('#back').innerHTML=ico('back',20);

applyTheme(curTheme());
load();go('home');
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js');
