// pages/api/admin/stats.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Helper function to check admin status
function getAdminFromToken(req: NextApiRequest): { userId: string; isAdmin: boolean } | null {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    if (!decoded.isAdmin) {
      return null;
    }
    
    return { userId: decoded.userId, isAdmin: decoded.isAdmin };
  } catch (error) {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const admin = getAdminFromToken(req);
    if (!admin) {
      return res.status(401).json({ error: 'Unauthorized. Admin access required.' });
    }

    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: 'Method not allowed' });
    }

    return await getStats(req, res);
  } catch (error) {
    console.error('Admin stats API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}

async function getStats(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { timeRange = '30d' } = req.query;

    // Calculate date filter based on time range
    let dateFilter: Date | undefined;
    const now = new Date();
    
    switch (timeRange) {
      case '7d':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        dateFilter = undefined;
        break;
      default:
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Build date filter for queries
    const whereClause = dateFilter ? {
      createdAt: {
        gte: dateFilter,
      },
    } : {};

    // Get basic counts
    const [totalUsers, totalSubmissions, pendingReviews] = await Promise.all([
      prisma.user.count({
        where: dateFilter ? { createdAt: { gte: dateFilter } } : {},
      }),
      prisma.submission.count({ where: whereClause }),
      prisma.submission.count({
        where: {
          ...whereClause,
          status: 'PENDING',
        },
      }),
    ]);

    // Get current admin settings
    const adminSettings = await prisma.adminSettings.findFirst();
    const currentInterval = adminSettings?.currentInterval || 1;

    // Get submissions for current interval
    const submissionsThisInterval = await prisma.submission.count({
      where: {
        interval: currentInterval,
      },
    });

    // Get average score
    const avgScoreResult = await prisma.submission.aggregate({
      where: {
        ...whereClause,
        overallScore: {
          not: null,
        },
      },
      _avg: {
        overallScore: true,
      },
    });

    const averageScore = avgScoreResult._avg.overallScore || 0;

    // Get top performers
    const topPerformers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        submissions: {
          select: {
            overallScore: true,
          },
          where: {
            ...whereClause,
            overallScore: {
              not: null,
            },
          },
        },
      },
      where: {
        submissions: {
          some: {
            ...whereClause,
            overallScore: {
              not: null,
            },
          },
        },
      },
    });

    // Calculate average scores for top performers
    const topPerformersWithStats = topPerformers
      .map(user => {
        const validScores = user.submissions
          .filter(s => s.overallScore !== null)
          .map(s => s.overallScore!);
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          submissionsCount: validScores.length,
          averageScore: validScores.length > 0 
            ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length 
            : 0,
        };
      })
      .filter(user => user.submissionsCount > 0)
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5);

    // Get competition breakdown
    const competitionTitles: { [key: number]: string } = {
      1: 'AI Short Video',
      2: 'Lextoons',
      3: 'Political Toons',
    };

    const competitionBreakdown = await Promise.all(
      Object.keys(competitionTitles).map(async (compId) => {
        const competitionId = parseInt(compId);
        const [submissions, avgScore] = await Promise.all([
          prisma.submission.count({
            where: {
              ...whereClause,
              competitionId,
            },
          }),
          prisma.submission.aggregate({
            where: {
              ...whereClause,
              competitionId,
              overallScore: {
                not: null,
              },
            },
            _avg: {
              overallScore: true,
            },
          }),
        ]);

        return {
          competitionId,
          title: competitionTitles[competitionId],
          submissions,
          averageScore: avgScore._avg.overallScore || 0,
        };
      })
    );

    // Get interval statistics
    const intervalStats = await Promise.all(
      Array.from({ length: Math.min(5, currentInterval) }, (_, i) => {
        const interval = currentInterval - i;
        return interval;
      }).map(async (interval) => {
        const [submissions, avgScore] = await Promise.all([
          prisma.submission.count({
            where: {
              interval,
            },
          }),
          prisma.submission.aggregate({
            where: {
              interval,
              overallScore: {
                not: null,
              },
            },
            _avg: {
              overallScore: true,
            },
          }),
        ]);

        return {
          interval,
          submissions,
          avgScore: avgScore._avg.overallScore || 0,
        };
      })
    );

    // Get recent activity
    const recentSubmissions = await prisma.submission.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // Format recent activity
    const recentActivity = [
      ...recentSubmissions.slice(0, 5).map(submission => ({
        id: `submission-${submission.id}`,
        type: 'submission' as const,
        message: `New submission received for Competition ${submission.competitionId}`,
        timestamp: submission.createdAt.toISOString(),
        user: {
          name: submission.user.name,
          email: submission.user.email,
        },
      })),
      ...recentUsers.map(user => ({
        id: `user-${user.id}`,
        type: 'user_registration' as const,
        message: 'New user registered',
        timestamp: user.createdAt.toISOString(),
        user: {
          name: user.name,
          email: user.email,
        },
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    // Compile and return stats
    const stats = {
      totalUsers,
      totalSubmissions,
      pendingReviews,
      currentInterval,
      submissionsThisInterval,
      averageScore,
      topPerformers: topPerformersWithStats,
      competitionBreakdown: competitionBreakdown.filter(comp => comp.submissions > 0),
      intervalStats: intervalStats.reverse(), // Show in chronological order
      recentActivity,
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch statistics' });
  }
}

// Additional endpoint for specific metrics
// pages/api/admin/stats/[metric].ts
export async function getSpecificMetric(req: NextApiRequest, res: NextApiResponse) {
  try {
    const admin = getAdminFromToken(req);
    if (!admin) {
      return res.status(401).json({ error: 'Unauthorized. Admin access required.' });
    }

    const { metric } = req.query;

    switch (metric) {
      case 'submissions-by-day':
        return await getSubmissionsByDay(req, res);
      case 'user-growth':
        return await getUserGrowth(req, res);
      case 'score-distribution':
        return await getScoreDistribution(req, res);
      case 'competition-performance':
        return await getCompetitionPerformance(req, res);
      default:
        return res.status(400).json({ error: 'Invalid metric requested' });
    }
  } catch (error) {
    console.error('Get specific metric error:', error);
    return res.status(500).json({ error: 'Failed to fetch metric' });
  } finally {
    await prisma.$disconnect();
  }
}

async function getSubmissionsByDay(req: NextApiRequest, res: NextApiResponse) {
  const { days = '30' } = req.query;
  const daysNum = parseInt(days as string, 10);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysNum);

  const submissions = await prisma.submission.groupBy({
    by: ['createdAt'],
    where: {
      createdAt: {
        gte: startDate,
      },
    },
    _count: {
      id: true,
    },
  });

  // Group by day
  const submissionsByDay = submissions.reduce((acc: any, submission) => {
    const day = submission.createdAt.toISOString().split('T')[0];
    acc[day] = (acc[day] || 0) + submission._count.id;
    return acc;
  }, {});

  return res.status(200).json(submissionsByDay);
}

async function getUserGrowth(req: NextApiRequest, res: NextApiResponse) {
  const { days = '30' } = req.query;
  const daysNum = parseInt(days as string, 10);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysNum);

  const users = await prisma.user.groupBy({
    by: ['createdAt'],
    where: {
      createdAt: {
        gte: startDate,
      },
    },
    _count: {
      id: true,
    },
  });

  // Group by day
  const usersByDay = users.reduce((acc: any, user) => {
    const day = user.createdAt.toISOString().split('T')[0];
    acc[day] = (acc[day] || 0) + user._count.id;
    return acc;
  }, {});

  return res.status(200).json(usersByDay);
}

async function getScoreDistribution(_req: NextApiRequest, res: NextApiResponse) {
  const submissions = await prisma.submission.findMany({
    select: {
      overallScore: true,
    },
    where: {
      overallScore: {
        not: null,
      },
    },
  });

  // Create score buckets
  const buckets = {
    '0-2': 0,
    '2-4': 0,
    '4-6': 0,
    '6-8': 0,
    '8-10': 0,
  };

  submissions.forEach(submission => {
    const score = submission.overallScore!;
    if (score <= 2) buckets['0-2']++;
    else if (score <= 4) buckets['2-4']++;
    else if (score <= 6) buckets['4-6']++;
    else if (score <= 8) buckets['6-8']++;
    else buckets['8-10']++;
  });

  return res.status(200).json(buckets);
}

async function getCompetitionPerformance(_req: NextApiRequest, res: NextApiResponse) {
  const competitions = [1, 2, 3];
  const competitionTitles: { [key: number]: string } = {
    1: 'AI Short Video',
    2: 'Lextoons',
    3: 'Political Toons',
  };

  const performance = await Promise.all(
    competitions.map(async (competitionId) => {
      const [totalSubmissions, avgScore, topScore] = await Promise.all([
        prisma.submission.count({
          where: { competitionId },
        }),
        prisma.submission.aggregate({
          where: {
            competitionId,
            overallScore: { not: null },
          },
          _avg: { overallScore: true },
        }),
        prisma.submission.aggregate({
          where: {
            competitionId,
            overallScore: { not: null },
          },
          _max: { overallScore: true },
        }),
      ]);

      return {
        competitionId,
        title: competitionTitles[competitionId],
        totalSubmissions,
        averageScore: avgScore._avg.overallScore || 0,
        topScore: topScore._max.overallScore || 0,
      };
    })
  );

  return res.status(200).json(performance);
}