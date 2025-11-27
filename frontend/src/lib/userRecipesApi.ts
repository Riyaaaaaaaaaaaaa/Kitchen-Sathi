import { request } from './api';

export interface IIngredient {
  name: string;
  quantity?: string;
  unit?: string;
}

export interface UserRecipe {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  cuisine?: string;
  dietLabels: string[];
  ingredients: IIngredient[];
  instructions: string[];
  cookingTime?: number;
  servings: number;
  mealType?: string;
  tags: string[];
  isFavorite: boolean;
  rating?: number; // 1-5 stars
  image?: string; // Cloudinary URL
  imagePublicId?: string; // Cloudinary public ID
  isPublic: boolean; // Whether recipe can be shared
  shareCount: number; // Number of times recipe has been shared
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRecipeInput {
  name: string;
  description?: string;
  cuisine?: string;
  dietLabels?: string[];
  ingredients: IIngredient[];
  instructions: string[];
  cookingTime?: number;
  servings: number;
  mealType?: string;
  tags?: string[];
}

export interface UserRecipeFilters {
  cuisine?: string;
  diet?: string;
  mealType?: string;
  search?: string;
  favorite?: boolean;
}

// Get all user recipes with optional filters
export async function getUserRecipes(filters?: UserRecipeFilters): Promise<UserRecipe[]> {
  const params = new URLSearchParams();
  
  if (filters?.cuisine) params.append('cuisine', filters.cuisine);
  if (filters?.diet) params.append('diet', filters.diet);
  if (filters?.mealType) params.append('mealType', filters.mealType);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.favorite) params.append('favorite', 'true');
  
  const queryString = params.toString();
  const url = `/api/user-recipes${queryString ? `?${queryString}` : ''}`;
  
  return request<UserRecipe[]>(url);
}

// Get single user recipe by ID
export async function getUserRecipe(id: string): Promise<UserRecipe> {
  return request<UserRecipe>(`/api/user-recipes/${id}`);
}

// Create new user recipe
export async function createUserRecipe(data: CreateUserRecipeInput): Promise<{ message: string; recipe: UserRecipe }> {
  return request<{ message: string; recipe: UserRecipe }>('/api/user-recipes', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// Update existing user recipe
export async function updateUserRecipe(id: string, data: Partial<CreateUserRecipeInput>): Promise<{ message: string; recipe: UserRecipe }> {
  return request<{ message: string; recipe: UserRecipe }>(`/api/user-recipes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

// Delete user recipe
export async function deleteUserRecipe(id: string): Promise<{ message: string }> {
  return request<{ message: string }>(`/api/user-recipes/${id}`, {
    method: 'DELETE'
  });
}

// Toggle favorite status
export async function toggleUserRecipeFavorite(id: string): Promise<{ message: string; recipe: UserRecipe }> {
  return request<{ message: string; recipe: UserRecipe }>(`/api/user-recipes/${id}/favorite`, {
    method: 'PATCH'
  });
}

// Update recipe rating
export async function updateUserRecipeRating(id: string, rating: number | null): Promise<{ message: string; recipe: UserRecipe }> {
  return request<{ message: string; recipe: UserRecipe }>(`/api/user-recipes/${id}/rating`, {
    method: 'PATCH',
    body: JSON.stringify({ rating })
  });
}

// Upload recipe image
export async function uploadRecipeImage(id: string, imageFile: File): Promise<{ message: string; recipe: UserRecipe }> {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  const token = localStorage.getItem('auth_token');
  const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
  
  const res = await fetch(`${API_BASE}/api/user-recipes/${id}/image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to upload image');
  }
  
  return res.json();
}

