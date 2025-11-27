# Full-Stack Development Guide: React + Express + MongoDB

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
# Copy .env.example to .env and configure MongoDB URI
cp .env.example .env
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Test Full-Stack Integration
- Backend: http://localhost:5000
- Frontend: http://localhost:5173
- Register → Login → Add grocery items → Test CRUD operations

## 📡 API Integration Best Practices

### 1. Enhanced API Client (`src/lib/api.ts`)

**Key Features:**
- Centralized error handling with `ApiError` type
- Automatic JWT token management
- Network error detection
- Type-safe request/response handling

**Usage:**
```typescript
import { registerUser, loginUser, getGroceryList, ApiError } from './lib/api';

try {
  const { token, user } = await registerUser({ email, name, password });
  // Success handling
} catch (err) {
  const error = err as ApiError;
  console.error(error.message, error.status);
}
```

### 2. Authentication Flow

**Secure Token Management:**
- Tokens stored in localStorage
- Automatic inclusion in API requests
- Context-based user state management
- Automatic logout on token expiry

**Auth Context Usage:**
```typescript
const { user, login, logout, loading } = useAuth();

// Login
await login(email, password);

// Check auth state
if (user) {
  console.log('User:', user.name, user.role);
}
```

### 3. Backend Status Monitoring

**Real-time Health Checks:**
- Automatic polling every 30 seconds
- Visual status indicators (🟢🟡🔴)
- Manual refresh capability
- Network error detection

## 🎨 UI/UX Best Practices

### 1. Form Validation

**Enhanced Forms (`src/components/EnhancedAuthForms.tsx`):**
- Real-time validation with error states
- Visual feedback (red borders, error messages)
- Disabled states during submission
- Consistent styling with TailwindCSS

**Form Patterns:**
```typescript
const [fields, setFields] = useState({
  email: { value: '', error: null, touched: false }
});

const validateField = (name, value) => {
  // Validation logic
  return errorMessage || null;
};
```

### 2. Error Handling

**User-Friendly Error Messages:**
- Network errors: "Network error - check if backend is running"
- Validation errors: Field-specific messages
- API errors: Server-provided error messages
- Loading states: Clear feedback during operations

**Error Display:**
```typescript
{formError && (
  <div className="rounded bg-red-50 p-3 text-sm text-red-600">
    {formError}
  </div>
)}
```

### 3. Responsive Design

**Mobile-First Approach:**
- Grid layouts: `md:grid-cols-2` for larger screens
- Flexible forms: `flex gap-2` for form controls
- Touch-friendly buttons: Adequate padding and spacing
- Readable typography: Proper font sizes and contrast

## 🔧 Development Workflow

### 1. Testing Full-Stack Integration

**Backend Testing:**
```bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Frontend Testing:**
- Open DevTools Network tab
- Test registration/login flow
- Verify JWT token storage
- Test grocery list CRUD operations
- Check error handling with network disabled

### 2. Debugging Tips

**Backend Debugging:**
- Check MongoDB connection logs
- Verify JWT secret configuration
- Use `console.log` for request/response debugging
- Check CORS configuration for frontend requests

**Frontend Debugging:**
- Use React DevTools for state inspection
- Check localStorage for token persistence
- Monitor Network tab for API calls
- Verify error boundaries catch exceptions

### 3. Environment Configuration

**Backend (.env):**
```bash
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/aajkyabanega
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env):**
```bash
VITE_API_URL=http://localhost:5000
```

## 🛠️ Feature Expansion Guide

### 1. Adding New API Endpoints

**Backend Pattern:**
```typescript
// 1. Create model (src/models/NewModel.ts)
// 2. Create routes (src/routes/newFeature.ts)
// 3. Add to main router (src/routes/index.ts)
// 4. Add validation with Zod schemas
```

**Frontend Pattern:**
```typescript
// 1. Add API functions to src/lib/api.ts
// 2. Create components in src/components/
// 3. Integrate with existing context/state
// 4. Add error handling and loading states
```

### 2. Database Schema Evolution

**Mongoose Best Practices:**
- Use timestamps: `{ timestamps: true }`
- Add indexes for frequently queried fields
- Use references for relationships: `ref: 'User'`
- Validate data with Mongoose schemas

### 3. Security Considerations

**JWT Security:**
- Use strong, random JWT secrets
- Implement token refresh mechanism
- Add rate limiting for auth endpoints
- Validate user permissions on protected routes

**Frontend Security:**
- Sanitize user inputs
- Validate forms client-side and server-side
- Use HTTPS in production
- Implement proper error boundaries

## 📊 Performance Optimization

### 1. Backend Optimization
- Add database indexes
- Implement caching for frequently accessed data
- Use connection pooling for MongoDB
- Add request/response compression

### 2. Frontend Optimization
- Implement React.memo for expensive components
- Use useCallback for event handlers
- Add loading skeletons for better UX
- Implement virtual scrolling for large lists

### 3. API Optimization
- Add pagination for list endpoints
- Implement optimistic updates
- Use debouncing for search inputs
- Add request cancellation for stale requests

## 🚀 Deployment Preparation

### 1. Production Environment
- Use environment-specific configurations
- Implement proper logging
- Add health check endpoints
- Configure CORS for production domains

### 2. Database Considerations
- Use MongoDB Atlas for production
- Implement database migrations
- Add backup strategies
- Monitor database performance

### 3. Frontend Build
- Optimize bundle size
- Implement code splitting
- Add service worker for offline support
- Configure CDN for static assets

This guide provides a solid foundation for full-stack development with React, Express, and MongoDB. The patterns and practices shown here scale well for larger applications and can be extended with additional features as needed.
