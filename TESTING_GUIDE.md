# Testing Guide for Automatic Deadline Progression

## Quick Test Steps

### 1. Test Current Interval Detection
```bash
# Check what interval the system thinks is current
curl http://localhost:3000/api/admin/sync-interval
```

Expected response:
```json
{
  "message": "Admin settings already in sync with timeline",
  "updated": false,
  "data": {
    "currentInterval": 1,
    "isSubmissionsOpen": true,
    "currentIntervalInfo": {
      "id": 2,
      "title": "Week 1 Challenge",
      "isSubmissionInterval": true
    },
    "nextDeadline": {
      "deadline": "2025-11-20T23:59:59.999Z",
      "title": "Week 1 Challenge",
      "weekNumber": 1
    }
  }
}
```

### 2. Test Countdown Component
- Visit the homepage or any competition page
- Countdown should show "Week 1 Challenge" with time remaining
- When deadline passes, it should automatically switch to "Week 2 Challenge"

### 3. Test Timeline Component
- Check the Timeline component on the main page
- "Week 1 Challenge" should show as "Current Phase" with pulsing indicator
- Completed intervals should have green checkmark
- Upcoming intervals should show clock icon

### 4. Test Submission Panel
- Go to a competition page
- Should show "Current Week: 1"
- Status should be "Open" (green badge)
- Should display submission count (e.g., "Submissions: 0/3")

### 5. Test Automatic Progression (Simulated)

To test deadline progression without waiting:

1. **Modify dates temporarily** in `lib/deadlineManager.ts`:
```typescript
{
  id: 2,
  title: 'Week 1 Challenge',
  startDate: '2025-11-15T00:00:00.000Z',
  endDate: '2025-11-19T23:59:59.999Z', // Set to yesterday
  // ...
}
```

2. **Restart your dev server**

3. **Check the sync endpoint again**:
```bash
curl http://localhost:3000/api/admin/sync-interval
```

Should now show Week 2 as current.

4. **Verify UI updates**:
- Countdown shows Week 2 deadline
- Timeline marks Week 1 as completed
- Timeline marks Week 2 as current
- Submission panel shows "Current Week: 2"

### 6. Test Submission with Dynamic Interval

Try submitting an entry:
```bash
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "competitionId": 1,
    "title": "Test Submission",
    "fileUrl": "https://drive.google.com/file/d/test123",
    "description": "Testing automatic interval"
  }'
```

Check the created submission's interval:
- Should match current week from timeline
- Should increment when deadline passes

### 7. Test Auto-Sync on Page Load

1. Open browser DevTools (Console tab)
2. Reload the page
3. Look for log message: "Interval synced: ..."
4. Check Network tab for POST to `/api/admin/sync-interval`

### 8. Test Competition 4 (Special Case)

- Visit `/competitions/painting`
- Countdown should use static deadline (Dec 30, 2025)
- Should NOT auto-progress through weekly intervals

## Expected Behaviors

### When Week 1 Ends (Nov 20, 2025 23:59:59)
✅ Countdown immediately switches to Week 2
✅ Timeline marks Week 1 as completed
✅ Timeline marks Week 2 as current
✅ Submission panel shows Week 2
✅ New submissions go to interval 2

### During Final Results Period (Dec 18-20)
✅ Countdown shows "Final Results"
✅ Submissions status shows "Closed"
✅ Cannot submit new entries
✅ Timeline shows all weeks as completed

### On Page Load
✅ Sync happens automatically
✅ Admin settings updated if needed
✅ No manual intervention required

## Common Issues & Solutions

### Issue: Countdown shows wrong deadline
**Solution:** Check `lib/deadlineManager.ts` dates are correct

### Issue: Submissions closed when should be open
**Solution:** 
1. Check current date is within a submission interval
2. Run sync endpoint manually
3. Verify `isSubmissionInterval: true` for current period

### Issue: Timeline not updating
**Solution:**
1. Clear browser cache
2. Check console for errors
3. Verify useEffect is running in Timeline component

### Issue: Wrong week number in submissions
**Solution:**
1. Call sync endpoint
2. Check admin settings in database
3. Verify submission API is using `getCurrentSubmissionInterval()`

## Verification Checklist

Before deploying to production:

- [ ] All dates in `deadlineManager.ts` are correct for production
- [ ] Sync endpoint works without authentication (or with proper auth)
- [ ] Auto-sync hook is active in `_app.tsx`
- [ ] Countdown displays correctly on all pages
- [ ] Timeline reflects real-time status
- [ ] Submissions use correct interval
- [ ] Competition 4 uses static deadline
- [ ] Admin settings auto-update on interval change
- [ ] Progress bar calculates correctly

## Manual Testing Dates

Set these test dates to verify each transition:

1. **Before Competition Start** (Oct 25, 2025)
   - All intervals should show as upcoming
   - Submissions closed

2. **During Launch Week** (Oct 28, 2025)
   - Competition Launch current
   - Submissions closed

3. **During Week 1** (Nov 10, 2025)
   - Week 1 Challenge current
   - Submissions open

4. **Transition to Week 2** (Nov 20, 2025 23:59:00)
   - Watch countdown hit zero
   - Verify automatic switch to Week 2

5. **After All Intervals** (Dec 21, 2025)
   - Final Results completed
   - Submissions closed
   - Event concluded message

---

**Pro Tip:** Use browser DevTools to mock system time if you want to test transitions without changing code.
