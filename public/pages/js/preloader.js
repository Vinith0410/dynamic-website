/* ================= PRELOADER UTILITY ================= */

// Track when preloader was created
let preloaderStartTime = null;
const MINIMUM_DISPLAY_TIME = 1500; // Show preloader for at least 1.5 seconds

// Create and inject preloader HTML
function createPreloader() {
  preloaderStartTime = Date.now(); // Record start time
  
  const preloaderHTML = `
    <div class="preloader-overlay" id="preloader">
      <div class="preloader-center">
        <div class="preloader-loader">
          <div class="preloader-cart-wrapper">
            <svg class="preloader-cart" viewBox="0 0 24 24">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"></path>
            </svg>
          </div>
          <div class="preloader-brand">
            Loading Products
            <div class="preloader-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Insert at the beginning of body
  document.body.insertAdjacentHTML('afterbegin', preloaderHTML);
}

// Hide preloader with animation (ensures minimum display time)
function hidePreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;
  
  const elapsedTime = Date.now() - preloaderStartTime;
  const remainingTime = Math.max(0, MINIMUM_DISPLAY_TIME - elapsedTime);
  
  // Wait for remaining time before hiding
  setTimeout(() => {
    preloader.classList.add('hidden');
    // Remove from DOM after fade animation completes
    setTimeout(() => {
      preloader.remove();
    }, 500);
  }, remainingTime);
}

// Show preloader (in case you want to show it again)
function showPreloader() {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.classList.remove('hidden');
  } else {
    createPreloader();
  }
}

// Enhanced fetch wrapper that works with preloader
let pendingRequests = 0;
let preloaderTimeout = null;

function startLoading() {
  pendingRequests++;
  if (pendingRequests === 1) {
    // Show preloader only if it takes longer than 200ms
    preloaderTimeout = setTimeout(() => {
      const preloader = document.getElementById('preloader');
      if (preloader && pendingRequests > 0) {
        preloader.classList.remove('hidden');
      }
    }, 200);
  }
}

function finishLoading() {
  pendingRequests--;
  if (pendingRequests <= 0) {
    pendingRequests = 0;
    clearTimeout(preloaderTimeout);
    hidePreloader();
  }
}

// Enhanced fetch that automatically manages preloader
const originalFetch = window.fetch;
window.fetchWithPreloader = function(...args) {
  startLoading();
  return originalFetch(...args)
    .then(response => {
      finishLoading();
      return response;
    })
    .catch(error => {
      finishLoading();
      throw error;
    });
};

// Initialize preloader on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createPreloader);
} else {
  createPreloader();
}

// Auto-hide preloader when window fully loads (fallback)
window.addEventListener('load', () => {
  // Wait a bit for any pending async operations
  setTimeout(() => {
    if (pendingRequests === 0) {
      hidePreloader();
    }
  }, 300);
});

// Export functions for manual control
window.preloaderUtils = {
  show: showPreloader,
  hide: hidePreloader,
  startLoading,
  finishLoading
};

