require('dotenv').config();
const { sendOtpEmail, generateOtpHtml, generateOtpText } = require('./services/emailService');

async function testEmailService() {
  console.log('======================================================');
  console.log('📧 Testing itsclear Email Service (Gmail / SMTP / Local)');
  console.log('======================================================\n');

  // Test 1: HTML & Text templates
  const html = generateOtpHtml({ name: 'Rahul Sharma', otp: '739201' });
  const text = generateOtpText({ name: 'Rahul Sharma', otp: '739201' });

  if (html.includes('7 3 9 2 0 1') && html.includes('250 Free Grain Coins')) {
    console.log('✅ PASS: Branded HTML email template generated with correct OTP & bonus');
  } else {
    console.error('❌ FAIL: HTML template generation error');
    process.exit(1);
  }

  if (text.includes('739201') && text.includes('Team itsclear')) {
    console.log('✅ PASS: Plaintext email fallback generated cleanly');
  } else {
    console.error('❌ FAIL: Plaintext template generation error');
    process.exit(1);
  }

  // Test 2: Local fallback mode (when no SMTP credentials present)
  const result = await sendOtpEmail({
    email: 'customer@example.com',
    name: 'Rahul Sharma',
    otp: '739201'
  });

  if (result.success && result.mode === 'local' && result.devOtp === '739201') {
    console.log('✅ PASS: Graceful local development fallback active when no external SMTP/API is provided');
  } else if (result.success && result.mode === 'smtp') {
    console.log(`✅ PASS: Successfully dispatched via live SMTP to customer@example.com (MessageId: ${result.id})`);
  } else {
    console.error('❌ FAIL: Unexpected send result:', result);
    process.exit(1);
  }

  console.log('\n======================================================');
  console.log('📊 Email Service: All checks passed!');
  console.log('======================================================');
}

testEmailService().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
