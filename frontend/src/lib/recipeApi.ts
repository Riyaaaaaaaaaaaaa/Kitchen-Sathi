// Recipe API Client
import { request } from './api';

export interface Recipe {
  id: number;
  title: string;
  image: string;
  imageType?: string;
  usedIngredientCount?: number;
  missedIngredientCount?: number;
  servings?: number;
  readyInMinutes?: number;
  likes?: number;
}

export interface RecipeDetail extends Recipe {
  sourceUrl: string;
  summary: string;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  instructions: string;
  analyzedInstructions: Array<{
    name: string;
    steps: Array<{
      number: number;
      step: string;
      ingredients: Array<{
        id: number;
        name: string;
      }>;
      equipment: Array<{
        id: number;
        name: string;
      }>;
    }>;
  }>;
  extendedIngredients: Array<{
    id: number;
    name: string;
    original: string;
    amount: number;
    unit: string;
  }>;
  nutrition?: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
}

export interface SavedRecipe {
  _id: string;
  userId: string;
  recipeId: number;
  title: string;
  image: string;
  servings: number;
  readyInMinutes: number;
  sourceUrl?: string;
  summary?: string;
  cuisines?: string[];
  diets?: string[];
  savedAt: string;
  notes?: string;
  rating?: number;
}

export interface RecipeSearchParams {
  query?: string;
  diet?: string;
  maxCalories?: number;
  cuisine?: string;
  type?: string;
  maxReadyTime?: number;
  number?: number;
  offset?: number;
  useMyIngredients?: boolean;
}

/**
 * Get AI recipe suggestions based on user's grocery list
 */
export async function getRecipeSuggestions(params?: {
  diet?: string;
  maxCalories?: number;
  cuisine?: string;
  type?: string;
  maxReadyTime?: number;
  limit?: number;
}): Promise<{
  recipes: Recipe[];
  matchType: string;
  userIngredients: string[];
}> {
  const queryParams = new URLSearchParams();
  if (params?.diet) queryParams.append('diet', params.diet);
  if (params?.maxCalories) queryParams.append('maxCalories', String(params.maxCalories));
  if (params?.cuisine) queryParams.append('cuisine', params.cuisine);
  if (params?.type) queryParams.append('type', params.type);
  if (params?.maxReadyTime) queryParams.append('maxReadyTime', String(params.maxReadyTime));
  if (params?.limit) queryParams.append('limit', String(params.limit));

  const url = `/api/recipes/suggestions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  return request(url);
}

/**
 * Advanced recipe search with complex filters
 */
export async function searchRecipes(params: RecipeSearchParams): Promise<{
  recipes: Recipe[];
  totalResults: number;
  searchParams: RecipeSearchParams;
}> {
  return request('/api/recipes/search', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

/**
 * Get detailed recipe information
 */
export async function getRecipeDetails(recipeId: number): Promise<RecipeDetail> {
  return request(`/api/recipes/${recipeId}`);
}

/**
 * Get user's saved recipes
 */
export async function getSavedRecipes(): Promise<SavedRecipe[]> {
  return request('/api/recipes/saved/list');
}

/**
 * Save a recipe to favorites
 */
export async function saveRecipe(recipe: {
  recipeId: number;
  title: string;
  image: string;
  servings?: number;
  readyInMinutes?: number;
  sourceUrl?: string;
  summary?: string;
  cuisines?: string[];
  diets?: string[];
  notes?: string;
  rating?: number;
}): Promise<SavedRecipe> {
  return request('/api/recipes/saved', {
    method: 'POST',
    body: JSON.stringify(recipe)
  });
}

/**
 * Remove a saved recipe
 */
export async function unsaveRecipe(recipeId: number | string): Promise<void> {
  return request(`/api/recipes/saved/${recipeId}`, {
    method: 'DELETE'
  });
}

/**
 * Update saved recipe (notes, rating)
 */
export async function updateSavedRecipe(
  recipeId: number,
  updates: { notes?: string; rating?: number }
): Promise<SavedRecipe> {
  return request(`/api/recipes/saved/${recipeId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  });
}

/**
 * Check if a recipe is saved
 */
export async function isRecipeSaved(recipeId: number): Promise<boolean> {
  try {
    const savedRecipes = await getSavedRecipes();
    return savedRecipes.some(r => r.recipeId === recipeId);
  } catch (error) {
    return false;
  }
}

/**
 * Clean up legacy Spoonacular saved recipes
 */
export async function cleanupLegacyRecipes(): Promise<{ removed: number; message: string }> {
  return request('/api/recipes/saved/cleanup-legacy', {
    method: 'DELETE'
  });
}

/**
 * Check if saved recipes contain legacy IDs
 */
export function hasLegacyRecipes(savedRecipes: SavedRecipe[]): boolean {
  return savedRecipes.some(recipe => /^\d+$/.test(String(recipe.recipeId)));
}

/**
 * Count legacy recipes
 */
export function countLegacyRecipes(savedRecipes: SavedRecipe[]): number {
  return savedRecipes.filter(recipe => /^\d+$/.test(String(recipe.recipeId))).length;
}

