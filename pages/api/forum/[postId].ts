import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/serverAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { postId } = req.query;
  if (!postId || typeof postId !== 'string') {
    return res.status(400).json({ success: false, error: 'Invalid post id' });
  }

  try {
    if (req.method === 'GET') {
      const post = await prisma.forumPost.findUnique({
        where: { id: postId },
        include: {
          author: { select: { id: true, name: true, isAdmin: true } },
          _count: { select: { comments: true } },
        },
      });
      if (!post) return res.status(404).json({ success: false, error: 'Post not found' });
      return res.status(200).json({ success: true, data: post });
    }

    if (req.method === 'PATCH') {
      const auth = await requireAuth(req, res);
      if (!auth) return;
      if (!auth.user.isAdmin) {
        return res.status(403).json({ success: false, error: 'Admin privileges required' });
      }
      const { isResolved } = req.body || {};
      const post = await prisma.forumPost.update({
        where: { id: postId },
        data: {
          isResolved: Boolean(isResolved),
          status: Boolean(isResolved) ? 'RESOLVED' : 'OPEN',
        },
      });
      return res.status(200).json({ success: true, data: post });
    }

    res.setHeader('Allow', ['GET', 'PATCH']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Forum post error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
