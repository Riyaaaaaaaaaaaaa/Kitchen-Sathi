import React from 'react';
import { GroceryItemStatus } from '../../lib/api';

interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price?: number; // Optional price in ₹
  expiryDate?: string;
  status: GroceryItemStatus;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  usedAt?: string;
}

interface GroceryItemTableProps {
  items: GroceryItem[];
  onEdit: (item: GroceryItem) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: GroceryItemStatus) => void;
}

export function GroceryItemTable({ items, onEdit, onDelete, onStatusChange }: GroceryItemTableProps) {
  const getDaysUntilExpiry = (expiryDate: string) => {
    const expiryDateTime = new Date(expiryDate);
    const today = new Date();
    
    // Reset both to midnight for accurate day comparison
    today.setHours(0, 0, 0, 0);
    expiryDateTime.setHours(0, 0, 0, 0);
    
    const diffMs = expiryDateTime.getTime() - today.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  const getExpiryStatus = (expiryDate?: string, itemStatus?: GroceryItemStatus) => {
    if (!expiryDate) return null;
    
    const days = getDaysUntilExpiry(expiryDate);
    
    // Used/consumed items - always gray (no longer relevant)
    const isUsed = itemStatus === GroceryItemStatus.USED;
    
    // Expired items - gray for used, red for pending/completed
    if (days < 0) {
      return { 
        text: 'Expired', 
        color: isUsed ? 'text-gray-500 bg-gray-50' : 'text-red-600 bg-red-50'
      };
    }
    
    // Expiring soon (0-3 days) - highlight if PENDING or COMPLETED, gray if USED
    if (days === 0) {
      return { 
        text: 'Expires today', 
        color: isUsed ? 'text-gray-500 bg-gray-50' : 'text-red-600 bg-red-50 font-semibold'
      };
    }
    if (days === 1) {
      return { 
        text: 'Expires tomorrow', 
        color: isUsed ? 'text-gray-500 bg-gray-50' : 'text-orange-600 bg-orange-50 font-medium'
      };
    }
    if (days <= 3) {
      return { 
        text: `Expires in ${days} days`, 
        color: isUsed ? 'text-gray-500 bg-gray-50' : 'text-yellow-600 bg-yellow-50'
      };
    }
    
    // 4+ days away - safe, use subtle color
    return { 
      text: `Expires in ${days} days`, 
      color: 'text-gray-600 bg-gray-50' 
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusConfig = (status: GroceryItemStatus) => {
    switch (status) {
      case GroceryItemStatus.PENDING:
        return {
          icon: '🛒',
          label: 'Pending',
          color: 'text-orange-700 bg-orange-100 border-orange-200',
          textColor: 'text-gray-900',
          bgColor: 'bg-white hover:bg-orange-50'
        };
      case GroceryItemStatus.COMPLETED:
        return {
          icon: '✅',
          label: 'Bought',
          color: 'text-green-700 bg-green-100 border-green-200',
          textColor: 'text-green-900',
          bgColor: 'bg-green-50 hover:bg-green-100'
        };
      case GroceryItemStatus.USED:
        return {
          icon: '🍽️',
          label: 'Used',
          color: 'text-blue-700 bg-blue-100 border-blue-200',
          textColor: 'text-blue-900 line-through',
          bgColor: 'bg-blue-50 hover:bg-blue-100'
        };
      default:
        return {
          icon: '❓',
          label: 'Unknown',
          color: 'text-gray-700 bg-gray-100 border-gray-200',
          textColor: 'text-gray-900',
          bgColor: 'bg-white hover:bg-gray-50'
        };
    }
  };

  const getNextStatus = (currentStatus: GroceryItemStatus): GroceryItemStatus | null => {
    switch (currentStatus) {
      case GroceryItemStatus.PENDING:
        return GroceryItemStatus.COMPLETED;
      case GroceryItemStatus.COMPLETED:
        return GroceryItemStatus.USED;
      default:
        return null; // Can't progress from USED
    }
  };

  const handleStatusClick = (item: GroceryItem) => {
    const nextStatus = getNextStatus(item.status);
    if (nextStatus) {
      onStatusChange(item.id, nextStatus);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-orange-100 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expiry
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Added
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => {
              const expiryStatus = getExpiryStatus(item.expiryDate, item.status);
              const statusConfig = getStatusConfig(item.status);
              const nextStatus = getNextStatus(item.status);
              
              return (
                <tr key={item.id} className={`transition-colors ${statusConfig.bgColor}`}>
                  {/* Status Button */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleStatusClick(item)}
                      disabled={!nextStatus}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusConfig.color} text-xs font-medium transition-all ${
                        nextStatus ? 'hover:scale-105 cursor-pointer' : 'cursor-default opacity-75'
                      }`}
                      title={nextStatus ? `Click to mark as ${getStatusConfig(nextStatus).label}` : 'Final status'}
                    >
                      <span>{statusConfig.icon}</span>
                      <span>{statusConfig.label}</span>
                      {nextStatus && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </button>
                  </td>

                  {/* Item Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${statusConfig.textColor}`}>
                        {item.name}
                      </span>
                    </div>
                  </td>

                  {/* Quantity */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {item.quantity} {item.unit}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.price ? (
                      <span className="text-sm font-medium text-green-700">
                        ₹{item.price.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400 italic">No price</span>
                    )}
                  </td>

                  {/* Expiry */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {expiryStatus ? (
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900">
                          {formatDate(item.expiryDate!)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full inline-block w-fit mt-1 ${expiryStatus.color}`}>
                          {expiryStatus.text}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No expiry date</span>
                    )}
                  </td>

                  {/* Added/Used Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.status === GroceryItemStatus.USED && item.usedAt ? (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Used:</span>
                        <span>{formatDate(item.usedAt)}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Added:</span>
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {item.status === GroceryItemStatus.USED ? (
                        <div className="text-xs text-gray-400 italic px-2">
                          View only
                        </div>
                      ) : (
                        <button
                          onClick={() => onEdit(item)}
                          className="text-orange-600 hover:text-orange-700 p-2 hover:bg-orange-50 rounded-lg transition-colors"
                          aria-label={`Edit ${item.name}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(item.id)}
                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label={`Delete ${item.name}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        {items.map((item) => {
          const expiryStatus = getExpiryStatus(item.expiryDate, item.status);
          const statusConfig = getStatusConfig(item.status);
          const nextStatus = getNextStatus(item.status);
          
          return (
            <div key={item.id} className={`p-4 border-b border-gray-200 last:border-b-0 ${statusConfig.bgColor}`}>
              <div className="flex items-start gap-3">
                {/* Status Badge */}
                <button
                  onClick={() => handleStatusClick(item)}
                  disabled={!nextStatus}
                  className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full border ${statusConfig.color} text-xs font-medium transition-all ${
                    nextStatus ? 'hover:scale-105' : 'opacity-75'
                  }`}
                  title={nextStatus ? `Click to mark as ${getStatusConfig(nextStatus).label}` : 'Final status'}
                >
                  <span>{statusConfig.icon}</span>
                  <span className="hidden sm:inline">{statusConfig.label}</span>
                </button>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-base font-medium ${statusConfig.textColor}`}>
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 ml-2">
                      {item.status === GroceryItemStatus.USED ? (
                        <span className="text-xs text-gray-400 italic">View only</span>
                      ) : (
                        <button
                          onClick={() => onEdit(item)}
                          className="text-orange-600 hover:text-orange-700 p-2 hover:bg-orange-50 rounded-lg transition-colors"
                          aria-label={`Edit ${item.name}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(item.id)}
                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label={`Delete ${item.name}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-gray-600">
                        {item.quantity} {item.unit}
                      </p>
                      {item.price && (
                        <p className="text-sm font-medium text-green-700">
                          ₹{item.price.toFixed(2)}
                        </p>
                      )}
                    </div>
                    
                    {expiryStatus ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          Expires: {formatDate(item.expiryDate!)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${expiryStatus.color}`}>
                          {expiryStatus.text}
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No expiry date</p>
                    )}
                    
                    {item.status === GroceryItemStatus.USED && item.usedAt ? (
                      <p className="text-xs text-gray-500">
                        Used: {formatDate(item.usedAt)}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500">
                        Added: {formatDate(item.createdAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GroceryItemTable;
