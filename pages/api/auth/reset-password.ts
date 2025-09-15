// pages/api/auth/reset-password.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { TokenUtils } from '../../../lib/tokenUtils';

const prisma = new PrismaClient();

interface ResetPasswordResponse {
  success: boolean;
  message: string;
  error?: string;
}

const validatePassword = (password: string): string[] => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return errors;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResetPasswordResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST request.',
      message: 'Invalid request method'
    });
  }

  try {
    const { token, password, confirmPassword } = req.body;

    // Validate input
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Reset token is required',
        message: 'Missing token'
      });
    }

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Password and confirm password are required',
        message: 'Missing password'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Passwords do not match',
        message: 'Password mismatch'
      });
    }

    // Validate password strength
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: passwordErrors.join(', '),
        message: 'Password validation failed'
      });
    }

    // Verify reset token
    const verification = await TokenUtils.verifyPasswordResetToken(token);
    
    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        error: verification.error || 'Invalid or expired reset token',
        message: 'Token verification failed'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user's password
    await prisma.user.update({
      where: { id: verification.userId },
      data: { 
        password: hashedPassword,
        updatedAt: new Date()
      }
    });

    // Mark reset token as used
    await TokenUtils.markPasswordResetTokenAsUsed(token);

    console.log(`Password reset completed for user ID: ${verification.userId} at ${new Date().toISOString()}`);

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while resetting your password.',
      message: 'Internal server error'
    });
  } finally {
    await prisma.$disconnect();
  }
}