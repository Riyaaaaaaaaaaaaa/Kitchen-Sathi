import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getGroceryList, GroceryItemStatus } from '../../lib/api';

interface GroceryListProps {
  className?: string;
}

export function GroceryList({ className }: GroceryListProps) {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    used: 0,
    expiring: 0
  });
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroceryStats();
  }, []);

  const loadGroceryStats = async () => {
    try {
      const items = await getGroceryList();
      
      const pending = items.filter(item => item.status === GroceryItemStatus.PENDING).length;
      const completed = items.filter(item => item.status === GroceryItemStatus.COMPLETED).length;
      const used = items.filter(item => item.status === GroceryItemStatus.USED).length;
      
      // Calculate expiring items (within 3 days) - matches GroceryListPage logic
      const expiring = items.filter(item => {
        // Count ALL items (PENDING + COMPLETED) expiring in 0-3 days
        // Exclude only USED items (already consumed)
        if (!item.expiryDate || item.status === GroceryItemStatus.USED) return false;
        
        const expiryDate = new Date(item.expiryDate);
        const today = new Date();
        
        // Reset time to midnight for accurate day comparison
        today.setHours(0, 0, 0, 0);
        expiryDate.setHours(0, 0, 0, 0);
        
        // Calculate days difference
        const diffMs = expiryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        
        // Expiring soon = 0 to 3 days from now (today, tomorrow, 2 days, 3 days)
        // Excludes: expired (< 0), distant future (> 3), and used items
        return diffDays >= 0 && diffDays <= 3;
      }).length;

      setStats({
        total: items.length,
        pending,
        completed,
        used,
        expiring
      });

      // Get first 4 recent items
      setRecentItems(items.slice(0, 4));
    } catch (error) {
      console.error('Failed to load grocery stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 border border-orange-100 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
          <span className="ml-3 text-gray-600">Loading grocery list...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border border-orange-100 ${className}`}>
      <div className="flex items-center justify-between mb-6" >
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Grocery List</h2>
          <p className="text-sm text-gray-600 mt-1">Quick overview of your shopping items</p>
        </div>
        <Link
          to="/groceries"
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors font-medium text-sm"
        >
          View Full List →
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-100">
          <div className="text-xl font-bold text-orange-600 flex items-center justify-center gap-1">
            <span className="text-lg">🛒</span>
            {stats.pending}
          </div>
          <div className="text-xs text-orange-700 mt-1">Pending</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
          <div className="text-xl font-bold text-green-600 flex items-center justify-center gap-1">
            <span className="text-lg">✅</span>
            {stats.completed}
          </div>
          <div className="text-xs text-green-700 mt-1">Bought</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="text-xl font-bold text-blue-600 flex items-center justify-center gap-1">
            <span className="text-lg">🍽️</span>
            {stats.used}
          </div>
          <div className="text-xs text-blue-700 mt-1">Used</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-100">
          <div className="text-xl font-bold text-red-600 flex items-center justify-center gap-1">
            <span className="text-lg">⚠️</span>
            {stats.expiring}
          </div>
          <div className="text-xs text-red-700 mt-1">Expiring</div>
        </div>
      </div>

      {/* Recent Items Preview */}
      {recentItems.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Items</h3>
          {recentItems.map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {item.status === GroceryItemStatus.PENDING && <span className="text-lg">🛒</span>}
                {item.status === GroceryItemStatus.COMPLETED && <span className="text-lg">✅</span>}
                {item.status === GroceryItemStatus.USED && <span className="text-lg">🍽️</span>}
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-medium ${
                  item.status === GroceryItemStatus.USED ? 'text-blue-700 line-through' :
                  item.status === GroceryItemStatus.COMPLETED ? 'text-green-700' :
                  'text-gray-900'
                }`}>
                  {item.name}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  {item.quantity} {item.unit}
                </span>
              </div>
              {item.expiryDate && item.status === GroceryItemStatus.PENDING && (() => {
                const expiryDate = new Date(item.expiryDate);
                const today = new Date();
                const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays <= 3 && diffDays >= 0) {
                  return (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full">
                      {diffDays === 0 ? 'Today' : `${diffDays}d`}
                    </span>
                  );
                }
                return null;
              })()}
            </div>
          ))}
          
          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <Link
              to="/groceries"
              className="text-orange-600 hover:text-orange-700 text-sm font-medium inline-flex items-center gap-1"
            >
              View all {stats.total} items
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🛒</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your grocery list is empty</h3>
          <p className="text-gray-600 mb-4">Start adding items to your shopping list</p>
          <Link
            to="/groceries"
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors font-medium"
          >
            Add Items
          </Link>
        </div>
      )}
    </div>
  );
}

export default GroceryList;
