// Analytics API Client
import { request } from './api';

export interface AnalyticsSummary {
  groceries: {
    total: number;
    byStatus: Array<{
      _id: string;
      count: number;
    }>;
    topItems: Array<{
      _id: string;
      count: number;
      totalQuantity: number;
    }>;
    wastePreventionRate: number;
    expiringSoon: number;
    statusCounts: {
      pending: number;
      completed: number;
      used: number;
    };
  };
  meals: {
    total: number;
    thisWeek: number;
    byType: Array<{
      _id: string;
      count: number;
    }>;
  };
  savings: {
    estimated: number;
  };
}

export interface TrendsData {
  dailyStats: Array<{
    _id: string; // Date in YYYY-MM-DD format
    added: number;
    completed: number;
    used: number;
  }>;
}

/**
 * Get analytics summary
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  return request('/api/analytics/summary');
}

/**
 * Get trends data (last 30 days)
 */
export async function getAnalyticsTrends(): Promise<TrendsData> {
  return request('/api/analytics/trends');
}

