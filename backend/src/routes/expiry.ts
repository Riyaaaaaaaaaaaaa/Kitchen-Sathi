import { Router } from 'express';
import { z } from 'zod';
import { GroceryItem } from '../models/GroceryItem.js';
import { Notification } from '../models/Notification.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { expiryCheckService } from '../services/ExpiryCheckService.js';

const router = Router();

const updateExpirySchema = z.object({
  expiryDate: z.string().datetime().optional(),
  notificationPreferences: z.object({
    enabled: z.boolean().optional(),
    daysBeforeExpiry: z.array(z.number().min(0).max(30)).optional(),
    emailNotifications: z.boolean().optional(),
    inAppNotifications: z.boolean().optional(),
  }).optional(),
});

const createItemWithExpirySchema = z.object({
  name: z.string().min(1).max(100),
  quantity: z.number().min(1).max(1000),
  unit: z.string().min(1).max(20),
  expiryDate: z.string().datetime().optional(),
  notificationPreferences: z.object({
    enabled: z.boolean().default(true),
    daysBeforeExpiry: z.array(z.number().min(0).max(30)).default([1, 3, 7]),
    emailNotifications: z.boolean().default(true),
    inAppNotifications: z.boolean().default(true),
  }).optional(),
});

// GET /api/groceries/expiring - Get items expiring soon
router.get('/expiring', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { days = 7 } = req.query;
    const daysNum = parseInt(days as string);
    
    const today = new Date();
    const futureDate = new Date(today.getTime() + daysNum * 24 * 60 * 60 * 1000);
    
    const expiringItems = await GroceryItem.find({
      userId: req.user!.id,
      expiryDate: {
        $gte: today,
        $lte: futureDate
      },
      completed: false
    }).sort({ expiryDate: 1 });

    res.json(expiringItems);
  } catch (error) {
    console.error('[expiry-api] Error fetching expiring items:', error);
    res.status(500).json({ error: 'Failed to fetch expiring items' });
  }
});

// GET /api/groceries/expired - Get expired items
router.get('/expired', requireAuth, async (req: AuthRequest, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expiredItems = await GroceryItem.find({
      userId: req.user!.id,
      expiryDate: { $lt: today },
      completed: false
    }).sort({ expiryDate: -1 });

    res.json(expiredItems);
  } catch (error) {
    console.error('[expiry-api] Error fetching expired items:', error);
    res.status(500).json({ error: 'Failed to fetch expired items' });
  }
});

// POST /api/groceries - Enhanced create with expiry
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    console.log(`[expiry-api] ➕ POST request - User: ${req.user!.id}`);
    console.log(`[expiry-api] 📤 Request body:`, req.body);
    
    const parsed = createItemWithExpirySchema.safeParse(req.body);
    if (!parsed.success) {
      console.log(`[expiry-api] ❌ Validation failed:`, parsed.error.flatten());
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const itemData = {
      ...parsed.data,
      userId: req.user!.id,
      expiryDate: parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : undefined,
      notificationPreferences: parsed.data.notificationPreferences || {
        enabled: true,
        daysBeforeExpiry: [1, 3, 7],
        emailNotifications: true,
        inAppNotifications: true,
      }
    };

    console.log(`[expiry-api] ✅ Validation passed, creating item...`);
    const item = await GroceryItem.create(itemData);

    console.log(`[expiry-api] ✅ Item created successfully:`, item._id);
    res.status(201).json(item);
  } catch (error) {
    console.error('[expiry-api] ❌ POST error:', error);
    res.status(500).json({ error: 'Failed to create grocery item' });
  }
});

// PATCH /api/groceries/:id/expiry - Update expiry date and preferences
router.patch('/:id/expiry', requireAuth, async (req: AuthRequest, res) => {
  try {
    console.log(`[expiry-api] ✏️ PATCH expiry - User: ${req.user!.id}, Item: ${req.params.id}`);
    
    const parsed = updateExpirySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const updateData: any = {};
    if (parsed.data.expiryDate) {
      updateData.expiryDate = new Date(parsed.data.expiryDate);
    }
    if (parsed.data.notificationPreferences) {
      updateData.notificationPreferences = parsed.data.notificationPreferences;
    }

    const item = await GroceryItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id },
      updateData,
      { new: true }
    );

    if (!item) {
      console.log(`[expiry-api] ❌ Item not found: ${req.params.id}`);
      return res.status(404).json({ error: 'Grocery item not found' });
    }

    console.log(`[expiry-api] ✅ Item expiry updated successfully: ${item._id}`);
    res.json(item);
  } catch (error) {
    console.error('[expiry-api] ❌ PATCH expiry error:', error);
    res.status(500).json({ error: 'Failed to update item expiry' });
  }
});

// GET /api/notifications - Get user notifications
router.get('/notifications', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    
    const query: any = { userId: req.user!.id };
    if (status) {
      query.status = status;
    }

    const notifications = await Notification.find(query)
      .populate('groceryItemId', 'name expiryDate')
      .sort({ sentAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const total = await Notification.countDocuments(query);

    res.json({
      notifications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('[expiry-api] Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch('/notifications/:id/read', requireAuth, async (req: AuthRequest, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id },
      { status: 'read', readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error('[expiry-api] Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// GET /api/expiry/stats - Get expiry statistics
router.get('/expiry/stats', requireAuth, async (req: AuthRequest, res) => {
  try {
    const stats = await expiryCheckService.getExpiryStats();
    res.json(stats);
  } catch (error) {
    console.error('[expiry-api] Error fetching expiry stats:', error);
    res.status(500).json({ error: 'Failed to fetch expiry statistics' });
  }
});

// POST /api/expiry/check - Manual trigger expiry check (admin only)
router.post('/expiry/check', requireAuth, async (req: AuthRequest, res) => {
  try {
    // Only allow admin users to trigger manual checks
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    await expiryCheckService.triggerManualCheck();
    res.json({ message: 'Expiry check triggered successfully' });
  } catch (error) {
    console.error('[expiry-api] Error triggering expiry check:', error);
    res.status(500).json({ error: 'Failed to trigger expiry check' });
  }
});

export default router;
