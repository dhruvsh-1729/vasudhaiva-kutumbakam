// components/CompetitionList.tsx
import Link from 'next/link';
import { competitions } from '../data/competitions';

// Type definitions
interface Competition {
  id: number;
  title: string;
  description: string;
  icon: string;
  deadline?: string;
  category?: string;
  status?: 'active' | 'upcoming' | 'completed';
}

interface PrizeInfo {
  position: number;
  amount: string;
  color: string;
  bgColor: string;
  textColor: string;
}

interface CompetitionStats {
  label: string;
  value: string;
  bgColor: string;
  textColor: string;
}

const CompetitionList: React.FC = () => {
  // Prize information configuration
  const prizeInfo1: PrizeInfo[] = [
    { position: 1, amount: '₹37,500', color: 'yellow-400', bgColor: 'yellow-600', textColor: 'yellow-700' },
    { position: 2, amount: '₹22,500', color: 'gray-400', bgColor: 'gray-600', textColor: 'gray-700' },
    { position: 3, amount: '₹15,000', color: 'amber-600', bgColor: 'orange-700', textColor: 'amber-700' }
  ]
  const prizeInfo2: PrizeInfo[] = [
    { position: 1, amount: '₹25,000', color: 'yellow-400', bgColor: 'yellow-600', textColor: 'yellow-700' },
    { position: 2, amount: '₹15,000', color: 'gray-400', bgColor: 'gray-600', textColor: 'gray-700' },
    { position: 3, amount: '₹10,00', color: 'amber-600', bgColor: 'orange-700', textColor: 'amber-700' }
  ];

  const prizeInfo4: PrizeInfo[] = [
    { position: 1, amount: '₹37,500', color: 'yellow-400', bgColor: 'yellow-600', textColor: 'yellow-700' },
    { position: 2, amount: '₹22,500', color: 'gray-400', bgColor: 'gray-600', textColor: 'gray-700' },
    { position: 3, amount: '₹15,000', color: 'amber-600', bgColor: 'orange-700', textColor: 'amber-700' }
  ];

  return (
    <section className="w-full relative">
      {/* Custom Fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
        
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-crimson { font-family: 'Crimson Text', serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
        
        .competition-gradient {
          background: linear-gradient(135deg, #FF8C00, #D2691E, #CC5500);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .compact-container {
          contain: layout style;
        }
      `}</style>

      <div className="compact-container p-0">
      </div>
        {/* Compact Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-8 h-0.5 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"></div>
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div className="w-8 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"></div>
          </div>
          
          <h2 className="font-playfair text-3xl font-bold mb-3 leading-tight">
            <span className="competition-gradient">Active Competitions</span>
          </h2>
          
          <p className="font-crimson text-sm text-orange-700/80 max-w-md mx-auto leading-relaxed">
            Join our weekly challenges and express your creativity through the universal language of art and innovation
          </p>
          
          {/* Compact Weekly Badge */}
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-orange-200/50 shadow-md">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="font-inter font-medium text-orange-700 text-xs">Weekly Challenges • New Problems Every Monday</span>
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          </div>
        </div>

        {/* Compact Competition Cards */}
        <div className="space-y-6">
          {competitions.map((competition: Competition, index: number) => {
            // Generate competition stats for each competition
            const competitionStats: CompetitionStats[] = [
              { label: 'Week 1', value: 'Week 1', bgColor: 'bg-orange-100', textColor: 'text-orange-700' },
              { label: '7 Days Left', value: '7 Days Left', bgColor: 'bg-amber-100', textColor: 'text-amber-700' }
            ];

            return (
              <div
                key={competition.id}
                className="group relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-orange-100/50 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Card Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-transparent to-amber-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 p-6">
                  {/* Competition Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-3xl filter drop-shadow-md">
                      {competition.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-playfair text-xl font-bold text-gray-900 group-hover:text-orange-800 transition-colors duration-300">
                          {competition.title}
                        </h3>
                        <div className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-200 rounded-full">
                          <span className="font-inter text-xs font-bold text-orange-700">#{competition.id}</span>
                        </div>
                      </div>
                      
                      <p className="font-inter text-gray-700 text-sm leading-relaxed mb-3">
                        {competition.description}
                      </p>
                      
                      {/* Compact Challenge Info */}
                      <div className="flex flex-wrap items-center gap-4 text-xs mb-4">
                        <div className="flex items-center gap-1 text-orange-600">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-inter font-medium">Weekly Format: 7 days per challenge</span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-red-600">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                          </svg>
                          <span className="font-inter font-medium">Deadline: {competition.deadline || 'Ongoing'}</span>
                        </div>
                      </div>

                      {/* Prize Information */}
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-3 mb-4 border border-yellow-200/50">
                        <h4 className="font-playfair font-semibold text-orange-800 text-sm mb-2">Competition Prizes</h4>
                        <div className="flex justify-between items-center text-xs">
                          {(competition.id === 1 ? prizeInfo1 : prizeInfo2).map((prize: PrizeInfo) => (
                            <div key={prize.position} className="flex items-center gap-1">
                              <div
                                className={`w-4 h-4 bg-gradient-to-br from-${prize.color} to-${prize.bgColor} rounded-full flex items-center justify-center`}
                              >
                                <span className="text-white text-xs font-bold">{prize.position}</span>
                              </div>
                              <span className={`font-inter font-medium text-${prize.textColor}`}>
                                {prize.amount}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      
                      {/* Action Section */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <Link href={`/competitions/${competition.id}`}>
                            <button className="bg-gradient-to-r cursor-pointer from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-inter font-semibold py-2 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] text-sm">
                              <div className="flex items-center gap-2">
                                <span>View Details</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </button>
                          </Link>
                          
                          {/* Quick Stats */}
                          <div className="flex items-center gap-2 text-xs">
                            {competitionStats.map((stat: CompetitionStats, statIndex: number) => (
                              <div key={statIndex} className={`${stat.bgColor} rounded-lg px-2 py-1`}>
                                <span className={`font-inter font-bold ${stat.textColor}`}>{stat.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        
    </section>
  );
};

export default CompetitionList;


{/* Submissions Count
<div className="flex items-center gap-1 mt-2 ml-1 sm:mt-0 text-gray-600">
<span className="text-lg">👥</span>
<span className="font-inter text-sm font-medium">221 submitted</span>
</div> */}