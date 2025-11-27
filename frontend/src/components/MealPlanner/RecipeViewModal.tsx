import React, { useState, useEffect } from 'react';
import { getRecipeDetails, RecipeDetail } from '../../lib/recipeApi';

interface RecipeViewModalProps {
  recipeId: string;
  onClose: () => void;
}

export function RecipeViewModal({ recipeId, onClose }: RecipeViewModalProps) {
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    loadRecipe();
  }, [recipeId]);

  const loadRecipe = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Extract recipe ID from Edamam URI if needed
      let cleanRecipeId = recipeId;
      if (typeof recipeId === 'string' && recipeId.includes('recipe_')) {
        // For Edamam URIs, extract the hash part
        const match = recipeId.match(/recipe_([a-zA-Z0-9]+)/);
        if (match) {
          cleanRecipeId = match[1];
        }
      }
      
      console.log('Loading recipe:', cleanRecipeId);
      const data = await getRecipeDetails(cleanRecipeId as any);
      setRecipe(data);
    } catch (err: any) {
      console.error('Failed to load recipe:', err);
      setError(err.message || 'Failed to load recipe details');
    } finally {
      setLoading(false);
    }
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">Recipe Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
              <span className="ml-3 text-gray-600">Loading recipe...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {recipe && (
            <div className="space-y-6">
              {/* Recipe Image */}
              <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
                {!imageError && recipe.image ? (
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl">🍽️</span>
                  </div>
                )}
              </div>

              {/* Recipe Title */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
                {recipe.summary && (
                  <p className="text-gray-600 leading-relaxed">
                    {stripHtml(recipe.summary)}
                  </p>
                )}
              </div>

              {/* Recipe Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recipe.servings && (
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-orange-700 mb-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-sm font-medium">Servings</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-900">{recipe.servings}</p>
                  </div>
                )}

                {recipe.readyInMinutes && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-700 mb-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">Time</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">{recipe.readyInMinutes} min</p>
                  </div>
                )}

                {recipe.cuisines && recipe.cuisines.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-700 mb-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span className="text-sm font-medium">Cuisine</span>
                    </div>
                    <p className="text-sm font-bold text-green-900">{recipe.cuisines[0]}</p>
                  </div>
                )}

                {recipe.diets && recipe.diets.length > 0 && (
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-purple-700 mb-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">Diet</span>
                    </div>
                    <p className="text-sm font-bold text-purple-900 capitalize">{recipe.diets[0]}</p>
                  </div>
                )}
              </div>

              {/* Ingredients */}
              {recipe.extendedIngredients && recipe.extendedIngredients.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Ingredients
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {recipe.extendedIngredients.map((ingredient, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">{ingredient.original}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Instructions */}
              {recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 && recipe.analyzedInstructions[0].steps.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Instructions
                  </h3>
                  <div className="space-y-4">
                    {recipe.analyzedInstructions[0].steps.map((step) => (
                      <div key={step.number} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                          {step.number}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-700 leading-relaxed">{step.step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Source Link */}
              {recipe.sourceUrl && (
                <div className="pt-4 border-t border-gray-200">
                  <a
                    href={recipe.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Original Recipe
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecipeViewModal;

