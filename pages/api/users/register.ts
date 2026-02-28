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
  password: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  requiresEmailVerification?: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  error?: string;
}

// Validation helpers
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

const validatePassword = (password: string): string[] => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return errors;
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
    const { name, email, phone, institution, password }: RegisterRequestBody = req.body;

    // Input validation
    const errors: string[] = [];

    if (!name || name.trim().length === 0) {
      errors.push('Name is required');
    } else if (name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
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

    if (!password || password.trim().length === 0) {
      errors.push('Password is required');
    } else {
      const passwordErrors = validatePassword(password);
      errors.push(...passwordErrors);
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user - email verification bypassed per business requirements
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        institution: institution.trim(),
        password: hashedPassword,
        isActive: true,
        isEmailVerified: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        institution: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    // Log successful registration
    console.log(`New user registered: ${newUser.email} at ${new Date().toISOString()}`);

    // Return success response - account is immediately usable without email verification
    return res.status(201).json({
      success: true,
      message: 'Registration successful! Your account has been created. Please login to continue.',
      requiresEmailVerification: false,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      }
    });

  } catch (error) {
    console.error('Registration error:', error);

    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
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
    await prisma.$disconnect();
  }
}

export type { RegisterRequestBody, ApiResponse };