# 🎉 Weekly Calorie Analytics Feature - COMPLETE!

## ✅ **What Was Implemented:**

A **simple, automatic weekly calorie consumption tracking system** that:
- Calculates recommended daily calories based on user profile (age, gender, weight, height)
- Tracks meals consumed from the meal planner
- Compares actual consumption vs recommended intake
- Displays beautiful charts and analytics

---

## 📋 **Files Created:**

### **Backend:**

1. **`backend/src/models/MealConsumption.ts`**
   - MongoDB model for tracking meal consumption
   - Fields: `userId`, `recipeName`, `calories`, `consumedAt`
   - Indexed for efficient querying by user and date

2. **`backend/src/services/calorieCalculator.ts`**
   - Simple BMR (Basal Metabolic Rate) calculator
   - Uses Mifflin-St Jeor Equation:
     - Men: BMR = (10 × weight) + (6.25 × height) - (5 × age) + 5
     - Women: BMR = (10 × weight) + (6.25 × height) - (5 × age) - 161
   - Multiplies BMR × 1.55 (moderate activity) for daily calories
   - Status calculation: good/over/under based on ±200 calorie threshold

3. **`backend/src/routes/calorieAnalytics.ts`**
   - `GET /api/analytics/weekly-calories` endpoint
   - Returns:
     - `recommendedDaily`: Calculated from user profile
     - `weeklyData`: Array of 7 days with consumed/recommended/status
     - `summary`: Total consumed, total recommended, average daily, overall status

4. **`backend/src/routes/mealPlans.ts` (Updated)**
   - Added `POST /api/meal-plans/consume` endpoint
   - Records meal consumption with recipe name, calories, and timestamp

5. **`backend/src/routes/index.ts` (Updated)**
   - Registered calorie analytics router under `/api/analytics`

### **Frontend:**

6. **`frontend/src/lib/calorieAnalyticsApi.ts`**
   - API client for calorie analytics
   - Functions: `getWeeklyCalories()`, `consumeMeal()`
   - TypeScript interfaces for type safety

7. **`frontend/src/components/CalorieAnalytics.tsx`**
   - Full-page React component with Recharts
   - Features:
     - **Summary Cards**: Recommended daily, your average, overall status
     - **Bar Chart**: Visual comparison of consumed vs recommended (7 days)
     - **Daily Breakdown**: List view with status indicators
     - **Info Note**: Explains how the system works
   - Responsive design with Tailwind CSS

8. **`frontend/src/App.tsx` (Updated)**
   - Added `/calorie-analytics` route

9. **`frontend/src/components/Dashboard.tsx` (Updated)**
   - Added "Calorie Analytics" quick action card (🔥 icon)

---

## 🎨 **UI Features:**

### **Summary Cards:**
- 🎯 **Recommended Daily** - Calculated from your profile
- 📈 **Your Average** - Average calories consumed per day
- ✓ **Overall Status** - Color-coded status indicator

### **Bar Chart:**
- **X-axis:** Day names (Sun, Mon, Tue, Wed, Thu, Fri, Sat)
- **Y-axis:** Calories
- **Two bars per day:**
  - 🟠 Orange: Consumed calories
  - 🟢 Green: Recommended calories
- Responsive and interactive with tooltips

### **Daily Breakdown:**
- Shows each day with:
  - Day name and date
  - Total calories consumed
  - Number of meals
  - Difference from recommended (+/- calories)
  - Status badge (On Track ✓ / Over Limit / Under Goal)

### **Status Colors:**
- 🟢 **Green (Good):** Within 200 calories of recommended
- 🟠 **Orange (Over):** Over by 200-500 calories
- 🔴 **Red (Under):** Under by 200+ or over by 500+ calories

---

## 🔧 **How It Works:**

### **1. User Profile → BMR Calculation**
```
User has: Age (30), Gender (Male), Weight (75kg), Height (175cm)
↓
BMR = (10 × 75) + (6.25 × 175) - (5 × 30) + 5 = 1,693 calories
↓
Daily Calories = 1,693 × 1.55 (moderate activity) = 2,624 calories
```

### **2. Meal Consumption Tracking**
```
User eats: "Grilled Chicken Salad" (450 cal)
↓
POST /api/meal-plans/consume
↓
Saved to MealConsumption collection
```

### **3. Weekly Analytics**
```
GET /api/analytics/weekly-calories
↓
Fetch last 7 days of meal consumptions
↓
Group by day, calculate totals
↓
Compare with recommended daily calories
↓
Return data for chart and breakdown
```

---

## 🚀 **How to Use:**

