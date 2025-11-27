import React, { useState } from 'react';
import { MealPlanEntry } from '../../lib/mealPlanApi';

interface MealCardProps {
  meal: MealPlanEntry;
  onRemove: () => void;
  onClick?: () => void;
  compact?: boolean;
}

export function MealCard({ meal, onRemove, onClick, compact = false }: MealCardProps) {
  const [imageError, setImageError] = useState(false);

  if (compact) {
    return (
      <div 
        onClick={onClick}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer"
      >
        <div className="flex items-center gap-2 p-2">
          {/* Image */}
          <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded overflow-hidden">
            {!imageError && meal.image ? (
              <img
                src={meal.image}
                alt={meal.title}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl">
                🍽️
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate" title={meal.title}>
              {meal.title}
            </p>
            {meal.servings > 0 && (
              <p className="text-xs text-gray-500">
                {meal.servings} servings
              </p>
            )}
          </div>

          {/* Remove Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
            title="Remove meal"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {meal.notes && (
          <div className="px-2 pb-2">
            <p className="text-xs text-gray-600 italic truncate" title={meal.notes}>
              {meal.notes}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-32 bg-gray-100">
        {!imageError && meal.image ? (
          <img
            src={meal.image}
            alt={meal.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            🍽️
          </div>
        )}

        {/* Remove Button Overlay */}
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-full shadow-lg transition-colors"
          title="Remove meal"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
          {meal.title}
        </h4>

        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
          {meal.servings > 0 && (
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{meal.servings} servings</span>
            </div>
          )}
        </div>

        {meal.notes && (
          <p className="text-xs text-gray-600 italic line-clamp-2 mt-2 pt-2 border-t border-gray-100">
            {meal.notes}
          </p>
        )}
      </div>
    </div>
  );
}

export default MealCard;

