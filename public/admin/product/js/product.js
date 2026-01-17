
let categoriesData = [];

/* LOAD CATEGORIES */
async function loadCategories(){
    const res = await fetch('/category/api/categories');
    categoriesData = await res.json();
    addCategory();
    addSubCategory();
}

/* LOAD RIBBONS */
async function loadRibbons(){
    try {
        const res = await fetch('/rippon/api/ribbons');
        const ribbons = await res.json();
        const select = document.getElementById('ribbonSelect');
        ribbons.forEach(r => {
            const opt = document.createElement('option');
            opt.value = r;
            opt.textContent = r;
            select.appendChild(opt);
        });
    } catch(err) {
        console.error('Failed to load ribbons', err);
    }
}

loadCategories();
loadRibbons();
addColor();

/* DISCOUNT CALCULATION */
const priceInput = document.getElementById('priceInput');
const oldPriceInput = document.getElementById('oldPriceInput');
const discountInput = document.getElementById('discountInput');

function calculateDiscount() {
    const price = parseFloat(priceInput.value);
    const oldPrice = parseFloat(oldPriceInput.value);

    if (price && oldPrice && oldPrice > price) {
        const discount = ((oldPrice - price) / oldPrice) * 100;
        discountInput.value = Math.round(discount);
    } else {
        discountInput.value = 0;
    }
}

priceInput.addEventListener('input', calculateDiscount);
oldPriceInput.addEventListener('input', calculateDiscount);

/* CATEGORY */
function addCategory(){
    const container = document.getElementById('categoryContainer');

    const group = document.createElement('div');
    group.className = 'field-group';

    const select = document.createElement('select');
    select.name = 'category[]';
    select.onchange = updateSubCategories;

    select.innerHTML = '<option value="">Select Category</option>';
    categoriesData.forEach(c=>{
        const opt = document.createElement('option');
        opt.value = c.category;
        opt.textContent = c.category;
        select.appendChild(opt);
    });

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'icon-btn remove';
    remove.textContent = '✖';
    remove.onclick = ()=>{
        group.remove();
        updateSubCategories();
    };

    group.append(select, remove);
    container.appendChild(group);
}

/* SUB CATEGORY */
function addSubCategory(){
    const container = document.getElementById('subCategoryContainer');

    const group = document.createElement('div');
    group.className = 'field-group';

    const select = document.createElement('select');
    select.name = 'subcategory[]';

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'icon-btn remove';
    remove.textContent = '✖';
    remove.onclick = ()=> group.remove();

    group.append(select, remove);
    container.appendChild(group);

    updateSubCategories();
}

function addColor(value=''){
    const container = document.getElementById('colorContainer');

    const group = document.createElement('div');
    group.className = 'field-group';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.name = 'colors';
    nameInput.placeholder = 'Color name or hex code';
    nameInput.value = value || '';

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'icon-btn remove';
    remove.textContent = '✖';
    remove.onclick = ()=> group.remove();

    group.append(nameInput, remove);
    container.appendChild(group);
}

/* 🔥 CORE FIXED LOGIC */
function updateSubCategories(){
    const selectedCategories = [...document.querySelectorAll('select[name="category[]"]')]
        .map(s => s.value)
        .filter(Boolean);

    let allSubCategories = [];

    categoriesData.forEach(cat => {
        if (selectedCategories.includes(cat.category)) {
            // Use subCategories (plural) as per API response
            if (cat.subCategories && Array.isArray(cat.subCategories)) {
                allSubCategories = allSubCategories.concat(cat.subCategories);
            }
        }
    });

    // Remove duplicates
    allSubCategories = [...new Set(allSubCategories)];

    document.querySelectorAll('select[name="subcategory[]"]').forEach(select=>{
        const prev = select.value;
        select.innerHTML = '<option value="">Select Sub Category</option>';

        allSubCategories.forEach(sub=>{
            const opt = document.createElement('option');
            opt.value = sub;
            opt.textContent = sub;
            if(sub === prev) opt.selected = true;
            select.appendChild(opt);
        });
    });
}

/* IMAGE PREVIEW */
imageInput.addEventListener('change',()=>{
    const file = imageInput.files[0];
    if(file){
        previewImage.src = URL.createObjectURL(file);
        previewImage.style.display='block';
        document.querySelector('.preview-text').style.display='none';
    }
});
