import type { NextApiRequest, NextApiResponse } from 'next';

type Announcement = {
  id: number;
  type: 'important' | 'winner' | 'normal';
  title: string;
  content: string;
  date: string;
  createdAt: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Announcement[] | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Mock data for now - replace with your database query
    const announcements: Announcement[] = [
      {
      id: 1,
      type: 'normal',
      title: 'New AI Challenges Added',
      content: 'We have added new AI challenges to the competition lineup.',
      date: 'October 01, 2025',
      createdAt: '2025-10-01T09:15:00Z'
      },
      {
      id: 2,
      type: 'normal',
      title: 'Submission Deadline Extended',
      content: 'Great news! The submission deadline has been extended till 20th November. Make sure to submit your projects before the new deadline.',
      date: 'October 02, 2025',
      createdAt: '2025-10-02T10:00:00Z'
      },
      {
      id: 3,
      type: 'normal',
      title: 'Submission Deadline for Painting Competition Extended',
      content: 'The submission deadline for the painting competition has been extended to December 30th. Take advantage of this extra time to perfect your artwork!',
      date: 'October 16, 2025',
      createdAt: '2025-10-16T14:30:00Z'
      },
    ];

    res.status(200).json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
}