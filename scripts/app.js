// ======= CURSOR =======
const cur = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
document.addEventListener('mousemove', e => {
  cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px';
  ring.style.left = e.clientX + 'px'; ring.style.top = e.clientY + 'px';
});
document.querySelectorAll('a,button,label,[onclick]').forEach(el => {
  el.addEventListener('mouseenter', () => { cur.classList.add('hovering'); ring.classList.add('hovering'); });
  el.addEventListener('mouseleave', () => { cur.classList.remove('hovering'); ring.classList.remove('hovering'); });
});

// ======= SUPABASE =======
const SUPA_URL = 'https://yxrqnflnrkqdmulmkqib.supabase.co';
const SUPA_KEY = 'sb_publishable_lwW02CqQHtSYgREWEBhQJw_BVVj-L93';
const sb = supabase.createClient(SUPA_URL, SUPA_KEY);

// ======= STATE =======
let S = {
  n1:'Emmanuel', n2:'Diaz',
  eye:'Fotografía de autor',
  t1:'Capturando', t2:'Momentos',
  heroDesc:'Retratos · Bodas · Naturaleza · Arquitectura',
  quote:'"La fotografía es el arte de congelar la luz en instantes que duran para siempre."',
  bio:'Soy fotógrafo apasionado con más de una década capturando la belleza del mundo en todas sus formas. Mi trabajo abarca desde íntimos retratos hasta paisajes épicos, siempre buscando esa luz perfecta y ese momento único.',
  s1:'10+', s2:'500+', s3:'50+',
  sl1:'Años', sl2:'Sesiones', sl3:'Premios',
  contactTitle:'¿Tienes un proyecto en mente?',
  email:'hola@emmanueldz.com', phone:'+34 600 000 000', loc:'España',
  insta:'#', fb:'#',
  watermark:'© Emmanuel Diaz',
  heroBg:'', aboutPhoto:'', aboutPhotoPos:'50'
};
function saveLocalS(){ try{ localStorage.setItem('edPF3',JSON.stringify(S)); }catch(e){} }
function loadLocalS(){ try{ const d=localStorage.getItem('edPF3'); if(d) Object.assign(S,JSON.parse(d)); }catch(e){} }
async function saveS() {
  saveLocalS();
  try { await sb.from('settings').upsert({ key:'site_config_v2', value:JSON.stringify(S), updated_at:new Date().toISOString() }); } catch(e){}
}
async function loadS() {
  loadLocalS();
  try {
    const { data } = await sb.from('settings').select('value').eq('key','site_config_v2').maybeSingle();
    if (data?.value) { Object.assign(S, JSON.parse(data.value)); saveLocalS(); }
  } catch(e){}
}

// ======= DATA =======
let cats = [], allPhotos = [];
async function loadAll() {
  await Promise.all([
    sb.from('categories').select('*').order('created_at').then(({data}) => { cats = data||[]; renderUploadCatSelect(); }),
    sb.from('photos').select('*').order('created_at',{ascending:false}).then(({data}) => { allPhotos = data||[]; })
  ]);
  renderCatCards();
}

