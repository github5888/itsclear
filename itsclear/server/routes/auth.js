const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { User, PendingRegistration, LoginOtp } = require('../models');
const { sendOtpEmail } = require('../services/emailService');
const { checkIpRateLimit } = require('../middleware/rateLimiter');
const { requireAdmin } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'development-only-jwt-secret-change-me');
const OTP_PEPPER = process.env.OTP_PEPPER || (process.env.NODE_ENV === 'production' ? '' : 'development-only-otp-pepper-change-me');
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '859140870913-uu2j7n6cilpg9k4m7ec6aos2da6m542r.apps.googleusercontent.com';

if (!JWT_SECRET || !OTP_PEPPER) throw new Error('JWT_SECRET and OTP_PEPPER are required in production');

// Helper to format user without password
function sanitizeUser(u) {
  if (!u) return null;
  const userObj = typeof u.toObject === 'function' ? u.toObject() : { ...u };
  delete userObj.password;
  delete userObj._id;
  delete userObj.__v;
  return userObj;
}

// Compute secure HMAC-SHA256 hash for OTP with server pepper
function hashOtp(otp) {
  return crypto.createHmac('sha256', OTP_PEPPER).update(String(otp).trim()).digest('hex');
}

// Timing-safe comparison to prevent side-channel timing attacks
function verifyOtpHash(inputOtp, storedHash) {
  if (!inputOtp || !storedHash) return false;
  const inputHash = hashOtp(inputOtp);
  const inputBuf = Buffer.from(inputHash, 'hex');
  const storedBuf = Buffer.from(storedHash, 'hex');
  if (inputBuf.length !== storedBuf.length) return false;
  return crypto.timingSafeEqual(inputBuf, storedBuf);
}

// Email format validator
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && regex.test(email.trim());
}

// Mobile format validator (at least 10 digits)
function isValidMobile(mobile) {
  if (typeof mobile !== 'string') return false;
  const digits = mobile.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

/**
 * Verify Google ID Token server-side using Google's official OAuth2Client
 */
async function verifyGoogleIdToken(idToken) {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('Google ID token is required');
  }

  // Deterministic mocking for automated testing in test environments
  if (process.env.NODE_ENV === 'test' && idToken.startsWith('test-token:')) {
    const parts = idToken.split(':');
    const email = parts[1] || 'customer@example.com';
    const sub = parts[2] || 'mock-google-sub-12345';
    const name = parts[3] || 'Test User';
    const verified = parts[4] !== 'unverified';
    if (!verified) {
      throw new Error('Google reports this email address is not verified');
    }
    return {
      sub,
      email: email.trim().toLowerCase(),
      name,
      picture: 'https://lh3.googleusercontent.com/test.png',
      emailVerified: true
    };
  }

  const client = new OAuth2Client(GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken: idToken.trim(),
    audience: GOOGLE_CLIENT_ID || undefined
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.sub || !payload.email) {
    throw new Error('Invalid Google token payload');
  }

  // Validate issuer
  const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
  if (!validIssuers.includes(payload.iss)) {
    throw new Error('Invalid token issuer');
  }

  // Check email verification
  if (!payload.email_verified) {
    throw new Error('Google reports this email address is not verified');
  }

  return {
    sub: payload.sub,
    email: payload.email.trim().toLowerCase(),
    name: payload.name ? payload.name.trim() : 'Valued Customer',
    picture: payload.picture || '',
    emailVerified: Boolean(payload.email_verified)
  };
}

