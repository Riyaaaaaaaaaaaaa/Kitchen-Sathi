import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { edamamService } from '../services/EdamamService.js';
import { SavedRecipe } from '../models/SavedRecipe.js';
import { GroceryItem } from '../models/GroceryItem.js';

const router = Router();

// GET /api/recipes/suggestions - Get recipe suggestions based on user's grocery list
router.get('/suggestions', requireAuth, async (req: AuthRequest, res) => {
  try {
    console.log(`[recipes] 🍳 GET /suggestions - User: ${req.user!.id}`);

    const { diet, maxCalories, cuisine, type, maxReadyTime, limit } = req.query;

    // Get user's grocery items - ONLY BOUGHT/COMPLETED items (not pending or used)
    const groceryItems = await GroceryItem.find({
      userId: req.user!.id,
      status: 'completed' // Only items user has bought
    });

    console.log(`[recipes] Found ${groceryItems.length} BOUGHT grocery items for user`);

    // Extract ingredient names from bought items only
    const ingredients = groceryItems.map(item => item.name.toLowerCase());

    if (ingredients.length === 0) {
      // No bought ingredients - return general recipes based on filters
      console.log(`[recipes] No bought ingredients found, fetching general recipes`);
      
      const result = await edamamService.searchRecipes({
        query: 'meal', // Default query
        diet: diet as string,
        cuisineType: cuisine as string,
        mealType: type as string,
        maxCalories: maxCalories ? Number(maxCalories) : undefined,
        maxTime: maxReadyTime ? Number(maxReadyTime) : undefined,
        from: 0,
        to: Number(limit) || 20
      });

      return res.json({
        recipes: result.recipes,
        matchType: 'general',
        userIngredients: []
      });
    }

    console.log(`[recipes] Using bought ingredients: ${ingredients.join(', ')}`);

    // Get recipe suggestions based on bought ingredients
    const result = await edamamService.getRecipeSuggestions(
      ingredients,
      {
        diet: diet as string,
        cuisineType: cuisine as string,
        mealType: type as string,
        maxCalories: maxCalories ? Number(maxCalories) : undefined,
        maxTime: maxReadyTime ? Number(maxReadyTime) : undefined,
        limit: Number(limit) || 20
      }
    );

    console.log(`[recipes] Returning ${result.recipes.length} recipe suggestions`);

    res.json({
      recipes: result.recipes,
      matchType: result.matchType,
      userIngredients: result.userIngredients
    });

  } catch (error: any) {
    console.error('[recipes] ❌ GET /suggestions error:', error);
    res.status(500).json({ 
      error: 'Failed to get recipe suggestions',
      message: error.message 
    });
  }
});

// POST /api/recipes/search - Advanced recipe search with all filters
router.post('/search', requireAuth, async (req: AuthRequest, res) => {
  try {
    console.log(`[recipes] 🔍 POST /search - User: ${req.user!.id}`);
    console.log(`[recipes] Search params:`, req.body);

    const {
      query,
      diet,
      maxCalories,
      cuisine,
      type,
      maxReadyTime,
      number,
      offset,
      useMyIngredients
    } = req.body;

    let ingredients: string[] = [];

    // Optionally include user's BOUGHT grocery items in search
    if (useMyIngredients) {
      const groceryItems = await GroceryItem.find({
        userId: req.user!.id,
        status: 'completed' // Only bought items
      });
      ingredients = groceryItems.map(item => item.name.toLowerCase());
      console.log(`[recipes] Including user's ${ingredients.length} BOUGHT ingredients in search`);
    }

    const result = await edamamService.searchRecipes({
      query,
      ingredients: ingredients.length > 0 ? ingredients : undefined,
      diet,
      cuisineType: cuisine,
      mealType: type,
      maxCalories: maxCalories ? Number(maxCalories) : undefined,
      maxTime: maxReadyTime ? Number(maxReadyTime) : undefined,
      from: offset ? Number(offset) : 0,
      to: (offset ? Number(offset) : 0) + (number ? Number(number) : 20)
    });

    console.log(`[recipes] Search returned ${result.recipes.length} recipes`);

    res.json({
      recipes: result.recipes,
      totalResults: result.totalResults,
      searchParams: { query, diet, cuisine, type, useMyIngredients }
    });

  } catch (error: any) {
    console.error('[recipes] ❌ POST /search error:', error);
    res.status(500).json({ 
      error: 'Failed to search recipes',
      message: error.message 
    });
  }
});

// GET /api/recipes/:id - Get detailed recipe information
router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const recipeId = req.params.id;
    console.log(`[recipes] 📖 GET /:id - Recipe: ${recipeId}, User: ${req.user!.id}`);

    // Check if it's a legacy Spoonacular ID (numeric only)
    if (/^\d+$/.test(recipeId)) {
      console.log(`[recipes] ⚠️  Legacy Spoonacular ID detected: ${recipeId}`);
      return res.status(410).json({
        error: 'Legacy recipe ID',
        message: 'This recipe was saved from our previous system and is no longer available. Please delete it and save new recipes from Edamam.',
        isLegacy: true,
        recipeId: recipeId
      });
    }

    // Reconstruct URI if needed
    const recipeUri = recipeId.startsWith('http') 
      ? recipeId 
      : `http://www.edamam.com/ontologies/edamam.owl#recipe_${recipeId}`;

    const recipeDetails = await edamamService.getRecipeDetails(recipeUri);

    console.log(`[recipes] Retrieved details for: ${recipeDetails.title}`);

    res.json(recipeDetails);

  } catch (error: any) {
    console.error('[recipes] ❌ GET /:id error:', error);
    res.status(500).json({ 
      error: 'Failed to get recipe details',
      message: error.message 
    });
  }
});

