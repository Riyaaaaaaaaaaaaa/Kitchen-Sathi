import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserRecipes, deleteUserRecipe, toggleUserRecipeFavorite, UserRecipe, UserRecipeFilters } from '../../lib/userRecipesApi';
import { Logo } from '../Logo';
import { UserAvatar } from '../UserAvatar';
import NotificationBell from '../NotificationBell';
import { StarRating } from '../StarRating';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../Toast';

export function MyRecipesPage() {
  const navigate = useNavigate();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [recipes, setRecipes] = useState<UserRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserRecipeFilters>({
    search: '',
    cuisine: '',
    diet: '',
    mealType: '',
    favorite: false
  });
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; id: string; name: string }>({
    show: false,
    id: '',
    name: ''
  });

  useEffect(() => {
    fetchRecipes();
  }, [filters]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserRecipes(filters);
      setRecipes(data);
    } catch (err: any) {
      console.error('Error fetching recipes:', err);
      setError(err.message || 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id: string, name: string) => {
    setDeleteModal({ show: true, id, name });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, id: '', name: '' });
  };

  const confirmDelete = async () => {
    try {
      await deleteUserRecipe(deleteModal.id);
      success(`Recipe "${deleteModal.name}" deleted successfully`);
      closeDeleteModal();
      fetchRecipes();
    } catch (err: any) {
      console.error('Error deleting recipe:', err);
      showError(err.message || 'Failed to delete recipe');
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      const result = await toggleUserRecipeFavorite(id);
      success(result.message);
      fetchRecipes();
    } catch (err: any) {
      console.error('Error toggling favorite:', err);
      showError(err.message || 'Failed to update favorite');
    }
  };

  const handleFilterChange = (key: keyof UserRecipeFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      cuisine: '',
      diet: '',
      mealType: '',
      favorite: false
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
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
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📝 My Recipes</h1>
          <p className="text-gray-600">Create & manage your personal recipes</p>
        </div>
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/my-recipes/create')}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Recipe
          </button>

          <div className="text-sm text-gray-600">
            {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search recipes..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />

            <select
              value={filters.cuisine || ''}
              onChange={(e) => handleFilterChange('cuisine', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All Cuisines</option>
              <option value="Indian">Indian</option>
              <option value="Italian">Italian</option>
              <option value="Chinese">Chinese</option>
              <option value="Mexican">Mexican</option>
              <option value="Thai">Thai</option>
              <option value="Japanese">Japanese</option>
            </select>

            <select
              value={filters.diet || ''}
              onChange={(e) => handleFilterChange('diet', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All Diets</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="gluten-free">Gluten-Free</option>
              <option value="dairy-free">Dairy-Free</option>
              <option value="low-carb">Low-Carb</option>
              <option value="keto">Keto</option>
            </select>

            <select
              value={filters.mealType || ''}
              onChange={(e) => handleFilterChange('mealType', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All Meal Types</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
              <option value="dessert">Dessert</option>
            </select>
          </div>

          <div className="flex items-center justify-between mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.favorite || false}
                onChange={(e) => handleFilterChange('favorite', e.target.checked)}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">Show favorites only</span>
            </label>

            <button
              onClick={clearFilters}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
            <span className="ml-3 text-gray-600">Loading recipes...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchRecipes}
              className="mt-2 text-red-700 underline"
            >
              Try again
            </button>
          </div>
        ) : recipes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No recipes yet!</h2>
            <p className="text-gray-600 mb-6">
              {filters.search || filters.cuisine || filters.diet || filters.mealType || filters.favorite
                ? 'No recipes match your filters. Try adjusting your search.'
                : 'Create your first personal recipe to get started.'}
            </p>
            <button
              onClick={() => navigate('/my-recipes/create')}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
            >
              Add Recipe
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div
                key={recipe._id}
                className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Recipe Image */}
                {recipe.image && (
                  <div className="w-full h-48 overflow-hidden">
                    <img
                      src={recipe.image}
                      alt={recipe.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 flex-1 pr-2">
                      {recipe.name}
                    </h3>
                    <button
                      onClick={() => handleToggleFavorite(recipe._id)}
                      className="flex-shrink-0 text-2xl hover:scale-110 transition-transform"
                      aria-label={recipe.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {recipe.isFavorite ? '⭐' : '☆'}
                    </button>
                  </div>

                  {recipe.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {recipe.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    {recipe.cookingTime && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                        🕐 {recipe.cookingTime} min
                      </span>
                    )}
                    {recipe.servings && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                        👥 {recipe.servings} servings
                      </span>
                    )}
                    {recipe.cuisine && (
                      <span className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-full">
                        {recipe.cuisine}
                      </span>
                    )}
                  </div>

                  {recipe.dietLabels.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {recipe.dietLabels.map((diet) => (
                        <span
                          key={diet}
                          className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full"
                        >
                          {diet}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Rating */}
                  {recipe.rating && (
                    <div className="mb-4">
                      <StarRating
                        rating={recipe.rating}
                        readonly
                        size="sm"
                        showLabel
                      />
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => navigate(`/my-recipes/${recipe._id}`)}
                      className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/my-recipes/${recipe._id}/edit`)}
                      className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(recipe._id, recipe.name)}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors text-sm"
                      aria-label="Delete recipe"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
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
              Are you sure you want to delete <span className="font-semibold">"{deleteModal.name}"</span>?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
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

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default MyRecipesPage;

