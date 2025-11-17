import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/serverAuth';
import { ensureCleanContent } from '@/lib/moderation';
import { createNotification } from '@/lib/notifications';
import { EmailService } from '@/lib/emailService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { submissionId } = req.query;
  if (!submissionId || typeof submissionId !== 'string') {
    return res.status(400).json({ success: false, error: 'Invalid submission id' });
  }

  try {
    const auth = await requireAuth(req, res);
    if (!auth) return;

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      select: { id: true, userId: true, user: { select: { email: true, name: true } }, title: true },
    });
    if (!submission) return res.status(404).json({ success: false, error: 'Submission not found' });

    const isOwner = submission.userId === auth.user.id;
    const isAdmin = !!auth.user.isAdmin;
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    if (req.method === 'GET') {
      const messages = await prisma.submissionMessage.findMany({
        where: { submissionId },
        orderBy: { createdAt: 'asc' },
        include: { author: { select: { id: true, name: true, isAdmin: true } } },
      });
      return res.status(200).json({ success: true, data: messages });
    }

    if (req.method === 'POST') {
      const { content } = req.body || {};
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ success: false, error: 'Content is required' });
      }

      const cleanCheck = ensureCleanContent(content);
      if (!cleanCheck.ok) {
        return res.status(400).json({
          success: false,
          error: 'Your message contains blocked words',
          blocked: cleanCheck.blocked,
        });
      }

      const message = await prisma.submissionMessage.create({
        data: {
          submissionId,
          authorId: auth.user.id,
          content: content.trim(),
          isFromAdmin: isAdmin,
        },
        include: { author: { select: { id: true, name: true, isAdmin: true } } },
      });

      const notificationTasks = [];
      if (isAdmin) {
        // Notify submission owner + email
        notificationTasks.push(
          createNotification({
            title: 'Update on your submission',
            body: `${auth.user.name || 'A judge'} commented on your submission "${submission.title}"`,
            targetAll: false,
            targetAdminOnly: false,
            targetUserIds: [submission.userId],
            createdById: auth.user.id,
          })
        );
        if (submission.user?.email) {
          notificationTasks.push(
            EmailService.getInstance().sendSubmissionUpdateEmail(
              submission.user.email,
              submission.user.name || 'Participant',
              'New comment on your submission',
              `A judge commented: ${content}`
            )
          );
        }
      } else {
        // Notify admins to review
        notificationTasks.push(
          createNotification({
            title: 'Participant replied on submission',
            body: `${auth.user.name || 'Participant'} replied on submission "${submission.title}"`,
            targetAll: false,
            targetAdminOnly: true,
            createdById: auth.user.id,
          })
        );
      }

      await Promise.all(notificationTasks);

      return res.status(201).json({ success: true, data: message });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Submission messages error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
