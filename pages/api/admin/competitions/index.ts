import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/serverAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = await requireAuth(req, res, { requireAdmin: true });
  if (!admin) return;

  if (req.method === 'GET') {
    return listCompetitions(res);
  }

  if (req.method === 'POST') {
    return createCompetition(req, res);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'Method not allowed' });
}

async function listCompetitions(res: NextApiResponse) {
  try {
    const competitions = await prisma.competition.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ success: true, data: competitions });
  } catch (error) {
    console.error('List competitions error:', error);
    return res.status(500).json({ error: 'Failed to fetch competitions' });
  }
}

async function createCompetition(req: NextApiRequest, res: NextApiResponse) {
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
      isPublished = true,
    } = req.body;

    if (!legacyId || !title || !description || !slug) {
      return res.status(400).json({ error: 'legacyId, title, description and slug are required' });
    }

    const created = await prisma.competition.create({
      data: {
        legacyId: Number(legacyId),
        title,
        description,
        slug,
        icon: icon || null,
        color: color || null,
        deadline: deadline ? new Date(deadline) : null,
        prizePool: prizePool || null,
        prizes: prizes ?? null,
        sections: sections ?? null,
        isPublished,
      },
    });

    return res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    console.error('Create competition error:', error);
    return res.status(500).json({ error: 'Failed to create competition' });
  }
}
