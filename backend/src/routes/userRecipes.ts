import { Router } from 'express';
import { UserRecipe } from '../models/UserRecipe.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import mongoose from 'mongoose';
import { upload, uploadToCloudinary, deleteFromCloudinary, isCloudinaryConfigured } from '../services/CloudinaryService.js';

const router = Router();

// GET /api/user-recipes
// Get all recipes for the logged-in user with optional filters
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { cuisine, diet, mealType, search, favorite } = req.query;
    
    console.log(`[user-recipes] 📋 GET / - User: ${userId}`);
    
    const query: any = { userId: new mongoose.Types.ObjectId(userId) };
    
    // Apply filters if provided
    if (cuisine) {
      query.cuisine = cuisine;
      console.log(`[user-recipes] Filter by cuisine: ${cuisine}`);
    }
    if (diet) {
      query.dietLabels = diet;
      console.log(`[user-recipes] Filter by diet: ${diet}`);
    }
    if (mealType) {
      query.mealType = mealType;
      console.log(`[user-recipes] Filter by mealType: ${mealType}`);
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
      console.log(`[user-recipes] Search: ${search}`);
    }
    if (favorite === 'true') {
      query.isFavorite = true;
      console.log(`[user-recipes] Filter favorites only`);
    }
    
    const recipes = await UserRecipe.find(query).sort({ createdAt: -1 });
    
    console.log(`[user-recipes] ✅ Found ${recipes.length} recipes`);
    res.json(recipes);
    
  } catch (error: any) {
    console.error('[user-recipes] ❌ Error fetching:', error);
    res.status(500).json({ error: 'Failed to fetch recipes', message: error.message });
  }
});

// GET /api/user-recipes/:id
// Get single recipe by ID
router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    console.log(`[user-recipes] 📖 GET /:id - Recipe: ${id}, User: ${userId}`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid recipe ID' });
    }
    
    const recipe = await UserRecipe.findOne({ 
      _id: new mongoose.Types.ObjectId(id), 
      userId: new mongoose.Types.ObjectId(userId) 
    });
    
    if (!recipe) {
      console.log(`[user-recipes] ❌ Recipe not found`);
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    console.log(`[user-recipes] ✅ Recipe found: ${recipe.name}`);
    res.json(recipe);
    
  } catch (error: any) {
    console.error('[user-recipes] ❌ Error fetching single:', error);
    res.status(500).json({ error: 'Failed to fetch recipe', message: error.message });
  }
});

// POST /api/user-recipes
// Create new recipe
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    
    console.log(`[user-recipes] ➕ POST / - User: ${userId}`);
    console.log(`[user-recipes] Recipe data:`, req.body);
    
    const recipeData = {
      ...req.body,
      userId: new mongoose.Types.ObjectId(userId)
    };
    
    // Validate required fields
    if (!recipeData.name || !recipeData.name.trim()) {
      return res.status(400).json({ error: 'Recipe name is required' });
    }
    
    if (!recipeData.ingredients || recipeData.ingredients.length === 0) {
      return res.status(400).json({ error: 'At least one ingredient is required' });
    }
    
    if (!recipeData.instructions || recipeData.instructions.length === 0) {
      return res.status(400).json({ error: 'At least one instruction step is required' });
    }
    
    // Filter out empty instructions
    recipeData.instructions = recipeData.instructions.filter((step: string) => step && step.trim().length > 0);
    
    if (recipeData.instructions.length === 0) {
      return res.status(400).json({ error: 'At least one non-empty instruction step is required' });
    }
    
    const recipe = await UserRecipe.create(recipeData);
    
    console.log(`[user-recipes] ✅ Recipe created: ${recipe.name} (${recipe._id})`);
    res.status(201).json({
      message: 'Recipe created successfully',
      recipe
    });
    
  } catch (error: any) {
    console.error('[user-recipes] ❌ Error creating:', error);
    res.status(500).json({ error: 'Failed to create recipe', message: error.message });
  }
});

// PUT /api/user-recipes/:id
// Update existing recipe
router.put('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    console.log(`[user-recipes] 🔄 PUT /:id - Recipe: ${id}, User: ${userId}`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid recipe ID' });
    }
    
    // Filter out empty instructions if provided
    if (req.body.instructions) {
      req.body.instructions = req.body.instructions.filter((step: string) => step && step.trim().length > 0);
    }
    
    const recipe = await UserRecipe.findOneAndUpdate(
      { 
        _id: new mongoose.Types.ObjectId(id), 
        userId: new mongoose.Types.ObjectId(userId) 
      },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!recipe) {
      console.log(`[user-recipes] ❌ Recipe not found for update`);
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    console.log(`[user-recipes] ✅ Recipe updated: ${recipe.name}`);
    res.json({
      message: 'Recipe updated successfully',
      recipe
    });
    
  } catch (error: any) {
    console.error('[user-recipes] ❌ Error updating:', error);
    res.status(500).json({ error: 'Failed to update recipe', message: error.message });
  }
});

// DELETE /api/user-recipes/:id
// Delete recipe
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    console.log(`[user-recipes] 🗑️ DELETE /:id - Recipe: ${id}, User: ${userId}`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid recipe ID' });
    }
    
    const recipe = await UserRecipe.findOneAndDelete({ 
      _id: new mongoose.Types.ObjectId(id), 
      userId: new mongoose.Types.ObjectId(userId) 
    });
    
    if (!recipe) {
      console.log(`[user-recipes] ❌ Recipe not found for deletion`);
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    console.log(`[user-recipes] ✅ Recipe deleted: ${recipe.name}`);
    res.json({ message: 'Recipe deleted successfully' });
    
  } catch (error: any) {
    console.error('[user-recipes] ❌ Error deleting:', error);
    res.status(500).json({ error: 'Failed to delete recipe', message: error.message });
  }
});