// =========================================================================
// 1. GOOGLE AUTHENTICATION (POST /api/auth/google)
// =========================================================================
router.post('/google', async (req, res) => {
  try {
    const ipCheck = checkIpRateLimit(req, 15, 15 * 60 * 1000);
    if (!ipCheck.allowed) {
      return res.status(429).json({ error: 'Too many authentication attempts. Please try again later.' });
    }

    const { credential, portal = 'customer' } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Google credential token is required.' });
    }

    // 1. Verify token server-side with official Google Auth Library
    let googleUser;
    try {
      googleUser = await verifyGoogleIdToken(credential);
    } catch (tokenErr) {
      console.error('[Google Auth] Token verification rejected:', tokenErr.message);
      return res.status(401).json({ error: `Google verification failed: ${tokenErr.message}` });
    }

    const { sub: googleId, email, name, picture } = googleUser;

    // 2. ADMIN PORTAL LOGIN VIA GOOGLE
    if (portal === 'admin') {
      // Security rules:
      // - Disable automatic admin registration
      // - Never grant admin privileges based only on a Google email or email domain
      // - Only previously authorized admin accounts in MongoDB can enter
      const adminUser = await User.findOne({
        $or: [
          { googleId },
          { email }
        ],
        role: 'admin'
      });

      if (!adminUser || adminUser.role !== 'admin') {
        return res.status(403).json({
          error: 'Access denied. This Google account is not authorized for administrator access.'
        });
      }

      // Securely link Google Identity to authorized admin account if not yet linked
      if (!adminUser.googleId) {
        adminUser.googleId = googleId;
        adminUser.authProvider = adminUser.password ? 'both' : 'google';
        if (picture && !adminUser.picture) adminUser.picture = picture;
        adminUser.updatedAt = new Date();
        await adminUser.save();
      }

      const token = jwt.sign(
        { id: adminUser.id, email: adminUser.email, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        user: sanitizeUser(adminUser),
        token,
        message: `Welcome to Admin Suite, ${adminUser.name}!`
      });
    }

    // 3. CUSTOMER AUTHENTICATION VIA GOOGLE
    // Scenario A: Existing user matched by stable Google Subject ID
    const existingByGoogleId = await User.findOne({ googleId });
    if (existingByGoogleId) {
      // Update avatar if provided
      if (picture && existingByGoogleId.picture !== picture) {
        existingByGoogleId.picture = picture;
        await existingByGoogleId.save();
      }

      const token = jwt.sign(
        { id: existingByGoogleId.id, email: existingByGoogleId.email, role: existingByGoogleId.role },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      return res.json({
        success: true,
        user: sanitizeUser(existingByGoogleId),
        token,
        message: `Welcome back, ${existingByGoogleId.name}!`
      });
    }

    // Scenario B: User exists with matching email, but not yet linked to Google ID
    const existingByEmail = await User.findOne({ email });
    if (existingByEmail) {
      // Secure account linking requirement:
      // Do not automatically merge without authorization from the local account owner.
      return res.status(200).json({
        requiresLinking: true,
        email,
        name: existingByEmail.name,
        hasPassword: Boolean(existingByEmail.password),
        message: 'An itsclear account with this email address already exists. Please verify your password or Email OTP to securely link your Google account.'
      });
    }

    // Scenario C: Brand New Customer Registration via Google
    const userId = 'usr-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const newCustomer = await User.create({
      id: userId,
      name: name || 'Valued Customer',
      email,
      googleId,
      picture,
      authProvider: 'google',
      phone: '',
      city: 'Lucknow',
      password: null,
      role: 'customer',
      clearCoins: 250, // 250 Grain Coins welcome reward
      membershipTier: 'Silver Grain',
      isEmailVerified: true
    });

    const token = jwt.sign(
      { id: newCustomer.id, email: newCustomer.email, role: newCustomer.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      success: true,
      user: sanitizeUser(newCustomer),
      token,
      message: 'Welcome to itsclear! Your account has been created via Google. 250 Free Grain Coins have been credited to your wallet.'
    });
  } catch (err) {
    console.error('[Google Auth Error]:', err);
    return res.status(500).json({ error: 'Google authentication failed. Please try again.' });
  }
});

