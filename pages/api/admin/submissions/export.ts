// pages/api/admin/submissions/export.ts
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

    return await exportSubmissions(req, res);
  } catch (error) {
    console.error('Export submissions API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function exportSubmissions(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Fetch all submissions with user information
    const submissions = await prisma.submission.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            institution: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Convert to CSV format
    const csvHeaders = [
      'ID',
      'Competition ID',
      'User ID',
      'User Name',
      'User Email',
      'User Institution',
      'Interval',
      'Title',
      'File URL',
      'Description',
      'Status',
      'Overall Score',
      'Creativity Score',
      'Technical Score',
      'AI Tool Usage Score',
      'Adherence Score',
      'Impact Score',
      'Judge Comments',
      'Evaluated By',
      'Evaluated At',
      'Is Access Verified',
      'Access Check Error',
      'Is Disqualified',
      'Disqualification Reason',
      'Created At',
      'Updated At'
    ];

    const csvRows = submissions.map(submission => [
      submission.id,
      submission.competitionId.toString(),
      submission.userId,
      escapeCSV(submission.user.name),
      escapeCSV(submission.user.email),
      escapeCSV(submission.user.institution || ''),
      submission.interval.toString(),
      escapeCSV(submission.title),
      escapeCSV(submission.fileUrl),
      escapeCSV(submission.description || ''),
      submission.status,
      submission.overallScore?.toString() || '',
      submission.creativityScore?.toString() || '',
      submission.technicalScore?.toString() || '',
      submission.aiToolUsageScore?.toString() || '',
      submission.adherenceScore?.toString() || '',
      submission.impactScore?.toString() || '',
      escapeCSV(submission.judgeComments || ''),
      escapeCSV(submission.evaluatedBy || ''),
      submission.evaluatedAt ? new Date(submission.evaluatedAt).toISOString() : '',
      submission.isAccessVerified ? 'Yes' : 'No',
      escapeCSV(submission.accessCheckError || ''),
      submission.isDisqualified ? 'Yes' : 'No',
      escapeCSV(submission.disqualificationReason || ''),
      new Date(submission.createdAt).toISOString(),
      new Date(submission.updatedAt).toISOString()
    ]);

    // Build CSV string
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    // Set response headers for file download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="submissions-export-${Date.now()}.csv"`);
    
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('Export submissions error:', error);
    return res.status(500).json({ error: 'Failed to export submissions' });
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
