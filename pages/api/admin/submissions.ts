// pages/api/admin/submissions.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Helper function to check admin status
function getAdminFromToken(req: NextApiRequest): { userId: string; isAdmin: boolean } | null {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // In production, you should check admin status from the database
    if (!decoded.isAdmin) {
      return null;
    }
    
    return { userId: decoded.userId, isAdmin: decoded.isAdmin };
  } catch (error) {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const admin = getAdminFromToken(req);
    if (!admin) {
      return res.status(401).json({ error: 'Unauthorized. Admin access required.' });
    }

    switch (req.method) {
      case 'GET':
        return await getSubmissions(req, res);
      case 'PUT':
        return await updateSubmissions(req, res);
      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Admin submissions API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}

async function getSubmissions(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      page = '1',
      limit = '10',
      competitionId,
      status,
      interval,
      isAccessVerified,
      isDisqualified,
      search,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};
    
    if (competitionId) {
      where.competitionId = parseInt(competitionId as string, 10);
    }
    
    if (status) {
      where.status = status as string;
    }
    
    if (interval) {
      where.interval = parseInt(interval as string, 10);
    }
    
    if (isAccessVerified !== undefined) {
      where.isAccessVerified = isAccessVerified === 'true';
    }
    
    if (isDisqualified !== undefined) {
      where.isDisqualified = isDisqualified === 'true';
    }
    
    if (search) {
      where.user = {
        OR: [
          { name: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
        ],
      };
    }

    // Get submissions with pagination
    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              institution: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.submission.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      submissions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Get admin submissions error:', error);
    return res.status(500).json({ error: 'Failed to fetch submissions' });
  }
}

async function updateSubmissions(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { submissionIds, updates } = req.body;

    if (!submissionIds || !Array.isArray(submissionIds) || submissionIds.length === 0) {
      return res.status(400).json({ error: 'Submission IDs are required' });
    }

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: 'Updates object is required' });
    }

    // Update multiple submissions
    const updatedSubmissions = await prisma.submission.updateMany({
      where: {
        id: { in: submissionIds },
      },
      data: updates,
    });

    return res.status(200).json({
      message: `Updated ${updatedSubmissions.count} submissions`,
      updatedCount: updatedSubmissions.count,
    });
  } catch (error) {
    console.error('Update submissions error:', error);
    return res.status(500).json({ error: 'Failed to update submissions' });
  }
}