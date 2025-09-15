// pages/api/admin/cleanup-tokens.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { TokenUtils } from '../../../lib/tokenUtils';

interface CleanupResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CleanupResponse>
) {
  // Basic authentication check (implement proper auth as needed)
  const authHeader = req.headers.authorization;
  const adminToken = process.env.ADMIN_CLEANUP_TOKEN || 'admin-cleanup-secret-token';
  
  if (!authHeader || authHeader !== `Bearer ${adminToken}`) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or missing admin token'
    });
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { action } = req.query;

    switch (action) {
      case 'expired':
        const expiredResult = await TokenUtils.cleanupExpiredTokens();
        return res.status(200).json({
          success: true,
          message: 'Expired tokens cleaned up successfully',
          data: expiredResult
        });

      case 'used':
        const usedResult = await TokenUtils.cleanupUsedTokens();
        return res.status(200).json({
          success: true,
          message: 'Old used tokens cleaned up successfully',
          data: usedResult
        });

      case 'full':
        const fullResult = await TokenUtils.performFullCleanup();
        return res.status(200).json({
          success: true,
          message: 'Full token cleanup completed successfully',
          data: fullResult
        });

      case 'stats':
        const stats = await TokenUtils.getTokenStatistics();
        return res.status(200).json({
          success: true,
          message: 'Token statistics retrieved successfully',
          data: stats
        });

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Use: expired, used, full, or stats'
        });
    }

  } catch (error) {
    console.error('Token cleanup API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during cleanup',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}