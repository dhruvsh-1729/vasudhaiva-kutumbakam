import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/serverAuth';
import { ensureCleanContent } from '@/lib/moderation';
import { createNotification } from '@/lib/notifications';

const PAGE_SIZE = 50;
const reactionTypes = ['LIKE', 'SUPPORT', 'LOVE', 'CELEBRATE', 'FUNNY', 'ANGRY', 'DOWNVOTE'] as const;
type ReactionType = (typeof reactionTypes)[number];

const summarizeReactions = <T extends { type: ReactionType }>(reactions: T[]) => {
  const summary: Record<ReactionType, number> = {
    LIKE: 0,
    SUPPORT: 0,
    LOVE: 0,
    CELEBRATE: 0,
    FUNNY: 0,
    ANGRY: 0,
    DOWNVOTE: 0,
  };
  reactions.forEach((r) => summary[r.type]++);
  return summary;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const page = Math.max(parseInt(String(req.query.page || '1'), 10) || 1, 1);
      const skip = (page - 1) * PAGE_SIZE;
      const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
      const where = search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { content: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined;
      const [posts, total] = await Promise.all([
        prisma.forumPost.findMany({
          where,
          orderBy: { updatedAt: 'desc' },
          skip,
          take: PAGE_SIZE,
          include: {
            author: { select: { id: true, name: true, institution: true, isAdmin: true } },
            _count: { select: { comments: true } },
            reactions: { select: { type: true } },
          },
        }),
        prisma.forumPost.count({ where }),
      ]);
      const data = posts.map((p) => ({
        ...p,
        reactionSummary: summarizeReactions(p.reactions as { type: ReactionType }[]),
      }));
      return res.status(200).json({
        success: true,
        data,
        meta: {
          page,
          pageSize: PAGE_SIZE,
          total,
          totalPages: Math.ceil(total / PAGE_SIZE),
        },
      });
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
