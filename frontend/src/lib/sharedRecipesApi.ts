import { request } from './api';
import { UserRecipe } from './userRecipesApi';

export interface SharedRecipe {
  _id: string;
  recipeId: UserRecipe;
  ownerId: {
    _id: string;
    name: string;
    email: string;
  };
  sharedWithUserId: {
    _id: string;
    name: string;
    email: string;
  };
  sharedAt: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface UserSearchResult {
  _id: string;
  name: string;
  email: string;
}

// Get recipes shared with me
export async function getReceivedShares(status?: 'pending' | 'accepted' | 'rejected'): Promise<SharedRecipe[]> {
  const params = status ? `?status=${status}` : '';
  return request<SharedRecipe[]>(`/api/shared-recipes/received${params}`);
}

// Get recipes I've shared with others
export async function getSentShares(): Promise<SharedRecipe[]> {
  return request<SharedRecipe[]>('/api/shared-recipes/sent');
}

// Share a recipe with another user
export async function shareRecipe(recipeId: string, userEmail: string, message?: string): Promise<{ message: string; share: SharedRecipe }> {
  return request<{ message: string; share: SharedRecipe }>('/api/shared-recipes/share', {
    method: 'POST',
    body: JSON.stringify({ recipeId, userEmail, message })
  });
}

// Update share status (accept/reject)
export async function updateShareStatus(shareId: string, status: 'accepted' | 'rejected'): Promise<{ message: string; share: SharedRecipe }> {
  return request<{ message: string; share: SharedRecipe }>(`/api/shared-recipes/${shareId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}

// Delete a share (revoke access)
export async function deleteShare(shareId: string): Promise<{ message: string }> {
  return request<{ message: string }>(`/api/shared-recipes/${shareId}`, {
    method: 'DELETE'
  });
}

// Search for users by email
export async function searchUsersByEmail(email: string): Promise<UserSearchResult[]> {
  return request<UserSearchResult[]>(`/api/shared-recipes/users/search?email=${encodeURIComponent(email)}`);
}

// Get shared recipe details by recipe ID (if user has access)
export async function getSharedRecipeByRecipeId(recipeId: string): Promise<UserRecipe> {
  return request<UserRecipe>(`/api/shared-recipes/recipe/${recipeId}`);
}

