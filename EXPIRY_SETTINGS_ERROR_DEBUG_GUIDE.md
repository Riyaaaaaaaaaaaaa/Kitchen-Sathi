# 🧪 **ExpirySettings Error Handling Test Guide**

## 🎯 **Problem Analysis**

Your backend returns:
```json
{
  "details": {
    "formErrors": [],
    "fieldErrors": {
      "expiryDate": ["Invalid datetime"]
    }
  }
}
```

But your frontend shows generic "Bad Request" instead of field-specific errors.

## 🔧 **Solution Implementation**

### **1. Enhanced Error Processing**

The error processing now prioritizes structured validation errors:

```typescript
// Priority 1: error.details.formErrors/fieldErrors (your backend format)
if (details.formErrors || details.fieldErrors) {
  result.isValidationError = true;
  result.fieldErrors = details.fieldErrors || {};
  // ... create user-friendly messages
}
```

### **2. Debug Logging**

Added comprehensive debug logging to track error processing:

```typescript
console.log('🔍 Error Processing Debug:');
console.log('Original error:', err);
console.log('Processed result:', processed);
console.log('Field errors extracted:', processed.fieldErrors);
console.log('General error message:', processed.message);
```

### **3. Field Error Mapping**

Field errors are now properly mapped to inputs:

```typescript
// Field errors are extracted and mapped to field names
fieldErrors: {
  "expiryDate": ["Invalid datetime"],
  "daysBeforeExpiry": ["Must be numbers between 0 and 30"]
}
```

## 🧪 **Testing Checklist**

### **1. Backend Response Format**
```bash
# Test with invalid date
curl -X PATCH http://localhost:5000/api/groceries/ITEM_ID/expiry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"expiryDate": "invalid-date"}'

# Expected response:
{
  "details": {
    "formErrors": [],
    "fieldErrors": {
      "expiryDate": ["Invalid datetime"]
    }
  }
}
```

### **2. Frontend Error Processing**
```typescript
// Test in browser console
import { processApiErrorDebug } from './utils/errorHandling';

const testError = {
  details: {
    formErrors: [],
    fieldErrors: {
      expiryDate: ["Invalid datetime"]
    }
  }
};

const processed = processApiErrorDebug(testError);
console.log('Field errors:', processed.fieldErrors);
console.log('General message:', processed.message);
```

### **3. Visual Error Display**

**Expected Behavior:**
- ✅ Red border on expiry date input
- ✅ "Invalid datetime" error message below input
- ✅ Warning icon (⚠) with error message
- ✅ Accessible markup (role="alert", aria-describedby)
- ✅ No generic "Bad Request" message

**Error Styling:**
```css
/* Field with error */
border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50

/* Error message */
text-xs text-red-600 flex items-center
```

## 🔍 **Debug Steps**

### **1. Check Console Logs**
Open browser console and look for:
```
🔍 Error Processing Debug:
Original error: {details: {formErrors: [], fieldErrors: {...}}}
Processed result: {message: "...", fieldErrors: {...}, isValidationError: true}
Field errors extracted: {expiryDate: ["Invalid datetime"]}
General error message: "Please fix the following fields: expiryDate."
```

### **2. Verify Field Error Extraction**
```typescript
// Check if field errors are being extracted
console.log('expiryDate errors:', processed.fieldErrors.expiryDate);
console.log('daysBeforeExpiry errors:', processed.fieldErrors.daysBeforeExpiry);
```

### **3. Test Different Error Scenarios**

#### **Scenario 1: Invalid Date**
- **Input**: "2024-13-45" or "not-a-date"
- **Expected**: Red border on date input, "Invalid datetime" below

#### **Scenario 2: Invalid Days**
- **Input**: "abc" or "50" or "-5"
- **Expected**: Red border on days input, "Must be numbers between 0 and 30" below

#### **Scenario 3: Multiple Errors**
- **Input**: Invalid date AND invalid days
- **Expected**: Red borders on both inputs, specific error messages

#### **Scenario 4: Form-Level Error**
- **Input**: Backend returns formErrors
- **Expected**: General error message at top, no field-specific errors

## 🛠️ **Troubleshooting**

### **If Field Errors Don't Show:**

1. **Check Error Format**
   ```typescript
   console.log('Error structure:', error);
   console.log('Has details:', !!error.details);
   console.log('Has fieldErrors:', !!error.details?.fieldErrors);
   ```

2. **Check Field Name Mapping**
   ```typescript
   console.log('Field errors keys:', Object.keys(processed.fieldErrors));
   console.log('expiryDate errors:', processed.fieldErrors.expiryDate);
   ```

3. **Check Component State**
   ```typescript
   console.log('Component fieldErrors state:', fieldErrors);
   console.log('Component error state:', error);
   ```

### **If Generic Message Shows:**

1. **Check Error Processing Priority**
   ```typescript
   // Should show debug logs in development
   const processed = processApiErrorDebug(err);
   ```

2. **Check Backend Response**
   ```typescript
   // Verify backend returns correct format
   console.log('Backend response:', error);
   ```

## 📋 **Quick Test Commands**

```bash
# Test backend validation
curl -X PATCH http://localhost:5000/api/groceries/ITEM_ID/expiry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"expiryDate": "invalid-date"}'

# Test frontend error processing
# Open browser console and run:
import { processApiErrorDebug } from './utils/errorHandling';
processApiErrorDebug({
  details: {
    fieldErrors: { expiryDate: ["Invalid datetime"] }
  }
});
```

## ✅ **Expected Results**

After implementing the fixes:

1. **Field-Specific Errors**: Show under relevant inputs with red styling
2. **Form-Level Errors**: Show at top of modal
3. **Generic Messages**: Only show when no specific errors available
4. **Debug Logs**: Show detailed error processing in development
5. **Accessibility**: Proper ARIA attributes and screen reader support

Your ExpirySettings modal should now display field-specific errors instead of generic "Bad Request" messages! 🎉
