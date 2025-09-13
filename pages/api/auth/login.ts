// pages/api/auth/login.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Type definitions
interface LoginRequestBody {
  email: string;
  password: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    // isEmailVerified: boolean;
  };
  token?: string;
  error?: string;
}

// Validation helper
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST request.',
      message: 'Invalid request method'
    });
  }

  try {
    const { email, password }: LoginRequestBody = req.body;

    // Input validation
    const errors: string[] = [];

    if (!email || email.trim().length === 0) {
      errors.push('Email is required');
    } else if (!validateEmail(email)) {
      errors.push('Please provide a valid email address');
    }

    if (!password || password.trim().length === 0) {
      errors.push('Password is required');
    }

    // Return validation errors
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: errors.join(', '),
        message: 'Validation failed'
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase().trim(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        isActive: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No account found with this email address. Please register first.',
        message: 'Account not found'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Your account has been deactivated. Please contact support.',
        message: 'Account deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid password. Please check your credentials and try again.',
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
      jwtSecret,
      { expiresIn: '7d' } // Token expires in 7 days
    );

    // Update last login timestamp (optional)
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() },
    });

    // Log successful login
    console.log(`User logged in: ${user.email} at ${new Date().toISOString()}`);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Login successful! Welcome back to VK Competition.',
      user: {
      id: user.id,
      name: user.name,
      email: user.email,
      },
      token,
    });

    } catch (error) {
    console.error('Login error:', error);

    // Generic error response
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred during login. Please try again later.',
      message: 'Internal server error'
    });
  } finally {
    // Ensure Prisma client is disconnected
    await prisma.$disconnect();
  }
}

// Export types for use in other files
export type { LoginRequestBody, ApiResponse };