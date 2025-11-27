# Legacy Recipe Cleanup Guide

## Overview

After migrating from Spoonacular to Edamam API, saved recipes from the old system are no longer compatible. This guide explains how the cleanup system works and how users can remove old recipes.

---

## Problem

**Spoonacular IDs**: Numeric format (e.g., `654959`, `782585`)  
**Edamam IDs**: URI format (e.g., `recipe_abc123...`, full URIs)

When users try to view old saved recipes, they get:
- ❌ "Failed to get recipe details"
- ❌ 410 Gone HTTP status
- ❌ "Legacy recipe ID" error message

---

## Solution: Automatic Detection + Manual Cleanup

### 1. Backend Detection

**Route**: `GET /api/recipes/saved/list`

```typescript
// Automatically logs legacy recipe count
const legacyCount = savedRecipes.filter(r => /^\d+$/.test(r.recipeId)).length;
if (legacyCount > 0) {
  console.log(`⚠️  Found ${legacyCount} legacy Spoonacular recipes`);
}
```

**Route**: `GET /api/recipes/:id`

```typescript
// Returns 410 Gone for numeric IDs
if (/^\d+$/.test(recipeId)) {
  return res.status(410).json({
    error: 'Legacy recipe ID',
    message: 'This recipe was saved from our previous system...',
    isLegacy: true,
    recipeId: recipeId
  });
}
```

---

### 2. Cleanup Endpoint

**Route**: `DELETE /api/recipes/saved/cleanup-legacy`

**Authentication**: Required (JWT token)

**Action**: Removes all saved recipes with numeric IDs for the authenticated user

**Response**:
```json
{
  "message": "Legacy recipes cleaned up successfully",
  "removed": 3
}
```

**Example Usage**:
```bash
curl -X DELETE http://localhost:5000/api/recipes/saved/cleanup-legacy \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 3. Frontend UI - Saved Recipes Page

When users click "Saved Recipes", the system:

1. **Loads saved recipes** from `/api/recipes/saved/list`
2. **Detects legacy recipes** using regex `/^\d+$/`
3. **Shows warning banner** if legacy recipes found:

```
⚠️ Old Recipes Detected

You have 3 recipes from our previous system that no longer work. 
These recipes cannot be viewed and should be removed.

[Remove Old Recipes (3)]
```

4. **One-click cleanup**: Button calls `DELETE /saved/cleanup-legacy`
5. **Automatic refresh**: Reloads saved recipes list after cleanup

---

### 4. Recipe Details Modal - Legacy Error

When user clicks a legacy recipe card:

1. **API returns 410 Gone** with `isLegacy: true`
2. **Modal shows special error UI**:
   - ⚠️ Warning icon
   - "Old Recipe Format" heading
   - Explanation message
   - **[Delete Recipe]** button (removes individual recipe)
   - **[Close]** button

3. **Delete action**:
   - Calls `DELETE /api/recipes/saved/:recipeId`
   - Shows success message
   - Refreshes page to update list

---

## User Flow

### Scenario 1: User Has Legacy Recipes

1. User clicks **"Saved Recipes"** tab
2. Yellow warning banner appears at top:
   ```
   ⚠️ Old Recipes Detected
   You have 3 recipes from our previous system...
   [Remove Old Recipes (3)]
   ```
3. User clicks **"Remove Old Recipes (3)"**
4. Confirmation dialog: "Remove all old recipes from the previous system? This cannot be undone."
5. User confirms
6. Success alert: "Successfully removed 3 old recipes"
7. Page refreshes, warning banner disappears
8. Only new Edamam recipes remain

---

### Scenario 2: User Clicks Legacy Recipe

1. User clicks on a recipe card with numeric ID
2. Modal attempts to load recipe
3. Backend returns 410 Gone with legacy error
4. Modal shows:
   ```
   ⚠️ Old Recipe Format
   
   This recipe was saved from our previous system and is 
   no longer available. Please remove it from your saved 
   recipes and search for new recipes from our updated catalog.
   
   [Delete Recipe]  [Close]
   ```
5. User clicks **"Delete Recipe"**
6. Recipe removed from saved list
7. Page refreshes automatically
8. User can now save new recipes

---

## Technical Implementation

### Backend Files Modified

1. **`src/routes/recipes.ts`**:
   - Added `DELETE /saved/cleanup-legacy` endpoint
   - Updated `GET /:id` to detect and reject numeric IDs
   - Added logging for legacy recipe detection

### Frontend Files Modified

1. **`src/lib/recipeApi.ts`**:
   - Added `cleanupLegacyRecipes()` function
   - Added `hasLegacyRecipes()` helper
   - Added `countLegacyRecipes()` helper

2. **`src/components/Recipes/RecipeSuggestionsPage.tsx`**:
   - Added `handleCleanupLegacy()` handler
   - Added legacy recipe detection in `loadSavedRecipes()`
   - Added warning banner UI in saved recipes tab

3. **`src/components/Recipes/RecipeDetailsModal.tsx`**:
   - Updated error handling to detect `isLegacy` flag
   - Added special error UI for legacy recipes
   - Added inline delete button for legacy recipes

---

## Testing Checklist

### Backend Testing

- [ ] `GET /api/recipes/saved/list` logs legacy count correctly
- [ ] `GET /api/recipes/:id` returns 410 for numeric IDs (e.g., `654959`)
- [ ] `GET /api/recipes/:id` works for Edamam URIs
- [ ] `DELETE /api/recipes/saved/cleanup-legacy` removes only numeric IDs
- [ ] `DELETE /api/recipes/saved/cleanup-legacy` requires authentication
- [ ] Cleanup only affects current user's recipes

### Frontend Testing

- [ ] Warning banner appears when legacy recipes exist
- [ ] Warning banner shows correct count
- [ ] "Remove Old Recipes" button triggers cleanup
- [ ] Confirmation dialog appears before cleanup
- [ ] Success message shows correct count
- [ ] Saved recipes list refreshes after cleanup
- [ ] Warning banner disappears after cleanup
- [ ] Clicking legacy recipe shows special error modal
- [ ] "Delete Recipe" button in modal works
- [ ] Page refreshes after individual delete
- [ ] No errors when no legacy recipes exist

---

## Migration Best Practices

### For Users

1. **Visit Saved Recipes page** after API migration
2. **Click "Remove Old Recipes"** if warning appears
3. **Search for new recipes** from Edamam
4. **Save favorites** to rebuild collection

### For Developers

1. **Run cleanup endpoint** for all users (optional):
   ```javascript
   // One-time migration script
   const users = await User.find({});
   for (const user of users) {
     await SavedRecipe.deleteMany({
       userId: user._id,
       recipeId: /^\d+$/
     });
   }
   ```

2. **Monitor logs** for legacy recipe access attempts
3. **Track cleanup usage** to measure migration progress
4. **Remove cleanup code** after 90 days (optional)

---

## API Reference

### Cleanup Legacy Recipes

**Endpoint**: `DELETE /api/recipes/saved/cleanup-legacy`

**Authentication**: Required (JWT Bearer token)

**Request**: No body required

**Response**:
```json
{
  "message": "Legacy recipes cleaned up successfully",
  "removed": 3
}
```

**Error Responses**:
```json
// 401 Unauthorized
{ "error": "Authentication required" }

