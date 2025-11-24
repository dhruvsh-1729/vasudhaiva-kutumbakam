// pages/api/admin/users/export.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/serverAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const admin = await requireAuth(req, res, { requireAdmin: true });
    if (!admin) return;

    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: 'Method not allowed' });
    }

    return await exportUsers(req, res);
  } catch (error) {
    console.error('Export users API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function exportUsers(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Fetch all users with submission counts
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        institution: true,
        isActive: true,
        isEmailVerified: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Convert to CSV format
    const csvHeaders = [
      'ID',
      'Name',
      'Email',
      'Phone',
      'Institution',
      'Is Active',
      'Email Verified',
      'Is Admin',
      'Submission Count',
      'Created At',
      'Updated At'
    ];

    const csvRows = users.map(user => [
      user.id,
      escapeCSV(user.name),
      escapeCSV(user.email),
      escapeCSV(user.phone || ''),
      escapeCSV(user.institution || ''),
      user.isActive ? 'Yes' : 'No',
      user.isEmailVerified ? 'Yes' : 'No',
      user.isAdmin ? 'Yes' : 'No',
      user._count.submissions.toString(),
      new Date(user.createdAt).toISOString(),
      new Date(user.updatedAt).toISOString()
    ]);

    // Build CSV string
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    // Set response headers for file download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="users-export-${Date.now()}.csv"`);
    
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('Export users error:', error);
    return res.status(500).json({ error: 'Failed to export users' });
  }
}

// Helper function to escape CSV fields
function escapeCSV(field: string): string {
  if (!field) return '';
  
  // If the field contains comma, newline, or quote, wrap it in quotes and escape quotes
  if (field.includes(',') || field.includes('\n') || field.includes('"')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  
  return field;
}
