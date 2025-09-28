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
        type: 'important',
        title: 'Registration Deadline Extended',
        content: 'The registration deadline for all competitions has been extended by one week.',
        date: 'October 15, 2023',
        createdAt: '2023-10-15T10:30:00Z'
      },
      {
        id: 2,
        type: 'winner',
        title: 'Week 1 AI Challenge Winners!',
        content: 'Congratulations to our first week winners! We will be contacting winners shortly regarding prize distribution.',
        date: 'October 12, 2023',
        createdAt: '2023-10-12T15:45:00Z'
      },
      {
        id: 3,
        type: 'normal',
        title: 'New AI Challenge Added',
        content: 'We have added a new AI challenge to the competition lineup.',
        date: 'October 10, 2023',
        createdAt: '2023-10-10T09:15:00Z'
      }
    ];

    res.status(200).json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
}