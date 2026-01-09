
async function loadRibbons() {
    try {
        const res = await fetch('/rippon/api/ribbons');
        const ribbons = await res.json();
        // console.log(ribbons)
        const selects = [
            document.getElementById('ribbonSelect1'),
            document.getElementById('ribbonSelect2')
        ];

        selects.forEach(select => {
            select.innerHTML = '<option value="">Select Ribbon</option>';

            ribbons.forEach(ribbon => {
                const option = document.createElement('option');
                option.value = ribbon;
                option.textContent =
                    ribbon.charAt(0).toUpperCase() + ribbon.slice(1);
                select.appendChild(option);
            });
        });

    } catch (err) {
        console.error('Ribbon load failed', err);
    }
}

loadRibbons();

/* ================= CATEGORY LOGIC ================= */
let allCategories = [];
let categorySelects = [];

async function loadCategories() {
    const res = await fetch('/category/api/categories');
    const data = await res.json();
    allCategories = data.map(c => c.category);
}
loadCategories();

document.getElementById('categoryCount').addEventListener('input', generateCategoryFields);

function generateCategoryFields() {
    const count = parseInt(this.value);
    const container = document.getElementById('categoryContainer');
    container.innerHTML = '';
    categorySelects = [];

    if (!count || count < 1) return;

    for (let i = 1; i <= count; i++) {
        const label = document.createElement('label');
        label.textContent = `Category ${i}`;

        const select = document.createElement('select');
        select.name = `category${i}`;
        select.addEventListener('change', renderDropdowns);

        container.appendChild(label);
        container.appendChild(select);

        categorySelects.push(select);
    }

    renderDropdowns();
}

function renderDropdowns() {
    const selectedValues = categorySelects.map(sel => sel.value);

    categorySelects.forEach((select, index) => {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Select Category</option>';

        allCategories.forEach(cat => {
            const usedElsewhere = selectedValues.some((v, i) => i !== index && v === cat);
            if (!usedElsewhere || cat === currentValue) {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
                if (cat === currentValue) option.selected = true;
                select.appendChild(option);
            }
        });
    });
}

/* QUICK LINKS */
fetch('/page/api/pages')
.then(res=>res.json())
.then(data=>{
  const ul=document.getElementById('quickLinks');
  if(!data?.pages) return;

  Object.values(data.pages).forEach(p=>{
    if(p?.title){
      const li=document.createElement('li');
      li.textContent=p.title;
      ul.appendChild(li);
    }
  });
});

/* CATEGORIES */
fetch('/category/api/categories')
.then(res=>res.json())
.then(data=>{
  const ul=document.getElementById('categoryLinks');
  data.slice(0,5).forEach(c=>{
    const li=document.createElement('li');
    li.textContent=c.category;
    ul.appendChild(li);
  });
});