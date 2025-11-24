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
        type: 'important',
        title: 'Submission Deadline Extended',
        content: 'Great news! The submission deadline for all AI/video/writing/comic categories is now December 10, 2025. Painting remains December 30, 2025.',
        date: 'November 10, 2025',
        createdAt: '2025-11-10T10:00:00Z'
      },
      {
        id: 3,
        type: 'normal',
        title: 'Submission Deadline for Painting Competition Extended',
        content: 'The submission deadline for the painting competition has been extended to December 30th. Take advantage of this extra time to perfect your artwork!',
        date: 'October 16, 2025',
        createdAt: '2025-10-16T14:30:00Z'
      },
      {
        id: 4,
        type: 'important',
        title: 'Week 2 Commences — Final Submission Window Open',
        content: 'Week 2 begins today with the final submission window open until December 10, 2025 (all categories except painting). Refine your entries and submit before the deadline!',
        date: 'November 20, 2025',
        createdAt: '2025-11-20T05:30:00Z'
      },
      {
        id: 5,
        type: 'normal',
        title: 'Two New Categories Added',
        content: 'We have added LexToons (AI Comics / Legal Satire) and Blog Writing / AI-Assisted Essay. Both follow the same topics and share the December 10, 2025 submission deadline.',
        date: 'November 21, 2025',
        createdAt: '2025-11-21T05:30:00Z'
      },
    ];

    res.status(200).json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
}