// ======= RENDER PUBLIC =======
function renderPublic() {
  const name = S.n1 + ' ' + S.n2;
  document.getElementById('navLogo').textContent = name;
  document.getElementById('footLogo').textContent = name;
  document.getElementById('loginLogo').textContent = name;
  document.title = name + ' — Fotografía';
  document.getElementById('heroLabel').textContent = S.eye;
  document.getElementById('heroTitle').innerHTML = S.t1 + '<br><em>' + S.t2 + '</em>';
  document.getElementById('heroDesc').textContent = S.heroDesc;
  document.getElementById('aboutName').innerHTML = S.n1 + '<em>' + S.n2 + '</em>';
  document.getElementById('aboutQuote').textContent = S.quote;
  document.getElementById('aboutBio').textContent = S.bio;
  document.getElementById('st1').textContent = S.s1;
  document.getElementById('st2').textContent = S.s2;
  document.getElementById('st3').textContent = S.s3;
  document.getElementById('sl1').textContent = S.sl1;
  document.getElementById('sl2').textContent = S.sl2;
  document.getElementById('sl3').textContent = S.sl3;
  document.getElementById('cEmail').textContent = S.email;
  document.getElementById('cPhone').textContent = S.phone;
  document.getElementById('cLoc').textContent = S.loc;
  document.getElementById('footInsta').href = S.insta;
  document.getElementById('footFb').href = S.fb;
  document.getElementById('contactTitle').innerHTML = S.contactTitle.replace('en mente?','<em>en mente?</em>');
  // About photo
  const slot = document.getElementById('aboutImgSlot');
  if (S.aboutPhoto) {
    const posY = (parseFloat(S.aboutPhotoPos)||50).toFixed(1) + '%';
    slot.outerHTML = '<img src="'+S.aboutPhoto+'" class="about-photo" id="aboutImgSlot" alt="'+name+'" style="object-position:center '+posY+'">';
  } else {
    const el = document.getElementById('aboutImgSlot');
    if (el && el.tagName==='IMG') el.outerHTML = '<div class="about-ph" id="aboutImgSlot"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/></svg><span>Tu foto aquí</span></div>';
  }
}

// ======= GALLERY =======
function getPhotoUrl(fp){ return sb.storage.from('Photos').getPublicUrl(fp).data.publicUrl; }

function renderCatCards() {
  const grid = document.getElementById('catCards');
  if (!grid) return;
  grid.innerHTML = '';
  cats.forEach(c => {
    const cp = allPhotos.filter(p => p.category===c.name);
    const cover = c.cover_url || (cp[0] ? getPhotoUrl(cp[0].file_path) : null);
    const card = document.createElement('div');
    card.className = 'cat-card';
    if (cover) {
      card.innerHTML = '<img src="'+cover+'" alt="'+c.name+'" loading="lazy"><div class="cat-card-info"><span class="cat-card-name">'+c.name+'</span><span class="cat-card-count">'+cp.length+' foto'+(cp.length!==1?'s':'')+'</span></div>';
    } else {
      card.innerHTML = '<div class="cat-card-empty"></div><div class="cat-card-info"><span class="cat-card-name">'+c.name+'</span><span class="cat-card-count">'+cp.length+' fotos</span></div><span class="cat-card-empty-name">'+c.name+'</span>';
    }
    card.onclick = () => showCategoryPhotos(c.name);
    grid.appendChild(card);
  });
}

function showCategoryPhotos(cat) {
  document.getElementById('catCards').style.display = 'none';
  document.getElementById('mosaic').style.display = 'block';
  const back = document.getElementById('backBtn');
  back.style.display = 'flex';
  renderMosaic(cat);
  document.getElementById('portfolio').scrollIntoView({behavior:'smooth'});
}

function showCategoryCards() {
  document.getElementById('catCards').style.display = 'grid';
  document.getElementById('mosaic').style.display = 'none';
  document.getElementById('backBtn').style.display = 'none';
}

let lbPh = [], lbIdx = 0;
function renderMosaic(cat) {
  const g = document.getElementById('mosaic');
  const ph = allPhotos.filter(p => p.category===cat);
  lbPh = ph;
  g.innerHTML = '';
  if (!ph.length) { g.innerHTML = '<p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:var(--light);padding:60px 0">Sin fotos en esta categoría</p>'; return; }
  ph.forEach((p, i) => {
    const url = getPhotoUrl(p.file_path);
    const c = document.createElement('div');
    c.className = 'mc';
    c.innerHTML = '<img src="'+url+'" alt="'+p.name+'" loading="lazy">';
    c.onclick = () => openLb(i);
    g.appendChild(c);
  });
}

