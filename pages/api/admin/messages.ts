import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/serverAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const auth = await requireAuth(req, res, { requireAdmin: true });
    if (!auth) return;

    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const messages = await prisma.submission.findMany({
      where: {
        messages: {
          some: { isFromAdmin: false },
        },
      },
      select: {
        id: true,
        title: true,
        competitionId: true,
        interval: true,
        fileUrl: true,
        description: true,
        user: { select: { id: true, name: true, email: true, institution: true } },
        messages: {
          where: { isFromAdmin: false },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });

    return res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error('Admin messages fetch error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
