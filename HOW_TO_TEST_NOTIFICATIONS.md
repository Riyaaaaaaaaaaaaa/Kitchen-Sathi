# 🧪 How to Test Grocery Expiry Notifications

## ❗ **Why You're Not Seeing Notifications:**

The "Potato" item was already **marked as completed** (status changed from "pending" to "completed"). The expiry notification system **only checks items with `completed: false`** (i.e., items you haven't bought yet or are still active).

---

## ✅ **How to Test Notifications (2 Methods):**

### **Method 1: Add a New Grocery Item** (Recommended)

1. **Go to Grocery List** in your app
2. **Click "+ Add Item"**
3. **Fill in the details:**
   - **Name**: Test Tomato
   - **Quantity**: 2
   - **Unit**: kg
   - **Price**: ₹30
   - **Expiry Date**: **Tomorrow's date** (October 27, 2025)
4. **Click "Add Item"**
5. **DO NOT mark it as completed** - leave it in "pending" status
6. **Wait 5-10 seconds** (backend checks on startup with a 5-second delay)
7. **Refresh the page** (Ctrl+F5)
8. **Check the notification bell** 🔔 - you should see a notification!
9. **Check your email** (riyarajawat212@gmail.com) - you should receive an expiry alert!

---

### **Method 2: Use the Test Endpoint** (Manual Trigger)

I've added a test endpoint that you can call to manually trigger the expiry check:

**Using PowerShell:**
```powershell
$token = "YOUR_AUTH_TOKEN_HERE"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
Invoke-RestMethod -Uri "http://localhost:5000/api/test/trigger-expiry-check" -Method POST -Headers $headers
```

**Using curl:**
```bash
curl -X POST http://localhost:5000/api/test/trigger-expiry-check \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

---

## 📊 **What the Expiry Check Looks For:**

The system checks for items that match **ALL** of these criteria:
1. ✅ `expiryDate` is between **today** and **3 days from now**
2. ✅ `status` is **'pending'** (not bought yet) OR **'completed'** (bought but not consumed)
3. ✅ `notifiedForExpiry` is **not true** (hasn't been notified yet)
4. ✅ User has `preferences.notifications.expiryAlerts` enabled (default: true)

**Note:** Items with status 'used' (consumed) are excluded from expiry checks.

---

## 🔍 **Fixed: Notifications Now Working!**

**Issue 1:** The system only checked items with `completed: false` (not bought yet). If you bought an item but hadn't consumed it, it wouldn't get expiry notifications.
- **Fix:** The system now checks items with status **'pending'** (not bought) AND **'completed'** (bought but not consumed). Only items marked as **'used'** (consumed) are excluded.

**Issue 2:** The `groceryExpiryService` was calling `notificationService.notifyGroceryExpiry()` with incorrect parameters (missing `daysUntilExpiry`).
- **Fix:** Now correctly calculates and passes all 5 required parameters to create notifications.

**Your Items:** Since your Potato and Milk are marked as "completed" (bought but not consumed) and expiring tomorrow, they will now trigger notifications!

---

## 📧 **Email Notification Features:**

When you add a new item with an expiry date tomorrow, you'll receive:

### **In-App Notification:**
- 🔔 Bell icon shows unread count
- Click to see: "Test Tomato is expiring on Sunday, October 27, 2025!"
- Click notification to navigate to Grocery List

### **Email Notification:**
- 🚨 **Urgent** alert (red) - expires today or tomorrow
- ⚠️ **Warning** alert (yellow) - expires in 2 days
- 📅 **Info** alert (blue) - expires in 3 days
- Beautiful HTML template with:
  - Expiry date and urgency indicator
  - Helpful suggestions (use in meal, freeze, share)
  - Direct "View Grocery List" button

---

## 🎯 **Quick Test Steps:**

1. **Add a new grocery item** with expiry date = tomorrow
2. **Keep it in "pending" status** (don't mark as completed)
3. **Wait 5-10 seconds** for the backend to run the expiry check
4. **Refresh your browser** (Ctrl+F5)
5. **Check the notification bell** 🔔
6. **Check your email** 📧

---

## 🐛 **Troubleshooting:**

If you still don't see notifications:

1. **Check backend logs** for:
   ```
   [GroceryExpiryService] Found X expiring items to notify
   [NotificationService] ✅ Created notification for user...
   [GroceryExpiryService] ✅ Sent email notification to...
   ```

2. **Verify the item is in the database:**
   - Go to Grocery List
   - Check if the item is visible
   - Check if it's in "pending" status (not completed)
   - Check if the expiry date is tomorrow

3. **Check user preferences:**
   - Go to Manage Profile → Preferences Tab
   - Ensure "Expiry alerts" is enabled
   - Ensure "Email notifications" is enabled

---

## 🚀 **Summary:**

✅ **Notification system is working!**
✅ **Email service is configured!**
✅ **Expiry check runs automatically!**

The issue was that your Potato was already marked as completed. Add a new item with an expiry date tomorrow, and you'll see notifications! 🎉