// ======= LIGHTBOX =======
function openLb(i) { lbIdx=i; document.getElementById('lbImg').src=getPhotoUrl(lbPh[i].file_path); document.getElementById('lb').classList.add('open'); document.body.style.overflow='hidden'; }
function closeLb() { document.getElementById('lb').classList.remove('open'); document.body.style.overflow=''; }
function lbNav(d) { lbIdx=(lbIdx+d+lbPh.length)%lbPh.length; document.getElementById('lbImg').src=getPhotoUrl(lbPh[lbIdx].file_path); }
document.getElementById('lb').addEventListener('click', e => { if(e.target===e.currentTarget) closeLb(); });
document.addEventListener('keydown', e => {
  if (!document.getElementById('lb').classList.contains('open')) return;
  if (e.key==='Escape') closeLb();
  if (e.key==='ArrowLeft') lbNav(-1);
  if (e.key==='ArrowRight') lbNav(1);
});

// ======= IMAGE PROCESSING =======
function processImage(file) {
  return new Promise(resolve => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = e => { img.src = e.target.result; };
    img.onload = () => {
      const MAX = 2400;
      let w=img.width, h=img.height;
      if (w>MAX||h>MAX) { if(w>h){h=Math.round(h*MAX/w);w=MAX;}else{w=Math.round(w*MAX/h);h=MAX;} }
      const canvas = document.createElement('canvas');
      canvas.width=w; canvas.height=h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img,0,0,w,h);
      const wm = S.watermark||'© Emmanuel Diaz';
      const fontSize = Math.max(13, Math.round(w*0.018));
      ctx.save();
      ctx.font = '300 '+fontSize+'px Helvetica Neue, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.32)';
      ctx.textAlign='right'; ctx.textBaseline='bottom';
      ctx.shadowColor='rgba(0,0,0,0.4)'; ctx.shadowBlur=4;
      ctx.fillText(wm, w-16, h-14);
      ctx.restore();
      canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.94);
    };
    reader.readAsDataURL(file);
  });
}

// ======= UPLOAD =======
async function handleFiles(files) {
  const cat = document.getElementById('uploadCat').value;
  if (!cat) { showToast('Selecciona una categoría primero'); return; }
  const arr = Array.from(files);
  const prog = document.getElementById('uploadProgress');
  const bar = document.getElementById('progressBar');
  const label = document.getElementById('progressLabel');
  prog.style.display='block';
  for (let i=0; i<arr.length; i++) {
    const file = arr[i];
    label.textContent = 'Procesando '+(i+1)+' de '+arr.length+'...';
    bar.style.width = ((i/arr.length)*50)+'%';
    const blob = await processImage(file);
    const fn = Date.now()+'_'+file.name.replace(/[^a-z0-9.]/gi,'_').toLowerCase();
    const fp = 'gallery/'+fn;
    label.textContent = 'Subiendo '+(i+1)+' de '+arr.length+'...';
    bar.style.width = (50+(i/arr.length)*50)+'%';
    const {error} = await sb.storage.from('Photos').upload(fp, blob, {contentType:'image/jpeg'});
    if (error) { showToast('Error: '+file.name); continue; }
    const name = file.name.replace(/\.[^.]+$/,'').replace(/_/g,' ');
    await sb.from('photos').insert({name, category:cat, file_path:fp});
  }
  bar.style.width='100%'; label.textContent='¡Listo!';
  setTimeout(()=>{ prog.style.display='none'; bar.style.width='0%'; },1500);
  showToast(arr.length+' foto'+(arr.length>1?'s':'')+' subida'+(arr.length>1?'s':''));
  await loadAll(); renderAdminPhotos();
  document.getElementById('fi').value='';
}

const dz = document.getElementById('dropZone');
dz.addEventListener('dragover', e=>{ e.preventDefault(); dz.classList.add('over'); });
dz.addEventListener('dragleave', ()=>dz.classList.remove('over'));
dz.addEventListener('drop', e=>{ e.preventDefault(); dz.classList.remove('over'); handleFiles(e.dataTransfer.files); });

