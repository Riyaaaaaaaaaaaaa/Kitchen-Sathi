import { Notification, NotificationDocument } from '../models/Notification.js';
import { User, UserDocument } from '../models/User.js';
import mongoose from 'mongoose';

interface CreateNotificationParams {
  userId: string | mongoose.Types.ObjectId;
  type: 'grocery_expiry' | 'recipe_shared' | 'meal_reminder' | 'share_accepted' | 'share_rejected';
  title: string;
  message: string;
  data?: {
    groceryItemId?: string;
    groceryItemName?: string;
    expiryDate?: Date;
    recipeId?: string;
    recipeName?: string;
    shareId?: string;
    sharedBy?: string;
    mealType?: string;
    mealDate?: Date;
  };
}

class NotificationService {
  /**
   * Create a new notification
   */
  async createNotification(params: CreateNotificationParams): Promise<NotificationDocument> {
    try {
      // Check if user has notifications enabled
      const user = await User.findById(params.userId) as UserDocument | null;
      if (!user) {
        throw new Error('User not found');
      }

      // Check user preferences for this notification type
      const preferences = user.preferences || {
        notifications: { email: true, inApp: true, expiryAlerts: true },
        theme: 'auto' as const,
        language: 'en',
        profileVisibility: true,
        shareActivity: true,
        allowSharing: true
      };
      const notificationPrefs = preferences.notifications;

      // Default to enabled if not set
      const inAppEnabled = notificationPrefs.inApp !== false;

      if (!inAppEnabled) {
        console.log(`[NotificationService] In-app notifications disabled for user ${params.userId}`);
        // Still create the notification but mark it as read so it doesn't show
        const notification = await Notification.create({
          ...params,
          isRead: true
        });
        return notification;
      }

      const notification = await Notification.create(params);
      console.log(`[NotificationService] ✅ Created notification: ${notification.type} for user ${params.userId}`);
      return notification;
    } catch (error) {
      console.error('[NotificationService] ❌ Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Get all notifications for a user
   */
  async getUserNotifications(
    userId: string | mongoose.Types.ObjectId,
    options: { unreadOnly?: boolean; limit?: number } = {}
  ): Promise<NotificationDocument[]> {
    try {
      const query: any = { userId };
      
      if (options.unreadOnly) {
        query.isRead = false;
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(options.limit || 50);

      return notifications;
    } catch (error) {
      console.error('[NotificationService] ❌ Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string | mongoose.Types.ObjectId): Promise<void> {
    try {
    await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
        { isRead: true }
      );
      console.log(`[NotificationService] ✅ Marked notification ${notificationId} as read`);
    } catch (error) {
      console.error('[NotificationService] ❌ Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string | mongoose.Types.ObjectId): Promise<void> {
    try {
      await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
      );
      console.log(`[NotificationService] ✅ Marked all notifications as read for user ${userId}`);
    } catch (error) {
      console.error('[NotificationService] ❌ Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string | mongoose.Types.ObjectId): Promise<void> {
    try {
      await Notification.findOneAndDelete({ _id: notificationId, userId });
      console.log(`[NotificationService] ✅ Deleted notification ${notificationId}`);
    } catch (error) {
      console.error('[NotificationService] ❌ Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string | mongoose.Types.ObjectId): Promise<number> {
    try {
      const count = await Notification.countDocuments({ userId, isRead: false });
      return count;
    } catch (error) {
      console.error('[NotificationService] ❌ Error getting unread count:', error);
      throw error;
    }
  }

  /**
   * Create grocery expiry notification
   */
  async notifyGroceryExpiry(
    userId: string | mongoose.Types.ObjectId,
    groceryItemId: string,
    groceryItemName: string,
    expiryDate: Date,
    daysUntilExpiry: number
  ): Promise<NotificationDocument> {
    const title = daysUntilExpiry === 0 
      ? '⚠️ Item Expired Today!' 
      : `⏰ Item Expiring ${daysUntilExpiry === 1 ? 'Tomorrow' : `in ${daysUntilExpiry} days`}`;
    
    const message = daysUntilExpiry === 0
      ? `${groceryItemName} has expired today. Consider removing it.`
      : `${groceryItemName} will expire ${daysUntilExpiry === 1 ? 'tomorrow' : `in ${daysUntilExpiry} days`}. Use it soon!`;

    return this.createNotification({
      userId,
      type: 'grocery_expiry',
      title,
      message,
      data: {
        groceryItemId,
        groceryItemName,
        expiryDate
      }
    });
  }

  /**
   * Create recipe shared notification
   */
  async notifyRecipeShared(
    userId: string | mongoose.Types.ObjectId,
    recipeId: string,
    recipeName: string,
    sharedBy: string,
    shareId: string
  ): Promise<NotificationDocument> {
    return this.createNotification({
      userId,
      type: 'recipe_shared',
      title: '🎁 New Recipe Shared!',
      message: `${sharedBy} shared "${recipeName}" with you.`,
      data: {
        recipeId,
        recipeName,
        sharedBy,
        shareId
      }
    });
  }

  /**
   * Create meal reminder notification
   */
  async notifyMealReminder(
    userId: string | mongoose.Types.ObjectId,
    mealType: string,
    mealDate: Date,
    recipeName?: string
  ): Promise<NotificationDocument> {
    const mealEmoji = {
      breakfast: '🌅',
      lunch: '🌞',
      dinner: '🌙',
      snack: '🍪'
    }[mealType.toLowerCase()] || '🍽️';

    const title = `${mealEmoji} ${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Reminder`;
    const message = recipeName 
      ? `Time for ${mealType}! You have "${recipeName}" planned.`
      : `Time for ${mealType}! Check your meal plan.`;

    return this.createNotification({
      userId,
      type: 'meal_reminder',
      title,
      message,
      data: {
        mealType,
        mealDate,
        recipeName
      }
    });
  }

  /**
   * Create share status notification
   */
  async notifyShareStatus(
    userId: string | mongoose.Types.ObjectId,
    recipeName: string,
    recipientName: string,
    status: 'accepted' | 'rejected'
  ): Promise<NotificationDocument> {
    const type = status === 'accepted' ? 'share_accepted' : 'share_rejected';
    const emoji = status === 'accepted' ? '✅' : '❌';
    const title = `${emoji} Recipe Share ${status === 'accepted' ? 'Accepted' : 'Declined'}`;
    const message = status === 'accepted'
      ? `${recipientName} accepted your recipe "${recipeName}".`
      : `${recipientName} declined your recipe "${recipeName}".`;

    return this.createNotification({
      userId,
      type,
      title,
      message,
      data: {
        recipeName,
        sharedBy: recipientName
      }
    });
  }
}

export const notificationService = new NotificationService();
