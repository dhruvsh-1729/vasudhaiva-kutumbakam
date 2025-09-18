import { useEffect, useState } from "react";
import Head from "next/head";

interface User {
  id: string;
  name: string;
  institution?: string;
  avatarUrl?: string;
}

interface Submission {
  id: string;
  competitionId: number;
  interval: number;
  overallScore: number;
  status: string;
  user: User;
}

interface AggregatedRow {
  user: User;
  competitionId: number;
  interval: number;
  avgScore: number;
  bestScore: number;
  submissionsCount: number;
}

interface ApiResponse {
  data: Submission[];
  aggregated: AggregatedRow[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function LeaderboardPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [aggregated, setAggregated] = useState<AggregatedRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [competitionId, setCompetitionId] = useState("");
  const [interval, setInterval] = useState("");
  const [tab, setTab] = useState<"aggregated" | "detailed">("aggregated");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          ...(competitionId ? { competitionId } : {}),
          ...(interval ? { interval } : {}),
        });

        const res = await fetch(`/api/leaderboard?${query.toString()}`);
        const json: ApiResponse = await res.json();

        setSubmissions(json.data);
        setAggregated(json.aggregated);
        setTotalPages(json.meta.totalPages);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [page, competitionId, interval]);

  return (
    <>
      <Head>
        <title>Leaderboard | Competition Platform</title>
        <link
          href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
          rel="stylesheet"
        />
      </Head>
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
            Leaderboard
          </h1>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white p-6 rounded-lg shadow-md">
            <input
              type="number"
              placeholder="Competition ID"
              value={competitionId}
              onChange={(e) => setCompetitionId(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            />
            <input
              type="number"
              placeholder="Interval"
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            />
            <button
              onClick={() => setPage(1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 w-full sm:w-auto"
            >
              Apply Filters
            </button>
          </div>

          {/* Tabs */}
          <div className="flex mb-6 border-b border-gray-200">
            <button
              onClick={() => setTab("aggregated")}
              className={`px-6 py-3 text-lg font-medium rounded-t-lg transition duration-200 ${
                tab === "aggregated"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Aggregated Leaderboard
            </button>
            <button
              onClick={() => setTab("detailed")}
              className={`px-6 py-3 text-lg font-medium rounded-t-lg transition duration-200 ${
                tab === "detailed"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Detailed Submissions
            </button>
          </div>

          {/* Loading Spinner */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
            </div>
          ) : tab === "aggregated" ? (
            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rank</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Institution</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Competition</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Interval</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Avg Score</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Best Score</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Submissions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {aggregated.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-8 text-center text-gray-500 text-lg"
                      >
                        No data found
                      </td>
                    </tr>
                  ) : (
                    aggregated.map((row, i) => (
                      <tr key={row.user?.id || i} className="hover:bg-gray-50 transition duration-150">
                        <td className="px-6 py-4 text-sm text-gray-900">{(page - 1) * 10 + i + 1}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 flex items-center gap-3">
                          {row.user?.avatarUrl && (
                            <img
                              src={row.user.avatarUrl}
                              alt={row.user?.name}
                              className="w-10 h-10 rounded-full border border-gray-200"
                            />
                          )}
                          <span className="font-medium">{row.user?.name}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{row.user?.institution || "-"}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{row.competitionId}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{row.interval}</td>
                        <td className="px-6 py-4 text-sm font-bold text-blue-600">{row.avgScore.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{row.bestScore.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{row.submissionsCount}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rank</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Institution</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Competition</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Interval</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Score</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {submissions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-8 text-center text-gray-500 text-lg"
                      >
                        No submissions found
                      </td>
                    </tr>
                  ) : (
                    submissions.map((s, index) => (
                      <tr key={s.id} className="hover:bg-gray-50 transition duration-150">
                        <td className="px-6 py-4 text-sm text-gray-900">{(page - 1) * 10 + index + 1}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 flex items-center gap-3">
                          {s.user?.avatarUrl && (
                            <img
                              src={s.user.avatarUrl}
                              alt={s.user.name}
                              className="w-10 h-10 rounded-full border border-gray-200"
                            />
                          )}
                          <span className="font-medium">{s.user?.name}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{s.user?.institution || "-"}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{s.competitionId}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{s.interval}</td>
                        <td className="px-6 py-4 text-sm font-bold text-blue-600">{s.overallScore.toFixed(1)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{s.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center items-center mt-8 space-x-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}