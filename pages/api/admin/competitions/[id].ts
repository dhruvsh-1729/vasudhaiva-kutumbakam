import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/serverAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = await requireAuth(req, res, { requireAdmin: true });
  if (!admin) return;

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Competition id is required' });
  }

  if (req.method === 'PUT') {
    return updateCompetition(id, req, res);
  }

  if (req.method === 'DELETE') {
    return deleteCompetition(id, res);
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  return res.status(405).json({ error: 'Method not allowed' });
}

async function updateCompetition(id: string, req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      legacyId,
      title,
      description,
      slug,
      icon,
      color,
      deadline,
      prizePool,
      prizes,
      sections,
      isPublished,
    } = req.body;

    const updated = await prisma.competition.update({
      where: { id },
      data: {
        ...(legacyId !== undefined ? { legacyId: Number(legacyId) } : {}),
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(slug !== undefined ? { slug } : {}),
        ...(icon !== undefined ? { icon } : {}),
        ...(color !== undefined ? { color } : {}),
        ...(deadline !== undefined ? { deadline: deadline ? new Date(deadline) : null } : {}),
        ...(prizePool !== undefined ? { prizePool } : {}),
        ...(prizes !== undefined ? { prizes } : {}),
        ...(sections !== undefined ? { sections } : {}),
        ...(isPublished !== undefined ? { isPublished } : {}),
      },
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Update competition error:', error);
    return res.status(500).json({ error: 'Failed to update competition' });
  }
}

async function deleteCompetition(id: string, res: NextApiResponse) {
  try {
    await prisma.competition.delete({ where: { id } });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Delete competition error:', error);
    return res.status(500).json({ error: 'Failed to delete competition' });
  }
}