// ======= ADMIN PHOTOS =======
async function renderAdminPhotos() {
  const g = document.getElementById('aPhotos');
  if (!allPhotos.length) { g.innerHTML='<p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--light)">Sin fotos aún</p>'; return; }
  g.innerHTML='';
  allPhotos.forEach(p => {
    const url = getPhotoUrl(p.file_path);
    const opts = cats.map(c=>'<option value="'+c.name+'"'+(c.name===p.category?' selected':'')+'>'+c.name+'</option>').join('');
    const card = document.createElement('div'); card.className='apc';
    card.innerHTML='<img src="'+url+'" class="apt" alt="'+p.name+'"><div class="apm"><div class="apn">'+p.name+'</div><div class="apc-cat">'+p.category+'</div></div><div class="apa"><select class="acs" onchange="changePhotoCat(\''+p.id+'\',this.value)">'+opts+'</select><button class="btn-del" onclick="deletePhoto(\''+p.id+'\',\''+p.file_path+'\')">Eliminar</button></div>';
    g.appendChild(card);
  });
}

async function changePhotoCat(id,cat){ await sb.from('photos').update({category:cat}).eq('id',id); await loadAll(); renderAdminPhotos(); }
async function deletePhoto(id,fp){ await sb.storage.from('Photos').remove([fp]); await sb.from('photos').delete().eq('id',id); await loadAll(); renderAdminPhotos(); showToast('Foto eliminada'); }

// ======= CATEGORIES =======
function renderUploadCatSelect() {
  const sel = document.getElementById('uploadCat');
  sel.innerHTML = cats.map(c=>'<option value="'+c.name+'">'+c.name+'</option>').join('');
}

async function renderAdminCats() {
  await loadAll();
  const l = document.getElementById('aCatList'); l.innerHTML='';
  cats.forEach(c => {
    const cp = allPhotos.filter(p=>p.category===c.name);
    const coverOpts = cp.map(p=>'<option value="'+getPhotoUrl(p.file_path)+'"'+((c.cover_url||'')===getPhotoUrl(p.file_path)?' selected':'')+'>'+p.name+'</option>').join('');
    const d = document.createElement('div'); d.className='a-cat-item';
    d.innerHTML='<div class="a-cat-dot"></div><span class="a-cat-name">'+c.name+'</span><span class="a-cat-cnt">'+cp.length+' foto'+(cp.length!==1?'s':'')+'</span>'+(cp.length>0?'<select class="acs" style="width:160px" onchange="setCatCover(\''+c.id+'\',this.value)"><option value="">Portada: auto</option>'+coverOpts+'</select>':'')+'<button class="btn-del" onclick="deleteCat(\''+c.id+'\',\''+c.name+'\')">Eliminar</button>';
    l.appendChild(d);
  });
}

async function setCatCover(id,url){ await sb.from('categories').update({cover_url:url||null}).eq('id',id); await loadAll(); await renderAdminCats(); showToast('Portada actualizada'); }
async function addCat() {
  const inp=document.getElementById('newCat'); const v=inp.value.trim();
  if(!v) return;
  if(cats.find(c=>c.name===v)){showToast('Ya existe');return;}
  await sb.from('categories').insert({name:v}); inp.value='';
  await renderAdminCats(); showToast('Categoría añadida');
}
async function deleteCat(id,name) {
  const rem = cats.filter(c=>c.id!==id);
  if(rem.length>0) await sb.from('photos').update({category:rem[0].name}).eq('category',name);
  await sb.from('categories').delete().eq('id',id);
  await loadAll(); await renderAdminCats(); showToast('Categoría eliminada');
}
document.getElementById('newCat').addEventListener('keydown', e=>{ if(e.key==='Enter') addCat(); });

