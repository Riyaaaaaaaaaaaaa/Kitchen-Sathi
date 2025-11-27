// Meal Plan API Client
import { request } from './api';

export interface MealPlanEntry {
  recipeId: number | string; // Support both numeric IDs and Edamam URIs
  title: string;
  image: string;
  servings: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  notes?: string;
}

export interface MealPlan {
  _id?: string;
  userId: string;
  date: string; // YYYY-MM-DD
  meals: MealPlanEntry[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Get meal plans for a date range
 */
export async function getMealPlans(startDate?: string, endDate?: string): Promise<MealPlan[]> {
  const queryParams = new URLSearchParams();
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);

  const url = `/api/meal-plans${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  return request(url);
}

/**
 * Get meal plan for a specific date
 */
export async function getMealPlanForDate(date: string): Promise<MealPlan> {
  return request(`/api/meal-plans/${date}`);
}

/**
 * Create or update meal plan for a date
 */
export async function saveMealPlan(date: string, meals: MealPlanEntry[]): Promise<MealPlan> {
  return request('/api/meal-plans', {
    method: 'POST',
    body: JSON.stringify({ date, meals })
  });
}

/**
 * Add a meal to a specific date
 */
export async function addMealToPlan(
  date: string,
  meal: MealPlanEntry
): Promise<MealPlan> {
  return request(`/api/meal-plans/${date}/meals`, {
    method: 'POST',
    body: JSON.stringify(meal)
  });
}

/**
 * Add a meal plan (alias for addMealToPlan for convenience)
 */
export async function addMealPlan(mealPlanData: {
  date: string;
  mealType: string;
  recipeId: string;
  recipeName: string;
  recipeImage?: string;
  recipeType?: string;
}): Promise<MealPlan> {
  const meal: MealPlanEntry = {
    recipeId: mealPlanData.recipeId,
    title: mealPlanData.recipeName,
    image: mealPlanData.recipeImage || '',
    servings: 1,
    mealType: mealPlanData.mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
    notes: mealPlanData.recipeType ? `Type: ${mealPlanData.recipeType}` : undefined
  };
  
  return addMealToPlan(mealPlanData.date, meal);
}

/**
 * Remove a meal from a date
 */
export async function removeMealFromPlan(
  date: string,
  mealIndex: number
): Promise<MealPlan> {
  return request(`/api/meal-plans/${date}/meals/${mealIndex}`, {
    method: 'DELETE'
  });
}

/**
 * Delete entire meal plan for a date
 */
export async function deleteMealPlan(date: string): Promise<void> {
  return request(`/api/meal-plans/${date}`, {
    method: 'DELETE'
  });
}

/**
 * Get current week's meal plans (Monday-Sunday)
 */
export async function getCurrentWeekMealPlans(): Promise<{
  startDate: string;
  endDate: string;
  mealPlans: MealPlan[];
}> {
  return request('/api/meal-plans/week/current');
}

/**
 * Get week meal plans for a specific date (week containing that date)
 */
export function getWeekDates(date: Date): { startDate: string; endDate: string; dates: string[] } {
  const dayOfWeek = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    dates.push(day.toISOString().split('T')[0]);
  }

  return {
    startDate: monday.toISOString().split('T')[0],
    endDate: sunday.toISOString().split('T')[0],
    dates
  };
}

