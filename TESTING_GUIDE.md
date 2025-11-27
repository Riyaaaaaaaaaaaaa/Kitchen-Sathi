# Testing Guide - My Recipes Phase 2 Features 🧪

## Quick Test Checklist

### 1. ✅ Add to Grocery List Feature

**Test Case 1: Add New Ingredients**
1. Navigate to "My Recipes"
2. Open any recipe with ingredients
3. Click "Add to Grocery List" button
4. Expected: Toast shows "Added X ingredients to grocery list!"
5. Navigate to Grocery List page
6. Verify ingredients appear with status "pending"

**Test Case 2: Skip Duplicate Ingredients**
1. Manually add "Potato" to grocery list (status: pending)
2. Open a recipe containing "Potato"
3. Click "Add to Grocery List"
4. Expected: Toast shows "Skipped 1 ingredient already in list"
5. Verify no duplicate "Potato" entries in grocery list

**Test Case 3: Re-add Used Ingredients**
1. Add "Tomato" to grocery list
2. Mark "Tomato" as "used" in grocery list
3. Open a recipe containing "Tomato"
4. Click "Add to Grocery List"
5. Expected: "Tomato" is added again (not skipped)
6. Verify two "Tomato" entries exist (one used, one pending)

**Test Case 4: Fractional Quantities**
1. Create recipe with ingredient: "Cocoa powder", quantity: "0.75", unit: "cup"
2. Add to grocery list
3. Expected: No validation errors
4. Verify quantity 0.75 appears in grocery list

---

### 2. 🖨️ Print Recipe Feature

**Test Case 1: Print from Details Page**
1. Navigate to "My Recipes"
2. Open any recipe
3. Click "Print Recipe" button
4. Expected: Browser print dialog opens
5. Verify preview shows:
   - ✓ Recipe name, description
   - ✓ Ingredients and instructions
   - ✗ NO navigation, buttons, or UI elements
   - ✓ Clean, paper-friendly layout

**Test Case 2: Print from Meal Planner Modal**
1. Navigate to "Meal Planner"
2. Add a user recipe to a meal
3. Click on the meal to open modal
4. Click "Print Recipe" button
5. Expected: Same clean print layout as above

---

### 3. ⭐ Recipe Rating System

**Test Case 1: Rate a Recipe**
1. Navigate to "My Recipes" → Open any recipe
2. Scroll to "Your Rating" section
3. Hover over stars (should highlight on hover)
4. Click on 4th star
5. Expected: Toast shows "Rated 4 stars"
6. Verify 4 stars are filled (yellow)
7. Label shows "4/5"

**Test Case 2: Change Rating**
1. With recipe rated 4 stars (from above)
2. Click on 2nd star
3. Expected: Toast shows "Rated 2 stars"
4. Verify only 2 stars are filled
5. Label shows "2/5"

**Test Case 3: Remove Rating**
1. With recipe rated 2 stars (from above)
2. Click on 2nd star again (same star)
3. Expected: Toast shows "Rating removed"
4. Verify all stars are empty (gray)
5. Label shows "Not rated"

**Test Case 4: Rating Persists Across Views**
1. Rate a recipe 5 stars
2. Navigate back to "My Recipes" list
3. Verify recipe card shows 5 stars (small, read-only)
4. Open recipe in meal planner modal
5. Verify modal shows 5 stars (medium, interactive)

---

### 4. 📸 Image Upload Feature

**Test Case 1: Upload Image During Create**
1. Navigate to "My Recipes" → "Add Recipe"
2. Fill in recipe name, ingredients, instructions
3. In "Recipe Image" section, click "Choose File"
4. Select a valid image (PNG/JPG, < 10MB)
5. Expected: Image preview appears with "New Image Selected" badge
6. Click "Create Recipe"
7. Expected: Recipe created, but image NOT uploaded yet
8. Note: Image upload requires recipe ID (edit mode)

**Test Case 2: Upload Image in Edit Mode**
1. Navigate to "My Recipes"
2. Create a recipe (without image)
3. Edit the recipe
4. In "Recipe Image" section, click "Choose File"
5. Select an image
6. Expected: Preview appears
7. Click "Upload Image Now" button
8. Expected:
   - Loading spinner shows "Uploading image..."
   - Toast shows "Image uploaded successfully"
   - Image appears in edit form

**Test Case 3: View Image in All Views**
1. With recipe containing an image (from above)
2. Navigate to "My Recipes" list
3. Expected: Recipe card shows image thumbnail (hover zoom effect)
4. Click "View" to open recipe details
5. Expected: Large hero image at top
6. Add recipe to meal plan, open modal
7. Expected: Image displayed prominently in modal

**Test Case 4: Replace Existing Image**
1. Edit a recipe with an existing image
2. Click "Choose File" → Select different image
3. Click "Upload Image Now"
4. Expected:
   - Old image replaced with new one
   - Toast shows "Image uploaded successfully"
   - Preview updates immediately

