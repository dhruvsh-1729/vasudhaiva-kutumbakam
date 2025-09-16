// pages/api/admin/submissions/[submissionId].ts
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

    const { submissionId } = req.query;
    
    if (!submissionId || typeof submissionId !== 'string') {
      return res.status(400).json({ error: 'Invalid submission ID' });
    }

    switch (req.method) {
      case 'GET':
        return await getSubmission(req, res, submissionId);
      case 'PUT':
        return await updateSubmission(req, res, submissionId, admin.userId);
      case 'DELETE':
        return await deleteSubmission(req, res, submissionId);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Admin submission API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}

async function getSubmission(req: NextApiRequest, res: NextApiResponse, submissionId: string) {
  try {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            institution: true,
            isActive: true,
            isEmailVerified: true,
          },
        },
      },
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    return res.status(200).json(submission);
  } catch (error) {
    console.error('Get submission error:', error);
    return res.status(500).json({ error: 'Failed to fetch submission' });
  }
}

async function updateSubmission(req: NextApiRequest, res: NextApiResponse, submissionId: string, adminUserId: string) {
  try {
    const {
      fileUrl,
      description,
      overallScore,
      creativityScore,
      technicalScore,
      aiToolUsageScore,
      adherenceScore,
      impactScore,
      judgeComments,
      evaluatedBy,
      status,
      isDisqualified,
      disqualificationReason,
      isAccessVerified,
      accessCheckError,
    } = req.body;

    // Check if submission exists
    const existingSubmission = await prisma.submission.findUnique({
      where: { id: submissionId },
    });

    if (!existingSubmission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Prepare update data
    const updateData: any = {};

    // Content updates
    if (fileUrl !== undefined) {
      updateData.fileUrl = fileUrl;
    }
    if (description !== undefined) {
      updateData.description = description;
    }

    // Scoring updates
    if (overallScore !== undefined) {
      if (typeof overallScore !== 'number' || overallScore < 0 || overallScore > 10) {
        return res.status(400).json({ error: 'Overall score must be a number between 0 and 10' });
      }
      updateData.overallScore = overallScore;
    }
    if (creativityScore !== undefined) {
      if (typeof creativityScore !== 'number' || creativityScore < 0 || creativityScore > 10) {
        return res.status(400).json({ error: 'Creativity score must be a number between 0 and 10' });
      }
      updateData.creativityScore = creativityScore;
    }
    if (technicalScore !== undefined) {
      if (typeof technicalScore !== 'number' || technicalScore < 0 || technicalScore > 10) {
        return res.status(400).json({ error: 'Technical score must be a number between 0 and 10' });
      }
      updateData.technicalScore = technicalScore;
    }
    if (aiToolUsageScore !== undefined) {
      if (typeof aiToolUsageScore !== 'number' || aiToolUsageScore < 0 || aiToolUsageScore > 10) {
        return res.status(400).json({ error: 'AI tool usage score must be a number between 0 and 10' });
      }
      updateData.aiToolUsageScore = aiToolUsageScore;
    }
    if (adherenceScore !== undefined) {
      if (typeof adherenceScore !== 'number' || adherenceScore < 0 || adherenceScore > 10) {
        return res.status(400).json({ error: 'Adherence score must be a number between 0 and 10' });
      }
      updateData.adherenceScore = adherenceScore;
    }
    if (impactScore !== undefined) {
      if (typeof impactScore !== 'number' || impactScore < 0 || impactScore > 10) {
        return res.status(400).json({ error: 'Impact score must be a number between 0 and 10' });
      }
      updateData.impactScore = impactScore;
    }

    // Evaluation metadata
    if (judgeComments !== undefined) {
      updateData.judgeComments = judgeComments;
    }
    if (evaluatedBy !== undefined) {
      updateData.evaluatedBy = evaluatedBy;
    }

    // Status updates
    if (status !== undefined) {
      const validStatuses = ['PENDING', 'UNDER_REVIEW', 'EVALUATED', 'REJECTED', 'WINNER', 'FINALIST'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }
      updateData.status = status;
    }

    // Disqualification
    if (isDisqualified !== undefined) {
      updateData.isDisqualified = isDisqualified;
    }
    if (disqualificationReason !== undefined) {
      updateData.disqualificationReason = disqualificationReason;
    }

    // Access verification
    if (isAccessVerified !== undefined) {
      updateData.isAccessVerified = isAccessVerified;
    }
    if (accessCheckError !== undefined) {
      updateData.accessCheckError = accessCheckError;
    }

    // Set evaluation timestamp when scores are updated
    if (overallScore !== undefined || status === 'EVALUATED') {
      updateData.evaluatedAt = new Date();
      updateData.evaluatedBy = evaluatedBy || `Admin ${adminUserId}`;
    }

    // Perform the update
    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            institution: true,
            isActive: true,
            isEmailVerified: true,
          },
        },
      },
    });

    return res.status(200).json({
      ...updatedSubmission,
      message: 'Submission updated successfully',
    });
  } catch (error) {
    console.error('Update submission error:', error);
    return res.status(500).json({ error: 'Failed to update submission' });
  }
}

async function deleteSubmission(req: NextApiRequest, res: NextApiResponse, submissionId: string) {
  try {
    // Check if submission exists
    const existingSubmission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!existingSubmission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // For audit purposes, you might want to soft delete instead of hard delete
    // This preserves the data for potential recovery or analysis
    const { forceDelete } = req.query;

    if (forceDelete === 'true') {
      // Hard delete - permanently removes the submission
      await prisma.submission.delete({
        where: { id: submissionId },
      });

      return res.status(200).json({
        message: 'Submission permanently deleted',
        submissionDetails: {
          id: existingSubmission.id,
          user: existingSubmission.user.name,
          email: existingSubmission.user.email,
          competitionId: existingSubmission.competitionId,
          interval: existingSubmission.interval,
        },
      });
    } else {
      // Soft delete - marks as disqualified
      const updatedSubmission = await prisma.submission.update({
        where: { id: submissionId },
        data: {
          isDisqualified: true,
          disqualificationReason: 'Removed by administrator',
          status: 'REJECTED',
        },
      });

      return res.status(200).json({
        message: 'Submission disqualified and removed from active submissions',
        submission: updatedSubmission,
      });
    }
  } catch (error) {
    console.error('Delete submission error:', error);
    return res.status(500).json({ error: 'Failed to delete submission' });
  }
}

// Helper function to verify Google Drive access (if URL is updated)
async function verifyGoogleDriveAccess(url: string): Promise<{ success: boolean; error?: string }> {
  try {
    let checkUrl = url;
    
    if (url.includes('/file/d/')) {
      const fileId = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1];
      if (fileId) {
        checkUrl = `https://drive.google.com/uc?id=${fileId}`;
      }
    }

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
    return { 
      success: false, 
      error: 'Failed to verify file access. Please ensure the URL is correct and publicly accessible.' 
    };
  }
}