const nodemailer = require('nodemailer');
const { Resend } = require('resend');

/**
 * itsclear Email Service
 * Supports:
 * 1. Free Gmail / Custom SMTP (via Nodemailer) - Zero API key / 0 cost
 * 2. Resend API (https://resend.com) - Optional
 * 3. Local Dev Fallback - Prints OTP to console when no credentials configured
 */

function isPlaceholderKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') return true;
  const trimmed = apiKey.trim();
  return trimmed === '' || trimmed.includes('replace_with_your_actual_key');
}

/**
 * Get Nodemailer SMTP Transporter with connection resilience
 */
function getSmtpTransporter() {
  const user = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : '';
  const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.trim() : '';

  if (!user || !pass) {
    return null;
  }

  const host = process.env.SMTP_HOST ? process.env.SMTP_HOST.trim() : 'smtp.gmail.com';
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465;
  const secure = process.env.SMTP_SECURE === 'false' ? false : (port === 465);

  // If using Gmail, configure with fallback-tolerant options
  if (host === 'smtp.gmail.com' || user.toLowerCase().endsWith('@gmail.com')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    }
  });
}

/**
 * Get Resend API Client (Optional)
 */
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.trim() : '';
  if (isPlaceholderKey(apiKey)) {
    return null;
  }
  return new Resend(apiKey);
}

/**
 * Generate branded itsclear HTML email template for OTP verification
 */
