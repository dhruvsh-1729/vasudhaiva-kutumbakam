// lib/deadlineManager.ts
// Utility functions for managing competition deadlines and intervals

interface TimelineInterval {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  status: 'completed' | 'current' | 'upcoming';
  isSubmissionInterval: boolean;
  weekNumber?: number;
}

/**
 * Get current time in IST (Indian Standard Time)
 * IST is UTC+5:30
 */
function getCurrentIST(customDate?: Date): Date {
  const now = customDate || new Date();
  // Convert to IST by adding 5 hours 30 minutes
  const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  return istTime;
}

/**
 * Convert a date string to IST Date object
 */
function toISTDate(dateString: string): Date {
  // Parse the date string as IST
  const date = new Date(dateString);
  return date;
}

// Timeline intervals configuration for automatic deadline progression
// All dates are in IST (Indian Standard Time)
export const timelineIntervals: TimelineInterval[] = [
  {
    id: 1,
    title: 'Competition Launch',
    startDate: '2025-10-27T00:00:00+05:30', // IST
    endDate: '2025-11-02T23:59:59+05:30',   // IST
    status: 'completed',
    isSubmissionInterval: false
  },
  {
    id: 2,
    title: 'Week 1 Challenge',
    startDate: '2025-11-02T00:00:00+05:30', // IST
    endDate: '2025-11-20T23:59:59+05:30',   // IST
    status: 'current',
    isSubmissionInterval: true,
    weekNumber: 1
  },
  {
    id: 3,
    title: 'Final Submission Window',
    startDate: '2025-11-20T00:00:00+05:30', // IST (Midnight IST, not UTC)
    endDate: '2025-12-12T23:59:59+05:30',   // IST
    status: 'upcoming',
    isSubmissionInterval: true,
    weekNumber: 2
  },
  {
    id: 4,
    title: 'Jury Review',
    startDate: '2025-12-12T00:00:00+05:30', // IST
    endDate: '2025-12-18T23:59:59+05:30',   // IST
    status: 'upcoming',
    isSubmissionInterval: false,
    weekNumber: 3
  },
  {
    id: 5,
    title: 'Final Results',
    startDate: '2025-12-18T00:00:00+05:30', // IST
    endDate: '2025-12-20T23:59:59+05:30',   // IST
    status: 'upcoming',
    isSubmissionInterval: false
  }
];

/**
 * Get the current active interval based on the current date in IST
 */
export function getCurrentInterval(customDate?: Date): TimelineInterval {
  const now = getCurrentIST(customDate);
  
  // Find the interval that matches current date
  for (const interval of timelineIntervals) {
    const start = new Date(interval.startDate);
    const end = new Date(interval.endDate);
    
    if (now >= start && now <= end) {
      return interval;
    }
  }
  
  // If no current interval found (after all intervals), return the last one
  return timelineIntervals[timelineIntervals.length - 1];
}

/**
 * Get the next deadline with interval information
 */
export function getNextDeadline(customDate?: Date) {
  const now = getCurrentIST(customDate);
  
  // Find the next interval that hasn't ended yet
  for (const interval of timelineIntervals) {
    const end = new Date(interval.endDate);
    
    if (now <= end) {
      return {
        deadline: interval.endDate,
        interval: interval,
        weekNumber: interval.weekNumber || null,
        title: interval.title
      };
    }
  }
  
  // If all intervals have passed, return the last interval's end date
  const lastInterval = timelineIntervals[timelineIntervals.length - 1];
  return {
    deadline: lastInterval.endDate,
    interval: lastInterval,
    weekNumber: lastInterval.weekNumber || null,
    title: lastInterval.title
  };
}

/**
 * Get current submission interval number (for database)
 */
export function getCurrentSubmissionInterval(customDate?: Date): number {
  const currentInterval = getCurrentInterval(customDate);
  return currentInterval.weekNumber || 1;
}

/**
 * Check if submissions are currently open based on timeline
 */
export function areSubmissionsOpen(customDate?: Date): boolean {
  const currentInterval = getCurrentInterval(customDate);
  return currentInterval.isSubmissionInterval === true;
}

/**
 * Get all intervals with their dynamically calculated status
 */
export function getIntervalsWithStatus(customDate?: Date): TimelineInterval[] {
  const now = getCurrentIST(customDate);
  
  return timelineIntervals.map(interval => {
    const start = new Date(interval.startDate);
    const end = new Date(interval.endDate);
    
    let status: 'completed' | 'current' | 'upcoming';
    
    if (now > end) {
      status = 'completed';
    } else if (now >= start && now <= end) {
      status = 'current';
    } else {
      status = 'upcoming';
    }
    
    return {
      ...interval,
      status
    };
  });
}

/**
 * Format date range for display in IST
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const options: Intl.DateTimeFormatOptions = { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric',
    timeZone: 'Asia/Kolkata' // Display in IST
  };
  
  if (start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString('en-US', options);
  }
  
  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
}

/**
 * Get competition progress percentage
 */
export function getCompetitionProgress(customDate?: Date): number {
  const now = getCurrentIST(customDate);
  const firstInterval = timelineIntervals[0];
  const lastInterval = timelineIntervals[timelineIntervals.length - 1];
  
  const startTime = new Date(firstInterval.startDate).getTime();
  const endTime = new Date(lastInterval.endDate).getTime();
  const currentTime = now.getTime();
  
  if (currentTime < startTime) return 0;
  if (currentTime > endTime) return 100;
  
  const progress = ((currentTime - startTime) / (endTime - startTime)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

/**
 * Get the current week label (e.g., "Week 1 of 3")
 */
export function getCurrentWeekLabel(customDate?: Date): string {
  const currentInterval = getCurrentInterval(customDate);
  
  if (!currentInterval.weekNumber) {
    return 'Pre-competition';
  }
  
  const totalWeeks = timelineIntervals.filter(i => i.isSubmissionInterval).length;
  return `Week ${currentInterval.weekNumber} of ${totalWeeks}`;
}
