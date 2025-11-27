import React from 'react';
import { RecipeSearchParams } from '../../lib/recipeApi';

interface RecipeFiltersProps {
  filters: RecipeSearchParams;
  onFilterChange: (filters: Partial<RecipeSearchParams>) => void;
  onSearch: () => void;
  onReset: () => void;
}

export function RecipeFilters({ filters, onFilterChange, onSearch, onReset }: RecipeFiltersProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search Query */}
          <div>
            <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="query"
              value={filters.query || ''}
              onChange={(e) => onFilterChange({ query: e.target.value })}
              placeholder="e.g., pasta, chicken..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Diet */}
          <div>
            <label htmlFor="diet" className="block text-sm font-medium text-gray-700 mb-1">
              Diet
            </label>
            <select
              id="diet"
              value={filters.diet || ''}
              onChange={(e) => onFilterChange({ diet: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Any</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="gluten free">Gluten Free</option>
              <option value="ketogenic">Keto</option>
              <option value="paleo">Paleo</option>
              <option value="primal">Primal</option>
              <option value="whole30">Whole 30</option>
            </select>
          </div>

          {/* Cuisine */}
          <div>
            <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 mb-1">
              Cuisine
            </label>
            <select
              id="cuisine"
              value={filters.cuisine || ''}
              onChange={(e) => onFilterChange({ cuisine: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Any</option>
              <option value="african">African</option>
              <option value="american">American</option>
              <option value="british">British</option>
              <option value="cajun">Cajun</option>
              <option value="caribbean">Caribbean</option>
              <option value="chinese">Chinese</option>
              <option value="eastern european">Eastern European</option>
              <option value="european">European</option>
              <option value="french">French</option>
              <option value="german">German</option>
              <option value="greek">Greek</option>
              <option value="indian">Indian</option>
              <option value="irish">Irish</option>
              <option value="italian">Italian</option>
              <option value="japanese">Japanese</option>
              <option value="jewish">Jewish</option>
              <option value="korean">Korean</option>
              <option value="latin american">Latin American</option>
              <option value="mediterranean">Mediterranean</option>
              <option value="mexican">Mexican</option>
              <option value="middle eastern">Middle Eastern</option>
              <option value="nordic">Nordic</option>
              <option value="southern">Southern</option>
              <option value="spanish">Spanish</option>
              <option value="thai">Thai</option>
              <option value="vietnamese">Vietnamese</option>
            </select>
          </div>

          {/* Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              id="type"
              value={filters.type || ''}
              onChange={(e) => onFilterChange({ type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Any</option>
              <option value="main course">Main Course</option>
              <option value="side dish">Side Dish</option>
              <option value="dessert">Dessert</option>
              <option value="appetizer">Appetizer</option>
              <option value="salad">Salad</option>
              <option value="bread">Bread</option>
              <option value="breakfast">Breakfast</option>
              <option value="soup">Soup</option>
              <option value="beverage">Beverage</option>
              <option value="sauce">Sauce</option>
              <option value="marinade">Marinade</option>
              <option value="fingerfood">Finger Food</option>
              <option value="snack">Snack</option>
              <option value="drink">Drink</option>
            </select>
          </div>

          {/* Max Calories */}
          <div>
            <label htmlFor="maxCalories" className="block text-sm font-medium text-gray-700 mb-1">
              Max Calories
            </label>
            <input
              type="number"
              id="maxCalories"
              value={filters.maxCalories || ''}
              onChange={(e) => onFilterChange({ maxCalories: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="e.g., 500"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Max Ready Time */}
          <div>
            <label htmlFor="maxReadyTime" className="block text-sm font-medium text-gray-700 mb-1">
              Max Time (min)
            </label>
            <input
              type="number"
              id="maxReadyTime"
              value={filters.maxReadyTime || ''}
              onChange={(e) => onFilterChange({ maxReadyTime: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="e.g., 30"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Results per page */}
          <div>
            <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
              Results
            </label>
            <select
              id="number"
              value={filters.number || 12}
              onChange={(e) => onFilterChange({ number: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="6">6</option>
              <option value="12">12</option>
              <option value="24">24</option>
              <option value="48">48</option>
            </select>
          </div>

          {/* Use My Ingredients */}
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.useMyIngredients || false}
                onChange={(e) => onFilterChange({ useMyIngredients: e.target.checked })}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="text-sm font-medium text-gray-700">Use my ingredients</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors font-medium"
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </button>
          <button
            type="button"
            onClick={onReset}
            className="px-6 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 border border-gray-300 transition-colors font-medium"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

export default RecipeFilters;

