import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { notifyOrderStatus } from '../utils/notify.js';   // ✅ Added

const router = express.Router();

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private (Customer)
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { items, discount = 0, tax = 0, shippingAddress } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: '❌ No items provided' });
    }

    // Fetch products from DB
    const productIds = items.map(i => i.product);
    const dbProducts = await Product.find({ _id: { $in: productIds } });
    const idToProduct = new Map(dbProducts.map(p => [String(p._id), p]));

    // Normalize items with prices
    const normalized = items.map(i => {
      const p = idToProduct.get(String(i.product));
      if (!p) throw new Error(`Invalid product ID: ${i.product}`);
      return { product: p._id, quantity: Number(i.quantity || 1), price: p.price };
    });

    // Calculate totals
    const subtotal = normalized.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const total = subtotal - discount + tax;

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: normalized,
      subtotal,
      discount,
      tax,
      total,
      shippingAddress,
      status: "Pending"   // 🔹 Default set
    });

    res.status(201).json({
      success: true,
      message: "✅ Order placed successfully",
      order
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message || 'Invalid order' });
  }
});

/**
 * @route   GET /api/orders/mine
 * @desc    Get logged-in user's orders
 * @access  Private (Customer)
 */
router.get('/mine', requireAuth, async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort('-createdAt')
    .populate('items.product');

  res.json({
    success: true,
    count: orders.length,
    orders
  });
});

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order by ID
 * @access  Private (Customer/Admin)
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email role')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Customers can only view their own orders
    if (String(order.user._id) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Unauthorized to view this order" });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @route   GET /api/orders
 * @desc    Get all orders (Admin only)
 * @access  Private (Admin)
 */
router.get('/', requireAuth, requireRole('admin'), async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const orders = await Order.find(filter)
    .sort('-createdAt')
    .populate('user')
    .populate('items.product');

  res.json({
    success: true,
    count: orders.length,
    orders
  });
});

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status (Admin only) + Mock Email/SMS
 * @access  Private (Admin)
 */
router.put('/:id/status', requireAuth, requireRole('admin'), async (req, res) => {
  try { 
    const { status } = req.body;

    // 🔹 Validate status before updating
    const allowedStatuses = ["Pending", "Paid", "Shipped", "Delivered", "Cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`
      });
    }

  // 🔹 update order and populate user
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('items.product').populate('user');  // ✅ populate user to get email/phone

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

  //   // 🔹 Trigger mock Email & SMS
  //   try {
  //     const notifyResults = await notifyOrderStatus(order);
  //     console.log("📢 Notifications:", notifyResults);
  //   } catch (err) {
  //     console.error("Notification Error:", err);
  //   }

  //   res.json({
  //     success: true,
  //     message: `✅ Order status updated to ${status}`,
  //     order
  //   });
  // } catch (err) {
  //   res.status(500).json({ success: false, message: 'Error updating status' });
  // }
    // 🔹 Mock notifications
    const emailMessage = `📧 Email sent to ${order.user.email}: Your order ${order._id} status is now "${status}"`;
    const smsMessage = `📱 SMS sent to ${order.user.name}: Order ${order._id} → ${status}`;

    console.log(emailMessage);
    console.log(smsMessage);

    res.json({
      success: true,
      message: `✅ Order status updated to ${status}`,
      order,
      notifications: {
        email: emailMessage,
        sms: smsMessage
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error updating status' });
  }
  
});


export default router;
