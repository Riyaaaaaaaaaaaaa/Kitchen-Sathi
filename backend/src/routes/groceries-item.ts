// Backend route recommendation for fetching individual grocery items
// Add this to backend/src/routes/groceries.ts

import { Router } from 'express';
import { GroceryItem } from '../models/GroceryItem.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/groceries/:id - Get specific grocery item (includes expiry data)
router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    console.log(`[groceries] 📋 GET /${req.params.id} - User: ${req.user!.id}`);
    
    const item = await GroceryItem.findOne({ 
      _id: req.params.id, 
      userId: req.user!.id 
    });
    
    if (!item) {
      console.log(`[groceries] ❌ Item not found: ${req.params.id}`);
      return res.status(404).json({ error: 'Grocery item not found' });
    }
    
    console.log(`[groceries] ✅ Found item: ${item.name}`);
    res.json(item);
  } catch (error) {
    console.error('[groceries] ❌ GET /:id error:', error);
    res.status(500).json({ error: 'Failed to fetch grocery item' });
  }
});

export default router;
