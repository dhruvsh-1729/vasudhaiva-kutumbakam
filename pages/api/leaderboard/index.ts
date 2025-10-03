// pages/api/leaderboard.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      competitionId,
      interval,
      page = "1",
      limit = "10",
    } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const pageSize = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * pageSize;

    const where: any = {};
    if (competitionId) where.competitionId = Number(competitionId);
    if (interval) where.interval = Number(interval);

    // Raw submissions (for details view)
    const submissions = await prisma.submission.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { overallScore: "desc" },
      include: {
        user: { select: { id: true, name: true, institution: true, avatarUrl: true } },
      },
    });

    const totalCount = await prisma.submission.count({ where });

    // Aggregated leaderboard per user (simpler approach)
    const allSubmissions = await prisma.submission.findMany({
      where,
      include: {
      user: { select: { id: true, name: true, institution: true, avatarUrl: true } },
      },
    });

    // Group submissions by user
    const userSubmissions = new Map();
    allSubmissions.forEach((submission) => {
      const key = `${submission.userId}-${submission.competitionId}-${submission.interval}`;
      if (!userSubmissions.has(key)) {
      userSubmissions.set(key, {
        user: submission.user,
        competitionId: submission.competitionId,
        interval: submission.interval,
        scores: [],
      });
      }
      userSubmissions.get(key).scores.push(submission.overallScore);
    });

    // Calculate aggregated stats
    const aggregated = Array.from(userSubmissions.values()).map((userSub) => ({
      user: userSub.user,
      competitionId: userSub.competitionId,
      interval: userSub.interval,
      avgScore: userSub.scores.reduce((sum: number, score: number) => sum + score, 0) / userSub.scores.length,
      bestScore: Math.max(...userSub.scores),
      submissionsCount: userSub.scores.length,
    }));

    // Sort by average score descending and paginate
    const sortedAggregated = aggregated.sort((a, b) => b.avgScore - a.avgScore);
    const paginatedAggregated = sortedAggregated.slice(skip, skip + pageSize);

    res.status(200).json({
      data: submissions,
      aggregated: paginatedAggregated,
      meta: {
      total: totalCount,
      page: pageNum,
      limit: pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
}
