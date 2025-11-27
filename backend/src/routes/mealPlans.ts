import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { MealPlan, IMealPlanEntry } from '../models/MealPlan.js';
import { MealConsumption } from '../models/MealConsumption.js';

const router = Router();

const mealEntrySchema = z.object({
  recipeId: z.union([z.number(), z.string()]), // Support both numeric and string IDs (Edamam URIs)
  title: z.string(),
  image: z.string().optional().default(''), // Optional - custom meals may not have images
  servings: z.number().default(1),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  notes: z.string().optional()
});

// GET /api/meal-plans?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD - Get meal plans for a date range
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate } = req.query;
    console.log(`[mealPlans] 📅 GET / - User: ${req.user!.id}, Range: ${startDate} to ${endDate}`);

    const query: any = { userId: req.user!.id };

    if (startDate && endDate) {
      query.date = { $gte: startDate as string, $lte: endDate as string };
    } else if (startDate) {
      query.date = { $gte: startDate as string };
    } else if (endDate) {
      query.date = { $lte: endDate as string };
    }

    const mealPlans = await MealPlan.find(query).sort({ date: 1 });

    console.log(`[mealPlans] Found ${mealPlans.length} meal plans`);

    res.json(mealPlans);

  } catch (error: any) {
    console.error('[mealPlans] ❌ GET / error:', error);
    res.status(500).json({ 
      error: 'Failed to get meal plans',
      message: error.message 
    });
  }
});

// GET /api/meal-plans/:date - Get meal plan for a specific date
router.get('/:date', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { date } = req.params;
    console.log(`[mealPlans] 📅 GET /:date - Date: ${date}, User: ${req.user!.id}`);

    const mealPlan = await MealPlan.findOne({
      userId: req.user!.id,
      date
    });

    if (!mealPlan) {
      // Return empty meal plan structure
      return res.json({
        userId: req.user!.id,
        date,
        meals: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    console.log(`[mealPlans] Found meal plan with ${mealPlan.meals.length} meals`);

    res.json(mealPlan);

  } catch (error: any) {
    console.error('[mealPlans] ❌ GET /:date error:', error);
    res.status(500).json({ 
      error: 'Failed to get meal plan',
      message: error.message 
    });
  }
});

// POST /api/meal-plans - Create or update meal plan for a date
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    console.log(`[mealPlans] ➕ POST / - User: ${req.user!.id}`);

    const createSchema = z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
      meals: z.array(mealEntrySchema)
    });

    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    // Upsert meal plan (create or update)
    const mealPlan = await MealPlan.findOneAndUpdate(
      { userId: req.user!.id, date: parsed.data.date },
      {
        userId: req.user!.id,
        date: parsed.data.date,
        meals: parsed.data.meals
      },
      { upsert: true, new: true }
    );

    console.log(`[mealPlans] ✅ Saved meal plan for ${parsed.data.date} with ${parsed.data.meals.length} meals`);

    res.status(201).json(mealPlan);

  } catch (error: any) {
    console.error('[mealPlans] ❌ POST / error:', error);
    res.status(500).json({ 
      error: 'Failed to save meal plan',
      message: error.message 
    });
  }
});

// POST /api/meal-plans/:date/meals - Add a meal to a specific date
router.post('/:date/meals', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { date } = req.params;
    console.log(`[mealPlans] ➕ POST /:date/meals - Date: ${date}, User: ${req.user!.id}`);

    const parsed = mealEntrySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    // Find or create meal plan for this date
    let mealPlan = await MealPlan.findOne({
      userId: req.user!.id,
      date
    });

    if (!mealPlan) {
      mealPlan = await MealPlan.create({
        userId: req.user!.id,
        date,
        meals: [parsed.data]
      });
    } else {
      mealPlan.meals.push(parsed.data as IMealPlanEntry);
      await mealPlan.save();
    }

    console.log(`[mealPlans] ✅ Added meal: ${parsed.data.title} to ${date}`);

    res.status(201).json(mealPlan);

  } catch (error: any) {
    console.error('[mealPlans] ❌ POST /:date/meals error:', error);
    res.status(500).json({ 
      error: 'Failed to add meal to plan',
      message: error.message 
    });
  }
});

