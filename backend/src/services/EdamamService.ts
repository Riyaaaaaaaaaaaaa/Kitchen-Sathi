import axios, { AxiosInstance } from 'axios';

interface EdamamRecipe {
  uri: string;
  label: string;
  image: string;
  images?: {
    THUMBNAIL?: { url: string };
    SMALL?: { url: string };
    REGULAR?: { url: string };
    LARGE?: { url: string };
  };
  source: string;
  url: string;
  shareAs: string;
  yield: number;
  dietLabels: string[];
  healthLabels: string[];
  cautions: string[];
  ingredientLines: string[];
  ingredients: Array<{
    text: string;
    quantity: number;
    measure: string;
    food: string;
    weight: number;
    foodCategory?: string;
    foodId: string;
    image?: string;
  }>;
  calories: number;
  totalWeight: number;
  totalTime: number;
  cuisineType: string[];
  mealType: string[];
  dishType: string[];
  totalNutrients: {
    [key: string]: {
      label: string;
      quantity: number;
      unit: string;
    };
  };
  totalDaily: {
    [key: string]: {
      label: string;
      quantity: number;
      unit: string;
    };
  };
}

interface EdamamSearchResponse {
  from: number;
  to: number;
  count: number;
  _links: {
    self: { href: string; title: string };
    next?: { href: string; title: string };
  };
  hits: Array<{
    recipe: EdamamRecipe;
    _links: {
      self: { href: string; title: string };
    };
  }>;
}

interface RecipeSearchParams {
  query?: string;
  ingredients?: string[];
  diet?: string;
  cuisineType?: string;
  mealType?: string;
  maxCalories?: number;
  maxTime?: number;
  from?: number;
  to?: number;
}

export class EdamamService {
  private client: AxiosInstance;
  private appId: string;
  private appKey: string;
  private baseUrl = 'https://api.edamam.com/api/recipes/v2';

