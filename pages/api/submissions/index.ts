// pages/api/submissions.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Helper function to extract user from JWT token
function getUserFromToken(req: NextApiRequest): { userId: string } | null {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    return { userId: decoded.userId };
  } catch (error) {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }

    switch (req.method) {
      case 'GET':
        return await getUserSubmissions(req, res, user.userId);
      case 'POST':
        return await createSubmission(req, res, user.userId);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Submissions API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}

async function getUserSubmissions(req: NextApiRequest, res: NextApiResponse, userId: string) {
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

async function createSubmission(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { competitionId, fileUrl, description } = req.body;

    // Validate required fields
    if (!competitionId || !fileUrl) {
      return res.status(400).json({ error: 'Competition ID and file URL are required' });
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
    const existingSubmissions = await prisma.submission.count({
      where: {
        userId,
        competitionId: parseInt(competitionId),
        interval: adminSettings.currentInterval,
      },
    });

    if (existingSubmissions >= adminSettings.maxSubmissionsPerInterval) {
      return res.status(403).json({ 
        error: `Maximum ${adminSettings.maxSubmissionsPerInterval} submissions allowed per interval` 
      });
    }

    // Verify Google Drive access
    const accessCheck = await verifyGoogleDriveAccess(fileUrl);

    // Create the submission
    const submission = await prisma.submission.create({
      data: {
        competitionId: parseInt(competitionId),
        userId,
        interval: adminSettings.currentInterval,
        fileUrl,
        description: description || null,
        isAccessVerified: accessCheck.success,
        accessCheckError: accessCheck.error || null,
        status: accessCheck.success ? 'PENDING' : 'REJECTED',
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
      ...submission,
      message: accessCheck.success 
        ? 'Submission created successfully!' 
        : 'Submission created but access verification failed. Please check your Google Drive sharing settings.'
    });
  } catch (error) {
    console.error('Create submission error:', error);
    return res.status(500).json({ error: 'Failed to create submission' });
  }
}

// Helper function to validate Google Drive URLs
function isValidGoogleDriveUrl(url: string): boolean {
  const drivePatterns = [
    /^https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+/,
    /^https:\/\/drive\.google\.com\/drive\/folders\/[a-zA-Z0-9_-]+/,
    /^https:\/\/docs\.google\.com\/(document|spreadsheets|presentation)\/d\/[a-zA-Z0-9_-]+/
  ];
  
  return drivePatterns.some(pattern => pattern.test(url));
}

// Helper function to verify Google Drive access
async function verifyGoogleDriveAccess(url: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Convert sharing URL to direct access URL for verification
    let checkUrl = url;
    
    // Handle different Google Drive URL formats
    if (url.includes('/file/d/')) {
      const fileId = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1];
      if (fileId) {
        checkUrl = `https://drive.google.com/uc?id=${fileId}`;
      }
    } else if (url.includes('/folders/')) {
      // For folders, we'll check the folder view directly
      checkUrl = url;
    }

    // Make a HEAD request to check accessibility
    const response = await fetch(checkUrl, { method: 'HEAD' });
    
    if (response.status === 200) {
      return { success: true };
    } else if (response.status === 403) {
      return { 
        success: false, 
        error: 'File is not publicly accessible. Please set sharing to "Anyone with the link can view".' 
      };
    } else {
      return { 
        success: false, 
        error: `Unable to access file (Status: ${response.status}). Please check the URL and sharing settings.` 
      };
    }
  } catch (error) {
    console.error('Google Drive access verification error:', error);
    return { 
      success: false, 
      error: 'Failed to verify file access. Please ensure the URL is correct and publicly accessible.' 
    };
  }
}