import axios from 'axios';

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY || '';
const BASE_URL = 'https://api.spoonacular.com';

export interface RecipeSearchParams {
  ingredients?: string[]; // User's available ingredients
  diet?: string; // vegetarian, vegan, gluten-free, etc.
  maxCalories?: number;
  cuisine?: string;
  type?: string; // main course, side dish, dessert, etc.
  maxReadyTime?: number; // max prep time in minutes
  number?: number; // number of results
  offset?: number; // for pagination
  query?: string; // text search
}

export interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  imageType?: string;
  usedIngredientCount?: number;
  missedIngredientCount?: number;
  missedIngredients?: Array<{
    id: number;
    name: string;
    amount: number;
    unit: string;
  }>;
  usedIngredients?: Array<{
    id: number;
    name: string;
    amount: number;
    unit: string;
  }>;
  likes?: number;
}

export interface RecipeDetail {
  id: number;
  title: string;
  image: string;
  servings: number;
  readyInMinutes: number;
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

export class SpoonacularService {
  /**
   * Search recipes by ingredients (what user has in their grocery list)
   */
  static async searchByIngredients(
    ingredients: string[],
    number: number = 10
  ): Promise<SpoonacularRecipe[]> {
    try {
      const ingredientString = ingredients.join(',');
      
      const response = await axios.get(`${BASE_URL}/recipes/findByIngredients`, {
        params: {
          apiKey: SPOONACULAR_API_KEY,
          ingredients: ingredientString,
          number,
          ranking: 2, // Maximize used ingredients (best match first)
          ignorePantry: true
        }
      });

      console.log(`[Spoonacular] Found ${response.data.length} recipes for ingredients: ${ingredientString}`);
      return response.data;
    } catch (error: any) {
      console.error('[Spoonacular] Error searching by ingredients:', error.message);
      throw new Error('Failed to search recipes by ingredients');
    }
  }

  /**
   * Search recipes with complex filters (diet, calories, cuisine, etc.)
   */
  static async searchComplex(params: RecipeSearchParams): Promise<{ results: SpoonacularRecipe[]; totalResults: number }> {
    try {
      const searchParams: any = {
        apiKey: SPOONACULAR_API_KEY,
        number: params.number || 10,
        offset: params.offset || 0,
        addRecipeInformation: true,
        fillIngredients: true
      };

      if (params.ingredients && params.ingredients.length > 0) {
        searchParams.includeIngredients = params.ingredients.join(',');
      }

      if (params.diet) {
        searchParams.diet = params.diet;
      }

      if (params.maxCalories) {
        searchParams.maxCalories = params.maxCalories;
      }

      if (params.cuisine) {
        searchParams.cuisine = params.cuisine;
      }

      if (params.type) {
        searchParams.type = params.type;
      }

      if (params.maxReadyTime) {
        searchParams.maxReadyTime = params.maxReadyTime;
      }

      if (params.query) {
        searchParams.query = params.query;
      }

      const response = await axios.get(`${BASE_URL}/recipes/complexSearch`, {
        params: searchParams
      });

      console.log(`[Spoonacular] Complex search found ${response.data.totalResults} total recipes`);
      return {
        results: response.data.results || [],
        totalResults: response.data.totalResults || 0
      };
    } catch (error: any) {
      console.error('[Spoonacular] Error in complex search:', error.message);
      throw new Error('Failed to search recipes');
    }
  }

  /**
   * Get detailed recipe information including nutrition and instructions
   */
  static async getRecipeDetails(recipeId: number): Promise<RecipeDetail> {
    try {
      const response = await axios.get(`${BASE_URL}/recipes/${recipeId}/information`, {
        params: {
          apiKey: SPOONACULAR_API_KEY,
          includeNutrition: true
        }
      });

      console.log(`[Spoonacular] Retrieved details for recipe ${recipeId}: ${response.data.title}`);
      return response.data;
    } catch (error: any) {
      console.error(`[Spoonacular] Error getting recipe ${recipeId}:`, error.message);
      throw new Error('Failed to get recipe details');
    }
  }

  /**
   * Get multiple recipe details in bulk (more efficient)
   */
  static async getBulkRecipeDetails(recipeIds: number[]): Promise<RecipeDetail[]> {
    try {
      const idsString = recipeIds.join(',');
      
      const response = await axios.get(`${BASE_URL}/recipes/informationBulk`, {
        params: {
          apiKey: SPOONACULAR_API_KEY,
          ids: idsString,
          includeNutrition: true
        }
      });

      console.log(`[Spoonacular] Retrieved bulk details for ${recipeIds.length} recipes`);
      return response.data;
    } catch (error: any) {
      console.error('[Spoonacular] Error getting bulk recipe details:', error.message);
      throw new Error('Failed to get recipe details');
    }
  }

  /**
   * Get random recipes (for inspiration when no specific ingredients)
   */
  static async getRandomRecipes(params: {
    number?: number;
    tags?: string; // diet tags like vegetarian, vegan
  } = {}): Promise<{ recipes: RecipeDetail[] }> {
    try {
      const response = await axios.get(`${BASE_URL}/recipes/random`, {
        params: {
          apiKey: SPOONACULAR_API_KEY,
          number: params.number || 10,
          tags: params.tags
        }
      });

      console.log(`[Spoonacular] Retrieved ${response.data.recipes.length} random recipes`);
      return response.data;
    } catch (error: any) {
      console.error('[Spoonacular] Error getting random recipes:', error.message);
      throw new Error('Failed to get random recipes');
    }
  }

  /**
   * Check API key validity and usage
   */
  static async checkApiStatus(): Promise<boolean> {
    try {
      // Make a simple request to check if API key works
      await axios.get(`${BASE_URL}/recipes/complexSearch`, {
        params: {
          apiKey: SPOONACULAR_API_KEY,
          number: 1
        }
      });
      return true;
    } catch (error: any) {
      console.error('[Spoonacular] API key check failed:', error.message);
      return false;
    }
  }
}

export default SpoonacularService;