function generateOtpHtml({ name, otp, purpose = 'registration' }) {
  const firstName = name ? name.split(' ')[0] : 'Valued Customer';
  const formattedOtp = otp.split('').join(' ');
  const isLogin = purpose === 'login';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your itsclear Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;" cellspacing="0" cellpadding="0">
          
          <!-- Header Banner (Dark Navy & Brand Accent) -->
          <tr>
            <td style="background-color: #0b192c; padding: 28px 32px; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <span style="font-size: 26px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">
                      itsclear<span style="color: #f59e0b;">.</span>
                    </span>
                    <div style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; font-weight: 700;">
                      100% Pure Stoneground Chakki Atta
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #0f172a;">
                ${isLogin ? 'Your Secure Login Code' : 'Verify Your Email Address'}
              </h2>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Hello <strong>${firstName}</strong>,<br>
                ${isLogin
                  ? 'Use the following one-time code to securely sign in to your itsclear account:'
                  : 'Thank you for choosing <strong>itsclear</strong>. Please enter the following 6-digit verification code to complete your customer registration:'}
              </p>

              <!-- OTP Code Display Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0 24px 0;">
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 2px dashed #f59e0b; border-radius: 16px; padding: 24px 16px;">
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 800; color: #b45309; margin-bottom: 8px;">
                      Your One-Time Password (OTP)
                    </div>
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #0b192c; text-indent: 8px; line-height: 1.2;">
                      ${formattedOtp}
                    </div>
                    <div style="font-size: 12px; font-weight: 700; color: #d97706; margin-top: 10px;">
                      ⏱️ Valid for 5 minutes only
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Grain Coins Reward Box (Only for registration) -->
              ${!isLogin ? `
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 14px 16px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="28" valign="top">
                          <div style="width: 24px; height: 24px; border-radius: 50%; background-color: #d97706; color: #ffffff; font-size: 13px; font-weight: 900; line-height: 24px; text-align: center;">&#8377;</div>
                        </td>
                        <td style="padding-left: 10px;">
                          <div style="font-size: 13px; font-weight: 800; color: #065f46;">
                            250 Free Grain Coins (₹250 Value)
                          </div>
                          <div style="font-size: 12px; color: #047857; margin-top: 2px;">
                            Will be automatically credited to your wallet once your email is verified!
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>` : ''}

              <!-- Security Notice -->
              <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 12px; line-height: 1.5; color: #64748b;">
                <strong style="color: #334155;">Security Notice:</strong> Never share this verification code with anyone. itsclear executives will never ask for your OTP. If you did not initiate this request, please disregard this email.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
              itsclear™ Cold-Stone Chakki Fresh Delivery • Direct Farm Harvest<br>
              Delivering across Lucknow, Uttar Pradesh, India<br>
              &copy; ${new Date().getFullYear()} itsclear. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text fallback for OTP verification
 */
function generateOtpText({ name, otp, purpose = 'registration' }) {
  const firstName = name ? name.split(' ')[0] : 'Valued Customer';
  return `
itsclear - Email Verification Code

Hello ${firstName},

${purpose === 'login' ? 'Use this code to securely sign in to your itsclear account:' : 'Thank you for choosing itsclear! Your 6-digit verification code is:'}

${otp}

This code is valid for 5 minutes.

${purpose !== 'login' ? `WELCOME BONUS:\n250 Free Grain Coins (₹250 value) will be credited to your itsclear wallet immediately upon successful verification.\n\n` : ''}SECURITY NOTICE:
Never share this code with anyone. itsclear representatives will never ask for your OTP. If you did not request this, please disregard this message.

--
Team itsclear
100% Pure Stoneground Chakki Atta
Lucknow, Uttar Pradesh, India
  `.trim();
}

/**
 * Send OTP Verification Email
 * Prioritizes:
 * 1. Free Gmail / Custom SMTP (Nodemailer)
 * 2. Resend API
 * 3. Local Dev Fallback (Logs to console in development)
 * 
 * @param {Object} params
 * @param {string} params.email - Recipient email
 * @param {string} params.name - Recipient customer name
 * @param {string} params.otp - 6-digit numeric OTP
 * @param {string} [params.purpose] - 'registration' | 'login'
 * @returns {Promise<{ success: boolean, id: string, mode: string }>}
 */
async function sendOtpEmail({ email, name, otp, purpose = 'registration' }) {
  if (!email || !otp) {
    throw new Error('Email and OTP are required for email delivery');
  }

  const cleanEmail = email.trim().toLowerCase();
  const subject = purpose === 'login'
    ? `itsclear: Your secure login code is ${otp}`
    : `itsclear: Your 6-Digit Verification Code is ${otp}`;
  const html = generateOtpHtml({ name, otp, purpose });
  const text = generateOtpText({ name, otp, purpose });

  // 1. Try Free Gmail / SMTP (Nodemailer)
  const smtpTransporter = getSmtpTransporter();
  if (smtpTransporter) {
    try {
      const user = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : '';
      // Ensure 'from' header is valid for Gmail or custom domain
      let from = process.env.SMTP_FROM || `itsclear <${user}>`;
      if (user.toLowerCase().endsWith('@gmail.com') && !from.includes(user)) {
        from = `itsclear <${user}>`;
      }

      const info = await smtpTransporter.sendMail({
        from,
        to: cleanEmail,
        subject,
        html,
        text
      });

      console.log(`[EmailService] OTP sent via Gmail/SMTP to ${cleanEmail}. MessageId: ${info.messageId}`);
      return {
        success: true,
        id: info.messageId,
        mode: 'smtp'
      };
    } catch (smtpErr) {
      console.error('[EmailService] SMTP delivery failed:', smtpErr.message);
      // If Resend is also configured, let it fall through to Resend; otherwise throw descriptive error
      if (!process.env.RESEND_API_KEY || isPlaceholderKey(process.env.RESEND_API_KEY)) {
        throw new Error(`SMTP Error: ${smtpErr.message}. Verify SMTP_USER and App Password in server configuration.`);
      }
    }
  }

  // 2. Try Resend API (if configured)
  const resend = getResendClient();
  if (resend) {
    try {
      const fromAddress = process.env.ITS_CLEAR_EMAIL_FROM || 'itsclear <onboarding@resend.dev>';
      const result = await resend.emails.send({
        from: fromAddress,
        to: [cleanEmail],
        subject,
        html,
        text
      });

      if (result.error) {
        console.error('[EmailService] Resend API rejected email send:', result.error.message || result.error);
        throw new Error(result.error.message || 'Resend failed to deliver verification email');
      }

      const messageId = result.data ? result.data.id : 'sent';
      return {
        success: true,
        id: messageId,
        mode: 'resend'
      };
    } catch (err) {
      console.error('[EmailService] Resend SDK error sending email:', err.message);
      throw err;
    }
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Email delivery is not configured. Please set Gmail SMTP (SMTP_USER & SMTP_PASS) or Resend API key in server/.env');
  }

  // 3. Local Development Fallback (only in non-production)
  console.log(`\n🔐 [Local OTP Mode] Verification code for ${cleanEmail}: ${otp}\n`);
  return {
    success: true,
    id: 'local-dev-otp',
    mode: 'local',
    devOtp: otp
  };
}

module.exports = {
  sendOtpEmail,
  generateOtpHtml,
  generateOtpText,
  getSmtpTransporter,
  getResendClient
};
