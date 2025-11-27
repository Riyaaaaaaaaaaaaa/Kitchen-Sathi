import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { UserAvatar } from './UserAvatar';
import NotificationBell from './NotificationBell';

export function AnalyticsHub() {
  const navigate = useNavigate();

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
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">📈 Analytics Hub</h1>
          <p className="text-xl text-gray-600">Choose the analytics you want to view</p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Kitchen Analytics Card */}
          <button
            onClick={() => navigate('/analytics')}
            className="bg-white rounded-2xl shadow-xl p-8 border-2 border-orange-100 hover:border-orange-300 hover:shadow-2xl transition-all duration-300 text-left group"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="text-7xl">🍳</div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center group-hover:text-orange-600 transition-colors">
              Kitchen Analytics
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Track your grocery usage, meal planning, waste prevention, and estimated savings
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Grocery usage tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Waste prevention metrics</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Estimated savings</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Weekly meal planning stats</span>
              </div>
            </div>
            <div className="mt-6 text-center">
              <span className="inline-flex items-center gap-2 text-orange-600 font-medium group-hover:gap-3 transition-all">
                View Kitchen Analytics
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </button>

          {/* Calorie Tracker Card */}
          <button
            onClick={() => navigate('/calorie-analytics')}
            className="bg-white rounded-2xl shadow-xl p-8 border-2 border-orange-100 hover:border-orange-300 hover:shadow-2xl transition-all duration-300 text-left group"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="text-7xl">🔥</div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center group-hover:text-orange-600 transition-colors">
              Calorie Tracker
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Monitor your weekly calorie consumption vs. recommended daily intake based on your profile
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>BMR-based recommendations</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Weekly consumption tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Visual charts & insights</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Daily status monitoring</span>
              </div>
            </div>
            <div className="mt-6 text-center">
              <span className="inline-flex items-center gap-2 text-orange-600 font-medium group-hover:gap-3 transition-all">
                View Calorie Tracker
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}

export default AnalyticsHub;

