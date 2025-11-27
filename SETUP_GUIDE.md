# 🚀 KitchenSathi - Developer Setup Guide

Complete step-by-step guide for setting up KitchenSathi development environment.

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [System Requirements](#system-requirements)
- [Installation Steps](#installation-steps)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

2. **MongoDB** (v6.0 or higher)
   - **Option A**: Local Installation
     - Download: https://www.mongodb.com/try/download/community
     - Install MongoDB Community Edition
   - **Option B**: MongoDB Atlas (Cloud)
     - Sign up: https://www.mongodb.com/cloud/atlas
     - Create free cluster

3. **Git**
   - Download: https://git-scm.com/downloads
   - Verify installation:
     ```bash
     git --version
     ```

### Optional but Recommended

4. **MongoDB Compass** (GUI for MongoDB)
   - Download: https://www.mongodb.com/products/compass

5. **Postman** (API Testing)
   - Download: https://www.postman.com/downloads/

6. **VS Code** or **Cursor** (Code Editor)
   - VS Code: https://code.visualstudio.com/
   - Cursor: https://cursor.sh/

---

## 💻 System Requirements

### Minimum Requirements
- **OS**: Windows 10/11, macOS 10.15+, or Linux
- **RAM**: 4GB
- **Disk Space**: 2GB free space
- **Internet**: Required for package installation and external APIs

### Recommended Requirements
- **RAM**: 8GB or more
- **Disk Space**: 5GB free space
- **CPU**: Multi-core processor

---

## 📥 Installation Steps

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/kitchensathi.git

# Navigate to project directory
cd kitchensathi
```

### Step 2: Install Backend Dependencies

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Expected output:
# added XXX packages in XXs
```

**Backend Dependencies Include**:
- express (Web framework)
- mongoose (MongoDB ODM)
- typescript (Type safety)
- jsonwebtoken (Authentication)
- bcryptjs (Password hashing)
- zod (Validation)
- nodemailer (Email service)
- cloudinary (Image storage)
- node-cron (Scheduled tasks)
- multer (File uploads)
- cors (Cross-origin requests)

### Step 3: Install Frontend Dependencies

```bash
# Navigate to frontend directory (from project root)
cd ../frontend

# Install dependencies
npm install

# Expected output:
# added XXX packages in XXs
```

**Frontend Dependencies Include**:
- react (UI library)
- react-router-dom (Routing)
- typescript (Type safety)
- tailwindcss (Styling)
- recharts (Data visualization)
- heroicons (Icons)
- vite (Build tool)

---

## ⚙️ Environment Configuration

### Backend Environment Variables

1. **Create `.env` file** in the `backend` directory:

```bash
cd backend
touch .env  # On Windows: type nul > .env
```

2. **Add the following configuration**:

```env
# =================================
# SERVER CONFIGURATION
# =================================
PORT=5000
NODE_ENV=development

# =================================
# DATABASE
# =================================
# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/kitchensathi

# Option 2: MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/kitchensathi?retryWrites=true&w=majority

# =================================
# JWT SECRET
# =================================
# Generate a strong secret key (use: openssl rand -base64 32)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_use_long_random_string

# =================================
# EDAMAM API (Recipe Data)
# =================================
# Get your API credentials from: https://developer.edamam.com/
# 1. Sign up for free account
# 2. Create application for "Recipe Search API"
# 3. Copy App ID and App Key
EDAMAM_APP_ID=your_edamam_app_id_here
EDAMAM_APP_KEY=your_edamam_app_key_here

# =================================
# CLOUDINARY (Image Storage)
# =================================
# Get your credentials from: https://cloudinary.com/
# 1. Sign up for free account
# 2. Go to Dashboard
# 3. Copy Cloud Name, API Key, and API Secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# =================================
# EMAIL SERVICE (Gmail SMTP)
# =================================
# Gmail setup:
# 1. Use your Gmail address
# 2. Generate App Password (not regular password):
#    - Go to: https://myaccount.google.com/apppasswords
#    - Select "Mail" and "Other (Custom name)"
#    - Copy the generated 16-character password
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_app_password

# =================================
# FRONTEND URL
# =================================
# Used for email links and CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment Variables

1. **Create `.env` file** in the `frontend` directory:

```bash
cd ../frontend
touch .env  # On Windows: type nul > .env
```

2. **Add the following configuration**:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000
```

### Environment Variables Checklist

- [ ] Backend `.env` file created
- [ ] Frontend `.env` file created
- [ ] MongoDB URI configured
- [ ] JWT_SECRET set (use strong random string)
- [ ] Edamam API credentials obtained
- [ ] Cloudinary credentials obtained
- [ ] Gmail App Password generated
- [ ] All URLs match your setup

---

## 🗄️ Database Setup

### Option A: Local MongoDB Setup

#### Windows

1. **Install MongoDB**:
   - Download MongoDB Community Server
   - Run installer (choose "Complete" installation)
   - Install as Windows Service

2. **Start MongoDB**:
   ```bash
   # MongoDB should start automatically as a service
   # To verify:
   mongosh
   ```

3. **Create Database**:
   ```javascript
   // In mongosh:
   use kitchensathi
   db.createCollection("users")
   ```

#### macOS

1. **Install MongoDB** (using Homebrew):
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community@6.0
   ```

2. **Start MongoDB**:
   ```bash
   brew services start mongodb-community@6.0
   ```

3. **Verify**:
   ```bash
   mongosh
   ```

#### Linux (Ubuntu/Debian)

1. **Install MongoDB**:
   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

2. **Start MongoDB**:
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

3. **Verify**:
   ```bash
   mongosh
   ```

### Option B: MongoDB Atlas (Cloud) Setup

1. **Create Account**:
   - Go to: https://www.mongodb.com/cloud/atlas
   - Sign up for free account

2. **Create Cluster**:
   - Click "Build a Database"
   - Choose "FREE" tier (M0 Sandbox)
   - Select cloud provider and region
   - Click "Create Cluster"

3. **Configure Access**:
   - **Database Access**:
     - Click "Database Access" in left menu
     - Add new database user
     - Set username and password
     - Grant "Read and write to any database" role
   
   - **Network Access**:
     - Click "Network Access" in left menu
     - Add IP Address
     - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
     - For production: Add specific IP addresses

4. **Get Connection String**:
   - Click "Database" in left menu
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Update `MONGODB_URI` in backend `.env`

### Verify Database Connection

```bash
# From backend directory
cd backend

# Create a test script
cat > test-db.js << 'EOF'
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Database connected successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });
EOF

