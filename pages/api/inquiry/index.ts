import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Type definitions
interface CreateInquiryRequestBody {
  name: string;
  email: string;
  subject: string;
  message?: string;
}

interface InquiryApiResponse {
  success: boolean;
  message: string;
  inquiry?: any;
  inquiries?: any[];
  error?: string;
}

// Validation helper
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<InquiryApiResponse>
) {
  try {
    switch (req.method) {
      case 'GET':
        const inquiries = await prisma.inquiry.findMany({
          orderBy: {
            createdAt: 'desc'
          }
        });
        
        return res.status(200).json({
          success: true,
          message: 'Inquiries fetched successfully',
          inquiries
        });

      case 'POST':
        const { name, email, subject, message }: CreateInquiryRequestBody = req.body;

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

        if (!subject || subject.trim().length === 0) {
          errors.push('Subject is required');
        }

        // Return validation errors
        if (errors.length > 0) {
          return res.status(400).json({
            success: false,
            error: errors.join(', '),
            message: 'Validation failed'
          });
        }

        const inquiry = await prisma.inquiry.create({
          data: {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            subject: subject.trim(),
            message: message?.trim() || '',
          }
        });

        console.log(`New inquiry created: ${inquiry.email} at ${new Date().toISOString()}`);

        return res.status(201).json({
          success: true,
          message: 'Inquiry created successfully',
          inquiry
        });

      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed',
          message: 'Invalid request method'
        });
    }
  } catch (error) {
    console.error('Inquiry API error:', error);

    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred. Please try again later.',
      message: 'Internal server error'
    });
  } finally {
    await prisma.$disconnect();
  }
}

// Export types for use in other files
export type { CreateInquiryRequestBody, InquiryApiResponse };