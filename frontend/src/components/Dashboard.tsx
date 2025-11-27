import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import { UserAvatar } from './UserAvatar';
import { GroceryList } from './GroceryLists/GroceryList';
import NotificationBell from './NotificationBell';

export function Dashboard() {
  const { user } = useAuth();

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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to your Kitchen Dashboard! 🍳
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your smart kitchen companion is ready to help you plan meals, track groceries, and reduce waste.
          </p>
        </div>

        {/* Grocery List Module */}


        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <div className="text-3xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Grocery Lists</h3>
            <p className="text-gray-600 mb-5">Create and manage your shopping lists with smart suggestions.</p>
            
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <div className="text-3xl mb-4">⏰</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Expiry Alerts</h3>
            <p className="text-gray-600">Never waste food again with timely expiry notifications.</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <div className="text-3xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Meal Planning</h3>
            <p className="text-gray-600">Plan meals based on what you have and your preferences.</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-orange-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/groceries"
              className="p-4 text-left border-2 border-dashed border-orange-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors group"
            >
              <div className="text-2xl mb-2">🛒</div>
              <div className="font-medium text-gray-900 group-hover:text-orange-600">Grocery Lists</div>
              <div className="text-sm text-gray-600">Manage your shopping list</div>
            </Link>

            <Link
              to="/recipes"
              className="p-4 text-left border-2 border-dashed border-orange-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors group"
            >
              <div className="text-2xl mb-2">🍳</div>
              <div className="font-medium text-gray-900 group-hover:text-orange-600">Recipe Suggestions</div>
              <div className="text-sm text-gray-600">AI-powered meal ideas</div>
            </Link>

            <Link
              to="/my-recipes"
              className="p-4 text-left border-2 border-dashed border-orange-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors group"
            >
              <div className="text-2xl mb-2">📝</div>
              <div className="font-medium text-gray-900 group-hover:text-orange-600">My Recipes</div>
              <div className="text-sm text-gray-600">Create & manage personal recipes</div>
            </Link>

            <Link
              to="/shared-recipes"
              className="p-4 text-left border-2 border-dashed border-orange-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors group"
            >
              <div className="text-2xl mb-2">🤝</div>
              <div className="font-medium text-gray-900 group-hover:text-orange-600">Shared Recipes</div>
              <div className="text-sm text-gray-600">View recipes shared with you</div>
            </Link>

            <Link
              to="/meal-planner"
              className="p-4 text-left border-2 border-dashed border-orange-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors group"
            >
              <div className="text-2xl mb-2">📅</div>
              <div className="font-medium text-gray-900 group-hover:text-orange-600">Weekly Meal Planner</div>
              <div className="text-sm text-gray-600">Plan your week's meals</div>
            </Link>

            <Link
              to="/analytics-hub"
              className="p-4 text-left border-2 border-dashed border-orange-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors group"
            >
              <div className="text-2xl mb-2">📈</div>
              <div className="font-medium text-gray-900 group-hover:text-orange-600">View Analytics</div>
              <div className="text-sm text-gray-600">Kitchen & calorie tracking</div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
