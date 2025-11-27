# 🍳 AI Meal Planning Feature - Setup Guide

## 🎯 Overview

This guide will help you set up the AI-powered meal planning feature for KitchenSathi.

---

## 📋 Prerequisites

1. **Spoonacular API Key** (Required)
   - Go to https://spoonacular.com/food-api/console#Dashboard
   - Sign up for a free account
   - Get your API key from the dashboard
   - **Free Tier:** 150 requests/day (perfect for development)
   - **Pricing:** Free tier is generous for testing

---

## 🔧 Backend Setup

### Step 1: Add Spoonacular API Key

Add to your `backend/.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/aajkyabanega
JWT_SECRET=your_jwt_secret_key_here
CORS_ORIGIN=*

# Spoonacular API Key
SPOONACULAR_API_KEY=your_actual_api_key_here
```

**Important:** Replace `your_actual_api_key_here` with your real Spoonacular API key!

### Step 2: Install Dependencies

The backend dependencies (`axios`) have already been installed.

### Step 3: Test Backend Setup

```powershell
cd D:\AajKyaBanega\backend
npm run dev
```

**Expected Output:**
```
🌐 API running on http://localhost:5000
📊 Health check: http://localhost:5000/api/health
```

### Step 4: Test API Key

Open a browser or use curl to test:

```
http://localhost:5000/api/recipes/suggestions
```

(You need to be logged in with a valid JWT token)

---

## 📁 Backend Files Created

### Models:
1. **`SavedRecipe.ts`** - Store user's saved/favorite recipes
2. **`MealPlan.ts`** - Store weekly meal plans with breakfast, lunch, dinner, snacks

### Services:
1. **`SpoonacularService.ts`** - API integration with Spoonacular
   - Search recipes by ingredients
   - Complex recipe search (diet, calories, cuisine)
   - Get recipe details (steps, nutrition, ingredients)
   - Get random recipes
   - Bulk operations

### Routes:
1. **`recipes.ts`** - Recipe search and saved recipes
   - `GET /api/recipes/suggestions` - Get AI suggestions based on grocery list
   - `POST /api/recipes/search` - Advanced search with filters
   - `GET /api/recipes/:id` - Get recipe details
   - `GET /api/recipes/saved/list` - Get saved recipes
   - `POST /api/recipes/saved` - Save a recipe
   - `PATCH /api/recipes/saved/:recipeId` - Update saved recipe (notes, rating)
   - `DELETE /api/recipes/saved/:recipeId` - Remove saved recipe

2. **`mealPlans.ts`** - Weekly meal planning
   - `GET /api/meal-plans?startDate=&endDate=` - Get meal plans for date range
   - `GET /api/meal-plans/:date` - Get meal plan for specific date
   - `POST /api/meal-plans` - Create/update meal plan
   - `POST /api/meal-plans/:date/meals` - Add meal to a date
   - `DELETE /api/meal-plans/:date/meals/:mealIndex` - Remove a meal
   - `DELETE /api/meal-plans/:date` - Delete entire day's plan
   - `GET /api/meal-plans/week/current` - Get current week (Mon-Sun)

---

## 🎨 Frontend Implementation

The frontend will be built in the next phase with:

1. **Recipe Suggestions Page** (`/recipes`)
   - View AI-recommended recipes based on your grocery list
   - Advanced filters (diet, cuisine, prep time, calories)
   - Beautiful recipe cards with images
   - Save/unsave recipes
   - View recipe details modal

2. **Weekly Meal Planner** (`/meal-planner`)
   - Calendar view (Monday-Sunday)
   - Drag-and-drop recipes to days
   - Breakfast, Lunch, Dinner, Snacks slots
   - Quick add from saved recipes
   - Generate shopping list from meal plan

3. **Saved Recipes** (`/recipes/saved`)
   - Your favorite/saved recipes
   - Personal notes and ratings
   - Quick access for meal planning

---

## 🚀 API Endpoints

### Recipe Suggestions (Smart - Uses Your Grocery List!)

```http
GET /api/recipes/suggestions
Authorization: Bearer <jwt_token>
Query params:
  - diet: vegetarian, vegan, gluten-free, etc.
  - maxCalories: number
  - cuisine: italian, mexican, chinese, etc.
  - type: main course, dessert, appetizer, etc.
  - maxReadyTime: number (minutes)
  - limit: number of results (default 10)

Response:
{
  "recipes": [
    {
      "id": 123456,
      "title": "Creamy Pasta",
      "image": "https://...",
      "usedIngredientCount": 5,
      "missedIngredientCount": 2,
      "usedIngredients": [...],
      "missedIngredients": [...]
    }
  ],
  "matchType": "ingredients",
  "userIngredients": ["milk", "potato", "bread"]
}
```

### Advanced Recipe Search

