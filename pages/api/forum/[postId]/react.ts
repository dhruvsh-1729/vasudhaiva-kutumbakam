import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/serverAuth';

const reactionTypes = ['LIKE', 'SUPPORT', 'LOVE', 'CELEBRATE', 'FUNNY', 'ANGRY', 'DOWNVOTE'] as const;
type ReactionType = (typeof reactionTypes)[number];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { postId } = req.query;
  if (!postId || typeof postId !== 'string') {
    return res.status(400).json({ success: false, error: 'Invalid post id' });
  }

  try {
    const auth = await requireAuth(req, res);
    if (!auth) return;

    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { type } = req.body || {};
    if (!reactionTypes.includes(type)) {
      return res.status(400).json({ success: false, error: 'Invalid reaction type' });
    }

    await prisma.forumPostReaction.upsert({
      where: { postId_userId: { postId, userId: auth.user.id } },
      create: { postId, userId: auth.user.id, type },
      update: { type },
    });

    const reactions = await prisma.forumPostReaction.groupBy({
      by: ['type'],
      where: { postId },
      _count: { type: true },
    });

    return res.status(200).json({
      success: true,
      data: reactionTypes.reduce(
        (acc, t) => ({ ...acc, [t]: reactions.find((r) => r.type === t)?._count.type || 0 }),
        {} as Record<ReactionType, number>
      ),
    });
  } catch (error) {
    console.error('Post reaction error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
