import { useState } from 'react';
import { updateItemExpiry, GroceryItem, ApiError } from '../lib/api';
// Removed errorHandling imports - using simple error display

interface ExpirySettingsProps {
  item: GroceryItem;
  onUpdate: (updatedItem: GroceryItem) => void;
  onClose: () => void;
}

export function ExpirySettings({ item, onUpdate, onClose }: ExpirySettingsProps) {
  const [expiryDate, setExpiryDate] = useState(
    item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : ''
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    item.notificationPreferences.enabled
  );
  const [emailNotifications, setEmailNotifications] = useState(
    item.notificationPreferences.emailNotifications
  );
  const [inAppNotifications, setInAppNotifications] = useState(
    item.notificationPreferences.inAppNotifications
  );
  const [daysBeforeExpiry, setDaysBeforeExpiry] = useState(
    item.notificationPreferences.daysBeforeExpiry.join(', ')
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      const parsedDays = daysBeforeExpiry
        .split(',')
        .map(d => parseInt(d.trim()))
        .filter(d => !isNaN(d) && d >= 0 && d <= 30);

      // Format expiry date to full ISO string if provided
      const formattedExpiryDate = expiryDate 
        ? new Date(expiryDate + 'T00:00:00.000Z').toISOString()
        : undefined;

      console.log('Original date:', expiryDate);
      console.log('Formatted ISO date:', formattedExpiryDate);

      const updatedItem = await updateItemExpiry(item.id || item._id, {
        expiryDate: formattedExpiryDate,
        notificationPreferences: {
          enabled: notificationsEnabled,
          daysBeforeExpiry: parsedDays.length > 0 ? parsedDays : [1, 3, 7],
          emailNotifications,
          inAppNotifications,
        },
      });

      onUpdate(updatedItem);
      onClose();
    } catch (err) {
      console.error('ExpirySettings error:', err);

      // Simple error handling
      const errorMessage = err instanceof Error ? err.message : 'Failed to update expiry settings';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Expiry Settings for {item.name}</h3>

        <div className="space-y-4">
          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              When will this item expire? Leave empty if no expiry date.
            </p>
            {fieldErrors.expiryDate && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.expiryDate}</p>
            )}
          </div>

          {/* Notification Preferences */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Enable expiry notifications
              </span>
            </label>
          </div>

          {notificationsEnabled && (
            <div className="pl-6 space-y-3">
              {/* Days Before Expiry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notify me (days before expiry)
                </label>
                <input
                  type="text"
                  value={daysBeforeExpiry}
                  onChange={(e) => setDaysBeforeExpiry(e.target.value)}
                  placeholder="1, 3, 7"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Separate multiple days with commas (e.g., 1, 3, 7)
                </p>
                {fieldErrors.daysBeforeExpiry && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.daysBeforeExpiry}</p>
                )}
              </div>

              {/* Email Notifications */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Email notifications</span>
                </label>
              </div>

              {/* In-App Notifications */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={inAppNotifications}
                    onChange={(e) => setInAppNotifications(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">In-app notifications</span>
                </label>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
