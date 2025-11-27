# 💰 Estimated Savings Calculation - Explained

## 📊 Overview

The **Estimated Savings** metric in your KitchenSathi Analytics Dashboard shows how much money you've saved by using grocery items before they expired, instead of wasting them.

---

## 🧮 Current Formula

### Backend Calculation
**Location**: `backend/src/routes/analytics.ts` (Line 109-111)

```typescript
// Calculate estimated savings (₹50 per item average)
const avgItemCost = 50;
const estimatedSavings = Math.round(usedCount * avgItemCost);
```

### Simple Explanation

```
Estimated Savings = Number of Items Used × ₹50
```

**Example**:
- If you've marked **10 items** as "Used/Consumed"
- Estimated Savings = 10 × ₹50 = **₹500**

---

## 🎯 What Does "Used" Mean?

An item is counted as "Used" when:
1. You bought the grocery item (status: `completed`)
2. You consumed/used it (status: `used`)
3. **Importantly**: You used it **before it expired** ✅

This means you successfully prevented food waste!

---

## 💡 Why ₹50 Per Item?

The current formula uses **₹50** as the average cost per grocery item. This is a **simplified estimate** based on:

### Typical Grocery Costs in India:
- **Vegetables**: ₹20-80 per kg (potato, tomato, onion)
- **Fruits**: ₹40-150 per kg (apple, banana, orange)
- **Dairy**: ₹25-60 per unit (milk, curd, paneer)
- **Grains/Pulses**: ₹60-150 per kg (rice, dal, flour)
- **Packaged Goods**: ₹30-200 per unit (bread, snacks, sauces)

**Average across all categories** ≈ **₹50 per item**

---

## 🔧 How to Make It More Accurate

### Option 1: Track Actual Item Prices (Recommended)

**Update the GroceryItem Model** to include a `price` field:

```typescript
// backend/src/models/GroceryItem.ts
export interface GroceryItemDocument extends Document {
  name: string;
  quantity: number;
  unit: string;
  price?: number; // ✅ Add this field
  status: GroceryItemStatus;
  // ... other fields
}
```

**Update the Analytics Calculation**:

```typescript
// backend/src/routes/analytics.ts
router.get('/summary', requireAuth, async (req: AuthRequest, res) => {
  // ... existing code ...

  // Calculate actual savings based on item prices
  const usedItems = await GroceryItem.find({
    userId: new mongoose.Types.ObjectId(userId),
    status: 'used'
  });

  const estimatedSavings = usedItems.reduce((total, item) => {
    const itemPrice = item.price || 50; // Use actual price or fallback to ₹50
    return total + itemPrice;
  }, 0);

  // ... rest of response
});
```

**Frontend Update** - Add price input when adding grocery items:

```tsx
// In GroceryList component
<input
  type="number"
  placeholder="Price (₹)"
  value={price}
  onChange={(e) => setPrice(Number(e.target.value))}
  className="..."
/>
```

---

### Option 2: Category-Based Pricing

Assign different average prices based on item category:

```typescript
// backend/src/routes/analytics.ts
const getCategoryPrice = (itemName: string): number => {
  const name = itemName.toLowerCase();
  
  // Vegetables
  if (['potato', 'tomato', 'onion', 'carrot', 'cabbage'].some(v => name.includes(v))) {
    return 40;
  }
  
  // Fruits
  if (['apple', 'banana', 'orange', 'mango', 'grapes'].some(f => name.includes(f))) {
    return 80;
  }
  
  // Dairy
  if (['milk', 'curd', 'paneer', 'cheese', 'butter'].some(d => name.includes(d))) {
    return 60;
  }
  
  // Grains/Pulses
  if (['rice', 'dal', 'wheat', 'flour', 'atta'].some(g => name.includes(g))) {
    return 100;
  }
  
  // Default
  return 50;
};

// Use in calculation
const usedItems = await GroceryItem.find({
  userId: new mongoose.Types.ObjectId(userId),
  status: 'used'
});

const estimatedSavings = usedItems.reduce((total, item) => {
  return total + getCategoryPrice(item.name);
}, 0);
```

---

### Option 3: Quantity-Weighted Pricing

Consider the quantity of each item:

```typescript
// backend/src/routes/analytics.ts
const estimatedSavings = usedItems.reduce((total, item) => {
  const pricePerUnit = item.price || 50;
  const quantity = item.quantity || 1;
  return total + (pricePerUnit * quantity);
}, 0);
```

