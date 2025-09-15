// pages/api/auth/verify-reset-token.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { TokenUtils } from '../../../lib/tokenUtils';

interface VerifyTokenResponse {
  success: boolean;
  valid: boolean;
  message: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyTokenResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      valid: false,
      error: 'Method not allowed. Use GET request.',
      message: 'Invalid request method'
    });
  }

  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        valid: false,
        error: 'Reset token is required',
        message: 'Missing token'
      });
    }

    // Verify the reset token
    const verification = await TokenUtils.verifyPasswordResetToken(token);

    return res.status(200).json({
      success: true,
      valid: verification.valid,
      message: verification.valid 
        ? 'Reset token is valid' 
        : verification.error || 'Invalid reset token'
    });

  } catch (error) {
    console.error('Verify reset token error:', error);
    return res.status(500).json({
      success: false,
      valid: false,
      error: 'An unexpected error occurred while verifying the token.',
      message: 'Internal server error'
    });
  }
}