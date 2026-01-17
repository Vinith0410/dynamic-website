const express = require('express');
const router = express.Router();
const Cart = require('../model/Cart');
const Product = require('../model/Product');
const { isAuthenticated, getUserIdFromCookie } = require('../middleware/auth');

function getUserId(req) {
  return getUserIdFromCookie(req);
}

router.get('/whatsapp-number', (req, res) => {
  const mobileNumber = process.env.MOBILE_NUMBER || '';
  res.json({ mobileNumber });
});

/* ================== ADD TO CART ================== */
router.post('/add', isAuthenticated, async (req, res) => {
  try {
    const { productId, color } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const userId = getUserId(req);

    // Find or create cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    const productColors = Array.isArray(product.colors) ? product.colors : [];
    let selectedColor = color || null;

    if (!selectedColor) {
      const nonDefault = productColors.filter(c => c && c !== '#000000');
      if (nonDefault.length) {
        selectedColor = nonDefault[0];
      } else {
        selectedColor = null;
      }
    }

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += 1;
    } else {
      // Add new item
      cart.items.push({
        productId: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        oldPrice: product.oldPrice,
        discount: product.discount,
        quantity: 1,
        deliveryCharge: product.deliveryCharge || '0',
        color: selectedColor
      });
    }

    // Calculate totals
    cart.calculateTotals();
    await cart.save();

    res.json({
      success: true,
      message: 'Product added to cart',
      cartCount: cart.totalQuantity
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/* ================== GET CART ================== */
router.get('/get', isAuthenticated, async (req, res) => {
  try {
    const userId = getUserId(req);

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
      await cart.save();
      return res.json({ success: true, cart });
    }

    const productIds = cart.items.map(item => item.productId);
    if (productIds.length > 0) {
      const products = await Product.find({ _id: { $in: productIds } });
      const productMap = {};
      products.forEach(p => {
        productMap[p._id.toString()] = p;
      });

      const updatedItems = [];

      cart.items.forEach(item => {
        const p = productMap[item.productId.toString()];
        if (!p) {
          return;
        }
        item.name = p.name;
        item.image = p.image;
        item.price = p.price;
        item.oldPrice = p.oldPrice;
        item.discount = p.discount;
        item.deliveryCharge = p.deliveryCharge || '0';
        updatedItems.push(item);
      });

      cart.items = updatedItems;
      cart.calculateTotals();
      await cart.save();
    }

    res.json({ success: true, cart });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/* ================== UPDATE QUANTITY ================== */
router.put('/update-quantity', isAuthenticated, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Product ID and quantity are required' });
    }

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const userId = getUserId(req);
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    cart.items[itemIndex].quantity = quantity;
    cart.calculateTotals();
    await cart.save();

    res.json({
      success: true,
      message: 'Quantity updated',
      cart
    });

  } catch (error) {
    console.error('Update quantity error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/update-color', isAuthenticated, async (req, res) => {
  try {
    const { productId, color } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const userId = getUserId(req);
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    cart.items[itemIndex].color = color || null;
    await cart.save();

    res.json({
      success: true,
      message: 'Color updated',
      cart
    });
  } catch (error) {
    console.error('Update color error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/* ================== REMOVE ITEM FROM CART ================== */
router.delete('/remove/:productId', isAuthenticated, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = getUserId(req);

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      item => item.productId.toString() !== productId
    );

    cart.calculateTotals();
    await cart.save();

    res.json({
      success: true,
      message: 'Item removed from cart',
      cart
    });

  } catch (error) {
    console.error('Remove item error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/* ================== CLEAR CART ================== */
router.delete('/clear', isAuthenticated, async (req, res) => {
  try {
    const userId = getUserId(req);

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = [];
    cart.calculateTotals();
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared',
      cart
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/* ================== GET CART COUNT ================== */
router.get('/count', isAuthenticated, async (req, res) => {
  try {
    const userId = getUserId(req);
    const cart = await Cart.findOne({ userId });

    const count = cart ? cart.totalQuantity : 0;

    res.json({ success: true, count });

  } catch (error) {
    console.error('Get cart count error:', error);
    res.status(500).json({ success: false, count: 0 });
  }
});

module.exports = router;

