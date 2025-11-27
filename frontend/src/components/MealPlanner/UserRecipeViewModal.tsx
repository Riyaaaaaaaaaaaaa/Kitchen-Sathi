import React, { useState, useEffect } from 'react';
import { getUserRecipe, UserRecipe, updateUserRecipeRating } from '../../lib/userRecipesApi';
import { addGroceryItem } from '../../lib/api';
import { StarRating } from '../StarRating';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../Toast';

interface UserRecipeViewModalProps {
  recipeId?: string;  // Optional - used when need to fetch recipe
  recipe?: UserRecipe;  // Optional - used when recipe is already loaded
  isOpen: boolean;
  onClose: () => void;
}

export function UserRecipeViewModal({ recipeId, recipe: initialRecipe, isOpen, onClose }: UserRecipeViewModalProps) {
  const [recipe, setRecipe] = useState<UserRecipe | null>(initialRecipe || null);
  const [loading, setLoading] = useState(!initialRecipe);  // Only load if recipe not provided
  const [error, setError] = useState<string | null>(null);
  const [addingToGrocery, setAddingToGrocery] = useState(false);
  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    // If recipe is provided directly, use it
    if (initialRecipe) {
      setRecipe(initialRecipe);
      setLoading(false);
      return;
    }
    
    // Otherwise, fetch it using recipeId
    if (recipeId) {
      loadRecipe();
    }
  }, [recipeId, initialRecipe]);

  const loadRecipe = async () => {
    if (!recipeId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Extract the actual MongoDB ID from the prefixed ID
      let actualId = recipeId.replace('user_', '').replace('user-recipe-', '');
      console.log('Loading user recipe:', actualId);
      
      try {
        // First try to fetch as owned recipe
        const data = await getUserRecipe(actualId);
        setRecipe(data);
      } catch (firstError: any) {
        console.log('Not found as owned recipe, trying shared recipes API...');
        // If that fails, try to fetch as shared recipe
        const { getSharedRecipeByRecipeId } = await import('../../lib/sharedRecipesApi');
        const data = await getSharedRecipeByRecipeId(actualId);
        setRecipe(data);
      }
    } catch (err: any) {
      console.error('Failed to load user recipe:', err);
      setError(err.message || 'Failed to load recipe details');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = async (newRating: number | null) => {
    if (!recipe) return;

    try {
      const actualId = recipeId.replace('user_', '');
      const result = await updateUserRecipeRating(actualId, newRating);
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

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <span className="ml-4 text-gray-600">Loading recipe...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">😞</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Recipe</h3>
            <p className="text-gray-600 mb-6">{error || 'Recipe not found'}</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-t-xl z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl">🍳</span>
                <h2 className="text-2xl font-bold">{recipe.name}</h2>
              </div>
              {recipe.description && (
                <p className="text-orange-100 text-sm">{recipe.description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Recipe Metadata */}
          <div className="flex flex-wrap gap-4 mt-4">
            {recipe.cookingTime && (
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">{recipe.cookingTime} min</span>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.146-1.28-.423-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.146-1.28.423-1.857m0 0a5.002 5.002 0 019.154 0" />
                </svg>
                <span className="text-sm font-medium">{recipe.servings} servings</span>
              </div>
            )}
            {recipe.cuisine && (
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                <span className="text-sm font-medium">{recipe.cuisine}</span>
              </div>
            )}
            {recipe.mealType && (
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                <span className="text-sm font-medium capitalize">{recipe.mealType}</span>
              </div>
            )}
          </div>

          {/* Diet Labels */}
          {recipe.dietLabels && recipe.dietLabels.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {recipe.dietLabels.map((label) => (
                <span
                  key={label}
                  className="px-2 py-1 bg-green-500/30 text-white text-xs rounded-full font-medium"
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Recipe Image */}
          {recipe.image && (
            <div className="w-full overflow-hidden rounded-lg">
              <img
                src={recipe.image}
                alt={recipe.name}
                className="w-full h-80 object-cover"
              />
            </div>
          )}

          {/* Rating */}
          <div className="bg-orange-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating
            </label>
            <StarRating
              rating={recipe.rating}
              onRate={handleRatingChange}
              size="md"
              showLabel
            />
          </div>

          {/* Ingredients */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">🥘</span>
              Ingredients
            </h3>
            <div className="bg-orange-50 rounded-lg p-6">
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-gray-800">
                      <span className="font-semibold">{ingredient.name}</span>
                      {ingredient.quantity && ingredient.unit && (
                        <span className="text-gray-600"> - {ingredient.quantity} {ingredient.unit}</span>
                      )}
                      {ingredient.quantity && !ingredient.unit && (
                        <span className="text-gray-600"> - {ingredient.quantity}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">👨‍🍳</span>
              Instructions
            </h3>
            <div className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800 leading-relaxed">{instruction}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>Created: {new Date(recipe.createdAt).toLocaleDateString()}</p>
            {recipe.updatedAt !== recipe.createdAt && (
              <p className="mt-1">Last updated: {new Date(recipe.updatedAt).toLocaleDateString()}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-xl no-print">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Add to Grocery List Button */}
            <button
              onClick={handleAddToGroceryList}
              disabled={addingToGrocery}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Recipe
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

