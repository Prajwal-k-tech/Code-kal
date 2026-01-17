import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { sendOTP, verifyOTP } from '../services/otpService';
import { signCredential } from '../services/cryptoService';
import { hashEmail } from '../utils/hash';

const router = Router();

// Validation schemas
const verifyEmailSchema = z.object({
  email: z.string().email(),
});

const verifyOTPSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

/**
 * POST /api/verify/email
 * Send OTP to university email
 */
router.post('/email', async (req: Request, res: Response) => {
  try {
    const { email } = verifyEmailSchema.parse(req.body);

    // Check if email domain is allowed
    const allowedDomains = process.env.ALLOWED_DOMAINS?.split(',') || [];
    const domain = email.split('@')[1];
    
    if (!allowedDomains.includes(domain)) {
      return res.status(400).json({
        success: false,
        error: 'Email domain not supported',
        allowedDomains,
      });
    }

    // Send OTP
    const result = await sendOTP(email);

    res.json({
      success: true,
      message: 'OTP sent to email',
      expiresIn: 600, // 10 minutes
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
        details: error.errors,
      });
    }

    console.error('Error sending OTP:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send OTP',
    });
  }
});

/**
 * POST /api/verify/otp
 * Verify OTP and return signed credential
 */
router.post('/otp', async (req: Request, res: Response) => {
  try {
    const { email, otp, walletAddress } = verifyOTPSchema.parse(req.body);

    // Verify OTP
    const isValid = await verifyOTP(email, otp);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP',
      });
    }

    // Generate credential
    const emailHash = hashEmail(email);
    const credential = signCredential(walletAddress, emailHash);

    res.json({
      success: true,
      credential: {
        walletAddress,
        emailHash,
        signature: {
          r: credential.signature.r,
          s: credential.signature.s,
        },
        issuerPublicKey: {
          x: credential.issuerPublicKey.x,
          y: credential.issuerPublicKey.y,
        },
        nullifier: credential.nullifier,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
      });
    }

    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify OTP',
    });
  }
});

export default router;
