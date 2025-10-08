// pages/profile.tsx
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { getCompetitionById } from '@/data/competitions';
import Header from '@/components/Header';
import { clientAuth } from '@/lib/auth';
import { useRouter } from 'next/router';
import Link from 'next/link';

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  institution?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Submission = {
  id: string;
  competitionId: number;
  interval: number;
  fileUrl: string;
  description?: string | null;
  overallScore?: number | null;
  creativityScore?: number | null;
  technicalScore?: number | null;
  aiToolUsageScore?: number | null;
  adherenceScore?: number | null;
  impactScore?: number | null;
  judgeComments?: string | null;
  evaluatedBy?: string | null;
  evaluatedAt?: string | null;
  status: 'PENDING' | 'UNDER_REVIEW' | 'EVALUATED' | 'REJECTED' | 'WINNER' | 'FINALIST';
  isDisqualified: boolean;
  disqualificationReason?: string | null;
  isAccessVerified: boolean;
  accessCheckError?: string | null;
  createdAt: string;
  updatedAt: string;
};

type GroupedSubmissions = Record<number, Submission[]>;

const statusColors = {
  PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
  UNDER_REVIEW: 'bg-blue-100 text-blue-700 border-blue-200',
  EVALUATED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-100 text-red-700 border-red-200',
  WINNER: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800 border-amber-300',
  FINALIST: 'bg-purple-100 text-purple-700 border-purple-200',
};

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<GroupedSubmissions>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ phone: '', institution: '' });
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
    (async () => {
      try {
        const token = localStorage.getItem('vk_token') || '';
        const [uRes, sRes] = await Promise.all([
          fetch('/api/user/me', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/submissions', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const uJson = await uRes.json();
        const sJson = await sRes.json();

        if (!uRes.ok) throw new Error(uJson?.message || 'Failed to fetch user');
        if (!sRes.ok) throw new Error(sJson?.message || 'Failed to fetch submissions');

        const userData = uJson.data as User;
        setUser(userData);
        setEditForm({ 
          phone: userData.phone || '', 
          institution: userData.institution || '' 
        });
        setSubmissions(sJson.data as GroupedSubmissions);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('vk_token') || '';
      const response = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) throw new Error('Failed to update profile');
      
      const updated = await response.json();
      setUser(updated.data);
      setIsEditing(false);
    } catch (e) {
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Error loading profile</h2>
          <p className="mt-2 text-sm text-gray-600">{error}</p>
          <button
            onClick={() => location.reload()}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const allSubmissions = Object.entries(submissions)
    .sort(([a], [b]) => Number(b) - Number(a))
    .flatMap(([_, subs]) => subs);

  return (
    <>
      <Head>
        <title>Profile • VK Competition</title>
      </Head>

      <Header />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 h-20 sm:h-24" />
            <div className="px-4 sm:px-6 lg:px-8 pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10 sm:-mt-12">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl border-4 border-white shadow-md object-cover"
                    />
                  ) : (
                    <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl border-4 border-white shadow-md bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-2xl sm:text-3xl font-bold text-white">
                      {user?.name?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex flex-row items-center gap-3 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{user?.name}</h1>
                  <p className="text-gray-600 text-sm sm:text-base mt-1">{user?.email}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {user?.isEmailVerified && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    )}
                    {user?.isAdmin && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Admin
                      </span>
                    )}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      Joined {new Date(user?.createdAt || '').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Edit Button */}
                {/* <div className="flex gap-2">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({ 
                            phone: user?.phone || '', 
                            institution: user?.institution || '' 
                          });
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div> */}
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{user?.phone || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Institution
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.institution}
                      onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      placeholder="Enter institution"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{user?.institution || 'Not specified'}</p>
                  )}
                </div>
                {/* <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    User ID
                  </label>
                  <p className="text-sm font-mono text-gray-600">{user?.id.slice(0, 8)}...</p>
                </div> */}
              </div>
            </div>
          </div>

          {/* Submissions Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Submissions</h2>
              <span className="text-sm text-gray-500">
                {allSubmissions.length} total submission{allSubmissions.length !== 1 && 's'}
              </span>
            </div>

            {allSubmissions.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-base font-medium text-gray-900">No submissions yet</h3>
                <p className="mt-1 text-sm text-gray-500">Your competition submissions will appear here</p>
                <Link
                  href="/competition/main"
                  className="mt-4 inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                >
                  Browse Competitions
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(submissions)
                  .sort(([a], [b]) => Number(b) - Number(a))
                  .map(([interval, subs]) => (
                    <div key={interval} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="px-4 sm:px-6 py-3 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-gray-900">Week {interval}</h3>
                          <span className="text-xs text-gray-500">{subs.length} submission{subs.length !== 1 && 's'}</span>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {subs.map((submission) => (
                          <div key={submission.id} className="p-4 sm:px-6">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 flex gap-2 items-center mr-3">
                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-sm shadow">
                                      #{submission.competitionId}
                                    </div>
                                    <span className="mt-1 text-xl text-gray-600 flex items-center gap-1 text-center">
                                      <span>{getCompetitionById(submission.competitionId)?.icon}</span>
                                      <span className="font-medium">{getCompetitionById(submission.competitionId)?.title} Submission</span>
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${statusColors[submission.status]}`}>
                                        {submission.status.replace('_', ' ')}
                                      </span>
                                      {submission.isDisqualified && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                                          Disqualified
                                        </span>
                                      )}
                                      {submission.overallScore && (
                                        <span className="text-xs font-medium text-gray-500">
                                          Score: {submission.overallScore}/10
                                        </span>
                                      )}
                                    </div>
                                    {submission.description && (
                                      <p className="text-sm text-gray-600 line-clamp-1">{submission.description}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                      Submitted {new Date(submission.createdAt).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                </div>

                                {/* Expandable Details */}
                                {expandedSubmission === submission.id && (
                                  <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      {/* Scores */}
                                      {(
                                        submission.overallScore !== null ||
                                        submission.creativityScore !== null ||
                                        submission.technicalScore !== null ||
                                        submission.aiToolUsageScore !== null ||
                                        submission.adherenceScore !== null ||
                                        submission.impactScore !== null
                                      ) && (
                                        <div>
                                          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Scores</h4>
                                          <div className="space-y-1 text-sm">
                                            {submission.overallScore !== null && (
                                              <div className="flex justify-between">
                                                <span className="text-gray-600">Overall</span>
                                                <span className="font-medium">{submission.overallScore}/10</span>
                                              </div>
                                            )}
                                            {submission.creativityScore !== null && (
                                              <div className="flex justify-between">
                                                <span className="text-gray-600">Creativity</span>
                                                <span className="font-medium">{submission.creativityScore}/10</span>
                                              </div>
                                            )}
                                            {submission.technicalScore !== null && (
                                              <div className="flex justify-between">
                                                <span className="text-gray-600">Technical</span>
                                                <span className="font-medium">{submission.technicalScore}/10</span>
                                              </div>
                                            )}
                                            {submission.aiToolUsageScore !== null && (
                                              <div className="flex justify-between">
                                                <span className="text-gray-600">AI Tool Usage</span>
                                                <span className="font-medium">{submission.aiToolUsageScore}/10</span>
                                              </div>
                                            )}
                                            {submission.adherenceScore !== null && (
                                              <div className="flex justify-between">
                                                <span className="text-gray-600">Adherence</span>
                                                <span className="font-medium">{submission.adherenceScore}/10</span>
                                              </div>
                                            )}
                                            {submission.impactScore !== null && (
                                              <div className="flex justify-between">
                                                <span className="text-gray-600">Impact</span>
                                                <span className="font-medium">{submission.impactScore}/10</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Review Info */}
                                      {(submission.evaluatedBy || submission.judgeComments) && (
                                        <div>
                                          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Review</h4>
                                          <div className="space-y-1 text-sm">
                                            {submission.evaluatedBy && (
                                              <div>
                                                <span className="text-gray-600">Reviewer: </span>
                                                <span className="font-medium">{submission.evaluatedBy}</span>
                                              </div>
                                            )}
                                            {submission.judgeComments && (
                                              <p className="text-gray-600 italic">"{submission.judgeComments}"</p>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                <a
                                  href={submission.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                  View File
                                </a>
                                <button
                                  onClick={() => setExpandedSubmission(
                                    expandedSubmission === submission.id ? null : submission.id
                                  )}
                                  className="px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                                >
                                  {expandedSubmission === submission.id ? 'Hide' : 'Details'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}