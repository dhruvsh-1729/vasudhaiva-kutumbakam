// pages/api/user/me.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/serverAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const auth = await requireAuth(req, res);
    if (!auth) return;

    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        institution: true,
        avatarUrl: true,
        isActive: true,
        isEmailVerified: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json({ success: true, data: user });
  } catch (e) {
    console.error('Error /api/user/me:', e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