// DELETE /api/meal-plans/:date/meals/:mealIndex - Remove a meal from a date
router.delete('/:date/meals/:mealIndex', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { date, mealIndex } = req.params;
    const index = Number(mealIndex);
    console.log(`[mealPlans] 🗑️  DELETE /:date/meals/:mealIndex - Date: ${date}, Index: ${index}, User: ${req.user!.id}`);

    const mealPlan = await MealPlan.findOne({
      userId: req.user!.id,
      date
    });

    if (!mealPlan) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }

    if (index < 0 || index >= mealPlan.meals.length) {
      return res.status(400).json({ error: 'Invalid meal index' });
    }

    const removedMeal = mealPlan.meals.splice(index, 1)[0];
    await mealPlan.save();

    console.log(`[mealPlans] ✅ Removed meal: ${removedMeal.title} from ${date}`);

    res.json(mealPlan);

  } catch (error: any) {
    console.error('[mealPlans] ❌ DELETE /:date/meals/:mealIndex error:', error);
    res.status(500).json({ 
      error: 'Failed to remove meal from plan',
      message: error.message 
    });
  }
});

// DELETE /api/meal-plans/:date - Delete entire meal plan for a date
router.delete('/:date', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { date } = req.params;
    console.log(`[mealPlans] 🗑️  DELETE /:date - Date: ${date}, User: ${req.user!.id}`);

    const result = await MealPlan.findOneAndDelete({
      userId: req.user!.id,
      date
    });

    if (!result) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }

    console.log(`[mealPlans] ✅ Deleted meal plan for ${date}`);

    res.status(204).send();

  } catch (error: any) {
    console.error('[mealPlans] ❌ DELETE /:date error:', error);
    res.status(500).json({ 
      error: 'Failed to delete meal plan',
      message: error.message 
    });
  }
});

// GET /api/meal-plans/week/current - Get current week's meal plans (Mon-Sun)
router.get('/week/current', requireAuth, async (req: AuthRequest, res) => {
  try {
    console.log(`[mealPlans] 📅 GET /week/current - User: ${req.user!.id}`);

    // Calculate current week's Monday and Sunday
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const startDate = monday.toISOString().split('T')[0];
    const endDate = sunday.toISOString().split('T')[0];

    console.log(`[mealPlans] Current week: ${startDate} to ${endDate}`);

    const mealPlans = await MealPlan.find({
      userId: req.user!.id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    console.log(`[mealPlans] Found ${mealPlans.length} meal plans for current week`);

    res.json({
      startDate,
      endDate,
      mealPlans
    });

  } catch (error: any) {
    console.error('[mealPlans] ❌ GET /week/current error:', error);
    res.status(500).json({ 
      error: 'Failed to get weekly meal plans',
      message: error.message 
    });
  }
});

// POST /api/meal-plans/consume - Mark a meal as consumed
router.post('/consume', requireAuth, async (req: AuthRequest, res) => {
  try {
    console.log(`[mealPlans] 🍽️  POST /consume - User: ${req.user!.id}`);

    const consumeSchema = z.object({
      recipeName: z.string(),
      calories: z.number().min(0),
      consumedAt: z.string().optional() // Optional - defaults to now
    });

    const parsed = consumeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const consumption = await MealConsumption.create({
      userId: req.user!.id,
      recipeName: parsed.data.recipeName,
      calories: parsed.data.calories,
      consumedAt: parsed.data.consumedAt ? new Date(parsed.data.consumedAt) : new Date()
    });

    console.log(`[mealPlans] ✅ Meal consumed: ${parsed.data.recipeName} (${parsed.data.calories} cal)`);

    res.status(201).json(consumption);

  } catch (error: any) {
    console.error('[mealPlans] ❌ POST /consume error:', error);
    res.status(500).json({ 
      error: 'Failed to record meal consumption',
      message: error.message 
    });
  }
});

export default router;