// =========================================================================
// 2. SECURE GOOGLE ACCOUNT LINKING (POST /api/auth/google/link)
// =========================================================================
router.post('/google/link', async (req, res) => {
  try {
    const { credential, password, otp } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Google credential token is required for account linking.' });
    }

    const googleUser = await verifyGoogleIdToken(credential);
    const { sub: googleId, email, picture } = googleUser;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Account not found for linking.' });
    }

    let isAuthorized = false;

    // Verification Option 1: Account Password
    if (password && user.password) {
      isAuthorized = bcrypt.compareSync(password, user.password);
      if (!isAuthorized) {
        return res.status(401).json({ error: 'Incorrect account password. Account linking rejected.' });
      }
    }
    // Verification Option 2: Email OTP Challenge
    else if (otp) {
      const challenge = await LoginOtp.findOne({ email });
      if (!challenge || challenge.expiresAt.getTime() < Date.now()) {
        return res.status(400).json({ error: 'Verification code is invalid or expired.' });
      }
      if (challenge.attempts >= 5 || !verifyOtpHash(otp, challenge.otpHash)) {
        challenge.attempts += 1;
        await challenge.save();
        return res.status(400).json({ error: 'Invalid verification code for account linking.' });
      }
      await LoginOtp.deleteOne({ email });
      isAuthorized = true;
    } else {
      return res.status(400).json({ error: 'Password or Email OTP verification is required to authorize account linking.' });
    }

    // Link Google Identity to this verified existing account
    user.googleId = googleId;
    user.authProvider = user.password ? 'both' : 'google';
    if (picture && !user.picture) user.picture = picture;
    user.isEmailVerified = true;
    user.updatedAt = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: user.role === 'admin' ? '7d' : '30d' }
    );

    return res.json({
      success: true,
      user: sanitizeUser(user),
      token,
      message: 'Your Google account has been securely linked! You can now sign in with Google or Email.'
    });
  } catch (err) {
    console.error('[Google Link Error]:', err);
    return res.status(500).json({ error: 'Failed to link Google account. Please try again.' });
  }
});

