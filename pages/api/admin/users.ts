// pages/api/admin/users.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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

    switch (req.method) {
      case 'GET':
        return await getUsers(req, res);
      case 'POST':
        return await createUser(req, res);
      case 'PUT':
        return await updateBulkUsers(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Admin users API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}

async function getUsers(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      page = '1',
      limit = '15',
      search,
      isActive,
      isEmailVerified,
      institution,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    if (isEmailVerified !== undefined) {
      where.isEmailVerified = isEmailVerified === 'true';
    }
    
    if (institution) {
      where.institution = { contains: institution as string, mode: 'insensitive' };
    }

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          institution: true,
          isActive: true,
          isEmailVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              submissions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
}

async function createUser(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, email, password, phone, institution } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        institution: institution || null,
        isActive: true,
        isEmailVerified: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        institution: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(201).json({
      user,
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({ error: 'Failed to create user' });
  }
}

async function updateBulkUsers(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userIds, action } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'User IDs are required' });
    }

    if (!action || !['activate', 'deactivate', 'verify'].includes(action)) {
      return res.status(400).json({ error: 'Valid action is required' });
    }

    const updateData: any = {};
    
    switch (action) {
      case 'activate':
        updateData.isActive = true;
        break;
      case 'deactivate':
        updateData.isActive = false;
        break;
      case 'verify':
        updateData.isEmailVerified = true;
        break;
    }

    // Update multiple users
    const updatedUsers = await prisma.user.updateMany({
      where: {
        id: { in: userIds },
      },
      data: updateData,
    });

    return res.status(200).json({
      message: `${action} completed for ${updatedUsers.count} users`,
      updatedCount: updatedUsers.count,
    });
  } catch (error) {
    console.error('Bulk update users error:', error);
    return res.status(500).json({ error: 'Failed to update users' });
  }
}

// Individual user management API
// pages/api/admin/users/[userId].ts
export async function handleUserById(req: NextApiRequest, res: NextApiResponse) {
  try {
    const admin = getAdminFromToken(req);
    if (!admin) {
      return res.status(401).json({ error: 'Unauthorized. Admin access required.' });
    }

    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    switch (req.method) {
      case 'GET':
        return await getUserById(userId, res);
      case 'PUT':
        return await updateUser(userId, req, res);
      case 'DELETE':
        return await deleteUser(userId, res);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('User management API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}

async function getUserById(userId: string, res: NextApiResponse) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            submissions: true,
          },
        },
        submissions: {
          select: {
            id: true,
            competitionId: true,
            interval: true,
            status: true,
            overallScore: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Get user by ID error:', error);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
}

async function updateUser(userId: string, req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, email, phone, institution, isActive, isEmailVerified } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is already taken by another user
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return res.status(409).json({ error: 'Email is already taken' });
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || existingUser.name,
        email: email || existingUser.email,
        phone: phone !== undefined ? phone : existingUser.phone,
        institution: institution !== undefined ? institution : existingUser.institution,
        isActive: isActive !== undefined ? isActive : existingUser.isActive,
        isEmailVerified: isEmailVerified !== undefined ? isEmailVerified : existingUser.isEmailVerified,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        institution: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    return res.status(200).json({
      user: updatedUser,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ error: 'Failed to update user' });
  }
}

async function deleteUser(userId: string, res: NextApiResponse) {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Soft delete by deactivating instead of hard delete to preserve data integrity
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        email: `deleted_${Date.now()}_${existingUser.email}`, // Prevent email conflicts
      },
    });

    return res.status(200).json({
      message: 'User deactivated successfully',
      submissionsCount: existingUser._count.submissions,
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
}