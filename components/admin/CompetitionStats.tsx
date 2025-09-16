// components/admin/CompetitionStats.tsx
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Type definitions
interface CompetitionStatsData {
  totalUsers: number;
  totalSubmissions: number;
  pendingReviews: number;
  currentInterval: number;
  submissionsThisInterval: number;
  averageScore: number;
  topPerformers: Array<{
    id: string;
    name: string;
    email: string;
    submissionsCount: number;
    averageScore: number;
  }>;
  competitionBreakdown: Array<{
    competitionId: number;
    title: string;
    submissions: number;
    averageScore: number;
  }>;
  intervalStats: Array<{
    interval: number;
    submissions: number;
    avgScore: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'submission' | 'user_registration' | 'evaluation';
    message: string;
    timestamp: string;
    user?: {
      name: string;
      email: string;
    };
  }>;
}

const CompetitionStats: React.FC = () => {
  const [stats, setStats] = useState<CompetitionStatsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Fetch competition statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/admin/stats?timeRange=${timeRange}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('vk_token')}`,
          },
        });

        if (!response.ok) {
          // throw new Error('Failed to fetch statistics');
          console.error('Failed to fetch statistics, using dummy data for demo.');
        }

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
        toast.error('Failed to load statistics');
        
        // Set dummy data for demo purposes
        setStats({
          totalUsers: 247,
          totalSubmissions: 89,
          pendingReviews: 12,
          currentInterval: 3,
          submissionsThisInterval: 34,
          averageScore: 7.8,
          topPerformers: [
            {
              id: '1',
              name: 'Alice Johnson',
              email: 'alice@example.com',
              submissionsCount: 5,
              averageScore: 9.2,
            },
            {
              id: '2',
              name: 'Bob Chen',
              email: 'bob@example.com',
              submissionsCount: 4,
              averageScore: 8.9,
            },
            {
              id: '3',
              name: 'Carol Davis',
              email: 'carol@example.com',
              submissionsCount: 3,
              averageScore: 8.7,
            },
          ],
          competitionBreakdown: [
            {
              competitionId: 1,
              title: 'AI Short Video',
              submissions: 45,
              averageScore: 8.1,
            },
            {
              competitionId: 2,
              title: 'Lextoons',
              submissions: 28,
              averageScore: 7.6,
            },
            {
              competitionId: 3,
              title: 'Political Toons',
              submissions: 16,
              averageScore: 7.9,
            },
          ],
          intervalStats: [
            { interval: 1, submissions: 28, avgScore: 7.5 },
            { interval: 2, submissions: 35, avgScore: 7.8 },
            { interval: 3, submissions: 26, avgScore: 8.1 },
          ],
          recentActivity: [
            {
              id: '1',
              type: 'submission',
              message: 'New submission received for AI Short Video',
              timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
              user: { name: 'John Doe', email: 'john@example.com' },
            },
            {
              id: '2',
              type: 'evaluation',
              message: 'Submission evaluated with score 8.5',
              timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            },
            {
              id: '3',
              type: 'user_registration',
              message: 'New user registered',
              timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
              user: { name: 'Jane Smith', email: 'jane@example.com' },
            },
          ],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [timeRange]);

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getActivityIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'submission':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'evaluation':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      case 'user_registration':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="admin-card rounded-xl p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }, (_, j) => (
                  <div key={j} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="admin-card rounded-xl p-6 text-center">
        <p className="text-gray-600">Failed to load statistics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-poppins">Competition Overview</h2>
          <p className="text-gray-600 text-sm">Real-time analytics and performance metrics</p>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Time Range:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="admin-card rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalUsers?.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="admin-card rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalSubmissions?.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="admin-card rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingReviews}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="admin-card rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.averageScore?.toFixed(1)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Current Interval Status */}
      <div className="admin-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Current Interval Status</h3>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
            Interval {stats.currentInterval}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.submissionsThisInterval}</p>
            <p className="text-sm text-gray-600 mt-1">Submissions This Interval</p>
          </div>
          
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{((stats.submissionsThisInterval / stats.totalSubmissions) * 100).toFixed(1)}%</p>
            <p className="text-sm text-gray-600 mt-1">Of Total Submissions</p>
          </div>
          
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{stats.pendingReviews}</p>
            <p className="text-sm text-gray-600 mt-1">Awaiting Review</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competition Breakdown */}
        <div className="admin-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Competition Breakdown</h3>
          <div className="space-y-4">
            {stats.competitionBreakdown?.map((comp) => (
              <div key={comp.competitionId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{comp.title}</p>
                  <p className="text-sm text-gray-600">{comp.submissions} submissions</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{comp.averageScore.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">avg score</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="admin-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
          <div className="space-y-4">
            {stats.topPerformers?.map((performer, index) => (
              <div key={performer.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{performer.name}</p>
                  <p className="text-sm text-gray-600 truncate">{performer.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{performer.averageScore.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">{performer.submissionsCount} submissions</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interval Performance Chart */}
      <div className="admin-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Interval Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.intervalStats?.map((interval) => (
            <div key={interval.interval} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Interval {interval.interval}</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{interval.submissions}</p>
                  <p className="text-xs text-blue-700">submissions</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-indigo-600">{interval.avgScore.toFixed(1)}</p>
                  <p className="text-xs text-indigo-700">avg score</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="admin-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View All
          </button>
        </div>
        
        <div className="space-y-4">
          {stats.recentActivity?.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activity.type === 'submission' ? 'bg-green-100 text-green-600' :
                activity.type === 'evaluation' ? 'bg-yellow-100 text-yellow-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.message}</p>
                {activity.user && (
                  <p className="text-xs text-gray-600 mt-1">
                    by {activity.user.name} ({activity.user.email})
                  </p>
                )}
              </div>
              
              <div className="text-xs text-gray-500 whitespace-nowrap">
                {formatTimeAgo(activity.timestamp)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompetitionStats;