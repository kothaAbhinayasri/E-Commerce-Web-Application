import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { Category, Product } from '../models/Product.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce_app';

async function run() {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB');

    // Admin user
    const adminEmail = 'admin@example.com';
    const adminPassword = 'Admin@123';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({ name: 'Admin', email: adminEmail, password: adminPassword, role: 'admin' });
      console.log('Created admin:', adminEmail, 'password:', adminPassword);
    } else {
      console.log('Admin exists:', adminEmail);
    }

    // Categories
    const cats = [
      { name: 'Electronics', slug: 'electronics' },
      { name: 'Fashion', slug: 'fashion' },
      { name: 'Home', slug: 'home' },
    ];
    const createdCats = [];
    for (const c of cats) {
      let doc = await Category.findOne({ slug: c.slug });
      if (!doc) doc = await Category.create(c);
      createdCats.push(doc);
    }
    console.log('Categories ready');

    // Products (if none)
    const count = await Product.countDocuments();
    if (count === 0) {
      const electronics = createdCats.find(c => c.slug === 'electronics');
      const fashion = createdCats.find(c => c.slug === 'fashion');
      await Product.insertMany([
        { title: 'Wireless Headphones', description: 'Noise cancelling over-ear', price: 99.99, category: electronics._id, stock: 100, brand: 'Acme' },
        { title: 'Smartphone Case', description: 'Shockproof slim case', price: 19.99, category: electronics._id, stock: 200, brand: 'Acme' },
        { title: 'Men\'s T-Shirt', description: '100% cotton', price: 14.99, category: fashion._id, stock: 150, brand: 'Acme' },
      ]);
      console.log('Inserted sample products');
    } else {
      console.log('Products already exist');
    }

    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

run();