// =========================================================================
// 3. SEND REGISTRATION OTP (POST /api/auth/register/send-otp)
// =========================================================================
router.post('/register/send-otp', async (req, res) => {
  try {
    const { fullName, name, mobile, phone, email, city, password, confirmPassword } = req.body;
    const customerName = (fullName || name || '').trim();
    const customerPhone = (mobile || phone || '').trim();
    const customerEmail = (email || '').trim().toLowerCase();
    const customerCity = (city || 'Lucknow').trim();
    const customerPassword = password || '';
    const customerConfirm = confirmPassword !== undefined ? confirmPassword : customerPassword;

    // 1. Validate required fields
    if (!customerName || !customerPhone || !customerEmail || !customerPassword) {
      return res.status(400).json({ error: 'All fields (Full Name, Mobile, Email, and Password) are required.' });
    }

    // 2. Validate formats
    if (!isValidEmail(customerEmail)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (!isValidMobile(customerPhone)) {
      return res.status(400).json({ error: 'Please provide a valid 10-digit mobile number.' });
    }

    // 3. Password validation
    if (customerPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }
    if (customerPassword !== customerConfirm) {
      return res.status(400).json({ error: 'Passwords do not match. Please verify.' });
    }

    // 4. Duplicate checks against registered users in MongoDB
    const existingEmail = await User.findOne({ email: customerEmail });
    if (existingEmail) {
      return res.status(409).json({ error: 'An account with this email address already exists. Please sign in.' });
    }

    const cleanPhoneDigits = customerPhone.replace(/\D/g, '');
    const usersWithPhone = await User.find({ phone: { $exists: true, $ne: '' } }).select('id phone');
    const existingPhone = usersWithPhone.find(u => {
      const uDigits = u.phone ? u.phone.replace(/\D/g, '') : '';
      return uDigits === cleanPhoneDigits;
    });
    if (existingPhone) {
      return res.status(409).json({ error: 'An account with this mobile number already exists. Please sign in.' });
    }

    // 5. IP-based rate limiting (10 requests per 15 min per IP)
    const ipCheck = checkIpRateLimit(req, 10, 15 * 60 * 1000);
    if (!ipCheck.allowed) {
      return res.status(429).json({
        error: `Too many requests from this network. Please retry after ${ipCheck.retryAfterSeconds} seconds.`,
        retryAfter: ipCheck.retryAfterSeconds
      });
    }

    const now = Date.now();
    const existingPending = await PendingRegistration.findOne({ email: customerEmail });

    let sendCount = 1;
    let windowStart = now;

    if (existingPending) {
      const isWithinWindow = (now - existingPending.window_start_time) < (60 * 60 * 1000); // 1 hour window

      // Resend cooldown check: 30 seconds
      if (now < existingPending.resend_available_at) {
        const waitSec = Math.ceil((existingPending.resend_available_at - now) / 1000);
        return res.status(429).json({
          error: `Please wait ${waitSec} seconds before requesting a new OTP.`,
          resendAfter: waitSec
        });
      }

      // Maximum 5 OTP requests per email per hour
      if (isWithinWindow) {
        if (existingPending.send_count >= 5) {
          const resetInMinutes = Math.ceil(((existingPending.window_start_time + 3600000) - now) / 60000);
          return res.status(429).json({
            error: `Maximum OTP requests reached for this email (5 per hour). Please try again after ${resetInMinutes} minutes.`
          });
        }
        sendCount = existingPending.send_count + 1;
        windowStart = existingPending.window_start_time;
      } else {
        sendCount = 1;
        windowStart = now;
      }
    }

    // 6. Generate cryptographically secure 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = hashOtp(otp);
    const passwordHash = bcrypt.hashSync(customerPassword, 10);
    const pendingId = 'pend-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const expiresInSeconds = 300; // 5 minutes validity
    const resendCooldownSeconds = 30; // 30 seconds cooldown
    const expiresAt = now + (expiresInSeconds * 1000);
    const resendAvailableAt = now + (resendCooldownSeconds * 1000);

    // 7. Dispatch OTP via Email Service
    let emailResult;
    try {
      emailResult = await sendOtpEmail({
        email: customerEmail,
        name: customerName,
        otp,
        purpose: 'registration'
      });
    } catch (deliveryError) {
      console.error('[Auth API] Email delivery failed:', deliveryError.message);
      return res.status(502).json({
        error: `Could not send verification email: ${deliveryError.message || 'Email delivery failed'}. Please verify your email configuration.`
      });
    }

    // 8. Persist challenge in MongoDB atomically via upsert
    await PendingRegistration.findOneAndUpdate(
      { email: customerEmail },
      {
        id: pendingId,
        email: customerEmail,
        name: customerName,
        phone: customerPhone,
        city: customerCity,
        password_hash: passwordHash,
        otp_hash: otpHash,
        expires_at: expiresAt,
        attempts: 0,
        resend_available_at: resendAvailableAt,
        send_count: sendCount,
        window_start_time: windowStart,
        ip_address: ipCheck.ip,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: emailResult?.mode === 'local'
        ? 'Verification OTP generated in local mode (no email credentials configured).'
        : 'Verification OTP sent successfully to your email address.',
      expiresIn: expiresInSeconds,
      resendAfter: resendCooldownSeconds,
      ...(emailResult?.mode === 'local' ? { mode: 'local', devOtp: emailResult.devOtp } : {})
    });
  } catch (err) {
    console.error('Error sending registration OTP:', err);
    res.status(500).json({ error: 'Failed to send verification code. Please try again.' });
  }
});

// =========================================================================
// 4. VERIFY OTP & COMPLETE REGISTRATION (POST /api/auth/register/verify-and-create)
// =========================================================================
router.post('/register/verify-and-create', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and 6-digit OTP code are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    // 1. Format check on OTP: must be strictly 6 numeric digits
    if (!/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({ error: 'Invalid verification code format. Must be a 6-digit number.' });
    }

    // 2. Retrieve challenge from MongoDB
    const pending = await PendingRegistration.findOne({ email: cleanEmail });
    if (!pending) {
      return res.status(400).json({ error: 'No pending registration found for this email, or code has expired. Please request a new code.' });
    }

    // 3. Expiry check (5-minute window)
    const now = Date.now();
    if (now > pending.expires_at) {
      await PendingRegistration.deleteOne({ email: cleanEmail });
      return res.status(400).json({ error: 'Verification code has expired. Please request a fresh OTP.' });
    }

    // 4. Verify OTP using timing-safe comparison & enforce attempt limit (max 5)
    const isValid = verifyOtpHash(cleanOtp, pending.otp_hash);

    if (!isValid) {
      const updatedAttempts = (pending.attempts || 0) + 1;
      await PendingRegistration.updateOne(
        { email: cleanEmail },
        { $set: { attempts: updatedAttempts, updatedAt: new Date() } }
      );
      const remainingAttempts = Math.max(0, 5 - updatedAttempts);

      if (remainingAttempts === 0) {
        await PendingRegistration.deleteOne({ email: cleanEmail });
        return res.status(429).json({ error: 'Invalid verification code. Maximum attempts reached. Please request a new OTP.' });
      }

      return res.status(400).json({
        error: `Invalid verification code. Please check your email and try again (${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining).`,
        attemptsRemaining: remainingAttempts
      });
    }

    // 5. Concurrency re-check: verify user doesn't already exist
    const duplicateUser = await User.findOne({ email: cleanEmail });
    if (duplicateUser) {
      await PendingRegistration.deleteOne({ email: cleanEmail });
      return res.status(409).json({ error: 'An account with this email was already registered. Please sign in.' });
    }

    // 6. Create user in MongoDB and atomically remove pending challenge
    const userId = 'usr-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

    const newUser = await User.create({
      id: userId,
      name: pending.name,
      email: pending.email,
      phone: pending.phone,
      city: pending.city,
      password: pending.password_hash,
      role: 'customer',
      authProvider: 'local',
      clearCoins: 250, // 250 Grain Coins welcome reward
      membershipTier: 'Silver Grain',
      isEmailVerified: true
    });

    // Invalidate pending registration immediately (prevents replay/reuse)
    await PendingRegistration.deleteOne({ email: cleanEmail });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'Welcome to itsclear! Your account has been created successfully. 250 Free Grain Coins have been credited to your account.',
      user: sanitizeUser(newUser),
      token
    });
  } catch (err) {
    console.error('Error verifying OTP and creating user:', err);
    res.status(500).json({ error: 'Failed to complete registration. Please try again.' });
  }
});

