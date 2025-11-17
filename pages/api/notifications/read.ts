import { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/auth/serverAuth';
import { markNotificationRead } from '@/lib/notifications';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const auth = await requireAuth(req, res);
    if (!auth) return;

    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { notificationId } = req.body || {};
    if (!notificationId || typeof notificationId !== 'string') {
      return res.status(400).json({ success: false, error: 'notificationId is required' });
    }

    await markNotificationRead(auth.user.id, notificationId);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