// ======= HERO & ABOUT UPLOADS =======
async function uploadHeroBg(file) {
  if(!file) return; showToast('Procesando...');
  const img=new Image(); const reader=new FileReader();
  reader.onload=e=>{img.src=e.target.result;};
  img.onload=()=>{
    const MAX=1920; let w=img.width,h=img.height;
    if(w>MAX||h>MAX){if(w>h){h=Math.round(h*MAX/w);w=MAX;}else{w=Math.round(w*MAX/h);h=MAX;}}
    const canvas=document.createElement('canvas'); canvas.width=w; canvas.height=h;
    canvas.getContext('2d').drawImage(img,0,0,w,h);
    canvas.toBlob(async blob=>{
      const fp='hero/hero-bg_'+Date.now()+'.jpg';
      const {error}=await sb.storage.from('Photos').upload(fp,blob,{contentType:'image/jpeg',upsert:true});
      if(error){showToast('Error subiendo');return;}
      const url=sb.storage.from('Photos').getPublicUrl(fp).data.publicUrl;
      S.heroBg=url; saveS();
      const prev=document.getElementById('heroBgPreview'); prev.src=url; prev.style.display='block';
      document.getElementById('heroBgRemove').style.display='inline-block';
      showToast('¡Foto de fondo actualizada!');
    },'image/jpeg',0.94);
  };
  reader.readAsDataURL(file);
}
function removeHeroBg(){ S.heroBg=''; saveS(); document.getElementById('heroBgPreview').style.display='none'; document.getElementById('heroBgRemove').style.display='none'; showToast('Fondo eliminado'); }

async function uploadAboutPhoto(file) {
  if(!file) return; showToast('Procesando...');
  const img=new Image(); const reader=new FileReader();
  reader.onload=e=>{img.src=e.target.result;};
  img.onload=()=>{
    const MAX=2400; let w=img.width,h=img.height;
    if(w>MAX||h>MAX){if(w>h){h=Math.round(h*MAX/w);w=MAX;}else{w=Math.round(w*MAX/h);h=MAX;}}
    const canvas=document.createElement('canvas'); canvas.width=w; canvas.height=h;
    canvas.getContext('2d').drawImage(img,0,0,w,h);
    canvas.toBlob(async blob=>{
      const fp='about/profile_'+Date.now()+'.jpg';
      const {error}=await sb.storage.from('Photos').upload(fp,blob,{contentType:'image/jpeg',upsert:true});
      if(error){showToast('Error subiendo');return;}
      const url=sb.storage.from('Photos').getPublicUrl(fp).data.publicUrl;
      S.aboutPhoto=url; saveS(); renderPublic();
      const prev=document.getElementById('aboutPhotoPreview'); prev.src=url; prev.style.display='block';
      document.getElementById('aboutPhotoRemove').style.display='inline-block';
      setTimeout(initAboutDragger,300);
      showToast('¡Foto actualizada!');
    },'image/jpeg',0.94);
  };
  reader.readAsDataURL(file);
}
function removeAboutPhoto(){ S.aboutPhoto=''; S.aboutPhotoPos='50'; saveS(); renderPublic(); document.getElementById('aboutPhotoPreview').style.display='none'; document.getElementById('aboutPhotoRemove').style.display='none'; document.getElementById('aboutPosDragger').style.display='none'; showToast('Foto eliminada'); }

