const http = require('http');
const express = require('express');
const { connectDB, mongoose } = require('./db');
const authRoutes = require('./routes/auth');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

const server = app.listen(0); // Random free port
const port = server.address().port;

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
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

async function runHttpTests() {
  await connectDB();

  console.log('======================================================');
  console.log('🌐 Testing itsclear Auth HTTP REST Endpoints (MongoDB)');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Missing fields
    console.log('--- Test 1: Validation of Missing Fields ---');
    const r1 = await request('POST', '/api/auth/register/send-otp', {});
    assert(r1.status === 400, 'HTTP 400 returned for missing fields');
    assert(r1.body.error !== undefined, 'Descriptive error message returned');

    // 2. Invalid Email format
    console.log('\n--- Test 2: Invalid Email Format ---');
    const r2 = await request('POST', '/api/auth/register/send-otp', {
      fullName: 'Rahul Sharma',
      mobile: '9876543210',
      email: 'notanemail',
      password: 'password123',
      confirmPassword: 'password123'
    });
    assert(r2.status === 400, 'HTTP 400 returned for invalid email format');

    // 3. Password mismatch
    console.log('\n--- Test 3: Password Mismatch ---');
    const r3 = await request('POST', '/api/auth/register/send-otp', {
      fullName: 'Rahul Sharma',
      mobile: '9876543210',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'mismatchPassword'
    });
    assert(r3.status === 400, 'HTTP 400 returned for mismatched passwords');

    // 4. Duplicate Admin Email
    console.log('\n--- Test 4: Duplicate Email Block ---');
    const r4 = await request('POST', '/api/auth/register/send-otp', {
      fullName: 'Fake Admin',
      mobile: '9876543210',
      email: 'admin@itsclear.in',
      password: 'password123',
      confirmPassword: 'password123'
    });
    assert(r4.status === 409, 'HTTP 409 returned for existing registered email');

    // 5. Verify & Create with Non-existent pending email
    console.log('\n--- Test 5: Verify Non-existent Challenge ---');
    const r5 = await request('POST', '/api/auth/register/verify-and-create', {
      email: 'nonexistent@example.com',
      otp: '123456'
    });
    assert(r5.status === 400, 'HTTP 400 returned when no challenge exists');

    // 6. Verify & Create with Invalid format OTP
    console.log('\n--- Test 6: Verify Invalid OTP Format ---');
    const r6 = await request('POST', '/api/auth/register/verify-and-create', {
      email: 'test@example.com',
      otp: 'abc'
    });
    assert(r6.status === 400, 'HTTP 400 returned when OTP is not 6 numeric digits');

    console.log('\n======================================================');
    console.log(`📊 HTTP Endpoint Results: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================');
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runHttpTests().catch(err => {
  console.error('HTTP test error:', err);
  process.exit(1);
});
