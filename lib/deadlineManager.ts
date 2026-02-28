// lib/deadlineManager.ts
// Utility functions for managing competition deadlines and intervals
//
// ===== IST (Indian Standard Time) HANDLING =====
//
// This module ensures all deadlines are treated as 11:59:59 PM IST (UTC+5:30).
//
// KEY PRINCIPLES:
// 1. All deadline strings in the timeline are stored with explicit IST timezone offset (+05:30)
//    Example: "2025-11-30T23:59:59+05:30" means Nov 30, 2025 at 11:59:59 PM IST
//
// 2. JavaScript Date objects handle timezone-aware strings correctly
//    When you do: new Date("2025-11-30T23:59:59+05:30")
//    The Date object stores the correct UTC timestamp internally
//
// 3. Comparisons work correctly because Date.getTime() returns UTC milliseconds
//    new Date("2025-11-30T23:59:59+05:30").getTime() - new Date().getTime()
//    This gives the correct time difference regardless of the user's local timezone
//
// 4. No need for manual timezone conversion with toLocaleString
//    The old approach of toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) 
//    was error-prone because it converted to a string and back, potentially losing precision
//
// 5. For displaying dates to users in IST, use Intl.DateTimeFormat with timeZone: 'Asia/Kolkata'
//    This is only for display purposes, not for calculations
//
// IMPORTANT: All deadlines should be stored with the +05:30 timezone offset to ensure
// they are correctly interpreted as IST times.
//

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
 * 
 * Since our deadline strings already include IST timezone offset (+05:30),
 * we can just return the current Date object. JavaScript Date objects
 * internally store UTC timestamps, so comparisons work correctly regardless
 * of the user's local timezone.
 */
function getCurrentIST(customDate?: Date): Date {
  return customDate || new Date();
}

/**
 * Convert a date string to a Date object
 * Handles dates with IST timezone offset (+05:30)
 */
function toISTDate(dateString: string): Date {
  // Parse the date string - it should already have IST timezone offset
  const date = new Date(dateString);
  return date;
}

/**
 * Normalize a date to end of day (11:59:59 PM) in IST
 * This ensures all deadlines are consistently set to 11:59:59 PM IST
 * 
 * @param dateInput - Date string or Date object
 * @returns Date string in ISO format with IST timezone (YYYY-MM-DDTHH:MM:SS+05:30)
 */
export function normalizeToEndOfDayIST(dateInput: string | Date): string {
  let date: Date;
  
  if (typeof dateInput === 'string') {
    // If string already has time and timezone, parse it
    if (dateInput.includes('T') && (dateInput.includes('+') || dateInput.includes('Z'))) {
      date = new Date(dateInput);
    } else {
      // If it's just a date string (YYYY-MM-DD), treat it as that date in IST
      // and set to end of day
      const parts = dateInput.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts.map(Number);
        // Create date at end of day IST (23:59:59)
        return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T23:59:59+05:30`;
      }
      date = new Date(dateInput);
    }
  } else {
    date = dateInput;
  }
  
  // Get the date parts in IST timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  const parts = formatter.formatToParts(date);
  const getValue = (type: string) => parts.find(p => p.type === type)?.value || '01';
  
  const year = getValue('year');
  const month = getValue('month');
  const day = getValue('day');
  
  // Return as end of day IST
  return `${year}-${month}-${day}T23:59:59+05:30`;
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
    endDate: '2025-11-30T23:59:59+05:30',   // IST (11:59:59 PM IST on Nov 30)
    status: 'current',
    isSubmissionInterval: true,
    weekNumber: 1
  },
  {
    id: 3,
    title: 'Week 2 Challenge',
    startDate: '2025-12-01T00:00:00+05:30', // IST
    endDate: '2025-12-11T23:59:59+05:30',   // IST
    status: 'upcoming',
    isSubmissionInterval: true,
    weekNumber: 2
  },
  {
    id: 4,
    title: 'Final Submission Window',
    startDate: '2025-12-12T00:00:00+05:30', // IST
    endDate: '2025-12-30T23:59:59+05:30',   // IST
    status: 'upcoming',
    isSubmissionInterval: true,
    weekNumber: 3
  },
  {
    id: 5,
    title: 'Jury Review',
    startDate: '2025-12-31T00:00:00+05:30', // IST
    endDate: '2026-01-06T23:59:59+05:30',   // IST
    status: 'upcoming',
    isSubmissionInterval: false
  },
  {
    id: 6,
    title: 'Final Results',
    startDate: '2026-01-07T00:00:00+05:30', // IST
    endDate: '2026-01-08T23:59:59+05:30',   // IST
    status: 'upcoming',
    isSubmissionInterval: false
  }
];

/**
 * Get the current active interval based on the current date in IST
 */
export function getCurrentInterval(customDate?: Date): TimelineInterval {
  const now = getCurrentIST(customDate);
  const firstInterval = timelineIntervals[0];
  const firstStart = new Date(firstInterval.startDate);

  if (now < firstStart) {
    return firstInterval;
  }
  
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
  let nextInterval: TimelineInterval | undefined;
  let nextSubmission: TimelineInterval | undefined;

  for (const interval of timelineIntervals) {
    const end = new Date(interval.endDate);

    if (now <= end) {
      if (!nextInterval) {
        nextInterval = interval;
      }
      if (!nextSubmission && interval.isSubmissionInterval) {
        nextSubmission = interval;
      }
    }
  }

  const targetInterval = nextSubmission || nextInterval || timelineIntervals[timelineIntervals.length - 1];
  return {
    deadline: targetInterval.endDate,
    interval: targetInterval,
    weekNumber: targetInterval.weekNumber || null,
    title: targetInterval.title
  };
}

/**
 * Get current submission interval number (for database)
 */
export function getCurrentSubmissionInterval(customDate?: Date): number {
  const currentInterval = getCurrentInterval(customDate);
  if (currentInterval.weekNumber) {
    return currentInterval.weekNumber;
  }

  const now = getCurrentIST(customDate);
  const upcomingSubmission = timelineIntervals.find(interval =>
    interval.isSubmissionInterval && new Date(interval.startDate) > now && interval.weekNumber
  );

  if (upcomingSubmission?.weekNumber) {
    return upcomingSubmission.weekNumber;
  }

  const lastSubmissionInterval = [...timelineIntervals]
    .reverse()
    .find(interval => interval.isSubmissionInterval && interval.weekNumber);

  return lastSubmissionInterval?.weekNumber || 1;
}

/**
 * Check if submissions are currently open based on timeline
 */
export function areSubmissionsOpen(customDate?: Date): boolean {
  const now = getCurrentIST(customDate);
  const currentInterval = getCurrentInterval(customDate);

  if (!currentInterval.isSubmissionInterval) {
    const upcomingSubmission = timelineIntervals.find(interval => 
      interval.isSubmissionInterval && new Date(interval.startDate) > now
    );
    if (upcomingSubmission) {
      return true;
    }
  }

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
    return currentInterval.title;
  }
  
  const totalWeeks = timelineIntervals.filter(i => i.isSubmissionInterval).length;
  return `Week ${currentInterval.weekNumber} of ${totalWeeks}`;
}
