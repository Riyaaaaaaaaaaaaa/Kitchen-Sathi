import { Router } from 'express';
import { z } from 'zod';
import { GroceryItem, GroceryItemStatus } from '../models/GroceryItem.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

const createItemSchema = z.object({
  name: z.string().min(1).max(100),
  quantity: z.number().min(0.01).max(1000), // Allow fractional quantities (e.g., 0.5, 0.75)
  unit: z.string().min(1).max(20),
  price: z.number().min(0).max(100000).optional(), // Optional price in ₹
  expiryDate: z.string().optional().nullable().transform((val) => {
    if (!val) return undefined;
    const date = new Date(val);
    return isNaN(date.getTime()) ? undefined : date.toISOString();
  }),
});

const updateItemSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  quantity: z.number().min(0.01).max(1000).optional(), // Allow fractional quantities (e.g., 0.5, 0.75)
  unit: z.string().min(1).max(20).optional(),
  price: z.number().min(0).max(100000).optional(), // Optional price in ₹
  completed: z.boolean().optional(), // Deprecated - use status
  status: z.enum(['pending', 'completed', 'used']).optional(),
  expiryDate: z.string().optional().nullable().transform((val) => {
    // Allow removing expiry date by sending null or empty string
    if (val === null || val === '' || val === undefined) return null;
    const date = new Date(val);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
    return date.toISOString();
  }),
});

// GET /api/groceries - Get user's grocery list
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    console.log(`[groceries] 📋 GET request - User: ${req.user!.id}`);
    const items = await GroceryItem.find({ userId: req.user!.id }).sort({ createdAt: -1 });
    console.log(`[groceries] 📋 Found ${items.length} items`);
    res.json(items);
  } catch (error) {
    console.error('[groceries] ❌ GET error:', error);
    res.status(500).json({ error: 'Failed to fetch grocery list' });
  }
});

// POST /api/groceries - Add new grocery item
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    console.log(`[groceries] ➕ POST request - User: ${req.user!.id}`);
    console.log(`[groceries] 📤 Request body:`, req.body);
    
    const parsed = createItemSchema.safeParse(req.body);
    if (!parsed.success) {
      console.log(`[groceries] ❌ Validation failed:`, parsed.error.flatten());
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    console.log(`[groceries] ✅ Validation passed, creating item...`);
    const item = await GroceryItem.create({
      ...parsed.data,
      userId: req.user!.id,
    });

    console.log(`[groceries] ✅ Item created successfully:`, item._id);
    res.status(201).json(item);
  } catch (error) {
    console.error('[groceries] ❌ POST error:', error);
    res.status(500).json({ error: 'Failed to create grocery item' });
  }
});

// ============================================
// SPECIFIC ROUTES MUST COME BEFORE GENERAL /:id ROUTES
// ============================================

// PATCH /api/groceries/:id/status - Update item status (pending → completed → used)
router.patch('/:id/status', requireAuth, async (req: AuthRequest, res) => {
  try {
    console.log(`[groceries] 🔄 PATCH status request - Item: ${req.params.id}, User: ${req.user!.id}`);
    console.log(`[groceries] 📤 Request body:`, req.body);
    
    const { status } = req.body;
    
    if (!status || !['pending', 'completed', 'used'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be one of: pending, completed, used' 
      });
    }

    const item = await GroceryItem.findOne({
      _id: req.params.id,
      userId: req.user!.id,
    });

    if (!item) {
      return res.status(404).json({ error: 'Grocery item not found' });
    }

    // Update status
    item.status = status as GroceryItemStatus;
    await item.save(); // Triggers pre-save middleware

    console.log(`[groceries] ✅ Status updated to: ${status}`);
    res.json(item);
  } catch (error) {
    console.error('[groceries] ❌ PATCH status error:', error);
    res.status(500).json({ error: 'Failed to update item status' });
  }
});

