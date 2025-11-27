import { Router } from 'express';
import mongoose from 'mongoose';
import { SharedRecipe } from '../models/SharedRecipe.js';
import { UserRecipe } from '../models/UserRecipe.js';
import { User } from '../models/User.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { notificationService } from '../services/notificationService.js';

const router = Router();

// GET /api/shared-recipes/received
// Get all recipes shared with the current user
router.get('/received', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { status } = req.query;

    const query: any = { sharedWithUserId: new mongoose.Types.ObjectId(userId) };
    if (status) {
      query.status = status;
    }

    const sharedRecipes = await SharedRecipe.find(query)
      .populate({
        path: 'recipeId',
        select: '-__v'
      })
      .populate({
        path: 'ownerId',
        select: 'name email'
      })
      .sort({ sharedAt: -1 });

    // Filter out any shares where the recipe no longer exists
    const validShares = sharedRecipes.filter(share => share.recipeId != null);

    res.json(validShares);
  } catch (error: any) {
    console.error('[shared-recipes] Error fetching received:', error);
    res.status(500).json({ error: 'Failed to fetch shared recipes' });
  }
});

// GET /api/shared-recipes/sent
// Get all recipes the current user has shared with others
router.get('/sent', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const sharedRecipes = await SharedRecipe.find({
      ownerId: new mongoose.Types.ObjectId(userId)
    })
      .populate({
        path: 'recipeId',
        select: 'name image description'
      })
      .populate({
        path: 'sharedWithUserId',
        select: 'name email'
      })
      .sort({ sharedAt: -1 });

    res.json(sharedRecipes);
  } catch (error: any) {
    console.error('[shared-recipes] Error fetching sent:', error);
    res.status(500).json({ error: 'Failed to fetch sent shares' });
  }
});

// GET /api/shared-recipes/recipe/:recipeId
// Get recipe details for a shared recipe (if user has access)
// IMPORTANT: This route must come BEFORE the /:id routes to avoid conflicts
router.get('/recipe/:recipeId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { recipeId } = req.params;

    console.log(`[shared-recipes] 📖 GET /recipe/:recipeId - Recipe: ${recipeId}, User: ${userId}`);

    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({ error: 'Invalid recipe ID' });
    }

    // Check if user has access to this recipe (either owns it or it's shared with them)
    const recipeObjectId = new mongoose.Types.ObjectId(recipeId);
    
    // Check if user owns the recipe
    const ownedRecipe = await UserRecipe.findOne({
      _id: recipeObjectId,
      userId: new mongoose.Types.ObjectId(userId)
    });

    if (ownedRecipe) {
      console.log(`[shared-recipes] ✅ User owns this recipe`);
      return res.json(ownedRecipe);
    }

    // Check if recipe is shared with user (and accepted)
    const sharedRecipe = await SharedRecipe.findOne({
      recipeId: recipeObjectId,
      sharedWithUserId: new mongoose.Types.ObjectId(userId),
      status: 'accepted'
    }).populate('recipeId');

    if (!sharedRecipe || !sharedRecipe.recipeId) {
      console.log(`[shared-recipes] ❌ Recipe not found or not accessible`);
      return res.status(404).json({ error: 'Recipe not found or you do not have access to it' });
    }

    console.log(`[shared-recipes] ✅ Recipe found via share: ${sharedRecipe.recipeId.name}`);
    res.json(sharedRecipe.recipeId);
  } catch (error: any) {
    console.error('[shared-recipes] Error fetching recipe:', error);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// POST /api/shared-recipes/share
// Share a recipe with another user
router.post('/share', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { recipeId, userEmail, message } = req.body;

    // Validate inputs
    if (!recipeId || !userEmail) {
      return res.status(400).json({ error: 'Recipe ID and user email are required' });
    }

    // Check if recipe exists and belongs to the user
    const recipe = await UserRecipe.findOne({
      _id: new mongoose.Types.ObjectId(recipeId),
      userId: new mongoose.Types.ObjectId(userId)
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found or you do not have permission to share it' });
    }

    // Find the user to share with
    const targetUser = await User.findOne({ email: userEmail.toLowerCase().trim() });
    if (!targetUser) {
      return res.status(404).json({ error: `User with email ${userEmail} not found` });
    }

    // Check if trying to share with self
    if (targetUser._id.toString() === userId) {
      return res.status(400).json({ error: 'Cannot share recipe with yourself' });
    }

    // Check if already shared
    const existingShare = await SharedRecipe.findOne({
      recipeId: new mongoose.Types.ObjectId(recipeId),
      sharedWithUserId: targetUser._id
    });

    if (existingShare) {
      return res.status(400).json({ error: `Recipe already shared with ${userEmail}` });
    }

    // Create the share
    const share = await SharedRecipe.create({
      recipeId: new mongoose.Types.ObjectId(recipeId),
      ownerId: new mongoose.Types.ObjectId(userId),
      sharedWithUserId: targetUser._id,
      message: message || '',
      status: 'pending'
    });

    // Increment share count
    recipe.shareCount = (recipe.shareCount || 0) + 1;
    await recipe.save();

    // Populate the share before returning
    await share.populate([
      { path: 'recipeId', select: 'name image description' },
      { path: 'sharedWithUserId', select: 'name email' }
    ]);

    // Create notification for the recipient
    try {
      const currentUser = await User.findById(userId);
      await notificationService.notifyRecipeShared(
        targetUser._id,
        recipeId,
        recipe.name,
        currentUser?.name || 'Someone',
        share._id.toString()
      );
    } catch (notifError) {
      console.error('[shared-recipes] Failed to create notification:', notifError);
      // Don't fail the request if notification fails
    }

    res.status(201).json({
      message: `Recipe shared with ${targetUser.name || userEmail} successfully`,
      share
    });
  } catch (error: any) {
    console.error('[shared-recipes] Error sharing recipe:', error);
    res.status(500).json({ error: 'Failed to share recipe' });
  }
});

