import React, { useState, useEffect } from 'react';
import { getGroceryList, addGroceryItem, updateGroceryItem, deleteGroceryItem, GroceryItem as APIGroceryItem } from '../../lib/api';

// Local interface that matches your API
interface GroceryItem {
  id: string;
  name: string;
  bought: boolean;
  quantity?: number;
  unit?: string;
  createdAt: string;
}

interface GroceryListWithAPIProps {
  className?: string;
}

export function GroceryListWithAPI({ className = '' }: GroceryListWithAPIProps) {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load items from API
  const loadItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const apiItems = await getGroceryList();
      
      // Transform API items to local format
      const transformedItems: GroceryItem[] = apiItems.map(item => ({
        id: item.id || item._id,
        name: item.name,
        bought: item.completed,
        quantity: item.quantity,
        unit: item.unit,
        createdAt: item.createdAt
      }));
      
      setItems(transformedItems);
    } catch (err) {
      console.error('Failed to load grocery list:', err);
      setError('Failed to load grocery list');
    } finally {
      setIsLoading(false);
    }
  };

  // Load items on component mount
  useEffect(() => {
    loadItems();
  }, []);

  // Add new item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newItemName.trim()) {
      setError('Please enter an item name');
      return;
    }

    setIsAdding(true);
    setError(null);

    try {
      const newItem = await addGroceryItem({
        name: newItemName.trim(),
        quantity: 1,
        unit: 'pcs'
      });

      // Add to local state
      const transformedItem: GroceryItem = {
        id: newItem.id || newItem._id,
        name: newItem.name,
        bought: newItem.completed,
        quantity: newItem.quantity,
        unit: newItem.unit,
        createdAt: newItem.createdAt
      };

      setItems(prev => [transformedItem, ...prev]);
      setNewItemName('');
    } catch (err) {
      console.error('Failed to add item:', err);
      setError('Failed to add item');
    } finally {
      setIsAdding(false);
    }
  };

  // Toggle bought status
  const handleToggleBought = async (id: string) => {
    try {
      const item = items.find(i => i.id === id);
      if (!item) return;

      const updatedItem = await updateGroceryItem(id, { 
        completed: !item.bought 
      });

      setItems(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, bought: updatedItem.completed }
            : item
        )
      );
    } catch (err) {
      console.error('Failed to update item:', err);
      setError('Failed to update item');
    }
  };

  // Delete item
  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await deleteGroceryItem(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to delete item:', err);
      setError('Failed to delete item');
    }
  };

  // Clear error when user starts typing
  const handleInputChange = (value: string) => {
    setNewItemName(value);
    if (error) setError(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-orange-100 ${className}`}>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            <span className="ml-3 text-gray-600">Loading grocery list...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-orange-100 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Grocery List</h2>
            <p className="text-sm text-gray-600 mt-1">
              {items.length} items • {items.filter(item => item.bought).length} completed
            </p>
          </div>
          <div className="text-3xl">🛒</div>
        </div>
      </div>

      {/* Add Item Form */}
      <div className="p-6 border-b border-gray-200">
        <form onSubmit={handleAddItem} className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Add new item..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
              disabled={isAdding}
              aria-label="Add grocery item"
            />
          </div>
          <button
            type="submit"
            disabled={isAdding || !newItemName.trim()}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isAdding ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </span>
            ) : (
              'Add Item'
            )}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600" role="alert">{error}</p>
          </div>
        )}
      </div>

      {/* Items List */}
      <div className="p-6">
        {items.length === 0 ? (
          // Empty State
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your grocery list is empty</h3>
            <p className="text-gray-600">Add some items to get started!</p>
          </div>
        ) : (
          // Items List
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                  item.bought 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => handleToggleBought(item.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    item.bought
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                  aria-label={item.bought ? 'Mark as not bought' : 'Mark as bought'}
                >
                  {item.bought && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>

                {/* Item Name */}
                <div className="flex-1">
                  <span
                    className={`text-lg font-medium transition-all ${
                      item.bought 
                        ? 'text-green-700 line-through' 
                        : 'text-gray-900'
                    }`}
                  >
                    {item.name}
                  </span>
                  {item.quantity && item.unit && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({item.quantity} {item.unit})
                    </span>
                  )}
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label={`Delete ${item.name}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {items.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {items.filter(item => !item.bought).length} remaining
            </span>
            <span>
              {Math.round((items.filter(item => item.bought).length / items.length) * 100)}% complete
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroceryListWithAPI;
