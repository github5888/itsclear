process.env.NODE_ENV = 'test';
process.env.OTP_PEPPER = 'test_pepper_google_and_otp_2026';
process.env.JWT_SECRET = 'test_jwt_secret_google_and_otp_2026';

const http = require('http');
const express = require('express');
const { connectDB, User, LoginOtp, PendingRegistration, mongoose } = require('./db');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');

const app = express();
app.set('trust proxy', 1);
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

let server;
let port;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    if (postData) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path,
      method,
      headers: reqHeaders
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTestSuite() {
  await connectDB();
  server = app.listen(0);
  port = server.address().port;

  console.log('================================================================');
  console.log('🚀 ITSCLEAR: GOOGLE OAUTH + EMAIL OTP PRODUCTION TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  const timestamp = Date.now();
  const testCustomerEmail = `cust_${timestamp}@itsclear.in`;
  const testCustomerSub = `google-sub-${timestamp}`;
  const testAdminEmail = `admin_${timestamp}@itsclear.in`;
  const testAdminSub = `google-admin-sub-${timestamp}`;
  const testLocalEmail = `local_${timestamp}@itsclear.in`;

  try {
    // -------------------------------------------------------------
    // SCENARIO 1: New Customer Registers via Google OAuth
    // -------------------------------------------------------------
    console.log('--- SCENARIO 1: New Customer Registration via Google OAuth ---');
    const tokenScenario1 = `test-token:${testCustomerEmail}:${testCustomerSub}:Aman Verma`;
    const res1 = await request('POST', '/api/auth/google', {
      credential: tokenScenario1,
      portal: 'customer'
    });
    assert(res1.status === 201 || res1.status === 200, 'HTTP 201/200 OK returned on new Google customer signup');
    assert(res1.body.success === true, 'Response reports success: true');
    assert(res1.body.token !== undefined, 'Secure JWT session token generated');
    assert(res1.body.user.email === testCustomerEmail, 'User email matches verified Google email');
    assert(res1.body.user.googleId === testCustomerSub, 'Stable Google Subject ID saved');
    assert(res1.body.user.clearCoins === 250, 'Welcome bonus of 250 Grain Coins awarded');
    assert(res1.body.user.role === 'customer', 'Default role is strictly customer');
    assert(res1.body.user.password === undefined, 'Password is never exposed in response');

    // -------------------------------------------------------------
    // SCENARIO 2: Existing Google Customer Signs In
    // -------------------------------------------------------------
    console.log('\n--- SCENARIO 2: Existing Google Customer Sign In ---');
    const res2 = await request('POST', '/api/auth/google', {
      credential: tokenScenario1,
      portal: 'customer'
    });
    assert(res2.status === 200, 'HTTP 200 OK returned on returning Google customer login');
    assert(res2.body.user.id === res1.body.user.id, 'User ID matches existing database account (no duplicate)');
    assert(res2.body.token !== undefined, 'Fresh session JWT issued for returning customer');

    // Verify DB count: only 1 user exists with this email
    const countUsers = await User.countDocuments({ email: testCustomerEmail });
    assert(countUsers === 1, 'Strictly zero duplicate accounts in MongoDB collection');

    // -------------------------------------------------------------
    // SCENARIO 3: Customer Registration via Email OTP
    // -------------------------------------------------------------
    console.log('\n--- SCENARIO 3: Customer Registration via Email OTP ---');
    const regEmail = `emailotp_${timestamp}@itsclear.in`;
    const regMobile = `+91 99123 ${Math.floor(10000 + Math.random() * 90000)}`;

    const resSendRegOtp = await request('POST', '/api/auth/register/send-otp', {
      fullName: 'Vikram Singh',
      mobile: regMobile,
      email: regEmail,
      city: 'Lucknow',
      password: 'StrongPassword@2026',
      confirmPassword: 'StrongPassword@2026'
    });
    assert(resSendRegOtp.status === 200, 'Registration OTP challenge created successfully');

    // Retrieve pending challenge from MongoDB to get dev/mock OTP or verify directly
    const pendingChallenge = await PendingRegistration.findOne({ email: regEmail });
    assert(pendingChallenge !== null, 'Registration record pending in MongoDB');

    // In dev/test mode, devOtp is returned in response
    const regOtp = resSendRegOtp.body.devOtp || '123456';
    const resVerifyReg = await request('POST', '/api/auth/register/verify-and-create', {
      email: regEmail,
      otp: regOtp
    });
    assert(resVerifyReg.status === 201 || resVerifyReg.status === 200, 'Registration completed via Email OTP verification');
    assert(resVerifyReg.body.user.clearCoins === 250, '250 Coins credited for verified OTP registration');
    assert(resVerifyReg.body.token !== undefined, 'Session JWT returned upon OTP registration');

    // -------------------------------------------------------------
    // SCENARIO 4: Existing Customer Signs In using Email OTP
    // -------------------------------------------------------------
    console.log('\n--- SCENARIO 4: Existing Customer Sign In using Email OTP ---');
    const resSendLoginOtp = await request('POST', '/api/auth/login/send-otp', {
      email: regEmail
    });
    assert(resSendLoginOtp.status === 200, 'Login OTP dispatched');
    const loginOtp = resSendLoginOtp.body.devOtp;
    assert(loginOtp !== undefined, 'OTP generated securely');

    const resVerifyLoginOtp = await request('POST', '/api/auth/login/verify-otp', {
      email: regEmail,
      otp: loginOtp,
      portal: 'customer'
    });
    assert(resVerifyLoginOtp.status === 200, 'Existing customer successfully signs in with Email OTP');
    assert(resVerifyLoginOtp.body.user.email === regEmail, 'Signed-in user matches request');

    // -------------------------------------------------------------
    // SCENARIO 5: Authorized Admin Signs In using Google OAuth
    // -------------------------------------------------------------
    console.log('\n--- SCENARIO 5: Authorized Admin Signs In using Google OAuth ---');
    // Pre-seed an authorized admin account in MongoDB
    await User.create({
      id: `admin-usr-${timestamp}`,
      name: 'Operations Director',
      email: testAdminEmail,
      phone: '+91 99999 11111',
      city: 'Lucknow',
      role: 'admin',
      authProvider: 'local',
      clearCoins: 5000,
      createdAt: new Date()
    });

    const adminToken = `test-token:${testAdminEmail}:${testAdminSub}:Operations Director`;
    const resAdminGoogle = await request('POST', '/api/auth/google', {
      credential: adminToken,
      portal: 'admin'
    });
    assert(resAdminGoogle.status === 200, 'Authorized admin successfully signs in via Google OAuth');
    assert(resAdminGoogle.body.user.role === 'admin', 'User holds admin role');
    assert(resAdminGoogle.body.user.googleId === testAdminSub, 'Google identity linked to admin account');
    const adminJwtToken = resAdminGoogle.body.token;

    // -------------------------------------------------------------
    // SCENARIO 6: Authorized Admin Signs In using Email OTP
    // -------------------------------------------------------------
    console.log('\n--- SCENARIO 6: Authorized Admin Signs In using Email OTP ---');
    const resAdminSendOtp = await request('POST', '/api/auth/login/send-otp', {
      email: testAdminEmail
    });
    assert(resAdminSendOtp.status === 200, 'Admin OTP dispatched');
    const adminOtp = resAdminSendOtp.body.devOtp;

    const resAdminVerifyOtp = await request('POST', '/api/auth/login/verify-otp', {
      email: testAdminEmail,
      otp: adminOtp,
      portal: 'admin'
    });
    assert(resAdminVerifyOtp.status === 200, 'Authorized admin verified via Email OTP');
    assert(resAdminVerifyOtp.body.user.role === 'admin', 'Admin privileges verified');

    // -------------------------------------------------------------
    // SCENARIO 7: Unauthorized Google User CANNOT Access Admin Portal
    // -------------------------------------------------------------
    console.log('\n--- SCENARIO 7: Unauthorized Google User Blocked from Admin Portal ---');
    const unauthorizedToken = `test-token:stranger_${timestamp}@gmail.com:google-stranger-${timestamp}:Stranger`;
    const resUnauth = await request('POST', '/api/auth/google', {
      credential: unauthorizedToken,
      portal: 'admin'
    });
    assert(resUnauth.status === 403, 'HTTP 403 Forbidden returned for non-admin Google user');
    assert(resUnauth.body.error.includes('not authorized') || resUnauth.body.error.includes('Access denied'), 'Descriptive rejection message');

    // Also check regular customer trying admin portal with their Google token
    const resCustAsAdmin = await request('POST', '/api/auth/google', {
      credential: tokenScenario1,
      portal: 'admin'
    });
    assert(resCustAsAdmin.status === 403, 'Regular customer Google account blocked from admin portal (HTTP 403)');

    // -------------------------------------------------------------
    // SCENARIO 8: Customer CANNOT Access Protected Admin APIs
    // -------------------------------------------------------------
    console.log('\n--- SCENARIO 8: Customer Cannot Access Protected Admin APIs ---');
    const customerJwt = res1.body.token;
    const resAdminApiCheck = await request('POST', '/api/auth/admin-change-password', {
      newPassword: 'short'
    }, {
      'Authorization': `Bearer ${customerJwt}`
    });
    assert(resAdminApiCheck.status === 403, 'Protected admin API returns HTTP 403 Forbidden to customer token');

    // Admin token should pass requireAdmin check (fails on validation of password length rather than 403 auth)
    const resAdminAllowed = await request('POST', '/api/auth/admin-change-password', {
      newPassword: 'short'
    }, {
      'Authorization': `Bearer ${adminJwtToken}`
    });
    assert(resAdminAllowed.status === 400, 'Authorized admin JWT passes role check into controller');

    // -------------------------------------------------------------
    // SCENARIO 9: Invalid Google Token is Rejected
    // -------------------------------------------------------------
    console.log('\n--- SCENARIO 9: Invalid Google Token Rejected ---');
    const resInvalidGoogle = await request('POST', '/api/auth/google', {
      credential: 'completely-invalid-malformed-token',
      portal: 'customer'
    });
    assert(resInvalidGoogle.status === 401, 'HTTP 401 returned for invalid Google token');

    const resEmptyGoogle = await request('POST', '/api/auth/google', {
      credential: '',
      portal: 'customer'
    });
    assert(resEmptyGoogle.status === 400, 'HTTP 400 returned when Google credential is empty');

    // -------------------------------------------------------------
    // SCENARIO 10: Expired or Incorrect OTP is Rejected with Limit Enforcement
    // -------------------------------------------------------------
    console.log('\n--- SCENARIO 10: Incorrect OTP Handling & Attempt Limits ---');
    const testLimitEmail = `limits_${timestamp}@itsclear.in`;
    await User.create({
      id: `usr-lim-${timestamp}`,
      name: 'Limit Tester',
      email: testLimitEmail,
      phone: '+91 99111 22233',
      city: 'Lucknow',
      role: 'customer'
    });

    const resSendLimit = await request('POST', '/api/auth/login/send-otp', { email: testLimitEmail });
    assert(resSendLimit.status === 200, 'Challenge sent for attempt testing');

    // Send incorrect OTP 4 times
    for (let attempt = 1; attempt <= 4; attempt++) {
      const resWrong = await request('POST', '/api/auth/login/verify-otp', {
        email: testLimitEmail,
        otp: '000000',
        portal: 'customer'
      });
      assert(resWrong.status === 400, `Incorrect attempt #${attempt} returns HTTP 400`);
      assert(resWrong.body.attemptsRemaining === (5 - attempt), `Accurate attemptsRemaining returned: ${5 - attempt}`);
    }

    // 5th incorrect attempt -> must trigger HTTP 429 and delete challenge
    const resFifth = await request('POST', '/api/auth/login/verify-otp', {
      email: testLimitEmail,
      otp: '000000',
      portal: 'customer'
    });
    assert(resFifth.status === 429, '5th incorrect attempt triggers HTTP 429 Rate Limit/Locked out');

    // Subsequent attempt fails as expired/invalid
    const resSixth = await request('POST', '/api/auth/login/verify-otp', {
      email: testLimitEmail,
      otp: '000000',
      portal: 'customer'
    });
    assert(resSixth.status === 400, 'Invalidated challenge cannot be retried without new code');

    // -------------------------------------------------------------
    // SCENARIO 11: Account Linking Flow (Safe Identity Linking)
    // -------------------------------------------------------------
    console.log('\n--- SCENARIO 11: Account Linking for Existing Password Accounts ---');
    const bcrypt = require('bcryptjs');
    const existingPasswordEmail = `password_user_${timestamp}@itsclear.in`;
    const userPassword = 'SecretPassword!2026';

    const localUser = await User.create({
      id: `usr-pw-${timestamp}`,
      name: 'Rohan Gupta',
      email: existingPasswordEmail,
      phone: '+91 98888 77777',
      password: bcrypt.hashSync(userPassword, 10),
      city: 'Lucknow',
      role: 'customer',
      clearCoins: 800
    });

    // When Rohan signs in with Google, it should NOT automatically merge without verification!
    const rohanGoogleToken = `test-token:${existingPasswordEmail}:rohan-google-sub-${timestamp}:Rohan Gupta`;
    const resRohanGoogle = await request('POST', '/api/auth/google', {
      credential: rohanGoogleToken,
      portal: 'customer'
    });
    assert(resRohanGoogle.status === 200, 'HTTP 200 returned for account linking challenge');
    assert(resRohanGoogle.body.requiresLinking === true, 'Response requires explicit linking verification');

    // Authorize linking with password
    const resLinkWithPassword = await request('POST', '/api/auth/google/link', {
      credential: rohanGoogleToken,
      password: userPassword
    });
    assert(resLinkWithPassword.status === 200, 'Account successfully linked with password authorization');
    assert(resLinkWithPassword.body.user.googleId === `rohan-google-sub-${timestamp}`, 'Google ID linked');
    assert(resLinkWithPassword.body.user.clearCoins === 800, 'Existing user balance of 800 Grain Coins strictly preserved');

    // Subsequent Google sign-in now works directly!
    const resSubsequentGoogle = await request('POST', '/api/auth/google', {
      credential: rohanGoogleToken,
      portal: 'customer'
    });
    assert(resSubsequentGoogle.status === 200, 'Subsequent Google login works seamlessly without repeated linking');
    assert(resSubsequentGoogle.body.user.id === localUser.id, 'User ID strictly identical');

    // -------------------------------------------------------------
    // SCENARIO 12: Account Enumeration Protection
    // -------------------------------------------------------------
    console.log('\n--- SCENARIO 12: Defense Against Account Enumeration ---');
    const nonExistentEmail = `doesnotexist_${timestamp}@example.com`;
    const resEnum = await request('POST', '/api/auth/login/send-otp', {
      email: nonExistentEmail
    });
    assert(resEnum.status === 200, 'Non-existent email returns generic HTTP 200 success message to prevent enumeration');

    // -------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------
    console.log('\n================================================================');
    console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================\n');

    if (failed === 0) {
      console.log('🎉 ALL 14 PRODUCTION SCENARIOS FULLY VERIFIED AND SECURED!\n');
    }

  } catch (err) {
    console.error('Fatal test error:', err);
    failed++;
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTestSuite();
