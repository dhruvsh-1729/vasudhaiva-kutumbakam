// pages/api/admin/settings.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/serverAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getAdminSettings(req, res);
      case 'POST':
        {
          const admin = await requireAuth(req, res, { requireAdmin: true });
          if (!admin) return;
        return await updateAdminSettings(req, res);
        }
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Admin settings API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getAdminSettings(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get or create admin settings
    let settings = await prisma.adminSettings.findFirst();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.adminSettings.create({
        data: {
          currentInterval: 1,
          isSubmissionsOpen: true,
          maxSubmissionsPerInterval: 3,
        },
      });
    }

    return res.status(200).json({
      currentInterval: settings.currentInterval,
      isSubmissionsOpen: settings.isSubmissionsOpen,
      maxSubmissionsPerInterval: settings.maxSubmissionsPerInterval,
    });
  } catch (error) {
    console.error('Get admin settings error:', error);
    return res.status(500).json({ error: 'Failed to fetch admin settings' });
  }
}

async function updateAdminSettings(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { currentInterval, isSubmissionsOpen, maxSubmissionsPerInterval } = req.body;

    // Validate input
    if (currentInterval !== undefined && (typeof currentInterval !== 'number' || currentInterval < 1)) {
      return res.status(400).json({ error: 'Invalid current interval' });
    }

    if (isSubmissionsOpen !== undefined && typeof isSubmissionsOpen !== 'boolean') {
      return res.status(400).json({ error: 'Invalid submissions open status' });
    }

    if (maxSubmissionsPerInterval !== undefined && (typeof maxSubmissionsPerInterval !== 'number' || maxSubmissionsPerInterval < 1)) {
      return res.status(400).json({ error: 'Invalid max submissions per interval' });
    }

    // Get existing settings
    let settings = await prisma.adminSettings.findFirst();
    
    if (!settings) {
      // Create new settings
      settings = await prisma.adminSettings.create({
        data: {
          currentInterval: currentInterval ?? 1,
          isSubmissionsOpen: isSubmissionsOpen ?? true,
          maxSubmissionsPerInterval: maxSubmissionsPerInterval ?? 3,
        },
      });
    } else {
      // Update existing settings
      const updateData: any = {};
      if (currentInterval !== undefined) updateData.currentInterval = currentInterval;
      if (isSubmissionsOpen !== undefined) updateData.isSubmissionsOpen = isSubmissionsOpen;
      if (maxSubmissionsPerInterval !== undefined) updateData.maxSubmissionsPerInterval = maxSubmissionsPerInterval;

      settings = await prisma.adminSettings.update({
        where: { id: settings.id },
        data: updateData,
      });
    }

    return res.status(200).json({
      currentInterval: settings.currentInterval,
      isSubmissionsOpen: settings.isSubmissionsOpen,
      maxSubmissionsPerInterval: settings.maxSubmissionsPerInterval,
      message: 'Admin settings updated successfully',
    });
  } catch (error) {
    console.error('Update admin settings error:', error);
    return res.status(500).json({ error: 'Failed to update admin settings' });
  }
}