**Example**:
- 2 kg potatoes @ ₹40/kg = ₹80 saved
- 1 liter milk @ ₹60/liter = ₹60 saved
- **Total** = ₹140 saved

---

## 📈 Advanced: Regional Price Adjustment

Adjust prices based on user location:

```typescript
// backend/src/routes/analytics.ts
const getRegionalMultiplier = (userCity: string): number => {
  const city = userCity.toLowerCase();
  
  // Tier 1 cities (higher prices)
  if (['mumbai', 'delhi', 'bangalore', 'chennai'].includes(city)) {
    return 1.3; // 30% higher
  }
  
  // Tier 2 cities (moderate prices)
  if (['pune', 'jaipur', 'lucknow', 'indore'].includes(city)) {
    return 1.1; // 10% higher
  }
  
  // Tier 3+ cities (lower prices)
  return 0.9; // 10% lower
};

// Apply regional adjustment
const basePrice = 50;
const regionalPrice = basePrice * getRegionalMultiplier(user.city);
const estimatedSavings = usedCount * regionalPrice;
```

---

## 🎯 What the Savings Metric Tells You

### Current Interpretation

**₹500 Estimated Savings** means:
- You successfully used **10 grocery items** before they expired
- If you had let them expire/waste, you would have lost **₹500**
- By using them, you **saved ₹500** from going to waste! 🎉

### Waste Prevention Rate

The analytics also show a **Waste Prevention Rate**:

```typescript
const wastePreventionRate = totalProcessed > 0 
  ? Math.round((usedCount / totalProcessed) * 100) 
  : 0;
```

**Example**:
- **Used**: 8 items
- **Completed (Bought)**: 2 items
- **Total Processed**: 10 items
- **Waste Prevention Rate**: (8 / 10) × 100 = **80%**

This means you successfully used **80% of your groceries** before expiry! 🎯

---

## 📊 How It Appears in the UI

### Analytics Dashboard

```
┌─────────────────────────────────┐
│ 💰 Estimated Savings            │
│                                 │
│ ₹500                            │
│ Saved                           │
└─────────────────────────────────┘
```

### Calculation Breakdown (Future Enhancement)

You could add a tooltip or expandable section showing:

```
💰 Estimated Savings Breakdown

Used Items: 10
Average Price per Item: ₹50
Total Savings: ₹500

Top Saved Items:
1. Milk (2 liters) - ₹120
2. Potatoes (3 kg) - ₹90
3. Tomatoes (2 kg) - ₹80
...
```

---

## 🚀 Recommended Implementation Path

### Phase 1: Current (Simple) ✅
- Fixed ₹50 per item
- Quick to implement
- Good for MVP

### Phase 2: Add Price Field (Recommended Next)
1. Add `price` field to `GroceryItem` model
2. Update frontend to accept price input (optional)
3. Calculate savings based on actual prices
4. Fallback to ₹50 if price not provided

### Phase 3: Advanced Features
- Category-based pricing
- Regional price adjustments
- Quantity-weighted calculations
- Historical price trends
- "Money saved this month" metric

---

## 🧪 Testing the Calculation

### Manual Test

1. **Add 5 grocery items** to your list
2. **Mark them as "Bought"** (status: `completed`)
3. **Mark them as "Used"** (status: `used`)
4. **Check Analytics Dashboard**
   - Should show: **₹250** (5 × ₹50)

### With Custom Prices (After Phase 2)

1. Add potato (₹40), milk (₹60), rice (₹120)
2. Mark all as used
3. Should show: **₹220** (actual sum)

---

## 💡 Key Takeaways

### Current Formula
```
Estimated Savings = (Number of Used Items) × ₹50
```

### Why It's Useful
- **Motivates users** to use groceries before expiry
- **Quantifies the impact** of waste prevention
- **Gamifies** good kitchen management

### How to Improve
- Add actual price tracking per item
- Use category-based pricing
- Consider quantity in calculations
- Add regional price adjustments

---

## 📝 Summary

The **Estimated Savings** metric is a **motivational tool** that shows users the **financial benefit** of using groceries before they expire. 

**Current**: Simple calculation using ₹50 average per item  
**Future**: Track actual prices for more accurate savings  
**Goal**: Encourage users to reduce food waste and save money! 💚💰

---

**Questions or want to implement Phase 2?** Let me know! 🚀

