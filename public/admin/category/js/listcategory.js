let editId = null;
let oldImage = '';

/* LOAD */
async function loadManageCategories(){
  const res = await fetch('/category/api/categories');
  const categories = await res.json();
  const container = document.getElementById('category-manager-grid');
  container.innerHTML = '';

  categories.forEach(cat=>{
    const img = cat.categoryImage
      ? `/public/pages/uploads/${cat.categoryImage.split(/[\\/]/).pop()}`
      : 'https://via.placeholder.com/60';

    const subs = cat.subCategories.map(sub=>`
      <span class="sub-tag">
        ${sub}
        <button onclick="editSubCategory('${cat._id}','${sub}')">✏️</button>
        <button onclick="deleteSubCategory('${cat._id}','${sub}')">🗑</button>
      </span>
    `).join('');

    container.innerHTML += `
      <div class="manage-card">
        <div class="manage-header">
          <img src="${img}" class="manage-img">
          <div class="manage-title">${cat.category}</div>
          <div class="header-actions">
            <button class="btn-sm btn-outline"
              onclick="openEdit('${cat._id}','${cat.category}','${img}')">Edit</button>
            <button class="btn-sm btn-danger"
              onclick="deleteCategory('${cat._id}')">Delete</button>
          </div>
        </div>

        <div class="sub-list">${subs}</div>

        <div class="add-sub-form">
          <input class="add-sub-input" id="sub-${cat._id}" placeholder="New Subcategory">
          <button class="btn-sm" onclick="addSubCategory('${cat._id}')">Add</button>
        </div>
      </div>
    `;
  });
}

/* ===== POPUP ===== */
function openEdit(id,name,img){
  editId = id;
  oldImage = img;
  document.getElementById('editName').value = name;
  document.getElementById('editPreview').src = img;
  document.getElementById('editImage').value = '';
  document.getElementById('editModal').style.display = 'flex';
}

function closeModal(){
  document.getElementById('editModal').style.display = 'none';
}

/* LIVE IMAGE PREVIEW */
document.getElementById('editImage').addEventListener('change',e=>{
  const file = e.target.files[0];
  if(file){
    document.getElementById('editPreview').src = URL.createObjectURL(file);
  }
});

/* SAVE */
async function saveEdit(){
  const name = document.getElementById('editName').value.trim();
  const image = document.getElementById('editImage').files[0];

  if(name){
    await fetch('/category/api/edit-category',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({categoryId:editId,newName:name})
    });
  }

  if(image){
    const fd = new FormData();
    fd.append('categoryId',editId);
    fd.append('image',image);
    await fetch('/category/api/edit-category-image',{method:'POST',body:fd});
  }

  closeModal();
  loadManageCategories();
}

/* EXISTING FUNCTIONS (UNCHANGED) */
async function addSubCategory(id){
  const val=document.getElementById(`sub-${id}`).value.trim();
  if(!val) return;
  await fetch('/category/api/add-subcategory',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({categoryId:id,subCategory:val})
  });
  loadManageCategories();
}

async function deleteCategory(id){
  if(!confirm('Delete category?')) return;
  await fetch('/category/api/delete-category',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({categoryId:id})
  });
  loadManageCategories();
}

async function editSubCategory(id,old){
  const name=prompt('Edit subcategory',old);
  if(!name) return;
  await fetch('/category/api/edit-subcategory',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({categoryId:id,oldSubCategory:old,newSubCategory:name})
  });
  loadManageCategories();
}

async function deleteSubCategory(id,sub){
  if(!confirm('Delete subcategory?')) return;
  await fetch('/category/api/delete-subcategory',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({categoryId:id,subCategory:sub})
  });
  loadManageCategories();
}

window.onload = loadManageCategories;