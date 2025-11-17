// pages/api/profile/update.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/serverAuth';

// Type for update request body
interface UpdateProfileBody {
  phone?: string;
  institution?: string;
}

// Type for API response
interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow PATCH and PUT methods
  if (req.method !== 'PATCH' && req.method !== 'PUT') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const auth = await requireAuth(req, res);
    if (!auth) return;

    // Extract and validate request body
    const { phone, institution }: UpdateProfileBody = req.body;

    // Validation
    const updates: any = {};

    // Validate phone number if provided
    if (phone !== undefined) {
      if (phone === '') {
        // Allow clearing the phone number
        updates.phone = null;
      } else {
        // Basic phone validation (you can make this more strict)
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(phone) || phone.length < 10 || phone.length > 20) {
          return res.status(400).json({
            success: false,
            error: 'Invalid phone number format',
          });
        }
        updates.phone = phone.trim();
      }
    }

    // Validate institution if provided
    if (institution !== undefined) {
      if (institution === '') {
        // Allow clearing the institution
        updates.institution = null;
      } else {
        // Basic validation for institution
        if (institution.length > 200) {
          return res.status(400).json({
            success: false,
            error: 'Institution name is too long (max 200 characters)',
          });
        }
        updates.institution = institution.trim();
      }
    }

    // Check if there are any updates to make
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update',
      });
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: {
        id: auth.user.id,
      },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        institution: true,
        avatarUrl: true,
        isActive: true,
        isEmailVerified: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });

  } catch (error) {
    console.error('Profile update error:', error);

    // Handle Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('P2025')) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }
      
      if (error.message.includes('P2002')) {
        return res.status(400).json({
          success: false,
          error: 'A user with this phone number already exists',
        });
      }
    }

    // Generic error response
    return res.status(500).json({
      success: false,
      error: 'Internal server error while updating profile',
    });
  }
}

// Optional: Add middleware for CORS if needed
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
