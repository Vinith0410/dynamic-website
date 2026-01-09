const grid = document.getElementById('productGrid');

/* ===== LOAD PRODUCTS ===== */
async function loadProducts(){
    try{
        const res = await fetch('/product/products');
        const products = await res.json();

        if(!products.length){
            grid.innerHTML = '<div class="empty">No products found</div>';
            return;
        }

        products.forEach(p=>{
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

            card.innerHTML = `
                ${p.ribbon ? `<div class="ribbon ${ribbonClass}">${p.ribbon}</div>` : ``}

                <div class="image-box">
                    <img src="/public/pages/uploads/${p.image}" alt="${p.name}">
                </div>

                <div class="content">
                    <div class="title">${p.name}</div>

                    <div class="meta">
                        <strong>Category:</strong> ${p.category.join(', ')}<br>
                        <strong>Sub Category:</strong> ${p.subCategory.join(', ')}
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

    }catch(err){
        console.error(err);
        grid.innerHTML = '<div class="empty">Failed to load products</div>';
    }
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