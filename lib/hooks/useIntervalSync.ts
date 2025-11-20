// lib/hooks/useIntervalSync.ts
import { useEffect } from 'react';

/**
 * Custom hook to automatically sync admin settings with timeline intervals
 * Call this in your main layout or app component to ensure intervals stay updated
 */
export function useIntervalSync() {
  useEffect(() => {
    const syncInterval = async () => {
      try {
        const response = await fetch('/api/admin/sync-interval', {
          method: 'POST',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.updated) {
            console.log('Interval synced:', data.message);
          }
        }
      } catch (error) {
        console.error('Failed to sync interval:', error);
      }
    };

    // Sync on mount
    syncInterval();

    // Sync every 5 minutes
    const interval = setInterval(syncInterval, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
}
