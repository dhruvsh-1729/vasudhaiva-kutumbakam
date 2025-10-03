// components/profile/SubmissionGroup.tsx
import * as React from 'react';
import SubmissionCard from './SubmissionCard';
import type { Submission } from '@/pages/profile';

export default function SubmissionGroup({
  interval,
  submissions,
}: {
  interval: number;
  submissions: Submission[];
}) {
  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'PENDING').length,
    evaluated: submissions.filter(s => s.status === 'EVALUATED').length,
    winners: submissions.filter(s => s.status === 'WINNER' || s.status === 'FINALIST').length,
  };

  return (
    <section className="group relative">
      {/* Animated background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-300 blur-xl" />
      
      <div className="relative rounded-3xl backdrop-blur-lg bg-white/90 border border-orange-100 shadow-xl overflow-hidden">
        {/* Header with gradient accent */}
        <header className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 opacity-10" />
          <div className="relative px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Animated interval badge */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl blur-lg opacity-60 animate-pulse" />
                <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-xl">
                  <span className="text-2xl font-bold text-white">{interval}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                  Competition Interval {interval}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Track your creative journey and submission progress
                </p>
              </div>
            </div>

            {/* Stats badges */}
            <div className="flex gap-2">
              <div className="px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-red-100 border border-orange-200">
                <span className="text-sm font-semibold text-orange-700">{stats.total} Total</span>
              </div>
              {stats.winners > 0 && (
                <div className="px-4 py-2 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300 animate-pulse">
                  <span className="text-sm font-semibold text-yellow-700">🏆 {stats.winners}</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-8 pb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="flex h-full">
                    {stats.evaluated > 0 && (
                      <div 
                        className="bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000 ease-out"
                        style={{ width: `${(stats.evaluated / stats.total) * 100}%` }}
                      />
                    )}
                    {stats.pending > 0 && (
                      <div 
                        className="bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000 ease-out"
                        style={{ width: `${(stats.pending / stats.total) * 100}%` }}
                      />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500" />
                    <span className="text-xs text-gray-600">Evaluated ({stats.evaluated})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
                    <span className="text-xs text-gray-600">Pending ({stats.pending})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Submissions list with stagger animation */}
        <div className="p-6 space-y-4">
          {submissions.map((submission, index) => (
            <div
              key={submission.id}
              className="animate-slideIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <SubmissionCard submission={submission} />
            </div>
          ))}
        </div>

        {/* Footer with action */}
        <div className="px-8 py-4 bg-gradient-to-r from-orange-50 to-red-50 border-t border-orange-100">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Keep pushing your creative boundaries! 🎨
            </p>
            {/* <button className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 group">
              <span>View Analytics</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button> */}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  );
}