function initAboutDragger() {
  const wrap=document.getElementById('aboutDragWrap'); const img=document.getElementById('aboutDragImg');
  if(!wrap||!img||!S.aboutPhoto) return;
  img.src=S.aboutPhoto; document.getElementById('aboutPosDragger').style.display='block';
  let posY=parseFloat(S.aboutPhotoPos)||50, dragging=false, startY=0, startTop=0;
  const updatePos=pct=>{ const imgH=img.naturalHeight*(wrap.offsetWidth/(img.naturalWidth||1)); const maxOff=Math.max(0,imgH-wrap.offsetHeight); img.style.top=-(pct/100)*maxOff+'px'; };
  img.onload=()=>updatePos(posY);
  if(img.complete) updatePos(posY);
  const getY=e=>e.touches?e.touches[0].clientY:e.clientY;
  wrap.addEventListener('mousedown',e=>{dragging=true;startY=getY(e);startTop=parseFloat(img.style.top)||0;wrap.style.cursor='grabbing';});
  wrap.addEventListener('touchstart',e=>{dragging=true;startY=getY(e);startTop=parseFloat(img.style.top)||0;},{passive:true});
  const onMove=e=>{ if(!dragging) return; const dy=getY(e)-startY; const imgH=img.naturalHeight*(wrap.offsetWidth/(img.naturalWidth||1)); const maxOff=Math.max(0,imgH-wrap.offsetHeight); const newTop=Math.min(0,Math.max(-maxOff,startTop+dy)); img.style.top=newTop+'px'; posY=maxOff>0?(-newTop/maxOff)*100:50; };
  const onUp=()=>{ if(!dragging) return; dragging=false; wrap.style.cursor='grab'; S.aboutPhotoPos=posY.toFixed(1); saveS(); renderPublic(); };
  window.addEventListener('mousemove',onMove); window.addEventListener('mouseup',onUp);
  window.addEventListener('touchmove',onMove,{passive:true}); window.addEventListener('touchend',onUp);
}

// ======= LOGIN =======
function openLogin(){ document.getElementById('loginOv').classList.add('open'); document.getElementById('loginPass').value=''; document.getElementById('loginEmail').value=''; document.getElementById('loginErr').style.display='none'; setTimeout(()=>document.getElementById('loginEmail').focus(),100); }
function closeLogin(){ document.getElementById('loginOv').classList.remove('open'); }
async function doLogin() {
  const email=document.getElementById('loginEmail').value.trim();
  const pass=document.getElementById('loginPass').value;
  const btn=document.getElementById('loginBtn');
  if(!email||!pass){document.getElementById('loginErr').style.display='block';return;}
  btn.textContent='Verificando...'; btn.disabled=true;
  const {error}=await sb.auth.signInWithPassword({email,password:pass});
  btn.textContent='Acceder'; btn.disabled=false;
  if(error){document.getElementById('loginErr').style.display='block'; document.getElementById('loginPass').value='';}
  else{closeLogin();openAdmin();}
}
async function doLogout(){ await sb.auth.signOut(); closeAdmin(); showToast('Sesión cerrada'); }
async function checkSession(){ const {data:{session}}=await sb.auth.getSession(); return session!==null; }
document.getElementById('loginPass').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});
document.getElementById('loginEmail').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('loginPass').focus();});

