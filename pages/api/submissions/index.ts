// pages/api/submissions/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, SubmissionStatus } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

type TokenPayload = { userId: string; isAdmin?: boolean; iat?: number; exp?: number };

function getUserFromToken(req: NextApiRequest): TokenPayload | null {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;
    if (!decoded?.userId) return null;
    return decoded;
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const payload = getUserFromToken(req);
    if (!payload?.userId) return res.status(401).json({ error: 'Unauthorized. Please log in.' });

    if (req.method === 'GET') {
      if(req.query.competitionId) {
        return getUserCompetitionSubmissions(req, res, payload.userId);
      } else {
        return getUserSubmissions(req, res, payload.userId);
      }
    }
    if (req.method === 'POST') return createSubmission(req, res, payload.userId);

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Submissions API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}

async function getUserCompetitionSubmissions(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { competitionId } = req.query;

    if (!competitionId) {
      return res.status(400).json({ error: 'Competition ID is required' });
    }

    const submissions = await prisma.submission.findMany({
      where: {
        userId,
        competitionId: parseInt(competitionId as string),
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        competitionId: true,
        title: true,
        interval: true,
        fileUrl: true,
        description: true,
        overallScore: true,
        creativityScore: true,
        technicalScore: true,
        aiToolUsageScore: true,
        adherenceScore: true,
        impactScore: true,
        judgeComments: true,
        status: true,
        isAccessVerified: true,
        accessCheckError: true,
        isDisqualified: true,
        disqualificationReason: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json(submissions);
  } catch (error) {
    console.error('Get user submissions error:', error);
    return res.status(500).json({ error: 'Failed to fetch submissions' });
  }
}

async function getUserSubmissions(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { competitionId } = req.query;

    // Optional competition filter; if provided, validate it
    let compId: number | undefined;
    if (typeof competitionId === 'string' && competitionId.trim() !== '') {
      compId = Number(competitionId);
      if (!Number.isInteger(compId)) {
        return res.status(400).json({ error: 'Invalid competitionId' });
      }
    }

    const submissions = await prisma.submission.findMany({
      where: {
        userId,
        ...(compId !== undefined ? { competitionId: compId } : {}),
      },
      orderBy: [{ interval: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        competitionId: true,
        interval: true,
        title: true,
        fileUrl: true,
        description: true,

        overallScore: true,
        creativityScore: true,
        technicalScore: true,
        aiToolUsageScore: true,
        adherenceScore: true,
        impactScore: true,

        judgeComments: true,
        evaluatedBy: true,
        evaluatedAt: true,

        status: true,
        isDisqualified: true,
        disqualificationReason: true,

        isAccessVerified: true,
        accessCheckError: true,

        createdAt: true,
        updatedAt: true,
      },
    });

    // Group by interval to match your UI needs
    const grouped: Record<number, typeof submissions> = {};
    for (const s of submissions) {
      const key = s.interval ?? 0;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(s);
    }

    return res.status(200).json({ success: true, data: grouped });
  } catch (error) {
    console.error('Get user submissions error:', error);
    return res.status(500).json({ error: 'Failed to fetch submissions' });
  }
}

async function createSubmission(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { competitionId, fileUrl, description, title } = req.body as {
      competitionId?: number | string;
      fileUrl?: string;
      description?: string;
      title?: string;
    };

    // Validate title
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (title.length > 100) {
      return res.status(400).json({ error: 'Title cannot exceed 100 characters' });
    }

    // Validate required fields
    const compId = typeof competitionId === 'string' ? Number(competitionId) : competitionId;
    if (!compId || !Number.isInteger(compId)) {
      return res.status(400).json({ error: 'Valid Competition ID is required' });
    }
    if (!fileUrl || typeof fileUrl !== 'string') {
      return res.status(400).json({ error: 'File URL is required' });
    }

    // Validate Google Drive URL format
    if (!isValidGoogleDriveUrl(fileUrl)) {
      return res.status(400).json({ error: 'Invalid Google Drive URL format' });
    }

    // Get current admin settings
    const adminSettings = await prisma.adminSettings.findFirst();
    if (!adminSettings) {
      return res.status(500).json({ error: 'Admin settings not found' });
    }

    // Check if submissions are open
    if (!adminSettings.isSubmissionsOpen) {
      return res.status(403).json({ error: 'Submissions are currently closed' });
    }

    // Check submission limit for current interval
    const existingCount = await prisma.submission.count({
      where: {
        userId,
        competitionId: compId,
        interval: adminSettings.currentInterval,
      },
    });

    if (existingCount >= adminSettings.maxSubmissionsPerInterval) {
      return res.status(403).json({
        error: `Maximum ${adminSettings.maxSubmissionsPerInterval} submissions allowed per interval`,
      });
    }

    // Verify Google Drive access (HEAD with GET fallback)
    const accessCheck = await verifyGoogleDriveAccess(fileUrl);

    const created = await prisma.submission.create({
      data: {
        title: title.trim(),
        competitionId: compId,
        userId,
        interval: adminSettings.currentInterval,
        fileUrl,
        description: description?.trim() || null,

        isAccessVerified: accessCheck.success,
        accessCheckError: accessCheck.error || null,

        // If access fails, mark as REJECTED; otherwise PENDING
        status: accessCheck.success ? SubmissionStatus.PENDING : SubmissionStatus.REJECTED,
      },
      select: {
        id: true,
        competitionId: true,
        interval: true,
        fileUrl: true,
        description: true,
        overallScore: true,
        status: true,
        isAccessVerified: true,
        accessCheckError: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      data: created,
      message: accessCheck.success
        ? 'Submission created successfully!'
        : 'Submission created but access verification failed. Please check your Google Drive sharing settings.',
    });
  } catch (error) {
    console.error('Create submission error:', error);
    return res.status(500).json({ error: 'Failed to create submission' });
  }
}

// ---------- Helpers ----------

function isValidGoogleDriveUrl(url: string): boolean {
  const patterns = [
    /^https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+/i,
    /^https:\/\/drive\.google\.com\/drive\/folders\/[a-zA-Z0-9_-]+/i,
    /^https:\/\/docs\.google\.com\/(document|spreadsheets|presentation)\/d\/[a-zA-Z0-9_-]+/i,
  ];
  return patterns.some((p) => p.test(url));
}

function extractDirectCheckUrl(url: string): string {
  // Convert /file/d/<id> URLs to a lightweight check URL
  if (url.includes('/file/d/')) {
    const id = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1];
    if (id) return `https://drive.google.com/uc?id=${id}&export=download`;
  }
  // For docs/sheets/slides keep original; for folders keep original (we can only check visibility loosely)
  return url;
}

async function verifyGoogleDriveAccess(url: string): Promise<{ success: boolean; error?: string }> {
  try {
    const checkUrl = extractDirectCheckUrl(url);

    // Try HEAD first
    let ok = false;
    let status = 0;
    try {
      const headRes = await fetch(checkUrl, { method: 'HEAD', redirect: 'follow' });
      status = headRes.status;
      ok = headRes.ok;
    } catch {
      // fall through to GET tiny range
    }

    if (!ok) {
      // Some Drive endpoints don’t support HEAD reliably; try a tiny ranged GET
      const getRes = await fetch(checkUrl, {
        method: 'GET',
        headers: { Range: 'bytes=0-0' }, // avoid large downloads
        redirect: 'follow',
      });
      status = getRes.status;
      ok = getRes.ok || status === 206; // Partial content is fine
    }

    if (ok) return { success: true };

    if (status === 403) {
      return {
        success: false,
        error: 'File is not publicly accessible. Set sharing to “Anyone with the link can view”.',
      };
    }
    if (status === 404) {
      return { success: false, error: 'File not found. Please check the URL.' };
    }
    return { success: false, error: `Unable to access file (status ${status}).` };
  } catch (e) {
    console.error('Google Drive access verification error:', e);
    return {
      success: false,
      error: 'Failed to verify file access. Ensure the URL is correct and publicly accessible.',
    };
  }
}
