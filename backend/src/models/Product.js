import mongoose from 'mongoose';

// ⭐ Review Schema
const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

// ⭐ Category Schema
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, unique: true, index: true },
  },
  { timestamps: true }
);

export const Category = mongoose.model('Category', categorySchema);

// ⭐ Product Schema
const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // ✅ removed inline 'text' index
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: String },
    stock: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    attributes: { type: Map, of: String },

    // ⭐ Add reviews array
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

// ✅ Proper text index for search
productSchema.index({ title: 'text', description: 'text' });

export const Product = mongoose.model('Product', productSchema);
