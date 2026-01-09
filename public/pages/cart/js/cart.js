/* ================= CART MANAGEMENT ================= */

let cart = null;

// Load cart on page load
async function loadCart() {
  try {
    const res = await fetch('/cart/get');
    
    // Check if user is not logged in
    if (res.status === 401) {
      const data = await res.json();
      alert(data.message || 'Please login to view your cart');
      window.location.href = data.redirect || '/login';
      return;
    }
    
    const data = await res.json();
    
    if (data.success) {
      cart = data.cart;
      renderCart();
    }

    // Hide preloader
    if (window.preloaderUtils) {
      window.preloaderUtils.hide();
    }

  } catch (error) {
    console.error('Failed to load cart:', error);
    // Redirect to login if not authenticated
    alert('You need to login first to view your cart. Redirecting to login page...');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500);
    
    if (window.preloaderUtils) {
      window.preloaderUtils.hide();
    }
  }
}

// Render cart items
function renderCart() {
  const cartItems = document.getElementById('cartItems');
  const emptyCart = document.getElementById('emptyCart');
  const cartTableWrapper = document.getElementById('cartTableWrapper');
  const cartSummary = document.getElementById('cartSummary');
  const clearCartBtn = document.getElementById('clearCartBtn');

  if (!cart || cart.items.length === 0) {
    // Show empty cart message
    emptyCart.style.display = 'flex';
    cartTableWrapper.style.display = 'none';
    cartSummary.style.display = 'none';
    clearCartBtn.style.display = 'none';
    return;
  }

  // Hide empty cart message
  emptyCart.style.display = 'none';
  cartTableWrapper.style.display = 'block';
  cartSummary.style.display = 'block';
  clearCartBtn.style.display = 'inline-flex';

  // Render cart items
  cartItems.innerHTML = cart.items.map(item => {
    const subtotal = item.price * item.quantity;
    const deliveryCharge = parseFloat(item.deliveryCharge) || 0;
    
    return `
      <tr class="cart-item">
        <td class="product-info">
          <img src="/public/pages/uploads/${item.image}" alt="${item.name}" class="product-img">
          <div class="product-details">
            <h4>${item.name}</h4>
            ${item.discount > 0 ? `
              <div class="price-details">
                <span class="old-price">₹${item.oldPrice}</span>
                <span class="discount-badge">${item.discount}% OFF</span>
              </div>
            ` : ''}
          </div>
        </td>
        <td class="price">₹${item.price}</td>
        <td class="quantity-cell">
          <div class="quantity-control">
            <button class="qty-btn" onclick="updateQuantity('${item.productId}', ${item.quantity - 1})">
              <i class="fas fa-minus"></i>
            </button>
            <input type="number" value="${item.quantity}" min="1" 
              onchange="updateQuantity('${item.productId}', this.value)" 
              class="qty-input">
            <button class="qty-btn" onclick="updateQuantity('${item.productId}', ${item.quantity + 1})">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </td>
        <td class="subtotal">₹${subtotal.toFixed(2)}</td>
        <td class="action">
          <button class="btn-remove" onclick="removeItem('${item.productId}')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Update summary
  updateSummary();
}

// Update cart summary
function updateSummary() {
  if (!cart || cart.items.length === 0) return;

  const totalQuantity = cart.totalQuantity;
  const subtotal = cart.totalPrice;
  
  // Calculate total delivery charges
  const deliveryCharges = cart.items.reduce((sum, item) => {
    const charge = parseFloat(item.deliveryCharge) || 0;
    return sum + charge;
  }, 0);
  
  const total = subtotal + deliveryCharges;

  document.getElementById('totalQuantity').textContent = totalQuantity;
  document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
  document.getElementById('deliveryCharges').textContent = `₹${deliveryCharges.toFixed(2)}`;
  document.getElementById('totalPrice').textContent = `₹${total.toFixed(2)}`;
}

// Update quantity
async function updateQuantity(productId, newQuantity) {
  newQuantity = parseInt(newQuantity);
  
  if (newQuantity < 1) {
    alert('Quantity must be at least 1');
    return;
  }

  try {
    const res = await fetch('/cart/update-quantity', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity: newQuantity })
    });

    const data = await res.json();
    
    if (data.success) {
      cart = data.cart;
      renderCart();
      showNotification('Quantity updated successfully', 'success');
    } else {
      alert(data.message || 'Failed to update quantity');
    }

  } catch (error) {
    console.error('Update quantity error:', error);
    alert('Failed to update quantity');
  }
}

// Remove item from cart
async function removeItem(productId) {
  if (!confirm('Are you sure you want to remove this item from cart?')) {
    return;
  }

  try {
    const res = await fetch(`/cart/remove/${productId}`, {
      method: 'DELETE'
    });

    const data = await res.json();
    
    if (data.success) {
      cart = data.cart;
      renderCart();
      showNotification('Item removed from cart', 'success');
    } else {
      alert(data.message || 'Failed to remove item');
    }

  } catch (error) {
    console.error('Remove item error:', error);
    alert('Failed to remove item');
  }
}

// Clear entire cart
async function clearCart() {
  if (!confirm('Are you sure you want to clear your entire cart?')) {
    return;
  }

  try {
    const res = await fetch('/cart/clear', {
      method: 'DELETE'
    });

    const data = await res.json();
    
    if (data.success) {
      cart = data.cart;
      renderCart();
      showNotification('Cart cleared successfully', 'success');
    } else {
      alert(data.message || 'Failed to clear cart');
    }

  } catch (error) {
    console.error('Clear cart error:', error);
    alert('Failed to clear cart');
  }
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
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

// Initialize
window.addEventListener('DOMContentLoaded', loadCart);

