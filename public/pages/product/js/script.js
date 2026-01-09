fetch('/page/api/pages')
.then(res => res.json())
.then(data => {

  hero.innerHTML = `
    <img src="/public/pages/uploads/${data.pages.page3.image}">
    <div class="hero-content">
      <div class="hero-inner">
        <h1>${data.pages.page3.heading}</h1>
        <p>${data.pages.page3.detail}</p>
      </div>
    </div>
  `;
});

/* PAGINATION VARIABLES */
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 12;
const productsPerRow = 4;

/* FILTER VARIABLES */
let selectedCategories = [];
let selectedSubCategories = [];

function getRibbonClass(text) {
  const s = String(text || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  if (!s) return 'default';
  if (s.includes('trend')) return 'trending';
  if (s.includes('new')) return 'new';
  if (s.includes('offer')) return 'offer';
  if (s.includes('sale') || s.includes('discount')) return 'sale';
  if (s.includes('hot')) return 'hot';
  if (s.includes('feature')) return 'featured';
  if (s.includes('limit')) return 'limited';
  if (s.includes('best')) return 'best';
  return 'default';
}

/* LOAD PRODUCTS */
async function loadProducts(){
  try {
    const res = await fetch('/product/products');
    allProducts = await res.json();
    filteredProducts = [...allProducts];
    buildFilterOptions();
    if (!initFromQuery()) {
      displayPage(1);
      renderPagination();
    }
    // Hide preloader after products are loaded
    if (window.preloaderUtils) {
      window.preloaderUtils.hide();
    }
  } catch (error) {
    console.error('Failed to load products:', error);
    // Hide preloader even on error
    if (window.preloaderUtils) {
      window.preloaderUtils.hide();
    }
  }
}

/* BUILD FILTER OPTIONS */
function buildFilterOptions() {
  const allCats = new Set();
  const allSubCats = new Set();

  allProducts.forEach(p => {
    if (Array.isArray(p.category)) {
      p.category.forEach(c => allCats.add(c));
    } else if (p.category) {
      allCats.add(p.category);
    }

    if (Array.isArray(p.subCategory)) {
      p.subCategory.forEach(sc => allSubCats.add(sc));
    }
  });

  // Build categories filter
  const categoriesDiv = document.getElementById('categoriesList');
  categoriesDiv.innerHTML = '';
  Array.from(allCats).sort().forEach(cat => {
    categoriesDiv.innerHTML += `
      <div class="filter-option">
        <input type="checkbox" id="cat_${cat}" onchange="applyFilters()">
        <label for="cat_${cat}">${cat}</label>
      </div>
    `;
  });

  // Build sub-categories filter
  const subCatsDiv = document.getElementById('subCategoriesList');
  subCatsDiv.innerHTML = '';
  Array.from(allSubCats).sort().forEach(subcat => {
    subCatsDiv.innerHTML += `
      <div class="filter-option">
        <input type="checkbox" id="subcat_${subcat}" onchange="applyFilters()">
        <label for="subcat_${subcat}">${subcat}</label>
      </div>
    `;
  });
}

function initFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('category');
  const sub = params.get('sub');
  let changed = false;
  if (cat) {
    document.querySelectorAll('#categoriesList .filter-option label').forEach(label=>{
      if (label.textContent === cat) {
        const input = document.getElementById('cat_' + cat);
        if (input) {
          input.checked = true;
          changed = true;
          // Update page title
          const titleEl = document.querySelector('.category-title');
          if (titleEl) titleEl.textContent = cat + ' Products';
        }
      }
    });
  }
  if (sub) {
    document.querySelectorAll('#subCategoriesList .filter-option label').forEach(label=>{
      if (label.textContent === sub) {
        const input = document.getElementById('subcat_' + sub);
        if (input) {
          input.checked = true;
          changed = true;
        }
      }
    });
  }
  if (changed) {
    applyFilters();
    return true;
  }
  return false;
}
/* APPLY FILTERS */
function applyFilters() {
  selectedCategories = [];
  selectedSubCategories = [];

  // Get selected categories
  document.querySelectorAll('input[id^="cat_"]:checked').forEach(checkbox => {
    selectedCategories.push(checkbox.id.replace('cat_', ''));
  });

  // Get selected sub-categories
  document.querySelectorAll('input[id^="subcat_"]:checked').forEach(checkbox => {
    selectedSubCategories.push(checkbox.id.replace('subcat_', ''));
  });

  // Filter products
  filteredProducts = allProducts.filter(p => {
    const catMatch = selectedCategories.length === 0 ||
      (Array.isArray(p.category) ? p.category.some(c => selectedCategories.includes(c)) : selectedCategories.includes(p.category));

    const subCatMatch = selectedSubCategories.length === 0 ||
      (Array.isArray(p.subCategory) ? p.subCategory.some(sc => selectedSubCategories.includes(sc)) : false);

    return (selectedCategories.length === 0 && selectedSubCategories.length === 0) ||
           (catMatch && selectedSubCategories.length === 0) ||
           (subCatMatch && selectedCategories.length === 0) ||
           (catMatch && subCatMatch);
  });

  currentPage = 1;
  displayPage(1);
  renderPagination();
  closeFilterPanel();
}

/* RESET FILTERS */
function resetFilters() {
  document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.checked = false;
  });
  selectedCategories = [];
  selectedSubCategories = [];
  filteredProducts = [...allProducts];
  currentPage = 1;
  displayPage(1);
  renderPagination();
  closeFilterPanel();
}

/* TOGGLE FILTER PANEL */
function toggleFilterPanel() {
  const panel = document.getElementById('filterPanel');
  const overlay = document.getElementById('filterOverlay');
  panel.classList.toggle('active');
  overlay.classList.toggle('active');
}

