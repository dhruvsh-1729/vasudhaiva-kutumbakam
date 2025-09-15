// lib/scheduledCleanup.ts (For server-side scheduled cleanup)
import { TokenUtils } from './tokenUtils';

export class ScheduledCleanup {
  private static instance: ScheduledCleanup;
  private intervalId: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): ScheduledCleanup {
    if (!ScheduledCleanup.instance) {
      ScheduledCleanup.instance = new ScheduledCleanup();
    }
    return ScheduledCleanup.instance;
  }

  /**
   * Start automatic cleanup that runs every 6 hours
   */
  public startAutomaticCleanup(): void {
    if (this.intervalId) {
      console.log('Cleanup scheduler already running');
      return;
    }

    // Run cleanup every 6 hours (6 * 60 * 60 * 1000 = 21,600,000ms)
    const sixHours = 6 * 60 * 60 * 1000;

    this.intervalId = setInterval(async () => {
      try {
        console.log('Starting scheduled token cleanup...');
        const result = await TokenUtils.performFullCleanup();
        console.log('Scheduled token cleanup completed:', result);
      } catch (error) {
        console.error('Scheduled token cleanup failed:', error);
      }
    }, sixHours);

    // Run initial cleanup immediately
    this.performInitialCleanup();

    console.log('Automatic token cleanup scheduler started (every 6 hours)');
  }

  /**
   * Stop automatic cleanup
   */
  public stopAutomaticCleanup(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Automatic token cleanup scheduler stopped');
    }
  }

  /**
   * Run cleanup immediately
   */
  private async performInitialCleanup(): Promise<void> {
    try {
      console.log('Running initial token cleanup...');
      const result = await TokenUtils.performFullCleanup();
      console.log('Initial token cleanup completed:', result);
    } catch (error) {
      console.error('Initial token cleanup failed:', error);
    }
  }

  /**
   * Get scheduler status
   */
  public getStatus(): { running: boolean; nextRunEstimate?: string } {
    return {
      running: this.intervalId !== null,
      nextRunEstimate: this.intervalId 
        ? new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
        : undefined
    };
  }
}

// Initialize scheduled cleanup on server start
// Add this to your main app file or API middleware
export const initializeCleanupScheduler = (): void => {
  if (process.env.NODE_ENV === 'production') {
    const scheduler = ScheduledCleanup.getInstance();
    scheduler.startAutomaticCleanup();
  }
};