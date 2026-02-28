// pages/api/admin/submissions.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/serverAuth';
import { getCurrentSubmissionInterval } from '@/lib/deadlineManager';
import { competitions as staticCompetitions } from '@/data/competitions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const admin = await requireAuth(req, res, { requireAdmin: true });
    if (!admin) return;

    switch (req.method) {
      case 'GET':
        return await getSubmissions(req, res);
      case 'PUT':
        return await updateSubmissions(req, res);
      case 'POST':
        return await createSubmissionForUser(req, res);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'POST']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Admin submissions API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
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

async function createSubmissionForUser(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId, userEmail, competitionId, title, fileUrl, description, interval } = req.body as {
      userId?: string;
      userEmail?: string;
      competitionId?: number | string;
      title?: string;
      fileUrl?: string;
      description?: string;
      interval?: number;
    };

    if (!userId && !userEmail) {
      return res.status(400).json({ error: 'User ID or email is required' });
    }

    const compId = typeof competitionId === 'string' ? Number(competitionId) : competitionId;
    if (!compId || !Number.isInteger(compId)) {
      return res.status(400).json({ error: 'Valid competition legacyId is required' });
    }

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (title.length > 100) {
      return res.status(400).json({ error: 'Title cannot exceed 100 characters' });
    }

    if (!fileUrl || typeof fileUrl !== 'string' || !fileUrl.trim()) {
      return res.status(400).json({ error: 'File URL is required' });
    }

    const normalizedEmail = userEmail ? String(userEmail).toLowerCase().trim() : undefined;
    const user = userId
      ? await prisma.user.findUnique({ where: { id: userId } })
      : await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isVideoCompetition = compId === 1;
    if (isVideoCompetition) {
      if (!isValidGoogleDriveUrl(fileUrl)) {
        return res.status(400).json({ error: 'Video entries must use a Google Drive sharing link.' });
      }
    } else if (!isValidUploadThingUrl(fileUrl)) {
      return res.status(400).json({ error: 'Please upload the file through the submission uploader.' });
    }

    const currentInterval = interval && Number.isInteger(interval) && interval > 0
      ? interval
      : getCurrentSubmissionInterval();

    const competitionDoc = await prisma.competition.findFirst({
      where: { legacyId: compId },
      select: { id: true, deadline: true },
    });
    const fallbackCompetition = staticCompetitions.find((c) => c.id === compId);
    const competitionDeadline = fallbackCompetition?.deadline ?? competitionDoc?.deadline;

    if (isDeadlinePassed(competitionDeadline)) {
      return res.status(403).json({ error: 'Submissions are closed for this competition' });
    }

    const created = await prisma.submission.create({
      data: {
        title: title.trim(),
        competitionId: compId,
        competitionDbId: competitionDoc?.id,
        userId: user.id,
        interval: currentInterval,
        fileUrl: fileUrl.trim(),
        description: description?.trim() || null,
        isAccessVerified: true,
        accessCheckError: null,
        status: SubmissionStatus.PENDING,
      },
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
    });

    return res.status(201).json({
      success: true,
      data: created,
      message: 'Submission created for user',
    });
  } catch (error) {
    console.error('Create submission for user error:', error);
    return res.status(500).json({ error: 'Failed to create submission' });
  }
}

enum SubmissionStatus {
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
}

function isDeadlinePassed(deadline?: Date | string | null): boolean {
  return false;
}

function isValidGoogleDriveUrl(url: string): boolean {
  const patterns = [
    /^https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+/i,
    /^https:\/\/drive\.google\.com\/drive\/folders\/[a-zA-Z0-9_-]+/i,
    /^https:\/\/docs\.google\.com\/(document|spreadsheets|presentation)\/d\/[a-zA-Z0-9_-]+/i,
  ];
  return patterns.some((p) => p.test(url));
}

function isValidUploadThingUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['utfs.io', 'uploadthing.com'].some((host) => parsed.host.includes(host));
  } catch {
    return false;
  }
}
