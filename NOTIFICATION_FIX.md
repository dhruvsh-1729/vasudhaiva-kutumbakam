# Notification Filtering Fix

## Issue
All users were seeing all notifications, including admin-only notifications. Non-admin users should only see notifications meant for them.

## Root Cause
The `OR` query logic in `fetchNotificationsForUser` was too permissive:
```typescript
{ targetAdminOnly: isAdmin }
```
This condition would evaluate to `{ targetAdminOnly: false }` for non-admin users, which matched ALL notifications where `targetAdminOnly` was false, including ones not meant for them.

## Solution
Restructured the query logic to be more explicit:

### For Non-Admin Users, show only:
1. ✅ Notifications with `targetAll: true` AND `targetAdminOnly: false`
2. ✅ Notifications with their userId in `targetUserIds` (and NOT admin-only)
3. ✅ Notifications with their institution in `targetInstitutions` (and NOT admin-only)
4. ❌ Never show `targetAdminOnly: true` notifications

### For Admin Users, show:
1. ✅ All of the above PLUS
2. ✅ Notifications with `targetAdminOnly: true`

## Fixed Code
```typescript
// Build the query conditions based on user type
const orConditions: any[] = [];

// 1. Notifications for everyone (not admin-only)
orConditions.push({
  targetAll: true,
  targetAdminOnly: false,
});

// 2. Notifications specifically for admins (only if user is admin)
if (isAdmin) {
  orConditions.push({
    targetAdminOnly: true,
  });
}

// 3. Notifications targeted to this specific user
orConditions.push({
  targetUserIds: { has: userId },
  targetAdminOnly: false,
});

// 4. Notifications targeted to user's institution
if (institution) {
  orConditions.push({
    targetInstitutions: { has: institution },
    targetAdminOnly: false,
  });
}
```

## Testing

### Test Case 1: Non-Admin User
**Setup:**
- User: Regular user (not admin)
- Notifications in DB:
  1. `targetAll: true, targetAdminOnly: false` → "Welcome Everyone"
  2. `targetAll: false, targetAdminOnly: true` → "Admin Only Alert"
  3. `targetUserIds: [userId], targetAdminOnly: false` → "Personal Message"

**Expected Result:**
- ✅ User sees notification #1 (Welcome Everyone)
- ❌ User does NOT see notification #2 (Admin Only Alert)
- ✅ User sees notification #3 (Personal Message)

### Test Case 2: Admin User
**Setup:**
- User: Admin user
- Same notifications as above

**Expected Result:**
- ✅ Admin sees notification #1 (Welcome Everyone)
- ✅ Admin sees notification #2 (Admin Only Alert)
- ✅ Admin sees notification #3 (Personal Message)

### Test Case 3: Institution-Specific
**Setup:**
- User: Regular user from "Delhi University"
- Notifications:
  1. `targetInstitutions: ["Delhi University"], targetAdminOnly: false`
  2. `targetInstitutions: ["Mumbai College"], targetAdminOnly: false`

**Expected Result:**
- ✅ User sees notification #1 (their institution)
- ❌ User does NOT see notification #2 (different institution)

## Verification Steps

### 1. Test as Non-Admin User
```bash
# Login as regular user and fetch notifications
curl -X GET http://localhost:3000/api/notifications \
  -H "Cookie: your-user-auth-cookie"
```

Should NOT contain any notifications with `"targetAdminOnly": true`

### 2. Test as Admin User
```bash
# Login as admin and fetch notifications
curl -X GET http://localhost:3000/api/notifications \
  -H "Cookie: your-admin-auth-cookie"
```

Should contain both regular AND admin-only notifications

### 3. Create Admin-Only Notification
Use the admin panel to create a notification with:
- `targetAdminOnly: true`
- Check that non-admin users don't see it
- Check that admin users DO see it

## Files Modified
- ✅ `/lib/notifications.ts` - Fixed `fetchNotificationsForUser()` logic

## Status
✅ Fixed - Non-admin users will only see notifications intended for them
✅ Admin users will see all relevant notifications including admin-only ones
✅ Proper filtering based on targetAll, targetAdminOnly, targetUserIds, and targetInstitutions

---

**Fixed Date:** November 20, 2025
**Issue:** Notifications not properly filtered by user role
**Solution:** Restructured OR query logic with explicit admin checks
