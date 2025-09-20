// pages/profile.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import SubmissionGroup from '@/components/profile/SubmissionGroup';
import ProfileHeader from '@/components/profile/ProfileHeader';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  institution?: string;
  avatarUrl?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Submission {
  id: string;
  category: string;
  week: number;
  date: string;
  scores: {
    creativity: number;
    technical: number;
    aiUsage: number;
    adherence: number;
    impact: number;
  };
  overall: number;
  comments: string | null;
  link: string;
  status: string;
  isDisqualified: boolean;
  disqualificationReason?: string;
  isVerified: boolean;
  accessError?: string;
  evaluatedBy?: string;
  evaluatedAt?: string;
  submittedAt: string;
}

interface GroupedSubmissions {
  [week: number]: Submission[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<GroupedSubmissions>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'submissions'>('info');

  useEffect(() => {
      // fetchUserData();
      fetchSubmissions();
  }, [router]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/me');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch user data');
      }

      setUser(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user data');
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/submissions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('vk_token')}`,
        },
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch submissions');
      }

      setSubmissions(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-800 to-red-800 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-800 to-red-800 flex items-center justify-center">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-orange-200/30 p-8 max-w-md mx-auto">
          <div className="text-center">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Profile</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Profile | Competition Platform</title>
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
        </div>

        <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-200 via-red-200 to-orange-100 bg-clip-text text-transparent mb-3" style={{fontFamily: 'Playfair Display, serif'}}>
                My Profile
              </h1>
              <p className="text-orange-200 text-base">
                Manage your account and track your competition submissions
              </p>
            </div>

            {/* Tabs */}
            <div className="mb-8 flex justify-center">
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-1.5 border border-orange-300/30">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('info')}
                    className={`px-8 py-3 font-semibold rounded-xl transition-all duration-300 ${
                      activeTab === 'info'
                        ? "bg-white text-red-900 shadow-lg transform scale-105"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    User Info
                  </button>
                  <button
                    onClick={() => setActiveTab('submissions')}
                    className={`px-8 py-3 font-semibold rounded-xl transition-all duration-300 ${
                      activeTab === 'submissions'
                        ? "bg-white text-red-900 shadow-lg transform scale-105"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    My Submissions
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            {activeTab === 'info' ? (
              <ProfileHeader user={user} />
            ) : (
              <div className="space-y-6">
                {Object.keys(submissions).length === 0 ? (
                  <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-orange-200/30 p-12 text-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Submissions Yet</h3>
                    <p className="text-gray-600 mb-6">You haven't submitted any entries to competitions yet.</p>
                    <a
                      href="/competitions"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
                    >
                      Browse Competitions
                    </a>
                  </div>
                ) : (
                  Object.entries(submissions)
                    .sort(([a], [b]) => parseInt(b) - parseInt(a))
                    .map(([week, weekSubmissions]) => (
                      <SubmissionGroup
                        key={week}
                        week={parseInt(week)}
                        submissions={weekSubmissions}
                      />
                    ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Protect the page with authentication
export async function getServerSideProps(context: any) {
  return {
    props: {
    },
  };
}