# Run test
node test-db.js
```

---

## ▶️ Running the Application

### Development Mode

#### Start Backend Server

```bash
# From backend directory
cd backend

# Start development server (with auto-reload)
npm run dev

# Expected output:
# ✅ [EmailService] Initialized successfully
# ✅ [EdamamService] Initialized with App ID: Present
# [Cloudinary] Configured: true
# [startup] connecting to MongoDB...
# [startup] connected to MongoDB
# [startup] ✅ Grocery expiry service initialized
# 🌐 API running on http://localhost:5000
# 📊 Health check: http://localhost:5000/api/health
```

**Backend is ready when you see**: `🌐 API running on http://localhost:5000`

#### Start Frontend Development Server

```bash
# Open new terminal
# From frontend directory
cd frontend

# Start development server
npm run dev

# Expected output:
#   VITE v4.x.x  ready in XXX ms
#   ➜  Local:   http://localhost:5173/
#   ➜  Network: use --host to expose
```

**Frontend is ready when you see**: `➜  Local:   http://localhost:5173/`

### Access the Application

1. **Frontend**: http://localhost:5173
2. **Backend API**: http://localhost:5000
3. **API Health Check**: http://localhost:5000/api/health

### Verify Everything Works

1. **Open Browser**: Navigate to http://localhost:5173
2. **Register Account**:
   - Click "Get Started"
   - Fill registration form
   - Submit
