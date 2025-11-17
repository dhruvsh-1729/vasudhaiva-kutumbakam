import { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/auth/serverAuth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const auth = await requireAuth(req, res, { requireAdmin: true });
    if (!auth) return;

    if (req.method === 'GET') {
      // Unread admin-targeted notifications count
      const unreadAdminNotifications = await prisma.notificationReceipt.count({
        where: {
          userId: auth.user.id,
          isRead: false,
          notification: {
            targetAdminOnly: true,
          },
        },
      });

      // Pending participant messages/comments for awareness
      const recentParticipantMessages = await prisma.submissionMessage.count({
        where: { isFromAdmin: false },
      });
      const recentForumComments = await prisma.forumComment.count({
        where: { author: { isAdmin: false } },
      });

      return res.status(200).json({
        success: true,
        data: {
          unreadAdminNotifications,
          recentParticipantMessages,
          recentForumComments,
          total:
            unreadAdminNotifications + recentParticipantMessages + recentForumComments,
        },
      });
    }

    if (req.method === 'POST') {
      const { title, body, targetAll = false, targetAdminOnly = false, targetInstitutions = [], targetUserIds = [] } =
        req.body || {};
      if (!title || !body) {
        return res.status(400).json({ success: false, error: 'Title and body are required' });
      }
      const notification = await prisma.notification.create({
        data: {
          title: String(title),
          body: String(body),
          targetAll: Boolean(targetAll),
          targetAdminOnly: Boolean(targetAdminOnly),
          targetInstitutions,
          targetUserIds,
          createdById: auth.user.id,
        },
      });
      return res.status(201).json({ success: true, data: notification });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Admin notifications error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
