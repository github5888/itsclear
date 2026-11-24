const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { initialProducts, initialCoupons } = require('./initialData');
const { seedCategoriesIfEmpty } = require('./services/seedCategories');
const {
  User,
  PendingRegistration,
  Product,
  Order,
  Review,
  Coupon,
  Setting,
  LoginOtp
} = require('./models');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/itsclear';

let isConnecting = null;

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (isConnecting) return isConnecting;

  isConnecting = (async () => {
    try {
      const conn = await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        autoIndex: true
      });
      console.log(`🌿 Connected to MongoDB Database at ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
      await seedDatabase();
      return conn.connection;
    } catch (err) {
      console.error('❌ MongoDB Connection Error:', err.message);
      throw err;
    } finally {
      isConnecting = null;
    }
  })();

  return isConnecting;
}

// Database Seeding Logic (Seeds products, admin, coupons if collection is empty)
async function seedDatabase() {
  try {
    // 1. Seed Products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('🌾 Seeding initial products into MongoDB...');
      await Product.insertMany(initialProducts, { ordered: false }).catch(() => {});
      console.log(`✅ Seeded ${initialProducts.length} pure stoneground products.`);
    }

    // 2. Seed Default Admin User
    const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || '';
    const adminExists = adminEmail ? await User.findOne({ email: adminEmail }) : true;
    if (!adminExists && adminPassword.length >= 12) {
      const hashedPassword = bcrypt.hashSync(adminPassword, 12);
      await User.create({
        id: 'usr-admin-01',
        name: 'Master Admin',
        email: adminEmail,
        phone: process.env.ADMIN_PHONE || '+91 00000 00000',
        city: 'Corporate HQ',
        password: hashedPassword,
        role: 'admin',
        clearCoins: 10000,
        membershipTier: 'Platinum Kisan Mitra',
        isEmailVerified: true
      });
      console.log(`Created initial admin account for ${adminEmail}. Remove ADMIN_INITIAL_PASSWORD after first login.`);
    } else if (!adminExists) {
      throw new Error('ADMIN_INITIAL_PASSWORD must contain at least 12 characters');
    }

    // 3. Seed & Sync Coupons (upsert so newly unified coupons are always present)
    for (const c of initialCoupons) {
      await Coupon.findOneAndUpdate(
        { code: c.code },
        { $setOnInsert: { ...c, active: true } },
        { upsert: true }
      ).catch(() => {});
    }
    console.log(`🏷️ Synced ${initialCoupons.length} promotional coupons.`);
    // 4. Seed & Sync Default Categories
    await seedCategoriesIfEmpty();
    console.log('📦 Verified core product categories.');
  } catch (err) {
    console.error('⚠️ Database seeding warning:', err.message);
  }
}

// Handle Connection Lifecycle Events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB runtime error:', err);
});

// Auto-connect immediately
connectDB().catch(err => {
  console.error('Initial MongoDB connection failure:', err.message);
});

module.exports = {
  mongoose,
  connectDB,
  User,
  PendingRegistration,
  Product,
  Order,
  Review,
  Coupon,
  Setting,
  LoginOtp
};