3. **Check Email**: You should receive verification code
4. **Verify Email**: Enter code
5. **Login**: You should be redirected to dashboard

---

## 🔧 Development Workflow

### Project Structure

```
kitchensathi/
├── backend/
│   ├── src/
│   │   ├── models/          # Database schemas
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Express middleware
│   │   └── index.ts         # Server entry point
│   ├── .env                 # Environment variables
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # React Context
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # API clients
│   │   └── App.tsx          # Main component
│   ├── .env                 # Environment variables
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

### Common Development Tasks

#### Add New API Endpoint

1. **Create Route Handler** (`backend/src/routes/yourRoute.ts`):
```typescript
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  // Your logic here
  res.json({ message: 'Success' });
});

export default router;
```

2. **Register Route** (`backend/src/routes/index.ts`):
```typescript
import yourRouter from './yourRoute.js';
router.use('/your-endpoint', yourRouter);
```

3. **Create API Client** (`frontend/src/lib/yourApi.ts`):
```typescript
import { request } from './api';

export const getData = async () => {
  return request('/api/your-endpoint', { method: 'GET' });
};
```

#### Add New React Component

1. **Create Component** (`frontend/src/components/YourComponent.tsx`):
```typescript
import React from 'react';

export const YourComponent: React.FC = () => {
  return (
    <div>
      {/* Your JSX */}
    </div>
  );
};
```

2. **Add Route** (if needed) in `App.tsx`:
```typescript
<Route path="/your-path" element={<YourComponent />} />
```

#### Database Model Changes

1. **Update Model** (`backend/src/models/YourModel.ts`)
2. **Run Migration** (if needed)
3. **Update TypeScript Interfaces**
4. **Test Changes**

### Code Style Guidelines

#### TypeScript
```typescript
// Use interfaces for object shapes
interface User {
  name: string;
  email: string;
}

// Use type for unions/primitives
type Status = 'pending' | 'completed';

// Use async/await instead of promises
const fetchData = async () => {
  const data = await apiCall();
  return data;
};
```

#### React Components
```typescript
// Use functional components
export const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  // Use hooks
  const [state, setState] = useState<Type>(initialValue);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  return <div>{/* JSX */}</div>;
};
```

---

## 🧪 Testing

### Manual Testing

#### API Testing with Postman

1. **Import Collection**:
   - Create new collection "KitchenSathi API"
   - Add requests for each endpoint

2. **Test Authentication**:
   ```
   POST http://localhost:5000/api/auth/register
   Body: {
     "name": "Test User",
     "email": "test@example.com",
     "password": "Test123!"
   }
   ```

3. **Test Protected Endpoints**:
   - Copy token from login response
   - Add to Authorization header: `Bearer <token>`

#### Frontend Testing

1. **Test User Flows**:
   - Registration → Email Verification → Login
   - Add Grocery → Set Expiry → Receive Notification
   - Create Recipe → Share Recipe → Accept Share
   - Plan Meal → Mark Consumed → View Analytics

2. **Test Edge Cases**:
   - Empty states
   - Error handling
   - Loading states
   - Form validation

### Automated Testing (Future)

```bash
# Backend tests (to be implemented)
cd backend
npm test

# Frontend tests (to be implemented)
cd frontend
npm test
```

---

## 🚀 Deployment

### Production Build

#### Backend

```bash
cd backend

# Build TypeScript to JavaScript
npm run build

# Output directory: dist/

# Start production server
npm start
```

#### Frontend

```bash
cd frontend

# Build for production
npm run build

# Output directory: dist/

# Preview production build locally
npm run preview
```

### Deployment Options

#### Option 1: Vercel (Frontend) + Render (Backend)

**Frontend (Vercel)**:
1. Push code to GitHub
2. Import project in Vercel
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-backend-url.com`

**Backend (Render)**:
1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add all environment variables

#### Option 2: Heroku (Full Stack)

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create kitchensathi-api

