// pages/api/auth/forgot-password.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { TokenUtils } from '../../../lib/tokenUtils';
import { EmailService } from '../../../lib/emailService';

const prisma = new PrismaClient();

interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ForgotPasswordResponse>
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

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
        message: 'Missing email'
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        isEmailVerified: true,
      }
    });

    // Always return success message for security (don't reveal if email exists)
    const successMessage = 'If an account with this email exists, you will receive password reset instructions shortly.';

    if (!user) {
      // Don't reveal that user doesn't exist
      return res.status(200).json({
        success: true,
        message: successMessage
      });
    }

    if (!user.isActive) {
      // Don't reveal account status
      return res.status(200).json({
        success: true,
        message: successMessage
      });
    }

    if (!user.isEmailVerified) {
      // Don't reveal verification status
      return res.status(200).json({
        success: true,
        message: successMessage
      });
    }

    // Generate password reset token
    const resetToken = await TokenUtils.createPasswordResetToken(user.id);

    // Send password reset email
    const emailService = EmailService.getInstance();
    const emailSent = await emailService.sendPasswordResetEmail(
      user.email,
      user.name,
      resetToken
    );

    if (emailSent) {
      console.log(`Password reset email sent to: ${user.email} at ${new Date().toISOString()}`);
    } else {
      console.error(`Failed to send password reset email to: ${user.email}`);
    }

    // Always return success message for security
    return res.status(200).json({
      success: true,
      message: successMessage
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred. Please try again later.',
      message: 'Internal server error'
    });
  } finally {
    await prisma.$disconnect();
  }
}