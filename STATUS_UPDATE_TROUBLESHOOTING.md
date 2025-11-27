# Grocery Item Status Update - Troubleshooting Guide

## Problem
"Failed to update item status" error when trying to mark items as completed or used.

## Root Cause Analysis

### 1. Route Ordering Issue
The status update routes in `groceries.ts` may be blocked by Express route matching order:

```typescript
// In routes/index.ts - These are registered AFTER the groceries router
router.get('/groceries/expiring', ...)
router.get('/groceries/expired', ...)
router.patch('/groceries/:id/expiry', ...)

// In routes/groceries.ts - These come from the mounted router
router.patch('/:id/status', ...)        // Becomes /api/groceries/:id/status
router.post('/:id/mark-completed', ...) // Becomes /api/groceries/:id/mark-completed
router.post('/:id/mark-used', ...)      // Becomes /api/groceries/:id/mark-used
```

**Problem**: If expiry routes are defined before groceries router, they work fine. But the `:id/status` route needs specific paths to be registered before wildcard patterns.

### 2. API Endpoint Details

**Frontend sends:**
```
PATCH /api/groceries/{itemId}/status
POST /api/groceries/{itemId}/mark-completed
POST /api/groceries/{itemId}/mark-used
```

**Backend expects:**
```typescript
// routes/groceries.ts line 106-139
router.patch('/:id/status', requireAuth, async (req, res) => {
  const { status } = req.body;
  // Validates: 'pending', 'completed', 'used'
})

// routes/groceries.ts line 141-164
router.post('/:id/mark-completed', requireAuth, async (req, res) => {
  // No body needed, just the ID in URL
})

// routes/groceries.ts line 166-195
router.post('/:id/mark-used', requireAuth, async (req, res) => {
  // Validates: item must be 'completed' before marking as 'used'
})
```

## Common Failure Causes

### ❌ 1. Authentication Missing
```
Error: 401 Unauthorized
Cause: No JWT token in Authorization header
Fix: Ensure token is present in request
```

### ❌ 2. Invalid Status Value
```
Error: 400 Bad Request - "Invalid status"
Cause: Status not in ['pending', 'completed', 'used']
Fix: Use GroceryItemStatus enum values
```

### ❌ 3. Invalid State Transition
```
Error: 400 Bad Request - "Cannot mark pending item as used"
Cause: Trying to go from PENDING directly to USED
Fix: Must go PENDING → COMPLETED → USED
```

### ❌ 4. Item Not Found
```
Error: 404 Not Found - "Grocery item not found"
Cause: Wrong item ID or item belongs to different user
Fix: Verify item ID and user ownership
```

### ❌ 5. Route Not Registered
```
Error: 404 Not Found (no specific message)
Cause: Route not mounted or wrong path
Fix: Check route registration order
```

## Solution Steps

### Step 1: Fix Route Registration Order

Move all special groceries routes into the groceries router file to avoid conflicts:

**File: `backend/src/routes/groceries.ts`**

Add these routes BEFORE the general PATCH route:

```typescript
// Status routes - MUST come before /:id route
router.patch('/:id/status', requireAuth, async (req, res) => { ... })
router.post('/:id/mark-completed', requireAuth, async (req, res) => { ... })
router.post('/:id/mark-used', requireAuth, async (req, res) => { ... })
router.get('/by-status/:status', requireAuth, async (req, res) => { ... })

// General update route - comes AFTER specific routes
router.patch('/:id', requireAuth, async (req, res) => { ... })
```

### Step 2: Add Detailed Error Logging

Update backend to return full error details:

```typescript
router.patch('/:id/status', requireAuth, async (req: AuthRequest, res) => {
  try {
    console.log(`🔄 Status update request:`, {
      itemId: req.params.id,
      userId: req.user!.id,
      requestedStatus: req.body.status,
      timestamp: new Date().toISOString()
    });
    
    const { status } = req.body;
    
    // Validate status value
    if (!status || !['pending', 'completed', 'used'].includes(status)) {
      console.error(`❌ Invalid status value: ${status}`);
      return res.status(400).json({ 
        error: 'Invalid status',
        message: 'Status must be one of: pending, completed, used',
        received: status
      });
    }

    const item = await GroceryItem.findOne({
      _id: req.params.id,
      userId: req.user!.id,
    });

    if (!item) {
      console.error(`❌ Item not found: ${req.params.id} for user ${req.user!.id}`);
      return res.status(404).json({ 
        error: 'Grocery item not found',
        itemId: req.params.id
      });
    }

    console.log(`📝 Current status: ${item.status}, Requested: ${status}`);

    // Update status
    item.status = status as GroceryItemStatus;
    await item.save();

    console.log(`✅ Status updated successfully: ${item.status}`);
    res.json(item);
  } catch (error: any) {
    console.error('❌ Status update error:', {
      error: error.message,
      stack: error.stack,
      itemId: req.params.id
    });
    res.status(500).json({ 
      error: 'Failed to update item status',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});
```

### Step 3: Enhanced Frontend Error Handling

Update `GroceryListPage.tsx` to show detailed errors:

