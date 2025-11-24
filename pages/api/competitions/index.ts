import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const competitions = await prisma.competition.findMany({
      where: { isPublished: true },
      orderBy: { legacyId: 'asc' },
    });
    return res.status(200).json(competitions);
  } catch (error) {
    console.error('Fetch competitions error:', error);
    return res.status(500).json({ error: 'Failed to fetch competitions' });
  }
}
