import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { MealConsumption } from '../models/MealConsumption.js';
import { CalorieCalculator } from '../services/calorieCalculator.js';

const router = Router();

// GET /api/analytics/weekly-calories
router.get('/weekly-calories', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    console.log(`[calorie-analytics] 📊 GET /weekly-calories - User: ${userId}`);

    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has required profile data
    if (!user.dateOfBirth || !user.gender || !user.weight || !user.height) {
      console.log(`[calorie-analytics] ⚠️ User missing profile data`);
      return res.status(400).json({ 
        error: 'Please complete your profile (age, gender, weight, height) to view calorie analytics' 
      });
    }

    // Calculate age from date of birth
    const birthDate = new Date(user.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Calculate recommended daily calories
    const recommendedDaily = CalorieCalculator.calculateDailyCalories({
      age,
      gender: user.gender,
      weight: user.weight,
      height: user.height
    });

    console.log(`[calorie-analytics] 🔢 Recommended daily calories: ${recommendedDaily}`);

    // Get last 7 days of data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // Last 7 days including today
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const consumptions = await MealConsumption.find({
      userId,
      consumedAt: { $gte: sevenDaysAgo }
    }).sort({ consumedAt: 1 });

    console.log(`[calorie-analytics] 📋 Found ${consumptions.length} meal consumptions in last 7 days`);

    // Group by day
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData: any[] = [];
    let totalConsumed = 0;

    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      // Get consumptions for this day
      const dayConsumptions = consumptions.filter(c => {
        const consumedDate = new Date(c.consumedAt);
        return consumedDate >= date && consumedDate < nextDate;
      });

      const dayCalories = dayConsumptions.reduce((sum, c) => sum + c.calories, 0);
      totalConsumed += dayCalories;

      const status = CalorieCalculator.getCalorieStatus(dayCalories, recommendedDaily);

      weeklyData.push({
        day: dayNames[date.getDay()],
        date: date.toISOString().split('T')[0],
        consumed: dayCalories,
        recommended: recommendedDaily,
        status,
        meals: dayConsumptions.length
      });
    }

    const totalRecommended = recommendedDaily * 7;
    const avgDaily = Math.round(totalConsumed / 7);

    const summary = {
      totalConsumed,
      totalRecommended,
      avgDaily,
      overallStatus: CalorieCalculator.getCalorieStatus(avgDaily, recommendedDaily)
    };

    console.log(`[calorie-analytics] ✅ Summary - Avg: ${avgDaily}, Recommended: ${recommendedDaily}`);

    return res.json({
      recommendedDaily,
      weeklyData,
      summary
    });

  } catch (error: any) {
    console.error('[calorie-analytics] ❌ Error:', error);
    return res.status(500).json({ error: 'Failed to fetch calorie analytics' });
  }
});

export default router;

