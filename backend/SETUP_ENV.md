# 🔧 Backend Environment Setup

## ⚠️ IMPORTANT: Create `.env` File

The backend needs a `.env` file to load email and other configuration.

### 📝 Steps to Create `.env` File:

1. **Open File Explorer** and navigate to: `D:\AajKyaBanega\backend\`

2. **Create a new file** named `.env` (exactly, with the dot at the beginning)
   - Right-click → New → Text Document
   - Name it `.env` (remove the `.txt` extension)
   - Windows might warn you about changing extensions - click "Yes"

3. **Open the `.env` file** with Notepad or VS Code

4. **Copy and paste** the following content:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/aajkyabanega

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production-123456789

# Edamam API (Recipe Search)
EDAMAM_APP_ID=1500584f
EDAMAM_APP_KEY=721d0ae56f0fff7010e5ccbec75edeb6

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=dqwvlnsgj
CLOUDINARY_API_KEY=447433452683274
CLOUDINARY_API_SECRET=TnVtMtTlZgmrCRkNXBBRb9kKHGc

# Email Service (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=kitchensathii@gmail.com
EMAIL_PASSWORD=xceb cvkt wkbp twai
EMAIL_FROM=KitchenSathi <kitchensathii@gmail.com>

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Server Port
PORT=5000
```

5. **Save the file** (Ctrl+S)

6. **Restart the backend** - The old way won't work anymore!
   - Stop the current backend (Ctrl+C in the backend terminal)
   - Just run: `npx tsx src/index.ts`
   - The `.env` file will automatically load all variables!

---

## ✅ How to Verify It's Working:

After restarting the backend, you should see:
```
✅ [EmailService] Initialized successfully
✅ [EdamamService] Initialized with App ID: Present
[Cloudinary] Configured: true
```

If you see all three ✅, emails will work!

---

## 🚫 What NOT to Do:

❌ Don't manually set environment variables anymore  
❌ Don't use the long PowerShell command  
✅ Just run `npx tsx src/index.ts` - the `.env` file handles everything!

---

## 🎯 Quick Test After Setup:

1. Restart backend with `npx tsx src/index.ts`
2. Look for `✅ [EmailService] Initialized successfully`
3. Register a new user
4. Check your email!

