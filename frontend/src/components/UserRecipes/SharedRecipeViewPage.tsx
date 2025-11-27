import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReceivedShares, SharedRecipe } from '../../lib/sharedRecipesApi';
import { addGroceryItem, getGroceryList } from '../../lib/api';
import { addMealPlan } from '../../lib/mealPlanApi';
import { UserAvatar } from '../UserAvatar';
import { StarRating } from '../StarRating';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../Toast';

export function SharedRecipeViewPage() {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const { toasts, removeToast, success, error: showError } = useToast();
  
  const [share, setShare] = useState<SharedRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToGrocery, setAddingToGrocery] = useState(false);
  const [addingToMealPlan, setAddingToMealPlan] = useState(false);
  const [showMealTypeModal, setShowMealTypeModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');

  useEffect(() => {
    fetchShare();
  }, [shareId]);

  const fetchShare = async () => {
    try {
      setLoading(true);
      setError(null);

      const shares = await getReceivedShares();
      const foundShare = shares.find(s => s._id === shareId);

      if (!foundShare) {
        setError('Shared recipe not found');
        return;
      }

      setShare(foundShare);
    } catch (err: any) {
      console.error('Error fetching shared recipe:', err);
      setError(err.message || 'Failed to load shared recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToGroceryList = async () => {
    if (!share?.recipeId || addingToGrocery) return;

    try {
      setAddingToGrocery(true);
      const ingredients = share.recipeId.ingredients;

      // First, get existing grocery items to check for duplicates
      const existingItems = await getGroceryList();
      const existingItemNames = new Set(
        existingItems.map(item => item.name.toLowerCase().trim())
      );

      let addedCount = 0;
      let skippedCount = 0;

      for (const ingredient of ingredients) {
        const ingredientName = ingredient.name.toLowerCase().trim();
        
        // Skip if already exists in grocery list
        if (existingItemNames.has(ingredientName)) {
          console.log(`Skipping ${ingredient.name} - already in grocery list`);
          skippedCount++;
          continue;
        }

        try {
          await addGroceryItem({
            name: ingredient.name,
            quantity: parseFloat(ingredient.quantity) || 1,
            unit: ingredient.unit || 'piece'
          });
          addedCount++;
          existingItemNames.add(ingredientName); // Add to set to avoid duplicates in this batch
        } catch (err: any) {
          console.error(`Failed to add ${ingredient.name}:`, err);
          skippedCount++;
        }
      }

      if (addedCount > 0) {
        success(`Added ${addedCount} ingredient${addedCount > 1 ? 's' : ''} to grocery list!`);
      }
      if (skippedCount > 0) {
        showError(`${skippedCount} ingredient${skippedCount > 1 ? 's' : ''} already in grocery list`);
      }
      if (addedCount === 0 && skippedCount === 0) {
        showError('No ingredients to add');
      }
    } catch (err: any) {
      console.error('Error adding to grocery list:', err);
      showError('Failed to add ingredients to grocery list');
    } finally {
      setAddingToGrocery(false);
    }
  };

  const handleAddToMealPlan = async () => {
    if (!share?.recipeId || addingToMealPlan) return;

    try {
      setAddingToMealPlan(true);

      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];

      await addMealPlan({
        date: dateStr,
        mealType: selectedMealType,
        recipeId: `user-recipe-${share.recipeId._id}`, // Prefix to differentiate from Edamam recipes
        recipeName: share.recipeId.name,
        recipeImage: share.recipeId.image,
        recipeType: 'user' // Mark as user recipe
      });

      success(`Recipe added to ${selectedMealType} in meal planner!`);
      setShowMealTypeModal(false);
    } catch (err: any) {
      console.error('Error adding to meal plan:', err);
      showError(err.message || 'Failed to add recipe to meal planner');
    } finally {
      setAddingToMealPlan(false);
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
          <p className="mt-4 text-gray-600">Loading shared recipe...</p>
        </div>
      </div>
    );
  }

  if (error || !share) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-600 mb-4">{error || 'Shared recipe not found'}</p>
          <button
            onClick={() => navigate('/shared-recipes')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Back to Shared Recipes
          </button>
        </div>
      </div>
    );
  }

  const recipe = share.recipeId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-100 no-print">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/shared-recipes')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Back to shared recipes"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex-1 flex flex-col items-center justify-center">
              <h1 className="text-xl font-bold text-gray-900">Shared Recipe</h1>
              <p className="text-sm text-gray-600">
                From: {share.ownerId?.name || share.ownerId?.email}
              </p>
            </div>

            <UserAvatar size="md" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
          {/* Recipe Image */}
          {recipe.image && (
            <div className="w-full h-80 overflow-hidden">
              <img
                src={recipe.image}
                alt={recipe.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Recipe Details */}
          <div className="p-8">
            {/* Title and Info */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">{recipe.name}</h2>
              {recipe.description && (
                <p className="text-gray-700 text-lg">{recipe.description}</p>
              )}
            </div>

            {/* Shared Message */}
            {share.message && (
              <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm font-medium text-purple-900 mb-1">
                  💌 Message from {share.ownerId?.name}:
                </p>
                <p className="text-purple-800 italic">"{share.message}"</p>
              </div>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap gap-3 mb-6">
              {recipe.cookingTime && (
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                  <span className="text-2xl">🕐</span>
                  <div>
                    <div className="text-xs text-blue-600 font-medium">Cooking Time</div>
                    <div className="text-sm font-bold text-blue-900">{recipe.cookingTime} min</div>
                  </div>
                </div>
              )}
              {recipe.servings && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
                  <span className="text-2xl">👥</span>
                  <div>
                    <div className="text-xs text-green-600 font-medium">Servings</div>
                    <div className="text-sm font-bold text-green-900">{recipe.servings}</div>
                  </div>
                </div>
              )}
              {recipe.cuisine && (
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-lg">
                  <span className="text-2xl">🌍</span>
                  <div>
                    <div className="text-xs text-orange-600 font-medium">Cuisine</div>
                    <div className="text-sm font-bold text-orange-900">{recipe.cuisine}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Rating */}
            {recipe.rating && (
              <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipe Rating
                </label>
                <StarRating rating={recipe.rating} readonly size="lg" showLabel />
              </div>
            )}

            {/* Diet Labels */}
            {recipe.dietLabels && recipe.dietLabels.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Diet Labels</h3>
                <div className="flex flex-wrap gap-2">
                  {recipe.dietLabels.map((label, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
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

            {/* Ingredients */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🥘</span>
                Ingredients
              </h3>
              <div className="bg-orange-50 rounded-lg p-6">
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-orange-800 text-xs font-bold mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-gray-800 font-medium">
                        {ingredient.quantity && ingredient.unit
                          ? `${ingredient.quantity} ${ingredient.unit} `
                          : ingredient.quantity
                          ? `${ingredient.quantity} `
                          : ''}
                        {ingredient.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Instructions */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>📋</span>
                Instructions
              </h3>
              <div className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <p className="flex-1 text-gray-700 leading-relaxed pt-1">{instruction}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 no-print">
              {/* Add to Meal Planner Button */}
              <button
                onClick={() => setShowMealTypeModal(true)}
                disabled={addingToMealPlan}
                className="flex-1 min-w-[200px] px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingToMealPlan ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Add to Meal Planner
                  </>
                )}
              </button>

              <button
                onClick={handleAddToGroceryList}
                disabled={addingToGrocery}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingToGrocery ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
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
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Recipe
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Meal Type Selection Modal */}
      {showMealTypeModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Select Meal Type</h3>
              <p className="text-gray-600">Choose when you'd like to add this recipe to your meal plan</p>
            </div>

            <div className="space-y-3 mb-6">
              {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((mealType) => (
                <button
                  key={mealType}
                  onClick={() => setSelectedMealType(mealType)}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                    selectedMealType === mealType
                      ? 'border-orange-500 bg-orange-50 shadow-md'
                      : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-3xl">
                    {mealType === 'breakfast' ? '🌅' : mealType === 'lunch' ? '☀️' : mealType === 'dinner' ? '🌙' : '🍪'}
                  </span>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-lg capitalize text-gray-900">{mealType}</div>
                    <div className="text-sm text-gray-600">
                      {mealType === 'breakfast' ? 'Start your day' : 
                       mealType === 'lunch' ? 'Midday meal' : 
                       mealType === 'dinner' ? 'Evening meal' : 
                       'Light snack'}
                    </div>
                  </div>
                  {selectedMealType === mealType && (
                    <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowMealTypeModal(false)}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToMealPlan}
                disabled={addingToMealPlan}
                className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {addingToMealPlan ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </>
                ) : (
                  'Add to Plan'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default SharedRecipeViewPage;