// =========================================================================
// 5. RESEND REGISTRATION OTP (POST /api/auth/register/resend-otp)
// =========================================================================
router.post('/register/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required to resend OTP.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const pending = await PendingRegistration.findOne({ email: cleanEmail });

    if (!pending) {
      return res.status(400).json({ error: 'No pending registration found for this email. Please fill in the registration form again.' });
    }

    const now = Date.now();

    // Check resend cooldown (30 seconds)
    if (now < pending.resend_available_at) {
      const waitSec = Math.ceil((pending.resend_available_at - now) / 1000);
      return res.status(429).json({
        error: `Please wait ${waitSec} seconds before requesting a new OTP.`,
        resendAfter: waitSec
      });
    }

    // Check hourly limit (5 per hour)
    const isWithinWindow = (now - pending.window_start_time) < (60 * 60 * 1000);
    if (isWithinWindow && pending.send_count >= 5) {
      return res.status(429).json({
        error: 'Maximum OTP requests reached for this email (5 per hour). Please try again later.'
      });
    }

    const sendCount = isWithinWindow ? pending.send_count + 1 : 1;
    const windowStart = isWithinWindow ? pending.window_start_time : now;

    // Generate new OTP
    const newOtp = crypto.randomInt(100000, 1000000).toString();
    const newOtpHash = hashOtp(newOtp);
    const expiresInSeconds = 300;
    const resendCooldownSeconds = 30;
    const expiresAt = now + (expiresInSeconds * 1000);
    const resendAvailableAt = now + (resendCooldownSeconds * 1000);

    let emailResult;
    try {
      emailResult = await sendOtpEmail({
        email: cleanEmail,
        name: pending.name,
        otp: newOtp,
        purpose: 'registration'
      });
    } catch (deliveryError) {
      console.error('[Auth API] Email delivery failed:', deliveryError.message);
      return res.status(502).json({
        error: `Could not send verification email: ${deliveryError.message || 'Email delivery failed'}. Please verify your email configuration.`
      });
    }

    await PendingRegistration.updateOne(
      { email: cleanEmail },
      {
        $set: {
          otp_hash: newOtpHash,
          expires_at: expiresAt,
          attempts: 0,
          resend_available_at: resendAvailableAt,
          send_count: sendCount,
          window_start_time: windowStart,
          updatedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: emailResult?.mode === 'local'
        ? 'New verification OTP generated in local mode.'
        : 'New verification OTP sent successfully to your email address.',
      expiresIn: expiresInSeconds,
      resendAfter: resendCooldownSeconds,
      ...(emailResult?.mode === 'local' ? { mode: 'local', devOtp: emailResult.devOtp } : {})
    });
  } catch (err) {
    console.error('Error resending OTP:', err);
    res.status(500).json({ error: 'Failed to resend OTP. Please try again.' });
  }
});

