/* ================= CART MANAGEMENT ================= */

let cart = null;
let whatsappNumber = '';

async function loadWhatsAppNumber() {
  try {
    const res = await fetch('/cart/whatsapp-number');
    const data = await res.json();
    if (data.mobileNumber) {
      whatsappNumber = data.mobileNumber;
    }
  } catch (error) {
    console.error('Failed to load WhatsApp number:', error);
  }
}

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
      await renderCart();
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

async function renderCart() {
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

  const ids = [...new Set(cart.items.map(item => item.productId))];
  const productMap = {};

  await Promise.all(ids.map(async id => {
    try {
      const res = await fetch(`/product/api/product/${id}`);
      if (res.ok) {
        productMap[id] = await res.json();
      }
    } catch (error) {
    }
  }));

  cartItems.innerHTML = cart.items.map(item => {

    const productSubtotal = item.price * item.quantity;
    const deliveryCharge = parseFloat(item.deliveryCharge) || 0;
    const itemSubtotal = productSubtotal + deliveryCharge;


    const product = productMap[item.productId] || {};
    const rawColors = Array.isArray(product.colors) ? product.colors : (product.colors ? [product.colors] : []);
    const hasCustomColors = rawColors.length && !(rawColors.length === 1 && rawColors[0] === '#000000');
    const colorsToShow = hasCustomColors ? rawColors : ['#000000'];

    let colorCellHtml = '';

    if (hasCustomColors) {
      const options = colorsToShow.map(c => {
        const selected = item.color === c ? 'selected' : '';
        return `<option value="${c}" ${selected}>${c}</option>`;
      }).join('');
      colorCellHtml = `
        <select class="cart-color-select" onchange="changeItemColor('${item.productId}', this.value)">
          ${options}
        </select>
      `;
    } else {
      colorCellHtml = `<span class="cart-color-default">Product color</span>`;
    }

    const hasDeliveryCharge = deliveryCharge > 0;
    const deliveryText = hasDeliveryCharge
      ? `₹${deliveryCharge.toFixed(2)}`
      : 'Free delivery';

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
        <td class="color-cell">
          ${colorCellHtml}
        </td>
        <td class="delivery-cell">
          ${deliveryText}
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

          <td class="subtotal">
          ₹${itemSubtotal.toFixed(2)}
          <div class="subtotal-breakup">
            <small>Product: ₹${productSubtotal.toFixed(2)}</small><br>
            <small>Delivery: ₹${deliveryCharge.toFixed(2)}</small>
          </div>
        </td>

        <td class="action">
          <button class="btn-remove" onclick="removeItem('${item.productId}')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  updateSummary();
}

function buildWhatsAppMessage() {
  if (!cart || !cart.items || cart.items.length === 0) {
    return '';
  }

  let lines = [];
  lines.push('New order from website');
  lines.push('');
  cart.items.forEach((item, index) => {
    const lineIndex = index + 1;
    const quantity = item.quantity;
    const price = item.price;
    const subtotal = price * quantity;
    const productId = item.productId;
    const color = item.color ? item.color : 'Default';
    lines.push(
      lineIndex +
        '. ' +
        item.name +
        ' | ID: ' +
        productId +
        ' | Qty: ' +
        quantity +
        ' | Color: ' +
        color +
        ' | Price: ₹' +
        price +
        ' | Subtotal: ₹' +
        subtotal.toFixed(2)
    );
  });

  const subtotal = cart.totalPrice;
  const deliveryCharges = cart.items.reduce((sum, item) => {
    const charge = parseFloat(item.deliveryCharge) || 0;
    return sum + charge;
  }, 0);
  const total = subtotal + deliveryCharges;

  lines.push('');
  lines.push('Subtotal: ₹' + subtotal.toFixed(2));
  lines.push('Delivery: ₹' + deliveryCharges.toFixed(2));
  lines.push('Total: ₹' + total.toFixed(2));

  return lines.join('\n');
}

function startWhatsAppOrder() {
  if (!cart || !cart.items || cart.items.length === 0) {
    alert('Your cart is empty.');
    return;
  }

  if (!whatsappNumber) {
    alert('WhatsApp number is not configured.');
    return;
  }

  const message = buildWhatsAppMessage();
  if (!message) {
    return;
  }

  const encodedMessage = encodeURIComponent(message);
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
  const url = 'https://wa.me/' + cleanNumber + '?text=' + encodedMessage;

  window.open(url, '_blank');
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
      await renderCart();
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
      await renderCart();
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
      await renderCart();
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

async function changeItemColor(productId, color) {
  try {
    const res = await fetch('/cart/update-color', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, color })
    });

    const data = await res.json();

    if (data.success) {
      cart = data.cart;
      showNotification('Color updated successfully', 'success');
    } else {
      alert(data.message || 'Failed to update color');
    }
  } catch (error) {
    console.error('Update color error:', error);
    alert('Failed to update color');
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  await loadWhatsAppNumber();
  await loadCart();
  const checkoutBtn = document.querySelector('.btn-checkout');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', startWhatsAppOrder);
  }
});

