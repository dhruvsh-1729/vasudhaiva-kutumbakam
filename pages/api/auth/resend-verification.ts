// pages/api/auth/resend-verification.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { TokenUtils } from '../../../lib/tokenUtils';
import { EmailService } from '../../../lib/emailService';

const prisma = new PrismaClient();

interface ResendVerificationResponse {
  success: boolean;
  message: string;
  waitTime?: number;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResendVerificationResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST request.',
      message: 'Invalid request method'
    });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
        message: 'Missing email'
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        name: true,
        email: true,
        isEmailVerified: true,
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No account found with this email address.',
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email is already verified.',
        message: 'Already verified'
      });
    }

    // Check if user can resend verification email
    const resendCheck = await TokenUtils.canResendVerificationEmail(user.id);
    
    if (!resendCheck.canResend) {
      return res.status(429).json({
        success: false,
        error: `Please wait ${Math.ceil((resendCheck.waitTime || 0) / 60)} minutes before requesting another verification email.`,
        message: 'Rate limit exceeded',
        waitTime: resendCheck.waitTime
      });
    }

    // Generate new verification token
    const verificationToken = await TokenUtils.createVerificationToken(user.id);

    // Send verification email
    const emailService = EmailService.getInstance();
    const emailSent = await emailService.sendVerificationEmail(
      user.email,
      user.name,
      verificationToken
    );

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        error: 'Failed to send verification email. Please try again later.',
        message: 'Email send failed'
      });
    }

    console.log(`Verification email resent to: ${user.email} at ${new Date().toISOString()}`);

    return res.status(200).json({
      success: true,
      message: 'Verification email sent! Please check your inbox and spam folder.'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred. Please try again later.',
      message: 'Internal server error'
    });
  } finally {
    await prisma.$disconnect();
  }
}