// 500 Internal Server Error
{ "error": "Cleanup failed", "message": "..." }
```

---

### Get Recipe Details (Legacy Detection)

**Endpoint**: `GET /api/recipes/:id`

**Legacy ID Detection**: Returns 410 for numeric IDs

**Response for Legacy ID**:
```json
{
  "error": "Legacy recipe ID",
  "message": "This recipe was saved from our previous system and is no longer available. Please delete it and save new recipes from Edamam.",
  "isLegacy": true,
  "recipeId": "654959"
}
```

**HTTP Status**: `410 Gone`

---

## Troubleshooting

### Issue: Warning banner doesn't appear

**Check**:
1. Are there actually legacy recipes in the database?
   ```javascript
   db.savedrecipes.find({ recipeId: /^\d+$/ })
   ```
2. Is the regex check working in the frontend?
3. Check browser console for errors

---

### Issue: Cleanup button doesn't work

**Check**:
1. Network tab: Is request reaching backend?
2. Backend logs: Any errors in cleanup endpoint?
3. Authentication: Is JWT token valid?
4. Database: Are recipes actually being deleted?

---

### Issue: Modal still shows "Failed to get recipe details"

**Check**:
1. Is backend returning `isLegacy: true` in error response?
2. Is frontend checking for `err.isLegacy` in catch block?
3. Is error state being set to `'legacy'` string?
4. Check `RecipeDetailsModal.tsx` error handling logic

---

## Future Enhancements

### Optional Improvements

1. **Automatic cleanup on login**:
   - Run cleanup automatically for users on first login after migration
   - Show one-time notification of cleanup

2. **Batch migration script**:
   - Admin endpoint to cleanup all users at once
   - Progress tracking and reporting

3. **Recipe re-matching**:
   - Attempt to find equivalent recipes in Edamam
   - Suggest replacements for deleted recipes

4. **Analytics**:
   - Track how many users have legacy recipes
   - Monitor cleanup adoption rate
   - Alert if cleanup rate is low

---

## Summary

✅ **Backend**: Detects numeric IDs, returns 410 Gone, provides cleanup endpoint  
✅ **Frontend**: Shows warning banner, one-click cleanup, special error modal  
✅ **User Experience**: Clear messaging, easy cleanup, no data loss for new recipes  
✅ **Testing**: Comprehensive checklist for both backend and frontend  

Users can now easily identify and remove incompatible recipes from the old Spoonacular system and start fresh with Edamam recipes.

