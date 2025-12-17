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
        id: 7,
        type: 'winner',
        title: 'Winners announced for first two-week categories',
        content: 'Our first two-week category winners are out! Congratulations to the champs. Keep submitting for the final round to grab the prize money.',
        date: 'December 22, 2025',
        createdAt: '2025-12-22T09:00:00+05:30'
      },
      {
        id: 1,
        type: 'normal',
        title: 'New AI Challenges Added',
        content: 'We have added new AI challenges to the competition lineup.',
        date: 'October 01, 2025',
        createdAt: '2025-10-01T09:15:00+05:30'
      },
      {
        id: 2,
        type: 'important',
        title: 'Submission Deadline Updated',
        content: 'All categories now close on November 30, 2025 at 11:59:59 PM IST for Round 1. The Week 2 Challenge (Dec 1–11) and Final Submission Window (Dec 12–30) are live on the updated timeline.',
        date: 'November 10, 2025',
        createdAt: '2025-11-10T10:00:00+05:30'
      },
      {
        id: 3,
        type: 'normal',
        title: 'New Categories: Memes, Singing, Poetry',
        content: 'VK Memes, VK Harmonies (Singing), and VK Verses (Poetry) are live. All three share the November 30, 2025 11:59:59 PM IST deadline for Round 1.',
        date: 'November 12, 2025',
        createdAt: '2025-11-12T09:00:00+05:30'
      },
      {
        id: 4,
        type: 'important',
        title: 'Week 2 Challenge Window',
        content: 'Week 2 Challenge runs from December 1–11, 2025. Use this window to polish submissions before the final round.',
        date: 'December 01, 2025',
        createdAt: '2025-12-01T05:30:00+05:30'
      },
      {
        id: 5,
        type: 'normal',
        title: 'Final Submission Window (Round 3)',
        content: 'The final submission window is open from December 12–30, 2025. Submit final versions by 11:59:59 PM IST on December 30.',
        date: 'December 12, 2025',
        createdAt: '2025-12-12T05:30:00+05:30'
      },
      {
        id: 6,
        type: 'important',
        title: 'Timeline & Jury Review Updated',
        content: 'Jury review moves to December 31, 2025 – January 6, 2026, with results rolling out from January 7, 2026.',
        date: 'December 20, 2025',
        createdAt: '2025-12-20T05:30:00+05:30'
      },
    ];

    res.status(200).json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
}
