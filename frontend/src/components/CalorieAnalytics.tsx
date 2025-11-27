import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getWeeklyCalories, WeeklyCalorieData } from '../lib/calorieAnalyticsApi';
import { Logo } from './Logo';
import { UserAvatar } from './UserAvatar';
import NotificationBell from './NotificationBell';
import { Link } from 'react-router-dom';

export function CalorieAnalytics() {
  const [data, setData] = useState<WeeklyCalorieData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const weeklyData = await getWeeklyCalories();
      setData(weeklyData);
    } catch (err: any) {
      console.error('Failed to load calorie analytics:', err);
      setError(err.message || 'Failed to load calorie analytics');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: 'good' | 'over' | 'under'): string => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'over':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'under':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: 'good' | 'over' | 'under'): string => {
    switch (status) {
      case 'good':
        return 'On Track ✓';
      case 'over':
        return 'Over Limit';
      case 'under':
        return 'Under Goal';
      default:
        return 'Unknown';
    }
  };

  const getStatusIcon = (status: 'good' | 'over' | 'under'): string => {
    switch (status) {
      case 'good':
        return '✓';
      case 'over':
        return '⚠️';
      case 'under':
        return '⬇️';
      default:
        return '•';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
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
        <Link 
          to="/dashboard" 
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Weekly Calorie Overview</h1>
          <p className="text-gray-600">Track your calorie consumption vs recommended daily intake</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-1">Unable to Load Analytics</h3>
                <p className="text-red-700 mb-4">{error}</p>
                {error.includes('profile') && (
                  <Link 
                    to="/dashboard" 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Complete Your Profile
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Data Display */}
        {!loading && !error && data && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Recommended Daily */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Recommended Daily</p>
                    <p className="text-2xl font-bold text-gray-900">{data.recommendedDaily.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">calories</p>
                  </div>
                </div>
              </div>

              {/* Average Daily */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📈</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Your Average</p>
                    <p className="text-2xl font-bold text-gray-900">{data.summary.avgDaily.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">calories/day</p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    data.summary.overallStatus === 'good' ? 'bg-green-100' :
                    data.summary.overallStatus === 'over' ? 'bg-orange-100' : 'bg-red-100'
                  }`}>
                    <span className="text-2xl">{getStatusIcon(data.summary.overallStatus)}</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Overall Status</p>
                    <p className="text-2xl font-bold text-gray-900">{getStatusLabel(data.summary.overallStatus)}</p>
                    <p className="text-xs text-gray-500">this week</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Daily Comparison</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#6b7280"
                    style={{ fontSize: '14px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '14px' }}
                    label={{ value: 'Calories', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '12px'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="consumed" 
                    fill="#f97316" 
                    name="Consumed" 
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar 
                    dataKey="recommended" 
                    fill="#10b981" 
                    name="Recommended" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Daily Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Daily Breakdown</h2>
              <div className="space-y-4">
                {data.weeklyData.map((day, index) => {
                  const diff = day.consumed - day.recommended;
                  const diffLabel = diff > 0 ? `+${diff}` : diff.toString();
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[60px]">
                          <p className="text-sm font-semibold text-gray-900">{day.day}</p>
                          <p className="text-xs text-gray-500">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-gray-900">{day.consumed.toLocaleString()} cal</p>
                          <p className="text-sm text-gray-600">{day.meals} meal{day.meals !== 1 ? 's' : ''} consumed</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            diff === 0 ? 'text-gray-600' :
                            diff > 0 ? 'text-orange-600' : 'text-blue-600'
                          }`}>
                            {diff === 0 ? 'Perfect!' : diffLabel}
                          </p>
                          <p className="text-xs text-gray-500">vs {day.recommended} cal</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(day.status)}`}>
                          {getStatusLabel(day.status)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Info Note */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">How it works:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Recommended calories are calculated based on your age, gender, weight, and height</li>
                    <li>Assumes moderate activity level (1.55x multiplier)</li>
                    <li>Green status: Within 200 calories of recommended</li>
                    <li>Orange status: Over by 200-500 calories</li>
                    <li>Red status: Over by 500+ or under by 200+ calories</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

