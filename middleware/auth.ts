// middleware/auth.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedUser, requireAuth } from '@/lib/auth/serverAuth';

export interface AuthenticatedRequest extends NextApiRequest {
  authUser?: AuthenticatedUser;
  tokenPayload?: {
    userId: string;
    email?: string;
    name?: string;
    isAdmin?: boolean;
    iat?: number;
    exp?: number;
  };
}

// Wrapper to enforce authentication on API routes while keeping handlers concise.
export const withAuth =
  (
    handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void,
    options: { requireAdmin?: boolean } = {}
  ) =>
  async (req: AuthenticatedRequest, res: NextApiResponse): Promise<void> => {
    const authResult = await requireAuth(req, res, options);
    if (!authResult) return;

    req.authUser = authResult.user;
    req.tokenPayload = authResult.token;

    return handler(req, res);
  };
