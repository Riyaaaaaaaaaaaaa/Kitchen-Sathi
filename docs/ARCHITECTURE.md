# 🏗️ KitchenSathi - System Architecture

Comprehensive technical architecture documentation for KitchenSathi.

---

## 📋 Table of Contents

- [System Overview](#system-overview)
- [High-Level Architecture](#high-level-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Database Design](#database-design)
- [Authentication Flow](#authentication-flow)
- [Key Features Implementation](#key-features-implementation)
- [External Integrations](#external-integrations)
- [Security Considerations](#security-considerations)
- [Performance Optimization](#performance-optimization)
- [Scalability Considerations](#scalability-considerations)

---

## 🌐 System Overview

KitchenSathi is a full-stack MERN application following a **client-server architecture** with clear separation of concerns.

### Architecture Style
- **Pattern**: MVC (Model-View-Controller) with Service Layer
- **Communication**: RESTful API
- **Authentication**: JWT (JSON Web Tokens)
- **State Management**: React Context API
- **Data Flow**: Unidirectional data flow

### Technology Stack

```
┌─────────────────────────────────────────────┐
│           Frontend (Client)                  │
│  React + TypeScript + Tailwind CSS          │
│  React Router + Context API + Recharts      │
└──────────────────┬──────────────────────────┘
                   │ HTTP/HTTPS (REST API)
                   │ JSON Data Exchange
┌──────────────────▼──────────────────────────┐
│           Backend (Server)                   │
│  Node.js + Express + TypeScript             │
│  JWT Auth + Zod Validation                  │
└──────────────────┬──────────────────────────┘
                   │ Mongoose ODM
┌──────────────────▼──────────────────────────┐
│           Database                           │
│  MongoDB (Document-based NoSQL)             │
└─────────────────────────────────────────────┘

External Services:
├── Edamam API (Recipe Data)
├── Cloudinary (Image Storage)
├── Gmail SMTP (Email Service)
└── Node-cron (Scheduled Tasks)
```

---

## 🏛️ High-Level Architecture

### System Components

```
┌──────────────────────────────────────────────────────────┐
│                     User Interface                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │Dashboard │  │ Grocery  │  │  Recipes │  │Analytics│ │
│  │          │  │   List   │  │          │  │         │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└────────────────────────┬─────────────────────────────────┘
                         │
                    API Gateway
                         │
┌────────────────────────▼─────────────────────────────────┐
│                  Application Layer                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │   Auth   │  │ Business │  │  Data    │  │External │ │
│  │ Service  │  │  Logic   │  │ Access   │  │Services │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└────────────────────────┬─────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────┐
│                   Data Layer                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Users   │  │Groceries │  │ Recipes  │  │Analytics│ │
│  │Collection│  │Collection│  │Collection│  │  Data   │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└──────────────────────────────────────────────────────────┘
```

### Request Flow

```
User Action → Frontend Component
    ↓
React State Update
    ↓
API Call (lib/api.ts)
    ↓
HTTP Request → Backend Route
    ↓
Authentication Middleware
    ↓
Route Handler
    ↓
Service Layer (Business Logic)
    ↓
Database Query (Mongoose)
    ↓
MongoDB
    ↓
Response ← Data
    ↓
Frontend State Update
    ↓
UI Re-render
```

---

## 🎨 Frontend Architecture

### Component Hierarchy

```
App (Root)
├── AuthContext (Global State)
├── ToastContainer (Notifications)
└── Router
    ├── LandingPage
    ├── AuthCard (Login/Register)
    ├── VerifyEmail
    ├── ForgotPassword
    ├── ResetPassword
    └── Authenticated Routes
        ├── Dashboard
        │   ├── Logo
        │   ├── UserAvatar
        │   ├── NotificationBell
        │   └── GroceryList (Quick View)
        ├── GroceryList
        │   ├── GroceryForm
        │   ├── GroceryTable
        │   └── ExpirySettings
        ├── RecipeSuggestions
        │   ├── SearchBar
        │   ├── FilterPanel
        │   └── RecipeCard[]
        ├── MyRecipes
        │   ├── RecipeForm
        │   ├── RecipeCard[]
        │   └── UserRecipeViewModal
        ├── SharedRecipes
        │   ├── ShareRecipeModal
        │   └── RecipeViewModal
        ├── MealPlanner
        │   ├── WeekView
        │   ├── MealCard[]
        │   └── MealDetailsModal
        ├── AnalyticsHub
        │   ├── KitchenAnalytics Link
        │   └── CalorieAnalytics Link
        ├── Analytics (Kitchen)
        │   ├── MetricsCards
        │   ├── StatusChart
        │   └── TopItemsList
        ├── CalorieAnalytics
        │   ├── SummaryCards
        │   ├── BarChart (Recharts)
        │   └── DailyBreakdown
        └── ProfileModal
            ├── ProfileTab
            ├── PreferencesTab
            └── AccountTab
```

### State Management

#### Global State (Context API)

```typescript
// AuthContext provides:
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}
```

#### Local State (useState)
- Component-specific data
- Form inputs
- UI states (loading, modals, etc.)

#### API State Management Pattern

```typescript
// Standard pattern for data fetching
const [data, setData] = useState<DataType[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [dependencies]);
```

### Routing Structure

```typescript
<Routes>
  {/* Public Routes */}
  <Route path="/" element={<LandingPage />} />
  <Route path="/login" element={<AuthCard />} />
  <Route path="/register" element={<AuthCard />} />
  <Route path="/verify-email" element={<VerifyEmailPage />} />
  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
  <Route path="/reset-password" element={<ResetPasswordPage />} />
  
  {/* Protected Routes */}
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/groceries" element={<GroceryList />} />
    <Route path="/recipes" element={<RecipeSuggestions />} />
    <Route path="/my-recipes" element={<MyRecipes />} />
    <Route path="/shared-recipes" element={<SharedRecipes />} />
    <Route path="/meal-planner" element={<MealPlanner />} />
    <Route path="/analytics-hub" element={<AnalyticsHub />} />
    <Route path="/analytics" element={<Analytics />} />
    <Route path="/calorie-analytics" element={<CalorieAnalytics />} />
  </Route>
</Routes>
```

### API Client Architecture

```typescript
// lib/api.ts - Core API client
export async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  // Add auth token
  // Handle errors
  // Parse response
  // Return typed data
}

// Feature-specific API clients
// lib/groceriesApi.ts
export const getGroceries = () => request<Grocery[]>('/api/groceries');
export const createGrocery = (data) => request('/api/groceries', { method: 'POST', body: data });

// lib/userRecipesApi.ts
export const getUserRecipes = () => request<Recipe[]>('/api/user-recipes');
// ... more endpoints
```

---

## ⚙️ Backend Architecture

### Layered Architecture

```
┌─────────────────────────────────────────┐
│         Routes Layer                     │
│  (HTTP Endpoints & Request Handling)    │
│  - auth.ts, groceries.ts, recipes.ts   │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Middleware Layer                    │
│  - Authentication (JWT)                  │
│  - Validation (Zod)                      │
│  - File Upload (Multer)                  │
│  - Error Handling                        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│       Service Layer                      │
│  (Business Logic & External Services)   │
│  - NotificationService                   │
│  - EmailService                          │
│  - EdamamService                         │
│  - CalorieCalculator                     │
│  - GroceryExpiryService                  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│        Model Layer                       │
│  (Data Models & Database Schema)        │
│  - User, Grocery, Recipe, MealPlan      │
│  - Mongoose Models & Validation          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Database                         │
│         MongoDB                          │
└─────────────────────────────────────────┘
```

### Route Structure

```typescript
// routes/index.ts - Main router
router.use('/auth', authRouter);
router.use('/groceries', requireAuth, groceriesRouter);
router.use('/user-recipes', requireAuth, userRecipesRouter);
router.use('/shared-recipes', requireAuth, sharedRecipesRouter);
router.use('/meal-plans', requireAuth, mealPlansRouter);
router.use('/analytics', requireAuth, analyticsRouter);
router.use('/notifications', requireAuth, notificationsRouter);
router.use('/profile', requireAuth, profileRouter);
```

### Middleware Pipeline

```typescript
// Request flow through middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());

// Route-specific middleware
router.post('/groceries',
  requireAuth,           // 1. Verify JWT token
  validateRequest,       // 2. Validate input (Zod)
  handleRequest          // 3. Execute business logic
);
```

### Service Layer Pattern

```typescript
// services/NotificationService.ts
class NotificationService {
  async createNotification(params: NotificationParams) {
    // 1. Validate user preferences
    // 2. Create notification document
    // 3. Trigger email if enabled
    // 4. Return notification
  }
  
  async notifyGroceryExpiry(userId, itemId, itemName, expiryDate) {
    // Business logic for expiry notifications
  }
}

export const notificationService = new NotificationService();
```

### Scheduled Tasks (Cron Jobs)

```typescript
// services/groceryExpiryService.ts
class GroceryExpiryService {
  constructor() {
    // Run daily at midnight
    cron.schedule('0 0 * * *', () => {
      this.checkAndNotifyExpiringGroceries();
    });
  }
  
  async checkAndNotifyExpiringGroceries() {
    // 1. Find items expiring within 3 days
    // 2. Check user notification preferences
    // 3. Create in-app notifications
    // 4. Send email alerts
    // 5. Mark items as notified
  }
}
```

---

## 🗄️ Database Design

### MongoDB Collections

#### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  passwordHash: String,
  avatar: String,
  gender: String ('male' | 'female' | 'other'),
  dateOfBirth: Date,
  weight: Number,
  height: Number,
  bio: String,
  role: String ('user' | 'admin'),
  isEmailVerified: Boolean,
  emailVerificationCode: String,
  emailVerificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  preferences: {
    notifications: {
      email: Boolean,
      inApp: Boolean,
      expiryAlerts: Boolean
    },
    theme: String,
    language: String,
    profileVisibility: Boolean,
    shareActivity: Boolean,
    allowSharing: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### GroceryItems Collection
```javascript
{
  _id: ObjectId,
  name: String (indexed),
  quantity: Number,
  unit: String,
  price: Number,
  status: String ('pending' | 'completed' | 'used'),
  expiryDate: Date (indexed),
  userId: ObjectId (ref: 'User', indexed),
  notifiedForExpiry: Boolean,
  usedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### UserRecipes Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  cuisine: String,
  prepTime: Number,
  cookTime: Number,
  servings: Number,
  difficulty: String,
  imageUrl: String,
  cloudinaryPublicId: String,
  ingredients: [{
    name: String,
    quantity: String,
    unit: String
  }],
  instructions: [{
    stepNumber: Number,
    instruction: String
  }],
  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  },
  rating: Number,
  userId: ObjectId (ref: 'User', indexed),
  createdAt: Date,
  updatedAt: Date
}
```

#### SharedRecipes Collection
```javascript
{
  _id: ObjectId,
  recipeId: ObjectId (ref: 'UserRecipe'),
  ownerId: ObjectId (ref: 'User'),
  recipientId: ObjectId (ref: 'User', indexed),
  status: String ('pending' | 'accepted' | 'rejected'),
  message: String,
  sharedAt: Date,
  respondedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### MealPlans Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', indexed),
  date: Date (indexed),
  mealType: String ('breakfast' | 'lunch' | 'dinner' | 'snack'),
  recipeName: String,
  recipeId: ObjectId,
  recipeType: String ('user' | 'shared' | 'edamam'),
  calories: Number,
  isConsumed: Boolean,
  consumedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### MealConsumptions Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', indexed),
  recipeName: String,
  calories: Number,
  consumedAt: Date (indexed),
  createdAt: Date,
  updatedAt: Date
}
```

#### Notifications Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', indexed),
  type: String ('grocery_expiry' | 'recipe_shared' | 'meal_reminder' | 'share_accepted' | 'share_rejected'),
  title: String,
  message: String,
  data: {
    groceryItemId: String,
    groceryItemName: String,
    expiryDate: Date,
    recipeId: String,
    recipeName: String,
    shareId: String,
    sharedBy: String,
    mealType: String,
    mealDate: Date
  },
  isRead: Boolean (indexed),
  createdAt: Date (indexed),
  updatedAt: Date
}
```

### Database Indexes

```javascript
// Compound indexes for performance
Users: { email: 1 }
GroceryItems: { userId: 1, status: 1 }, { userId: 1, expiryDate: 1 }
UserRecipes: { userId: 1, createdAt: -1 }
SharedRecipes: { recipientId: 1, status: 1 }
MealPlans: { userId: 1, date: 1 }
MealConsumptions: { userId: 1, consumedAt: -1 }
Notifications: { userId: 1, createdAt: -1 }, { userId: 1, isRead: 1 }
```

### Data Relationships

```
User (1) ──────────────── (Many) GroceryItems
User (1) ──────────────── (Many) UserRecipes
User (1) ──────────────── (Many) MealPlans
User (1) ──────────────── (Many) MealConsumptions
User (1) ──────────────── (Many) Notifications

UserRecipe (1) ─────────── (Many) SharedRecipes
User (Owner) (1) ────────── (Many) SharedRecipes
User (Recipient) (1) ────── (Many) SharedRecipes
```

---

## 🔐 Authentication Flow

### Registration & Email Verification

```
User submits registration form
    ↓
Backend validates data (Zod)
    ↓
Hash password (bcrypt)
    ↓
Generate 6-digit verification code
    ↓
Save user to database (isEmailVerified: false)
    ↓
Send verification email (Nodemailer)
    ↓
User receives email with code
    ↓
User enters code on verification page
    ↓
Backend verifies code
    ↓
Update user (isEmailVerified: true)
    ↓
Generate JWT token
    ↓
Return token + user data
    ↓
Frontend stores token in localStorage
    ↓
Redirect to dashboard
```

### Login Flow

```
User submits login credentials
    ↓
Backend finds user by email
    ↓
Compare password hash (bcrypt)
    ↓
Check if email is verified
    ↓
Generate JWT token (expires in 7 days)
    ↓
Return token + user data
    ↓
Frontend stores token in localStorage
    ↓
Set Authorization header for API calls
    ↓
Redirect to dashboard
```

### JWT Token Structure

```javascript
{
  header: {
    alg: "HS256",
    typ: "JWT"
  },
  payload: {
    id: "user_id",
    email: "user@example.com",
    role: "user",
    iat: 1640000000,
    exp: 1640604800
  },
  signature: "..."
}
```

### Protected Route Flow

```
User makes API request
    ↓
Frontend adds Authorization header
    ↓
Backend middleware extracts token
    ↓
Verify token signature (JWT_SECRET)
    ↓
Check token expiration
    ↓
Decode user data from payload
    ↓
Attach user to request object
    ↓
Continue to route handler
    ↓
Return response
```

### Password Reset Flow

```
User clicks "Forgot Password"
    ↓
Enter email address
    ↓
Backend generates reset token (crypto)
    ↓
Save token with expiration (10 minutes)
    ↓
Send email with reset link
    ↓
User clicks link in email
    ↓
Frontend shows reset password form
    ↓
User enters new password
    ↓
Backend verifies token
    ↓
Hash new password
    ↓
Update user password
    ↓
Clear reset token
    ↓
Redirect to login
```

---

## 🔧 Key Features Implementation

### 1. Grocery Expiry Tracking

**Architecture**:
```
Cron Job (Daily at midnight)
    ↓
GroceryExpiryService.checkAndNotifyExpiringGroceries()
    ↓
Query: Find items expiring within 3 days
    ↓
For each item:
    ├─ Check user notification preferences
    ├─ Calculate days until expiry
    ├─ Create in-app notification
    ├─ Send email alert (if enabled)
    └─ Mark item as notified (prevent duplicates)
```

**Key Code**:
```typescript
// Cron schedule
cron.schedule('0 0 * * *', () => {
  groceryExpiryService.checkAndNotifyExpiringGroceries();
});

// Query expiring items
const expiringItems = await GroceryItem.find({
  expiryDate: { $gte: today, $lte: expiryThreshold },
  status: { $in: ['pending', 'completed'] },
  notifiedForExpiry: { $ne: true }
}).populate('userId');
```

### 2. Calorie Tracking System

**BMR Calculation (Mifflin-St Jeor Formula)**:
```typescript
// For men:
BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5

// For women:
BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161

// Recommended daily calories (moderate activity):
Daily Calories = BMR × 1.55
```

**Tracking Flow**:
```
User adds meal to planner with calories
    ↓
User marks meal as "consumed"
    ↓
Frontend calls /api/meal-plans/consume
    ↓
Backend creates MealConsumption record
    ↓
Analytics endpoint aggregates weekly data
    ↓
Calculate: Consumed vs. Recommended
    ↓
Determine status (good/over/under)
    ↓
Return data to frontend
    ↓
Recharts displays bar chart
```

### 3. Recipe Sharing System

**Sharing Flow**:
```
User A selects recipe to share
    ↓
Enters recipient email (User B)
    ↓
Backend finds User B by email
    ↓
Create SharedRecipe document (status: pending)
    ↓
Create notification for User B
    ↓
Send email to User B
    ↓
User B views shared recipes
    ↓
User B accepts/rejects
    ↓
Update SharedRecipe status
    ↓
Create notification for User A
    ↓
If accepted: User B can add to meal planner
```

### 4. Real-Time Notifications

**Notification System Architecture**:
```
Event Trigger (e.g., grocery expiry)
    ↓
NotificationService.createNotification()
    ↓
Check user preferences
    ↓
Create Notification document
    ↓
If email enabled:
    └─ EmailService.sendEmail()
    ↓
Frontend polls /api/notifications/unread-count
    ↓
Update badge counter
    ↓
User clicks bell icon
    ↓
Fetch /api/notifications
    ↓
Display in dropdown
    ↓
User clicks notification
    ↓
Mark as read
    ↓
Navigate to relevant page
```

**Polling Strategy**:
```typescript
// Frontend polls every 30 seconds
useEffect(() => {
  fetchNotifications();
  const interval = setInterval(fetchNotifications, 30000);
  return () => clearInterval(interval);
}, []);
```

### 5. Savings Calculation

**Algorithm**:
```typescript
// For each grocery item with status 'used':
savings += item.price || 0;

// Waste prevention rate:
wastePreventionRate = (usedItems / totalItems) × 100;

// Display:
"You saved ₹{savings} by using {usedItems} items before expiry!"
```

---

## 🔌 External Integrations

### 1. Edamam Recipe API

**Integration Pattern**:
```typescript
class EdamamService {
  async searchRecipes(query: string, filters: RecipeFilters) {
    const url = `https://api.edamam.com/api/recipes/v2`;
    const params = {
      type: 'public',
      q: query,
      app_id: process.env.EDAMAM_APP_ID,
      app_key: process.env.EDAMAM_APP_KEY,
      ...filters
    };
    
    const response = await fetch(url + '?' + new URLSearchParams(params));
    return await response.json();
  }
}
```

**Data Transformation**:
```typescript
// Edamam response → Frontend format
const transformRecipe = (edamamRecipe) => ({
  id: edamamRecipe.recipe.uri,
  name: edamamRecipe.recipe.label,
  image: edamamRecipe.recipe.image,
  calories: Math.round(edamamRecipe.recipe.calories),
  ingredients: edamamRecipe.recipe.ingredientLines,
  // ... more fields
});
```

### 2. Cloudinary Image Storage

**Upload Flow**:
```typescript
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload image
const result = await cloudinary.uploader.upload(file.path, {
  folder: 'kitchensathi/recipes',
  transformation: [
    { width: 800, height: 600, crop: 'limit' },
    { quality: 'auto' }
  ]
});

// Store URL and public_id
recipe.imageUrl = result.secure_url;
recipe.cloudinaryPublicId = result.public_id;
```

**Delete Flow**:
```typescript
// When deleting recipe, also delete image
if (recipe.cloudinaryPublicId) {
  await cloudinary.uploader.destroy(recipe.cloudinaryPublicId);
}
```

### 3. Email Service (Nodemailer + Gmail)

**Configuration**:
```typescript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // App-specific password
  }
});
```

**Email Templates**:
```typescript
// Verification Email
const verificationEmail = {
  from: 'KitchenSathi <noreply@kitchensathi.com>',
  to: user.email,
  subject: 'Verify Your Email',
  html: `
    <h1>Welcome to KitchenSathi!</h1>
    <p>Your verification code is: <strong>${code}</strong></p>
    <p>This code expires in 10 minutes.</p>
  `
};

// Expiry Alert Email
const expiryEmail = {
  from: 'KitchenSathi <noreply@kitchensathi.com>',
  to: user.email,
  subject: `⚠️ ${itemName} Expiring Soon!`,
  html: `
    <h2>${itemName} will expire in ${daysUntilExpiry} days</h2>
    <p>Use it soon to avoid waste!</p>
    <a href="${frontendUrl}/grocery-list">View Grocery List</a>
  `
};
```

---

## 🔒 Security Considerations

### 1. Authentication Security

- **Password Hashing**: bcrypt with salt rounds (10)
- **JWT Tokens**: Signed with secret, 7-day expiration
- **Token Storage**: localStorage (consider httpOnly cookies for production)
- **Password Requirements**: Minimum 8 characters
- **Email Verification**: Required before full access

### 2. API Security

- **CORS**: Configured for specific origins
- **Rate Limiting**: Prevent brute force attacks
- **Input Validation**: Zod schema validation
- **SQL Injection**: N/A (NoSQL, but use parameterized queries)
- **XSS Protection**: React auto-escapes output
- **CSRF**: Token-based auth (stateless)

### 3. Data Security

- **Sensitive Data**: Never log passwords or tokens
- **Environment Variables**: Store secrets in .env
- **Database**: MongoDB authentication enabled
- **File Uploads**: Validate file types and sizes
- **Image Storage**: Cloudinary handles security

### 4. Authorization

```typescript
// Middleware checks user ownership
const requireOwnership = async (req, res, next) => {
  const resource = await Model.findById(req.params.id);
  if (resource.userId.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};
```

---

## ⚡ Performance Optimization

### Frontend Optimizations

1. **Code Splitting**: React.lazy() for route-based splitting
2. **Image Optimization**: Cloudinary transformations
3. **Memoization**: useMemo, useCallback for expensive operations
4. **Debouncing**: Search inputs debounced (300ms)
5. **Lazy Loading**: Images loaded on scroll
6. **Bundle Size**: Tree-shaking unused code

### Backend Optimizations

1. **Database Indexing**: Compound indexes on frequent queries
2. **Query Optimization**: Select only needed fields
3. **Caching**: Consider Redis for frequently accessed data
4. **Pagination**: Limit results (default 50 items)
5. **Compression**: gzip responses
6. **Connection Pooling**: MongoDB connection pool

### Database Query Examples

```typescript
// Efficient: Select specific fields
const users = await User.find()
  .select('name email avatar')
  .limit(50);

// Efficient: Use indexes
const groceries = await GroceryItem.find({ userId, status: 'pending' })
  .sort({ expiryDate: 1 });

// Efficient: Populate only needed fields
const recipes = await UserRecipe.find({ userId })
  .populate('userId', 'name avatar');
```

---

## 📈 Scalability Considerations

### Current Architecture Limitations

- **Single Server**: No horizontal scaling
- **Polling**: Notifications use polling (not WebSocket)
- **File Storage**: Cloudinary (external dependency)
- **Database**: Single MongoDB instance

### Scaling Strategies

#### 1. Horizontal Scaling
```
Load Balancer
    ├─ App Server 1
    ├─ App Server 2
    └─ App Server 3
         ↓
    MongoDB Replica Set
```

#### 2. Microservices Architecture
```
API Gateway
    ├─ Auth Service
    ├─ Grocery Service
    ├─ Recipe Service
    ├─ Notification Service
    └─ Analytics Service
```

#### 3. Caching Layer
```
Client → CDN (Static Assets)
       → Redis (API Responses)
       → MongoDB (Persistent Data)
```

#### 4. Real-Time Updates
```
Replace polling with:
- WebSocket connections
- Server-Sent Events (SSE)
- Firebase Cloud Messaging
```

#### 5. Database Sharding
```
Users A-M → Shard 1
Users N-Z → Shard 2
```

### Future Enhancements

- [ ] Implement Redis caching
- [ ] Add WebSocket for real-time updates
- [ ] Containerize with Docker
- [ ] Set up CI/CD pipeline
- [ ] Implement monitoring (Prometheus, Grafana)
- [ ] Add comprehensive logging (Winston, ELK stack)
- [ ] Database replication and sharding
- [ ] CDN for static assets
- [ ] API versioning strategy

---

## 📊 Monitoring & Logging

### Recommended Tools

- **Application Monitoring**: New Relic, Datadog
- **Error Tracking**: Sentry
- **Logging**: Winston + ELK Stack
- **Database Monitoring**: MongoDB Atlas Monitoring
- **Performance**: Lighthouse, Web Vitals

### Key Metrics to Track

- API response times
- Database query performance
- Error rates
- User authentication success/failure
- Notification delivery rates
- Image upload success rates
- Cache hit/miss ratios

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Maintained By**: KitchenSathi Development Team

