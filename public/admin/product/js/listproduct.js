const grid = document.getElementById('productGrid');
const categorySelect = document.getElementById('filterCategory');
const ribbonSelect = document.getElementById('filterRibbon');
const keySelect = document.getElementById('filterKey');
const valueInput = document.getElementById('filterValue');

let allProducts = [];

async function loadProducts(){
    try{
        const res = await fetch('/product/products');
        allProducts = await res.json();

        if(!allProducts.length){
            grid.innerHTML = '<div class="empty">No products found</div>';
            return;
        }

        buildCategoryOptions();
        buildRibbonOptions();
        renderProducts(allProducts);

        categorySelect.addEventListener('change', applyFilters);
        ribbonSelect.addEventListener('change', applyFilters);
        keySelect.addEventListener('change', applyFilters);
        valueInput.addEventListener('input', applyFilters);

    }catch(err){
        console.error(err);
        grid.innerHTML = '<div class="empty">Failed to load products</div>';
    }
}

function buildCategoryOptions(){
    const set = new Set();
    allProducts.forEach(p=>{
        if(Array.isArray(p.category)){
            p.category.forEach(c=>set.add(c));
        }else if(p.category){
            set.add(p.category);
        }
    });
    Array.from(set).sort().forEach(cat=>{
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        categorySelect.appendChild(opt);
    });
}

function buildRibbonOptions(){
    const set = new Set();
    allProducts.forEach(p=>{
        if (p.ribbon) {
            set.add(p.ribbon);
        }
    });
    Array.from(set).sort().forEach(r=>{
        const opt = document.createElement('option');
        opt.value = r;
        opt.textContent = r;
        ribbonSelect.appendChild(opt);
    });
}

function renderProducts(list){
    grid.innerHTML = '';

    if(!list.length){
        grid.innerHTML = '<div class="empty">No products found</div>';
        return;
    }

    list.forEach(p=>{
        const card = document.createElement('div');
        card.className = 'product-card';

        const ribbonClass =
          p.ribbon === 'Trending' ? 'trending' :
          p.ribbon === 'New Arrival' ? 'new' :
          p.ribbon === 'Sale' ? 'sale' :
          p.ribbon === 'Hot' ? 'hot' :
          p.ribbon === 'Featured' ? 'featured' :
          p.ribbon === 'Limited' ? 'limited' :
          p.ribbon === 'Best' ? 'best' :
          p.ribbon === 'Offer' ? 'offer' : '';

        const categoriesText = Array.isArray(p.category) ? p.category.join(', ') : (p.category || '');
        const subCategoriesText = Array.isArray(p.subCategory) ? p.subCategory.join(', ') : (p.subCategory || '');

        const rawColors = Array.isArray(p.colors) ? p.colors : (p.colors ? [p.colors] : []);
        const hasCustomColors = rawColors.length && !(rawColors.length === 1 && rawColors[0] === '#000000');
        const colorsText = hasCustomColors ? rawColors.join(', ') : 'Default product color';

        card.innerHTML = `
            ${p.ribbon ? `<div class="ribbon ${ribbonClass}">${p.ribbon}</div>` : ``}

            <div class="image-box">
                <img src="/public/pages/uploads/${p.image}" alt="${p.name}">
            </div>

            <div class="content">
                <div class="title">${p.name}</div>

                <div class="meta">
                    <strong>ID:</strong> ${p._id}<br>
                    <strong>Category:</strong> ${categoriesText}<br>
                    <strong>Sub Category:</strong> ${subCategoriesText}<br>
                    <strong>Colors:</strong> ${colorsText}
                </div>

                <div class="desc">${p.description}</div>

                <div class="price-box">
                    <div class="price">₹${p.price}</div>
                    <div class="old-price">₹${p.oldPrice}</div>
                    ${p.discount ? `<div class="discount">${p.discount}% OFF</div>` : ``}
                </div>

                <div class="delivery">🚚 ${p.delivery}</div>
                <div class="charge">💸 Delivery Charge: ₹${p.deliveryCharge || 0}</div>
                <div class="stock-badge ${p.stock==='out' ? 'stock-out' : 'stock-in'}">
                  ${p.stock==='out' ? 'Out of Stock' : 'In Stock'}
                </div>

                <div class="date">
                    Added on: ${new Date(p.createdAt).toLocaleDateString()}
                </div>

                <div class="actions">
                    <button class="edit" onclick="editProduct('${p._id}')">Edit</button>
                    <button class="delete" onclick="deleteProduct('${p._id}')">Delete</button>
                </div>
            </div>
        `;

        grid.appendChild(card);
    });
}

function applyFilters(){
    let list = [...allProducts];

    const cat = categorySelect.value;
    const rib = ribbonSelect.value;
    const key = keySelect.value;
    const value = valueInput.value.trim().toLowerCase();

    if(cat){
        list = list.filter(p=>{
            if(Array.isArray(p.category)){
                return p.category.includes(cat);
            }
            return p.category === cat;
        });
    }

    if(rib){
        list = list.filter(p=> (p.ribbon || '') === rib);
    }

    if(value){
        if(key === 'id'){
            list = list.filter(p=> (p._id || '').toLowerCase().includes(value));
        }else if(key === 'name'){
            list = list.filter(p=> (p.name || '').toLowerCase().includes(value));
        }
    }

    renderProducts(list);
}

/* ===== EDIT ===== */
function editProduct(id){
    window.location.href = '/edit-product?id=' + id;
}

/* ===== DELETE ===== */
async function deleteProduct(id){
    if(!confirm('Are you sure you want to delete this product permanently?')) return;

    const res = await fetch('/product/api/product/delete/' + id, { method:'POST' });
    const data = await res.json();

    if(data.success){
        alert('Product deleted successfully ✅');
        location.reload();
    }else{
        alert('Delete failed ❌');
    }
}

loadProducts();