// POST /api/groceries/:id/mark-completed - Mark item as completed (bought)
router.post('/:id/mark-completed', requireAuth, async (req: AuthRequest, res) => {
  try {
    console.log(`[groceries] ✓ POST mark-completed - Item: ${req.params.id}`);
    
    const item = await GroceryItem.findOne({
      _id: req.params.id,
      userId: req.user!.id,
    });

    if (!item) {
      return res.status(404).json({ error: 'Grocery item not found' });
    }

    item.status = GroceryItemStatus.COMPLETED;
    await item.save();

    console.log(`[groceries] ✅ Item marked as completed - Price: ${item.price || 'not set'}`);
    res.json(item);
  } catch (error) {
    console.error('[groceries] ❌ POST mark-completed error:', error);
    res.status(500).json({ error: 'Failed to mark item as completed' });
  }
});

// POST /api/groceries/:id/mark-used - Mark item as used/consumed
router.post('/:id/mark-used', requireAuth, async (req: AuthRequest, res) => {
  try {
    console.log(`[groceries] 🍽️  POST mark-used - Item: ${req.params.id}`);
    
    const item = await GroceryItem.findOne({
      _id: req.params.id,
      userId: req.user!.id,
    });

    if (!item) {
      return res.status(404).json({ error: 'Grocery item not found' });
    }

    if (item.status === GroceryItemStatus.PENDING) {
      return res.status(400).json({ 
        error: 'Cannot mark pending item as used. Mark as completed first.' 
      });
    }

    item.status = GroceryItemStatus.USED;
    await item.save();

    console.log(`[groceries] ✅ Item marked as used - Price: ${item.price || 'not set'}`);
    res.json(item);
  } catch (error) {
    console.error('[groceries] ❌ POST mark-used error:', error);
    res.status(500).json({ error: 'Failed to mark item as used' });
  }
});

// GET /api/groceries/by-status/:status - Get items by status
router.get('/by-status/:status', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { status } = req.params;
    
    if (!['pending', 'completed', 'used'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be one of: pending, completed, used' 
      });
    }

    console.log(`[groceries] 📋 GET by-status/${status} - User: ${req.user!.id}`);
    
    const items = await GroceryItem.find({ 
      userId: req.user!.id,
      status: status as GroceryItemStatus
    }).sort({ createdAt: -1 });
    
    console.log(`[groceries] 📋 Found ${items.length} ${status} items`);
    res.json(items);
  } catch (error) {
    console.error('[groceries] ❌ GET by-status error:', error);
    res.status(500).json({ error: 'Failed to fetch items by status' });
  }
});

// ============================================
// GENERAL /:id ROUTES - MUST COME LAST
// ============================================

// PATCH /api/groceries/:id - Update grocery item (general update)
router.patch('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    console.log(`[groceries] ✏️ PATCH general update - Item: ${req.params.id}, User: ${req.user!.id}`);
    console.log(`[groceries] 📤 Update payload:`, req.body);
    
    const parsed = updateItemSchema.safeParse(req.body);
    if (!parsed.success) {
      console.log(`[groceries] ❌ Validation failed:`, parsed.error.flatten());
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    console.log(`[groceries] ✅ Validation passed, updating with:`, parsed.data);

    const item = await GroceryItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id },
      parsed.data,
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ error: 'Grocery item not found' });
    }

    console.log(`[groceries] ✅ Item updated successfully`);
    console.log(`[groceries] 📤 Sending response:`, {
      _id: item._id,
      name: item.name,
      expiryDate: item.expiryDate,
      status: item.status
    });
    
    res.json(item);
  } catch (error) {
    console.error('[groceries] ❌ PATCH general error:', error);
    res.status(500).json({ error: 'Failed to update grocery item' });
  }
});

// DELETE /api/groceries/:id - Delete grocery item
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    console.log(`[groceries] 🗑️  DELETE request - Item: ${req.params.id}, User: ${req.user!.id}`);
    const item = await GroceryItem.findOneAndDelete({
      _id: req.params.id,
      userId: req.user!.id,
    });

    if (!item) {
      return res.status(404).json({ error: 'Grocery item not found' });
    }

    console.log(`[groceries] ✅ Item deleted successfully`);
    res.status(204).send();
  } catch (error) {
    console.error('[groceries] ❌ DELETE error:', error);
    res.status(500).json({ error: 'Failed to delete grocery item' });
  }
});

export default router;
