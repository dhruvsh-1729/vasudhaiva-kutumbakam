# Timezone Implementation - IST (Indian Standard Time)

## Overview

The entire competition platform now uses **IST (Indian Standard Time)** for all deadline calculations, countdowns, and interval progressions. IST is UTC+5:30.

## Why IST?

Since this is an Indian competition platform, all deadlines should align with Indian time zones. Participants across India will see consistent deadlines regardless of their system timezone settings.

## Implementation Details

### 1. Timeline Intervals (IST Format)

All dates in `lib/deadlineManager.ts` and `data/competitions.js` now use IST timezone notation:

```javascript
{
  id: 2,
  title: 'Week 1 Challenge',
  startDate: '2025-11-02T00:00:00+05:30', // Midnight IST on Nov 2
  endDate: '2025-11-20T23:59:59+05:30',   // 11:59:59 PM IST on Nov 20
  isSubmissionInterval: true,
  weekNumber: 1
}
```

**Important Notes:**
- `+05:30` indicates IST timezone (5 hours 30 minutes ahead of UTC)
- Start times are at midnight IST (00:00:00)
- End times are at 11:59:59 PM IST to capture the full day
- Week 1 ends at 11:59:59 PM IST on Nov 20, and Week 2 starts at midnight IST

### 2. Current Time Calculation

All functions that need current time now use IST:

```typescript
function getCurrentIST(customDate?: Date): Date {
  const now = customDate || new Date();
  // Convert to IST using Asia/Kolkata timezone
  const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  return istTime;
}
```

### 3. Updated Functions

#### `lib/deadlineManager.ts`
All these functions now use IST:
- ✅ `getCurrentInterval()` - Uses IST to determine current interval
- ✅ `getNextDeadline()` - Returns deadline in IST
- ✅ `getCurrentSubmissionInterval()` - Calculates based on IST
- ✅ `areSubmissionsOpen()` - Checks IST time
- ✅ `getIntervalsWithStatus()` - Status calculated with IST
- ✅ `getCompetitionProgress()` - Progress based on IST
- ✅ `formatDateRange()` - Displays dates in IST

#### `components/CountDown.tsx`
- ✅ Countdown calculations use IST
- ✅ Displays time remaining until IST deadline
- ✅ Updates every second with IST-based calculations

#### `data/competitions.js`
- ✅ All helper functions use IST
- ✅ Timeline intervals specified in IST

### 4. User Experience

Regardless of where a user accesses the platform from:

| User Location | System Timezone | Platform Behavior |
|--------------|----------------|-------------------|
| Mumbai | IST (UTC+5:30) | Shows correct IST times |
| Delhi | IST (UTC+5:30) | Shows correct IST times |
| London | GMT (UTC+0) | Internally converts to IST, shows IST deadlines |
| New York | EST (UTC-5) | Internally converts to IST, shows IST deadlines |

**Result:** All users see the same deadline times, calculated in IST.

## Testing IST Implementation

### Test Case 1: Deadline at Midnight IST
```javascript
// Week 2 starts at midnight IST on Nov 20/21
// If current time is Nov 20, 11:58 PM IST → Week 1 is current
// If current time is Nov 21, 12:01 AM IST → Week 2 is current
```

### Test Case 2: User in Different Timezone
```javascript
// User in USA (EST - UTC-5) accesses site at 2:00 PM EST on Nov 20
// That equals 12:30 AM IST on Nov 21 (next day)
// System should show Week 2 as current, not Week 1
```

### Test Case 3: Countdown Display
```javascript
// Current time: Nov 20, 2025 11:00 PM IST
// Countdown should show: 0 days, 0 hours, 59 minutes until Week 1 ends
// At 11:59:59 PM → Countdown hits zero
// At 12:00:00 AM → Automatically switches to Week 2 deadline
```

## Verification Steps

### 1. Check Interval Calculation
```bash
curl http://localhost:3000/api/admin/sync-interval
```

