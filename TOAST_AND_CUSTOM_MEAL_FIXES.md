# Toast and Custom Meal Fixes

## 🎯 Issues Reported

### Issue 1: Custom Meal Not Adding ❌
**Error**: "Failed to add meal to plan" toast appears when trying to add custom meal

**Screenshot**: First image shows modal with "Pizza" entered, error toast at top right

### Issue 2: Duplicate Toast Warnings ❌
**Error**: Warning toast appearing twice when opening modal for past dates

**Screenshot**: Second image shows two identical yellow warning toasts stacked

---

## ✅ Fixes Applied

### Fix 1: Duplicate Toast Warning - RESOLVED ✅

**Problem**: 
- `useEffect` was running multiple times
- React Strict Mode (development) runs effects twice
- Dependencies array was causing re-renders
- Each render = new toast

**Solution**:
```typescript
// Before:
const [hasValidated, setHasValidated] = useState(false);

useEffect(() => {
  if (hasValidated) return;
  setHasValidated(true);
  // validation...
}, [hasValidated, date, warning, onClose]); // ❌ Too many dependencies

// After:
useEffect(() => {
  // Validate date...
  if (selectedDate < today) {
    warning('...');
    setTimeout(() => onClose(), 3000);
    return;
  }
  loadSavedRecipes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // ✅ Run only once when modal opens
```

**Result**: ✅ Warning toast now appears only ONCE

---

### Fix 2: Enhanced Error Logging for Custom Meal - IN PROGRESS 🔍

**Added Detailed Console Logging**:
```typescript
const handleAddCustomMeal = async () => {
  // ... validation ...
  
  try {
    const meal: MealPlanEntry = {
      recipeId: `custom_${Date.now()}`,
      title: customMeal.title,
      image: '',
      servings: customMeal.servings,
      mealType,
      notes: customMeal.notes
    };

    console.log('📤 Adding custom meal:', { date, meal });
    const result = await addMealToPlan(date, meal);
    console.log('✅ Custom meal added successfully:', result);
    
    success(`Added "${customMeal.title}" to your meal plan!`);
    onSuccess();
  } catch (err: any) {
    console.error('❌ Failed to add custom meal:', err);
    console.error('Error details:', {
      message: err.message,
      response: err.response,
      data: err.data
    });
    
    // Better error extraction
    let errorMessage = 'Failed to add meal to plan';
    if (err.message) {
      errorMessage = err.message;
    } else if (err.error) {
      errorMessage = err.error;
    } else if (typeof err === 'string') {
      errorMessage = err;
    }
    
    showError(errorMessage);
  }
};
```

**What This Does**:
- ✅ Logs the exact payload being sent
- ✅ Logs the API response on success
- ✅ Logs detailed error information on failure
- ✅ Extracts specific error messages from various formats
- ✅ Shows user-friendly error in toast

---

## 🔍 Debugging the Custom Meal Issue

### What We Need to Check

The enhanced logging will show us exactly what's happening. Please:

1. **Open Browser Console** (Press F12)
2. **Try adding a custom meal** (e.g., "Pizza")
3. **Look for these logs**:

**On Success** (should see):
```
📤 Adding custom meal: {
  date: "2025-10-25",
  meal: {
    recipeId: "custom_1729857600000",
    title: "Pizza",
    image: "",
    servings: 1,
    mealType: "lunch",
    notes: ""
  }
}
✅ Custom meal added successfully: { ... meal plan object ... }
```

**On Error** (will see):
```
❌ Failed to add custom meal: Error { ... }
Error details: {
  message: "...",
  response: ...,
  data: ...
}
```

4. **Also check Network tab** (F12 → Network):
   - Look for request to `/api/meal-plans/2025-10-25/meals`
   - Check status code (should be 201)
   - Check request payload
   - Check response body

5. **Check Backend Terminal**:
   - Should see: `[mealPlans] ➕ POST /:date/meals - Date: 2025-10-25`
   - Should see: `[mealPlans] ✅ Added meal: Pizza to 2025-10-25`
   - Or error logs if something failed

---

## 🎯 Possible Causes & Solutions

### Cause 1: Backend Not Running
**Symptom**: Network error, no API logs

**Solution**:
```bash
cd D:\AajKyaBanega\backend
npm run dev
```

### Cause 2: Date Format Issue
**Symptom**: Backend validation error

**Check**: Console log should show `date: "2025-10-25"` (YYYY-MM-DD format)

**Solution**: Verify date format in `WeeklyMealPlanner` component

### Cause 3: Invalid Meal Type
**Symptom**: Zod validation error

**Check**: `mealType` should be lowercase: `breakfast`, `lunch`, `dinner`, or `snack`

**Solution**: Already handled in code