```http
POST /api/recipes/search
Authorization: Bearer <jwt_token>
Body:
{
  "query": "pasta",
  "diet": "vegetarian",
  "maxCalories": 500,
  "cuisine": "italian",
  "type": "main course",
  "maxReadyTime": 30,
  "number": 10,
  "offset": 0,
  "useMyIngredients": true
}

Response:
{
  "recipes": [...],
  "totalResults": 156,
  "searchParams": {...}
}
```

### Get Recipe Details

```http
GET /api/recipes/:id
Authorization: Bearer <jwt_token>

Response:
{
  "id": 123456,
  "title": "Creamy Pasta",
  "image": "https://...",
  "servings": 4,
  "readyInMinutes": 30,
  "summary": "Delicious creamy pasta...",
  "instructions": "Step 1...",
  "analyzedInstructions": [...],
  "extendedIngredients": [...],
  "nutrition": {
    "nutrients": [
      { "name": "Calories", "amount": 450, "unit": "kcal" },
      { "name": "Protein", "amount": 15, "unit": "g" }
    ]
  }
}
```

### Save a Recipe

```http
POST /api/recipes/saved
Authorization: Bearer <jwt_token>
Body:
{
  "recipeId": 123456,
  "title": "Creamy Pasta",
  "image": "https://...",
  "servings": 4,
  "readyInMinutes": 30,
  "notes": "Kids loved it!",
  "rating": 5
}
```

### Add Meal to Plan

```http
POST /api/meal-plans/2025-10-25/meals
Authorization: Bearer <jwt_token>
Body:
{
  "recipeId": 123456,
  "title": "Creamy Pasta",
  "image": "https://...",
  "servings": 4,
  "mealType": "dinner",
  "notes": "Family dinner"
}
```

---

## 🎯 Features Implemented

### ✅ Backend Features:
1. **Smart Recipe Suggestions**
   - Uses user's grocery list items
   - Matches recipes with available ingredients
   - Shows "best matches" first (most ingredients available)

2. **Advanced Filtering**
   - Dietary restrictions (vegetarian, vegan, gluten-free)
   - Calorie limits
   - Cuisine types
   - Meal types (breakfast, lunch, dinner)
   - Maximum prep time

3. **Recipe Management**
   - Save favorite recipes
   - Add personal notes and ratings
   - View detailed nutrition info
   - Step-by-step instructions

4. **Weekly Meal Planning**
   - Plan meals for any date
   - Organize by meal type (breakfast, lunch, dinner, snack)
   - View current week at a glance
   - Easy to modify and update

---

## 🧪 Testing the API

Use these test requests (replace `<token>` with your JWT):

```powershell
# 1. Get suggestions based on your grocery list
curl http://localhost:5000/api/recipes/suggestions `
  -H "Authorization: Bearer <token>"

# 2. Search for vegetarian pasta recipes
curl -X POST http://localhost:5000/api/recipes/search `
  -H "Authorization: Bearer <token>" `
  -H "Content-Type: application/json" `
  -d '{\"query\":\"pasta\",\"diet\":\"vegetarian\"}'

# 3. Get recipe details
curl http://localhost:5000/api/recipes/654959 `
  -H "Authorization: Bearer <token>"

# 4. Get current week's meal plans
curl http://localhost:5000/api/meal-plans/week/current `
  -H "Authorization: Bearer <token>"
```

---

## 🎨 Next Steps

1. **Frontend Implementation** (Coming next!)
   - Recipe Suggestions page
   - Recipe Details modal
   - Weekly Meal Planner calendar
   - Saved Recipes page

2. **UI/UX Polish**
   - Loading states
   - Error handling
   - Empty states
   - Responsive design

3. **Advanced Features** (Future)
   - Generate shopping list from meal plan
   - Nutrition tracking
   - Recipe collections/cookbooks
   - Share recipes with friends

---

## 💡 Tips

1. **API Rate Limits:**
   - Free tier: 150 requests/day
   - Cache recipe details to reduce API calls
   - Use bulk endpoints when possible

2. **Best Practices:**
   - Always include error handling
   - Show loading indicators
   - Provide fallback for no results
   - Cache frequently accessed data

3. **Performance:**
   - Use pagination for search results
   - Lazy load images
   - Debounce search inputs
   - Cache saved recipes locally

---

## 📚 Resources

- **Spoonacular API Docs:** https://spoonacular.com/food-api/docs
- **API Console:** https://spoonacular.com/food-api/console
- **Recipe Examples:** https://spoonacular.com/food-api/docs#Search-Recipes-Complex

---

## ✅ Status

**Backend:** ✅ Complete and ready!
**Frontend:** ⏳ Ready to build next!

The backend infrastructure is fully set up. Once you add your Spoonacular API key, you can start building the frontend components!

