// components/NotificationBanner.tsx
import { useState } from 'react';
import Link from 'next/link';

const NotificationBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const handleDismiss = (): void => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <style jsx global>{`
        .font-inter { font-family: 'Inter', sans-serif; }
        
        .notification-gradient {
          background: linear-gradient(135deg, #DC2626, #EA580C, #D97706);
        }
        
        .notification-shimmer {
          position: relative;
          overflow: hidden;
        }
        
        .notification-shimmer::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          animation: shimmer 3s ease-in-out infinite;
        }
        
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .notification-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .banner-slide-out {
          animation: slideOut 0.3s ease-in-out forwards;
        }

        @keyframes slideOut {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(-100%);
            opacity: 0;
          }
        }
      `}</style>

      <div className="notification-gradient notification-shimmer relative z-40 border-b border-red-600/20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 relative">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-inner shadow-white/10 notification-pulse">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-white/95 text-sm sm:text-base font-bold">
              ⚠️ LAST DAY: Online Competitions Closing Today (Dec 30th) at 11:59 PM IST!
            </div>
            <Link 
              href="/main"
              className="group inline-flex items-center px-3 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-xs sm:text-sm font-semibold backdrop-blur-sm hover:bg-white/25 transition-all"
            >
              Submit Now
              <svg className="w-4 h-4 ml-1 sm:ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a 
              href="https://vk.jyot.in/vk4-registration"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center px-3 py-1.5 rounded-full bg-white text-red-700 text-xs sm:text-sm font-semibold shadow hover:shadow-lg transition-all"
            >
              Physical Competition Link
              <svg className="w-4 h-4 ml-1 sm:ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <button 
              onClick={handleDismiss}
              className="ml-auto w-7 h-7 text-white/80 hover:text-white transition-colors duration-200 hover:bg-white/10 rounded-full p-1"
              aria-label="Dismiss notification"
            >
              <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationBanner;
