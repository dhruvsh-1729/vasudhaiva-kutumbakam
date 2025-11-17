import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../prisma';

type TokenPayload = {
  userId: string;
  email?: string;
  name?: string;
  isAdmin?: boolean;
  iat?: number;
  exp?: number;
};

export type AuthenticatedUser = {
  id: string;
  email?: string;
  name?: string;
  isAdmin?: boolean;
};

type AuthGuardOptions = {
  requireAdmin?: boolean;
};

type AuthFailureCode =
  | 'TOKEN_MISSING'
  | 'TOKEN_INVALID'
  | 'TOKEN_EXPIRED'
  | 'USER_DISABLED'
  | 'USER_NOT_FOUND'
  | 'ADMIN_ONLY';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

const buildAuthError = (
  res: NextApiResponse,
  code: AuthFailureCode,
  message: string,
  forceLogout = true
): null => {
  const status = code === 'ADMIN_ONLY' ? 403 : 401;
  res
    .status(status)
    .json({ success: false, error: message, code, forceLogout: forceLogout && status === 401 });
  return null;
};

export const getBearerToken = (req: NextApiRequest): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.substring(7);
};

export const getTokenPayload = (req: NextApiRequest): TokenPayload | null => {
  const token = getBearerToken(req);
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    if (!decoded?.userId) return null;
    return decoded;
  } catch {
    return null;
  }
};

export const requireAuth = async (
  req: NextApiRequest,
  res: NextApiResponse,
  options: AuthGuardOptions = {}
): Promise<{ user: AuthenticatedUser; token: TokenPayload } | null> => {
  const token = getBearerToken(req);
  if (!token) {
    return buildAuthError(res, 'TOKEN_MISSING', 'Authentication is required to perform this action.');
  }

  let decoded: TokenPayload;
  try {
    decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return buildAuthError(res, 'TOKEN_EXPIRED', 'Your session has expired. Please log in again.');
    }
    if (error instanceof JsonWebTokenError) {
      return buildAuthError(res, 'TOKEN_INVALID', 'Invalid session token. Please log in again.');
    }
    console.error('Unexpected JWT verification error', error);
    return buildAuthError(res, 'TOKEN_INVALID', 'Invalid session token. Please log in again.');
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      email: true,
      name: true,
      isActive: true,
      isAdmin: true,
    },
  });

  if (!dbUser) {
    return buildAuthError(res, 'USER_NOT_FOUND', 'Account no longer exists. Please log in again.');
  }

  if (!dbUser.isActive) {
    return buildAuthError(res, 'USER_DISABLED', 'Your account has been disabled. Please contact support.');
  }

  if (options.requireAdmin && !dbUser.isAdmin) {
    return buildAuthError(res, 'ADMIN_ONLY', 'Admin privileges are required to access this resource.', false);
  }

  return {
    user: {
      id: dbUser.id,
      email: dbUser.email ?? undefined,
      name: dbUser.name ?? undefined,
      isAdmin: dbUser.isAdmin ?? false,
    },
    token: decoded,
  };
};