  constructor() {
    this.appId = process.env.EDAMAM_APP_ID || '';
    this.appKey = process.env.EDAMAM_APP_KEY || '';

    if (!this.appId || !this.appKey) {
      console.error('⚠️  [EdamamService] Missing EDAMAM_APP_ID or EDAMAM_APP_KEY in environment variables');
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en',
        // Add Edamam-Account-User header (required by some Edamam accounts)
        'Edamam-Account-User': process.env.EDAMAM_USER_ID || 'kitchensathi-user'
      }
    });

    console.log('✅ [EdamamService] Initialized with App ID:', this.appId ? 'Present' : 'Missing');
  }

  /**
   * Search recipes with various filters
   */
  async searchRecipes(params: RecipeSearchParams): Promise<{
    recipes: any[];
    totalResults: number;
    from: number;
    to: number;
  }> {
    try {
      console.log('🔍 [EdamamService] Searching recipes with params:', params);

      // Build query string
      let query = params.query || '';
      
      // If ingredients provided (for "Use my ingredients" feature)
      if (params.ingredients && params.ingredients.length > 0) {
        const ingredientsQuery = params.ingredients.join(' ');
        query = query ? `${query} ${ingredientsQuery}` : ingredientsQuery;
        console.log(`🛒 [EdamamService] Using ingredients: ${ingredientsQuery}`);
      }

      // If no query at all, use a default
      if (!query.trim()) {
        query = 'meal'; // Default search
      }

      // Build request parameters
      const requestParams: any = {
        type: 'public',
        app_id: this.appId,
        app_key: this.appKey,
        q: query,
        from: params.from || 0,
        to: params.to || 20
      };

      // Add optional filters
      if (params.diet) {
        requestParams.diet = params.diet.toLowerCase();
      }

      if (params.cuisineType) {
        requestParams.cuisineType = params.cuisineType;
      }

      if (params.mealType) {
        requestParams.mealType = params.mealType;
      }

      if (params.maxCalories) {
        requestParams.calories = `0-${params.maxCalories}`;
      }

      if (params.maxTime) {
        requestParams.time = `0-${params.maxTime}`;
      }

      console.log('📤 [EdamamService] Request params:', requestParams);

      const response = await this.client.get<EdamamSearchResponse>('', {
        params: requestParams
      });

      console.log(`✅ [EdamamService] Found ${response.data.count} recipes`);

      // Transform recipes to our format
      const recipes = response.data.hits.map(hit => this.transformRecipe(hit.recipe, params.ingredients));

      return {
        recipes,
        totalResults: response.data.count,
        from: response.data.from,
        to: response.data.to
      };

    } catch (error: any) {
      console.error('❌ [EdamamService] Search error:', error.response?.data || error.message);
      
      if (error.response?.status === 402) {
        throw new Error('API quota exceeded. Please try again later.');
      }
      
      if (error.response?.status === 401) {
        throw new Error('Invalid API credentials. Please check your Edamam configuration.');
      }

      throw new Error(error.response?.data?.message || 'Failed to search recipes');
    }
  }

  /**
   * Get recipe suggestions based on user's ingredients
   */
  async getRecipeSuggestions(
    userIngredients: string[],
    filters?: {
      diet?: string;
      maxCalories?: number;
      cuisineType?: string;
      mealType?: string;
      maxTime?: number;
      limit?: number;
    }
  ): Promise<{
    recipes: any[];
    matchType: string;
    userIngredients: string[];
  }> {
    try {
      console.log('💡 [EdamamService] Getting suggestions for ingredients:', userIngredients);

      if (userIngredients.length === 0) {
        console.log('⚠️  [EdamamService] No ingredients provided, returning empty results');
        return {
          recipes: [],
          matchType: 'none',
          userIngredients: []
        };
      }

      const result = await this.searchRecipes({
        ingredients: userIngredients,
        diet: filters?.diet,
        cuisineType: filters?.cuisineType,
        mealType: filters?.mealType,
        maxCalories: filters?.maxCalories,
        maxTime: filters?.maxTime,
        from: 0,
        to: filters?.limit || 20
      });

      return {
        recipes: result.recipes,
        matchType: 'ingredient-based',
        userIngredients
      };

    } catch (error: any) {
      console.error('❌ [EdamamService] Suggestions error:', error.message);
      throw error;
    }
  }

  /**
   * Get detailed recipe information by URI
   */
  async getRecipeDetails(recipeUri: string): Promise<any> {
    try {
      console.log('📖 [EdamamService] Getting recipe details for URI:', recipeUri);

      // Extract recipe ID from URI
      const recipeId = this.extractRecipeId(recipeUri);

      const response = await this.client.get<{ recipe: EdamamRecipe }>(`/${recipeId}`, {
        params: {
          type: 'public',
          app_id: this.appId,
          app_key: this.appKey
        }
      });

      console.log('✅ [EdamamService] Recipe details retrieved');

      return this.transformRecipeDetail(response.data.recipe);

    } catch (error: any) {
      console.error('❌ [EdamamService] Recipe details error:', error.response?.data || error.message);
      
      if (error.response?.status === 404) {
        throw new Error('Recipe not found');
      }

      throw new Error(error.response?.data?.message || 'Failed to get recipe details');
    }
  }

  /**
   * Transform Edamam recipe to our frontend format
   */
  private transformRecipe(recipe: EdamamRecipe, userIngredients?: string[]): any {
    // Calculate ingredient matches if user ingredients provided
    let usedIngredientCount = 0;
    let missedIngredientCount = 0;

    if (userIngredients && userIngredients.length > 0) {
      const recipeIngredients = recipe.ingredientLines.map(line => line.toLowerCase());
      
      userIngredients.forEach(userIng => {
        const found = recipeIngredients.some(recipeIng => 
          recipeIng.includes(userIng.toLowerCase())
        );
        if (found) usedIngredientCount++;
      });

      // Estimate missed ingredients (rough calculation)
      missedIngredientCount = Math.max(0, recipe.ingredients.length - usedIngredientCount);
    }

    return {
      id: this.extractRecipeId(recipe.uri),
      uri: recipe.uri,
      title: recipe.label,
      image: recipe.image || recipe.images?.REGULAR?.url || recipe.images?.SMALL?.url || '',
      imageType: 'jpg',
      servings: recipe.yield,
      readyInMinutes: recipe.totalTime || 0,
      sourceUrl: recipe.url,
      cuisines: recipe.cuisineType || [],
      dishTypes: recipe.dishType || [],
      diets: recipe.dietLabels || [],
      healthLabels: recipe.healthLabels || [],
      mealTypes: recipe.mealType || [],
      usedIngredientCount,
      missedIngredientCount,
      likes: 0 // Edamam doesn't provide likes
    };
  }

  /**
   * Transform detailed recipe with full nutrition info
   */
  private transformRecipeDetail(recipe: EdamamRecipe): any {
    const transformed = this.transformRecipe(recipe);

    // Add detailed information
    return {
      ...transformed,
      summary: `${recipe.label} - A delicious ${recipe.mealType?.join(', ')} recipe from ${recipe.source}.`,
      instructions: `Visit the recipe source for detailed cooking instructions: ${recipe.url}`,
      extendedIngredients: recipe.ingredients.map((ing, index) => ({
        id: index,
        name: ing.food,
        original: ing.text,
        amount: ing.quantity,
        unit: ing.measure
      })),
      analyzedInstructions: [{
        name: '',
        steps: [{
          number: 1,
          step: `For detailed cooking instructions, please visit: ${recipe.url}`,
          ingredients: [],
          equipment: []
        }]
      }],
      nutrition: {
        nutrients: this.extractNutrients(recipe.totalNutrients, recipe.yield)
      }
    };
  }

  /**
   * Extract and format nutrients
   */
  private extractNutrients(totalNutrients: any, servings: number): any[] {
    const nutrients = [];
    const nutrientMap: { [key: string]: string } = {
      'ENERC_KCAL': 'Calories',
      'PROCNT': 'Protein',
      'FAT': 'Fat',
      'CHOCDF': 'Carbohydrates',
      'FIBTG': 'Fiber',
      'SUGAR': 'Sugar',
      'NA': 'Sodium',
      'CHOLE': 'Cholesterol'
    };

    for (const [key, label] of Object.entries(nutrientMap)) {
      if (totalNutrients[key]) {
        nutrients.push({
          name: label,
          amount: Math.round(totalNutrients[key].quantity / servings),
          unit: totalNutrients[key].unit
        });
      }
    }

    return nutrients;
  }

  /**
   * Extract recipe ID from Edamam URI
   */
  private extractRecipeId(uri: string): string {
    // Edamam URI format: http://www.edamam.com/ontologies/edamam.owl#recipe_<id>
    const match = uri.match(/recipe_([a-f0-9]+)/);
    return match ? match[1] : uri;
  }

  /**
   * Check if service is properly configured
   */
  isConfigured(): boolean {
    return !!(this.appId && this.appKey);
  }
}

// Export singleton instance
export const edamamService = new EdamamService();

