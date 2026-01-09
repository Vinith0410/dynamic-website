const productId = new URLSearchParams(location.search).get('id');

let categoriesData = [];
let productData = null;

/* ===== LOAD INITIAL DATA ===== */
async function init(){
    await loadCategories();
    await loadRibbons();
    await loadProduct();
}

/* ===== LOAD PRODUCT ===== */
async function loadProduct(){
    const res = await fetch('/product/api/product/' + productId);
    productData = await res.json();

    document.getElementById('editForm').action =
        '/product/api/product/update/' + productId;

    previewImage.src = '/public/pages/uploads/' + productData.image;

    editForm.name.value = productData.name;
    editForm.description.value = productData.description;
    editForm.price.value = productData.price;
    editForm.oldPrice.value = productData.oldPrice;
    editForm.discount.value = productData.discount;
    editForm.delivery.value = productData.delivery;
    editForm.deliveryCharge.value = productData.deliveryCharge || '';
    document.querySelectorAll('input[name="stock"]').forEach(inp=>{
        inp.checked = (inp.value === (productData.stock || 'in'));
    });

    // ribbon
    ribbonSelect.value = productData.ribbon || '';

    // categories
    productData.category.forEach(c => addCategory(c));
    productData.subCategory.forEach(s => addSubCategory(s));

    updateSubCategories();
}

/* ===== LOAD CATEGORIES ===== */
async function loadCategories(){
    const res = await fetch('/category/api/categories');
    categoriesData = await res.json();
}

/* ===== LOAD RIBBONS ===== */
async function loadRibbons(){
    const res = await fetch('/rippon/api/ribbons');
    const ribbons = await res.json();
    ribbons.forEach(r=>{
        const opt = document.createElement('option');
        opt.value = r;
        opt.textContent = r;
        ribbonSelect.appendChild(opt);
    });
}

/* ===== CATEGORY ===== */
function addCategory(value=''){
    const group = document.createElement('div');
    group.className='field-group';

    const select = document.createElement('select');
    select.name='category[]';
    select.onchange=updateSubCategories;

    select.innerHTML='<option value="">Select Category</option>';
    categoriesData.forEach(c=>{
        const opt=document.createElement('option');
        opt.value=c.category;
        opt.textContent=c.category;
        if(c.category===value) opt.selected=true;
        select.appendChild(opt);
    });

    const remove=document.createElement('button');
    remove.type='button';
    remove.className='icon-btn remove';
    remove.textContent='✖';
    remove.onclick=()=>{group.remove();updateSubCategories();};

    group.append(select,remove);
    categoryContainer.appendChild(group);
}

/* ===== SUB CATEGORY ===== */
function addSubCategory(value=''){
    const group=document.createElement('div');
    group.className='field-group';

    const select=document.createElement('select');
    select.name='subCategory[]';

    const remove=document.createElement('button');
    remove.type='button';
    remove.className='icon-btn remove';
    remove.textContent='✖';
    remove.onclick=()=>group.remove();

    group.append(select,remove);
    subCategoryContainer.appendChild(group);

    updateSubCategories(value);
}

/* ===== UPDATE SUB CATEGORIES ===== */
function updateSubCategories(selected=''){
    const selectedCats=[...document.querySelectorAll('select[name="category[]"]')]
        .map(s=>s.value).filter(Boolean);

    let subs=[];
    categoriesData.forEach(c=>{
        if(selectedCats.includes(c.category)){
            subs=subs.concat(c.subCategories || []);
        }
    });
    subs=[...new Set(subs)];

    document.querySelectorAll('select[name="subCategory[]"]').forEach(select=>{
        const prev=select.value;
        select.innerHTML='<option value="">Select Sub Category</option>';
        subs.forEach(s=>{
            const opt=document.createElement('option');
            opt.value=s;
            opt.textContent=s;
            if(s===prev || s===selected) opt.selected=true;
            select.appendChild(opt);
        });
    });
}

/* ===== DISCOUNT ===== */
function calcDiscount(){
    const p=+priceInput.value;
    const o=+oldPriceInput.value;
    discountInput.value = (o>p) ? Math.round(((o-p)/o)*100) : 0;
}
priceInput.oninput=calcDiscount;
oldPriceInput.oninput=calcDiscount;

/* ===== IMAGE PREVIEW ===== */
imageInput.onchange=()=>{
    const f=imageInput.files[0];
    if(f) previewImage.src=URL.createObjectURL(f);
};

init();