// =========================================================================
// 6. LOGIN: SEND EMAIL OTP (POST /api/auth/login/send-otp)
// Works for both Customers and Authorized Administrators
// =========================================================================
router.post('/login/send-otp', async (req, res) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    const ipCheck = checkIpRateLimit(req, 10, 15 * 60 * 1000);
    if (!ipCheck.allowed) {
      return res.status(429).json({ error: 'Too many requests from this network. Please try again later.' });
    }

    // Check if user exists (Customer or Admin)
    const user = await User.findOne({ email });

    // Defense against account enumeration: Always return success message even if email is not found
    if (!user) {
      return res.json({
        success: true,
        message: 'If this email address is registered, a secure 6-digit login code has been sent.',
        expiresIn: 300,
        resendAfter: 30
      });
    }

    const existing = await LoginOtp.findOne({ email });
    const now = Date.now();
    if (existing && existing.resendAvailableAt.getTime() > now) {
      const retryAfter = Math.ceil((existing.resendAvailableAt.getTime() - now) / 1000);
      return res.status(429).json({
        error: `Please wait ${retryAfter} seconds before requesting another login code.`,
        retryAfter
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const emailResult = await sendOtpEmail({
      email,
      name: user.name,
      otp,
      purpose: 'login'
    });

    await LoginOtp.findOneAndUpdate(
      { email },
      {
        email,
        otpHash: hashOtp(otp),
        expiresAt: new Date(now + 5 * 60 * 1000),
        resendAvailableAt: new Date(now + 30 * 1000),
        attempts: 0,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'A secure 6-digit login code has been sent to your email.',
      expiresIn: 300,
      resendAfter: 30,
      ...(emailResult?.mode === 'local' ? { mode: 'local', devOtp: emailResult.devOtp } : {})
    });
  } catch (error) {
    console.error('Login OTP send failed:', error.message);
    res.status(502).json({ error: 'Could not deliver login code. Please check your email configuration.' });
  }
});

// =========================================================================
// 7. LOGIN: VERIFY EMAIL OTP (POST /api/auth/login/verify-otp)
// Works for Customers and Authorized Admins
// =========================================================================
router.post('/login/verify-otp', async (req, res) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const otp = String(req.body.otp || '').trim();
    const portal = req.body.portal || 'customer';

    if (!isValidEmail(email) || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({ error: 'Valid email and 6-digit numeric code are required.' });
    }

    const challenge = await LoginOtp.findOne({ email });
    if (!challenge || challenge.expiresAt.getTime() < Date.now()) {
      await LoginOtp.deleteOne({ email });
      return res.status(400).json({ error: 'Login code is invalid or has expired. Please request a new code.' });
    }

    if (challenge.attempts >= 5 || !verifyOtpHash(otp, challenge.otpHash)) {
      challenge.attempts += 1;
      if (challenge.attempts >= 5) {
        await LoginOtp.deleteOne({ email });
        return res.status(429).json({ error: 'Too many incorrect attempts. Please request a new code.' });
      } else {
        await challenge.save();
        const remaining = 5 - challenge.attempts;
        return res.status(400).json({
          error: `Invalid login code (${remaining} attempt${remaining === 1 ? '' : 's'} remaining).`,
          attemptsRemaining: remaining
        });
      }
    }

    const user = await User.findOne({ email });
    if (!user) {
      await LoginOtp.deleteOne({ email });
      return res.status(401).json({ error: 'Account not found.' });
    }

    // If logging into admin portal via OTP, strictly verify admin role
    if (portal === 'admin' && user.role !== 'admin') {
      await LoginOtp.deleteOne({ email });
      return res.status(403).json({ error: 'Forbidden: This account does not have administrator privileges.' });
    }

    await LoginOtp.deleteOne({ email });

    const isSessionAdmin = user.role === 'admin' && portal === 'admin';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: isSessionAdmin ? '7d' : '30d' }
    );

    res.json({
      success: true,
      user: sanitizeUser(user),
      token,
      message: `Welcome back, ${user.name}!`
    });
  } catch (error) {
    console.error('Login OTP verification failed:', error.message);
    res.status(500).json({ error: 'Could not verify login code.' });
  }
});

