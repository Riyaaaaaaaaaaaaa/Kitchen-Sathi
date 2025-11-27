import { useState, useEffect } from 'react';
import { 
  getNotifications, 
  markNotificationAsRead, 
  Notification, 
  ApiError 
} from '../lib/api';

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadNotifications();
  }, [page]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const result = await getNotifications(page, 10);
      setNotifications(result.notifications);
      setTotalPages(result.pagination.pages);
    } catch (err) {
      const error = err as ApiError;
      setError(error.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, status: 'read', readAt: new Date().toISOString() }
            : notif
        )
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'expiry_urgent': return '🚨';
      case 'expiry_warning': return '⚠️';
      case 'expiry_reminder': return '⏰';
      default: return '📢';
    }
  };

  const getNotificationColor = (status: Notification['status']) => {
    switch (status) {
      case 'read': return 'bg-gray-50 border-gray-200';
      case 'delivered': return 'bg-blue-50 border-blue-200';
      case 'failed': return 'bg-red-50 border-red-200';
      default: return 'bg-white border-gray-300';
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold">Notifications</h2>
        <p>Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-red-50 p-4 shadow-sm border-red-200">
        <h2 className="mb-3 font-semibold text-red-800">Notifications</h2>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={loadNotifications}
          className="mt-2 rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="rounded-lg border bg-green-50 p-4 shadow-sm border-green-200">
        <h2 className="mb-3 font-semibold text-green-800">Notifications</h2>
        <p className="text-green-600">🎉 No notifications! You're all caught up.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">Notifications</h2>
        <button 
          onClick={loadNotifications}
          className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-2">
        {notifications.map(notification => (
          <div 
            key={notification.id || notification._id} 
            className={`rounded border p-3 ${getNotificationColor(notification.status)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2">
                <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                <div className="flex-1">
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                    <span>{new Date(notification.sentAt).toLocaleString()}</span>
                    <span>•</span>
                    <span className="capitalize">{notification.deliveryMethod}</span>
                    {notification.metadata?.daysUntilExpiry !== undefined && (
                      <>
                        <span>•</span>
                        <span>{notification.metadata.daysUntilExpiry} days until expiry</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {notification.status === 'sent' && (
                <button
                  onClick={() => handleMarkAsRead(notification.id || notification._id)}
                  className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-600 hover:bg-blue-200"
                >
                  Mark Read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center space-x-2">
          <button
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="rounded bg-gray-200 px-3 py-1 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className="rounded bg-gray-200 px-3 py-1 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
