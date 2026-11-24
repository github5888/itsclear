require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const db = require('./db'); // Initializes MongoDB connection & seeding

const app = express();
const PORT = process.env.PORT || 5001;

// Trust reverse proxy (aaPanel / Nginx / Apache) for accurate client IP rate limiting
app.set('trust proxy', 1);

const defaultOrigins = [
  'https://itsclear.in',
  'https://www.itsclear.in',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];
const envOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);
const configuredOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://checkout.razorpay.com', 'https://accounts.google.com/gsi/client'],
      frameSrc: ["'self'", 'https://api.razorpay.com', 'https://checkout.razorpay.com', 'https://accounts.google.com/gsi/'],
      connectSrc: ["'self'", 'https://api.razorpay.com', 'https://accounts.google.com/gsi/'],
      imgSrc: ["'self'", 'data:', 'https:', 'https://*.googleusercontent.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:', 'https://accounts.google.com/gsi/style'],
      fontSrc: ["'self'", 'data:', 'https:'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  }
}));

// Explicit CORS allowlist. Requests without an Origin (health checks/server-to-server) remain valid.
// Uses callback(null, false) instead of throwing an unhandled 500 Error for disallowed origins.
app.use(cors({
  origin(origin, callback) {
    if (!origin || configuredOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true
}));

// Webhook signature verification requires the exact raw request body.
app.post('/api/payments/webhook', express.raw({ type: 'application/json', limit: '1mb' }), require('./routes/paymentWebhook'));

app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.API_RATE_LIMIT || 300),
  standardHeaders: 'draft-7',
  legacyHeaders: false
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static file directories
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Serve public images fallback if available
const publicImagesDir = path.join(__dirname, '..', 'public', 'images');
if (fs.existsSync(publicImagesDir)) {
  app.use('/images', express.static(publicImagesDir));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const isDbConnected = db.mongoose.connection.readyState === 1;
  res.json({
    status: 'online',
    store: 'itsclear Pure Stoneground Atta API',
    version: '2.0.0',
    db: 'mongodb',
    dbStatus: isDbConnected ? 'connected' : 'connecting',
    time: new Date().toISOString()
  });
});

app.get('/api/config', (req, res) => {
  const { isOnlinePaymentConfigured } = require('./services/razorpayService');
  const onlinePaymentsEnabled = isOnlinePaymentConfigured();
  res.json({
    onlinePaymentsEnabled,
    codEnabled: process.env.COD_ENABLED !== 'false',
    currency: 'INR',
    freeDeliveryThreshold: 499
  });
});

// Mount API routes
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/content', require('./routes/content'));
app.use('/api/subscription-plans', require('./routes/subscriptionPlans'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/payments', require('./routes/payments'));

// Production Frontend Static Serve (if running fullstack from server)
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

let server = null;
if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🌾 itsclear Backend API Server Running!`);
    console.log(`🚀 Port: ${PORT}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`📦 Database: MongoDB (Mongoose)`);
    console.log(`=========================================`);
  });
}

// Keep-alive timer (.unref() prevents hanging on process exit)
setInterval(() => {}, 1000 * 60 * 60).unref();

module.exports = { app, server };
