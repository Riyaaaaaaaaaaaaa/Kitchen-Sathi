# 📡 KitchenSathi API Documentation

Complete API reference for KitchenSathi backend services.

**Base URL**: `http://localhost:5000/api`  
**Production URL**: `https://your-domain.com/api`

---

## 📋 Table of Contents

- [Authentication](#authentication)
- [User Profile](#user-profile)
- [Grocery Management](#grocery-management)
- [Recipe Management](#recipe-management)
- [Recipe Sharing](#recipe-sharing)
- [Meal Planner](#meal-planner)
- [Analytics](#analytics)
- [Notifications](#notifications)
- [Error Handling](#error-handling)

---

## 🔐 Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Register User

**Endpoint**: `POST /auth/register`

**Description**: Register a new user account with email verification.

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "gender": "male",
  "dateOfBirth": "1990-01-15",
  "weight": 70,
  "height": 175
}
```

**Response** (201 Created):
```json
{
  "message": "Registration successful! Please check your email for verification code.",
  "userId": "507f1f77bcf86cd799439011"
}
```

**Validation**:
- Email must be unique and valid format
- Password minimum 8 characters
- Name required
- Gender: 'male' | 'female' | 'other'

---

### Verify Email

**Endpoint**: `POST /auth/verify-email`

**Description**: Verify email address with 6-digit code sent via email.

**Request Body**:
```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

**Response** (200 OK):
```json
{
  "message": "Email verified successfully!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://res.cloudinary.com/...",
    "isEmailVerified": true
  }
}
```

---

### Login

**Endpoint**: `POST /auth/login`

**Description**: Authenticate user and receive JWT token.

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://res.cloudinary.com/...",
    "role": "user"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials
- `403 Forbidden`: Email not verified

---

### Forgot Password

**Endpoint**: `POST /auth/forgot-password`

**Description**: Request password reset token via email.

**Request Body**:
```json
{
  "email": "john@example.com"
}
```

**Response** (200 OK):
```json
{
  "message": "Password reset link sent to your email"
}
```

---

### Reset Password

**Endpoint**: `POST /auth/reset-password`

**Description**: Reset password using token from email.

**Request Body**:
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "message": "Password reset successful!"
}
```

---

### Change Password

**Endpoint**: `POST /auth/change-password`  
**Authentication**: Required

**Description**: Change password for authenticated user.

**Request Body**:
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Response** (200 OK):
```json
{
  "message": "Password changed successfully!"
}
```

---

### Get Current User

**Endpoint**: `GET /me`  
**Authentication**: Required

**Description**: Get authenticated user's profile.

**Response** (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "avatar": "https://res.cloudinary.com/...",
  "gender": "male",
  "dateOfBirth": "1990-01-15T00:00:00.000Z",
  "weight": 70,
  "height": 175,
  "preferences": {
    "notifications": {
      "email": true,
      "inApp": true,
      "expiryAlerts": true
    },
    "theme": "auto",
    "language": "en"
  },
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

## 👤 User Profile

### Get Profile

**Endpoint**: `GET /profile`  
**Authentication**: Required

**Description**: Get detailed user profile.

**Response** (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "avatar": "https://res.cloudinary.com/...",
  "gender": "male",
  "dateOfBirth": "1990-01-15T00:00:00.000Z",
  "weight": 70,
  "height": 175,
  "bio": "Food enthusiast and home cook",
  "preferences": {
    "notifications": {
      "email": true,
      "inApp": true,
      "expiryAlerts": true
    },
    "theme": "auto",
    "language": "en",
    "profileVisibility": true,
    "shareActivity": true,
    "allowSharing": true
  }
}
```

---

### Update Profile

**Endpoint**: `PATCH /profile`  
**Authentication**: Required

**Description**: Update user profile information.

**Request Body** (all fields optional):
```json
{
  "name": "John Updated",
  "bio": "Updated bio",
  "gender": "male",
  "dateOfBirth": "1990-01-15",
  "weight": 72,
  "height": 175,
  "avatar": "avatar_2",
  "preferences": {
    "notifications": {
      "email": true,
      "inApp": true,
      "expiryAlerts": false
    },
    "theme": "dark",
    "language": "en"
  }
}
```

**Response** (200 OK):
```json
{
  "message": "Profile updated successfully",
  "user": { /* updated user object */ }
}
```

---

### Upload Avatar

**Endpoint**: `POST /profile/avatar`  
**Authentication**: Required  
**Content-Type**: `multipart/form-data`

**Description**: Upload custom profile avatar image.

**Request Body**:
```
avatar: <file> (image/jpeg, image/png, max 5MB)
```

**Response** (200 OK):
```json
{
  "message": "Avatar uploaded successfully",
  "avatar": "https://res.cloudinary.com/..."
}
```

---

### Delete Account

**Endpoint**: `DELETE /profile`  
**Authentication**: Required

**Description**: Permanently delete user account and all associated data.

**Response** (200 OK):
```json
{
  "message": "Account deleted successfully"
}
```

---

## 🛒 Grocery Management

### Get All Groceries

**Endpoint**: `GET /groceries`  
**Authentication**: Required

**Description**: Get all grocery items for authenticated user.

**Query Parameters**:
- `status` (optional): Filter by status ('pending', 'completed', 'used')

**Response** (200 OK):
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Milk",
    "quantity": 2,
    "unit": "liters",
    "price": 60,
    "status": "completed",
    "expiryDate": "2024-12-31T00:00:00.000Z",
    "userId": "507f1f77bcf86cd799439011",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
]
```

---

### Create Grocery Item

**Endpoint**: `POST /groceries`  
**Authentication**: Required

**Description**: Add a new grocery item.

**Request Body**:
```json
{
  "name": "Tomatoes",
  "quantity": 1,
  "unit": "kg",
  "price": 40,
  "expiryDate": "2024-12-25"
}
```

**Response** (201 Created):
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Tomatoes",
  "quantity": 1,
  "unit": "kg",
  "price": 40,
  "status": "pending",
  "expiryDate": "2024-12-25T00:00:00.000Z",
  "userId": "507f1f77bcf86cd799439011",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Validation**:
- `name`: Required, min 1 character
- `quantity`: Required, min 0.1
- `unit`: Required
- `price`: Optional, min 0
- `expiryDate`: Optional, must be future date

---

### Update Grocery Item

**Endpoint**: `PATCH /groceries/:id`  
**Authentication**: Required

**Description**: Update grocery item details.

**Request Body** (all fields optional):
```json
{
  "name": "Tomatoes (Organic)",
  "quantity": 2,
  "price": 80,
  "expiryDate": "2024-12-30"
}
```

**Response** (200 OK):
```json
{
  /* updated grocery item object */
}
```

---

### Delete Grocery Item

**Endpoint**: `DELETE /groceries/:id`  
**Authentication**: Required

**Description**: Delete a grocery item.

**Response** (200 OK):
```json
{
  "message": "Grocery item deleted successfully"
}
```

---

### Mark as Bought

**Endpoint**: `POST /groceries/:id/mark-completed`  
**Authentication**: Required

**Description**: Mark grocery item as bought (status: completed).

**Response** (200 OK):
```json
{
  "message": "Item marked as completed",
  "item": { /* updated item */ }
}
```

---

### Mark as Consumed

**Endpoint**: `POST /groceries/:id/mark-used`  
**Authentication**: Required

**Description**: Mark grocery item as consumed (status: used).

**Response** (200 OK):
```json
{
  "message": "Item marked as used",
  "item": { /* updated item */ }
}
```

---

### Get Expiring Items

**Endpoint**: `GET /groceries/expiring`  
**Authentication**: Required

**Description**: Get items expiring within next 3 days.

**Response** (200 OK):
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Milk",
    "expiryDate": "2024-12-25T00:00:00.000Z",
    "daysUntilExpiry": 2
  }
]
```

---

## 🍳 Recipe Management

### Get User Recipes

**Endpoint**: `GET /user-recipes`  
**Authentication**: Required

**Description**: Get all recipes created by authenticated user.

**Response** (200 OK):
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Pasta Carbonara",
    "description": "Classic Italian pasta dish",
    "cuisine": "Italian",
    "prepTime": 15,
    "cookTime": 20,
    "servings": 4,
    "difficulty": "medium",
    "imageUrl": "https://res.cloudinary.com/...",
    "ingredients": [
      {
        "name": "Spaghetti",
        "quantity": "400",
        "unit": "g"
      }
    ],
    "instructions": [
      {
        "stepNumber": 1,
        "instruction": "Boil pasta in salted water"
      }
    ],
    "nutrition": {
      "calories": 450,
      "protein": 20,
      "carbs": 60,
      "fat": 15
    },
    "rating": 4.5,
    "userId": "507f1f77bcf86cd799439011",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### Create Recipe

**Endpoint**: `POST /user-recipes`  
**Authentication**: Required  
**Content-Type**: `multipart/form-data`

**Description**: Create a new recipe with optional image upload.

**Request Body**:
```json
{
  "name": "Pasta Carbonara",
  "description": "Classic Italian pasta",
  "cuisine": "Italian",
  "prepTime": 15,
  "cookTime": 20,
  "servings": 4,
  "difficulty": "medium",
  "ingredients": [
    {
      "name": "Spaghetti",
      "quantity": "400",
      "unit": "g"
    }
  ],
  "instructions": [
    {
      "stepNumber": 1,
      "instruction": "Boil pasta"
    }
  ],
  "nutrition": {
    "calories": 450,
    "protein": 20,
    "carbs": 60,
    "fat": 15
  },
  "image": "<file>" // optional
}
```

**Response** (201 Created):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Pasta Carbonara",
  /* full recipe object */
}
```

---

### Get Recipe Details

**Endpoint**: `GET /user-recipes/:id`  
**Authentication**: Required

**Description**: Get detailed information about a specific recipe.

**Response** (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Pasta Carbonara",
  /* full recipe object with all details */
}
```

---

### Update Recipe

**Endpoint**: `PUT /user-recipes/:id`  
**Authentication**: Required

**Description**: Update recipe details.

**Request Body** (all fields optional):
```json
{
  "name": "Updated Recipe Name",
  "description": "Updated description",
  "rating": 5
}
```

**Response** (200 OK):
```json
{
  /* updated recipe object */
}
```

---

### Delete Recipe

**Endpoint**: `DELETE /user-recipes/:id`  
**Authentication**: Required

**Description**: Delete a recipe (also deletes associated image from Cloudinary).

**Response** (200 OK):
```json
{
  "message": "Recipe deleted successfully"
}
```

---

## 🤝 Recipe Sharing

### Share Recipe

**Endpoint**: `POST /shared-recipes`  
**Authentication**: Required

**Description**: Share a recipe with another user via email.

**Request Body**:
```json
{
  "recipeId": "507f1f77bcf86cd799439011",
  "recipientEmail": "friend@example.com",
  "message": "Try this amazing recipe!"
}
```

**Response** (201 Created):
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "recipeId": "507f1f77bcf86cd799439011",
  "ownerId": "507f1f77bcf86cd799439011",
  "recipientId": "507f1f77bcf86cd799439014",
  "status": "pending",
  "message": "Try this amazing recipe!",
  "sharedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### Get Shared Recipes

**Endpoint**: `GET /shared-recipes`  
**Authentication**: Required

**Description**: Get recipes shared with authenticated user.

**Query Parameters**:
- `status` (optional): Filter by status ('pending', 'accepted', 'rejected')

**Response** (200 OK):
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "recipeId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Pasta Carbonara",
      "imageUrl": "https://...",
      /* full recipe details */
    },
    "ownerId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "avatar": "https://..."
    },
    "status": "pending",
    "message": "Try this!",
    "sharedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### Update Share Status

**Endpoint**: `PATCH /shared-recipes/:id/status`  
**Authentication**: Required

**Description**: Accept or reject a shared recipe.

**Request Body**:
```json
{
  "status": "accepted" // or "rejected"
}
```

**Response** (200 OK):
```json
{
  "message": "Recipe share status updated",
  "share": { /* updated share object */ }
}
```

---

## 📅 Meal Planner

### Get Meal Plans

**Endpoint**: `GET /meal-plans`  
**Authentication**: Required

**Description**: Get meal plans for a date range.

**Query Parameters**:
- `startDate` (required): ISO date string (e.g., "2024-01-01")
- `endDate` (required): ISO date string (e.g., "2024-01-07")

**Response** (200 OK):
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439011",
    "date": "2024-01-01T00:00:00.000Z",
    "mealType": "breakfast",
    "recipeName": "Scrambled Eggs",
    "recipeId": "507f1f77bcf86cd799439012",
    "recipeType": "user",
    "calories": 300,
    "isConsumed": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### Create Meal Plan

**Endpoint**: `POST /meal-plans`  
**Authentication**: Required

**Description**: Add a meal to the meal planner.

**Request Body**:
```json
{
  "date": "2024-01-01",
  "mealType": "breakfast",
  "recipeName": "Scrambled Eggs",
  "recipeId": "507f1f77bcf86cd799439012",
  "recipeType": "user",
  "calories": 300
}
```

**Validation**:
- `mealType`: 'breakfast' | 'lunch' | 'dinner' | 'snack'
- `recipeType`: 'user' | 'shared' | 'edamam'

**Response** (201 Created):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  /* full meal plan object */
}
```

---

### Update Meal Plan

**Endpoint**: `PUT /meal-plans/:id`  
**Authentication**: Required

**Description**: Update meal plan entry.

**Request Body**:
```json
{
  "recipeName": "Updated Meal",
  "calories": 350,
  "isConsumed": true
}
```

**Response** (200 OK):
```json
{
  /* updated meal plan object */
}
```

---

### Delete Meal Plan

**Endpoint**: `DELETE /meal-plans/:id`  
**Authentication**: Required

**Description**: Remove meal from planner.

**Response** (200 OK):
```json
{
  "message": "Meal plan deleted successfully"
}
```

---

### Record Meal Consumption

**Endpoint**: `POST /meal-plans/consume`  
**Authentication**: Required

**Description**: Record that a meal was consumed (for calorie tracking).

**Request Body**:
```json
{
  "recipeName": "Pasta Carbonara",
  "calories": 450,
  "consumedAt": "2024-01-01T12:00:00.000Z" // optional, defaults to now
}
```

**Response** (201 Created):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439011",
  "recipeName": "Pasta Carbonara",
  "calories": 450,
  "consumedAt": "2024-01-01T12:00:00.000Z"
}
```

---

## 📊 Analytics

### Get Kitchen Analytics

**Endpoint**: `GET /analytics/summary`  
**Authentication**: Required

**Description**: Get comprehensive kitchen usage statistics.

**Response** (200 OK):
```json
{
  "groceries": {
    "total": 50,
    "statusCounts": {
      "pending": 10,
      "completed": 25,
      "used": 15
    },
    "wastePreventionRate": 88,
    "topItems": [
      {
        "_id": "milk",
        "count": 12,
        "totalQuantity": 24
      }
    ]
  },
  "meals": {
    "total": 30,
    "thisWeek": 7,
    "byType": {
      "breakfast": 10,
      "lunch": 10,
      "dinner": 8,
      "snack": 2
    }
  },
  "savings": {
    "estimated": 1250.50,
    "itemsSaved": 15
  }
}
```

---

### Get Weekly Calorie Analytics

**Endpoint**: `GET /analytics/weekly-calories`  
**Authentication**: Required

**Description**: Get calorie consumption analytics for the current week.

**Response** (200 OK):
```json
{
  "recommendedDaily": 2000,
  "weeklyData": [
    {
      "day": "Mon",
      "date": "2024-01-01",
      "consumed": 1950,
      "recommended": 2000,
      "status": "good"
    },
    {
      "day": "Tue",
      "date": "2024-01-02",
      "consumed": 2300,
      "recommended": 2000,
      "status": "over"
    }
  ],
  "summary": {
    "totalConsumed": 13500,
    "totalRecommended": 14000,
    "avgDaily": 1928
  }
}
```

**Status Values**:
- `good`: Within ±200 calories of recommended
- `over`: More than 200 calories over recommended
- `under`: More than 200 calories under recommended

---

## 🔔 Notifications

### Get All Notifications

**Endpoint**: `GET /notifications`  
**Authentication**: Required

**Description**: Get all notifications for authenticated user.

**Query Parameters**:
- `unreadOnly` (optional): boolean - Filter for unread notifications only
- `limit` (optional): number - Limit number of results (default: 50)

**Response** (200 OK):
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439011",
    "type": "grocery_expiry",
    "title": "⏰ Item Expiring Tomorrow",
    "message": "Milk will expire tomorrow. Use it soon!",
    "data": {
      "groceryItemId": "507f1f77bcf86cd799439012",
      "groceryItemName": "Milk",
      "expiryDate": "2024-12-25T00:00:00.000Z"
    },
    "isRead": false,
    "createdAt": "2024-12-24T00:00:00.000Z"
  }
]
```

**Notification Types**:
- `grocery_expiry`: Item expiring soon
- `recipe_shared`: Someone shared a recipe with you
- `share_accepted`: Your shared recipe was accepted
- `share_rejected`: Your shared recipe was rejected
- `meal_reminder`: Upcoming meal reminder

---

### Get Unread Count

**Endpoint**: `GET /notifications/unread-count`  
**Authentication**: Required

**Description**: Get count of unread notifications.

**Response** (200 OK):
```json
{
  "count": 5
}
```

---

### Mark Notification as Read

**Endpoint**: `PATCH /notifications/:id/read`  
**Authentication**: Required

**Description**: Mark a notification as read.

**Response** (200 OK):
```json
{
  "success": true
}
```

---

### Mark All as Read

**Endpoint**: `PATCH /notifications/mark-all-read`  
**Authentication**: Required

**Description**: Mark all notifications as read.

**Response** (200 OK):
```json
{
  "success": true
}
```

---

### Delete Notification

**Endpoint**: `DELETE /notifications/:id`  
**Authentication**: Required

**Description**: Delete a notification.

**Response** (200 OK):
```json
{
  "success": true
}
```

---

## ⚠️ Error Handling

### Error Response Format

All errors follow this structure:

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate email)
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

### Common Error Examples

**Authentication Error**:
```json
{
  "error": "Invalid or expired token"
}
```

**Validation Error**:
```json
{
  "error": "Validation failed",
  "details": {
    "email": ["Invalid email format"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

**Not Found Error**:
```json
{
  "error": "Recipe not found"
}
```

---

## 🔒 Rate Limiting

API requests are rate-limited to prevent abuse:
- **Authenticated requests**: 100 requests per 15 minutes
- **Unauthenticated requests**: 20 requests per 15 minutes

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## 📝 Notes

- All dates are in ISO 8601 format
- All timestamps are in UTC
- File uploads limited to 5MB
- Supported image formats: JPEG, PNG, WebP
- JWT tokens expire after 7 days
- Email verification codes expire after 10 minutes

---

## 🔄 Versioning

Current API Version: **v1**

Future versions will be accessed via:
```
/api/v2/endpoint
```

---

**Last Updated**: December 2024  
**Maintained By**: KitchenSathi Development Team

