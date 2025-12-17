// components/NotificationBanner.tsx
import { useState, CSSProperties } from 'react';
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

        .notification-confetti .confetti-piece {
          position: absolute;
          top: -10%;
          width: 8px;
          height: 14px;
          border-radius: 3px;
          opacity: 0.85;
          animation: confetti-fall linear infinite;
        }

        .confetti-0 { background: #fff3b0; }
        .confetti-1 { background: #ffedd5; }
        .confetti-2 { background: #fee2e2; }
        .confetti-3 { background: #ffe4e6; }
        .confetti-4 { background: #fef3c7; }

        @keyframes confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(120vh) rotate(360deg); opacity: 0; }
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
        <div className="notification-confetti absolute inset-0 pointer-events-none">
          {Array.from({ length: 26 }).map((_, index) => {
            const confettiStyle: CSSProperties = {
              left: `${(index * 4) % 100}%`,
              animationDelay: `${(index % 6) * 0.35}s`,
              animationDuration: `${6 + (index % 5) * 0.6}s`,
            };

            return (
              <span
                key={index}
                className={`confetti-piece confetti-${index % 5}`}
                style={confettiStyle}
              />
            );
          })}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 relative">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-inner shadow-white/10">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-white/95 text-sm sm:text-base font-medium">
              Winners announced! Celebrate our champs & join the physical competitions.
            </div>
            <Link 
              href="/#winners"
              className="group inline-flex items-center px-3 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-xs sm:text-sm font-semibold backdrop-blur-sm hover:bg-white/25 transition-all"
            >
              View winners
              <svg className="w-4 h-4 ml-1 sm:ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <a 
              href="https://vk.jyot.in/vk4-registration"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center px-3 py-1.5 rounded-full bg-white text-red-700 text-xs sm:text-sm font-semibold shadow hover:shadow-lg transition-all"
            >
              Physical competition link
              <svg className="w-4 h-4 ml-1 sm:ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
