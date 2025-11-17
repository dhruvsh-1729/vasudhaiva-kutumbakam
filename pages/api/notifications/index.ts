import { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/auth/serverAuth';
import { fetchNotificationsForUser } from '@/lib/notifications';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const auth = await requireAuth(req, res);
    if (!auth) return;

    if (req.method === 'GET') {
      const userRecord = await prisma.user.findUnique({
        where: { id: auth.user.id },
        select: { institution: true, isAdmin: true },
      });
      const notifications = await fetchNotificationsForUser(
        auth.user.id,
        userRecord?.institution,
        userRecord?.isAdmin
      );
      return res.status(200).json({ success: true, data: notifications });
    }

    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