/* CLOSE FILTER PANEL */
function closeFilterPanel() {
  const panel = document.getElementById('filterPanel');
  const overlay = document.getElementById('filterOverlay');
  panel.classList.remove('active');
  overlay.classList.remove('active');
}

/* DISPLAY PRODUCTS FOR CURRENT PAGE */
function displayPage(pageNum) {
  currentPage = pageNum;
  const container = document.getElementById('product-grid');
  container.innerHTML = '';

  if (filteredProducts.length === 0) {
    container.innerHTML = `
      <div class="no-results" style="grid-column: 1/-1;">
        <h3>No Products Found</h3>
        <p>Try adjusting your filters to see more products</p>
      </div>
    `;
    document.getElementById('pageInfo').innerText = 'No products matching your filters';
    renderPagination();
    updatePaginationButtons();
    return;
  }

  const startIdx = (pageNum - 1) * productsPerPage;
  const endIdx = startIdx + productsPerPage;
  const pageProducts = filteredProducts.slice(startIdx, endIdx);

  pageProducts.forEach(p => {
    const ribbonClass = getRibbonClass(p.ribbon);

    let image = p.image.split(/[\\/]/).pop();

    const subCats = Array.isArray(p.subCategory)
      ? p.subCategory.map(sc => `<span class="sub-badge">${sc}</span>`).join('')
      : '';

    const catBadge = Array.isArray(p.category) ? p.category.join(', ') : p.category;

    container.innerHTML += `
      <div class="product-card">
        ${p.ribbon ? `<div class="ribbon ${ribbonClass}">${p.ribbon}</div>` : ''}
        <div class="product-img">
          <img src="/public/pages/uploads/${image}">
        </div>
        <div class="details">
          <h3>${p.name}</h3>
          <div class="meta-row">
            ${catBadge ? `<span class="category-badge">${catBadge}</span>` : ''}
            ${subCats}
          </div>
          <p>${p.description}</p>
          <div class="price">
            <span class="new-price">₹${p.price}</span>
            <span class="old-price">₹${p.oldPrice}</span>
            <span class="discount">${p.discount}% OFF</span>
          </div>
          <div class="delivery">${p.delivery}</div>
          <div class="charge">💸 Delivery Charge: ₹${p.deliveryCharge || 0}</div>
          <div class="stock-badge ${p.stock==='out' ? 'stock-out' : 'stock-in'}">
            ${p.stock==='out' ? 'Out of Stock' : 'In Stock'}
          </div>

          <button class="add-cart" onclick="addToCart('${p._id}')">
            <i class="fas fa-shopping-cart"></i> Add to Cart
          </button>
        </div>
      </div>
    `;
  });

  updatePaginationButtons();
  updatePageInfo();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ================= ADD TO CART ================= */
async function addToCart(productId) {
  try {
    const res = await fetch('/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId })
    });

    // Parse response
    const data = await res.json();

    // Check if user needs to login (401 Unauthorized)
    if (res.status === 401 || !data.success) {
      if (data.message && data.message.includes('login')) {
        // User not logged in
        if (confirm('You are not logged in. Please login first to add items to cart. Click OK to go to login page.')) {
          window.location.href = data.redirect || '/login';
        }
        return;
      }
      
      // Other error
      alert(data.message || 'Failed to add to cart');
      return;
    }

    // Success
    if (data.success) {
      showNotification('Product added to cart successfully!', 'success');
      updateCartCount();
    }

  } catch (error) {
    console.error('Add to cart error:', error);
    // Check if it's a network error or unauthorized
    alert('You need to login first to add items to cart. Redirecting to login page...');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500);
  }
}

/* ================= UPDATE CART COUNT ================= */
async function updateCartCount() {
  try {
    const res = await fetch('/cart/count');
    const data = await res.json();
    
    if (data.success) {
      // Update cart count in navigation if element exists
      const cartCountEl = document.getElementById('cartCount');
      if (cartCountEl) {
        cartCountEl.textContent = data.count;
        if (data.count > 0) {
          cartCountEl.style.display = 'inline-block';
        }
      }
    }
  } catch (error) {
    console.error('Update cart count error:', error);
  }
}

/* ================= SHOW NOTIFICATION ================= */
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `cart-notification cart-notification-${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

/* RENDER PAGINATION BUTTONS */
function renderPagination() {
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const pageNumbersDiv = document.getElementById('pageNumbers');
  pageNumbersDiv.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = 'pagination-btn' + (i === currentPage ? ' active' : '');
    btn.textContent = i;
    btn.onclick = () => displayPage(i);
    pageNumbersDiv.appendChild(btn);
  }
}

/* UPDATE PAGINATION BUTTONS STATE */
function updatePaginationButtons() {
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  document.getElementById('prevBtn').disabled = currentPage === 1 || totalPages === 0;
  document.getElementById('nextBtn').disabled = currentPage === totalPages || totalPages === 0;
}

/* UPDATE PAGE INFO */
function updatePageInfo() {
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startProduct = filteredProducts.length === 0 ? 0 : (currentPage - 1) * productsPerPage + 1;
  const endProduct = Math.min(currentPage * productsPerPage, filteredProducts.length);
  const totalProducts = filteredProducts.length;

  document.getElementById('pageInfo').innerText =
    totalProducts === 0 ? 'No products found' : `Showing ${startProduct}-${endProduct} of ${totalProducts} products`;
}

/* PAGINATION CONTROLS */
function nextPage() {
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  if (currentPage < totalPages) {
    displayPage(currentPage + 1);
  }
}

function previousPage() {
  if (currentPage > 1) {
    displayPage(currentPage - 1);
  }
}

window.addEventListener('DOMContentLoaded', loadProducts);
