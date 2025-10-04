import nodemailer from 'nodemailer';

// utils/notify.js
export async function notifyOrderStatus(order) {
  const user = order.user;

  // Create transporter
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Email content
  const emailMessage = `
    Dear ${user.name},

    Your order ${order._id} status is now "${order.status}".

    Order Details:
    - Total: ₹${order.total}
    - Items: ${order.items.length}

    Thank you for shopping with us!

    Best regards,
    E-Commerce Team
  `;

  // Send email
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Order ${order._id} Status Update`,
      text: emailMessage
    });
    console.log(`📧 Email sent to ${user.email}`);
  } catch (err) {
    console.error('Email send error:', err);
  }

  // Mock SMS (since SMS requires additional service)
  const smsMessage = `📱 SMS sent to ${user.name || 'Customer'}: Order ${order._id} → ${order.status}`;
  console.log(smsMessage);

  // Return for testing
  return { emailMessage, smsMessage };
}
