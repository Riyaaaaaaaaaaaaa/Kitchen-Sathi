# 🔧 Environment Variables Setup Instructions

## ⚠️ IMPORTANT: Set Environment Variables Permanently

Currently, the email environment variables are set only for the current PowerShell session. When you close the terminal, they'll be lost.

---

## Option 1: Create .env File (RECOMMENDED)

### Step 1: Create `.env` file in project root

Navigate to `D:\AajKyaBanega\` and create a file named `.env` with this content:

```env
# MongoDB Connection
MONGODB_URI=mongodb://127.0.0.1:27017/aajkyabanega

# Server Configuration
PORT=5000
CORS_ORIGIN=http://localhost:5173

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=kitchensathii@gmail.com
EMAIL_PASSWORD=xceb cvkt wkbp twai
EMAIL_FROM=KitchenSathi <kitchensathii@gmail.com>

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Edamam API (if you have credentials)
# EDAMAM_APP_ID=your_app_id
# EDAMAM_APP_KEY=your_app_key

# Cloudinary (if you have credentials)
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret
```

### Step 2: Make sure `.env` is in `.gitignore`

Check that your `.gitignore` file includes:
```
.env
.env.local
.env.*.local
```

### Step 3: Restart Backend

```powershell
cd D:\AajKyaBanega\backend
npx tsx src/index.ts
```

The backend will automatically load the `.env` file! ✅

---

## Option 2: PowerShell Profile (For Development)

### Step 1: Edit your PowerShell profile

```powershell
notepad $PROFILE
```

### Step 2: Add these lines to the profile

```powershell
# KitchenSathi Email Configuration
$env:EMAIL_HOST = "smtp.gmail.com"
$env:EMAIL_PORT = "587"
$env:EMAIL_SECURE = "false"
$env:EMAIL_USER = "kitchensathii@gmail.com"
$env:EMAIL_PASSWORD = "xceb cvkt wkbp twai"
$env:EMAIL_FROM = "KitchenSathi <kitchensathii@gmail.com>"
$env:FRONTEND_URL = "http://localhost:5173"
```

### Step 3: Reload profile

```powershell
. $PROFILE
```

Now the variables will be set every time you open PowerShell! ✅

---

## Option 3: Windows Environment Variables (System-Wide)

### Step 1: Open System Properties
1. Press `Win + R`
2. Type: `sysdm.cpl`
3. Press Enter

### Step 2: Go to Environment Variables
1. Click "Advanced" tab
2. Click "Environment Variables" button

### Step 3: Add User Variables
Click "New" under "User variables" and add each one:

| Variable Name | Value |
|--------------|-------|
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_SECURE` | `false` |
| `EMAIL_USER` | `kitchensathii@gmail.com` |
| `EMAIL_PASSWORD` | `xceb cvkt wkbp twai` |
| `EMAIL_FROM` | `KitchenSathi <kitchensathii@gmail.com>` |
| `FRONTEND_URL` | `http://localhost:5173` |

### Step 4: Restart Terminal
Close and reopen your terminal/PowerShell for changes to take effect.

---

## ✅ Verify It's Working

After setting up, verify the variables are loaded:

```powershell
# Check if variables are set
echo $env:EMAIL_USER
# Should output: kitchensathii@gmail.com

# Start backend
cd D:\AajKyaBanega\backend
npx tsx src/index.ts

# Look for this in the logs:
# ✅ [EmailService] Initialized successfully
```

---

## 🔒 Security Notes

### For Development:
- ✅ `.env` file is fine for local development
- ✅ Make sure `.env` is in `.gitignore`
- ⚠️ Never commit `.env` to Git

### For Production:
- 🔐 Use environment variables from your hosting platform
- 🔐 Use secrets management (AWS Secrets Manager, etc.)
- 🔐 Rotate app passwords regularly
- 🔐 Use dedicated email service (SendGrid, AWS SES, etc.)

---

## 📝 Quick Commands

### Start Backend (with .env file)
```powershell
cd D:\AajKyaBanega\backend
npx tsx src/index.ts
```

### Start Backend (with manual env vars - temporary)
```powershell
cd D:\AajKyaBanega\backend
$env:EMAIL_HOST = "smtp.gmail.com"; $env:EMAIL_PORT = "587"; $env:EMAIL_SECURE = "false"; $env:EMAIL_USER = "kitchensathii@gmail.com"; $env:EMAIL_PASSWORD = "xceb cvkt wkbp twai"; $env:EMAIL_FROM = "KitchenSathi <kitchensathii@gmail.com>"; $env:FRONTEND_URL = "http://localhost:5173"; npx tsx src/index.ts
```

### Start Frontend
```powershell
cd D:\AajKyaBanega\frontend
npm run dev
```

---

## 🎯 Recommended Setup

**For this project, we recommend Option 1 (`.env` file)** because:
- ✅ Easy to manage
- ✅ Project-specific
- ✅ Works with `dotenv/config`
- ✅ Standard practice in Node.js
- ✅ Easy to share template (`.env.example`)

---

## 📋 Create .env.example (Optional)

Create a template for other developers:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=YourApp <your-email@gmail.com>

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

Commit this file to Git, but keep `.env` in `.gitignore`! ✅

---

## 🚀 You're All Set!

Once you've set up the environment variables using any of the above methods, the email verification system will work automatically! 📧✨

