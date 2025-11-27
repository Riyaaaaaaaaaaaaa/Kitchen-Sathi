import React, { useState } from 'react';
import { Recipe } from '../../lib/recipeApi';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
    >
      {/* Recipe Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {!imageError ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50">
            <span className="text-6xl">🍳</span>
          </div>
        )}

        {/* Ingredient Match Badges (if available) */}
        {recipe.usedIngredientCount !== undefined && recipe.missedIngredientCount !== undefined && (
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {recipe.usedIngredientCount > 0 && (
              <div className="px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-full shadow-lg">
                ✓ {recipe.usedIngredientCount} match
              </div>
            )}
            {recipe.missedIngredientCount > 0 && (
              <div className="px-2 py-1 bg-orange-600 text-white text-xs font-medium rounded-full shadow-lg">
                +{recipe.missedIngredientCount} needed
              </div>
            )}
          </div>
        )}

        {/* Likes Badge */}
        {recipe.likes && recipe.likes > 0 && (
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full">
            ❤️ {recipe.likes}
          </div>
        )}
      </div>

      {/* Recipe Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors">
          {recipe.title}
        </h3>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          {recipe.readyInMinutes && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{recipe.readyInMinutes} min</span>
            </div>
          )}

          {recipe.servings && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{recipe.servings} servings</span>
            </div>
          )}
        </div>

        {/* Click to view indicator */}
        <div className="mt-3 text-sm text-orange-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
          View Recipe
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default RecipeCard;

