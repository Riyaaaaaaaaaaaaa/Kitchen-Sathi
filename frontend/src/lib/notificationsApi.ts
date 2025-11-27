import { request } from './api';

export interface Notification {
  _id: string;
  userId: string;
  type: 'grocery_expiry' | 'recipe_shared' | 'meal_reminder' | 'share_accepted' | 'share_rejected';
  title: string;
  message: string;
  data?: {
    groceryItemId?: string;
    groceryItemName?: string;
    expiryDate?: string;
    recipeId?: string;
    recipeName?: string;
    shareId?: string;
    sharedBy?: string;
    mealType?: string;
    mealDate?: string;
  };
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

// Get all notifications
export async function getNotifications(unreadOnly = false): Promise<Notification[]> {
  const query = unreadOnly ? '?unreadOnly=true' : '';
  return request<Notification[]>(`/api/notifications${query}`);
}

// Get unread notification count
export async function getUnreadCount(): Promise<{ count: number }> {
  return request<{ count: number }>('/api/notifications/unread-count');
}

// Mark a notification as read
export async function markAsRead(notificationId: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/notifications/${notificationId}/read`, {
    method: 'PATCH'
  });
}

// Mark all notifications as read
export async function markAllAsRead(): Promise<{ success: boolean }> {
  return request<{ success: boolean }>('/api/notifications/mark-all-read', {
    method: 'PATCH'
  });
}

// Delete a notification
export async function deleteNotification(notificationId: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/notifications/${notificationId}`, {
    method: 'DELETE'
  });
}

