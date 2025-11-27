# ✅ Edamam Migration - Setup Checklist

## 🎯 Quick Setup Guide

Follow these steps to complete the Edamam API migration:

---

## Step 1: Get Edamam Credentials ⏱️ 5 minutes

1. **Visit:** https://developer.edamam.com/
2. **Sign up** for a free account
3. **Create Application:**
   - Click "Get an API Key"
   - Select "Recipe Search API"
   - Choose "Developer" plan (free)
4. **Copy Credentials:**
   - Application ID
   - Application Key

---

## Step 2: Update Environment Variables ⏱️ 1 minute

1. **Open:** `D:\AajKyaBanega\backend\.env`

2. **Remove/Comment Spoonacular:**
   ```env
   # SPOONACULAR_API_KEY=your_old_key
   ```

3. **Add Edamam:**
   ```env
   EDAMAM_APP_ID=paste_your_app_id_here
   EDAMAM_APP_KEY=paste_your_app_key_here
   ```

4. **Save the file**

---

## Step 3: Restart Backend ⏱️ 1 minute

```powershell
# Stop current backend (Ctrl+C if running)

# Navigate to backend
cd D:\AajKyaBanega\backend

# Start backend
npm run dev
```

**Look for this in console:**
```
✅ [EdamamService] Initialized with App ID: Present
```

✅ If you see this, Edamam is configured correctly!
❌ If you see "Missing", check your `.env` file

---

## Step 4: Test Recipe Features ⏱️ 5 minutes

### Test 1: Basic Recipe Search
1. Go to http://localhost:5173
2. Login
3. Click "Recipe Suggestions"
4. Should see recipes loading

✅ **Success:** Recipes display with images
❌ **Fail:** Check browser console and backend logs

### Test 2: Ingredient-Based Search
1. Go to "Grocery List"
2. Add an item (e.g., "Pasta")
3. Mark it as "Bought" (click status until ✅)
4. Go to "Recipe Suggestions"
5. Check "Use my ingredients"
6. Click "Search"

✅ **Success:** Shows pasta recipes, info banner shows "pasta"
❌ **Fail:** Check if item is marked as "completed" in database

### Test 3: Filters
1. On Recipe Suggestions page
2. Select "Diet: Vegetarian"
3. Click "Search"

✅ **Success:** Shows only vegetarian recipes
❌ **Fail:** Check backend console for API errors

### Test 4: Recipe Details
1. Click any recipe card
2. Modal should open with details

✅ **Success:** Shows recipe info, ingredients, nutrition
❌ **Fail:** Check recipe ID format in console

### Test 5: Save Recipe
1. Open a recipe
2. Click "Save Recipe"
3. Button changes to "❤️ Saved"
4. Click "Saved Recipes" tab
5. Should see saved recipe

✅ **Success:** Recipe appears in saved list
❌ **Fail:** Check MongoDB connection

---

## Step 5: Verify Console Logs ⏱️ 2 minutes

### Backend Console Should Show:
```
✅ [EdamamService] Initialized with App ID: Present
🔍 [EdamamService] Searching recipes with params: ...
🛒 [EdamamService] Using ingredients: pasta
✅ [EdamamService] Found 15 recipes
[recipes] 🍳 GET /suggestions - User: ...
[recipes] Found 1 BOUGHT grocery items for user
[recipes] Using bought ingredients: pasta
```

### Browser Console Should Show:
```
🛒 [getBoughtIngredients] Found 1 bought items
🔍 [performSearch] Using 1 bought ingredients: pasta
✅ [performSearch] Search found 15 total recipes
```

---

## 🐛 Troubleshooting

### Problem: "Invalid API credentials"

**Check:**
- [ ] `.env` file has `EDAMAM_APP_ID` and `EDAMAM_APP_KEY`
- [ ] No typos in credentials
- [ ] Backend restarted after adding credentials
- [ ] Credentials are from Recipe Search API (not Nutrition API)

**Fix:**
1. Double-check credentials at https://developer.edamam.com/admin/applications
2. Copy-paste again (avoid typing)
3. Restart backend

---

### Problem: "No recipes found"

**Check:**
- [ ] Have grocery items marked as "bought"
- [ ] Search query is not empty
- [ ] Filters are not too restrictive
- [ ] API quota not exceeded

**Fix:**
1. Go to Grocery List
2. Mark at least one item as "Bought"
3. Try search again

---

### Problem: "API quota exceeded"

**Check:**
- [ ] Made more than 10 requests in 1 minute
- [ ] Reached monthly limit (10,000)

**Fix:**
1. Wait 1 minute for rate limit reset
2. Check usage at https://developer.edamam.com/admin/applications
3. Consider upgrading if needed

---

### Problem: Recipe details not loading

**Check:**
- [ ] Recipe ID format (should be string)
- [ ] Network connection
- [ ] Backend logs for errors

**Fix:**
1. Check browser console for errors
2. Check backend console for API errors
3. Try a different recipe

---

## ✅ Final Verification

Run through this checklist:

- [ ] Backend starts without errors
- [ ] Console shows "EdamamService Initialized"
- [ ] Recipe search returns results
- [ ] Filters work (diet, cuisine, etc.)
- [ ] "Use my ingredients" only uses bought items
- [ ] Pending items are excluded from search
- [ ] Recipe details modal opens
- [ ] Save recipe works
- [ ] Saved recipes list shows items
- [ ] Ingredient match badges display
- [ ] No console errors

**All checked?** ✅ **Migration Complete!**

---

## 📊 Expected Behavior

### Grocery List Status Filtering:

| Item | Status | Used in Recipe Search? |
|------|--------|----------------------|
| Pasta | **Completed** (Bought) | ✅ YES |
| Potato | Pending | ❌ NO |
| Tomato | Used | ❌ NO |

### Search Results:
- Shows recipes using **only bought ingredients**
- Info banner: "Recipes matched with your ingredients: pasta"
- Match badges: "✓ 1 match" (pasta)

---

## 🎉 Success!

If all tests pass, your migration is complete!

**What's Working:**
- ✅ Edamam API integration
- ✅ Bought ingredients filtering
- ✅ Recipe search and filters
- ✅ Save/unsave recipes
- ✅ Recipe details
- ✅ All existing features

**Benefits:**
- 💰 More cost-effective
- 🎯 Better ingredient matching
- 📊 Comprehensive nutrition data
- 🔄 More filter options

---

## 📞 Need Help?

**Check Documentation:**
- `EDAMAM_MIGRATION_GUIDE.md` - Complete migration guide
- `RECIPE_SEARCH_BOUGHT_ITEMS_FIX.md` - Ingredient filtering details

**Common Issues:**
1. Missing credentials → Add to `.env`
2. No recipes → Mark items as bought
3. API errors → Check credentials and quota

**Still stuck?**
- Check Edamam docs: https://developer.edamam.com/edamam-docs-recipe-api
- Review backend console logs
- Check browser console for errors

---

**Total Setup Time:** ~15 minutes
**Difficulty:** Easy
**Status:** Ready to use! 🚀

