// components/NoticeBoard.tsx
import React, { useState, useEffect } from 'react';

// Type definitions
interface Announcement {
  id: number;
  type: 'important' | 'winner' | 'normal';
  title: string;
  content: string;
  date: string;
  createdAt: string; // ISO date string for sorting
}

interface NoticeBoardProps {
  // Optional prop to override API endpoint
  apiEndpoint?: string;
}

const NoticeBoard: React.FC<NoticeBoardProps> = ({ 
  apiEndpoint = '/api/announcements' 
}) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch announcements from backend
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(apiEndpoint);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch announcements: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Sort by newest first
      const sortedAnnouncements = data.sort((a: Announcement, b: Announcement) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setAnnouncements(sortedAnnouncements);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError(err instanceof Error ? err.message : 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  // Initial load and periodic refresh
  useEffect(() => {
    fetchAnnouncements();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchAnnouncements, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [apiEndpoint]);

  const getAnnouncementIcon = (type: Announcement['type']) => {
    switch (type) {
      case 'important':
        return (
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="absolute inset-0 w-8 h-8 bg-red-400 rounded-lg animate-ping opacity-20"></div>
          </div>
        );
      case 'winner':
        return (
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md winner-sparkle">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l5.5 7.5L16 3m-2.5 14.5L16 21l-5.5-7.5L5 21l2.5-3.5z" />
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString; // Fallback to original string if parsing fails
    }
  };

  return (
    <section id="announcements" className="relative p-4">
      {/* Custom Fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
        
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
        
        .notice-gradient {
          background: linear-gradient(135deg, #FF8C00, #D2691E, #CC5500);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .announcement-shimmer {
          position: relative;
          overflow: hidden;
        }
        
        .announcement-shimmer::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 140, 0, 0.1), transparent);
          transition: left 0.6s ease;
        }
        
        .announcement-shimmer:hover::before {
          left: 100%;
        }

        .winner-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }

        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }

        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 140, 0, 0.3) transparent;
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: rgba(255, 140, 0, 0.3);
          border-radius: 2px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 140, 0, 0.5);
        }
      `}</style>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <h2 className="font-playfair text-lg font-bold notice-gradient">
            Announcements & Updates
          </h2>
        </div>
        <p className="font-inter text-orange-700/70 text-xs ml-8">Weekly challenges & important updates</p>
      </div>
      
      {/* Announcements Container with Scrolling */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg rounded-xl overflow-hidden border border-orange-100/50 mb-4">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin"></div>
              <span className="font-inter text-sm text-orange-600">Loading announcements...</span>
            </div>
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-inter text-sm text-red-600 font-medium">Failed to load announcements</span>
            </div>
            <button 
              onClick={fetchAnnouncements}
              className="font-inter text-xs text-orange-600 hover:text-orange-800 underline"
            >
              Try again
            </button>
          </div>
        ) : announcements.length === 0 ? (
          <div className="p-4 text-center">
            <span className="font-inter text-sm text-gray-500">No announcements available</span>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto scrollbar-thin">
            <div className="divide-y divide-orange-100/30">
              {announcements.map((announcement: Announcement) => (
                <div 
                  key={announcement.id} 
                  className="announcement-shimmer group p-4 hover:bg-gradient-to-r hover:from-orange-50/40 hover:to-amber-50/40 transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {getAnnouncementIcon(announcement.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-playfair text-sm font-bold text-gray-900 group-hover:text-orange-800 transition-colors duration-300 leading-snug">
                          {announcement.title}
                        </h3>
                        {announcement.type === 'important' && (
                          <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium border border-red-200 flex-shrink-0">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                            Urgent
                          </span>
                        )}
                        {announcement.type === 'winner' && (
                          <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium border border-yellow-200 flex-shrink-0">
                            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full winner-sparkle"></div>
                            Winner
                          </span>
                        )}
                      </div>
                      
                      <p className="font-inter text-gray-700 text-xs leading-relaxed mb-2 group-hover:text-gray-800 transition-colors duration-300">
                        {announcement.content}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-orange-600">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-inter text-xs font-medium">{formatDate(announcement.date)}</span>
                        </div>
                        
                        {announcement.type === 'winner' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Hover Arrow */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-4 h-4 text-orange-400 transform group-hover:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default NoticeBoard;