# 🔍 **Frontend Expiry Feature Audit & Fix**

## 🎯 **Current Status Analysis**

### **✅ Correctly Implemented:**
1. **`updateItemExpiry()`** - Uses PATCH `/api/groceries/:id/expiry` ✅
2. **`getGroceryList()`** - Uses GET `/api/groceries` (returns all items including expiry) ✅
3. **`getExpiringItems()`** - Uses GET `/api/groceries/expiring` ✅
4. **`getExpiredItems()`** - Uses GET `/api/groceries/expired` ✅
5. **`getExpiryStats()`** - Uses GET `/api/groceries/expiry/stats` ✅

### **❌ No Issues Found:**
- No incorrect GET calls to `/api/groceries/:id/expiry`
- All expiry-related functions use correct HTTP methods
- Frontend properly uses PATCH for updating expiry settings

## 🔧 **Recommended Improvements**

### **1. Enhanced API Functions**

```typescript
// lib/api.ts - Enhanced expiry functions

// ✅ CORRECT: Update expiry settings (PATCH)
export async function updateItemExpiry(id: string, updates: {
  expiryDate?: string;
  notificationPreferences?: GroceryItem['notificationPreferences'];
}): Promise<GroceryItem> {
  const updatedItem = await request<GroceryItem>(`/api/groceries/${id}/expiry`, { 
    method: 'PATCH', 
    body: JSON.stringify(updates) 
  });
  return { ...updatedItem, id: updatedItem._id };
}

// ✅ CORRECT: Get expiring items (GET)
export async function getExpiringItems(days: number = 7): Promise<GroceryItem[]> {
  const items = await request<GroceryItem[]>(`/api/groceries/expiring?days=${days}`);
  return items.map(item => ({ ...item, id: item._id }));
}

// ✅ CORRECT: Get expired items (GET)
export async function getExpiredItems(): Promise<GroceryItem[]> {
  const items = await request<GroceryItem[]>('/api/groceries/expired');
  return items.map(item => ({ ...item, id: item._id }));
}

// ✅ CORRECT: Get expiry statistics (GET)
export async function getExpiryStats(): Promise<{
  totalExpiringItems: number;
  byDate: Array<{
    _id: string;
    count: number;
    items: string[];
  }>;
  nextCheck: string;
}> {
  return request('/api/groceries/expiry/stats');
}

// ✅ CORRECT: Get all grocery items including expiry (GET)
export async function getGroceryList(): Promise<GroceryItem[]> {
  const items = await request<GroceryItem[]>('/api/groceries');
  return items.map(item => ({ ...item, id: item._id }));
}
```

### **2. Proper Expiry Settings Modal Implementation**

```typescript
// components/ExpirySettings.tsx - Correct implementation

export function ExpirySettings({ item, onUpdate, onClose }: ExpirySettingsProps) {
  const [expiryDate, setExpiryDate] = useState(
    item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : ''
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    item.notificationPreferences?.enabled ?? true
  );
  const [emailNotifications, setEmailNotifications] = useState(
    item.notificationPreferences?.emailNotifications ?? true
  );
  const [inAppNotifications, setInAppNotifications] = useState(
    item.notificationPreferences?.inAppNotifications ?? true
  );
  const [daysBeforeExpiry, setDaysBeforeExpiry] = useState(
    item.notificationPreferences?.daysBeforeExpiry?.join(', ') ?? '1, 3, 7'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setFieldErrors({});

      const parsedDays = daysBeforeExpiry
        .split(',')
        .map(d => parseInt(d.trim()))
        .filter(d => !isNaN(d) && d >= 0 && d <= 30);

      // ✅ CORRECT: Use PATCH to update expiry settings
      const updatedItem = await updateItemExpiry(item.id || item._id, {
        expiryDate: expiryDate || undefined,
        notificationPreferences: {
          enabled: notificationsEnabled,
          daysBeforeExpiry: parsedDays.length > 0 ? parsedDays : [1, 3, 7],
          emailNotifications,
          inAppNotifications,
        },
      });

      onUpdate(updatedItem);
      onClose();
    } catch (err) {
      console.error('ExpirySettings error:', err);
      
      // Enhanced error handling
      const isDevelopment = process.env.NODE_ENV === 'development';
      const processed = isDevelopment ? processApiErrorDebug(err) : processApiError(err);
      
      setError(processed.message);
      setFieldErrors(processed.fieldErrors);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
}
```