// PATCH /api/user-recipes/:id/favorite
// Toggle favorite status
router.patch('/:id/favorite', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    console.log(`[user-recipes] ⭐ PATCH /:id/favorite - Recipe: ${id}, User: ${userId}`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid recipe ID' });
    }
    
    const recipe = await UserRecipe.findOne({ 
      _id: new mongoose.Types.ObjectId(id), 
      userId: new mongoose.Types.ObjectId(userId) 
    });
    
    if (!recipe) {
      console.log(`[user-recipes] ❌ Recipe not found`);
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    recipe.isFavorite = !recipe.isFavorite;
    await recipe.save();
    
    console.log(`[user-recipes] ✅ Favorite toggled: ${recipe.isFavorite}`);
    res.json({
      message: recipe.isFavorite ? 'Added to favorites' : 'Removed from favorites',
      recipe
    });
    
  } catch (error: any) {
    console.error('[user-recipes] ❌ Error toggling favorite:', error);
    res.status(500).json({ error: 'Failed to update favorite status', message: error.message });
  }
});

// PATCH /api/user-recipes/:id/rating
// Update recipe rating
router.patch('/:id/rating', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = req.user!.id;
    
    console.log(`[user-recipes] ⭐ PATCH /:id/rating - Recipe: ${id}, Rating: ${rating}, User: ${userId}`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid recipe ID' });
    }
    
    if (rating !== null && rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    const recipe = await UserRecipe.findOneAndUpdate(
      { 
        _id: new mongoose.Types.ObjectId(id), 
        userId: new mongoose.Types.ObjectId(userId) 
      },
      { rating: rating === null ? undefined : rating }, // Set to undefined to remove rating
      { new: true, runValidators: true }
    );
    
    if (!recipe) {
      console.log(`[user-recipes] ❌ Recipe not found`);
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    console.log(`[user-recipes] ✅ Rating updated: ${recipe.rating}`);
    res.json({
      message: rating ? 'Rating updated successfully' : 'Rating removed',
      recipe
    });
    
  } catch (error: any) {
    console.error('[user-recipes] ❌ Error updating rating:', error);
    res.status(500).json({ error: 'Failed to update rating', message: error.message });
  }
});

// POST /api/user-recipes/:id/image
// Upload recipe image
router.post('/:id/image', requireAuth, upload.single('image'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    console.log(`[user-recipes] 📸 POST /:id/image - Recipe: ${id}, User: ${userId}`);
    
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({ error: 'Image upload is not configured. Please set Cloudinary credentials.' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid recipe ID' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    // Find the recipe
    const recipe = await UserRecipe.findOne({ 
      _id: new mongoose.Types.ObjectId(id), 
      userId: new mongoose.Types.ObjectId(userId) 
    });
    
    if (!recipe) {
      console.log(`[user-recipes] ❌ Recipe not found`);
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    // Delete old image if exists
    if (recipe.imagePublicId) {
      try {
        await deleteFromCloudinary(recipe.imagePublicId);
        console.log(`[user-recipes] 🗑️ Old image deleted: ${recipe.imagePublicId}`);
      } catch (error) {
        console.error('[user-recipes] ⚠️ Failed to delete old image:', error);
        // Continue anyway
      }
    }
    
    // Upload new image
    const { url, publicId } = await uploadToCloudinary(req.file);
    
    // Update recipe with new image
    recipe.image = url;
    recipe.imagePublicId = publicId;
    await recipe.save();
    
    console.log(`[user-recipes] ✅ Image uploaded: ${url}`);
    res.json({
      message: 'Image uploaded successfully',
      recipe
    });
    
  } catch (error: any) {
    console.error('[user-recipes] ❌ Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image', message: error.message });
  }
});

// DELETE /api/user-recipes/:id/image
// Delete recipe image
router.delete('/:id/image', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    console.log(`[user-recipes] 🗑️ DELETE /:id/image - Recipe: ${id}, User: ${userId}`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid recipe ID' });
    }
    
    const recipe = await UserRecipe.findOne({ 
      _id: new mongoose.Types.ObjectId(id), 
      userId: new mongoose.Types.ObjectId(userId) 
    });
    
    if (!recipe) {
      console.log(`[user-recipes] ❌ Recipe not found`);
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    if (!recipe.imagePublicId) {
      return res.status(404).json({ error: 'Recipe has no image to delete' });
    }
    
    // Delete from Cloudinary
    if (isCloudinaryConfigured()) {
      try {
        await deleteFromCloudinary(recipe.imagePublicId);
        console.log(`[user-recipes] ✅ Image deleted from Cloudinary: ${recipe.imagePublicId}`);
      } catch (error) {
        console.error('[user-recipes] ⚠️ Failed to delete from Cloudinary:', error);
        // Continue anyway to remove from DB
      }
    }
    
    // Remove from recipe
    recipe.image = undefined;
    recipe.imagePublicId = undefined;
    await recipe.save();
    
    res.json({
      message: 'Image deleted successfully',
      recipe
    });
    
  } catch (error: any) {
    console.error('[user-recipes] ❌ Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image', message: error.message });
  }
});

export default router;

