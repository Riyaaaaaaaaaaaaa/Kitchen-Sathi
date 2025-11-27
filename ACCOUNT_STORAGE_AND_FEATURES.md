# 📊 Account Storage & Authentication Features

## ✅ What's Been Implemented:

### 1. ✅ Verification at Registration (Already Working!)
**Flow**:
```
Register → Email Sent → Redirected to Verification Page → Enter Code → Dashboard
```

When you register:
1. Account is created in MongoDB
2. Verification email is sent immediately
3. You're redirected to `/verify-email` page
4. You must enter the 6-digit code from your email
5. Only after verification, you can access the dashboard

**This is already working!** ✅

---

### 2. ✅ "Forgot Password" Link (Just Added!)
**Location**: Login page, below the password field

**Flow**:
```
Login Page → Click "Forgot password?" → Enter Email → Receive Code → Reset Password
```

**How to use**:
1. Go to login page
2. Click **"Forgot password?"** link (below password field)
3. Enter your email address
4. Check your email for the 6-digit reset code
5. Enter the code and your new password
6. Done! You can now log in with your new password

---

### 3. 📊 Where Accounts Are Stored

## ❌ NOT in localStorage!
Accounts are **NOT** stored in your browser's localStorage. Only the authentication token is stored there.

## ✅ Stored in MongoDB Database

### Database Details:
- **Database Name**: `aajkyabanega`
- **Collection**: `users`
- **Location**: `mongodb://localhost:27017`

### What's Stored in Each User Document:
```javascript
{
  _id: ObjectId("..."),
  email: "your-email@example.com",
  name: "Your Name",
  passwordHash: "hashed_password",  // Encrypted, not plain text
  role: "user",
  isEmailVerified: true/false,
  emailVerificationCode: "123456",  // Temporary, expires in 10 min
  emailVerificationExpires: Date,
  passwordResetCode: "654321",      // Temporary, expires in 10 min
  passwordResetExpires: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔍 How to View Your MongoDB Data:

### Option 1: MongoDB Compass (GUI - Recommended)
1. **Download**: https://www.mongodb.com/try/download/compass
2. **Install** MongoDB Compass
3. **Connect** to: `mongodb://localhost:27017`
4. **Open** database: `aajkyabanega`
5. **View** collection: `users`
6. You'll see all registered users!

### Option 2: MongoDB Shell (Command Line)
```bash
# Open MongoDB shell
mongosh

# Switch to your database
use aajkyabanega

# View all users
db.users.find().pretty()

# Count users
db.users.countDocuments()

# Find specific user
db.users.findOne({ email: "riyakushwah280@gmail.com" })

# Check if email is verified
db.users.findOne({ email: "riyakushwah280@gmail.com" }, { isEmailVerified: 1 })
```

### Option 3: VS Code Extension
1. Install **MongoDB for VS Code** extension
2. Connect to `mongodb://localhost:27017`
3. Browse your databases and collections visually

---

## 🔐 What's in localStorage?

### Only the Authentication Token:
```javascript
localStorage.getItem('auth_token')
// Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### To View in Browser:
1. Press **F12** (open DevTools)
2. Go to **Application** tab
3. Click **Local Storage** → `http://localhost:5173`
4. You'll see: `auth_token` (JWT token)

### What the Token Contains:
```javascript
// Decoded JWT token (you can decode at jwt.io):
{
  sub: "user_id_here",      // User ID
  role: "user",             // User role
  iat: 1234567890,          // Issued at
  exp: 1234567890           // Expires at
}
```

**Note**: The token does NOT contain your password or sensitive data!

---

## 📊 Complete Data Storage Map:

### MongoDB (Database):
```
✅ User accounts (email, name, password hash)
✅ Email verification status
✅ Verification codes (temporary)
✅ Password reset codes (temporary)
✅ All user data (recipes, meal plans, grocery lists)
```

### localStorage (Browser):
```
✅ Authentication token only (JWT)
❌ NO passwords
❌ NO user data
❌ NO account information
```

### Session Storage (Browser):
```
❌ Nothing stored here
```

---

## 🔒 Security Features:

### Password Security:
- ✅ Passwords are **hashed** using bcrypt (not stored as plain text)
- ✅ Minimum 8 characters required
- ✅ Cannot be recovered (only reset)

### Email Verification:
- ✅ 6-digit codes
- ✅ Expire after 10 minutes
- ✅ Can be resent
- ✅ Required before login

### Password Reset:
- ✅ 6-digit codes sent via email
- ✅ Expire after 10 minutes
- ✅ Can be resent
- ✅ Old password not required

### JWT Tokens:
- ✅ Expire after 7 days
- ✅ Stored in localStorage
- ✅ Sent with every API request
- ✅ Validated by backend

---

## 🎯 Complete Authentication Flow:

### Registration:
```
1. User fills registration form
2. Backend creates account in MongoDB
3. Backend sends verification email
4. Frontend redirects to /verify-email
5. User enters 6-digit code
6. Backend verifies and marks account as verified
7. User is logged in (token stored in localStorage)
8. User redirected to dashboard
```

### Login:
```
1. User enters email and password
2. Backend checks credentials in MongoDB
3. Backend checks if email is verified
4. If verified: Generate JWT token
5. Frontend stores token in localStorage
6. User redirected to dashboard
```

### Forgot Password:
```
1. User clicks "Forgot password?" on login page
2. User enters email
3. Backend sends reset code via email
4. User enters code and new password
5. Backend updates password in MongoDB
6. User can now log in with new password
```

---

## 🧪 How to Check Your Account:

### Using MongoDB Compass:
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Open `aajkyabanega` database
4. Click `users` collection
5. Find your email: `riyakushwah280@gmail.com`
6. Check `isEmailVerified` field

### Using MongoDB Shell:
```bash
mongosh
use aajkyabanega
db.users.findOne({ email: "riyakushwah280@gmail.com" })
```

### Using Browser DevTools:
1. Press F12
2. Go to Application tab
3. Check Local Storage for `auth_token`
4. If token exists → You're logged in
5. If no token → You're logged out

---

## 📝 Summary:

| Feature | Status | Location |
|---------|--------|----------|
| Account Data | ✅ Working | MongoDB Database |
| Email Verification | ✅ Working | Happens at registration |
| Forgot Password | ✅ Just Added | Login page link |
| Auth Token | ✅ Working | localStorage |
| Password Security | ✅ Working | Hashed in MongoDB |
| Verification Codes | ✅ Working | Sent via email |

---

## 🎉 Everything You Requested:

1. ✅ **Verification at registration** - Already working!
2. ✅ **Forgot password on login page** - Just added!
3. ✅ **Know where accounts are stored** - MongoDB database!

**All features are implemented and working!** 🚀

