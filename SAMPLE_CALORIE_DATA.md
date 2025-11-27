# 📊 Sample Calorie Data for Testing

## Quick Test Script

Use this script to add sample meal consumption data to test the calorie analytics feature.

### Option 1: Using MongoDB Compass or Shell

```javascript
// Connect to your MongoDB database
// Switch to your database (e.g., 'test' or 'kitchensathi')

// Replace USER_ID with your actual user ID from the users collection
const userId = ObjectId("YOUR_USER_ID_HERE");

// Insert sample meal consumptions for the last 7 days
db.mealconsumptions.insertMany([
  // Today
  {
    userId: userId,
    recipeName: "Grilled Chicken Salad",
    calories: 450,
    consumedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: userId,
    recipeName: "Oatmeal with Berries",
    calories: 320,
    consumedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: userId,
    recipeName: "Pasta Primavera",
    calories: 580,
    consumedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Yesterday
  {
    userId: userId,
    recipeName: "Scrambled Eggs & Toast",
    calories: 380,
    consumedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: userId,
    recipeName: "Chicken Burrito Bowl",
    calories: 650,
    consumedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: userId,
    recipeName: "Greek Yogurt Parfait",
    calories: 280,
    consumedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // 2 days ago
  {
    userId: userId,
    recipeName: "Avocado Toast",
    calories: 420,
    consumedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: userId,
    recipeName: "Salmon with Vegetables",
    calories: 520,
    consumedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: userId,
    recipeName: "Smoothie Bowl",
    calories: 340,
    consumedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // 3 days ago
  {
    userId: userId,
    recipeName: "Pancakes with Syrup",
    calories: 480,
    consumedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: userId,
    recipeName: "Turkey Sandwich",
    calories: 420,
    consumedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: userId,
    recipeName: "Beef Stir Fry",
    calories: 620,
    consumedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // 4 days ago
  {
    userId: userId,
    recipeName: "Breakfast Burrito",
    calories: 520,
    consumedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: userId,
    recipeName: "Caesar Salad",
    calories: 380,
    consumedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: userId,
    recipeName: "Spaghetti Bolognese",
    calories: 680,
    consumedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // 5 days ago
  {
    userId: userId,
    recipeName: "French Toast",
    calories: 450,
    consumedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: userId,
    recipeName: "Chicken Wrap",
    calories: 480,
    consumedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: userId,
    recipeName: "Vegetable Curry",
    calories: 520,
    consumedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // 6 days ago
  {
    userId: userId,
    recipeName: "Bagel with Cream Cheese",
    calories: 380,
    consumedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: userId,
    recipeName: "Tuna Salad",
    calories: 420,
    consumedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: userId,
    recipeName: "Chicken Alfredo",
    calories: 720,
    consumedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);
```

### Option 2: Using the API Endpoint

You can also use the `/api/meal-plans/consume` endpoint to add data:

```bash
# Get your auth token first (login)
TOKEN="your_jwt_token_here"

# Add a meal consumption
curl -X POST http://localhost:5000/api/meal-plans/consume \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "recipeName": "Grilled Chicken Salad",
    "calories": 450
  }'
```

### Option 3: Quick PowerShell Script

```powershell
# Set your auth token
$token = "your_jwt_token_here"

# Sample meals
$meals = @(
  @{ recipeName = "Oatmeal with Berries"; calories = 320 },
  @{ recipeName = "Grilled Chicken Salad"; calories = 450 },
  @{ recipeName = "Pasta Primavera"; calories = 580 }
)

# Add each meal
foreach ($meal in $meals) {
  $body = $meal | ConvertTo-Json
  Invoke-RestMethod -Uri "http://localhost:5000/api/meal-plans/consume" `
    -Method POST `
    -Headers @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" } `
    -Body $body
  Write-Host "Added: $($meal.recipeName)"
}
```

## Testing the Feature

1. **Complete Your Profile First**
   - Make sure you have filled in: Age (date of birth), Gender, Weight, Height
   - Go to Dashboard → Click your avatar → Manage Profile → Profile tab

2. **Add Sample Data**
   - Use one of the methods above to add meal consumption data

3. **View Analytics**
   - Go to Dashboard → Click "Calorie Analytics" (🔥 icon)
   - You should see:
     - Recommended daily calories (calculated from your profile)
     - Weekly bar chart comparing consumed vs recommended
     - Daily breakdown with status indicators

## Expected Results

For a typical user (e.g., 30-year-old male, 75kg, 175cm):
- **Recommended Daily:** ~2,100 calories
- **Status Colors:**
  - 🟢 Green: 1,900 - 2,300 calories (within 200 of recommended)
  - 🟠 Orange: 2,300 - 2,600 calories (over by 200-500)
  - 🔴 Red: <1,900 or >2,600 calories (significantly off)

## Troubleshooting

### "Please complete your profile" Error
- Go to Manage Profile → Profile tab
- Fill in: Date of Birth, Gender, Weight (kg), Height (cm)
- Click "Save Changes"

### No Data Showing
- Check if you have meal consumptions in the database
- Verify the `consumedAt` dates are within the last 7 days
- Check browser console for errors

### Chart Not Rendering
- Ensure Recharts is installed: `npm install recharts`
- Check for console errors in browser dev tools

## Sample User Profile for Testing

```javascript
// Update user profile with sample data
db.users.updateOne(
  { email: "your@email.com" },
  {
    $set: {
      dateOfBirth: new Date("1995-01-15"),
      gender: "male",
      weight: 75,  // kg
      height: 175  // cm
    }
  }
);
```

This will give you a recommended daily calorie intake of approximately 2,100 calories.

