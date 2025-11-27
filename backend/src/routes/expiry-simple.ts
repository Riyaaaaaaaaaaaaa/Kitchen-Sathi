import { Router } from 'express';
import { z } from 'zod';
import { GroceryItem } from '../models/GroceryItem.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Simple expiry routes without complex services
router.get('/expiring', requireAuth, async (req: AuthRequest, res) => {
  try {
    console.log(`[expiry-api] 📅 GET /expiring - User: ${req.user!.id}`);
    
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

    console.log(`[expiry-api] ✅ Found ${expiringItems.length} expiring items`);
    res.json(expiringItems);
  } catch (error) {
    console.error('[expiry-api] ❌ Error fetching expiring items:', error);
    res.status(500).json({ error: 'Failed to fetch expiring items' });
  }
});

router.get('/expired', requireAuth, async (req: AuthRequest, res) => {
  try {
    console.log(`[expiry-api] 📅 GET /expired - User: ${req.user!.id}`);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expiredItems = await GroceryItem.find({
      userId: req.user!.id,
      expiryDate: { $lt: today },
      completed: false
    }).sort({ expiryDate: -1 });

    console.log(`[expiry-api] ✅ Found ${expiredItems.length} expired items`);
    res.json(expiredItems);
  } catch (error) {
    console.error('[expiry-api] ❌ Error fetching expired items:', error);
    res.status(500).json({ error: 'Failed to fetch expired items' });
  }
});

router.get('/notifications', requireAuth, async (req: AuthRequest, res) => {
  try {
    console.log(`[expiry-api] 🔔 GET /notifications - User: ${req.user!.id}`);
    
    // For now, return empty notifications until Notification model is working
    res.json({
      notifications: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
      }
    });
  } catch (error) {
    console.error('[expiry-api] ❌ Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.patch('/:id/expiry', requireAuth, async (req: AuthRequest, res) => {
  try {
    console.log(`[expiry-api] ✏️ PATCH /${req.params.id}/expiry - User: ${req.user!.id}`);
    
    const updateSchema = z.object({
      expiryDate: z.string().datetime().optional(),
      notificationPreferences: z.object({
        enabled: z.boolean().optional(),
        daysBeforeExpiry: z.array(z.number().min(0).max(30)).optional(),
        emailNotifications: z.boolean().optional(),
        inAppNotifications: z.boolean().optional(),
      }).optional(),
    });

    const parsed = updateSchema.safeParse(req.body);
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

router.get('/expiry/stats', requireAuth, async (req: AuthRequest, res) => {
  try {
    console.log(`[expiry-api] 📊 GET /expiry/stats - User: ${req.user!.id}`);
    
    // Simple stats without complex service
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const stats = await GroceryItem.aggregate([
      {
        $match: {
          userId: req.user!.id,
          expiryDate: { $gte: today, $lte: nextWeek },
          completed: false
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$expiryDate' }
          },
          count: { $sum: 1 },
          items: { $push: '$name' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalExpiringItems: stats.reduce((sum, stat) => sum + stat.count, 0),
      byDate: stats,
      nextCheck: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });
  } catch (error) {
    console.error('[expiry-api] ❌ Error fetching expiry stats:', error);
    res.status(500).json({ error: 'Failed to fetch expiry statistics' });
  }
});

export default router;
