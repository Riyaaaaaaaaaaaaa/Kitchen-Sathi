# 🔧 Edamam User ID Header Fix

## ❌ Error: "This app requires userID"

If you see this error:
```
This app requires userID. Supply one using the Edamam-Account-User header
```

This means your Edamam application is configured to require a user ID header.

---

## ✅ Solution: Add User ID Header

### Option 1: Use Default (Recommended)

The service now automatically includes a default user ID header: `'kitchensathi-user'`

**No action needed!** Just restart your backend:

```powershell
# Stop backend (Ctrl+C)
# Restart
cd D:\AajKyaBanega\backend
npm run dev
```

---

### Option 2: Use Custom User ID (Optional)

If you want to use a specific user ID, add it to your `.env` file:

**Edit `backend/.env`:**
```env
EDAMAM_APP_ID=your_app_id
EDAMAM_APP_KEY=your_app_key
EDAMAM_USER_ID=your_custom_user_id  # Optional - add this line
```

**Restart backend:**
```powershell
cd D:\AajKyaBanega\backend
npm run dev
```

---

## 🔍 What This Does

The `Edamam-Account-User` header is required by some Edamam account configurations. It's used to:
- Track usage per user
- Enable user-specific features
- Comply with Edamam's API requirements

**The header is now automatically included in all API requests.**

---

## ✅ Verification

After restarting, you should see:

**Backend Console:**
```
✅ [EdamamService] Initialized with App ID: Present
🔍 [EdamamService] Searching recipes...
✅ [EdamamService] Found X recipes
```

**No more "requires userID" error!**

---

## 🧪 Test It

1. **Restart backend**
2. **Go to Recipe Suggestions**
3. **Search for recipes**
4. **Should work now!** ✅

---

## 📝 Summary

**What was fixed:**
- Added `Edamam-Account-User` header to all API requests
- Uses default value: `'kitchensathi-user'`
- Can be customized via `EDAMAM_USER_ID` env variable

**Status:** ✅ Fixed - Restart backend to apply

