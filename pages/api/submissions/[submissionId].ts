// pages/api/submissions/[submissionId].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/serverAuth';
import { createNotification } from '@/lib/notifications';
import { EmailService } from '@/lib/emailService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const auth = await requireAuth(req, res);
    if (!auth) return;

    const { submissionId } = req.query;
    if (!submissionId || typeof submissionId !== 'string') {
      return res.status(400).json({ error: 'Invalid submission ID' });
    }

    switch (req.method) {
      case 'GET':
        return await getSubmission(req, res, auth.user.id, submissionId, !!auth.user.isAdmin);
      case 'PUT':
        return await updateSubmission(req, res, auth.user.id, submissionId, !!auth.user.isAdmin);
      case 'DELETE':
        return await deleteSubmission(req, res, auth.user.id, submissionId, !!auth.user.isAdmin);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Submission management API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getSubmission(req: NextApiRequest, res: NextApiResponse, userId: string, submissionId: string, isAdmin = false) {
  try {
    const whereClause = isAdmin ? { id: submissionId } : { id: submissionId, userId };
    
    const submission = await prisma.submission.findUnique({
      where: whereClause,
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

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    return res.status(200).json(submission);
  } catch (error) {
    console.error('Get submission error:', error);
    return res.status(500).json({ error: 'Failed to fetch submission' });
  }
}

async function updateSubmission(req: NextApiRequest, res: NextApiResponse, userId: string, submissionId: string, isAdmin = false) {
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
    } = req.body;

    // Check if submission exists and user has permission
    const whereClause = isAdmin ? { id: submissionId } : { id: submissionId, userId };
    const existingSubmission = await prisma.submission.findUnique({
      where: whereClause,
      include: { user: { select: { id: true, email: true, name: true } } },
    });

    if (!existingSubmission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Prepare update data based on user permissions
    const updateData: any = {};

    const isVideoSubmission = existingSubmission.competitionId === 1;

    if (isAdmin) {
      // Admins can update scoring and evaluation fields
      if (overallScore !== undefined) updateData.overallScore = overallScore;
      if (creativityScore !== undefined) updateData.creativityScore = creativityScore;
      if (technicalScore !== undefined) updateData.technicalScore = technicalScore;
      if (aiToolUsageScore !== undefined) updateData.aiToolUsageScore = aiToolUsageScore;
      if (adherenceScore !== undefined) updateData.adherenceScore = adherenceScore;
      if (impactScore !== undefined) updateData.impactScore = impactScore;
      if (judgeComments !== undefined) updateData.judgeComments = judgeComments;
      if (evaluatedBy !== undefined) updateData.evaluatedBy = evaluatedBy;
      if (status !== undefined) updateData.status = status;
      if (isDisqualified !== undefined) updateData.isDisqualified = isDisqualified;
      if (disqualificationReason !== undefined) updateData.disqualificationReason = disqualificationReason;

      // Set evaluation timestamp when scores are updated
      if (overallScore !== undefined || status === 'EVALUATED') {
        updateData.evaluatedAt = new Date();
      }
    } else {
      // Regular users can only update their own submission content and only if not evaluated
      if (existingSubmission.status === 'EVALUATED' || existingSubmission.status === 'WINNER' || existingSubmission.status === 'FINALIST') {
        return res.status(403).json({ error: 'Cannot update evaluated submissions' });
      }

      if (fileUrl !== undefined) {
        if (isVideoSubmission) {
          if (!isValidGoogleDriveUrl(fileUrl)) {
            return res.status(400).json({ error: 'Invalid Google Drive URL format' });
          }
          updateData.fileUrl = fileUrl;

          if (fileUrl !== existingSubmission.fileUrl) {
            const accessCheck = await verifyGoogleDriveAccess(fileUrl);
            updateData.isAccessVerified = accessCheck.success;
            updateData.accessCheckError = accessCheck.error || null;
          }
        } else {
          if (!isValidUploadThingUrl(fileUrl)) {
            return res.status(400).json({ error: 'Please upload your file using the uploader.' });
          }
          updateData.fileUrl = fileUrl;
          updateData.isAccessVerified = true;
          updateData.accessCheckError = null;
        }
      }

      if (description !== undefined) updateData.description = description;
    }

    // Update the submission
    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: updateData,
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

    // Notify participant when admin evaluates or comments
    if (isAdmin && updatedSubmission.user?.email) {
      const changedScores =
        updateData.overallScore !== undefined ||
        updateData.creativityScore !== undefined ||
        updateData.technicalScore !== undefined ||
        updateData.aiToolUsageScore !== undefined ||
        updateData.adherenceScore !== undefined ||
        updateData.impactScore !== undefined;

      const messages: string[] = [];
      if (updateData.judgeComments) {
        messages.push(`Judge comments: ${updateData.judgeComments}`);
      }
      if (changedScores) {
        messages.push('Your submission has been evaluated and scores were updated.');
      }

      if (messages.length > 0) {
        const msg = messages.join(' ');
        await Promise.all([
          createNotification({
            title: 'Submission update',
            body: msg,
            targetAll: false,
            targetUserIds: [updatedSubmission.user.id],
            createdById: userId,
          }),
          EmailService.getInstance().sendSubmissionUpdateEmail(
            updatedSubmission.user.email,
            updatedSubmission.user.name || 'Participant',
            'Your submission was updated',
            msg
          ),
        ]);
      }
    }

    return res.status(200).json({
      ...updatedSubmission,
      message: 'Submission updated successfully',
    });
  } catch (error) {
    console.error('Update submission error:', error);
    return res.status(500).json({ error: 'Failed to update submission' });
  }
}

async function deleteSubmission(req: NextApiRequest, res: NextApiResponse, userId: string, submissionId: string, isAdmin = false) {
  try {
    // Check if submission exists and user has permission
    const whereClause = isAdmin ? { id: submissionId } : { id: submissionId, userId };
    const existingSubmission = await prisma.submission.findUnique({ where: whereClause });

    if (!existingSubmission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Prevent deletion of evaluated submissions unless admin
    if (!isAdmin && (existingSubmission.status === 'EVALUATED' || existingSubmission.status === 'WINNER' || existingSubmission.status === 'FINALIST')) {
      return res.status(403).json({ error: 'Cannot delete evaluated submissions' });
    }

    // Delete the submission
    await prisma.submission.delete({
      where: { id: submissionId },
    });

    return res.status(200).json({
      message: 'Submission deleted successfully',
    });
  } catch (error) {
    console.error('Delete submission error:', error);
    return res.status(500).json({ error: 'Failed to delete submission' });
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

function isValidUploadThingUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['utfs.io', 'uploadthing.com'].some((host) => parsed.host.includes(host));
  } catch {
    return false;
  }
}

// Helper function to verify Google Drive access
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
