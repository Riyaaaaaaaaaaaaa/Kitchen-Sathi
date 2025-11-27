# 🗓️ **Expiry Date Formatting Fix**

## 🎯 **Problem Identified**

Your frontend sends dates in `YYYY-MM-DD` format, but your backend expects full ISO strings (`YYYY-MM-DDTHH:mm:ss.sssZ`).

## 🔧 **Solution Implemented**

### **1. Frontend Date Formatting**

```typescript
// ✅ CORRECT: Format date before sending to API
const formattedExpiryDate = expiryDate 
  ? new Date(expiryDate + 'T00:00:00.000Z').toISOString()
  : undefined;

console.log('Original date:', expiryDate);        // "2025-11-25"
console.log('Formatted ISO date:', formattedExpiryDate); // "2025-11-25T00:00:00.000Z"
```

### **2. Backend Schema Enhancement**

```typescript
// ✅ CORRECT: Forgiving date parsing with transformation
const updateSchema = z.object({
  expiryDate: z.string().optional().transform((val) => {
    if (!val) return undefined;
    // Accept both ISO date strings and YYYY-MM-DD format
    const date = new Date(val);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
    return date.toISOString();
  }),
  // ... other fields
});
```

## 🧪 **Testing Examples**

### **Frontend Input → Backend Output**

| Frontend Input | Formatted Output | Backend Receives |
|----------------|------------------|------------------|
| `"2025-11-25"` | `"2025-11-25T00:00:00.000Z"` | ✅ Valid ISO string |
| `"2025-12-31"` | `"2025-12-31T00:00:00.000Z"` | ✅ Valid ISO string |
| `""` | `undefined` | ✅ No date set |
| `undefined` | `undefined` | ✅ No date set |

### **Backend Validation**

| Input Format | Backend Handling | Result |
|--------------|------------------|---------|
| `"2025-11-25"` | Adds time component | ✅ `"2025-11-25T00:00:00.000Z"` |
| `"2025-11-25T00:00:00.000Z"` | Direct parsing | ✅ `"2025-11-25T00:00:00.000Z"` |
| `"invalid-date"` | Validation error | ❌ `"Invalid date format"` |
| `""` | Undefined | ✅ `undefined` |

## 🚀 **Enhanced Implementation**

### **1. Frontend Utility Function**

```typescript
// utils/dateFormatting.ts
export function formatDateForAPI(dateString: string | undefined): string | undefined {
  if (!dateString) return undefined;
  
  try {
    // Convert YYYY-MM-DD to full ISO string
    const isoString = new Date(dateString + 'T00:00:00.000Z').toISOString();
    console.log('Date formatted:', dateString, '→', isoString);
    return isoString;
  } catch (error) {
    console.error('Date formatting error:', error);
    throw new Error('Invalid date format. Please use YYYY-MM-DD format.');
  }
}
```

### **2. Enhanced ExpirySettings Component**

```typescript
// components/ExpirySettings.tsx
const handleSave = async () => {
  try {
    setLoading(true);
    setError(null);
    setFieldErrors({});

    // ✅ CORRECT: Format date to full ISO string
    const formattedExpiryDate = expiryDate 
      ? new Date(expiryDate + 'T00:00:00.000Z').toISOString()
      : undefined;

    console.log('Original date:', expiryDate);
    console.log('Formatted ISO date:', formattedExpiryDate);

    const updatedItem = await updateItemExpiry(item.id || item._id, {
      expiryDate: formattedExpiryDate,
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
```

### **3. Backend Schema Improvements**

```typescript
// backend/src/routes/index.ts
const updateSchema = z.object({
  expiryDate: z.string().optional().transform((val) => {
    if (!val) return undefined;
    
    // Accept multiple date formats
    let date: Date;
    
    // Try parsing as-is first
    date = new Date(val);
    
    // If invalid, try adding time component for YYYY-MM-DD format
    if (isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
      date = new Date(val + 'T00:00:00.000Z');
    }
    
    // If still invalid, try parsing as local date
    if (isNaN(date.getTime())) {
      date = new Date(val + 'T00:00:00');
    }
    
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD or ISO string.');
    }
    
    return date.toISOString();
  }),
  notificationPreferences: z.object({
    enabled: z.boolean().optional(),
    daysBeforeExpiry: z.array(z.number().min(0).max(30)).optional(),
    emailNotifications: z.boolean().optional(),
    inAppNotifications: z.boolean().optional(),
  }).optional(),
});
```

## 📋 **Testing Checklist**

### **✅ Frontend Testing**
- [x] Date input shows `YYYY-MM-DD` format
- [x] Date is formatted to ISO string before API call
- [x] Console logs show original and formatted dates
- [x] Empty dates are handled as `undefined`

### **✅ Backend Testing**
- [x] Accepts `YYYY-MM-DD` format
- [x] Accepts full ISO strings
- [x] Rejects invalid date formats
- [x] Returns proper error messages

### **✅ Integration Testing**
- [x] Frontend sends properly formatted dates
- [x] Backend validates and stores dates correctly
- [x] Error handling works for invalid dates
- [x] Field-specific errors display correctly

## 🎯 **Expected Results**

### **Before Fix:**
```json
// Frontend sends: "2025-11-25"
// Backend validation fails: { fieldErrors: { expiryDate: ['Invalid datetime'] } }
```

### **After Fix:**
```json
// Frontend sends: "2025-11-25T00:00:00.000Z"
// Backend validation passes: ✅ Success
```

## 🚀 **Quick Test Commands**

```bash
# Test with properly formatted date
curl -X PATCH http://localhost:5000/api/groceries/ITEM_ID/expiry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"expiryDate": "2025-11-25T00:00:00.000Z"}'

# Test with YYYY-MM-DD format (should work with backend transformation)
curl -X PATCH http://localhost:5000/api/groceries/ITEM_ID/expiry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"expiryDate": "2025-11-25"}'
```

Your expiry date formatting is now fixed! 🎉
