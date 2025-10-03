// components/profile/SubmissionCard.tsx
import * as React from 'react';
import type { Submission } from '@/pages/profile';

const statusConfig = {
  PENDING: {
    gradient: 'from-amber-400 to-orange-500',
    bg: 'from-amber-50 to-orange-50',
    text: 'text-amber-700',
    icon: '⏳',
  },
  UNDER_REVIEW: {
    gradient: 'from-blue-400 to-indigo-500',
    bg: 'from-blue-50 to-indigo-50',
    text: 'text-blue-700',
    icon: '👀',
  },
  EVALUATED: {
    gradient: 'from-green-400 to-emerald-500',
    bg: 'from-green-50 to-emerald-50',
    text: 'text-green-700',
    icon: '✅',
  },
  REJECTED: {
    gradient: 'from-rose-400 to-red-500',
    bg: 'from-rose-50 to-red-50',
    text: 'text-rose-700',
    icon: '❌',
  },
  WINNER: {
    gradient: 'from-yellow-400 to-amber-500',
    bg: 'from-yellow-50 to-amber-50',
    text: 'text-yellow-700',
    icon: '🏆',
  },
  FINALIST: {
    gradient: 'from-purple-400 to-pink-500',
    bg: 'from-purple-50 to-pink-50',
    text: 'text-purple-700',
    icon: '🌟',
  },
};

const ScoreBar = ({ label, value, color }: { label: string; value?: number | null; color: string }) => {
  const percentage = value ? (value / 10) * 100 : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{value ?? '—'}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default function SubmissionCard({ submission }: { submission: Submission }) {
  const [open, setOpen] = React.useState(false);
  const status = statusConfig[submission.status] || statusConfig.PENDING;

  const submittedOn = new Date(submission.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="group relative">
      {/* Hover glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${status.gradient} rounded-2xl opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300`} />
      
      <div className="relative rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Status accent bar */}
        <div className={`h-1 bg-gradient-to-r ${status.gradient}`} />
        
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-6 lg:items-start lg:justify-between">
            <div className="flex-1 space-y-4">
              {/* Status and badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r ${status.bg} border border-opacity-50 ${status.text} text-sm font-semibold shadow-sm`}>
                  <span className="text-base">{status.icon}</span>
                  {submission.status.replace('_', ' ')}
                </span>
                
                {submission.isDisqualified && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-700 text-sm font-semibold animate-pulse">
                    ⚠️ Disqualified
                  </span>
                )}
                
                <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium ${
                  submission.isAccessVerified 
                    ? 'bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 text-emerald-700'
                    : 'bg-gray-50 border border-gray-200 text-gray-600'
                }`}>
                  {submission.isAccessVerified ? '🔓 Verified' : '🔒 Unverified'}
                </span>
              </div>

              {/* Competition info */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">#{submission.competitionId}</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Competition ID</p>
                    <p className="font-semibold text-gray-900">{submission.competitionId}</p>
                  </div>
                </div>
                
                {submission.description && (
                  <p className="text-gray-600 line-clamp-2 bg-gradient-to-r from-orange-50 to-transparent p-3 rounded-lg">
                    {submission.description}
                  </p>
                )}
              </div>

              {/* Timestamp */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Submitted {submittedOn}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <a
                href={submission.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group/btn relative overflow-hidden rounded-xl border-2 border-orange-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-orange-300 transition-all duration-200"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-100 to-red-100 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-200" />
              </a>
              
              <button
                onClick={() => setOpen(!open)}
                className="group/btn relative overflow-hidden rounded-xl bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {open ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Hide
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Details
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200" />
              </button>
            </div>
          </div>

          {/* Expandable details */}
          {open && (
            <div className="mt-6 pt-6 border-t border-gray-100 animate-slideDown">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Scores section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    Performance Scores
                  </h4>
                  
                  <div className="space-y-3 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
                    <ScoreBar label="Overall Score" value={submission.overallScore} color="from-red-400 to-orange-500" />
                    <ScoreBar label="Creativity" value={submission.creativityScore} color="from-purple-400 to-pink-500" />
                    <ScoreBar label="Technical Excellence" value={submission.technicalScore} color="from-blue-400 to-indigo-500" />
                    <ScoreBar label="AI Tool Usage" value={submission.aiToolUsageScore} color="from-emerald-400 to-teal-500" />
                    <ScoreBar label="Theme Adherence" value={submission.adherenceScore} color="from-yellow-400 to-amber-500" />
                    <ScoreBar label="Impact & Innovation" value={submission.impactScore} color="from-rose-400 to-red-500" />
                  </div>
                </div>

                {/* Review section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    Review Details
                  </h4>
                  
                  <div className="space-y-3 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                    <div className="flex items-center justify-between py-2 border-b border-indigo-100">
                      <span className="text-sm font-medium text-gray-600">Evaluated By</span>
                      <span className="text-sm font-semibold text-gray-900">{submission.evaluatedBy || 'Pending'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-2 border-b border-indigo-100">
                      <span className="text-sm font-medium text-gray-600">Evaluation Date</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {submission.evaluatedAt ? new Date(submission.evaluatedAt).toLocaleDateString() : 'Pending'}
                      </span>
                    </div>
                    
                    {submission.judgeComments && (
                      <div className="pt-2">
                        <p className="text-sm font-medium text-gray-600 mb-2">Judge Feedback</p>
                        <p className="text-sm text-gray-800 bg-white p-3 rounded-lg italic">
                          "{submission.judgeComments}"
                        </p>
                      </div>
                    )}
                    
                    {submission.isDisqualified && submission.disqualificationReason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm font-medium text-red-700 mb-1">⚠️ Disqualification Reason</p>
                        <p className="text-sm text-red-600">{submission.disqualificationReason}</p>
                      </div>
                    )}
                    
                    {submission.accessCheckError && (
                      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm font-medium text-amber-700 mb-1">🔒 Access Issue</p>
                        <p className="text-sm text-amber-600">{submission.accessCheckError}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            max-height: 1000px;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}