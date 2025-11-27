import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getGroceryList, 
  addGroceryItem, 
  updateGroceryItem, 
  deleteGroceryItem, 
  markItemCompleted,
  markItemUsed,
  updateItemStatus,
  GroceryItem as APIGroceryItem,
  GroceryItemStatus 
} from '../../lib/api';
import { GroceryItemForm } from './GroceryItemForm';
import { GroceryItemTable } from './GroceryItemTable';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { Logo } from '../Logo';
import { UserAvatar } from '../UserAvatar';
import NotificationBell from '../NotificationBell';

interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price?: number; // Optional price in ₹
  expiryDate?: string;
  status: GroceryItemStatus;
  completed: boolean; // Deprecated
  createdAt: string;
  updatedAt: string;
  usedAt?: string;
}

interface GroceryListPageProps {
  className?: string;
}

export function GroceryListPage({ className = '' }: GroceryListPageProps) {
  const navigate = useNavigate();
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'used'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; item: GroceryItem | null }>({ 
    show: false, 
    item: null 
  });

  // Load items from API
  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiItems = await getGroceryList();
      
      // Transform API items to local format
      const transformedItems: GroceryItem[] = apiItems.map(item => ({
        id: item.id || item._id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
        expiryDate: item.expiryDate,
        status: item.status || GroceryItemStatus.PENDING,
        completed: item.completed, // Keep for backward compatibility
        createdAt: item.createdAt,
        updatedAt: item.updatedAt || item.createdAt,
        usedAt: item.usedAt
      }));
      
      setItems(transformedItems);
    } catch (err) {
      console.error('Failed to load grocery list:', err);
      setError('Failed to load grocery list');
    } finally {
      setLoading(false);
    }
  };

  // Load items on component mount
  useEffect(() => {
    loadItems();
  }, []);

  // Add new item
  const handleAddItem = async (itemData: Omit<GroceryItem, 'id' | 'status' | 'completed' | 'createdAt' | 'updatedAt' | 'usedAt'>) => {
    try {
      setError(null);
      
      const newItem = await addGroceryItem({
        name: itemData.name,
        quantity: itemData.quantity,
        unit: itemData.unit,
        price: itemData.price,
        expiryDate: itemData.expiryDate
      });

      const transformedItem: GroceryItem = {
        id: newItem.id || newItem._id,
        name: newItem.name,
        quantity: newItem.quantity,
        unit: newItem.unit,
        price: newItem.price,
        expiryDate: newItem.expiryDate,
        status: newItem.status || GroceryItemStatus.PENDING,
        completed: newItem.completed,
        createdAt: newItem.createdAt,
        updatedAt: newItem.updatedAt || newItem.createdAt,
        usedAt: newItem.usedAt
      };

      setItems(prev => [transformedItem, ...prev]);
      setShowForm(false);
    } catch (err) {
      console.error('Failed to add item:', err);
      setError('Failed to add item');
    }
  };

  // Update existing item
  const handleUpdateItem = async (id: string, updates: Partial<GroceryItem>) => {
    try {
      setError(null);
      console.log(`🔄 [handleUpdateItem] Updating item ${id} with:`, updates);
      
      const updatedItem = await updateGroceryItem(id, {
        name: updates.name,
        quantity: updates.quantity,
        unit: updates.unit,
        price: updates.price,
        completed: updates.completed,
        expiryDate: updates.expiryDate
      });

      console.log(`✅ [handleUpdateItem] Received from API:`, updatedItem);

      // GUARANTEED FIX: Reload all items from server
      console.log(`🔄 [handleUpdateItem] Reloading all items to ensure sync...`);
      await loadItems();
      
      setEditingItem(null);
      console.log(`✅ [handleUpdateItem] Update complete! UI refreshed.`);
    } catch (err) {
      console.error('❌ [handleUpdateItem] Failed to update item:', err);
      setError('Failed to update item');
    }
  };

  // Delete item - show confirmation modal
  const handleDeleteItem = (id: string) => {
    const itemToDelete = items.find(item => item.id === id);
    if (itemToDelete) {
      setDeleteConfirm({ show: true, item: itemToDelete });
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!deleteConfirm.item) return;

    try {
      setError(null);
      await deleteGroceryItem(deleteConfirm.item.id);
      setItems(prev => prev.filter(item => item.id !== deleteConfirm.item!.id));
      setDeleteConfirm({ show: false, item: null });
    } catch (err) {
      console.error('Failed to delete item:', err);
      setError('Failed to delete item');
      setDeleteConfirm({ show: false, item: null });
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirm({ show: false, item: null });
  };

  // Handle status transitions
  const handleStatusChange = async (id: string, newStatus: GroceryItemStatus) => {
    try {
      setError(null);
      console.log(`🔄 [GroceryListPage] Status change requested: ${id} → ${newStatus}`);
      
      let updatedItem;
      
      switch (newStatus) {
        case GroceryItemStatus.COMPLETED:
          console.log(`📞 Calling markItemCompleted(${id})`);
          updatedItem = await markItemCompleted(id);
          break;
        case GroceryItemStatus.USED:
          console.log(`📞 Calling markItemUsed(${id})`);
          updatedItem = await markItemUsed(id);
          break;
        case GroceryItemStatus.PENDING:
          console.log(`📞 Calling updateItemStatus(${id}, 'pending')`);
          updatedItem = await updateItemStatus(id, GroceryItemStatus.PENDING);
          break;
        default:
          console.log(`📞 Calling updateItemStatus(${id}, '${newStatus}')`);
          updatedItem = await updateItemStatus(id, newStatus);
      }

      console.log(`✅ Status update successful:`, updatedItem);

      const transformedItem: GroceryItem = {
        id: updatedItem.id || updatedItem._id,
        name: updatedItem.name,
        quantity: updatedItem.quantity,
        unit: updatedItem.unit,
        price: updatedItem.price, // ✅ FIXED: Include price from API response
        expiryDate: updatedItem.expiryDate,
        status: updatedItem.status || GroceryItemStatus.PENDING,
        completed: updatedItem.completed,
        createdAt: updatedItem.createdAt,
        updatedAt: updatedItem.updatedAt || updatedItem.createdAt,
        usedAt: updatedItem.usedAt
      };

      console.log(`✅ Transformed item with price: ${transformedItem.price}`);
      setItems(prev => prev.map(item => item.id === id ? transformedItem : item));
    } catch (err: any) {
      console.error('❌ [GroceryListPage] Failed to update item status:', {
        itemId: id,
        targetStatus: newStatus,
        error: err
      });
      
      // Extract detailed error message
      const errorMessage = err.message || 
                          err.error || 
                          (typeof err === 'string' ? err : 'Failed to update item status');
      
      setError(`Status Update Failed: ${errorMessage}`);
      
      // Also show in console for debugging
      console.error('Full error details:', err);
    }
  };

  // Filter items based on current filter
  const filteredItems = items.filter(item => {
    switch (filter) {
      case 'pending':
        return item.status === GroceryItemStatus.PENDING;
      case 'completed':
        return item.status === GroceryItemStatus.COMPLETED;
      case 'used':
        return item.status === GroceryItemStatus.USED;
      default:
        return true;
    }
  });

  // Get statistics
  const stats = {
    total: items.length,
    pending: items.filter(item => item.status === GroceryItemStatus.PENDING).length,
    completed: items.filter(item => item.status === GroceryItemStatus.COMPLETED).length,
    used: items.filter(item => item.status === GroceryItemStatus.USED).length,
    expiring: items.filter(item => {
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
    }).length
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-orange-50 to-white ${className}`}>
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
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🛒 Grocery List</h1>
          <p className="text-gray-600">Manage your shopping items</p>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📊</span>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="text-sm text-gray-600">Total Items</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 shadow-sm border border-orange-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🛒</span>
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            </div>
            <div className="text-sm text-orange-700">Pending (To Buy)</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 shadow-sm border border-green-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">✅</span>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </div>
            <div className="text-sm text-green-700">Completed (Bought)</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🍽️</span>
              <div className="text-2xl font-bold text-blue-600">{stats.used}</div>
            </div>
            <div className="text-sm text-blue-700">Used (Consumed)</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 shadow-sm border border-red-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⚠️</span>
              <div className="text-2xl font-bold text-red-600">{stats.expiring}</div>
            </div>
            <div className="text-sm text-red-700">Expiring Soon</div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors font-medium"
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Item
              </button>
              
              <div className="flex items-center gap-2">
                <label htmlFor="filter" className="text-sm font-medium text-gray-700">Filter:</label>
                <select
                  id="filter"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Items</option>
                  <option value="pending">🛒 Pending (To Buy)</option>
                  <option value="completed">✅ Completed (Bought)</option>
                  <option value="used">🍽️ Used (Consumed)</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Showing {filteredItems.length} of {items.length} items
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
              <span className="ml-3 text-gray-600">Loading grocery list...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Grocery Items Table */}
            <GroceryItemTable
              items={filteredItems}
              onEdit={setEditingItem}
              onDelete={handleDeleteItem}
              onStatusChange={handleStatusChange}
            />

            {/* Empty State */}
            {filteredItems.length === 0 && !loading && (
              <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-12 text-center">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filter === 'all' ? 'Your grocery list is empty' : `No ${filter} items`}
                </h3>
                <p className="text-gray-600 mb-6">
                  {filter === 'all' 
                    ? 'Add some items to get started with your shopping list.'
                    : `Try switching to a different filter or add new items.`
                  }
                </p>
                {filter === 'all' && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors font-medium"
                  >
                    Add Your First Item
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Add/Edit Form Modal */}
        {(showForm || editingItem) && (
          <GroceryItemForm
            item={editingItem}
            onSubmit={editingItem ? 
              (data) => handleUpdateItem(editingItem.id, data) : 
              handleAddItem
            }
            onClose={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
          />
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={deleteConfirm.show}
          itemName={deleteConfirm.item?.name || ''}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      </main>
    </div>
  );
}

export default GroceryListPage;
