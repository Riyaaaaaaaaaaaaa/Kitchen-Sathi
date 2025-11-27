# 📅 Weekly Meal Planner - Complete Guide

## 🎉 Feature Overview

The Weekly Meal Planner is a beautiful, interactive calendar that helps you plan your meals for the entire week. It's now fully integrated into KitchenSathi!

---

## ✨ What You Can Do

### 1. **Visual Weekly Calendar**
- See all 7 days of the week at a glance
- Desktop: Grid view with meals organized by type
- Mobile: Card view with expandable days
- Navigate between weeks with arrow buttons
- Quick "Today" button to jump to current week

### 2. **Plan All Meal Types**
- 🌅 **Breakfast** - Start your day right
- 🌞 **Lunch** - Midday fuel
- 🌙 **Dinner** - Evening meals
- 🍿 **Snacks** - Anytime treats

### 3. **Add Meals Two Ways**

**Option A: From Saved Recipes**
- Choose from your saved recipe collection
- One-click add to any meal slot
- Automatically includes servings and image

**Option B: Custom Meals**
- Add meals without a recipe
- Perfect for leftovers, eating out, or simple meals
- Add title, servings, and notes

### 4. **Manage Your Plan**
- Remove meals with one click
- See meal images and details
- Add notes to any meal
- Rearrange by removing and re-adding

---

## 🚀 How to Use

### Access the Meal Planner

1. **From Dashboard:**
   - Click **"📅 Weekly Meal Planner"** card

2. **Direct URL:**
   - Navigate to `/meal-planner`

### Navigate the Calendar

**Desktop View:**
- Grid layout with days as columns
- Meal types as rows
- Click any empty cell to add a meal
- Hover over meals to see remove button

**Mobile View:**
- Day cards stacked vertically
- Each day shows all meal types
- Tap "+" button to add meals
- Today's date is highlighted

### Add a Meal

1. **Click** an empty meal slot or "+" button
2. **Choose** between:
   - **Saved Recipes** tab: Select from your favorites
   - **Custom Meal** tab: Enter meal details manually
3. **Click** the meal/recipe to add it
4. **Done!** The meal appears in your calendar

### Remove a Meal

- **Desktop:** Hover over meal → Click X button
- **Mobile:** Tap X button on meal card
- Confirm removal

### Navigate Weeks

- **Previous Week:** Click left arrow ←
- **Next Week:** Click right arrow →
- **This Week:** Click "Today" button

---

## 🎨 Features & UI Elements

### Visual Highlights

✅ **Today Indicator**
- Orange highlight on current day
- "Today" badge on mobile
- Easy to spot at a glance

✅ **Color-Coded Meal Types**
- Yellow: Breakfast
- Orange: Lunch
- Purple: Dinner
- Green: Snacks

✅ **Meal Cards**
- Recipe image
- Meal title
- Servings count
- Optional notes
- Remove button

✅ **Empty States**
- Friendly "+" button
- Click to add meal
- Hover effects

### Responsive Design

**Desktop (lg+):**
- Full grid calendar view
- 8 columns (meal type + 7 days)
- Compact meal cards
- Hover interactions

**Mobile/Tablet:**
- Stacked day cards
- Full meal details
- Touch-friendly buttons
- Scrollable content

---

## 💡 Pro Tips

### Planning Strategy

1. **Start with Dinner** - Usually the main meal
2. **Plan Breakfasts** - Batch similar meals
3. **Add Lunches** - Use leftovers
4. **Include Snacks** - Healthy options

### Save Time

- **Batch Cook:** Plan similar meals together
- **Leftovers:** Add custom meal "Leftover Dinner"
- **Theme Nights:** Taco Tuesday, Pizza Friday
- **Prep Ahead:** Plan Sunday meal prep

### Integration

- **Browse Recipes** → Save favorites → Add to plan
- **Check Groceries** → Plan meals with what you have
- **Add to Plan** → Generate shopping list (coming soon!)

---

## 🔄 Workflow Examples

### Example 1: Plan from Recipes

1. Go to **Recipe Suggestions**
2. Find a recipe you like
3. Click **"Save Recipe"**
4. Go to **Weekly Meal Planner**
5. Click meal slot
6. Select from **Saved Recipes**
7. Recipe added to plan!

