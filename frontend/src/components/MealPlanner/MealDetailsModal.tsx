import React, { useState } from 'react';
import { MealPlanEntry } from '../../lib/mealPlanApi';
import { RecipeViewModal } from './RecipeViewModal';
import { UserRecipeViewModal } from './UserRecipeViewModal';

interface MealDetailsModalProps {
  meal: MealPlanEntry;
  date: string;
  onClose: () => void;
  onRemove: () => void;
}

export function MealDetailsModal({ meal, date, onClose, onRemove }: MealDetailsModalProps) {
  const [imageError, setImageError] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRecipeView, setShowRecipeView] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMealTypeEmoji = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '🍳';
      case 'lunch': return '😋';
      case 'dinner': return '🌙';
      case 'snack': return '🍿';
      default: return '🍽️';
    }
  };

  const getMealTypeLabel = (mealType: string) => {
    return mealType.charAt(0).toUpperCase() + mealType.slice(1);
  };

  const handleRemove = () => {
    onRemove();
    onClose();
  };

  const isCustomMeal = typeof meal.recipeId === 'string' && meal.recipeId.startsWith('custom_');
  const isUserRecipe = typeof meal.recipeId === 'string' && (meal.recipeId.startsWith('user_') || meal.recipeId.startsWith('user-recipe-'));
  // Check if it's an Edamam recipe (not custom and not user recipe)
  const isEdamamRecipe = typeof meal.recipeId === 'string' && !isCustomMeal && !isUserRecipe && meal.recipeId.length > 0;

  // Debug logging
  console.log('Meal Details:', {
    recipeId: meal.recipeId,
    isCustomMeal,
    isUserRecipe,
    isEdamamRecipe,
    recipeIdType: typeof meal.recipeId
  });

  const handleViewRecipe = () => {
    if (isEdamamRecipe || isUserRecipe) {
      // Open recipe in popup modal
      setShowRecipeView(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with Image */}
        <div className="relative">
          {/* Image */}
          <div className="relative h-64 bg-gradient-to-br from-orange-100 to-orange-50">
            {!imageError && meal.image ? (
              <img
                src={meal.image}
                alt={meal.title}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-8xl">🍽️</span>
              </div>
            )}
            
            {/* Overlay gradient for better text visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white text-gray-700 rounded-full shadow-lg transition-all hover:scale-110"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Meal Type Badge */}
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getMealTypeEmoji(meal.mealType)}</span>
              <span className="text-sm font-medium text-gray-700">
                {getMealTypeLabel(meal.mealType)}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {meal.title}
          </h2>

          {/* Date */}
          <p className="text-sm text-gray-600 mb-6 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(date)}
          </p>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Servings */}
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-orange-700 mb-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm font-medium">Servings</span>
              </div>
              <p className="text-2xl font-bold text-orange-900">{meal.servings || 1}</p>
            </div>

            {/* Meal Type */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-700 mb-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Type</span>
              </div>
              <p className="text-lg font-bold text-blue-900 capitalize">{meal.mealType}</p>
            </div>
          </div>

          {/* Recipe ID Info (for custom meals) */}
          {meal.recipeId && typeof meal.recipeId === 'string' && meal.recipeId.startsWith('custom_') && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-6">
              <div className="flex items-center gap-2 text-purple-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span className="text-sm font-medium">Custom Meal</span>
              </div>
              <p className="text-xs text-purple-600 mt-1">This is a custom meal you created</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* View Recipe Button (for saved recipes and user recipes) */}
            {!showDeleteConfirm && (isEdamamRecipe || isUserRecipe) && (
              <button
                onClick={handleViewRecipe}
                className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                View Full Recipe
              </button>
            )}

            <div className="flex gap-3">
              {/* Delete Button */}
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex-1 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove from Meal Plan
                </button>
              ) : (
                <div className="flex-1 flex gap-2">
                  <button
                    onClick={handleRemove}
                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Close Button */}
              {!showDeleteConfirm && (
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recipe View Modal (nested) */}
      {showRecipeView && isEdamamRecipe && (
        <RecipeViewModal
          recipeId={meal.recipeId as string}
          onClose={() => setShowRecipeView(false)}
        />
      )}

      {/* User Recipe View Modal (nested) */}
      {showRecipeView && isUserRecipe && (
        <UserRecipeViewModal
          recipeId={meal.recipeId as string}
          isOpen={true}
          onClose={() => setShowRecipeView(false)}
        />
      )}
    </div>
  );
}

export default MealDetailsModal;

