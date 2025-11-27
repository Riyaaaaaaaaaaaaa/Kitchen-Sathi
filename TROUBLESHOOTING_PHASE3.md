# 🔧 Phase 3 API Troubleshooting Guide

## 🚨 **"Unexpected token '<'" Error Diagnosis**

This error occurs when the frontend receives HTML instead of JSON from the backend. Here's how to diagnose and fix it:

## 🔍 **Step 1: Backend Route Verification**

### **Check if Backend is Running**
```bash
# Test basic health endpoint
curl http://localhost:5000/api/health

# Expected response:
# {"status":"ok","service":"test","time":"2024-01-01T00:00:00.000Z"}
```

### **Verify Route Registration**
```bash
# Run the diagnostic script
node test-phase3-api.js
```

### **Check Backend Logs**
Look for these log messages in your backend console:
```
[startup] Registered routes:
  GET  /api/health
  GET  /api/groceries/expiring
  GET  /api/groceries/expired
  GET  /api/groceries/notifications
  PATCH /api/groceries/:id/expiry
  GET  /api/groceries/expiry/stats
```

## 🔍 **Step 2: Frontend API URL Validation**

### **Check API Base URL**
In `frontend/src/lib/api.ts`, verify:
```typescript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
console.log('API Base URL:', API_BASE); // Add this for debugging
```

### **Test API Calls Manually**
Open browser console and run:
```javascript
// Test basic health check
fetch('http://localhost:5000/api/health')
  .then(r => r.text())
  .then(text => console.log('Health response:', text));

// Test with authentication
const token = localStorage.getItem('auth_token');
fetch('http://localhost:5000/api/groceries/expiring', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.text())
.then(text => console.log('Expiring response:', text));
```

## 🔍 **Step 3: Backend Route Debugging**

### **Add Route Logging**
The backend should log all requests. Check for:
```
[routes] ⏰ Expiry route hit: GET /expiring
[routes] 📤 Body: {}
[routes] 🔑 Auth header: Present
```

### **Check for Import Errors**
Look for these errors in backend console:
```
Error: Cannot find module './services/NotificationService.js'
Error: Cannot find module './services/ExpiryCheckService.js'
```

### **Verify Database Connection**
Check for MongoDB connection errors:
```
[startup] connecting to MongoDB...
[startup] connected to MongoDB
```

## 🔍 **Step 4: Common Issues & Solutions**

### **Issue 1: Routes Not Registered**
**Symptoms:** 404 errors, HTML error pages
**Solution:** Check route mounting order in `src/routes/index.ts`

### **Issue 2: Import Errors**
**Symptoms:** Backend crashes on startup
**Solution:** 
```bash
cd backend
npm install node-cron @types/node-cron
```

### **Issue 3: Authentication Issues**
**Symptoms:** 401 errors, HTML error pages
**Solution:** Check JWT token in localStorage:
```javascript
console.log('Token:', localStorage.getItem('auth_token'));
```

### **Issue 4: Database Connection**
**Symptoms:** 500 errors, HTML error pages
**Solution:** Check MongoDB connection string in `.env`

## 🔍 **Step 5: Frontend Error Handling**

### **Enhanced Error Detection**
The updated `request` function now detects HTML responses:
```typescript
// Check if response is HTML (error page)
if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
  console.error(`❌ [api] Received HTML instead of JSON for ${path}`);
  throw { 
    message: 'Server returned HTML instead of JSON...', 
    status: res.status 
  } as ApiError;
}
```

### **Debug Logging**
All API calls now log:
- Request URL and method
- Authentication status
- Response status and headers
- Response content (first 200 chars)

## 🔍 **Step 6: Backend Error Handling**

### **Global Error Handler**
Added to ensure all responses are JSON:
```typescript
app.use((err: any, req: any, res: any, next: any) => {
  console.error('[error] Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});
```

### **404 Handler**
Added to provide helpful error messages:
```typescript
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'API endpoint not found',
    method: req.method,
    path: req.originalUrl,
    availableRoutes: [...]
  });
});
```

## 🔍 **Step 7: Testing Checklist**

### **Backend Tests**
- [ ] Backend starts without errors
- [ ] All routes are logged on startup
- [ ] Health endpoint returns JSON
- [ ] Database connection successful
- [ ] No import errors in console

### **Frontend Tests**
- [ ] API base URL is correct
- [ ] Authentication token is present
- [ ] All API calls return JSON
- [ ] Error handling works correctly
- [ ] Console shows detailed request/response logs

### **Integration Tests**
- [ ] Register user works
- [ ] Login returns token
- [ ] Protected routes work with token
- [ ] Expiry endpoints return data
- [ ] Notification endpoints work

## 🔍 **Step 8: Manual Testing Commands**

### **Test Backend Routes**
```bash
# Health check
curl http://localhost:5000/api/health

# Test expiry routes (without auth - should get 401)
curl http://localhost:5000/api/groceries/expiring

# Test with auth
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/groceries/expiring
```

### **Test Frontend API Calls**
```javascript
// In browser console
import { getExpiringItems, getExpiredItems } from './src/lib/api.js';

// Test with authentication
getExpiringItems().then(console.log).catch(console.error);
getExpiredItems().then(console.log).catch(console.error);
```

## 🔍 **Step 9: Production Considerations**

### **Environment Variables**
```bash
# Backend .env
MONGODB_URI=mongodb://localhost:27017/aajkyabanega
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development

# Frontend .env
VITE_API_URL=http://localhost:5000
```

### **CORS Configuration**
Ensure CORS is properly configured:
```typescript
app.use(cors({ 
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true 
}));
```

## 🎯 **Quick Fix Summary**

1. **Restart Backend**: `npm run dev` in backend directory
2. **Check Console**: Look for route registration logs
3. **Test Health**: `curl http://localhost:5000/api/health`
4. **Check Frontend**: Open browser console, look for API logs
5. **Verify Auth**: Ensure token is present in localStorage
6. **Test Routes**: Use the diagnostic script `node test-phase3-api.js`

## 🚀 **Expected Working Flow**

1. Backend starts and logs all registered routes
2. Frontend makes API calls with proper authentication
3. Backend returns JSON responses (never HTML)
4. Frontend parses JSON and updates UI
5. All errors are properly caught and displayed

If you're still seeing HTML responses, the issue is likely:
- Backend not running
- Routes not properly registered
- Import errors in backend
- Database connection issues
- Authentication problems

Use the diagnostic script and check the console logs to identify the specific issue.
