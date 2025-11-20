// pages/api/admin/sync-interval.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getCurrentSubmissionInterval, areSubmissionsOpen, getCurrentInterval, getNextDeadline } from '@/lib/deadlineManager';

/**
 * API endpoint to sync admin settings with timeline-based intervals
 * This can be called manually or via a cron job to ensure settings stay updated
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', ['POST', 'GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get current interval information from timeline
    const currentInterval = getCurrentSubmissionInterval();
    const isOpen = areSubmissionsOpen();
    const currentIntervalInfo = getCurrentInterval();
    const nextDeadlineInfo = getNextDeadline();

    // Get or create admin settings
    let settings = await prisma.adminSettings.findFirst();
    
    if (!settings) {
      // Create new settings with current timeline values
      settings = await prisma.adminSettings.create({
        data: {
          currentInterval: currentInterval,
          isSubmissionsOpen: isOpen,
          maxSubmissionsPerInterval: 3,
        },
      });
      
      return res.status(201).json({
        message: 'Admin settings created and synced with timeline',
        updated: true,
        data: {
          currentInterval: settings.currentInterval,
          isSubmissionsOpen: settings.isSubmissionsOpen,
          maxSubmissionsPerInterval: settings.maxSubmissionsPerInterval,
          currentIntervalInfo: {
            id: currentIntervalInfo.id,
            title: currentIntervalInfo.title,
            isSubmissionInterval: currentIntervalInfo.isSubmissionInterval,
          },
          nextDeadline: {
            deadline: nextDeadlineInfo.deadline,
            title: nextDeadlineInfo.title,
            weekNumber: nextDeadlineInfo.weekNumber,
          }
        }
      });
    }

    // Check if settings need to be updated
    const needsUpdate = 
      settings.currentInterval !== currentInterval || 
      settings.isSubmissionsOpen !== isOpen;

    if (needsUpdate) {
      // Update settings to match timeline
      settings = await prisma.adminSettings.update({
        where: { id: settings.id },
        data: {
          currentInterval: currentInterval,
          isSubmissionsOpen: isOpen,
        },
      });

      return res.status(200).json({
        message: 'Admin settings updated to match timeline',
        updated: true,
        changes: {
          previousInterval: settings.currentInterval !== currentInterval ? 'Changed' : 'No change',
          previousSubmissionsOpen: settings.isSubmissionsOpen !== isOpen ? 'Changed' : 'No change',
        },
        data: {
          currentInterval: settings.currentInterval,
          isSubmissionsOpen: settings.isSubmissionsOpen,
          maxSubmissionsPerInterval: settings.maxSubmissionsPerInterval,
          currentIntervalInfo: {
            id: currentIntervalInfo.id,
            title: currentIntervalInfo.title,
            isSubmissionInterval: currentIntervalInfo.isSubmissionInterval,
          },
          nextDeadline: {
            deadline: nextDeadlineInfo.deadline,
            title: nextDeadlineInfo.title,
            weekNumber: nextDeadlineInfo.weekNumber,
          }
        }
      });
    }

    // No update needed
    return res.status(200).json({
      message: 'Admin settings already in sync with timeline',
      updated: false,
      data: {
        currentInterval: settings.currentInterval,
        isSubmissionsOpen: settings.isSubmissionsOpen,
        maxSubmissionsPerInterval: settings.maxSubmissionsPerInterval,
        currentIntervalInfo: {
          id: currentIntervalInfo.id,
          title: currentIntervalInfo.title,
          isSubmissionInterval: currentIntervalInfo.isSubmissionInterval,
        },
        nextDeadline: {
          deadline: nextDeadlineInfo.deadline,
          title: nextDeadlineInfo.title,
          weekNumber: nextDeadlineInfo.weekNumber,
        }
      }
    });

  } catch (error) {
    console.error('Sync interval error:', error);
    return res.status(500).json({ 
      error: 'Failed to sync interval',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