**Test Case 5: Image Validation - Oversized File**
1. Edit a recipe
2. Try to upload image > 10MB
3. Expected: Error toast "Image size must be less than 10MB"
4. Image NOT uploaded, no preview

**Test Case 6: Image Validation - Wrong File Type**
1. Edit a recipe
2. Try to upload a PDF or video file
3. Expected: Error toast "File must be an image"
4. File NOT uploaded, no preview

---

## Integration Tests

### Test 1: Complete Recipe Creation Flow
1. Create recipe with:
   - Name: "Chocolate Chip Cookies"
   - Description: "Classic homemade cookies"
   - Cuisine: "American"
   - Diet Labels: "vegetarian"
   - Cooking Time: 30 minutes
   - Servings: 12
   - Meal Type: "dessert"
   - Ingredients:
     - Flour, 2, cups
     - Sugar, 1, cup
     - Butter, 0.5, cup
     - Chocolate chips, 1.5, cups
   - Instructions:
     - "Mix dry ingredients"
     - "Cream butter and sugar"
     - "Combine and bake at 350°F for 12 minutes"
2. Save recipe
3. Edit recipe → Upload image
4. Rate recipe 5 stars
5. Add ingredients to grocery list
6. Print recipe
7. Verify all features work seamlessly

### Test 2: Meal Planner Integration
1. Create a user recipe
2. Navigate to "Meal Planner"
3. Click "Add Meal" on any day
4. Switch to "📝 My Recipes" tab
5. Select the recipe
6. Add to meal plan
7. Click on meal to open modal
8. Verify:
   - Image displays
   - Rating shows and is interactive
   - "Add to Grocery List" button works
   - "Print Recipe" button works

### Test 3: Grocery List Integration
1. Create recipe with 5 ingredients
2. Add 3 of those ingredients manually to grocery list (pending)
3. Mark 1 of those 3 as "used"
4. Open recipe → "Add to Grocery List"
5. Expected:
   - 2 ingredients skipped (pending)
   - 1 ingredient re-added (was used)
   - 2 new ingredients added
6. Total: Toast shows "Added 3 ingredients, Skipped 2 ingredients"

---

## Edge Cases

### Edge Case 1: Recipe with No Ingredients
1. Try to add recipe to grocery list when recipe has no ingredients
2. Expected: Error toast "No ingredients to add"

### Edge Case 2: Empty Rating
1. View recipe that has never been rated
2. Expected: Stars are all gray, label shows "Not rated"

### Edge Case 3: Recipe with No Image
1. View recipe without an image
2. Expected:
   - No image section appears in details view
   - Recipe card shows no image (just text content)
   - Modal shows no image section

### Edge Case 4: Print Recipe with Long Instructions
1. Create recipe with 10+ instruction steps
2. Print recipe
3. Expected: Page breaks appropriately, no cut-off text

---

## Performance Tests

### Test 1: Image Upload Speed
1. Upload 5MB image
2. Expected: Upload completes within 5-10 seconds (depends on connection)

### Test 2: Large Recipe List
1. Create 20+ recipes with images
2. Navigate to "My Recipes" list
3. Expected: Page loads smoothly, no lag when scrolling

### Test 3: Rating Response Time
1. Click on star to rate
2. Expected: Immediate visual feedback, toast within 500ms

---

## Browser Compatibility

Test all features in:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (Chrome, Safari)

---

## Setup Required

### For Image Upload:
Cloudinary credentials in `backend/.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Backend Running:
```bash
cd backend
npx tsx src/index.ts
```

### Frontend Running:
```bash
cd frontend
npm run dev
```

---

## Known Issues / Limitations

1. **Image Upload**: Requires recipe to be saved first (Edit mode only)
   - Workaround: Save recipe, then edit to add image

2. **Print Layout**: May vary slightly between browsers
   - Best results: Chrome/Edge with A4 paper size

3. **Cloudinary Free Tier**: 25GB storage, 25k transformations/month
   - Solution: Upgrade plan if limits exceeded

---

## Troubleshooting

### Issue: Image not uploading
**Solution**: Check Cloudinary credentials in `.env`

### Issue: Duplicate ingredients in grocery list
**Solution**: Verify ingredient names match exactly (case-insensitive)

### Issue: Rating not saving
**Solution**: Check network tab, ensure backend is running

### Issue: Print layout broken
**Solution**: Clear browser cache, reload page

---

## Success Criteria

All tests pass when:
- ✅ No console errors
- ✅ Toast notifications appear correctly
- ✅ Data persists after page refresh
- ✅ Images load properly
- ✅ Print layout is clean
- ✅ Backend logs show no errors

---

**Happy Testing! 🧪**

