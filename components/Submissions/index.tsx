import { getCompetitionById } from "@/data/competitions";
import React, { useEffect, useState } from "react";

type Submission = {
  id: string;
  title: string;
  competitionId: number;
  interval?: number;
  status: string;
  isDisqualified?: boolean;
  disqualificationReason?: string | null;
  overallScore?: number | null;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  fileUrl: string;
  // Score fields
  creativityScore?: number | null;
  technicalScore?: number | null;
  aiToolUsageScore?: number | null;
  adherenceScore?: number | null;
  impactScore?: number | null;
  // Evaluation fields
  evaluatedBy?: string;
  evaluatedAt?: string;
  judgeComments?: string;
  // Access verification
  isAccessVerified?: boolean;
  accessCheckError?: string | null;
};

const statusColors: Record<string, string> = {
  ACCEPTED: "bg-green-100 text-green-700 border-green-200",
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
  EVALUATED: "bg-blue-100 text-blue-700 border-blue-200",
  WINNER: "bg-purple-100 text-purple-700 border-purple-200",
  FINALIST: "bg-indigo-100 text-indigo-700 border-indigo-200",
  DISQUALIFIED: "bg-gray-100 text-gray-700 border-gray-200",
};

const CompactSubmissions: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("vk_token") || "";

  useEffect(() => {
    fetch("/api/submissions", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // data.submissions is an object with interval keys and arrays of submissions as values
        // Flatten all arrays into a single array
        console.log(data);
        const allSubmissions = Object.values(data.data).flat() as Submission[];
        // Sort by createdAt (most recent first)
        const sortedSubmissions = allSubmissions.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setSubmissions(sortedSubmissions);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }) + " today";
    } else if (diffDays === 1) {
      return "yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="mt-6 max-w-4xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Submissions</h2>
          <p className="text-sm text-gray-500 mt-1">Track all your competition entries</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
            {submissions.length} submission{submissions.length !== 1 && "s"}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <span className="text-gray-500 mt-4 block">Loading submissions...</span>
          </div>
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
            <svg className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No submissions yet</h3>
          <p className="mt-2 text-sm text-gray-500">Your competition entries will appear here once submitted</p>
          <button className="mt-6 inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-md text-sm font-medium">
            Browse Competitions →
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {submissions.map((s) => (
            <div key={s.id} className="bg-white rounded-lg border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-8 w-8 rounded bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xs font-bold">
                  {getCompetitionById(s.competitionId)?.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">{getCompetitionById(s.competitionId)?.title}</span>
                    {s.interval && <span className="text-xs text-gray-400">#{s.interval}</span>}
                    <span className={`px-2 py-0.5 rounded text-xs border ${statusColors[s.status] || statusColors.PENDING}`}>
                      {formatStatus(s.status)}
                    </span>
                    {s.isDisqualified && (
                      <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700 border border-red-200">DQ</span>
                    )}
                    {s.overallScore != null && (
                      <span className="px-2 py-0.5 rounded text-xs bg-orange-50 border border-orange-200 text-orange-700 font-semibold">
                        {s.overallScore}/10
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {s.description}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {formatDate(s.createdAt)}
                    {s.evaluatedAt && <> • {formatDate(s.evaluatedAt)}</>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <a href={s.fileUrl} target="_blank" rel="noopener noreferrer"
                  className="px-2 py-1 text-xs text-gray-600 border rounded hover:bg-gray-50">View</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompactSubmissions;