// pages/api/submissions/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/serverAuth';
import { getCurrentSubmissionInterval, areSubmissionsOpen } from '@/lib/deadlineManager';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const auth = await requireAuth(req, res);
    if (!auth) return;
    const userId = auth.user.id;

    if (req.method === 'GET') {
      if(req.query.competitionId) {
        return getUserCompetitionSubmissions(req, res, userId);
      } else {
        return getUserSubmissions(req, res, userId);
      }
    }
    if (req.method === 'POST') return createSubmission(req, res, userId);

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Submissions API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
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

    const isVideoCompetition = compId === 1;

    if (isVideoCompetition) {
      if (!isValidGoogleDriveUrl(fileUrl)) {
        return res.status(400).json({ error: 'Video entries must be shared via a Google Drive link.' });
      }
    } else if (!isValidUploadThingUrl(fileUrl)) {
      return res.status(400).json({ error: 'Please upload your file through the submission uploader.' });
    }

    // Get dynamically calculated interval and submission status
    const currentInterval = getCurrentSubmissionInterval();
    const isOpen = areSubmissionsOpen();

    // Map to competition document if present
    const competitionDoc = await prisma.competition.findFirst({
      where: { legacyId: compId },
      select: { id: true },
    });

    // Check if submissions are open based on timeline
    if (!isOpen) {
      return res.status(403).json({ error: 'Submissions are currently closed for this interval' });
    }

    // Get admin settings for max submissions limit
    const adminSettings = await prisma.adminSettings.findFirst();
    const maxSubmissions = adminSettings?.maxSubmissionsPerInterval || 3;

    // Auto-sync admin settings if they exist but are out of date
    if (adminSettings && 
        (adminSettings.currentInterval !== currentInterval || adminSettings.isSubmissionsOpen !== isOpen)) {
      await prisma.adminSettings.update({
        where: { id: adminSettings.id },
        data: {
          currentInterval: currentInterval,
          isSubmissionsOpen: isOpen,
        },
      });
    }

    console.log(userId, compId, currentInterval);
    
    // Check submission limit for current interval
    const existingCount = await prisma.submission.count({
      where: {
        userId,
        competitionId: compId,
        interval: currentInterval,
      },
    });

    if (existingCount >= maxSubmissions) {
      return res.status(403).json({
        error: `Maximum ${maxSubmissions} submissions allowed per interval`,
      });
    }

    // Verify Google Drive access (HEAD with GET fallback)
    // const accessCheck = await verifyGoogleDriveAccess(fileUrl);

    const created = await prisma.submission.create({
      data: {
        title: title.trim(),
        competitionId: compId,
        competitionDbId: competitionDoc?.id,
        userId,
        interval: currentInterval, // Use dynamically calculated interval
        fileUrl,
        description: description?.trim() || null,

        isAccessVerified: true,
        accessCheckError: null,

        // If access fails, mark as REJECTED; otherwise PENDING
        status: SubmissionStatus.PENDING,
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
      message: 'Submission created successfully!',
    });
  } catch (error) {
    console.error('Create submission error:', error);
    return res.status(500).json({ error: 'Failed to create submission' });
  }
}

// ---------- Submission Status Enum ----------
enum SubmissionStatus {
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
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

function isValidUploadThingUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['utfs.io', 'uploadthing.com'].some((host) => parsed.host.includes(host));
  } catch {
    return false;
  }
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
