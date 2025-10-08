import { useEffect, useState } from "react";
import Head from "next/head";
import { clientAuth } from "@/lib/auth";
import { useRouter } from "next/router";

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
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null); // Replace 'any' with your user type

  useEffect(() => {
      const currentUser = clientAuth.getUser();
      const token = clientAuth.getToken();
      
      if (!currentUser || !token) {
        // Not authenticated - redirect to login
        router.push('/competition/login?message=' + encodeURIComponent('Please log in to access the dashboard'));
        return;
      }
      
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsLoading(false);
    }, [router]);

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

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  const getRankGlow = (rank: number) => {
    if (rank === 1) return "shadow-lg shadow-yellow-500/25 bg-gradient-to-r from-yellow-50/80 to-orange-50/80 border-yellow-200";
    if (rank === 2) return "shadow-lg shadow-gray-400/25 bg-gradient-to-r from-gray-50/80 to-slate-50/80 border-gray-200";
    if (rank === 3) return "shadow-lg shadow-orange-400/25 bg-gradient-to-r from-orange-50/80 to-amber-50/80 border-orange-200";
    return "hover:bg-gradient-to-r hover:from-red-50/50 hover:to-orange-50/50";
  };

  return (
    <>
      <Head>
        <title>Leaderboard | Competition Platform</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-800 to-red-800" style={{fontFamily: 'Inter, sans-serif'}}>
        {/* Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-red-600/10 rounded-full blur-3xl"></div>
          <div className="absolute top-2/3 left-1/6 w-64 h-64 bg-amber-600/15 rounded-full blur-3xl"></div>
          <div className="absolute top-1/5 right-1/3 w-72 h-72 bg-orange-700/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-200 via-red-200 to-orange-100 bg-clip-text text-transparent mb-3" style={{fontFamily: 'Playfair Display, serif'}}>
                Competition Leaderboard
              </h1>
              <p className="text-orange-200 text-base max-w-2xl mx-auto">
                Track performance across all competitions with real-time rankings and detailed analytics
              </p>
            </div>

            {/* Filters Card */}
            <div className="mb-6">
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-orange-200/30 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                  </svg>
                  Filters
                </h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Competition ID</label>
                    <input
                      type="number"
                      placeholder="Enter competition ID..."
                      value={competitionId}
                      onChange={(e) => setCompetitionId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Interval</label>
                    <input
                      type="number"
                      placeholder="Enter interval..."
                      value={interval}
                      onChange={(e) => setInterval(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => setPage(1)}
                      className="px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex justify-center">
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-1.5 border border-orange-300/30">
                <div className="flex">
                  <button
                    onClick={() => setTab("aggregated")}
                    className={`px-6 py-2.5 font-semibold rounded-xl transition-all duration-300 text-sm ${
                      tab === "aggregated"
                        ? "bg-white text-red-900 shadow-lg transform scale-105"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    Aggregated Leaderboard
                  </button>
                  <button
                    onClick={() => setTab("detailed")}
                    className={`px-6 py-2.5 font-semibold rounded-xl transition-all duration-300 text-sm ${
                      tab === "detailed"
                        ? "bg-white text-red-900 shadow-lg transform scale-105"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    Detailed Submissions
                  </button>
                </div>
              </div>
            </div>

            {/* Loading Spinner */}
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20"></div>
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent absolute top-0 left-0"></div>
                </div>
              </div>
            ) : tab === "aggregated" ? (
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-orange-200/30 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
                        <th className="px-4 py-3 text-left text-sm font-semibold">Rank</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Institution</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Competition</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Interval</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Avg Score</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Best Score</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Submissions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {aggregated.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-12 text-center">
                            <div className="flex flex-col items-center">
                              <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <p className="text-gray-500 text-base font-medium">No data found</p>
                              <p className="text-gray-400 text-sm">Try adjusting your filters</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        aggregated.map((row, i) => {
                          const rank = (page - 1) * 10 + i + 1;
                          const rankIcon = getRankIcon(rank);
                          const glowClass = getRankGlow(rank);
                          
                          return (
                            <tr key={row.user?.id || i} className={`transition-all duration-200 border ${glowClass}`}>
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-2">
                                  {rankIcon && <span className="text-lg">{rankIcon}</span>}
                                  <span className={`text-sm font-bold ${rank <= 3 ? 'text-red-700' : 'text-gray-700'}`}>
                                    #{rank}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-3">
                                  {row.user?.avatarUrl ? (
                                    <img
                                      src={row.user.avatarUrl}
                                      alt={row.user?.name}
                                      className="w-10 h-10 rounded-full border-2 border-white shadow-md object-cover"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-semibold text-sm">
                                      {row.user?.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-semibold text-gray-900 text-sm">{row.user?.name}</p>
                                    <p className="text-xs text-gray-500">ID: {row.user?.id}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-orange-50 text-orange-700 border border-orange-200">
                                  {row.user?.institution || "Not specified"}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-red-50 text-red-700 border border-red-200 font-medium">
                                  #{row.competitionId}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm text-gray-700 font-medium">{row.interval}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-base font-bold text-red-600">{row.avgScore.toFixed(2)}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm font-semibold text-orange-600">{row.bestScore.toFixed(2)}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-700 font-medium">
                                  {row.submissionsCount}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-orange-200/30 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
                        <th className="px-4 py-3 text-left text-sm font-semibold">Rank</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Institution</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Competition</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Interval</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Score</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {submissions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-12 text-center">
                            <div className="flex flex-col items-center">
                              <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <p className="text-gray-500 text-base font-medium">No submissions found</p>
                              <p className="text-gray-400 text-sm">Try adjusting your filters</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        submissions.map((s, index) => {
                          const rank = (page - 1) * 10 + index + 1;
                          const rankIcon = getRankIcon(rank);
                          const glowClass = getRankGlow(rank);

                          return (
                            <tr key={s.id} className={`transition-all duration-200 border ${glowClass}`}>
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-2">
                                  {rankIcon && <span className="text-lg">{rankIcon}</span>}
                                  <span className={`text-sm font-bold ${rank <= 3 ? 'text-red-700' : 'text-gray-700'}`}>
                                    #{rank}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-3">
                                  {s.user?.avatarUrl ? (
                                    <img
                                      src={s.user.avatarUrl}
                                      alt={s.user.name}
                                      className="w-10 h-10 rounded-full border-2 border-white shadow-md object-cover"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-semibold text-sm">
                                      {s.user?.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-semibold text-gray-900 text-sm">{s.user?.name}</p>
                                    <p className="text-xs text-gray-500">ID: {s.user?.id}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-orange-50 text-orange-700 border border-orange-200">
                                  {s.user?.institution || "Not specified"}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-red-50 text-red-700 border border-red-200 font-medium">
                                  #{s.competitionId}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm text-gray-700 font-medium">{s.interval}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-base font-bold text-red-600">{s.overallScore.toFixed(1)}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                  s.status.toLowerCase() === 'completed' 
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : s.status.toLowerCase() === 'pending'
                                    ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                    : 'bg-gray-50 text-gray-700 border border-gray-200'
                                }`}>
                                  {s.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-center items-center mt-8 space-x-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex items-center px-5 py-2.5 bg-white/90 backdrop-blur-sm text-red-700 font-medium rounded-xl hover:bg-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 border border-orange-200/50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              
              <div className="flex items-center space-x-3">
                <span className="px-5 py-2.5 bg-white/90 backdrop-blur-sm text-red-900 font-semibold rounded-xl border border-orange-200/50">
                  Page {page} of {totalPages}
                </span>
              </div>
              
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center px-5 py-2.5 bg-white/90 backdrop-blur-sm text-red-700 font-medium rounded-xl hover:bg-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 border border-orange-200/50"
              >
                Next
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}