```typescript
const handleStatusChange = async (id: string, newStatus: GroceryItemStatus) => {
  try {
    setError(null);
    console.log(`🔄 Updating status for item ${id} to ${newStatus}`);
    
    let updatedItem;
    
    switch (newStatus) {
      case GroceryItemStatus.COMPLETED:
        console.log(`📞 API call: POST /api/groceries/${id}/mark-completed`);
        updatedItem = await markItemCompleted(id);
        break;
      case GroceryItemStatus.USED:
        console.log(`📞 API call: POST /api/groceries/${id}/mark-used`);
        updatedItem = await markItemUsed(id);
        break;
      default:
        console.log(`📞 API call: PATCH /api/groceries/${id}/status`, { status: newStatus });
        updatedItem = await updateItemStatus(id, newStatus);
    }

    console.log(`✅ Status update successful:`, updatedItem);
    
    // Transform and update state...
    
  } catch (err: any) {
    console.error('❌ Status update failed:', {
      itemId: id,
      targetStatus: newStatus,
      error: err
    });
    
    // Extract detailed error message
    const errorMessage = err.message || 
                        err.error || 
                        err.details?.message ||
                        'Failed to update item status';
    
    setError(`Status Update Failed: ${errorMessage}`);
    
    // Show user-friendly message
    alert(`Could not update status: ${errorMessage}\n\nPlease check the console for details.`);
  }
};
```

### Step 4: API Request Validation

Ensure frontend sends correct format:

```typescript
// lib/api.ts

export async function markItemCompleted(id: string): Promise<GroceryItem> {
  console.log(`🌐 [API] POST /api/groceries/${id}/mark-completed`);
  
  const updatedItem = await request<GroceryItem>(
    `/api/groceries/${id}/mark-completed`,
    { method: 'POST' }
  );
  
  console.log(`✅ [API] Response:`, updatedItem);
  return { ...updatedItem, id: updatedItem._id };
}

export async function markItemUsed(id: string): Promise<GroceryItem> {
  console.log(`🌐 [API] POST /api/groceries/${id}/mark-used`);
  
  const updatedItem = await request<GroceryItem>(
    `/api/groceries/${id}/mark-used`,
    { method: 'POST' }
  );
  
  console.log(`✅ [API] Response:`, updatedItem);
  return { ...updatedItem, id: updatedItem._id };
}

export async function updateItemStatus(
  id: string, 
  status: GroceryItemStatus
): Promise<GroceryItem> {
  console.log(`🌐 [API] PATCH /api/groceries/${id}/status`, { status });
  
  const updatedItem = await request<GroceryItem>(
    `/api/groceries/${id}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }
  );
  
  console.log(`✅ [API] Response:`, updatedItem);
  return { ...updatedItem, id: updatedItem._id };
}
```

## Testing Checklist

### Browser DevTools - Network Tab
1. Open DevTools (F12) → Network tab
2. Try to update an item status
3. Check the request:
   ```
   URL: http://localhost:5000/api/groceries/{id}/mark-completed
   Method: POST
   Status: Should be 200 (not 404, 400, or 500)
   Headers: Authorization: Bearer {token}
   Response: { _id, name, status: "completed", ... }
   ```

### Backend Console Logs
Look for these patterns:
```
✅ Good:
[groceries] 🛒 Groceries route hit: POST /5f8d0d.../mark-completed
[groceries] ✓ POST mark-completed - Item: 5f8d0d...
[groceries] ✅ Item marked as completed

❌ Bad:
[routes] 🛒 Groceries route hit: POST /5f8d0d.../mark-completed
(no further logs) → Route not found in groceries router

❌ Bad:
[groceries] ❌ POST mark-completed error: Item not found
→ Check item ID and user ownership
```

### Manual API Test with curl

```bash
# 1. Login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Save the token from response

# 2. Mark item as completed
curl -X POST http://localhost:5000/api/groceries/{ITEM_ID}/mark-completed \
  -H "Authorization: Bearer {YOUR_TOKEN}"

# Expected: 200 OK with updated item
# Error 404: Route not found or item doesn't exist
# Error 401: Token missing or invalid
# Error 500: Server error (check logs)
```

## Quick Fix Summary

1. ✅ Verify backend server is running
2. ✅ Check route registration order in `groceries.ts`
3. ✅ Add console logs to both frontend and backend
4. ✅ Test with browser DevTools Network tab
5. ✅ Verify JWT token is being sent
6. ✅ Check MongoDB for item existence
7. ✅ Ensure status values match enum

## Expected Behavior

**Successful Status Update Flow:**
```
1. User clicks status badge
2. Frontend: handleStatusChange(itemId, 'completed')
3. Frontend: API call POST /api/groceries/{id}/mark-completed
4. Backend: Receives request, validates auth
5. Backend: Finds item, updates status to 'completed'
6. Backend: Saves with middleware (sets usedAt if 'used')
7. Backend: Returns updated item
8. Frontend: Updates local state
9. UI: Item shows ✅ badge with green background
```

## Still Not Working?

Run this diagnostic script:

```bash
# Check if backend is running
curl http://localhost:5000/api

# Check auth
curl http://localhost:5000/api/me \
  -H "Authorization: Bearer {YOUR_TOKEN}"

# List all groceries
curl http://localhost:5000/api/groceries \
  -H "Authorization: Bearer {YOUR_TOKEN}"

# Try status update with detailed error
curl -v -X POST http://localhost:5000/api/groceries/{ITEM_ID}/mark-completed \
  -H "Authorization: Bearer {YOUR_TOKEN}" \
  -H "Content-Type: application/json"
```

Copy the error output and check against common causes above.

