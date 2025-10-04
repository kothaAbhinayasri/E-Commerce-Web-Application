import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [cartItemSchema],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },

    // ✅ Updated: enforce allowed statuses
    status: { 
      type: String, 
      enum: ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'], 
      default: 'Pending', 
      index: true 
    },

    paymentProvider: { 
      type: String, 
      enum: ['stripe', 'paypal', 'razorpay', 'cod', 'mock'], // ✅ added "mock" for demo payments 
      default: 'stripe' 
    },

    paymentId: { type: String },
    paymentMethod: { type: String, default: 'Card' }, // ✅ added for better clarity with /api/payments/pay

    shippingAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