// ======= ADMIN =======
async function openAdmin(){
  const ok=await checkSession(); if(!ok){openLogin();return;}
  document.getElementById('adminOv').classList.add('open'); document.body.style.overflow='hidden';
  fillForms(); if(S.aboutPhoto) setTimeout(initAboutDragger,300);
}
function closeAdmin(){ document.getElementById('adminOv').classList.remove('open'); document.body.style.overflow=''; }
function switchTab(btn,id){
  document.querySelectorAll('.a-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.a-sec').forEach(s=>s.classList.remove('active'));
  btn.classList.add('active'); document.getElementById(id).classList.add('active');
  if(id==='tp'){renderAdminPhotos();renderUploadCatSelect();}
  if(id==='tc') renderAdminCats();
}
function fillForms(){
  document.getElementById('aN1').value=S.n1; document.getElementById('aN2').value=S.n2;
  document.getElementById('aEye').value=S.eye; document.getElementById('aT1').value=S.t1; document.getElementById('aT2').value=S.t2;
  document.getElementById('aHeroDesc').value=S.heroDesc;
  document.getElementById('aQuote').value=S.quote; document.getElementById('aBio').value=S.bio;
  document.getElementById('aS1').value=S.s1; document.getElementById('aS2').value=S.s2; document.getElementById('aS3').value=S.s3;
  document.getElementById('aSl1').value=S.sl1; document.getElementById('aSl2').value=S.sl2; document.getElementById('aSl3').value=S.sl3;
  document.getElementById('aInsta').value=S.insta; document.getElementById('aFb').value=S.fb;
  document.getElementById('aWatermark').value=S.watermark;
  document.getElementById('aEmail').value=S.email; document.getElementById('aPhone').value=S.phone; document.getElementById('aLoc').value=S.loc;
  document.getElementById('aContactTitle').value=S.contactTitle;
  const hprev=document.getElementById('heroBgPreview');
  if(S.heroBg){hprev.src=S.heroBg;hprev.style.display='block';document.getElementById('heroBgRemove').style.display='inline-block';}
  else{hprev.style.display='none';document.getElementById('heroBgRemove').style.display='none';}
  const aprev=document.getElementById('aboutPhotoPreview');
  if(S.aboutPhoto){aprev.src=S.aboutPhoto;aprev.style.display='block';document.getElementById('aboutPhotoRemove').style.display='inline-block';}
  else{aprev.style.display='none';document.getElementById('aboutPhotoRemove').style.display='none';}
}
function saveSite(){
  S.n1=document.getElementById('aN1').value||S.n1; S.n2=document.getElementById('aN2').value||S.n2;
  S.eye=document.getElementById('aEye').value; S.t1=document.getElementById('aT1').value; S.t2=document.getElementById('aT2').value;
  S.heroDesc=document.getElementById('aHeroDesc').value;
  S.quote=document.getElementById('aQuote').value; S.bio=document.getElementById('aBio').value;
  S.s1=document.getElementById('aS1').value; S.s2=document.getElementById('aS2').value; S.s3=document.getElementById('aS3').value;
  S.sl1=document.getElementById('aSl1').value; S.sl2=document.getElementById('aSl2').value; S.sl3=document.getElementById('aSl3').value;
  S.insta=document.getElementById('aInsta').value||'#'; S.fb=document.getElementById('aFb').value||'#';
  S.watermark=document.getElementById('aWatermark').value;
  saveS(); renderPublic(); showToast('¡Cambios guardados!');
}
function saveContact(){
  S.email=document.getElementById('aEmail').value; S.phone=document.getElementById('aPhone').value; S.loc=document.getElementById('aLoc').value;
  S.contactTitle=document.getElementById('aContactTitle').value;
  saveS(); renderPublic(); showToast('¡Contacto actualizado!');
}

// ======= CONTACT FORM =======
function sendContact(){
  const name=document.getElementById('contactName').value.trim();
  const email=document.getElementById('contactEmail').value.trim();
  const msg=document.getElementById('contactMsg').value.trim();
  if(!name||!email||!msg){showToast('Completa todos los campos');return;}
  showToast('¡Mensaje enviado!');
  document.getElementById('contactName').value='';
  document.getElementById('contactEmail').value='';
  document.getElementById('contactMsg').value='';
}

// ======= TOAST =======
let tT;
function showToast(msg){ const t=document.getElementById('toastEl'); t.textContent=msg; t.classList.add('show'); clearTimeout(tT); tT=setTimeout(()=>t.classList.remove('show'),2800); }

// ======= NAV =======
window.addEventListener('scroll',()=>{ document.getElementById('mainNav').classList.toggle('scrolled',scrollY>50); });
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{ const id=a.getAttribute('href'); if(id==='#')return; e.preventDefault(); document.querySelector(id)?.scrollIntoView({behavior:'smooth'}); });
});

// ======= SECRET ADMIN =======
function checkHash(){ if(window.location.hash==='#admin'){ history.replaceState(null,'',window.location.pathname); openLogin(); } }
window.addEventListener('hashchange',checkHash);

// ======= INIT =======
document.getElementById('yr').textContent = new Date().getFullYear();
(async()=>{
  await loadS();
  renderPublic();
  await loadAll();
  checkHash();
})();
