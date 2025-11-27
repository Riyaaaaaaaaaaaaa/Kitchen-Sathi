import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { GroceryItem } from '../models/GroceryItem.js';
import { MealPlan } from '../models/MealPlan.js';
import mongoose from 'mongoose';

const router = Router();

// GET /api/analytics/summary
// Returns overall statistics for the user
router.get('/summary', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    console.log(`[analytics] 📊 GET /summary - User: ${userId}`);
    
    // Get total items tracked (all time)
    const totalItems = await GroceryItem.countDocuments({ userId: new mongoose.Types.ObjectId(userId) });
    
    // Get items by status
    const itemsByStatus = await GroceryItem.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { 
        $group: { 
          _id: '$status', 
          count: { $sum: 1 } 
        }
      }
    ]);
    
    // Get most bought items (top 5)
    const topItems = await GroceryItem.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { 
        $group: { 
          _id: '$name', 
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Calculate status counts
    const pendingCount = itemsByStatus.find(s => s._id === 'pending')?.count || 0;
    const completedCount = itemsByStatus.find(s => s._id === 'completed')?.count || 0;
    const usedCount = itemsByStatus.find(s => s._id === 'used')?.count || 0;
    
    // Calculate waste prevention rate
    const totalProcessed = completedCount + usedCount;
    const wastePreventionRate = totalProcessed > 0 
      ? Math.round((usedCount / totalProcessed) * 100) 
      : 0;
    
    // Get expiring soon count (next 7 days)
    const today = new Date();
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);
    
    const expiringSoonCount = await GroceryItem.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      status: { $in: ['pending', 'completed'] },
      expiryDate: {
        $gte: today.toISOString(),
        $lte: sevenDaysLater.toISOString()
      }
    });
    
    // Get meal plan statistics
    const totalMealsPlanned = await MealPlan.aggregate([
      { $match: { userId: userId } },
      { $unwind: '$meals' },
      { $count: 'total' }
    ]);
    
    const totalMeals = totalMealsPlanned[0]?.total || 0;
    
    // Get meals by type
    const mealsByType = await MealPlan.aggregate([
      { $match: { userId: userId } },
      { $unwind: '$meals' },
      { 
        $group: { 
          _id: '$meals.mealType', 
          count: { $sum: 1 } 
        }
      }
    ]);
    
    // Get this week's meal count
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startDateStr = startOfWeek.toISOString().split('T')[0];
    
    const weeklyMealsData = await MealPlan.aggregate([
      { 
        $match: { 
          userId: userId,
          date: { $gte: startDateStr }
        } 
      },
      { $unwind: '$meals' },
      { $count: 'total' }
    ]);
    
    const weeklyMeals = weeklyMealsData[0]?.total || 0;
    
    // Calculate actual savings based on item prices
    const usedItems = await GroceryItem.find({
      userId: new mongoose.Types.ObjectId(userId),
      status: 'used'
    });
    
    const estimatedSavings = usedItems.reduce((total, item) => {
      // Use actual price if available, otherwise fallback to ₹50 average
      const itemPrice = item.price || 50;
      const quantity = item.quantity || 1;
      return total + (itemPrice * quantity);
    }, 0);
    
    console.log(`[analytics] 💰 Calculated savings: ₹${estimatedSavings} from ${usedItems.length} used items`);
    
    console.log(`[analytics] ✅ Summary generated - Total items: ${totalItems}, Meals: ${totalMeals}`);
    
    res.json({
      groceries: {
        total: totalItems,
        byStatus: itemsByStatus,
        topItems: topItems,
        wastePreventionRate,
        expiringSoon: expiringSoonCount,
        statusCounts: {
          pending: pendingCount,
          completed: completedCount,
          used: usedCount
        }
      },
      meals: {
        total: totalMeals,
        thisWeek: weeklyMeals,
        byType: mealsByType
      },
      savings: {
        estimated: estimatedSavings
      }
    });
    
  } catch (error: any) {
    console.error('[analytics] ❌ Summary error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch analytics',
      message: error.message 
    });
  }
});

// GET /api/analytics/trends
// Returns time-based trend data (last 30 days)
router.get('/trends', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    console.log(`[analytics] 📈 GET /trends - User: ${userId}`);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Group items by date created
    const dailyStats = await GroceryItem.aggregate([
      { 
        $match: { 
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          added: { $sum: 1 },
          completed: { 
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } 
          },
          used: { 
            $sum: { $cond: [{ $eq: ["$status", "used"] }, 1, 0] } 
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    console.log(`[analytics] ✅ Trends generated - ${dailyStats.length} days of data`);
    
    res.json({ dailyStats });
    
  } catch (error: any) {
    console.error('[analytics] ❌ Trends error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch trends',
      message: error.message 
    });
  }
});

export default router;

