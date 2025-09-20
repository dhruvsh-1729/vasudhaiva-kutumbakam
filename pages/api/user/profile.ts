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
    
    return { userId: decoded.userId, isAdmin: decoded.isAdmin };
  } catch (error) {
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const admin = getAdminFromToken(req);
    if (!admin) {
      return res.status(401).json({ error: 'Unauthorized. Admin access required.' });
    }

    // Find user by email from session
    const user = await prisma.user.findUnique({
      where: {
        userId: admin.userId,
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
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  } finally {
    await prisma.$disconnect();
  }
}