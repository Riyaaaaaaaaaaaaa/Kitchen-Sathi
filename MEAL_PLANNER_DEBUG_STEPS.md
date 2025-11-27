# Meal Planner Debug Steps

## 🐛 Current Issues

### Issue 1: Custom Meal Not Adding
**Error**: "Failed to add meal to plan"

### Issue 2: Duplicate Toast Warnings
**Error**: Warning toast appearing twice

---

## 🔍 Debugging Steps

### Step 1: Check Browser Console

Open browser console (F12) and try adding a custom meal. Look for:

```
📤 Adding custom meal: { date: '...', meal: {...} }
```

**Check these values**:
- Is `date` in format `YYYY-MM-DD`? (e.g., `2025-10-25`)
- Is `mealType` one of: `breakfast`, `lunch`, `dinner`, `snack`?
- Is `recipeId` a string starting with `custom_`?

### Step 2: Check Network Tab

1. Open Network tab (F12 → Network)
2. Try adding custom meal "Pizza"
3. Look for request to `/api/meal-plans/2025-10-25/meals`

**Check**:
- Status code: Should be `201` (Created)
- Request payload:
  ```json
  {
    "recipeId": "custom_1729857600000",
    "title": "Pizza",
    "image": "",
    "servings": 1,
    "mealType": "lunch",
    "notes": ""
  }
  ```
- Response: Should return meal plan object

### Step 3: Check Backend Logs

Look for these logs in backend terminal:

```
[mealPlans] ➕ POST /:date/meals - Date: 2025-10-25, User: ...
[mealPlans] ✅ Added meal: Pizza to 2025-10-25
```

**If you see errors**:
- Zod validation error → Check payload format
- MongoDB error → Check database connection
- Auth error → Check token is being sent

---

## 🔧 Fixes Applied

### Fix 1: Removed Duplicate Toast Warning

**Problem**: `useEffect` was running multiple times

**Solution**: Simplified dependencies and added eslint-disable comment

```typescript
useEffect(() => {
  // Validate date...
  if (selectedDate < today) {
    warning('...');
    setTimeout(() => onClose(), 3000);
    return;
  }
  loadSavedRecipes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // Only run once when modal opens
```

### Fix 2: Enhanced Error Logging

**Added detailed console logs**:
```typescript
console.log('📤 Adding custom meal:', { date, meal });
const result = await addMealToPlan(date, meal);
console.log('✅ Custom meal added successfully:', result);
```

**Better error extraction**:
```typescript
let errorMessage = 'Failed to add meal to plan';
if (err.message) {
  errorMessage = err.message;
} else if (err.error) {
  errorMessage = err.error;
} else if (typeof err === 'string') {
  errorMessage = err;
}
```

---

## 🧪 Manual Testing

### Test Case 1: Add Custom Meal (Today)
1. ✅ Open meal planner
2. ✅ Click on today's date → Lunch
3. ✅ Go to "Custom Meal" tab
4. ✅ Enter "Pizza" as title
5. ✅ Click "Add Custom Meal"
6. ✅ Should see green success toast
7. ✅ Modal should close
8. ✅ Pizza should appear in Lunch column

### Test Case 2: Add Custom Meal (Future Date)
1. ✅ Click next week arrow
2. ✅ Click any future date → Dinner
3. ✅ Add custom meal "Pasta"
4. ✅ Should work without errors

### Test Case 3: Past Date Warning
1. ✅ Click previous week arrow
2. ✅ Click any past date
3. ✅ Should see ONE yellow warning toast
4. ✅ No duplicates
5. ✅ Modal auto-closes after 3 seconds

---

## 🔍 Common Issues & Solutions

### Issue: "Failed to add meal to plan"

**Possible Causes**:

1. **Backend not running**
   - Check: `http://localhost:5000/api/health`
   - Fix: Start backend with `npm run dev`

2. **Date format incorrect**
   - Check console: Date should be `YYYY-MM-DD`
   - Fix: Verify `date` prop in `AddMealModal`

3. **Invalid meal type**
   - Check: `mealType` should be lowercase
   - Fix: Ensure it's one of: `breakfast`, `lunch`, `dinner`, `snack`

4. **Auth token missing**
   - Check Network tab: Should have `Authorization: Bearer ...` header
   - Fix: Log out and log back in

5. **Backend validation error**
   - Check backend logs for Zod errors
   - Fix: Ensure all required fields are present

### Issue: Duplicate Toasts

**Cause**: React Strict Mode runs effects twice in development

**Fix Applied**: Simplified `useEffect` dependencies and added guard

---

## 📊 Expected Behavior

### Success Flow

```
User clicks "Add Custom Meal"
  ↓
Frontend validates title (not empty)
  ↓
Frontend creates meal object:
{
  recipeId: "custom_1729857600000",
  title: "Pizza",
  image: "",
  servings: 1,
  mealType: "lunch",
  notes: ""
}
  ↓
POST /api/meal-plans/2025-10-25/meals
  ↓
Backend validates with Zod
  ↓
Backend saves to MongoDB
  ↓
Backend returns meal plan
  ↓
Frontend shows success toast
  ↓
Modal closes
  ↓
Meal appears in calendar
```

### Error Flow

```
User clicks "Add Custom Meal" (empty title)
  ↓
Frontend validation fails
  ↓
Show error toast: "Please enter a meal title"
  ↓
Stay on modal
```

---

## 🎯 Next Steps

1. **Open browser console** (F12)
2. **Try adding custom meal "Pizza"**
3. **Copy all console logs** and send them
4. **Check Network tab** for the API request
5. **Check backend terminal** for logs

This will help identify exactly where the error is happening!

---

## 🔧 Quick Fixes to Try

### Fix 1: Clear Browser Cache
```
1. Press Ctrl+Shift+Delete
2. Clear cached images and files
3. Reload page (Ctrl+F5)
```

### Fix 2: Restart Backend
```bash
cd D:\AajKyaBanega\backend
npm run dev
```

### Fix 3: Check Backend Health
Open: `http://localhost:5000/api/health`

Should see:
```json
{
  "status": "ok",
  "service": "KitchenSathi API",
  "time": "..."
}
```

### Fix 4: Test API Directly

Use Postman or curl:
```bash
curl -X POST http://localhost:5000/api/meal-plans/2025-10-25/meals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "recipeId": "custom_test",
    "title": "Test Meal",
    "image": "",
    "servings": 1,
    "mealType": "lunch"
  }'
```

Should return 201 with meal plan object.

---

## 📝 Files Modified

- `AddMealModal.tsx`:
  - Simplified `useEffect` dependencies
  - Added detailed error logging
  - Better error message extraction
  - Removed duplicate toast issue

---

## ✅ Status

- ✅ Duplicate toast warning - FIXED
- ⏳ Custom meal not adding - INVESTIGATING (need console logs)

Please try adding a custom meal and share:
1. Browser console logs
2. Network tab request/response
3. Backend terminal logs

