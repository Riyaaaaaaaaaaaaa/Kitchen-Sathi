import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getRecipeSuggestions,
  searchRecipes,
  getSavedRecipes,
  Recipe,
  RecipeSearchParams,
  SavedRecipe
} from '../../lib/recipeApi';
import { getGroceryList } from '../../lib/api';
import { Logo } from '../Logo';
import { UserAvatar } from '../UserAvatar';
import NotificationBell from '../NotificationBell';
import { RecipeCard } from './RecipeCard';
import { RecipeFilters } from './RecipeFilters';
import { RecipeDetailsModal } from './RecipeDetailsModal';

interface RecipeSuggestionsPageProps {
  className?: string;
}

export function RecipeSuggestionsPage({ className = '' }: RecipeSuggestionsPageProps) {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'search' | 'saved'>('suggestions');
  const [userIngredients, setUserIngredients] = useState<string[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [hasGroceryItems, setHasGroceryItems] = useState(true);
  const [groceryItemCount, setGroceryItemCount] = useState(0);
  
  // Filter state
  const [filters, setFilters] = useState<RecipeSearchParams>({
    query: '',
    diet: '',
    maxCalories: undefined,
    cuisine: '',
    type: '',
    maxReadyTime: undefined,
    number: 12,
    offset: 0,
    useMyIngredients: false
  });

  // Check grocery list status and get bought ingredients
  const checkGroceryList = async () => {
    try {
      const groceries = await getGroceryList();
      const count = groceries.length;
      setGroceryItemCount(count);
      setHasGroceryItems(count > 0);
      return count > 0;
    } catch (err) {
      console.error('Failed to check grocery list:', err);
      return false;
    }
  };

  // Get only bought/completed ingredients for recipe search
  const getBoughtIngredients = async (): Promise<{ ingredients: string[]; count: number } | null> => {
    try {
      const groceries = await getGroceryList();
      
      console.log('🛒 [getBoughtIngredients] All grocery items:', groceries.map(g => ({
        name: g.name,
        status: g.status
      })));

      // Filter for only bought/completed items (items user actually has)
      const boughtItems = groceries.filter(item => {
        const status = item.status?.toLowerCase();
        const isBought = status === 'completed' || status === 'bought';
        console.log(`  - ${item.name}: status="${item.status}" → ${isBought ? '✅ INCLUDE' : '❌ EXCLUDE'}`);
        return isBought;
      });

      console.log(`🛒 [getBoughtIngredients] Found ${boughtItems.length} bought items out of ${groceries.length} total`);

      if (boughtItems.length === 0) {
        console.log('🛒 [getBoughtIngredients] No bought items found!');
        return null;
      }

      const ingredientNames = boughtItems.map(item => item.name.toLowerCase());
      console.log('🛒 [getBoughtIngredients] Bought ingredients:', ingredientNames);

      return {
        ingredients: ingredientNames,
        count: boughtItems.length
      };
    } catch (err) {
      console.error('❌ [getBoughtIngredients] Error:', err);
      return null;
    }
  };

  // Load initial suggestions based on user's grocery list
  const loadSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);
      setActiveTab('suggestions');

      const result = await getRecipeSuggestions({
        diet: filters.diet,
        maxCalories: filters.maxCalories,
        cuisine: filters.cuisine,
        type: filters.type,
        maxReadyTime: filters.maxReadyTime,
        limit: filters.number
      });

      setRecipes(result.recipes);
      setUserIngredients(result.userIngredients);
      setTotalResults(result.recipes.length);

      console.log(`Loaded ${result.recipes.length} recipe suggestions`);
    } catch (err: any) {
      console.error('Failed to load suggestions:', err);
      setError(err.message || 'Failed to load recipe suggestions');
    } finally {
      setLoading(false);
    }
  };

  // Load saved recipes
  const loadSavedRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      setActiveTab('saved');

      const saved = await getSavedRecipes();
      setSavedRecipes(saved);

      console.log(`Loaded ${saved.length} saved recipes`);

      // Check for legacy recipes
      const { hasLegacyRecipes, countLegacyRecipes } = await import('../../lib/recipeApi');
      if (hasLegacyRecipes(saved)) {
        const legacyCount = countLegacyRecipes(saved);
        console.log(`⚠️  Found ${legacyCount} legacy Spoonacular recipes`);
      }
    } catch (err: any) {
      console.error('Failed to load saved recipes:', err);
      setError(err.message || 'Failed to load saved recipes');
    } finally {
      setLoading(false);
    }
  };

  // Advanced search with filters
  const performSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      setActiveTab('search');

      // If "Use my ingredients" is checked, validate and get bought ingredients
      let searchFilters = { ...filters };
      
      if (filters.useMyIngredients) {
        console.log('🔍 [performSearch] "Use my ingredients" is checked, getting bought items...');
        
        const boughtData = await getBoughtIngredients();
        
        if (!boughtData || boughtData.count === 0) {
          // No bought items - show specific empty state
          setError('no-bought-items');
          setLoading(false);
          return;
        }

        // Add bought ingredients to search query
        const ingredientsQuery = boughtData.ingredients.join(',');
        console.log(`🔍 [performSearch] Using ${boughtData.count} bought ingredients: ${ingredientsQuery}`);
        
        // Update search filters with bought ingredients
        searchFilters = {
          ...searchFilters,
          query: searchFilters.query 
            ? `${searchFilters.query},${ingredientsQuery}` 
            : ingredientsQuery
        };

        // Update user ingredients display
        setUserIngredients(boughtData.ingredients);
      }

      console.log('🔍 [performSearch] Searching with filters:', searchFilters);
      const result = await searchRecipes(searchFilters);

      setRecipes(result.recipes);
      setTotalResults(result.totalResults);

      console.log(`✅ [performSearch] Search found ${result.totalResults} total recipes`);
    } catch (err: any) {
      console.error('❌ [performSearch] Failed to search recipes:', err);
      setError(err.message || 'Failed to search recipes');
    } finally {
      setLoading(false);
    }
  };

  // Load suggestions and check grocery list on mount
  useEffect(() => {
    const init = async () => {
      await checkGroceryList();
      await loadSuggestions();
    };
    init();
  }, []);

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<RecipeSearchParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters, offset: 0 }));
  };

  // Handle search submit
  const handleSearch = async () => {
    // Re-check grocery list before search
    await checkGroceryList();
    
    if (filters.query || filters.diet || filters.cuisine || filters.type) {
      performSearch();
    } else {
      loadSuggestions();
    }
  };

  // Handle load more (pagination)
  const handleLoadMore = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      const newOffset = filters.offset + filters.number;
      const result = await searchRecipes({
        ...filters,
        offset: newOffset
      });

      setRecipes(prev => [...prev, ...result.recipes]);
      setFilters(prev => ({ ...prev, offset: newOffset }));

      console.log(`Loaded ${result.recipes.length} more recipes`);
    } catch (err: any) {
      console.error('Failed to load more recipes:', err);
      setError(err.message || 'Failed to load more recipes');
    } finally {
      setLoading(false);
    }
  };

  // Handle recipe click
  const handleRecipeClick = (recipeId: number) => {
    setSelectedRecipeId(recipeId);
  };

  // Handle cleanup of legacy recipes
  const handleCleanupLegacy = async () => {
    if (!confirm('Remove all old recipes from the previous system? This cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { cleanupLegacyRecipes } = await import('../../lib/recipeApi');
      const result = await cleanupLegacyRecipes();

      console.log(`✅ Removed ${result.removed} legacy recipes`);
      alert(`Successfully removed ${result.removed} old recipe${result.removed !== 1 ? 's' : ''}`);

      // Reload saved recipes
      await loadSavedRecipes();
    } catch (err: any) {
      console.error('Failed to cleanup legacy recipes:', err);
      setError(err.message || 'Failed to cleanup old recipes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-orange-50 to-white ${className}`}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo size="md" className="text-orange-600" />
            <div className="flex items-center gap-4">
              <NotificationBell />
              <UserAvatar size="md" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🍳 Recipe Suggestions</h1>
          <p className="text-gray-600">AI-powered meal ideas based on your ingredients</p>
        </div>
        {/* Filters */}
        <RecipeFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          onReset={() => {
            setFilters({
              query: '',
              diet: '',
              maxCalories: undefined,
              cuisine: '',
              type: '',
              maxReadyTime: undefined,
              number: 12,
              offset: 0,
              useMyIngredients: false
            });
            loadSuggestions();
          }}
        />

        {/* Match Info (for suggestions mode) */}
        {activeTab === 'suggestions' && userIngredients.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-900">
                  Recipes matched with your ingredients
                </h3>
                <p className="mt-1 text-sm text-blue-700">
                  Using: {userIngredients.slice(0, 5).join(', ')}
                  {userIngredients.length > 5 && ` and ${userIngredients.length - 5} more`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-600">
            {loading && (activeTab === 'saved' ? savedRecipes.length === 0 : recipes.length === 0) ? (
              <span>Loading...</span>
            ) : activeTab === 'saved' ? (
              <span>Showing {savedRecipes.length} saved recipes</span>
            ) : (
              <span>
                Showing {recipes.length} {activeTab === 'search' && `of ${totalResults}`} recipes
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadSuggestions}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'suggestions'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              AI Suggestions
            </button>
            <button
              onClick={loadSavedRecipes}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'saved'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
              </svg>
              Saved Recipes
            </button>
          </div>
        </div>

        {/* Error Message - No Bought Items */}
        {error === 'no-bought-items' && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Bought Groceries Yet!
            </h3>
            <p className="text-gray-600 mb-6">
              You haven't marked any groceries as "bought" yet. Mark some items as bought first to get personalized recipe suggestions based on ingredients you actually have on hand.
            </p>
            <button
              onClick={() => navigate('/groceries')}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors font-medium"
            >
              Go to Grocery List
            </button>
          </div>
        )}

        {/* Error Message - Empty Grocery List */}
        {error && error !== 'no-bought-items' && filters.useMyIngredients && !hasGroceryItems && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Your Grocery List is Empty!
            </h3>
            <p className="text-gray-600 mb-6">
              Add some items to your grocery list to get personalized recipe suggestions based on what you have.
            </p>
            <button
              onClick={() => navigate('/groceries')}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors font-medium"
            >
              Go to Grocery List
            </button>
          </div>
        )}

        {/* Error Message - General */}
        {error && error !== 'no-bought-items' && !(filters.useMyIngredients && !hasGroceryItems) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Don't show content if empty grocery list or no bought items error is showing */}
        {!(error === 'no-bought-items' || (error && filters.useMyIngredients && !hasGroceryItems)) && (
          <>
            {/* Loading State */}
            {loading && (activeTab === 'saved' ? savedRecipes.length === 0 : recipes.length === 0) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200" />
                    <div className="p-4">
                      <div className="h-6 bg-gray-200 rounded mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activeTab === 'saved' ? (
              /* Saved Recipes Tab */
              <>
                {/* Legacy Recipes Notice */}
                {savedRecipes.length > 0 && (() => {
                  const legacyCount = savedRecipes.filter(r => /^\d+$/.test(String(r.recipeId))).length;
                  return legacyCount > 0 ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-yellow-900 mb-1">
                            Old Recipes Detected
                          </h4>
                          <p className="text-sm text-yellow-700 mb-3">
                            You have {legacyCount} recipe{legacyCount !== 1 ? 's' : ''} from our previous system that no longer work. These recipes cannot be viewed and should be removed.
                          </p>
                          <button
                            onClick={handleCleanupLegacy}
                            className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors font-medium"
                          >
                            Remove Old Recipes ({legacyCount})
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}

                {savedRecipes.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-12 text-center">
                    <div className="text-6xl mb-4">❤️</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Saved Recipes Yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Browse recipes and click the heart icon to save your favorites
                    </p>
                    <button
                      onClick={loadSuggestions}
                      className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors font-medium"
                    >
                      Browse Recipes
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedRecipes.map((recipe) => (
                      <RecipeCard
                        key={recipe._id}
                        recipe={{
                          id: recipe.recipeId,
                          title: recipe.title,
                          image: recipe.image,
                          servings: recipe.servings,
                          readyInMinutes: recipe.readyInMinutes
                        }}
                        onClick={() => handleRecipeClick(recipe.recipeId)}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : recipes.length === 0 ? (
              /* Empty State for AI Suggestions/Search */
              <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-12 text-center">
                <div className="text-6xl mb-4">🍳</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No recipes found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or add more items to your grocery list
                </p>
                <button
                  onClick={loadSuggestions}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors font-medium"
                >
                  Get AI Suggestions
                </button>
              </div>
            ) : (
              <>
                {/* Recipe Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onClick={() => handleRecipeClick(recipe.id)}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {activeTab === 'search' && recipes.length < totalResults && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 border border-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Loading...' : 'Load More Recipes'}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Recipe Details Modal */}
      {selectedRecipeId && (
        <RecipeDetailsModal
          recipeId={selectedRecipeId}
          onClose={() => setSelectedRecipeId(null)}
        />
      )}
    </div>
  );
}

export default RecipeSuggestionsPage;