# Add MongoDB addon
heroku addons:create mongodb:sandbox

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set EDAMAM_APP_ID=your_id
# ... set all other variables

# Deploy
git push heroku main
```

#### Option 3: AWS EC2

1. Launch EC2 instance
2. Install Node.js and MongoDB
3. Clone repository
4. Install dependencies
5. Set up PM2 for process management
6. Configure Nginx as reverse proxy
7. Set up SSL with Let's Encrypt

### Environment Variables for Production

**Important**: Update these for production:
- `NODE_ENV=production`
- `FRONTEND_URL=https://your-domain.com`
- `MONGODB_URI=<production-database-url>`
- Generate new `JWT_SECRET`
- Update CORS settings
- Enable rate limiting

---

## 🔍 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed

**Error**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions**:
- Verify MongoDB is running: `mongosh`
- Check `MONGODB_URI` in `.env`
- For Atlas: Verify IP whitelist and credentials

#### 2. Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solutions**:
```bash
# Find process using port
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:5000 | xargs kill -9

# Or change PORT in .env
PORT=5001
```

#### 3. Email Not Sending

**Error**: `Invalid login: 535-5.7.8 Username and Password not accepted`

**Solutions**:
- Use App Password, not regular Gmail password
- Enable "Less secure app access" (not recommended)
- Check EMAIL_USER and EMAIL_PASS in `.env`

#### 4. Cloudinary Upload Failed

**Error**: `Cloudinary configuration error`

**Solutions**:
- Verify credentials in `.env`
- Check Cloudinary dashboard for API limits
- Ensure file size < 10MB

#### 5. Frontend Can't Connect to Backend

**Error**: `Network Error` or `CORS error`

**Solutions**:
- Verify backend is running on correct port
- Check `VITE_API_URL` in frontend `.env`
- Verify CORS configuration in backend

#### 6. TypeScript Errors

**Error**: `Cannot find module` or type errors

**Solutions**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild TypeScript
npm run build
```

### Debug Mode

#### Backend Debugging

```bash
# Add debug logs
console.log('[DEBUG]', variable);

# Use Node.js debugger
node --inspect-brk dist/index.js
```

#### Frontend Debugging

```typescript
// Use React DevTools
// Add console logs
console.log('[DEBUG]', state);

// Use debugger statement
debugger;
```

### Getting Help

1. **Check Logs**:
   - Backend: Terminal output
   - Frontend: Browser console (F12)
   - MongoDB: MongoDB logs

2. **Documentation**:
   - [API Documentation](./API_DOCUMENTATION.md)
   - [Architecture Guide](./ARCHITECTURE.md)

3. **Community Support**:
   - Open GitHub Issue
   - Contact: your.email@example.com

---

## 📚 Additional Resources

### Official Documentation
- [React Docs](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Tutorials
- [MERN Stack Tutorial](https://www.mongodb.com/languages/mern-stack-tutorial)
- [JWT Authentication](https://jwt.io/introduction)
- [React Router Tutorial](https://reactrouter.com/en/main/start/tutorial)

### Tools
- [MongoDB Compass](https://www.mongodb.com/products/compass)
- [Postman](https://www.postman.com/)
- [VS Code Extensions](https://code.visualstudio.com/docs/editor/extension-marketplace)

---

## ✅ Setup Checklist

- [ ] Node.js installed (v18+)
- [ ] MongoDB installed/configured
- [ ] Git installed
- [ ] Repository cloned
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend `.env` configured
- [ ] Frontend `.env` configured
- [ ] Edamam API credentials obtained
- [ ] Cloudinary account created
- [ ] Gmail App Password generated
- [ ] Database connection tested
- [ ] Backend server running
- [ ] Frontend server running
- [ ] Application accessible in browser
- [ ] Test account created and verified

---

**Happy Coding! 🎉**

If you encounter any issues not covered in this guide, please open an issue on GitHub or contact the development team.

---

**Last Updated**: December 2024  
**Guide Version**: 1.0  
**Maintained By**: KitchenSathi Development Team

