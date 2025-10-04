import express from 'express';
import { Product } from '../models/Product.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * ⭐ Browse, Filter, Sort & Paginate Products
 * Query Params: keyword, category, minPrice, maxPrice, rating, sort, order, page, limit
 */
router.get('/', async (req, res) => {
  try {
    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      rating,
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
      ids
    } = req.query;

    const filter = {};
    if (ids) {
      const idsArray = ids.split(',');
      filter._id = { $in: idsArray };
    } else {
      if (keyword) filter.$text = { $search: keyword };
      if (category) filter.category = category;
      if (minPrice || maxPrice) filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
      if (rating) filter.rating = { $gte: Number(rating) };
    }

    const count = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort({ [sort]: order === 'asc' ? 1 : -1 })   // ✅ Added sorting
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total: count,
      page: Number(page),
      pages: Math.ceil(count / limit),
      count: products.length,
      products,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});

/**
 * ⭐ Get product by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: 'Invalid product ID' });
  }
});

/**
 * ⭐ Add Product (Admin only)
 */
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { title, description, price, images, category, brand, stock } = req.body;
    const product = await Product.create({
      title,
      description,
      price,
      images,
      category,
      brand,
      stock,
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: 'Error creating product' });
  }
});

/**
 * ⭐ Update Product (Admin only)
 * @route   PUT /api/products/:id
 */
router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { title, description, price, images, category, brand, stock } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.title = title || product.title;
    product.description = description || product.description;
    product.price = price ?? product.price;
    product.images = images || product.images;
    product.category = category || product.category;
    product.brand = brand || product.brand;
    product.stock = stock ?? product.stock;

    await product.save();

    res.json({ success: true, message: '✅ Product updated successfully', product });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Error updating product' });
  }
});

/**
 * ⭐ Delete Product (Admin only)
 * @route   DELETE /api/products/:id
 */
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: '🗑️ Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting product' });
  }
});

/**
 * ⭐ Add Review to Product
 */
router.post('/:id/reviews', requireAuth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const alreadyReviewed = product.reviews.find(
      (r) => String(r.user) === String(req.user._id)
    );
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ success: true, message: 'Review added' });
  } catch (err) {
    res.status(400).json({ message: 'Error adding review' });
  }
});

/**
 * ⭐ Get all reviews for a product
 */
router.get('/:id/reviews', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('reviews.user', 'name');
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json({
      success: true,
      count: product.reviews.length,
      reviews: product.reviews,
    });
  } catch (err) {
    res.status(400).json({ message: 'Error fetching reviews' });
  }
});

/**
 * ⭐ Get product recommendations
 */
router.get('/:id/recommendations', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Find related products in same category
    const recommendations = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    })
      .limit(5)
      .select('title price rating images category');

    res.json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (err) {
    console.error("Recommendation Error:", err);
    res.status(500).json({ message: 'Error fetching recommendations' });
  }
});

export default router;
