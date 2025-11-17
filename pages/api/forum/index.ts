import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/serverAuth';
import { ensureCleanContent } from '@/lib/moderation';
import { createNotification } from '@/lib/notifications';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const posts = await prisma.forumPost.findMany({
        orderBy: { updatedAt: 'desc' },
        include: {
          author: { select: { id: true, name: true, institution: true, isAdmin: true } },
          _count: { select: { comments: true } },
        },
        take: 50,
      });
      return res.status(200).json({ success: true, data: posts });
    }

    if (req.method === 'POST') {
      const auth = await requireAuth(req, res);
      if (!auth) return;

      const { title, content } = req.body || {};
      if (!title || !content) {
        return res.status(400).json({ success: false, error: 'Title and content are required' });
      }

      const moderation = ensureCleanContent(`${title} ${content}`);
      if (!moderation.ok) {
        return res
          .status(400)
          .json({ success: false, error: 'Your post contains blocked words', blocked: moderation.blocked });
      }

      const post = await prisma.forumPost.create({
        data: {
          authorId: auth.user.id,
          title: String(title).trim(),
          content: String(content).trim(),
        },
      });

      // Notify admins about a new post from non-admins
      if (!auth.user.isAdmin) {
        await createNotification({
          title: 'New forum post',
          body: `${auth.user.name || 'User'} created a new discussion: ${post.title}`,
          targetAll: false,
          targetAdminOnly: true,
          createdById: auth.user.id,
        });
      }

      return res.status(201).json({ success: true, data: post });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Forum index error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