### Example 2: Quick Custom Meal

1. Open **Weekly Meal Planner**
2. Click meal slot for tomorrow's lunch
3. Switch to **Custom Meal** tab
4. Enter "Sandwich and Salad"
5. Set servings: 2
6. Add note: "Use leftover chicken"
7. Click **Add Custom Meal**
8. Done!

### Example 3: Weekly Planning Session

1. Click **"Today"** to start current week
2. Review what you have in groceries
3. Add saved recipes for main meals
4. Fill in breakfasts (similar across days)
5. Add custom meals for lunches
6. Include snacks for kids
7. Navigate to next week
8. Repeat!

---

## 📱 Mobile Experience

### Optimized for Touch

- Large tap targets
- Swipe-friendly scrolling
- Full-screen modals
- Easy meal removal

### Mobile-Specific Features

- Day cards with all meals visible
- Expandable meal details
- Sticky headers
- Bottom action buttons

---

## 🎯 Quick Actions Panel

At the bottom of the planner:

1. **🍳 Browse Recipes**
   - Find new meal ideas
   - Save to add to plan

2. **🛒 Grocery List**
   - Check what you have
   - Plan meals accordingly

3. **🔄 Refresh**
   - Reload meal plans
   - Sync latest changes

---

## 🔧 Technical Features

### Performance

- Fast loading with optimized queries
- Efficient week-by-week loading
- Cached saved recipes
- Smooth animations

### Data Management

- Auto-saves all changes
- Persists to MongoDB
- User-specific plans
- Date-based organization

### Error Handling

- Friendly error messages
- Retry options
- Validation feedback
- Loading states

---

## 📊 What's Stored

For each meal plan entry:

```javascript
{
  recipeId: number,      // 0 for custom meals
  title: string,         // Meal name
  image: string,         // Recipe image URL
  servings: number,      // Number of servings
  mealType: string,      // breakfast/lunch/dinner/snack
  notes: string          // Optional notes
}
```

Organized by:
- User ID (your meals only)
- Date (YYYY-MM-DD format)
- Created/Updated timestamps

---

## 🎨 UI Components

### WeeklyMealPlanner
- Main calendar container
- Week navigation
- Grid/card layout switching
- Quick actions panel

### MealCard
- Displays meal information
- Compact and full views
- Remove functionality
- Image handling

### AddMealModal
- Saved recipes browser
- Custom meal form
- Tabbed interface
- Success/error handling

---

## 🚀 Future Enhancements (Optional)

The meal planner is complete and functional! Optional additions:

1. **Drag & Drop** - Move meals between slots
2. **Copy Week** - Duplicate entire week's plan
3. **Shopping List Generation** - Auto-create from plan
4. **Meal Templates** - Save common weekly patterns
5. **Nutrition Summary** - Weekly nutrition totals
6. **Print View** - Print weekly plan
7. **Share Plans** - Share with family
8. **Recurring Meals** - Auto-add weekly favorites

---

## ✅ Testing Checklist

Before using in production:

- [ ] Load meal planner page
- [ ] Navigate between weeks
- [ ] Add meal from saved recipes
- [ ] Add custom meal
- [ ] Remove meal
- [ ] Check mobile responsiveness
- [ ] Verify today highlighting
- [ ] Test empty states
- [ ] Check error handling
- [ ] Confirm data persistence

---

## 🎉 You're All Set!

Your Weekly Meal Planner is ready to use! Start planning your meals and enjoy:

✅ Visual weekly overview
✅ Easy meal management
✅ Saved recipe integration
✅ Custom meal support
✅ Beautiful responsive design
✅ Smooth user experience

**Happy meal planning!** 🍽️✨

---

## 📚 Related Documentation

- `QUICK_START_AI_RECIPES.md` - Recipe feature guide
- `AI_MEAL_PLANNING_COMPLETE.md` - Full feature overview
- `AI_MEAL_PLANNING_SETUP.md` - Setup instructions

**Access the Meal Planner:**
1. Login to KitchenSathi
2. Click **"📅 Weekly Meal Planner"** on dashboard
3. Start planning your week!

