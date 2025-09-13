// pages/api/users/register.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Type definitions
interface RegisterRequestBody {
  name: string;
  email: string;
  phone: string;
  institution: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  error?: string;
}

// Validation helper
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  // Basic phone validation - adjust based on your requirements
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
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
    const { name, email, phone, institution }: RegisterRequestBody = req.body;

    // Input validation
    const errors: string[] = [];

    if (!name || name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (!email || email.trim().length === 0) {
      errors.push('Email is required');
    } else if (!validateEmail(email)) {
      errors.push('Please provide a valid email address');
    }

    if (!phone || phone.trim().length === 0) {
      errors.push('Phone number is required');
    } else if (!validatePhone(phone)) {
      errors.push('Please provide a valid phone number');
    }

    if (!institution || institution.trim().length === 0) {
      errors.push('Institution is required');
    }

    // Return validation errors
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: errors.join(', '),
        message: 'Validation failed'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase().trim(),
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email already exists. Please use a different email or try logging in.',
        message: 'User already exists'
      });
    }

    // Generate a temporary password (you might want to implement proper authentication later)
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        institution: institution.trim(),
        password: hashedPassword,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        institution: true,
        createdAt: true,
      },
    });

    // Log successful registration (you might want to use a proper logger)
    console.log(`New user registered: ${newUser.email} at ${new Date().toISOString()}`);

    // TODO: Send welcome email with temporary password
    // You might want to integrate with services like:
    // - SendGrid
    // - Nodemailer
    // - AWS SES
    // Example:
    // await sendWelcomeEmail(newUser.email, newUser.name, tempPassword);

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to the VK Competition community.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });

  } catch (error) {
    console.error('Registration error:', error);

    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        // Unique constraint violation
        return res.status(409).json({
          success: false,
          error: 'An account with this email already exists.',
          message: 'Duplicate email'
        });
      }
    }

    // Generic error response
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred during registration. Please try again later.',
      message: 'Internal server error'
    });
  } finally {
    // Ensure Prisma client is disconnected
    await prisma.$disconnect();
  }
}

// Optional: Export types for use in other files
export type { RegisterRequestBody, ApiResponse };