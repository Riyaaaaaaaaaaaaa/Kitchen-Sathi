import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { addMealToPlan, MealPlanEntry } from '../../lib/mealPlanApi';
import { getSavedRecipes, SavedRecipe } from '../../lib/recipeApi';
import { getUserRecipes, UserRecipe } from '../../lib/userRecipesApi';
import { getReceivedShares, SharedRecipe } from '../../lib/sharedRecipesApi';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../Toast';
import { UserRecipeViewModal } from './UserRecipeViewModal';

interface AddMealModalProps {
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  onClose: () => void;
  onSuccess: () => void;
}

export function AddMealModal({ date, mealType, onClose, onSuccess }: AddMealModalProps) {
  const navigate = useNavigate();
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [myRecipes, setMyRecipes] = useState<UserRecipe[]>([]);
  const [sharedRecipes, setSharedRecipes] = useState<SharedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [customMeal, setCustomMeal] = useState({
    title: '',
    servings: 1,
    notes: ''
  });
  const [activeTab, setActiveTab] = useState<'saved' | 'myRecipes' | 'sharedRecipes' | 'custom'>('saved');
  const [viewingRecipe, setViewingRecipe] = useState<UserRecipe | null>(null);
  const { toasts, removeToast, success, error: showError, warning } = useToast();
  const hasShownWarning = useRef(false);

  useEffect(() => {
    // Validate date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      // Only show warning once using ref
      if (!hasShownWarning.current) {
        hasShownWarning.current = true;
        warning(`You cannot add meals to past dates. Please select today or a future date.`);
        setTimeout(() => onClose(), 3000); // Close modal after 3 seconds
      }
      return;
    }
    
    loadSavedRecipes();
    loadMyRecipes();
    loadSharedRecipes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once when modal opens

  const loadSavedRecipes = async () => {
    try {
      setLoading(true);
      const recipes = await getSavedRecipes();
      setSavedRecipes(recipes);
    } catch (err: any) {
      setError(err.message || 'Failed to load saved recipes');
    } finally {
      setLoading(false);
    }
  };

  const loadMyRecipes = async () => {
    try {
      const recipes = await getUserRecipes();
      setMyRecipes(recipes);
    } catch (err: any) {
      console.error('Failed to load user recipes:', err);
    }
  };

  const loadSharedRecipes = async () => {
    try {
      const shares = await getReceivedShares();
      // Only include accepted shares
      const acceptedShares = shares.filter(share => share.status === 'accepted' && share.recipeId);
      setSharedRecipes(acceptedShares);
    } catch (err: any) {
      console.error('Failed to load shared recipes:', err);
    }
  };

  const handleAddRecipe = async (recipe: SavedRecipe) => {
    try {
      setAdding(true);
      setError(null);

      const meal: MealPlanEntry = {
        recipeId: recipe.recipeId,
        title: recipe.title,
        image: recipe.image,
        servings: recipe.servings,
        mealType
      };

      await addMealToPlan(date, meal);
      success(`Added "${recipe.title}" to your meal plan!`);
      onSuccess();
    } catch (err: any) {
      console.error('Failed to add recipe to meal plan:', err);
      showError(err.message || 'Failed to add meal to plan');
    } finally {
      setAdding(false);
    }
  };

  const handleAddUserRecipe = async (recipe: UserRecipe) => {
    try {
      setAdding(true);
      setError(null);

      const meal: MealPlanEntry = {
        recipeId: `user_${recipe._id}`, // User recipe with prefix
        title: recipe.name,
        image: recipe.image || '', // Include image if available
        servings: recipe.servings || 1,
        mealType
      };

      await addMealToPlan(date, meal);
      success(`Added "${recipe.name}" to your meal plan!`);
      onSuccess();
    } catch (err: any) {
      console.error('Failed to add user recipe to meal plan:', err);
      showError(err.message || 'Failed to add meal to plan');
    } finally {
      setAdding(false);
    }
  };

  const handleAddSharedRecipe = async (share: SharedRecipe) => {
    try {
      setAdding(true);
      setError(null);

      const recipe = share.recipeId;
      const meal: MealPlanEntry = {
        recipeId: `user_${recipe._id}`, // Shared recipe (same as user recipe)
        title: recipe.name,
        image: recipe.image || '',
        servings: recipe.servings || 1,
        mealType
      };

      await addMealToPlan(date, meal);
      success(`Added "${recipe.name}" to your meal plan!`);
      onSuccess();
    } catch (err: any) {
      console.error('Failed to add shared recipe to meal plan:', err);
      showError(err.message || 'Failed to add meal to plan');
    } finally {
      setAdding(false);
    }
  };

  const handleAddCustomMeal = async () => {
    if (!customMeal.title.trim()) {
      showError('Please enter a meal title');
      return;
    }

    try {
      setAdding(true);
      setError(null);

      const meal: MealPlanEntry = {
        recipeId: `custom_${Date.now()}`, // Custom meal with unique ID
        title: customMeal.title,
        image: '', // No image for custom meals
        servings: customMeal.servings,
        mealType,
        notes: customMeal.notes
      };

      console.log('📤 Adding custom meal:', { date, meal });
      const result = await addMealToPlan(date, meal);
      console.log('✅ Custom meal added successfully:', result);
      
      success(`Added "${customMeal.title}" to your meal plan!`);
      onSuccess();
    } catch (err: any) {
      console.error('❌ Failed to add custom meal:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        data: err.data
      });
      
      // Extract error message
      let errorMessage = 'Failed to add meal to plan';
      if (err.message) {
        errorMessage = err.message;
      } else if (err.error) {
        errorMessage = err.error;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      showError(errorMessage);
    } finally {
      setAdding(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const getMealIcon = () => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '🌞';
      case 'dinner': return '🌙';
      case 'snack': return '🍿';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span>{getMealIcon()}</span>
                Add {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
              </h2>
              <p className="text-sm text-gray-600 mt-1">{formatDate(date)}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'saved'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Saved Recipes
            </button>
            <button
              onClick={() => setActiveTab('myRecipes')}
              className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'myRecipes'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📝 My Recipes
            </button>
            <button
              onClick={() => setActiveTab('sharedRecipes')}
              className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'sharedRecipes'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🤝 Shared Recipes
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'custom'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Custom Meal
            </button>
          </div>

          {/* Saved Recipes Tab */}
          {activeTab === 'saved' && (
            <>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
                  <span className="ml-3 text-gray-600">Loading recipes...</span>
                </div>
              ) : savedRecipes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📖</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Saved Recipes</h3>
                  <p className="text-gray-600 mb-6">
                    You haven't saved any recipes yet. Browse recipes to find meals you'd like to save.
                  </p>
                  <button
                    onClick={() => navigate('/recipes')}
                    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    Browse Recipes
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {savedRecipes.map((recipe) => (
                    <button
                      key={recipe._id}
                      onClick={() => handleAddRecipe(recipe)}
                      disabled={adding}
                      className="text-left bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-all border border-gray-200 hover:border-orange-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="relative h-32 bg-gray-100">
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                          {recipe.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          {recipe.servings > 0 && <span>👥 {recipe.servings} servings</span>}
                          {recipe.readyInMinutes > 0 && <span>⏱️ {recipe.readyInMinutes} min</span>}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* My Recipes Tab */}
          {activeTab === 'myRecipes' && (
            <>
              {myRecipes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Personal Recipes</h3>
                  <p className="text-gray-600 mb-6">
                    You haven't created any personal recipes yet. Create your own recipes to add them to your meal plan.
                  </p>
                  <button
                    onClick={() => navigate('/my-recipes/create')}
                    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    Create Recipe
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {myRecipes.map((recipe) => (
                    <button
                      key={recipe._id}
                      onClick={() => handleAddUserRecipe(recipe)}
                      disabled={adding}
                      className="text-left bg-gray-50 rounded-lg p-4 hover:shadow-md transition-all border border-gray-200 hover:border-orange-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center text-2xl">
                          🍳
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{recipe.name}</h3>
                          {recipe.description && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{recipe.description}</p>
                          )}
                          <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                            {recipe.cookingTime && (
                              <span className="flex items-center gap-1">
                                🕐 {recipe.cookingTime} min
                              </span>
                            )}
                            {recipe.servings && (
                              <span className="flex items-center gap-1">
                                👥 {recipe.servings}
                              </span>
                            )}
                            {recipe.cuisine && (
                              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                                {recipe.cuisine}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Shared Recipes Tab */}
          {activeTab === 'sharedRecipes' && (
            <>
              {sharedRecipes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🤝</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Shared Recipes</h3>
                  <p className="text-gray-600 mb-6">
                    No recipes have been shared with you yet. When others share recipes, they'll appear here.
                  </p>
                  <button
                    onClick={() => navigate('/shared-recipes')}
                    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    View Shared Recipes
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {sharedRecipes.map((share) => (
                    <div key={share._id} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:border-orange-300 transition-all">
                      {share.recipeId.image && (
                        <div className="relative h-32 bg-gray-100">
                          <img
                            src={share.recipeId.image}
                            alt={share.recipeId.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h4 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
                          {share.recipeId.name}
                        </h4>
                        <p className="text-xs text-gray-600 mb-3">
                          From: {share.ownerId?.name || share.ownerId?.email}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                          {share.recipeId.cookingTime && (
                            <span className="flex items-center gap-1">
                              🕐 {share.recipeId.cookingTime} min
                            </span>
                          )}
                          {share.recipeId.servings && (
                            <span className="flex items-center gap-1">
                              👥 {share.recipeId.servings}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setViewingRecipe(share.recipeId)}
                            className="flex-1 px-3 py-2 bg-white hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-300"
                          >
                            👁️ View Details
                          </button>
                          <button
                            onClick={() => handleAddSharedRecipe(share)}
                            disabled={adding}
                            className="flex-1 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Add to Plan
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Custom Meal Tab */}
          {activeTab === 'custom' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Meal Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={customMeal.title}
                  onChange={(e) => setCustomMeal({ ...customMeal, title: e.target.value })}
                  placeholder="e.g., Homemade Pizza"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="servings" className="block text-sm font-medium text-gray-700 mb-1">
                  Servings
                </label>
                <input
                  type="number"
                  id="servings"
                  value={customMeal.servings}
                  onChange={(e) => setCustomMeal({ ...customMeal, servings: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  id="notes"
                  value={customMeal.notes}
                  onChange={(e) => setCustomMeal({ ...customMeal, notes: e.target.value })}
                  placeholder="Add any notes about this meal..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>

              <button
                onClick={handleAddCustomMeal}
                disabled={adding || !customMeal.title.trim()}
                className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? 'Adding...' : 'Add Custom Meal'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
      
      {/* Recipe View Modal */}
      {viewingRecipe && (
        <UserRecipeViewModal
          recipe={viewingRecipe}
          isOpen={true}
          onClose={() => setViewingRecipe(null)}
        />
      )}
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default AddMealModal;

