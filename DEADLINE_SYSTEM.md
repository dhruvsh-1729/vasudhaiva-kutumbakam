# Automatic Deadline Progression System

## Overview

The Vasudhaiva Kutumbakam competition platform now features an **automatic deadline progression system** that ensures submissions are never shown as closed and deadlines automatically advance to the next interval when the current one expires.

**🕐 Important:** All deadlines and calculations use **IST (Indian Standard Time, UTC+5:30)**. See `TIMEZONE_IST.md` for detailed timezone implementation.

## Key Features

### 1. **Dynamic Timeline Management**
- All competition intervals (Week 1, 2, 3, Final Results) are defined in `lib/deadlineManager.ts`
- Status (completed/current/upcoming) is calculated dynamically based on current date
- No manual updates needed when deadlines pass

### 2. **Automatic Interval Progression**
- System automatically detects when a deadline has passed
- Moves to the next interval seamlessly
- Updates submissions, countdown, and timeline components in real-time

### 3. **Smart Submission Control**
- Submissions are only open during designated submission intervals
- Automatically closes during non-submission periods (e.g., Final Results)
- Maximum submissions per interval is enforced based on current week

## Architecture

### Core Components

#### `lib/deadlineManager.ts`
Central utility for managing deadlines and intervals:
- `getCurrentInterval()` - Returns the current active interval
- `getNextDeadline()` - Returns the next deadline information
- `getCurrentSubmissionInterval()` - Returns current week number for submissions
- `areSubmissionsOpen()` - Checks if submissions are allowed now
- `getIntervalsWithStatus()` - Returns all intervals with calculated statuses
- `getCompetitionProgress()` - Calculates overall competition progress percentage

#### Timeline Configuration
```typescript
{
  id: 2,
  title: 'Week 1 Challenge',
  startDate: '2025-11-02T00:00:00+05:30', // IST timezone
  endDate: '2025-11-20T23:59:59+05:30',   // IST timezone
  status: 'current',
  isSubmissionInterval: true,
  weekNumber: 1
}
```

### Updated Components

#### `components/CountDown.tsx`
- Automatically uses the next deadline from `deadlineManager`
- Shows interval title dynamically
- Updates in real-time every second
- Supports override with prop deadline for special competitions

#### `components/Timeline.tsx`
- Fetches interval statuses dynamically
- Updates progress bar based on current date
- Shows current week label automatically
- Refreshes every minute to stay current

#### `components/SubmissionPanel.tsx`
- Displays current week information
- Shows submission limits per interval
- Indicates if submissions are open/closed
- Syncs with dynamic admin settings

### API Endpoints

#### `GET/POST /api/admin/settings`
- Returns current interval and submission status
- Auto-syncs with timeline if out of date
- Updates database to match timeline configuration

#### `POST /api/admin/sync-interval`
- Manual sync endpoint for admin use
- Can be called via cron job for scheduled updates
- Returns detailed sync information
- Useful for debugging and monitoring

#### `POST /api/submissions`
- Uses dynamic interval calculation
- Validates submissions against current interval
- Auto-syncs admin settings on submission

### Auto-Sync Hook

#### `lib/hooks/useIntervalSync.ts`
```typescript
useIntervalSync(); // Call in _app.tsx
```
- Syncs intervals on page load
- Refreshes every 5 minutes automatically
- Ensures UI always shows correct interval

## Usage

### For Developers

#### Adding New Intervals
Edit `lib/deadlineManager.ts`:
```typescript
export const timelineIntervals = [
  // ... existing intervals
  {
    id: 6,
    title: 'Week 4 Challenge',
    startDate: '2025-12-18T00:00:00.000Z',
    endDate: '2026-01-01T23:59:59.999Z',
    status: 'upcoming',
    isSubmissionInterval: true,
    weekNumber: 4
  }
];
```

#### Testing Deadline Progression
1. Temporarily modify dates in `deadlineManager.ts` to test transitions
2. Use the sync endpoint: `POST /api/admin/sync-interval`
3. Check countdown and timeline components for correct updates
4. Verify submission panel shows correct week and status

### For Admins

#### Manual Sync
If you need to force a sync:
```bash
curl -X POST https://your-domain.com/api/admin/sync-interval
```

#### Monitoring
Check current interval status:
```bash
curl https://your-domain.com/api/admin/settings
```

Response:
```json
{
  "currentInterval": 2,
  "isSubmissionsOpen": true,
  "maxSubmissionsPerInterval": 3
}
```

## Benefits

### 1. **No Manual Intervention**
- Deadlines advance automatically
- No need to update database manually
- No risk of forgetting to open/close submissions

### 2. **Always Current**
- UI reflects real-time status
- Participants see accurate deadlines
- Submissions are controlled by timeline

### 3. **Consistent Experience**
- Same logic across all components
- Single source of truth (deadlineManager)
- Reduces bugs and inconsistencies

### 4. **Scalable**
- Easy to add new intervals
- Works for multiple competitions
- Flexible configuration

## Competition-Specific Behavior

### Weekly Competitions (1, 2, 3)
- Use dynamic deadlines from timeline
- Auto-progress through weeks
- Submission limits per week

### Special Competitions (4 - Painting)
- Uses static deadline from competition data
- Not tied to weekly intervals
- Different submission rules

## Timeline Flow (All times in IST)

```
Oct 27 → Nov 2: Competition Launch (No submissions)
Nov 2 → Nov 20: Week 1 Challenge (Submissions open) - Ends 11:59 PM IST
Nov 21 → Dec 4: Week 2 Challenge (Submissions open) - Starts 12:00 AM IST
Dec 5 → Dec 18: Week 3 Challenge (Submissions open)
Dec 18 → Dec 20: Final Results (No submissions)
```

**Note:** Week transitions happen at midnight IST. Week 1 ends at 11:59:59 PM IST on Nov 20, and Week 2 begins at 12:00:00 AM IST (going into Nov 21).

## Troubleshooting

### Submissions Showing as Closed
1. Check current date vs timeline intervals
2. Verify `isSubmissionInterval` is true for current period
3. Run sync endpoint to update admin settings

### Countdown Not Updating
1. Ensure `useIntervalSync` hook is active in `_app.tsx`
2. Check browser console for errors
3. Verify timeline intervals have valid dates

### Wrong Week Displayed
1. Call sync endpoint manually
2. Check admin settings in database
3. Verify system timezone matches UTC

## Future Enhancements

- [ ] Admin UI to modify intervals
- [ ] Email notifications on interval changes
- [ ] Analytics dashboard for submissions by interval
- [ ] Automated testing for deadline transitions
- [ ] Cron job integration for guaranteed sync

## Testing Checklist

- [x] Countdown updates when deadline passes
- [x] Timeline status changes automatically
- [x] Submissions use correct interval
- [x] Admin settings sync with timeline
- [x] UI shows "Open" during submission intervals
- [x] UI shows "Closed" during non-submission periods
- [x] Progress bar updates correctly
- [x] Week label shows current week

---

**Last Updated:** November 20, 2025  
**System Status:** ✅ Active & Auto-Syncing
