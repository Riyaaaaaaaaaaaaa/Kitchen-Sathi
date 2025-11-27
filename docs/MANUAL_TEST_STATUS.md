# 🧪 Manual Test - Status Update Routes

## Problem
The status update routes don't appear in the 404 handler list, BUT they should still work because they're registered in the groceries router.

## Step-by-Step Test

### Step 1: Check Backend Console

Look at your backend terminal. You should see these startup logs:

```
[startup] ✅ Registered routes:
  ...
  PATCH  /api/groceries/:id/status (auth required) ⭐
  POST   /api/groceries/:id/mark-completed (auth required) ⭐
  POST   /api/groceries/:id/mark-used (auth required) ⭐
  GET    /api/groceries/by-status/:status (auth required) ⭐
  ...
⭐ = Status update routes
```

**If you DON'T see these**, the backend needs to be restarted.

### Step 2: Browser Test (Most Important!)

1. **Open browser**: `http://localhost:5173`
2. **Login** to your account
3. **Open DevTools** (F12) → **Console** tab
4. **Go to Grocery Lists** page
5. **Click a status badge** (🛒 Pending)

### Expected Console Output:

```javascript
🔄 [GroceryListPage] Status change requested: 67891abc... → completed
📞 Calling markItemCompleted(67891abc...)
🌐 [API] POST /api/groceries/67891abc.../mark-completed
✅ [API] Response: { _id: "...", status: "completed", ... }
✅ Status update successful: { ... }
```

### Expected Network Tab (F12 → Network):

```
Name: mark-completed
Method: POST  
URL: http://localhost:5000/api/groceries/{id}/mark-completed
Status: 200 ✅
Response: { _id, name, status: "completed", ... }
```

###  Step 3: If Still Getting 404

The error "API endpoint not found" with detailed logging in backend will show:

```
[404] ❌ API route not found: POST /api/groceries/{id}/mark-completed
[404] Request headers: { authorization: 'Bearer ...', ... }
```

**If you see this**, it means the router isn't properly mounted. Check:

1. **Backend logs on startup** - Should show "Registered routes"
2. **Routes file** - `backend/src/routes/groceries.ts` should have status routes BEFORE general `/:id` routes
3. **Index file** - `backend/src/index.ts` should have `app.use('/api', apiRouter)`

### Step 4: Quick cURL Test (If Browser Fails)

You need a JWT token first. Get it from browser:

```javascript
// In browser console (F12):
console.log(localStorage.getItem('auth_token'));
// Copy the token
```

Then test the endpoint:

```bash
# Windows PowerShell:
$token = "YOUR_TOKEN_HERE"
$itemId = "YOUR_ITEM_ID_HERE"

Invoke-RestMethod -Uri "http://localhost:5000/api/groceries/$itemId/mark-completed" `
  -Method POST `
  -Headers @{ "Authorization" = "Bearer $token" }
```

**Expected**: Status 200, response with updated item  
**If 404**: Routes not registered
**If 401**: Token invalid/expired, login again  
**If 404 on item**: Item doesn't exist or doesn't belong to you

## What Backend Console Should Show

### When Route is HIT (Good!):

```
[routes] 🛒 Groceries route hit: POST /67891abc.../mark-completed
[routes] 📤 Body: {}
[routes] 🔑 Auth header: Present
[groceries] ✓ POST mark-completed - Item: 67891abc...
[groceries] ✅ Item marked as completed
```

### When Route is NOT Found (Bad):

```
[404] ❌ API route not found: POST /api/groceries/67891abc.../mark-completed
[404] Request headers: {...}
```

## Solution if Routes Missing

### Option 1: Hard Restart Backend

```bash
# Stop backend (Ctrl+C in terminal)
cd D:\AajKyaBanega\backend
npm run dev
```

Look for the startup logs showing ⭐ routes.

### Option 2: Check Route Order

File: `backend/src/routes/groceries.ts`

Should look like this:

```typescript
// Line ~65-180: SPECIFIC routes FIRST
router.patch('/:id/status', ...)
router.post('/:id/mark-completed', ...)  
router.post('/:id/mark-used', ...)
router.get('/by-status/:status', ...)

// Line ~187+: GENERAL routes LAST
router.patch('/:id', ...)
router.delete('/:id', ...)
```

### Option 3: Verify Export

File: `backend/src/routes/index.ts`

Should have:

```typescript
import groceriesRouter from './groceries.js';
// ...
router.use('/groceries', groceriesRouter);
```

## Success Indicators

✅ Backend startup shows ⭐ status routes  
✅ Browser console shows successful API calls  
✅ Network tab shows 200 OK responses  
✅ Status badges change colors  
✅ Stats update immediately  
✅ No error messages

## If STILL Not Working

Share these 3 things:

1. **Backend startup logs** (first 20 lines after starting)
2. **Browser console error** (full red error text)
3. **Network tab details** (Request URL, Status Code, Response)

---

**Expected Time**: 2-3 minutes  
**Difficulty**: Medium  
**Success Rate**: Should work if backend restarted properly

