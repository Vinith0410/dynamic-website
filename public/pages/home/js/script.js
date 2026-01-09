/* ================= GLOBAL VARS ================= */
let current = 0;

const primaryRibbonSection = document.getElementById('primaryRibbonSection');
const primaryRibbonTitle = document.getElementById('primaryRibbonTitle');
const primaryRibbonGrid = document.getElementById('primaryRibbonGrid');

const secondaryRibbonSection = document.getElementById('secondaryRibbonSection');
const secondaryRibbonTitle = document.getElementById('secondaryRibbonTitle');
const secondaryRibbonGrid = document.getElementById('secondaryRibbonGrid');

/* ================= NAV ================= */
function toggleMenu() {
  navLinks.classList.toggle('show');
}

/* ================= PAGE DATA ================= */
function loadPageData() {
  return fetch('/page/api/pages')
    .then(res => res.json())
    .then(data => {

      /* ===== SLIDER ===== */
      slider.innerHTML = data.pages.page1.images.map(img => `
        <div class="slide">
          <img src="/public/pages/uploads/${img.file}">
          <div class="hero-content">
            <div class="hero-inner">
              <h1>${img.heading}</h1>
              <p>${img.detail}</p>
              <button>${img.button}</button>
            </div>
          </div>
        </div>
      `).join('');

      const slides = document.querySelectorAll('.slide');
      if (slides.length) {
        slides[0].classList.add('active');
        setInterval(() => {
          slides[current].classList.remove('active');
          current = (current + 1) % slides.length;
          slides[current].classList.add('active');
        }, 4000);
      }

      /* ===== ABOUT ===== */
      sections.innerHTML = data.pages.page1.sections
        .filter(sec => sec.name && sec.details)
        .map(sec => `
          <div class="about-card">
            <div class="about-card-image">
              <img src="/public/pages/uploads/${sec.file}">
              <div class="image-overlay"></div>
            </div>
            <div class="about-card-content">
              <h3>${sec.name}</h3>
              <p>${sec.details}</p>
              <a href="/about" class="about-btn">${sec.button}</a>
            </div>
          </div>
        `).join('');

      /* ===== SPECIALITIES ===== */
      const specialities = data.pages?.page1?.specialities || [];
      if (specialities.length) {
        const sw = document.createElement('div');
        sw.className = 'specialities-wrapper';
        sw.innerHTML = `
          <h2 class="specialities-title">Our Specialities</h2>
          <div class="specialities-grid">
            ${specialities.map(sp => `
              <div class="speciality-card">
                <div class="speciality-image">
                  <img src="/public/pages/uploads/${sp.image}">
                </div>
                <div class="speciality-content">
                  <div class="speciality-title">${sp.title || ''}</div>
                  <div class="speciality-subtitle">${sp.subtitle || ''}</div>
                </div>
              </div>
            `).join('')}
          </div>
        `;
        document.querySelector('.section-cards').appendChild(sw);
      }

      /* ===== FEEDBACK ===== */
      const feedbacks = (data.pages?.page1?.feedbacks || []).filter(f => f?.message);
      if (feedbacks.length) {
        feedbackList.innerHTML = feedbacks.map(f => `
          <div class="feedback-card">
            <div class="feedback-header">${f.name || ''}</div>
            <div class="feedback-msg">${f.message}</div>
          </div>
        `).join('');
        feedbackSection.style.display = "block";
      }
    });
}

/* ================= CATEGORIES ================= */
async function loadCategories() {
  const pageRes = await fetch('/page/api/pages');
  const pageData = await pageRes.json();
  const selected = pageData.pages?.page1?.categories || [];

  const catRes = await fetch('/category/categories-view');
  const allCategories = await catRes.json();

  const container = document.getElementById('categoryContainer');
  container.innerHTML = '';

  const categories = selected.length
    ? selected.map(n => allCategories.find(c => c.category === n)).filter(Boolean)
    : allCategories.slice(0, 8);

  categories.forEach(cat => {
    container.innerHTML += `
      <div class="category-item"
        onclick="location.href='/our-product?category=${encodeURIComponent(cat.category)}'">
        <img src="/public/pages/uploads/${cat.categoryImage}">
        <div class="category-name">${cat.category}</div>
      </div>
    `;
  });
}

/* ================= RIBBONS ================= */
async function loadHomeRibbonProducts() {
  const res = await fetch('/rippon/api/home-ribbon-products');
  const data = await res.json();

  if (data.primary?.products?.length) {
    primaryRibbonTitle.innerText = data.primary.name;
    primaryRibbonGrid.innerHTML = data.primary.products.slice(0, 8).map(p => `
      <div class="product-card"
        onclick="location.href='/our-product?category=${encodeURIComponent(p.category[0] || p.category)}'">
        <div class="product-image">
          <img src="/public/pages/uploads/${p.image}">
        </div>
        <div class="product-content">
          <div class="product-name">${p.name}</div>
          <div class="price-row">
            <span class="price">₹${p.price}</span>
            <span class="discount">${p.discount}% OFF</span>
            <span class="old-price">₹${p.oldPrice}</span>
          </div>
        </div>
      </div>
    `).join('');
  } else {
    primaryRibbonSection.style.display = "none";
  }

  if (data.secondary?.products?.length) {
    secondaryRibbonTitle.innerText = data.secondary.name;
    secondaryRibbonGrid.innerHTML = data.secondary.products.slice(0, 8).map(p => `
      <div class="product-card"
        onclick="location.href='/our-product?category=${encodeURIComponent(p.category[0] || p.category)}'">
        <div class="product-image">
          <img src="/public/pages/uploads/${p.image}">
        </div>
        <div class="product-content">
          <div class="product-name">${p.name}</div>
          <div class="price-row">
            <span class="price">₹${p.price}</span>
            <span class="discount">${p.discount}% OFF</span>
            <span class="old-price">₹${p.oldPrice}</span>
          </div>
        </div>
      </div>
    `).join('');
  } else {
    secondaryRibbonSection.style.display = "none";
  }
}

/* ================= INIT (IMPORTANT PART) ================= */
Promise.all([
  loadPageData(),
  loadCategories(),
  loadHomeRibbonProducts()
])
.then(() => {
  // ✅ HIDE ONLY AFTER EVERYTHING LOADS
  if (window.preloaderUtils) {
    window.preloaderUtils.hide();
  }
})
.catch(err => {
  console.error("Home page load failed", err);
  if (window.preloaderUtils) {
    window.preloaderUtils.hide();
  }
});
