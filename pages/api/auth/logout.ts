// pages/api/auth/logout.ts
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

interface ApiResponse {
  success: boolean;
  message: string;
  error?: string;
}

interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST request.',
      message: 'Invalid request method'
    });
  }

  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
        message: 'Authentication required'
      });
    }

    // Verify JWT token (optional - for logging purposes)
    try {
      const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
      const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
      
      // Log successful logout
      console.log(`User logged out: ${decoded.email} at ${new Date().toISOString()}`);
    } catch (jwtError) {
      // Token invalid but we'll still return success for security
      console.log(`Invalid token logout attempt at ${new Date().toISOString()}`);
    }

    // In a more advanced implementation, you might:
    // 1. Add the token to a blacklist/blocklist
    // 2. Store active sessions in a database and remove them
    // 3. Invalidate refresh tokens if using them
    // 4. Clear any server-side sessions

    // For now, we just return success
    // The actual logout happens on the client side by clearing localStorage
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred during logout.',
      message: 'Internal server error'
    });
  }
}

export type { ApiResponse };