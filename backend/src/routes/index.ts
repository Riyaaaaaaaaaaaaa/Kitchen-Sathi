import { Router } from 'express';
import authRouter from './auth.js';
import groceriesRouter from './groceries.js';
import profileRouter from './profile.js';
import recipesRouter from './recipes.js';
import mealPlansRouter from './mealPlans.js';
import analyticsRouter from './analytics.js';
import calorieAnalyticsRouter from './calorieAnalytics.js';
import userRecipesRouter from './userRecipes.js';
import sharedRecipesRouter from './sharedRecipes.js';
import notificationsRouter from './notifications.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ message: 'KitchenSathi API - AI Meal Planning' });
});

// Add comprehensive route logging BEFORE mounting routers
router.use('/groceries', (req, res, next) => {
  console.log(`[routes] 🛒 Groceries route hit: ${req.method} ${req.path}`);
  console.log(`[routes] 📤 Body:`, req.body);
  console.log(`[routes] 🔑 Auth header:`, req.headers.authorization ? 'Present' : 'Missing');
  next();
});

router.use('/auth', (req, res, next) => {
  console.log(`[routes] 🔐 Auth route hit: ${req.method} ${req.path}`);
  next();
});

router.use('/auth', authRouter);
router.use('/groceries', groceriesRouter);
router.use('/profile', profileRouter);
router.use('/recipes', recipesRouter);
router.use('/meal-plans', mealPlansRouter);
router.use('/analytics', analyticsRouter);
router.use('/analytics', calorieAnalyticsRouter); // Calorie analytics under /api/analytics/weekly-calories
router.use('/user-recipes', userRecipesRouter);
router.use('/shared-recipes', sharedRecipesRouter);
router.use('/notifications', notificationsRouter);

// Manual trigger for expiry check (for testing)
router.post('/test/trigger-expiry-check', requireAuth, async (req: any, res) => {
  try {
    console.log(`[test-api] 🧪 POST /test/trigger-expiry-check - User: ${req.user.id}`);
    const { groceryExpiryService } = await import('../services/groceryExpiryService.js');
    await groceryExpiryService.checkAndNotifyExpiringGroceries();
    res.json({ success: true, message: 'Expiry check triggered successfully. Check your notifications!' });
  } catch (error: any) {
    console.error('[test-api] ❌ Error triggering expiry check:', error);
    res.status(500).json({ error: 'Failed to trigger expiry check', message: error.message });
  }
});

// Reset notifiedForExpiry flags for testing
router.post('/test/reset-notifications', requireAuth, async (req: any, res) => {
  try {
    console.log(`[test-api] 🔄 POST /test/reset-notifications - User: ${req.user.id}`);
    const { GroceryItem } = await import('../models/GroceryItem.js');
    const result = await GroceryItem.updateMany(
      { userId: req.user.id },
      { $set: { notifiedForExpiry: false } }
    );
    console.log(`[test-api] ✅ Reset ${result.modifiedCount} items`);
    res.json({ 
      success: true, 
      message: `Reset notification flags for ${result.modifiedCount} items`,
      modifiedCount: result.modifiedCount
    });
  } catch (error: any) {
    console.error('[test-api] ❌ Error resetting notifications:', error);
    res.status(500).json({ error: 'Failed to reset notifications', message: error.message });
  }
});

// Add expiry routes directly to avoid import issues
router.get('/groceries/expiring', requireAuth, async (req: any, res) => {
  try {
    console.log(`[expiry-api] 📅 GET /expiring - User: ${req.user.id}`);
    const { GroceryItem } = await import('../models/GroceryItem.js');
    
    const { days = 7 } = req.query;
    const daysNum = parseInt(days as string);
    
    const today = new Date();
    const futureDate = new Date(today.getTime() + daysNum * 24 * 60 * 60 * 1000);
    
    const expiringItems = await GroceryItem.find({
      userId: req.user.id,
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

router.get('/groceries/expired', requireAuth, async (req: any, res) => {
  try {
    console.log(`[expiry-api] 📅 GET /expired - User: ${req.user.id}`);
    const { GroceryItem } = await import('../models/GroceryItem.js');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expiredItems = await GroceryItem.find({
      userId: req.user.id,
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

router.get('/groceries/notifications', requireAuth, async (req: any, res) => {
  try {
    console.log(`[expiry-api] 🔔 GET /notifications - User: ${req.user.id}`);
    
    // For now, return empty notifications
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

router.patch('/groceries/:id/expiry', requireAuth, async (req: any, res) => {
  try {
    console.log(`[expiry-api] ✏️ PATCH /${req.params.id}/expiry - User: ${req.user.id}`);
    const { GroceryItem } = await import('../models/GroceryItem.js');
    const { z } = await import('zod');
    
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
      notificationPreferences: z.object({
        enabled: z.boolean().optional(),
        daysBeforeExpiry: z.array(z.number().min(0).max(30)).optional(),
        emailNotifications: z.boolean().optional(),
        inAppNotifications: z.boolean().optional(),
      }).optional(),
    });

    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      const flattened = parsed.error.flatten();
      console.log(`[expiry-api] ❌ Validation failed:`, flattened);
      
      // Return structured validation errors that frontend expects
      return res.status(400).json({
        details: {
          formErrors: flattened.formErrors || [],
          fieldErrors: flattened.fieldErrors || {}
        }
      });
    }

    const updateData: any = {};
    if (parsed.data.expiryDate) {
      updateData.expiryDate = new Date(parsed.data.expiryDate);
    }
    if (parsed.data.notificationPreferences) {
      updateData.notificationPreferences = parsed.data.notificationPreferences;
    }

    const item = await GroceryItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
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

router.get('/groceries/expiry/stats', requireAuth, async (req: any, res) => {
  try {
    console.log(`[expiry-api] 📊 GET /expiry/stats - User: ${req.user.id}`);
    const { GroceryItem } = await import('../models/GroceryItem.js');
    
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const stats = await GroceryItem.aggregate([
      {
        $match: {
          userId: req.user.id,
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

console.log('[startup] ✅ Expiry routes added successfully');

// Add comprehensive logging for expiry routes
router.use('/groceries', (req, res, next) => {
  if (req.path.includes('/expiring') || req.path.includes('/expired') || req.path.includes('/notifications') || req.path.includes('/expiry')) {
    console.log(`[routes] ⏰ Expiry route hit: ${req.method} ${req.path}`);
    console.log(`[routes] 📤 Body:`, req.body);
    console.log(`[routes] 🔑 Auth header:`, req.headers.authorization ? 'Present' : 'Missing');
  }
  next();
});

router.get('/me', requireAuth, async (req: any, res) => {
  try {
    const { User } = await import('../models/User.js');
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar || ''
      }
    });
  } catch (error) {
    console.error('[me] Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});


router.get('/admin/ping', requireAuth, requireRole('admin'), (_req, res) => {
  res.json({ ok: true, role: 'admin' });
});

export default router;

