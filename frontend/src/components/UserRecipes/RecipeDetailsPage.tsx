import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserRecipe, deleteUserRecipe, toggleUserRecipeFavorite, updateUserRecipeRating, UserRecipe } from '../../lib/userRecipesApi';
import { addGroceryItem } from '../../lib/api';
import { UserAvatar } from '../UserAvatar';
import { StarRating } from '../StarRating';
import { ShareRecipeModal } from './ShareRecipeModal';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../Toast';

export function RecipeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [recipe, setRecipe] = useState<UserRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [addingToGrocery, setAddingToGrocery] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRecipe(id);
    }
  }, [id]);

  const fetchRecipe = async (recipeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserRecipe(recipeId);
      setRecipe(data);
    } catch (err: any) {
      console.error('Error fetching recipe:', err);
      setError(err.message || 'Failed to load recipe');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!recipe) return;

    try {
      await deleteUserRecipe(recipe._id);
      success(`Recipe "${recipe.name}" deleted successfully`);
      navigate('/my-recipes');
    } catch (err: any) {
      console.error('Error deleting recipe:', err);
      showError(err.message || 'Failed to delete recipe');
      setShowDeleteModal(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!recipe) return;

    try {
      const result = await toggleUserRecipeFavorite(recipe._id);
      success(result.message);
      setRecipe(result.recipe);
    } catch (err: any) {
      console.error('Error toggling favorite:', err);
      showError(err.message || 'Failed to update favorite');
    }
  };

  const handleRatingChange = async (newRating: number | null) => {
    if (!recipe) return;

    try {
      const result = await updateUserRecipeRating(recipe._id, newRating);
      success(newRating ? `Rated ${newRating} stars` : 'Rating removed');
      setRecipe(result.recipe);
    } catch (err: any) {
      console.error('Error updating rating:', err);
      showError(err.message || 'Failed to update rating');
    }
  };

  const handleAddToGroceryList = async () => {
    if (!recipe) return;

    try {
      setAddingToGrocery(true);
      
      // First, fetch existing grocery items
      const { getGroceryList } = await import('../../lib/api');
      const existingItems = await getGroceryList();
      
      // Create a map of existing items (lowercase name for case-insensitive comparison)
      // Only include items that are pending or completed (skip used items - they can be re-added)
      const existingItemsMap = new Map(
        existingItems
          .filter(item => item.status === 'pending' || item.status === 'completed')
          .map(item => [item.name.toLowerCase().trim(), item])
      );
      
      let addedCount = 0;
      let skippedCount = 0;
      let failedCount = 0;

      for (const ingredient of recipe.ingredients) {
        const ingredientNameLower = ingredient.name.toLowerCase().trim();
        
        // Skip if already in list as pending or completed (but not if it's used)
        if (existingItemsMap.has(ingredientNameLower)) {
          console.log(`Skipping ${ingredient.name} - already in grocery list (pending or completed)`);
          skippedCount++;
          continue;
        }
        
        try {
          // Parse quantity string to number (e.g., "2", "1.5", "1/2")
          let quantityNum = 1; // Default quantity
          if (ingredient.quantity) {
            const qtyStr = ingredient.quantity.trim();
            // Handle fractions like "1/2"
            if (qtyStr.includes('/')) {
              const [num, denom] = qtyStr.split('/').map(s => parseFloat(s.trim()));
              quantityNum = num / denom;
            } else {
              const parsed = parseFloat(qtyStr);
              quantityNum = isNaN(parsed) ? 1 : parsed;
            }
          }

          await addGroceryItem({
            name: ingredient.name,
            quantity: quantityNum,
            unit: ingredient.unit || '',
            status: 'pending'
          });
          addedCount++;
        } catch (err) {
          console.error(`Failed to add ${ingredient.name}:`, err);
          failedCount++;
        }
      }

      // Show appropriate message
      if (addedCount > 0) {
        success(`Added ${addedCount} ingredient${addedCount > 1 ? 's' : ''} to grocery list!`);
      }
      if (skippedCount > 0) {
        success(`Skipped ${skippedCount} ingredient${skippedCount > 1 ? 's' : ''} already in list`);
      }
      if (failedCount > 0) {
        showError(`Failed to add ${failedCount} ingredient${failedCount > 1 ? 's' : ''}`);
      }
      if (addedCount === 0 && skippedCount === 0 && failedCount === 0) {
        showError('No ingredients to add');
      }
    } catch (err: any) {
      console.error('Error adding ingredients to grocery list:', err);
      showError('Failed to add ingredients to grocery list');
    } finally {
      setAddingToGrocery(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-600 mb-4">{error || 'Recipe not found'}</p>
          <button
            onClick={() => navigate('/my-recipes')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Back to My Recipes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/my-recipes')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Back to my recipes"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex-1 flex flex-col items-center justify-center">
              <h1 className="text-2xl font-bold text-gray-900">📖 Recipe Details</h1>
            </div>
            
            <UserAvatar size="md" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Recipe Image */}
        {recipe.image && (
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden mb-6">
            <img
              src={recipe.image}
              alt={recipe.name}
              className="w-full h-96 object-cover"
            />
          </div>
        )}

        {/* Recipe Header */}
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{recipe.name}</h2>
              {recipe.description && (
                <p className="text-gray-600 text-lg">{recipe.description}</p>
              )}
            </div>
            <button
              onClick={handleToggleFavorite}
              className="flex-shrink-0 ml-4 text-3xl hover:scale-110 transition-transform"
              aria-label={recipe.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {recipe.isFavorite ? '⭐' : '☆'}
            </button>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-3 mb-4">
            {recipe.cookingTime && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium">
                🕐 {recipe.cookingTime} minutes
              </span>
            )}
            {recipe.servings && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg font-medium">
                👥 {recipe.servings} servings
              </span>
            )}
            {recipe.cuisine && (
              <span className="px-4 py-2 bg-orange-50 text-orange-700 rounded-lg font-medium">
                {recipe.cuisine}
              </span>
            )}
            {recipe.mealType && (
              <span className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg font-medium capitalize">
                {recipe.mealType}
              </span>
            )}
          </div>

          {/* Diet Labels */}
          {recipe.dietLabels.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {recipe.dietLabels.map((diet) => (
                <span
                  key={diet}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                >
                  {diet}
                </span>
              ))}
            </div>
          )}

          {/* Rating */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating
            </label>
            <StarRating
              rating={recipe.rating}
              onRate={handleRatingChange}
              size="lg"
              showLabel
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-gray-200 no-print">
            {/* Add to Grocery List & Print */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToGroceryList}
                disabled={addingToGrocery}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingToGrocery ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Add to Grocery List
                  </>
                )}
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Recipe
              </button>
            </div>

            {/* Share Recipe */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowShareModal(true)}
                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share Recipe
              </button>
            </div>

            {/* Edit & Delete */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/my-recipes/${recipe._id}/edit`)}
                className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Recipe
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            🥘 Ingredients
          </h3>
          <div className="space-y-3">
            {recipe.ingredients.map((ingredient, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                <span className="font-medium text-gray-900">{ingredient.name}</span>
                {(ingredient.quantity || ingredient.unit) && (
                  <span className="text-gray-600">
                    {ingredient.quantity} {ingredient.unit}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            👨‍🍳 Instructions
          </h3>
          <div className="space-y-4">
            {recipe.instructions.map((instruction, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 pt-2">
                  <p className="text-gray-700 leading-relaxed">{instruction}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        {recipe.tags.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-orange-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recipe Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Created: {new Date(recipe.createdAt).toLocaleDateString()}</p>
          {recipe.updatedAt !== recipe.createdAt && (
            <p>Last updated: {new Date(recipe.updatedAt).toLocaleDateString()}</p>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && recipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Recipe</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <span className="font-semibold">"{recipe.name}"</span>?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Recipe Modal */}
      {recipe && (
        <ShareRecipeModal
          isOpen={showShareModal}
          recipeId={recipe._id}
          recipeName={recipe.name}
          onClose={() => setShowShareModal(false)}
          onSuccess={() => {
            success('Recipe shared successfully!');
            setShowShareModal(false);
          }}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default RecipeDetailsPage;