// GET /api/recipes/saved/list - Get user's saved recipes
router.get('/saved/list', requireAuth, async (req: AuthRequest, res) => {
  try {
    console.log(`[recipes] 💾 GET /saved/list - User: ${req.user!.id}`);

    const savedRecipes = await SavedRecipe.find({ userId: req.user!.id })
      .sort({ savedAt: -1 });

    console.log(`[recipes] Found ${savedRecipes.length} saved recipes`);

    // Check for legacy recipes (numeric IDs from Spoonacular)
    const legacyCount = savedRecipes.filter(r => /^\d+$/.test(r.recipeId)).length;
    if (legacyCount > 0) {
      console.log(`[recipes] ⚠️  Found ${legacyCount} legacy Spoonacular recipes`);
    }

    res.json(savedRecipes);

  } catch (error: any) {
    console.error('[recipes] ❌ GET /saved/list error:', error);
    res.status(500).json({ 
      error: 'Failed to get saved recipes',
      message: error.message 
    });
  }
});

// DELETE /api/recipes/saved/cleanup-legacy - Remove legacy Spoonacular recipes
router.delete('/saved/cleanup-legacy', requireAuth, async (req: AuthRequest, res) => {
  try {
    console.log(`[recipes] 🧹 DELETE /saved/cleanup-legacy - User: ${req.user!.id}`);

    // Delete saved recipes with numeric IDs (Spoonacular format)
    const result = await SavedRecipe.deleteMany({
      userId: req.user!.id,
      recipeId: /^\d+$/ // Matches only numeric IDs
    });

    console.log(`[recipes] ✅ Removed ${result.deletedCount} legacy saved recipes`);

    res.json({ 
      message: 'Legacy recipes cleaned up successfully',
      removed: result.deletedCount 
    });

  } catch (error: any) {
    console.error('[recipes] ❌ DELETE /saved/cleanup-legacy error:', error);
    res.status(500).json({ 
      error: 'Cleanup failed',
      message: error.message 
    });
  }
});

// POST /api/recipes/saved - Save a recipe
router.post('/saved', requireAuth, async (req: AuthRequest, res) => {
  try {
    console.log(`[recipes] 💾 POST /saved - User: ${req.user!.id}`);

    const saveSchema = z.object({
      recipeId: z.union([z.number(), z.string()]), // Accept both for compatibility
      title: z.string(),
      image: z.string(),
      servings: z.number().optional(),
      readyInMinutes: z.number().optional(),
      sourceUrl: z.string().optional(),
      summary: z.string().optional(),
      cuisines: z.array(z.string()).optional(),
      diets: z.array(z.string()).optional(),
      notes: z.string().optional(),
      rating: z.number().min(1).max(5).optional()
    });

    const parsed = saveSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    // Convert recipeId to string for Edamam compatibility
    const recipeIdStr = String(parsed.data.recipeId);

    // Check if already saved
    const existing = await SavedRecipe.findOne({
      userId: req.user!.id,
      recipeId: recipeIdStr
    });

    if (existing) {
      return res.status(400).json({ error: 'Recipe already saved' });
    }

    const savedRecipe = await SavedRecipe.create({
      userId: req.user!.id,
      recipeId: recipeIdStr,
      title: parsed.data.title,
      image: parsed.data.image,
      servings: parsed.data.servings || 1,
      readyInMinutes: parsed.data.readyInMinutes || 0,
      sourceUrl: parsed.data.sourceUrl,
      summary: parsed.data.summary,
      cuisines: parsed.data.cuisines || [],
      diets: parsed.data.diets || [],
      notes: parsed.data.notes,
      rating: parsed.data.rating
    });

    console.log(`[recipes] Saved recipe: ${savedRecipe.title}`);

    res.status(201).json(savedRecipe);

  } catch (error: any) {
    console.error('[recipes] ❌ POST /saved error:', error);
    res.status(500).json({ 
      error: 'Failed to save recipe',
      message: error.message 
    });
  }
});

// DELETE /api/recipes/saved/:recipeId - Remove a saved recipe
router.delete('/saved/:recipeId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const recipeId = req.params.recipeId;
    console.log(`[recipes] 🗑️  DELETE /saved/:recipeId - Recipe: ${recipeId}, User: ${req.user!.id}`);

    const deleted = await SavedRecipe.findOneAndDelete({
      userId: req.user!.id,
      recipeId: recipeId
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Saved recipe not found' });
    }

    console.log(`[recipes] Deleted saved recipe: ${deleted.title}`);

    res.status(204).send();

  } catch (error: any) {
    console.error('[recipes] ❌ DELETE /saved/:recipeId error:', error);
    res.status(500).json({ 
      error: 'Failed to delete saved recipe',
      message: error.message 
    });
  }
});

// PATCH /api/recipes/saved/:recipeId - Update saved recipe (notes, rating)
router.patch('/saved/:recipeId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const recipeId = req.params.recipeId;
    console.log(`[recipes] ✏️  PATCH /saved/:recipeId - Recipe: ${recipeId}, User: ${req.user!.id}`);

    const updateSchema = z.object({
      notes: z.string().optional(),
      rating: z.number().min(1).max(5).optional()
    });

    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const updated = await SavedRecipe.findOneAndUpdate(
      { userId: req.user!.id, recipeId: recipeId },
      parsed.data,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Saved recipe not found' });
    }

    console.log(`[recipes] Updated saved recipe: ${updated.title}`);

    res.json(updated);

  } catch (error: any) {
    console.error('[recipes] ❌ PATCH /saved/:recipeId error:', error);
    res.status(500).json({ 
      error: 'Failed to update saved recipe',
      message: error.message 
    });
  }
});

export default router;
