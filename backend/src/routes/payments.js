import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Order } from '../models/Order.js';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';

const router = express.Router();

/**
 * @route   POST /api/payments/pay
 * @desc    Process payment for an order (mock version for demo/project)
 * @access  Private (Customer)
 */
router.post('/pay', requireAuth, async (req, res) => {
  try {
    const { orderId, paymentMethod = "Card" } = req.body;

    // Validate order
    const order = await Order.findById(orderId).populate('user').populate('items.product');
    if (!order || String(order.user._id) !== String(req.user._id)) {
      return res.status(404).json({
        success: false,
        message: 'Order not found for this user'
      });
    }

    // Check if already paid
    if (order.status === "Paid") {
      return res.status(400).json({
        success: false,
        message: 'Order already paid'
      });
    }

    // Mock payment success
    order.status = "Paid";
    order.paymentMethod = paymentMethod;
    order.paymentId = `PAY-${Date.now()}`; // generate mock payment id
    await order.save();

    // Send email with PDF receipt
    await sendOrderEmail(order);

    res.json({
      success: true,
      message: '✅ Payment successful! Receipt sent to your email.',
      payment: {
        paymentId: order.paymentId,
        method: paymentMethod,
        amount: order.total,
        currency: "INR",
        status: "Paid"
      },
      order: {
        id: order._id,
        items: order.items,
        total: order.total,
        status: order.status
      }
    });
  } catch (err) {
    console.error("Payment Error:", err);
    res.status(500).json({
      success: false,
      message: '❌ Payment failed. Please try again.'
    });
  }
});

// Function to generate PDF receipt
function generatePDF(order) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // PDF Content
    doc.fontSize(20).text('E-Commerce Receipt', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Order ID: ${order._id}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.text(`Customer: ${order.user.name}`);
    doc.text(`Email: ${order.user.email}`);
    doc.moveDown();

    doc.text('Items:');
    order.items.forEach(item => {
      const product = item.product;
      const gst = item.price * 0.18; // 18% GST
      const total = item.price + gst;
      doc.text(`${product.title} - Qty: ${item.quantity} - Price: ₹${item.price} - GST: ₹${gst.toFixed(2)} - Total: ₹${total.toFixed(2)}`);
    });

    doc.moveDown();
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const gstTotal = subtotal * 0.18;
    const totalAmount = subtotal + gstTotal;
    doc.text(`Subtotal: ₹${subtotal.toFixed(2)}`);
    doc.text(`GST (18%): ₹${gstTotal.toFixed(2)}`);
    doc.text(`Total: ₹${totalAmount.toFixed(2)}`);

    doc.end();
  });
}

// Function to send email with PDF
async function sendOrderEmail(order) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const pdfBuffer = await generatePDF(order);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: order.user.email,
    subject: `Order Receipt - ${order._id}`,
    text: `Dear ${order.user.name},\n\nThank you for your order! Attached is your receipt.\n\nOrder Total: ₹${order.total}\n\nBest regards,\nE-Commerce Team`,
    attachments: [
      {
        filename: `receipt-${order._id}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Receipt email sent to ${order.user.email}`);
  } catch (err) {
    console.error('Email send error:', err);
  }
}

export default router;