Expected output should show times in IST context:
```json
{
  "currentIntervalInfo": {
    "title": "Week 1 Challenge",
    "id": 2
  },
  "nextDeadline": {
    "deadline": "2025-11-20T23:59:59+05:30",
    "title": "Week 1 Challenge",
    "weekNumber": 1
  }
}
```

### 2. Check Countdown Component
- Visit homepage
- Countdown should calculate time until IST deadline
- If you're not in IST timezone, countdown still uses IST endpoint

### 3. Check Submission Timing
```javascript
// Submit at 11:59 PM IST on Nov 20 → Goes to Week 1
// Submit at 12:01 AM IST on Nov 21 → Goes to Week 2
```

## Important Considerations

### 1. Server Timezone Independence
The server's system timezone doesn't matter. All calculations explicitly use IST via:
```javascript
timeZone: 'Asia/Kolkata'
```

### 2. Database Timestamps
- Submissions are tagged with interval numbers (1, 2, 3)
- Interval number is determined by IST calculation
- createdAt timestamps in DB can be in any timezone (they're for reference only)

### 3. Daylight Saving Time
IST does not observe daylight saving time, so there are no confusing time shifts throughout the year.

### 4. Midnight Transitions
All intervals transition at midnight IST:
- Week 1 ends: Nov 20, 2025 at 11:59:59 PM IST
- Week 2 starts: Nov 20, 2025 at 12:00:00 AM IST (which is midnight going into Nov 21)

## Date Reference Table

| Event | IST Date & Time | UTC Equivalent | EST Equivalent |
|-------|----------------|----------------|----------------|
| Week 1 Start | Nov 2, 12:00 AM IST | Nov 1, 6:30 PM UTC | Nov 1, 1:30 PM EST |
| Week 1 End | Nov 20, 11:59 PM IST | Nov 20, 6:29 PM UTC | Nov 20, 1:29 PM EST |
| Week 2 Start | Nov 21, 12:00 AM IST | Nov 20, 6:30 PM UTC | Nov 20, 1:30 PM EST |
| Week 2 End | Dec 4, 11:59 PM IST | Dec 4, 6:29 PM UTC | Dec 4, 1:29 PM EST |
| Week 3 Start | Dec 5, 12:00 AM IST | Dec 4, 6:30 PM UTC | Dec 4, 1:30 PM EST |
| Week 3 End | Dec 18, 11:59 PM IST | Dec 18, 6:29 PM UTC | Dec 18, 1:29 PM EST |

## Troubleshooting

### Issue: Wrong interval showing
**Check:** 
1. What's the current IST time? (Not your local time)
2. Compare with interval dates in `deadlineManager.ts`
3. Run sync endpoint to verify calculation

### Issue: Countdown off by hours
**Likely Cause:** Browser timezone confusion
**Fix:** Ensure `getCurrentIST()` is used in all calculations

### Issue: Submission goes to wrong week
**Check:**
1. Server time vs IST
2. Verify submission API uses `getCurrentSubmissionInterval()`
3. Check admin settings are synced with IST-based intervals

## Code Snippets

### Get Current IST Time (for debugging)
```javascript
const istNow = new Date().toLocaleString('en-US', { 
  timeZone: 'Asia/Kolkata',
  dateStyle: 'full',
  timeStyle: 'long'
});
console.log('Current IST:', istNow);
```

### Manually Test Interval at Specific IST Time
```typescript
// Test what interval would be active at a specific IST time
const testDate = new Date('2025-11-20T23:58:00+05:30'); // 11:58 PM IST on Nov 20
const interval = getCurrentInterval(testDate);
console.log('Interval at test time:', interval.title); // Should be "Week 1 Challenge"
```

## Summary

✅ All deadlines in IST  
✅ All calculations use IST  
✅ Timezone-independent operation  
✅ Consistent experience for all users  
✅ No manual timezone conversions needed  

---

**Timezone:** IST (Indian Standard Time, UTC+5:30)  
**Format:** ISO 8601 with timezone offset (+05:30)  
**Locale:** Asia/Kolkata  
**DST:** Not applicable (IST doesn't use DST)
