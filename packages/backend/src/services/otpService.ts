import { createClient } from 'redis';
import { Resend } from 'resend';

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

const resend = new Resend(process.env.RESEND_API_KEY);

redis.on('error', (err) => console.error('Redis error:', err));
redis.connect();

const OTP_LENGTH = parseInt(process.env.OTP_LENGTH || '6');
const OTP_EXPIRY = parseInt(process.env.OTP_EXPIRY_SECONDS || '600');

/**
 * Generate a random OTP
 */
function generateOTP(): string {
  return Math.floor(Math.random() * Math.pow(10, OTP_LENGTH))
    .toString()
    .padStart(OTP_LENGTH, '0');
}

/**
 * Send OTP to email
 */
export async function sendOTP(email: string): Promise<void> {
  const otp = generateOTP();
  
  // Store OTP in Redis with expiry
  await redis.setEx(`otp:${email}`, OTP_EXPIRY, otp);

  // Send email
  await resend.emails.send({
    from: 'ZeroKlue <noreply@zeroklue.com>',
    to: email,
    subject: 'Your ZeroKlue Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify Your Student Email</h2>
        <p>Your verification code is:</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
          ${otp}
        </div>
        <p style="color: #666;">This code will expire in 10 minutes.</p>
        <p style="color: #666;">If you didn't request this code, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">
          ZeroKlue - Privacy-preserving student verification
        </p>
      </div>
    `,
  });

  console.log(`📧 OTP sent to ${email}`);
}

/**
 * Verify OTP
 */
export async function verifyOTP(email: string, otp: string): Promise<boolean> {
  const storedOTP = await redis.get(`otp:${email}`);
  
  if (!storedOTP) {
    console.log(`❌ OTP not found for ${email}`);
    return false;
  }

  if (storedOTP !== otp) {
    console.log(`❌ OTP mismatch for ${email}`);
    return false;
  }

  // Delete OTP after successful verification
  await redis.del(`otp:${email}`);
  console.log(`✅ OTP verified for ${email}`);
  
  return true;
}

export { redis };
