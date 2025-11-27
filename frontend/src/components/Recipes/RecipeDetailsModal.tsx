import React, { useState, useEffect } from 'react';
import { getRecipeDetails, saveRecipe, unsaveRecipe, isRecipeSaved, RecipeDetail } from '../../lib/recipeApi';
import { addMealToPlan } from '../../lib/mealPlanApi';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../Toast';

interface RecipeDetailsModalProps {
  recipeId: number;
  onClose: () => void;
}

export function RecipeDetailsModal({ recipeId, onClose }: RecipeDetailsModalProps) {
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'ingredients' | 'instructions' | 'nutrition'>('overview');
  const [showMealPlanDropdown, setShowMealPlanDropdown] = useState(false);
  const [addingToMealPlan, setAddingToMealPlan] = useState(false);
  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    loadRecipe();
    checkIfSaved();
  }, [recipeId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside the meal plan dropdown container
      if (showMealPlanDropdown && !target.closest('.meal-plan-dropdown-container')) {
        setShowMealPlanDropdown(false);
      }
    };

    if (showMealPlanDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMealPlanDropdown]);

  const loadRecipe = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRecipeDetails(recipeId);
      setRecipe(data);
    } catch (err: any) {
      // Check if it's a legacy recipe error
      if (err.isLegacy || err.message?.includes('Legacy recipe')) {
        setError('legacy');
      } else {
        setError(err.message || 'Failed to load recipe details');
      }
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    try {
      const saved = await isRecipeSaved(recipeId);
      setIsSaved(saved);
    } catch (err) {
      console.error('Failed to check if recipe is saved:', err);
    }
  };

  const handleSaveToggle = async () => {
    if (!recipe) return;

    try {
      setSaving(true);
      if (isSaved) {
        await unsaveRecipe(recipeId);
        setIsSaved(false);
        success('Recipe removed from favorites');
      } else {
        await saveRecipe({
          recipeId: recipe.id,
          title: recipe.title,
          image: recipe.image,
          servings: recipe.servings,
          readyInMinutes: recipe.readyInMinutes,
          sourceUrl: recipe.sourceUrl,
          summary: recipe.summary,
          cuisines: recipe.cuisines,
          diets: recipe.diets
        });
        setIsSaved(true);
        success('Recipe saved to favorites!');
      }
    } catch (err: any) {
      showError(err.message || 'Failed to save recipe');
    } finally {
      setSaving(false);
    }
  };

  const handleAddToMealPlan = async (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    if (!recipe) return;

    const today = new Date().toISOString().split('T')[0];
    
    try {
      setAddingToMealPlan(true);
      console.log(`Adding recipe ${recipe.id} to ${mealType} for ${today}`);
      
      await addMealToPlan(today, {
        recipeId: recipe.id,
        title: recipe.title,
        image: recipe.image,
        servings: recipe.servings,
        mealType
      });
      
      console.log('Successfully added to meal plan');
      
      // Capitalize meal type for display
      const mealTypeDisplay = mealType.charAt(0).toUpperCase() + mealType.slice(1);
      success(`Added "${recipe.title}" to ${mealTypeDisplay} for today!`);
      
      setShowMealPlanDropdown(false); // Close dropdown after success
    } catch (err: any) {
      console.error('Failed to add to meal plan:', err);
      
      // Extract error message from various error formats
      let errorMessage = 'Failed to add to meal plan';
      
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.error) {
        if (typeof err.error === 'string') {
          errorMessage = err.error;
        } else if (err.error.message) {
          errorMessage = err.error.message;
        } else {
          // If error is an object, stringify it
          errorMessage = `Error: ${JSON.stringify(err.error)}`;
        }
      }
      
      showError(errorMessage);
    } finally {
      setAddingToMealPlan(false);
    }
  };

  const getNutrient = (name: string) => {
    return recipe?.nutrition?.nutrients?.find(n => n.name.toLowerCase() === name.toLowerCase());
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    const isLegacyError = error === 'legacy';
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-xl p-8 max-w-md">
          {isLegacyError ? (
            <>
              <div className="text-center mb-4">
                <svg className="w-16 h-16 text-yellow-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Old Recipe Format</h3>
              </div>
              <p className="text-gray-700 mb-4">
                This recipe was saved from our previous system and is no longer available. 
                Please remove it from your saved recipes and search for new recipes from our updated catalog.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    try {
                      console.log(`Attempting to delete legacy recipe: ${recipeId}`);
                      await unsaveRecipe(recipeId);
                      console.log('Recipe deleted successfully');
                      success('Recipe removed from saved recipes');
                      onClose();
                      // Trigger refresh of saved recipes list
                      window.location.reload();
                    } catch (err: any) {
                      console.error('Failed to delete recipe:', err);
                      const errorMessage = err.message || err.error || 'Failed to remove recipe';
                      showError(`Failed to remove recipe: ${errorMessage}`);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete Recipe
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-red-600 mb-4">{error || 'Recipe not found'}</p>
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header with Image */}
        <div className="relative h-64 bg-gray-100">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h2 className="text-3xl font-bold mb-2">{recipe.title}</h2>
            <div className="flex items-center gap-4 text-sm">
              {recipe.readyInMinutes > 0 && (
                <span>⏱️ {recipe.readyInMinutes} min</span>
              )}
              {recipe.servings > 0 && (
                <span>👥 {recipe.servings} servings</span>
              )}
              {recipe.cuisines && recipe.cuisines.length > 0 && (
                <span>🌍 {recipe.cuisines.join(', ')}</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-b border-gray-200 p-4 flex items-center gap-3 flex-wrap">
          <button
            onClick={handleSaveToggle}
            disabled={saving}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isSaved
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            } disabled:opacity-50`}
          >
            {isSaved ? '❤️ Saved' : '🤍 Save Recipe'}
          </button>

          <div className="relative meal-plan-dropdown-container">
            <button 
              onClick={() => setShowMealPlanDropdown(!showMealPlanDropdown)}
              disabled={addingToMealPlan}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addingToMealPlan ? '⏳ Adding...' : '📅 Add to Meal Plan'}
            </button>
            {showMealPlanDropdown && (
              <div 
                className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[150px] z-10"
                onClick={(e) => e.stopPropagation()} // Prevent event bubbling
              >
                <button 
                  onClick={() => handleAddToMealPlan('breakfast')} 
                  disabled={addingToMealPlan}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  🌅 Breakfast
                </button>
                <button 
                  onClick={() => handleAddToMealPlan('lunch')} 
                  disabled={addingToMealPlan}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  🌞 Lunch
                </button>
                <button 
                  onClick={() => handleAddToMealPlan('dinner')} 
                  disabled={addingToMealPlan}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  🌙 Dinner
                </button>
                <button 
                  onClick={() => handleAddToMealPlan('snack')} 
                  disabled={addingToMealPlan}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  🍿 Snack
                </button>
              </div>
            )}
          </div>

          {recipe.sourceUrl && (
            <a
              href={recipe.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              🔗 Original Recipe
            </a>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-1 p-2">
            {['overview', 'ingredients', 'instructions', 'nutrition'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div
                className="prose max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: recipe.summary }}
              />
              {recipe.diets && recipe.diets.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Diets:</h3>
                  <div className="flex flex-wrap gap-2">
                    {recipe.diets.map((diet) => (
                      <span key={diet} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        {diet}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Ingredients</h3>
              <ul className="space-y-2">
                {recipe.extendedIngredients.map((ing, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-orange-600">•</span>
                    <span>{ing.original}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'instructions' && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Instructions</h3>
              {recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 ? (
                <ol className="space-y-4">
                  {recipe.analyzedInstructions[0].steps.map((step) => (
                    <li key={step.number} className="flex gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-semibold">
                        {step.number}
                      </span>
                      <p className="flex-1 pt-1">{step.step}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: recipe.instructions || 'No instructions available' }}
                />
              )}
            </div>
          )}

          {activeTab === 'nutrition' && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Nutrition Information</h3>
              {recipe.nutrition?.nutrients ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['Calories', 'Protein', 'Fat', 'Carbohydrates', 'Fiber', 'Sugar', 'Sodium', 'Cholesterol'].map((nutrient) => {
                    const value = getNutrient(nutrient);
                    if (!value) return null;
                    return (
                      <div key={nutrient} className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">{nutrient}</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {Math.round(value.amount)}
                          <span className="text-sm text-gray-600 ml-1">{value.unit}</span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-600">Nutrition information not available</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default RecipeDetailsModal;

