import React from 'react';
import SubmissionCard from './SubmissionCard';

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

interface SubmissionGroupProps {
  week: number;
  submissions: Submission[];
}

const SubmissionGroup: React.FC<SubmissionGroupProps> = ({ week, submissions }) => {
  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-orange-200/30 overflow-hidden">
      {/* Week Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white" style={{fontFamily: 'Playfair Display, serif'}}>
              Week {week}
            </h3>
            <p className="text-orange-100">
              {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="bg-white/20 rounded-full px-4 py-2">
            <span className="text-white font-semibold">
              Week {week}
            </span>
          </div>
        </div>
      </div>

      {/* Submissions */}
      <div className="p-6 space-y-4">
        {submissions.map((submission) => (
          <SubmissionCard key={submission.id} submission={submission} />
        ))}
      </div>
    </div>
  );
};

export default SubmissionGroup;
