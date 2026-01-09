let pagesData;
let ribbons=[];
let categories=[];

/* LOAD DATA */
Promise.all([
  fetch('/page/api/pages').then(r=>r.json()),
  fetch('/rippon/api/ribbons').then(r=>r.json()),
  fetch('/category/api/categories').then(r=>r.json())
]).then(([p,r,c])=>{
  pagesData=p.pages;
  ribbons=r;
  categories=c.map(x=>x.category); // ✅ BACKEND DATA
  buildTabs();
  buildSections();
  openTab(0);
});

/* TABS */
function buildTabs(){
  const t=document.getElementById('tabs');
  Object.keys(pagesData).forEach((k,i)=>{
    const d=document.createElement('div');
    d.className='tab'+(i===0?' active':'');
    d.innerText=k;
    d.onclick=()=>openTab(i);
    t.appendChild(d);
  });
}
function openTab(i){
  document.querySelectorAll('.tab').forEach((t,idx)=>t.classList.toggle('active',idx===i));
  document.querySelectorAll('.section').forEach((s,idx)=>s.classList.toggle('active',idx===i));
}

/* SECTIONS */
function buildSections(){
  const c=document.getElementById('sections');
  c.innerHTML='';
  Object.entries(pagesData).forEach(([k,v])=>{
    const s=document.createElement('div');
    s.className='section';
    s.innerHTML=renderObject(v,k,k);
    c.appendChild(s);
  });
}

/* RENDER */
function renderObject(obj,title,path){
  let html=`<div class="card"><h3>${title}</h3>`;
  let i=1;
  Object.entries(obj).forEach(([k,v])=>{
    html+=renderValue(v,`${i++}. ${k}`,`${path}.${k}`);
  });
  return html+'</div>';
}

function renderValue(v,label,path){
  if(v==null) return '';
  if(Array.isArray(v)){
    return v.map((x,i)=>renderValue(x,`${label}.${i+1}`,`${path}.${i}`)).join('');
  }
  if(typeof v==='object'){
    return renderObject(v,label,path);
  }

  const isImg=/\.(png|jpg|jpeg|webp)$/i.test(v);
  return `
  <div class="field">
    <div class="field-left">
      <strong>${label}</strong><br>
      ${isImg?`<img src="/public/pages/uploads/${v}" class="image-preview">`:`<span>${v}</span>`}
    </div>
    <div class="actions">
      <button class="btn edit" onclick="editField('${path}','${v}')">Edit</button>
      <button class="btn delete" onclick="deleteField('${path}','${v}','${isImg?'image':'text'}')">Delete</button>
    </div>
  </div>`;
}

/* EDIT */
function editField(path,value){
  const m=modal();
  const b=m.querySelector('.modal-body');
  b.innerHTML='';

  /* IMAGE WITH PREVIEW */
  if(/\.(png|jpg|jpeg|webp)$/i.test(value)){
    const img=document.createElement('img');
    img.src='/uploads/'+value;
    img.style.width='100%';
    img.style.maxHeight='220px';
    img.style.objectFit='contain';
    img.style.border='1px solid #e5e7eb';
    img.style.borderRadius='8px';
    img.style.marginBottom='10px';

    const input=document.createElement('input');
    input.type='file';
    input.id='imgFile';
    input.accept='image/*';

    /* LIVE PREVIEW */
    input.onchange=()=>{
      if(input.files[0]){
        img.src=URL.createObjectURL(input.files[0]);
      }
    };

    b.append(img,input);
  }

  /* RIBBON */
  else if(path.toLowerCase().includes('ribbon')){
    b.append(selectBox(ribbons,value));
  }

  /* CATEGORY */
  else if(path.includes('.categories.')){
    b.append(selectBox(categories,value));
  }

  /* TEXT */
  else{
    const t=document.createElement('textarea');
    t.value=value;
    b.appendChild(t);
  }

  m.querySelector('.save').onclick=()=>save(path,b);
  m.style.display='flex';
}

/* SELECT */
function selectBox(data,val){
  const s=document.createElement('select');
  data.forEach(d=>{
    const o=new Option(d,d,d===val,d===val);
    s.appendChild(o);
  });
  return s;
}

/* SAVE */
async function save(path,b){
  const fd=new FormData();
  fd.append('path',path);
  const f=b.querySelector('#imgFile');
  if(f){
    if(!f.files[0]) return alert('Select image');
    fd.append('file',f.files[0]);
  }else{
    fd.append('value',b.querySelector('select,textarea').value);
  }
  await fetch('/product/api/pages/update-field',{method:'POST',body:fd});
  location.reload();
}

/* DELETE */
async function deleteField(path,value,type){
  if(!confirm('Delete field?')) return;
  await fetch('/product/api/pages/delete',{
    method:'DELETE',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({path,value,type})
  });
  location.reload();
}

/* MODAL */
function modal(){
  let m=document.getElementById('modal');
  if(m) return m;
  m=document.createElement('div');
  m.id='modal';
  m.className='modal-overlay';
  m.innerHTML=`
  <div class="modal">
    <div class="modal-header">
      Edit
      <button onclick="this.closest('.modal-overlay').style.display='none'">✖</button>
    </div>
    <div class="modal-body"></div>
    <div class="modal-footer">
      <button class="btn edit save">Save</button>
    </div>
  </div>`;
  document.body.appendChild(m);
  return m;
}