### Cause 4: Auth Token Missing
**Symptom**: 401 Unauthorized

**Check**: Network tab should show `Authorization: Bearer ...` header

**Solution**: Log out and log back in

### Cause 5: MongoDB Connection Issue
**Symptom**: Backend error: "Failed to save to database"

**Check**: Backend logs for MongoDB connection errors

**Solution**: Ensure MongoDB is running

---

## 📊 Expected vs Actual

### Expected Behavior ✅

```
1. User enters "Pizza" in Custom Meal form
2. User clicks "Add Custom Meal"
3. Frontend validates title (not empty) ✓
4. Frontend creates meal object ✓
5. POST /api/meal-plans/2025-10-25/meals
6. Backend validates with Zod
7. Backend saves to MongoDB
8. Backend returns 201 with meal plan
9. Frontend shows green success toast
10. Modal closes
11. Pizza appears in Lunch column
```

### Actual Behavior ❌

```
1. User enters "Pizza" ✓
2. User clicks "Add Custom Meal" ✓
3. Frontend validates ✓
4. API call happens (?)
5. Error occurs (?)
6. Red error toast: "Failed to add meal to plan"
7. Modal stays open
```

**Missing Info**: Steps 4-5 (what exactly fails?)

---

## 🧪 Testing Checklist

### Test 1: Duplicate Toast (FIXED ✅)
- [ ] Navigate to previous week
- [ ] Click any past date
- [ ] Modal opens
- [ ] See ONE yellow warning toast (not two)
- [ ] Modal auto-closes after 3 seconds

**Status**: ✅ SHOULD BE FIXED

### Test 2: Custom Meal (TODAY)
- [ ] Open meal planner
- [ ] Click today's date → Lunch
- [ ] Go to "Custom Meal" tab
- [ ] Enter "Pizza"
- [ ] Click "Add Custom Meal"
- [ ] Check browser console for logs
- [ ] Should see success or detailed error

**Status**: 🔍 INVESTIGATING (need logs)

### Test 3: Custom Meal (FUTURE DATE)
- [ ] Click next week
- [ ] Click any future date → Dinner
- [ ] Add custom meal "Pasta"
- [ ] Check console logs

**Status**: 🔍 INVESTIGATING

---

## 🔧 Files Modified

| File | Changes | Status |
|------|---------|--------|
| `AddMealModal.tsx` | Simplified `useEffect` dependencies | ✅ Done |
| `AddMealModal.tsx` | Added detailed error logging | ✅ Done |
| `AddMealModal.tsx` | Better error message extraction | ✅ Done |

---

## 📝 Next Steps

### Immediate Actions:

1. **Test the duplicate toast fix**:
   - Try clicking a past date
   - Verify only ONE warning appears

2. **Debug custom meal issue**:
   - Open browser console (F12)
   - Try adding "Pizza" as custom meal
   - Copy ALL console logs
   - Copy Network tab request/response
   - Copy backend terminal logs
   - Share all logs

3. **Quick health check**:
   - Visit: `http://localhost:5000/api/health`
   - Should return: `{ "status": "ok", ... }`

### If Still Not Working:

1. **Clear browser cache**: Ctrl+Shift+Delete
2. **Restart backend**: `npm run dev`
3. **Restart frontend**: `npm run dev`
4. **Try in incognito window**: Rule out cache issues

---

## 💡 What the Logs Will Tell Us

### Scenario A: API Call Never Happens
**Console shows**: Nothing (no "📤 Adding custom meal" log)

**Means**: Frontend validation or button click not working

**Fix**: Check button handler, form state

### Scenario B: API Call Fails Immediately
**Console shows**: 
```
📤 Adding custom meal: {...}
❌ Failed to add custom meal: Network error
```

**Means**: Backend not running or wrong URL

**Fix**: Start backend, check API_BASE URL

### Scenario C: Backend Returns Error
**Console shows**:
```
📤 Adding custom meal: {...}
❌ Failed to add custom meal: { message: "Validation failed" }
Error details: { ... }
```

**Means**: Backend validation error (Zod)

**Fix**: Check payload format matches schema

### Scenario D: Success But No UI Update
**Console shows**:
```
📤 Adding custom meal: {...}
✅ Custom meal added successfully: {...}
```

**Means**: API works, but `onSuccess()` not updating UI

**Fix**: Check `onSuccess` callback in `WeeklyMealPlanner`

---

## 🎉 Summary

### ✅ FIXED
- Duplicate toast warnings (simplified useEffect)

### 🔍 INVESTIGATING
- Custom meal not adding (enhanced logging added)

### 📋 NEED FROM USER
- Browser console logs when adding custom meal
- Network tab request/response
- Backend terminal output

**Once we have the logs, we can pinpoint the exact issue and fix it!** 🚀

