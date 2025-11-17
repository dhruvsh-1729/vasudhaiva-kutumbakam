import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/serverAuth';
import { ensureCleanContent } from '@/lib/moderation';
import { createNotification } from '@/lib/notifications';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { postId } = req.query;
  if (!postId || typeof postId !== 'string') {
    return res.status(400).json({ success: false, error: 'Invalid post id' });
  }

  try {
    if (req.method === 'GET') {
      const comments = await prisma.forumComment.findMany({
        where: { postId },
        orderBy: { createdAt: 'asc' },
        include: { author: { select: { id: true, name: true, isAdmin: true } } },
      });
      return res.status(200).json({ success: true, data: comments });
    }

    if (req.method === 'POST') {
      const auth = await requireAuth(req, res);
      if (!auth) return;

      const { content, parentId } = req.body || {};
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ success: false, error: 'Content is required' });
      }

      const moderation = ensureCleanContent(content);
      if (!moderation.ok) {
        return res.status(400).json({
          success: false,
          error: 'Your comment contains blocked words',
          blocked: moderation.blocked,
        });
      }

      const post = await prisma.forumPost.findUnique({ where: { id: postId }, select: { authorId: true } });
      if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

      const comment = await prisma.forumComment.create({
        data: {
          postId,
          authorId: auth.user.id,
          content: content.trim(),
          parentId: parentId || null,
        },
        include: { author: { select: { id: true, name: true, isAdmin: true } } },
      });

      // Notify admin on user comments and notify post author
      const notificationPromises = [];
      if (!auth.user.isAdmin) {
        notificationPromises.push(
          createNotification({
            title: 'New forum comment',
            body: `${auth.user.name || 'User'} commented on a forum post`,
            targetAll: false,
            targetAdminOnly: true,
            createdById: auth.user.id,
          })
        );
      }
      if (post.authorId !== auth.user.id) {
        notificationPromises.push(
          createNotification({
            title: 'New reply on your forum post',
            body: `${auth.user.name || 'Someone'} replied to your discussion`,
            targetAll: false,
            targetAdminOnly: false,
            targetUserIds: [post.authorId],
            createdById: auth.user.id,
          })
        );
      }
      await Promise.all(notificationPromises);

      return res.status(201).json({ success: true, data: comment });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Forum comments error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
