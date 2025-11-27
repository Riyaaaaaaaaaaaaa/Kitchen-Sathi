import { useState, useEffect } from 'react';
import { 
  getExpiringItems, 
  getExpiredItems, 
  updateItemExpiry, 
  GroceryItem, 
  ApiError 
} from '../lib/api';
// Removed errorHandling import - using simple error display

export function ExpiryAlerts() {
  const [expiringItems, setExpiringItems] = useState<GroceryItem[]>([]);
  const [expiredItems, setExpiredItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExpiryData();
  }, []);

  const loadExpiryData = async () => {
    try {
      setLoading(true);
      const [expiring, expired] = await Promise.all([
        getExpiringItems(7),
        getExpiredItems()
      ]);
      setExpiringItems(expiring);
      setExpiredItems(expired);
    } catch (err) {
      console.error('ExpiryAlerts error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load expiry data');
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getUrgencyColor = (days: number) => {
    if (days <= 0) return 'text-red-600 bg-red-50 border-red-200';
    if (days <= 1) return 'text-red-500 bg-red-50 border-red-200';
    if (days <= 3) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const getUrgencyIcon = (days: number) => {
    if (days <= 0) return '🚨';
    if (days <= 1) return '⚠️';
    if (days <= 3) return '⏰';
    return '📅';
  };

  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold">Expiry Alerts</h2>
        <p>Loading expiry data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-red-50 p-4 shadow-sm border-red-200">
        <h2 className="mb-3 font-semibold text-red-800">Expiry Alerts</h2>
        <div className="text-sm text-red-600">{error}</div>
        <button 
          onClick={loadExpiryData}
          className="mt-2 rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const allExpiryItems = [...expiredItems, ...expiringItems].sort((a, b) => {
    if (!a.expiryDate || !b.expiryDate) return 0;
    return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
  });

  if (allExpiryItems.length === 0) {
    return (
      <div className="rounded-lg border bg-green-50 p-4 shadow-sm border-green-200">
        <h2 className="mb-3 font-semibold text-green-800">Expiry Alerts</h2>
        <p className="text-green-600">🎉 No items expiring soon! All your groceries are fresh.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">Expiry Alerts</h2>
        <button 
          onClick={loadExpiryData}
          className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-2">
        {allExpiryItems.map(item => {
          const days = item.expiryDate ? getDaysUntilExpiry(item.expiryDate) : 0;
          const urgencyColor = getUrgencyColor(days);
          const urgencyIcon = getUrgencyIcon(days);

          return (
            <div key={item.id || item._id} className={`rounded border p-3 ${urgencyColor}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{urgencyIcon}</span>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm opacity-75">
                      {days <= 0 
                        ? 'Expired' 
                        : days === 1 
                        ? 'Expires tomorrow' 
                        : `Expires in ${days} days`
                      }
                    </p>
                    {item.expiryDate && (
                      <p className="text-xs opacity-60">
                        Expiry: {new Date(item.expiryDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{item.quantity} {item.unit}</p>
                  {item.notificationPreferences.enabled && (
                    <p className="text-xs opacity-60">
                      🔔 Notifications enabled
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          {expiredItems.length > 0 && `${expiredItems.length} expired, `}
          {expiringItems.length > 0 && `${expiringItems.length} expiring soon`}
        </p>
      </div>
    </div>
  );
}
