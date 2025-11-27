# 🔧 Fix Email Verification Not Sending

## The Problem
Registration works, but no verification email is being sent because the backend running on port 5000 doesn't have the email environment variables set.

## The Solution

### Option 1: Restart Backend with Email Variables (RECOMMENDED)

1. **Stop the current backend**:
   - In your terminal where backend is running, press `Ctrl+C`

2. **Start backend with email variables**:
```powershell
cd D:\AajKyaBanega\backend
$env:EMAIL_HOST = "smtp.gmail.com"
$env:EMAIL_PORT = "587"
$env:EMAIL_SECURE = "false"
$env:EMAIL_USER = "kitchensathii@gmail.com"
$env:EMAIL_PASSWORD = "xceb cvkt wkbp twai"
$env:EMAIL_FROM = "KitchenSathi <kitchensathii@gmail.com>"
$env:FRONTEND_URL = "http://localhost:5173"
npx tsx src/index.ts
```

3. **Look for this line** in the startup logs:
```
✅ [EmailService] Initialized successfully
```

If you see this, emails will work! ✅

---

###Option 2: Create .env File (PERMANENT FIX)

1. **Create a file named `.env`** in `D:\AajKyaBanega\` (project root)

2. **Add this content**:
```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=kitchensathii@gmail.com
EMAIL_PASSWORD=xceb cvkt wkbp twai
EMAIL_FROM=KitchenSathi <kitchensathii@gmail.com>
FRONTEND_URL=http://localhost:5173

# Other variables (optional)
MONGODB_URI=mongodb://127.0.0.1:27017/aajkyabanega
PORT=5000
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

3. **Restart backend**:
```powershell
cd D:\AajKyaBanega\backend
npx tsx src/index.ts
```

The backend will automatically load variables from `.env`! ✅

---

## How to Test

1. **Register a new account** with a fresh email
2. **Check backend logs** - you should see:
   ```
   ✅ [EmailService] Initialized successfully
   [routes] 🔐 Auth route hit: POST /register
   ✅ [EmailService] Email sent successfully to your-email@example.com
   [auth] ✅ User registered: your-email@example.com (verification email sent: true)
   ```

3. **Check your email inbox** (or spam folder)
4. **You'll receive** a beautifully formatted email with a 6-digit code! 📧

---

## Quick Copy-Paste Command

**For PowerShell** (use this in your backend terminal):
```powershell
cd D:\AajKyaBanega\backend; $env:EMAIL_HOST = "smtp.gmail.com"; $env:EMAIL_PORT = "587"; $env:EMAIL_SECURE = "false"; $env:EMAIL_USER = "kitchensathii@gmail.com"; $env:EMAIL_PASSWORD = "xceb cvkt wkbp twai"; $env:EMAIL_FROM = "KitchenSathi <kitchensathii@gmail.com>"; $env:FRONTEND_URL = "http://localhost:5173"; npx tsx src/index.ts
```

---

## What's Fixed

✅ **Password show/hide toggle** - Eye icon added to both Login and Register forms  
✅ **Email service code** - Already working (we tested it successfully)  
🔄 **Just need to restart backend with correct environment variables**

---

## Need Help?

If emails still don't work after following these steps, check:
1. Gmail App Password is correct (16 characters): `xceb cvkt wkbp twai`
2. Backend logs show `✅ [EmailService] Initialized successfully`
3. Check spam/junk folder in your email
4. Verify the email address you're registering with is valid

The email system is fully functional - it just needs the environment variables! 🚀

