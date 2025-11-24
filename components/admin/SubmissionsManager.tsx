// components/admin/SubmissionsManager.tsx
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { clientAuth } from '@/lib/auth/clientAuth';

// Type definitions
interface Submission {
  id: string;
  competitionId: number;
  userId: string;
  interval: number;
  title: string;
  fileUrl: string;
  description?: string;
  overallScore?: number;
  creativityScore?: number;
  technicalScore?: number;
  aiToolUsageScore?: number;
  adherenceScore?: number;
  impactScore?: number;
  judgeComments?: string;
  evaluatedBy?: string;
  evaluatedAt?: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'EVALUATED' | 'REJECTED' | 'WINNER' | 'FINALIST';
  isAccessVerified: boolean;
  accessCheckError?: string;
  isDisqualified: boolean;
  disqualificationReason?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    institution?: string;
  };
}

interface SubmissionMessage {
  id: string;
  submissionId: string;
  content: string;
  isFromAdmin: boolean;
  createdAt: string;
  author?: { id: string; name: string; isAdmin?: boolean };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Filters {
  competitionId?: number;
  status?: string;
  interval?: number;
  isAccessVerified?: boolean;
  isDisqualified?: boolean;
  search?: string;
}

const SubmissionsManager: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<Filters>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showScoreModal, setShowScoreModal] = useState<boolean>(false);
  const [showMessageModal, setShowMessageModal] = useState<boolean>(false);
  const [bulkSelectMode, setBulkSelectMode] = useState<boolean>(false);
  const [selectedSubmissions, setSelectedSubmissions] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<SubmissionMessage[]>([]);
  const [messageDraft, setMessageDraft] = useState<string>('');
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);

  // Competition titles for display
  const competitionTitles: { [key: number]: string } = {
    1: 'AI Short Video',
    2: 'Creative Expression',
    3: 'Political Toons',
    4: 'Painting Competition',
  };

  // Fetch submissions with filters and pagination
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setIsLoading(true);
        const queryParams = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
          ...Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
          ),
        });

        const response = await clientAuth.authFetch(`/api/admin/submissions?${queryParams}`);

        if (!response.ok) {
          // throw new Error('Failed to fetch submissions');
        }

        const data = await response.json();
        setSubmissions(data.submissions);
        setPagination(data.pagination);
      } catch (error) {
        console.error('Error fetching submissions:', error);
        toast.error('Failed to load submissions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [pagination.page, pagination.limit, filters]);

  // Handle filter changes
  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handle bulk selection
  const handleBulkSelect = (submissionId: string) => {
    const newSelected = new Set(selectedSubmissions);
    if (newSelected.has(submissionId)) {
      newSelected.delete(submissionId);
    } else {
      newSelected.add(submissionId);
    }
    setSelectedSubmissions(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedSubmissions.size === submissions.length) {
      setSelectedSubmissions(new Set());
    } else {
      setSelectedSubmissions(new Set(submissions.map(s => s.id)));
    }
  };

  // Status color mapping
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'UNDER_REVIEW': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'EVALUATED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      case 'WINNER': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'FINALIST': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Handle submission scoring
  const handleScoreSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setShowScoreModal(true);
  };

  // Messaging helpers
  const loadMessages = async (submission: Submission) => {
    setSelectedSubmission(submission);
    setShowMessageModal(true);
    setLoadingMessages(true);
    try {
      const res = await clientAuth.authFetch(`/api/submissions/${submission.id}/messages`);
      const data = await res.json();
      if (res.ok) {
        setMessages(data.data || []);
      } else {
        toast.error(data.error || 'Failed to load messages');
      }
    } catch (error) {
      console.error('Failed to load messages', error);
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!selectedSubmission) return;
    if (!messageDraft.trim()) {
      toast.error('Message cannot be empty');
      return;
    }
    try {
      const res = await clientAuth.authFetch(`/api/submissions/${selectedSubmission.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageDraft }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to send message');
        return;
      }
      setMessageDraft('');
      await loadMessages(selectedSubmission);
    } catch (error) {
      console.error('Failed to send message', error);
      toast.error('Failed to send message');
    }
  };

  // Handle CSV export
  const handleExportCSV = async () => {
    try {
      const response = await clientAuth.authFetch('/api/admin/submissions/export');
      
      if (!response.ok) {
        throw new Error('Failed to export submissions');
      }

      // Get the CSV content
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `submissions-export-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Submissions exported successfully');
    } catch (error) {
      console.error('Error exporting submissions:', error);
      toast.error('Failed to export submissions');
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <div className="admin-card rounded-xl p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 font-poppins">Submissions Management</h2>
            <p className="text-gray-600 text-sm">Review, evaluate, and manage competition submissions</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={() => setBulkSelectMode(!bulkSelectMode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                bulkSelectMode
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {bulkSelectMode ? 'Cancel Bulk' : 'Bulk Actions'}
            </button>
            
            {bulkSelectMode && selectedSubmissions.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{selectedSubmissions.size} selected</span>
                <button className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                  Bulk Evaluate
                </button>
                <button className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                  Bulk Reject
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Competition</label>
            <select
              value={filters.competitionId || ''}
              onChange={(e) => handleFilterChange('competitionId', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Competitions</option>
              {Object.entries(competitionTitles).map(([id, title]) => (
                <option key={id} value={id}>{title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="EVALUATED">Evaluated</option>
              <option value="REJECTED">Rejected</option>
              <option value="WINNER">Winner</option>
              <option value="FINALIST">Finalist</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interval</label>
            <input
              type="number"
              min="1"
              value={filters.interval || ''}
              onChange={(e) => handleFilterChange('interval', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="All intervals"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="User name or email"
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleFilterChange('isAccessVerified', false)}
            className="px-3 py-1 text-xs bg-red-50 text-red-700 border border-red-200 rounded-full hover:bg-red-100 transition-colors"
          >
            Access Issues
          </button>
          <button
            onClick={() => handleFilterChange('status', 'PENDING')}
            className="px-3 py-1 text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full hover:bg-yellow-100 transition-colors"
          >
            Needs Review
          </button>
          <button
            onClick={() => setFilters({})}
            className="px-3 py-1 text-xs bg-gray-50 text-gray-700 border border-gray-200 rounded-full hover:bg-gray-100 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="admin-card rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
            <p className="text-gray-600">Loading submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600">No submissions found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {bulkSelectMode && (
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedSubmissions.size === submissions.length}
                          onChange={handleSelectAll}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </th>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competition</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interval</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                      {bulkSelectMode && (
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedSubmissions.has(submission.id)}
                            onChange={() => handleBulkSelect(submission.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate max-w-32" title={submission.user.name}>
                            {submission.user.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-32" title={submission.user.email}>
                            {submission.user.email}
                          </div>
                          {submission.user.institution && (
                            <div className="text-xs text-gray-400 truncate max-w-32" title={submission.user.institution}>
                              {submission.user.institution}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {competitionTitles[submission.competitionId] || `Competition ${submission.competitionId}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {submission.interval}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(submission.status)}`}>
                          {submission.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {submission.overallScore ? (
                          <div className="flex items-center gap-1">
                            <span className="text-amber-500">★</span>
                            <span className="font-medium">{submission.overallScore.toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {submission.isAccessVerified ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 border border-green-200">
                            ✓ Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 border border-red-200" title={submission.accessCheckError}>
                            ✗ Failed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <a
                            href={submission.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-blue-600 hover:text-blue-800 rounded transition-colors"
                            title="View submission"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </a>
                          <button
                            onClick={() => handleScoreSubmission(submission)}
                            className="p-1 text-green-600 hover:text-green-800 rounded transition-colors"
                            title="Score submission"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => loadMessages(submission)}
                            className="p-1 text-orange-600 hover:text-orange-800 rounded transition-colors"
                            title="Conversation"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h6M5 20l2-4h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} submissions
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          pagination.page === page
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Score Modal */}
      {showScoreModal && selectedSubmission && (
        <ScoreModal
          submission={selectedSubmission}
          onClose={() => {
            setShowScoreModal(false);
            setSelectedSubmission(null);
          }}
          onSave={(updatedSubmission) => {
            setSubmissions(prev =>
              prev.map(s => s.id === updatedSubmission.id ? updatedSubmission : s)
            );
            setShowScoreModal(false);
            setSelectedSubmission(null);
            toast.success('Submission scored successfully');
          }}
        />
      )}

      {/* Message Modal */}
      {showMessageModal && selectedSubmission && (
        <MessageModal
          submission={selectedSubmission}
          messages={messages}
          loading={loadingMessages}
          messageDraft={messageDraft}
          onClose={() => {
            setShowMessageModal(false);
            setSelectedSubmission(null);
          }}
          onChangeDraft={setMessageDraft}
          onRefresh={() => loadMessages(selectedSubmission)}
          onSend={sendMessage}
        />
      )}
    </div>
  );
};

// Score Modal Component
interface ScoreModalProps {
  submission: Submission;
  onClose: () => void;
  onSave: (submission: Submission) => void;
}

const ScoreModal: React.FC<ScoreModalProps> = ({ submission, onClose, onSave }) => {
  const [scores, setScores] = useState({
    creativityScore: submission.creativityScore || 0,
    technicalScore: submission.technicalScore || 0,
    aiToolUsageScore: submission.aiToolUsageScore || 0,
    adherenceScore: submission.adherenceScore || 0,
    impactScore: submission.impactScore || 0,
    judgeComments: submission.judgeComments || '',
    status: submission.status,
  });
  const [isLoading, setIsLoading] = useState(false);

  const overallScore = (scores.creativityScore + scores.technicalScore + scores.aiToolUsageScore + scores.adherenceScore + scores.impactScore) / 5;

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await clientAuth.authFetch(`/api/admin/submissions/${submission.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...scores,
          status: scores.status === 'PENDING' ? 'EVALUATED' : scores.status,
          overallScore,
          evaluatedBy: 'Current Admin', // Replace with actual admin name
        }),
      });

      if (!response.ok) {
        // throw new Error('Failed to update submission');
      }

      const updatedSubmission = await response.json();
      onSave(updatedSubmission);
    } catch (error) {
      console.error('Error updating submission:', error);
      toast.error('Failed to update submission scores');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[95vh] flex flex-col">
          {/* Modal Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Score Submission</h3>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal Body - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Submission Info */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="space-y-1 text-xs">
                <div><span className="font-medium">User:</span> {submission.user.name}</div>
                <div><span className="font-medium">Competition:</span> Competition {submission.competitionId}</div>
                <div><span className="font-medium">Interval:</span> {submission.interval}</div>
              </div>
              {submission.description && (
                <div className="mt-2">
                  <span className="font-medium text-xs">Description:</span>
                  <p className="text-gray-600 text-xs mt-1 line-clamp-2">{submission.description}</p>
                </div>
              )}
            </div>

            {/* Scoring Fields - Compact */}
            <div className="space-y-4">
              {[
                { key: 'creativityScore', label: 'Creativity' },
                { key: 'technicalScore', label: 'Technical' },
                { key: 'aiToolUsageScore', label: 'AI Usage' },
                { key: 'adherenceScore', label: 'Adherence' },
                { key: 'impactScore', label: 'Impact' }
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label} ({scores[key as keyof typeof scores]}/10)
                  </label>
                  <div className="flex items-center gap-1 flex-wrap">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setScores(prev => ({ ...prev, [key]: score }))}
                        className={`w-7 h-7 rounded-full text-xs font-medium transition-all ${
                          (scores[key as keyof typeof scores] as number) >= score
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Overall Score Display */}
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">Overall Score:</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-blue-600">{overallScore.toFixed(1)}</span>
                  <span className="text-blue-600">/10</span>
                </div>
              </div>
            </div>

            {/* Judge Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments
              </label>
              <textarea
                rows={3}
                value={scores.judgeComments}
                onChange={(e) => setScores(prev => ({ ...prev, judgeComments: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                placeholder="Add feedback..."
              />
            </div>

            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={scores.status}
                onChange={(e) => setScores(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="EVALUATED">Evaluated</option>
                <option value="WINNER">Winner</option>
                <option value="FINALIST">Finalist</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-4 py-3 border-t border-gray-200 flex gap-2 flex-shrink-0 bg-white rounded-b-xl">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
    );
};

// Message Modal Component
interface MessageModalProps {
  submission: Submission;
  messages: SubmissionMessage[];
  loading: boolean;
  messageDraft: string;
  onClose: () => void;
  onChangeDraft: (v: string) => void;
  onRefresh: () => void;
  onSend: () => void;
}

const MessageModal: React.FC<MessageModalProps> = ({
  submission,
  messages,
  loading,
  messageDraft,
  onClose,
  onChangeDraft,
  onRefresh,
  onSend,
}) => {
  const competitionTitles: { [key: number]: string } = {
    1: 'AI Short Video',
    2: 'Creative Expression',
    3: 'Political Toons',
    4: 'Painting Competition',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50" onClick={onClose}></div>
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[95vh] flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Submission Conversation</h3>
              <p className="text-xs text-gray-500">
                {submission.title} • {competitionTitles[submission.competitionId] || `Competition ${submission.competitionId}`}
              </p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors" title="Close">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-4 py-3 border-b border-gray-200 text-xs text-gray-700 space-y-1">
            <div><span className="font-semibold">User:</span> {submission.user.name} ({submission.user.email})</div>
            {submission.user.institution && (
              <div><span className="font-semibold">Institution:</span> {submission.user.institution}</div>
            )}
            <div className="flex items-center gap-2">
              <span className="font-semibold">File:</span>
              <a className="text-blue-600 hover:underline break-all" href={submission.fileUrl} target="_blank" rel="noreferrer">
                {submission.fileUrl}
              </a>
            </div>
            {submission.description && (
              <div className="text-gray-700">
                <span className="font-semibold">Description:</span> {submission.description}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-800">Messages</span>
              <button
                onClick={onRefresh}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            {loading ? (
              <div className="text-sm text-gray-500">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-sm text-gray-500">No messages yet.</div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`text-xs p-3 rounded-lg border ${
                    m.isFromAdmin ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${m.isFromAdmin ? 'text-indigo-700' : 'text-gray-800'}`}>
                      {m.author?.name || (m.isFromAdmin ? 'Admin' : 'User')}
                    </span>
                    {m.isFromAdmin && (
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[10px]">Admin</span>
                    )}
                    <span className="text-[10px] text-gray-500">{new Date(m.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="mt-1 text-gray-700 whitespace-pre-wrap">{m.content}</div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-gray-200 space-y-2">
            <label className="text-sm font-medium text-gray-800">Send a reply</label>
            <textarea
              rows={3}
              value={messageDraft}
              onChange={(e) => onChangeDraft(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
              placeholder="Write a reply to the participant..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={onSend}
                className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
              >
                Send Reply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionsManager;
