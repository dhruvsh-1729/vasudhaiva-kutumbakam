import React, { useState, useEffect } from 'react';
import { getNextDeadline } from '@/lib/deadlineManager';

interface CountDownProps {
  deadline?: string; // Made optional - will use dynamic deadline if not provided
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountDown: React.FC<CountDownProps> = ({ deadline: propDeadline }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [currentDeadline, setCurrentDeadline] = useState<string>('');
  const [intervalTitle, setIntervalTitle] = useState<string>('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      // Use prop deadline if provided, otherwise get dynamic deadline
      let deadlineToUse: string;
      let title: string;
      
      if (propDeadline) {
        deadlineToUse = propDeadline;
        title = 'Competition deadline';
      } else {
        const nextDeadlineInfo = getNextDeadline();
        deadlineToUse = nextDeadlineInfo.deadline;
        title = nextDeadlineInfo.title;
        
        // Update current deadline and title if they've changed
        if (deadlineToUse !== currentDeadline) {
          setCurrentDeadline(deadlineToUse);
          setIntervalTitle(title);
        }
      }

      // Parse deadline - it should include IST timezone offset (+05:30)
      // The deadline string format: "YYYY-MM-DDTHH:MM:SS+05:30"
      const deadlineDate = new Date(deadlineToUse);
      
      // Get current time in UTC and convert to IST for comparison
      // We use a proper timezone-aware approach here
      const now = new Date();
      
      // Calculate the difference in milliseconds
      // Both dates are timezone-aware, so this gives us the correct difference
      const difference = deadlineDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [propDeadline, currentDeadline]);

  const isTimeUp = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;
  
  // Display interval title if available and not using prop deadline
  const displayTitle = !propDeadline && intervalTitle ? intervalTitle : 'Competitions';

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 justify-center bg-slate-900 p-4 border border-slate-700 min-h-[80px]">
      <span className='text-base sm:text-lg font-bold text-slate-100 text-center'>
        {!propDeadline && intervalTitle && (
          <span className="block text-sm text-slate-400 mb-1">{intervalTitle}</span>
        )}
        {isTimeUp ? 'Event concluded' : `Time remaining`}
      </span>
      {isTimeUp ? (
        <div className="text-center">
          <p className="text-sm sm:text-base text-slate-300 font-medium">Event concluded</p>
        </div>
      ) : (
        <div className="flex gap-2 justify-center flex-wrap">
          {[
            { label: 'Days', value: timeLeft.days },
            { label: 'Hours', value: timeLeft.hours },
            { label: 'Minutes', value: timeLeft.minutes },
            { label: 'Seconds', value: timeLeft.seconds },
          ].map((item) => (
            <div key={item.label} className="text-center w-20">
              <div className="bg-slate-800 rounded-lg px-3 py-2 border border-slate-600 min-w-[60px]">
                <div className="text-lg sm:text-xl font-bold text-slate-100">
                  {item.value.toString().padStart(2, '0')}
                </div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CountDown;
