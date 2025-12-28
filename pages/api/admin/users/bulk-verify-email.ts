// pages/api/admin/users/bulk-verify-email.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/serverAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const admin = await requireAuth(req, res, { requireAdmin: true });
    if (!admin) return;

    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Update all users with isEmailVerified: false to isEmailVerified: true
    const result = await prisma.user.updateMany({
      where: {
        isEmailVerified: false,
      },
      data: {
        isEmailVerified: true,
      },
    });

    return res.status(200).json({
      message: `Successfully verified ${result.count} user(s)`,
      count: result.count,
    });
  } catch (error) {
    console.error('Bulk email verification error:', error);
    return res.status(500).json({ error: 'Failed to bulk verify emails' });
  }
}
