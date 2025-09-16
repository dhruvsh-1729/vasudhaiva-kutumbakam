// middleware/auth.ts
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token is required',
        message: 'Authentication failed'
      });
      return;
    }

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    // Get user from database to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        isAdmin: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found',
        message: 'Authentication failed'
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        error: 'Account is deactivated',
        message: 'Account access denied'
      });
      return;
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'Authentication failed'
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expired',
        message: 'Please log in again'
      });
    } else {
      console.error('Authentication middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Authentication service error',
        message: 'Internal server error'
      });
    }
  } finally {
    await prisma.$disconnect();
  }
};

/**
 * Helper function to create authentication wrapper
 */
export const withAuth = (
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void
) => {
  return async (req: AuthenticatedRequest, res: NextApiResponse): Promise<void> => {
    // Apply authentication middleware
    await new Promise<void>((resolve, reject) => {
      authenticateToken(req, res, resolve);
    });

    // If we get here, authentication was successful
    return handler(req, res);
  };
};

/**
 * Client-side authentication utility
 */
export const clientAuth = {
  // Get token from localStorage
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vk_token');
    }
    return null;
  },

  // Get user from localStorage
  getUser: (): any | null => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('vk_user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!clientAuth.getToken() && !!clientAuth.getUser();
  },

  // Logout user
  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vk_token');
      localStorage.removeItem('vk_user');
      window.location.href = '/login';
    }
  },

  // Make authenticated API call
  fetch: async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = clientAuth.getToken();
    
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
  },
};