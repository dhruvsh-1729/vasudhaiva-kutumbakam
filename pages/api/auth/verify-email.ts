// pages/api/auth/verify-email.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { TokenUtils } from '../../../lib/tokenUtils';
import { EmailService } from '../../../lib/emailService';

const prisma = new PrismaClient();

interface VerifyEmailResponse {
  success: boolean;
  message: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyEmailResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST request.',
      message: 'Invalid request method'
    });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is required',
        message: 'Missing token'
      });
    }

    // Verify the token
    const verification = await TokenUtils.verifyEmailToken(token);
    
    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        error: verification.error || 'Invalid verification token',
        message: 'Verification failed'
      });
    }

    // Update user's email verification status
    const user = await prisma.user.update({
      where: { id: verification.userId },
      data: { 
        isEmailVerified: true,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
      }
    });

    // Send welcome email
    // const emailService = EmailService.getInstance();
    // await emailService.sendWelcomeEmail(user.email, user.name);

    console.log(`Email verified for user: ${user.email} at ${new Date().toISOString()}`);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully! Welcome to VK Competition.'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred during verification.',
      message: 'Internal server error'
    });
  } finally {
    await prisma.$disconnect();
  }
}