// PATCH /api/shared-recipes/:id/status
// Update the status of a shared recipe (accept/reject)
router.patch('/:id/status', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be either "accepted" or "rejected"' });
    }

    const share = await SharedRecipe.findOne({
      _id: new mongoose.Types.ObjectId(id),
      sharedWithUserId: new mongoose.Types.ObjectId(userId)
    });

    if (!share) {
      return res.status(404).json({ error: 'Shared recipe not found' });
    }

    share.status = status;
    await share.save();

    await share.populate([
      { path: 'recipeId', select: '-__v' },
      { path: 'ownerId', select: 'name email' }
    ]);

    // Notify the recipe owner about the status change
    try {
      const currentUser = await User.findById(userId);
      const recipe = share.recipeId as any;
      await notificationService.notifyShareStatus(
        share.ownerId,
        recipe.name,
        currentUser?.name || 'Someone',
        status as 'accepted' | 'rejected'
      );
    } catch (notifError) {
      console.error('[shared-recipes] Failed to create notification:', notifError);
      // Don't fail the request if notification fails
    }

    res.json({
      message: `Recipe ${status === 'accepted' ? 'accepted' : 'rejected'} successfully`,
      share
    });
  } catch (error: any) {
    console.error('[shared-recipes] Error updating status:', error);
    res.status(500).json({ error: 'Failed to update share status' });
  }
});

// DELETE /api/shared-recipes/:id
// Delete a share (revoke access)
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Allow deletion if user is either the owner or the recipient
    const share = await SharedRecipe.findOne({
      _id: new mongoose.Types.ObjectId(id),
      $or: [
        { ownerId: new mongoose.Types.ObjectId(userId) },
        { sharedWithUserId: new mongoose.Types.ObjectId(userId) }
      ]
    });

    if (!share) {
      return res.status(404).json({ error: 'Shared recipe not found' });
    }

    await SharedRecipe.deleteOne({ _id: share._id });

    // Decrement share count if owner is deleting
    if (share.ownerId.toString() === userId) {
      await UserRecipe.updateOne(
        { _id: share.recipeId },
        { $inc: { shareCount: -1 } }
      );
    }

    res.json({ message: 'Share removed successfully' });
  } catch (error: any) {
    console.error('[shared-recipes] Error deleting share:', error);
    res.status(500).json({ error: 'Failed to delete share' });
  }
});

// GET /api/shared-recipes/users/search
// Search for users by email (to share recipes with)
router.get('/users/search', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== 'string' || email.length < 3) {
      return res.status(400).json({ error: 'Email query must be at least 3 characters' });
    }

    const users = await User.find({
      email: { $regex: email, $options: 'i' },
      _id: { $ne: new mongoose.Types.ObjectId(req.user!.id) } // Exclude self
    })
      .select('name email')
      .limit(10);

    res.json(users);
  } catch (error: any) {
    console.error('[shared-recipes] Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

export default router;

