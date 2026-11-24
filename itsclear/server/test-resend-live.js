require('dotenv').config();
const { sendOtpEmail } = require('./services/emailService');

async function testResend() {
  console.log('Testing Resend Integration with current configured key...');
  console.log('API Key configured:', process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.slice(0, 7)}...` : 'NONE');
  console.log('From address:', process.env.ITS_CLEAR_EMAIL_FROM);

  try {
    const result = await sendOtpEmail({
      email: 'test@example.com',
      name: 'Test Customer',
      otp: '123456'
    });
    console.log('✅ Resend Live Send Succeeded:', result);
  } catch (err) {
    console.log('ℹ️ Resend Response as expected with placeholder key:');
    console.log('   Error message:', err.message);
  }
}

testResend();
