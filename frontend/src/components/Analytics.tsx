import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAnalyticsSummary, AnalyticsSummary } from '../lib/analyticsApi';
import { Logo } from './Logo';
import { UserAvatar } from './UserAvatar';
import NotificationBell from './NotificationBell';

export function Analytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAnalyticsSummary();
      setAnalytics(data);
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const getStatusPercentage = (count: number, total: number) => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
            <span className="ml-3 text-gray-600">Loading analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadAnalytics}
              className="mt-2 text-red-700 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics || analytics.groceries.total === 0) {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🍳 Your Kitchen Analytics</h1>
            <p className="text-gray-600">Track your progress and reduce waste</p>
          </div>
          {/* Empty State */}
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-12 text-center">
            <div className="text-6xl mb-4">🍳</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Data Yet!</h2>
            <p className="text-gray-600 mb-6">
              Start tracking groceries and planning meals to see your analytics.
            </p>
            <button
              onClick={() => navigate('/groceries')}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
            >
              Add Grocery Items
            </button>
          </div>
        </main>
      </div>
    );
  }

  const { groceries, meals, savings } = analytics;
  const totalGroceries = groceries.total;
  const { pending, completed, used } = groceries.statusCounts;

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🍳 Your Kitchen Analytics</h1>
          <p className="text-gray-600">Track your progress and reduce waste</p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Items */}
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">🛒</div>
              <div className="text-sm text-gray-500">All Time</div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{totalGroceries}</div>
            <div className="text-sm text-gray-600">Total Items Tracked</div>
          </div>

          {/* Weekly Meals */}
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">🍽️</div>
              <div className="text-sm text-gray-500">This Week</div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{meals.thisWeek}</div>
            <div className="text-sm text-gray-600">Meals Planned</div>
          </div>

          {/* Waste Prevention */}
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">🎯</div>
              <div className="text-sm text-gray-500">Success Rate</div>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">{groceries.wastePreventionRate}%</div>
            <div className="text-sm text-gray-600">Items Used Before Expiry</div>
          </div>

          {/* Estimated Savings */}
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">💰</div>
              <div className="text-sm text-gray-500">Saved</div>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">₹{Number(savings.estimated).toFixed(2)}</div>
            <div className="text-sm text-gray-600">Estimated Savings</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Grocery Status Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Grocery Status Distribution</h2>
            
            {/* Bar Chart */}
            <div className="space-y-4 mb-6">
              {/* Pending */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Pending</span>
                  <span className="text-sm text-gray-600">{pending} ({getStatusPercentage(pending, totalGroceries)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-yellow-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${getStatusPercentage(pending, totalGroceries)}%` }}
                  />
                </div>
              </div>

              {/* Completed (Bought) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Bought</span>
                  <span className="text-sm text-gray-600">{completed} ({getStatusPercentage(completed, totalGroceries)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${getStatusPercentage(completed, totalGroceries)}%` }}
                  />
                </div>
              </div>

              {/* Used (Consumed) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Consumed</span>
                  <span className="text-sm text-gray-600">{used} ({getStatusPercentage(used, totalGroceries)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${getStatusPercentage(used, totalGroceries)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded" />
                <span className="text-sm text-gray-600">Pending: {pending}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded" />
                <span className="text-sm text-gray-600">Bought: {completed}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded" />
                <span className="text-sm text-gray-600">Consumed: {used}</span>
              </div>
            </div>
          </div>

          {/* Top Items */}
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Most Frequently Bought Items</h2>
            
            {groceries.topItems.length > 0 ? (
              <div className="space-y-4">
                {groceries.topItems.map((item, index) => (
                  <div key={item._id} className="flex items-center gap-4 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 capitalize">{item._id}</div>
                      <div className="text-sm text-gray-600">Bought {item.count} times</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-orange-600">{item.totalQuantity}</div>
                      <div className="text-xs text-gray-500">total qty</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No items tracked yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Meal Planning Stats */}
        {meals.total > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-orange-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Meal Planning Overview</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {meals.byType.map((mealType) => {
                const emoji = 
                  mealType._id === 'breakfast' ? '🍳' :
                  mealType._id === 'lunch' ? '😋' :
                  mealType._id === 'dinner' ? '🌙' :
                  '🍿';
                
                return (
                  <div key={mealType._id} className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">{emoji}</div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{mealType.count}</div>
                    <div className="text-sm text-gray-600 capitalize">{mealType._id}</div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="font-medium text-gray-900">Total Meals Planned: {meals.total}</div>
                  <div className="text-sm text-gray-600">Keep up the great planning!</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expiring Soon Alert */}
        {groceries.expiringSoon > 0 && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-yellow-900 mb-1">Items Expiring Soon</h3>
                <p className="text-yellow-700 mb-4">
                  You have {groceries.expiringSoon} item{groceries.expiringSoon !== 1 ? 's' : ''} expiring in the next 7 days.
                </p>
                <button
                  onClick={() => navigate('/groceries')}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
                >
                  View Grocery List
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Analytics;

