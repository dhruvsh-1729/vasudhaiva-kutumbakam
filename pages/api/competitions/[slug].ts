import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Slug is required' });
  }

  try {
    const numericSlug = Number(slug);
    const or: any[] = [{ slug }];
    if (!Number.isNaN(numericSlug)) {
      or.push({ legacyId: numericSlug });
    }

    const competition = await prisma.competition.findFirst({
      where: { AND: [{ isPublished: true }, { OR: or }] },
    });

    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    return res.status(200).json(competition);
  } catch (error) {
    console.error('Fetch competition error:', error);
    return res.status(500).json({ error: 'Failed to fetch competition' });
  }
}
