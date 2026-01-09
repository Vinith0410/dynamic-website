function toggleMenu(){
  const navLinks = document.getElementById('navLinks');
  const toggle = document.querySelector('.nav-toggle');

  navLinks.classList.toggle('show');
  toggle.classList.toggle('open');
}

const navLinks = document.getElementById('navLinks');
const navTitle = document.getElementById('navTitle');

// Load page data and check auth status
Promise.all([
  fetch('/page/api/pages').then(res => res.json()),
  fetch('/acc/check-auth').then(res => res.json())
])
.then(([pageData, authData]) => {
  
  navTitle.innerText = pageData.navigation_title;

  /* PAGE LINKS FROM DB */
  navLinks.innerHTML = `
    <li><a href="/">${pageData.pages.page1.title}</a></li>
    <li><a href="/about">${pageData.pages.page2.title}</a></li>
    <li><a href="/our-product">${pageData.pages.page3.title}</a></li>
    <li><a href="/contact">${pageData.pages.page4.title}</a></li>
  `;

  /* 🔥 ADD AUTH BUTTONS BASED ON REAL SESSION */
  addAuthButtons(authData.isLoggedIn);
  
  /* ✅ APPLY ACTIVE STATE */
  setActiveNavLink();
})
.catch(err => {
  console.error('Navbar load error:', err);
});


function addAuthButtons(isLoggedIn) {
  const li = document.createElement('li');
  const div = document.createElement('div');
  div.className = 'nav-actions';

  if (isLoggedIn) {
    div.innerHTML = `
      <a href="/cart" class="nav-btn cart-link">
        <i class="fas fa-shopping-cart"></i>
        <span class="cart-badge" id="cartCount" style="display: none;">0</span>
      </a>
      <a href="/logout" class="nav-btn logout-link">
        <i class="fas fa-sign-out-alt"></i> Logout
      </a>
    `;
    
    li.appendChild(div);
    navLinks.appendChild(li);
    
    // Load cart count only if logged in
    updateCartCount();
  } else {
    div.innerHTML = `
      <a href="/login" class="nav-btn login-link">
        <i class="fas fa-sign-in-alt"></i> Login
      </a>
    `;
    
    li.appendChild(div);
    navLinks.appendChild(li);
  }
}

// Update cart count (only if logged in)
async function updateCartCount() {
  try {
    const res = await fetch('/cart/count');
    
    // If 401 (not authenticated), user is not logged in - ignore error
    if (res.status === 401) {
      return;
    }
    
    const data = await res.json();
    
    if (data.success && data.count > 0) {
      const cartCountEl = document.getElementById('cartCount');
      if (cartCountEl) {
        cartCountEl.textContent = data.count;
        cartCountEl.style.display = 'inline-block';
      }
    }
  } catch (error) {
    // Silently fail if not logged in
    console.log('Cart count not available (not logged in)');
  }
}

function setActiveNavLink() {
  const currentPath = window.location.pathname;

  document.querySelectorAll('#navLinks a').forEach(link => {
    const href = link.getAttribute('href');

    if (href === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}
