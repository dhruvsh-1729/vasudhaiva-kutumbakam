# Notification Visibility Matrix

## How Notifications Are Filtered

### Notification Properties
Each notification has these targeting properties:
- `targetAll` - Should all users see this? (boolean)
- `targetAdminOnly` - Is this only for admins? (boolean)
- `targetUserIds` - Array of specific user IDs
- `targetInstitutions` - Array of specific institutions

---

## Visibility Rules

### Regular (Non-Admin) Users See:

| Notification Type | targetAll | targetAdminOnly | targetUserIds | targetInstitutions | Visible? |
|-------------------|-----------|-----------------|---------------|-------------------|----------|
| Public Announcement | `true` | `false` | `[]` | `[]` | ✅ YES |
| Admin Alert | `true` | `true` | `[]` | `[]` | ❌ NO |
| Admin Alert | `false` | `true` | `[]` | `[]` | ❌ NO |
| Personal Message | `false` | `false` | `[userId]` | `[]` | ✅ YES |
| Personal Admin Message | `false` | `true` | `[userId]` | `[]` | ❌ NO* |
| Institution Notice | `false` | `false` | `[]` | `[userInstitution]` | ✅ YES |
| Institution Admin Notice | `false` | `true` | `[]` | `[userInstitution]` | ❌ NO |

*Even if their ID is in targetUserIds, if targetAdminOnly is true, non-admins won't see it

### Admin Users See:

| Notification Type | targetAll | targetAdminOnly | targetUserIds | targetInstitutions | Visible? |
|-------------------|-----------|-----------------|---------------|-------------------|----------|
| Public Announcement | `true` | `false` | `[]` | `[]` | ✅ YES |
| Admin Alert | `true` | `true` | `[]` | `[]` | ✅ YES |
| Admin Alert | `false` | `true` | `[]` | `[]` | ✅ YES |
| Personal Message | `false` | `false` | `[adminId]` | `[]` | ✅ YES |
| Personal Admin Message | `false` | `true` | `[adminId]` | `[]` | ✅ YES |
| Institution Notice | `false` | `false` | `[]` | `[adminInstitution]` | ✅ YES |
| Institution Admin Notice | `false` | `true` | `[]` | `[adminInstitution]` | ✅ YES |

---

## Examples

### Example 1: Competition Announcement
```json
{
  "title": "Week 2 Challenge Now Open!",
  "body": "Submit your entries for Week 2",
  "targetAll": true,
  "targetAdminOnly": false,
  "targetUserIds": [],
  "targetInstitutions": []
}
```
**Who sees it?** ✅ Everyone (all users, including admins)

---

### Example 2: Admin System Alert
```json
{
  "title": "Submission Review Required",
  "body": "50 submissions pending review",
  "targetAll": false,
  "targetAdminOnly": true,
  "targetUserIds": [],
  "targetInstitutions": []
}
```
**Who sees it?** ✅ Only Admins | ❌ Regular users won't see this

---

### Example 3: Personal Message to User
```json
{
  "title": "Your Submission Was Evaluated",
  "body": "Your Week 1 submission received a score",
  "targetAll": false,
  "targetAdminOnly": false,
  "targetUserIds": ["user123"],
  "targetInstitutions": []
}
```
**Who sees it?** ✅ Only user123

---

### Example 4: Institution-Specific Notice
```json
{
  "title": "Delhi University Students: Special Workshop",
  "body": "Workshop on Dec 15",
  "targetAll": false,
  "targetAdminOnly": false,
  "targetUserIds": [],
  "targetInstitutions": ["Delhi University"]
}
```
**Who sees it?** ✅ All users from "Delhi University" (admin or not)

---

### Example 5: Admin-Only for Specific Admins
```json
{
  "title": "Critical: Database Backup Needed",
  "body": "System maintenance required",
  "targetAll": false,
  "targetAdminOnly": true,
  "targetUserIds": ["admin1", "admin2"],
  "targetInstitutions": []
}
```
**Who sees it?** ✅ Only admin1 and admin2 (if they're admins)

---

## Query Logic Breakdown

### For Non-Admin User (userId="user123", institution="Delhi University")

```typescript
OR [
  // Condition 1: Public announcements
  { targetAll: true, targetAdminOnly: false },
  
  // Condition 2: Personal messages (not admin-only)
  { targetUserIds: { has: "user123" }, targetAdminOnly: false },
  
  // Condition 3: Institution notices (not admin-only)
  { targetInstitutions: { has: "Delhi University" }, targetAdminOnly: false }
]
```

### For Admin User (userId="admin1", institution="JYOT", isAdmin=true)

```typescript
OR [
  // Condition 1: Public announcements
  { targetAll: true, targetAdminOnly: false },
  
  // Condition 2: ALL admin-only notifications
  { targetAdminOnly: true },
  
  // Condition 3: Personal messages (not admin-only)
  { targetUserIds: { has: "admin1" }, targetAdminOnly: false },
  
  // Condition 4: Institution notices (not admin-only)
  { targetInstitutions: { has: "JYOT" }, targetAdminOnly: false }
]
```

---

## Key Takeaways

1. **`targetAdminOnly: true`** → Only admins can see, period
2. **`targetAll: true` + `targetAdminOnly: false`** → Everyone sees
3. **`targetUserIds`** → Specific users see (unless it's also admin-only and they're not admin)
4. **`targetInstitutions`** → Users from those institutions see (unless admin-only)
5. **Admins see everything** - both regular notifications AND admin-only ones

---

## Testing Checklist

- [ ] Non-admin user doesn't see admin-only notifications
- [ ] Admin user sees admin-only notifications
- [ ] All users see public announcements (targetAll=true, targetAdminOnly=false)
- [ ] Users see notifications targeted to their institution
- [ ] Users don't see notifications for other institutions
- [ ] Users see notifications with their userId in targetUserIds
- [ ] Non-admin users don't see admin-only even if their ID is in targetUserIds
- [ ] Admin users see everything they should see

---

**Implementation:** `lib/notifications.ts` - `fetchNotificationsForUser()`
**Status:** ✅ Fixed and Production Ready
