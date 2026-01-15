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
  const savedTab=localStorage.getItem('pageListActiveTab');
  const idx=savedTab!==null?parseInt(savedTab,10):0;
  const tabsCount=Object.keys(pagesData).length;
  const finalIdx=Number.isNaN(idx)||idx<0||idx>=tabsCount?0:idx;
  openTab(finalIdx);
  const savedScroll=localStorage.getItem('pageListScroll');
  if(savedScroll!==null){
    const y=parseInt(savedScroll,10);
    if(!Number.isNaN(y)) window.scrollTo(0,y);
  }
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
  localStorage.setItem('pageListActiveTab',String(i));
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
  const key=(path.split('.').pop()||'').toLowerCase();
  if(v==null){
    const isImageField = key==='file' || key.includes('img') || key.includes('image');
    if(!isImageField) return '';
    return `
    <div class="field">
      <div class="field-left">
        <strong>${label}</strong><br>
        <span>No image found. Please upload image.</span>
      </div>
      <div class="actions">
        <button class="btn edit" onclick="editField('${path}','')">Edit</button>
      </div>
    </div>`;
  }

  /* ARRAY HANDLING */
  if(Array.isArray(v)){
    const itemsHtml = v.map((x,i)=>renderValue(x,`${label}.${i+1}`,`${path}.${i}`)).join('');

    let addButton = '';
    const lastKey = path.split('.').pop();
    if(lastKey === 'ribbons' || lastKey === 'categories' || lastKey === 'feedbacks' || path.includes('quickLinks')){
        addButton = `
        <div class="array-actions" style="margin: 10px 0; padding-left: 20px;">
            <button class="btn edit" onclick="addArrayItem('${path}', '${lastKey}')">
                + Add to ${lastKey}
            </button>
        </div>`;
    }

    return `
    <div class="array-container">
        <div class="array-header" style="font-weight:bold; margin-top:10px;">${label} (${v.length} items)</div>
        ${itemsHtml}
        ${addButton}
    </div>`;
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

  const lowerPath=path.toLowerCase();
  const isImageField = lowerPath.endsWith('.file') || lowerPath.includes('img') || lowerPath.includes('image');

  /* IMAGE WITH PREVIEW */
  if(/\.(png|jpg|jpeg|webp)$/i.test(value) || isImageField){
    if(value && /\.(png|jpg|jpeg|webp)$/i.test(value)){
      const img=document.createElement('img');
      img.src='/uploads/'+value;
      img.style.width='100%';
      img.style.maxHeight='220px';
      img.style.objectFit='contain';
      img.style.border='1px solid #e5e7eb';
      img.style.borderRadius='8px';
      img.style.marginBottom='10px';
      b.appendChild(img);
    }

    const input=document.createElement('input');
    input.type='file';
    input.id='imgFile';
    input.accept='image/*';

    input.onchange=()=>{
      const preview=b.querySelector('img');
      if(input.files[0] && preview){
        preview.src=URL.createObjectURL(input.files[0]);
      }
    };

    b.appendChild(input);
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
  const res=await fetch('/page/api/pages/update-field',{method:'POST',body:fd});
  if(res.ok){
    alert('Updated successfully ✅');
  }else{
    alert('Update failed ❌');
  }
  localStorage.setItem('pageListScroll',String(window.scrollY));
  location.reload();
}

/* DELETE */
async function deleteField(path,value,type){
  if(!confirm('Delete field?')) return;
  const res=await fetch('/page/api/pages/delete',{
    method:'DELETE',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({path,value,type})
  });
  if(res.ok){
    alert('Deleted successfully ✅');
  }else{
    alert('Delete failed ❌');
  }
  localStorage.setItem('pageListScroll',String(window.scrollY));
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

/* ADD ITEM */
function addArrayItem(path, type){
    const m = modal();
    const b = m.querySelector('.modal-body');

    b.innerHTML = '';

    if(type === 'feedbacks' || path.toLowerCase().includes('feedbacks')){
        const nameInput=document.createElement('input');
        nameInput.type='text';
        nameInput.name='fb-name';
        nameInput.placeholder='Name';
        const mailInput=document.createElement('input');
        mailInput.type='email';
        mailInput.name='fb-mail';
        mailInput.placeholder='Email';
        const msgArea=document.createElement('textarea');
        msgArea.name='fb-msg';
        msgArea.placeholder='Feedback';
        b.append(nameInput,mailInput,msgArea);
    } else if(type === 'ribbons' || path.toLowerCase().includes('ribbon')){
        b.append(selectBox(ribbons, ''));
    } else if(type === 'categories' || path.toLowerCase().includes('categories')){
        b.append(selectBox(categories, ''));
    } else {
        const t = document.createElement('textarea');
        t.placeholder = 'Enter value';
        b.appendChild(t);
    }

    m.querySelector('.save').onclick = () => saveNewItem(path, b);
    m.style.display = 'flex';
}

async function saveNewItem(path, b){
    let payloadValue;

    if(path.toLowerCase().includes('feedbacks')){
        const nameInput=b.querySelector('input[name=\"fb-name\"]');
        const mailInput=b.querySelector('input[name=\"fb-mail\"]');
        const msgArea=b.querySelector('textarea[name=\"fb-msg\"]');
        const name=(nameInput?.value || '').trim();
        const mail=(mailInput?.value || '').trim();
        const msg=(msgArea?.value || '').trim();
        if(!name || !msg) return alert('Name and feedback required');
        payloadValue={ name, mail, message: msg };
    }else{
        const field=b.querySelector('select,textarea');
        const val=field?field.value:'';
        if(!val) return alert('Value cannot be empty');
        payloadValue=val;
    }

    const res=await fetch('/page/api/pages/add-array-item', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ path, value: payloadValue })
    });
    if(res.ok){
      alert('Added successfully ✅');
    }else{
      alert('Add failed ❌');
    }
    localStorage.setItem('pageListScroll',String(window.scrollY));
    location.reload();
}
