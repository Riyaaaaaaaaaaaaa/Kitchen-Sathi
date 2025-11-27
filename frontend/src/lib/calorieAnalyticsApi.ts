import { request } from './api';

export interface DayCalorieData {
  day: string; // Mon, Tue, Wed, etc.
  date: string; // YYYY-MM-DD
  consumed: number;
  recommended: number;
  status: 'good' | 'over' | 'under';
  meals: number;
}

export interface CalorieSummary {
  totalConsumed: number;
  totalRecommended: number;
  avgDaily: number;
  overallStatus: 'good' | 'over' | 'under';
}

export interface WeeklyCalorieData {
  recommendedDaily: number;
  weeklyData: DayCalorieData[];
  summary: CalorieSummary;
}

export const getWeeklyCalories = async (): Promise<WeeklyCalorieData> => {
  const response = await request<WeeklyCalorieData>('/api/analytics/weekly-calories', {
    method: 'GET',
  });
  return response;
};

export const consumeMeal = async (data: {
  recipeName: string;
  calories: number;
  consumedAt?: string;
}): Promise<{ success: boolean }> => {
  const response = await request<{ success: boolean }>('/api/meal-plans/consume', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response;
};

