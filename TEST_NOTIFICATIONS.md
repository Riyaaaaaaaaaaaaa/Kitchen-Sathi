# 🧪 Testing Grocery Expiry Notifications

## Problem
Bread is expiring tomorrow but no notifications are being sent.

## Root Causes Found

1. **No Cron Scheduler**: The expiry check was only running once on server startup (after 5 seconds), not daily at midnight
2. **`notifiedForExpiry` Flag**: Once an item is notified, it won't be notified again (line 147 in groceryExpiryService.ts)
3. **No Manual Trigger**: No way to test notifications without waiting for server restart

## Fixes Applied

### 1. Added Cron Job Scheduler
- **File**: `backend/src/services/groceryExpiryService.ts`
- **Change**: Added `initializeCronJob()` method that runs daily at midnight (00:00)
- **Impact**: Notifications will now run automatically every day

### 2. Added Test Endpoints
- **File**: `backend/src/routes/index.ts`
- **Endpoints**:
  - `POST /api/test/reset-notifications` - Reset `notifiedForExpiry` flags
  - `POST /api/test/trigger-expiry-check` - Manually trigger expiry check

## Testing Steps

### Step 1: Restart Backend Server

Stop your current server (Ctrl+C) and restart:

```bash
cd D:\AajKyaBanega\backend
npx tsx src/index.ts
```

You should see:
```
[startup] ✅ Grocery expiry service imported
[GroceryExpiryService] ✅ Cron job initialized (runs daily at midnight)
[startup] 🔍 Running initial expiry check...
```

### Step 2: Reset Notification Flags

Use this cURL command or Postman:

```bash
curl -X POST http://localhost:5000/api/test/reset-notifications \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**Or use the browser console** (while logged into your app):

```javascript
fetch('http://localhost:5000/api/test/reset-notifications', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
}).then(r => r.json()).then(console.log);
```

Expected response:
```json
{
  "success": true,
  "message": "Reset notification flags for 3 items",
  "modifiedCount": 3
}
```

### Step 3: Trigger Expiry Check

```bash
curl -X POST http://localhost:5000/api/test/trigger-expiry-check \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**Or in browser console**:

```javascript
fetch('http://localhost:5000/api/test/trigger-expiry-check', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
}).then(r => r.json()).then(console.log);
```

Expected response:
```json
{
  "success": true,
  "message": "Expiry check triggered successfully. Check your notifications!"
}
```

### Step 4: Check Notifications

1. **In-App**: Click the bell icon in your dashboard
2. **Email**: Check your inbox (riyarajawat212@gmail.com)

You should see:
- 🔔 In-app notification: "Bread expires tomorrow"
- 📧 Email: "⚠️ Bread Expiring Soon!"

## Expected Backend Logs

When the expiry check runs, you should see:

```
[GroceryExpiryService] Starting check for expiring groceries...
[GroceryExpiryService] Found 1 expiring items to notify
[NotificationService] ✅ Created notification: grocery_expiry for user 68fdcdc1adceafef77f75f15
✅ [EmailService] Expiry alert sent to riyarajawat212@gmail.com for Bread
[GroceryExpiryService] ✅ Sent email notification to riyarajawat212@gmail.com for Bread
[GroceryExpiryService] ✅ Completed expiry check. Notified for 1 items.
```

## Troubleshooting

### Issue: Still no notifications after Step 3

**Check 1**: Verify item status
```javascript
// In browser console
fetch('http://localhost:5000/api/groceries', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
}).then(r => r.json()).then(data => {
  const bread = data.find(item => item.name === 'Bread');
  console.log('Bread item:', bread);
  console.log('Status:', bread.status);
  console.log('Expiry Date:', bread.expiryDate);
  console.log('Notified:', bread.notifiedForExpiry);
});
```

Expected:
- `status`: 'completed' (bought)
- `expiryDate`: "2025-10-28T00:00:00.000Z"
- `notifiedForExpiry`: false (after reset)

**Check 2**: Verify user preferences

```javascript
// In browser console
fetch('http://localhost:5000/api/profile', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
}).then(r => r.json()).then(data => {
  console.log('Notification Preferences:', data.preferences?.notifications);
});
```

Expected:
```json
{
  "email": true,
  "inApp": true,
  "expiryAlerts": true
}
```

**Check 3**: Check backend logs for errors

Look for error messages in the terminal running the backend.

### Issue: Notifications work but email not received

**Possible causes**:
1. Gmail App Password incorrect
2. Email in spam folder
3. Email service rate limit reached

**Check EMAIL_USER and EMAIL_PASS** in `backend/.env`:
```env
EMAIL_USER=riyarajawat212@gmail.com
EMAIL_PASS=your_16_character_app_password
```

**Generate new App Password**:
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Copy the 16-character password
4. Update `.env` file
5. Restart backend server

## Automated Testing (Future)

For continuous testing, you can add this to your frontend:

**Create**: `frontend/src/lib/testUtils.ts`

```typescript
export const testNotifications = async () => {
  const token = localStorage.getItem('token');
  
  // Reset flags
  await fetch('http://localhost:5000/api/test/reset-notifications', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  // Trigger check
  const response = await fetch('http://localhost:5000/api/test/trigger-expiry-check', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const result = await response.json();
  console.log('Test result:', result);
  
  // Wait for notifications to be created
  setTimeout(() => {
    window.location.reload();
  }, 2000);
};
```

Then in browser console:
```javascript
testNotifications();
```

## Production Deployment Notes

**Before deploying**, remember:

1. **Remove or secure test endpoints**:
   ```typescript
   // Only allow in development
   if (process.env.NODE_ENV === 'development') {
     router.post('/test/trigger-expiry-check', ...);
     router.post('/test/reset-notifications', ...);
   }
   ```

2. **Cron schedule**: Currently set to midnight (00:00). Adjust based on user timezone:
   ```typescript
   // Run at 8 AM instead
   cron.schedule('0 8 * * *', ...);
   ```

3. **Email rate limits**: Gmail has sending limits. For production, consider:
   - SendGrid
   - AWS SES
   - Mailgun

## Summary

✅ **Fixed**:
- Added cron job for daily checks
- Added test endpoints for manual testing
- Server will now check expiring items every day at midnight

✅ **To Test**:
1. Restart backend server
2. Run `/api/test/reset-notifications`
3. Run `/api/test/trigger-expiry-check`
4. Check notifications and email

✅ **Expected Results**:
- In-app notification for Bread expiring tomorrow
- Email sent to riyarajawat212@gmail.com

---

**Last Updated**: December 2024  
**Status**: Fixed and Ready for Testing