// =========================================================================
// 8. CUSTOMER PASSWORD LOGIN (POST /api/auth/login)
// =========================================================================
router.post('/login', async (req, res) => {
  try {
    const ipCheck = checkIpRateLimit(req, 12, 15 * 60 * 1000);
    if (!ipCheck.allowed) return res.status(429).json({ error: 'Too many login attempts. Please try again later.' });
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password || typeof emailOrPhone !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Valid Email/Phone and password are required' });
    }

    const query = emailOrPhone.trim().toLowerCase();
    const rawPhone = emailOrPhone.trim();

    const user = await User.findOne({
      $or: [
        { email: query },
        { phone: rawPhone }
      ]
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email/phone or password.' });
    }

    if (!user.password) {
      return res.status(401).json({
        error: 'This account was created with Google OAuth or Email OTP. Please sign in using Google or request an Email OTP.'
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email/phone or password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({
      user: sanitizeUser(user),
      token,
      message: `Welcome back, ${user.name}!`
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// =========================================================================
// 9. ADMIN PORTAL PASSWORD LOGIN (POST /api/auth/admin-login)
// =========================================================================
router.post('/admin-login', async (req, res) => {
  try {
    const ipCheck = checkIpRateLimit(req, 6, 15 * 60 * 1000);
    if (!ipCheck.allowed) return res.status(429).json({ error: 'Too many admin login attempts. Please try again later.' });
    const { email, password } = req.body;
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Admin email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail, role: 'admin' });

    if (!user) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    if (!user.password) {
      return res.status(401).json({ error: 'This admin account uses Google Authentication. Please sign in using Continue with Google.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      user: sanitizeUser(user),
      token,
      message: 'Admin access granted'
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Admin login failed' });
  }
});

// =========================================================================
// 10. GET CURRENT LOGGED IN USER (/api/auth/me)
// =========================================================================
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ id: decoded.id });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const sanitized = sanitizeUser(user);
    res.json({
      user: sanitized,
      ...sanitized
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// =========================================================================
// 11. ADMIN CHANGE PASSWORD (POST /api/auth/admin-change-password)
// =========================================================================
router.post('/admin-change-password', requireAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 12) {
      return res.status(400).json({ error: 'New admin password must be at least 12 characters.' });
    }
    const hashedPassword = bcrypt.hashSync(newPassword.trim(), 10);
    await User.findOneAndUpdate(
      { id: req.user.id, role: 'admin' },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );
    res.json({ success: true, message: 'Admin password updated in database.' });
  } catch (err) {
    console.error('Admin password update error:', err);
    res.status(500).json({ error: 'Failed to update admin password' });
  }
});

module.exports = router;