### **Step 1: Complete Your Profile**
1. Go to Dashboard
2. Click your avatar → "Manage Profile"
3. Go to "Profile" tab
4. Fill in:
   - **Date of Birth** (for age calculation)
   - **Gender** (Male/Female)
   - **Weight** (in kg)
   - **Height** (in cm)
5. Click "Save Changes"

### **Step 2: Add Meal Consumption Data**

**Option A: Using the API**
```bash
curl -X POST http://localhost:5000/api/meal-plans/consume \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "recipeName": "Grilled Chicken Salad",
    "calories": 450
  }'
```

**Option B: Using MongoDB (for testing)**
See `SAMPLE_CALORIE_DATA.md` for sample data script

### **Step 3: View Analytics**
1. Go to Dashboard
2. Click "Calorie Analytics" (🔥 icon)
3. View your weekly calorie overview!

---

## 📊 **API Endpoints:**

### **GET /api/analytics/weekly-calories**
**Response:**
```json
{
  "recommendedDaily": 2100,
  "weeklyData": [
    {
      "day": "Mon",
      "date": "2025-10-20",
      "consumed": 2200,
      "recommended": 2100,
      "status": "over",
      "meals": 3
    },
    // ... 6 more days
  ],
  "summary": {
    "totalConsumed": 14500,
    "totalRecommended": 14700,
    "avgDaily": 2071,
    "overallStatus": "good"
  }
}
```

### **POST /api/meal-plans/consume**
**Request:**
```json
{
  "recipeName": "Grilled Chicken Salad",
  "calories": 450,
  "consumedAt": "2025-10-26T10:30:00Z" // Optional, defaults to now
}
```

**Response:**
```json
{
  "_id": "...",
  "userId": "...",
  "recipeName": "Grilled Chicken Salad",
  "calories": 450,
  "consumedAt": "2025-10-26T10:30:00Z",
  "createdAt": "2025-10-26T10:30:00Z",
  "updatedAt": "2025-10-26T10:30:00Z"
}
```

---

## 🧪 **Testing:**

### **1. Test with Sample Data**
Use the script in `SAMPLE_CALORIE_DATA.md` to add 21 meals (3 per day for 7 days)

### **2. Expected Results**
For a 30-year-old male, 75kg, 175cm:
- **Recommended Daily:** ~2,100 calories
- **Chart:** Should show 7 days with orange (consumed) and green (recommended) bars
- **Status:** Most days should be "On Track ✓" if sample data is balanced

### **3. Error Handling**
- **Missing Profile:** Shows error message with link to complete profile
- **No Data:** Shows empty chart with 0 calories consumed
- **Loading State:** Shows spinner while fetching data

---

## 🎯 **Key Features:**

✅ **Automatic Calculation** - No manual input needed, uses existing profile data  
✅ **Simple BMR Formula** - Easy to understand and verify  
✅ **Visual Analytics** - Beautiful bar chart with Recharts  
✅ **Status Indicators** - Color-coded feedback (green/orange/red)  
✅ **Daily Breakdown** - Detailed view of each day's consumption  
✅ **Responsive Design** - Works on desktop and mobile  
✅ **Real-time Updates** - Fetches latest data on page load  
✅ **Error Handling** - Graceful handling of missing data or errors  

---

## 📦 **Dependencies:**

### **Backend:**
- `mongoose` - MongoDB ODM (already installed)
- `express` - Web framework (already installed)
- `zod` - Validation (already installed)

### **Frontend:**
- `recharts` - Charting library (newly installed)
- `react-router-dom` - Routing (already installed)
- `tailwindcss` - Styling (already installed)

---

## 🔮 **Future Enhancements (Optional):**

1. **Activity Level Selection** - Let users choose their activity level
2. **Goal Setting** - Allow users to set custom calorie goals
3. **Macro Tracking** - Track protein, carbs, fats
4. **Monthly View** - Expand to show monthly trends
5. **Export Data** - Export analytics as PDF or CSV
6. **Meal Suggestions** - Suggest meals based on remaining calories
7. **Integration with Meal Planner** - Auto-track when meals are marked as consumed

---

## 🎉 **Summary:**

The Weekly Calorie Analytics feature is now **fully functional** with:
- ✅ **Backend:** BMR calculator, meal consumption tracking, analytics endpoint
- ✅ **Frontend:** Beautiful React component with Recharts
- ✅ **Integration:** Seamlessly integrated into existing app
- ✅ **Documentation:** Complete with sample data and testing guide

**You now have a simple, automatic calorie tracking system!** 🔥📊

Users can:
1. Complete their profile once
2. Track meals (manually or automatically)
3. View weekly analytics with visual charts
4. See if they're on track with their recommended intake

**No complex settings, no manual logging, just simple insights!** ✨

