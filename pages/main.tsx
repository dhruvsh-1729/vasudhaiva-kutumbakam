// pages/main.tsx (Enhanced with Authentication)
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '@/components/Header';
import CompetitionList from '../components/CompetitionList';
import NotificationBanner from '@/components/NotificationBanner';
import NoticeBoard from '@/components/NoticeBoard';
import Timeline from '@/components/Timeline';
import Footer from '@/components/Footer';
import { clientAuth } from '../lib/auth/clientAuth';
import CompactSubmissions from '@/components/Submissions';
import CountDown from '@/components/CountDown';
import { getCompetitionById } from '@/data/competitions';

// Type definitions
interface Announcement {
  id: number;
  type: 'important' | 'normal';
  title: string;
  content: string;
  date: string;
}

interface TimelineEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface User {
  id: string;
  name: string;
  email: string;
}

const MainPage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check authentication on component mount
  useEffect(() => {
    const currentUser = clientAuth.getUser();
    const token = clientAuth.getToken();
    
    if (!currentUser || !token) {
      // Not authenticated - redirect to login
      router.push('/login?message=' + encodeURIComponent('Please log in to access the dashboard'));
      return;
    }
    
    setUser(currentUser);
    setIsAuthenticated(true);
    setIsLoading(false);
  }, [router]);

  // Sample announcements data with proper typing
  const announcements: Announcement[] = [
    {
      id: 1,
      type: 'important',
      title: 'Registration Deadline Extended',
      content: 'The registration deadline for all competitions has been extended by one week.',
      date: 'October 15, 2023',
    },
    {
      id: 2,
      type: 'normal',
      title: 'New AI Challenge Added',
      content: 'We have added a new AI challenge to the competition lineup.',
      date: 'October 10, 2023',
    },
    {
      id: 3,
      type: 'normal',
      title: 'Workshop Announcement',
      content: 'A workshop on advanced algorithms will be held on October 20.',
      date: 'October 5, 2023',
    },
  ];

  // Sample timeline events with proper typing
  const timelineEvents: TimelineEvent[] = [
    {
      id: 1,
      title: 'Registration Opens',
      description: 'Registration for all competitions begins',
      date: 'September 15, 2023',
      status: 'completed',
    },
    {
      id: 2,
      title: 'Submission Phase',
      description: 'Submit your entries for the competitions',
      date: 'October 15 - November 15, 2023',
      status: 'current',
    },
    {
      id: 3,
      title: 'Judging Period',
      description: 'Entries will be evaluated by our panel of judges',
      date: 'November 16 - December 1, 2023',
      status: 'upcoming',
    },
    {
      id: 4,
      title: 'Winners Announcement',
      description: 'Winners will be announced and prizes distributed',
      date: 'December 10, 2023',
      status: 'upcoming',
    },
  ];

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
            <div className="text-white font-bold text-lg">VK</div>
          </div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
          <div className="mt-4 w-24 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render the page if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Dashboard - VK Competition | Vasudhaiva Kutumbakam</title>
        <meta 
          name="description" 
          content="VK Competition Dashboard - Manage your creative expressions and participate in global unity celebrations." 
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Enhanced Styles for Premium Visual Experience */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
        
        /* Simplified background to avoid repaint/flicker on scroll */
        .ancient-background {
          background: linear-gradient(140deg, #8B4513 0%, #A0522D 40%, #B8860B 100%);
          position: relative;
          overflow-x: hidden;
          min-height: 100vh;
          -webkit-overflow-scrolling: touch;
        }

        .dashboard-grid {
          position: relative;
          z-index: 10;
        }

        .component-container {
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid rgba(0, 0, 0, 0.04);
          box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08);
          border-radius: 16px;
          transition: box-shadow 0.2s ease;
          position: relative;
        }

        .component-container:hover {
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
        }

        /* Simplify and disable fixed decorative layers on mobile to prevent scroll flicker */
        @media (max-width: 768px) {
          .ancient-background {
            background: linear-gradient(135deg, #8B4513 0%, #B8860B 50%, #8B4513 100%);
            overflow-y: auto;
          }
          .ancient-background::before,
          .ancient-background::after,
          .floating-mandala,
          .sacred-particle,
          .sacred-pattern,
          .ambient-light {
            display: none !important;
          }
          .component-container {
            backdrop-filter: none;
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
            border: 1px solid rgba(0, 0, 0, 0.04);
            transform: none !important;
          }
          .component-container:hover {
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
          }
          .dashboard-grid {
            backdrop-filter: none;
          }
        }
      `}</style>

      <div className="ancient-background min-h-screen relative">
        {/* Main Content */}
        <div className="relative z-10">
          <Header />
          <NotificationBanner />
          
            {/* Welcome Section for Authenticated User */}
            {/* <div className="w-full px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
            <div className="component-container mb-6 sm:mb-8 p-4 sm:p-6 md:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 sm:gap-6 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg sm:text-xl md:text-2xl leading-none">
                  {((user?.name ?? '').trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2)) || 'U'}
                </span>
                </div>
                <div className="min-w-0">
                <h1
                  className="text-xl sm:text-2xl md:text-3xl font-bold text-red-700 leading-tight truncate"
                  title={`Welcome back, ${((user?.name ?? '').trim().split(/\s+/)[0] || 'Friend')}!`}
                >
                  Welcome back, {((user?.name ?? '').trim().split(/\s+/)[0] || 'Friend')}!
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Continue your journey
                </p>
                </div>
              </div>

              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-green-50 border border-green-200 rounded-lg">
                <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
                >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-green-700 font-semibold text-xs sm:text-sm">Account Active</span>
              </div>
              </div>
            </div>
            </div> */}          
          <main className="w-full px-4 sm:px-6 lg:px-8 py-12">
            <div className="dashboard-grid grid grid-cols-1 xl:grid-cols-12 gap-8">
              {/* Left Sidebar - Announcements */}
              <div className="xl:col-span-3 space-y-8 order-2 xl:order-1">
                <div className="component-container">
                  <CompactSubmissions />
                  <NoticeBoard />
                </div>
              </div>

              {/* Center Section - Competition List */}
              <div className="xl:col-span-6 space-y-8 order-1 xl:order-2">
                <div className="component-container">
                  <CompetitionList />
                </div>
              </div>

              {/* Right Sidebar - Timeline */}
              <div className="xl:col-span-3 space-y-8 order-3 xl:order-3">
                <div className="component-container">
                  <Timeline />
                </div>
              </div>
            </div>
          </main>
          
          <Footer />
        </div>
      </div>
    </>
  );
};

export default MainPage;
