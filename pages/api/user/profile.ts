// pages/api/user/profile.ts (Example protected route)
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, withAuth } from '../../../middleware/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ProfileResponse {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    institution?: string | null;
    avatarUrl?: string | null;
    createdAt: Date;
  };
  error?: string;
  message: string;
}

async function profileHandler(
  req: AuthenticatedRequest,
  res: NextApiResponse<ProfileResponse>
) {
  if (req.method === 'GET') {
    // Get user profile
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          institution: true,
          avatarUrl: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'Profile not found'
        });
      }

      return res.status(200).json({
        success: true,
        user,
        message: 'Profile retrieved successfully'
      });

    } catch (error) {
      console.error('Profile fetch error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch profile',
        message: 'Internal server error'
      });
    }

  } else if (req.method === 'PUT') {
    // Update user profile
    try {
      const { name, phone, institution } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: req.user!.id },
        data: {
          ...(name && { name: name.trim() }),
          ...(phone && { phone: phone.trim() }),
          ...(institution && { institution: institution.trim() }),
          updatedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          institution: true,
          avatarUrl: true,
          createdAt: true,
        },
      });

      return res.status(200).json({
        success: true,
        user: updatedUser,
        message: 'Profile updated successfully'
      });

    } catch (error) {
      console.error('Profile update error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update profile',
        message: 'Internal server error'
      });
    }

  } else {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: 'Only GET and PUT methods are allowed'
    });
  }
}

// Export with authentication middleware
export default withAuth(profileHandler);