### **3. Backend Route Recommendations**

If you want to fetch expiry settings for a specific item, add this route:

```typescript
// backend/src/routes/groceries.ts - Add this route

// GET /api/groceries/:id - Get specific grocery item (includes expiry data)
router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    console.log(`[groceries] 📋 GET /${req.params.id} - User: ${req.user!.id}`);
    
    const item = await GroceryItem.findOne({ 
      _id: req.params.id, 
      userId: req.user!.id 
    });
    
    if (!item) {
      return res.status(404).json({ error: 'Grocery item not found' });
    }
    
    console.log(`[groceries] ✅ Found item: ${item.name}`);
    res.json(item);
  } catch (error) {
    console.error('[groceries] ❌ GET /:id error:', error);
    res.status(500).json({ error: 'Failed to fetch grocery item' });
  }
});
```

### **4. Frontend Function for Getting Single Item**

```typescript
// lib/api.ts - Add this function

export async function getGroceryItem(id: string): Promise<GroceryItem> {
  const item = await request<GroceryItem>(`/api/groceries/${id}`);
  return { ...item, id: item._id };
}
```

## 📋 **HTTP Method Summary**

### **✅ Correct Usage:**

| Function | Method | Endpoint | Purpose |
|----------|--------|----------|---------|
| `getGroceryList()` | GET | `/api/groceries` | Get all items (includes expiry) |
| `getGroceryItem(id)` | GET | `/api/groceries/:id` | Get specific item (includes expiry) |
| `updateItemExpiry(id, data)` | PATCH | `/api/groceries/:id/expiry` | Update expiry settings |
| `getExpiringItems(days)` | GET | `/api/groceries/expiring` | Get expiring items |
| `getExpiredItems()` | GET | `/api/groceries/expired` | Get expired items |
| `getExpiryStats()` | GET | `/api/groceries/expiry/stats` | Get expiry statistics |

### **❌ Never Use:**

| ❌ Wrong | ✅ Correct | Reason |
|----------|------------|---------|
| `GET /api/groceries/:id/expiry` | `PATCH /api/groceries/:id/expiry` | No GET endpoint for expiry |
| `GET /api/groceries/:id/expiry` | `GET /api/groceries/:id` | Use general item endpoint |

## 🧪 **Testing Checklist**

### **1. Expiry Settings Modal**
- ✅ Opens with current expiry data
- ✅ Saves using PATCH `/api/groceries/:id/expiry`
- ✅ Shows field-specific errors
- ✅ Updates item in parent component

### **2. Expiry Lists**
- ✅ `getExpiringItems()` uses GET `/api/groceries/expiring`
- ✅ `getExpiredItems()` uses GET `/api/groceries/expired`
- ✅ `getExpiryStats()` uses GET `/api/groceries/expiry/stats`

### **3. General Grocery List**
- ✅ `getGroceryList()` uses GET `/api/groceries`
- ✅ Returns all items including expiry data
- ✅ No individual GET calls for expiry

## 🚀 **Implementation Guide**

### **1. Current Implementation is Correct**
Your current frontend implementation is already using the correct HTTP methods. No changes needed.

### **2. Optional Enhancement**
If you want to fetch individual items with expiry data, add the backend route and frontend function shown above.

### **3. Best Practices**
- Always use PATCH for updating expiry settings
- Use GET for listing expiry-related data
- Never try to GET individual expiry endpoints
- Use the general grocery endpoints for full item data

Your frontend expiry feature is already correctly implemented! 🎉
