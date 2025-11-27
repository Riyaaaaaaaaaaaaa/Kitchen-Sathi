import { GroceryItem } from '../models/GroceryItem.js';
import { User } from '../models/User.js';
import { notificationService } from './NotificationService.js';
import { emailService } from './emailService.js';
import cron from 'node-cron';

class GroceryExpiryService {
  private cronJob: cron.ScheduledTask | null = null;

  /**
   * Initialize the cron job to check for expiring items daily at midnight
   */
  initializeCronJob(): void {
    // Run daily at midnight (00:00)
    this.cronJob = cron.schedule('0 0 * * *', () => {
      console.log('[GroceryExpiryService] 🕐 Running scheduled expiry check...');
      this.checkAndNotifyExpiringGroceries().catch(err => {
        console.error('[GroceryExpiryService] ❌ Scheduled check failed:', err);
      });
    });
    console.log('[GroceryExpiryService] ✅ Cron job initialized (runs daily at midnight)');
  }

  /**
   * Stop the cron job
   */
  stopCronJob(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log('[GroceryExpiryService] Cron job stopped');
    }
  }
  /**
   * Check for expiring grocery items and create notifications
   * This should be run periodically (e.g., daily)
   */
  async checkExpiringItems(): Promise<void> {
    try {
      console.log('[GroceryExpiryService] 🔍 Checking for expiring items...');

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check for items expiring in the next 3 days
      const threeDaysFromNow = new Date(today);
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      // Find all items expiring soon that are not completed
      const expiringItems = await GroceryItem.find({
        expiryDate: {
          $gte: today,
          $lte: threeDaysFromNow
        },
        completed: false
      });

      console.log(`[GroceryExpiryService] Found ${expiringItems.length} expiring items`);

      // Group items by user
      const itemsByUser = new Map<string, typeof expiringItems>();
      for (const item of expiringItems) {
        const userId = item.userId.toString();
        if (!itemsByUser.has(userId)) {
          itemsByUser.set(userId, []);
        }
        itemsByUser.get(userId)!.push(item);
      }

      // Create notifications for each user
      let notificationCount = 0;
      for (const [userId, items] of itemsByUser.entries()) {
        // Check if user has expiry alerts enabled
        const user = await User.findById(userId);
        if (!user) continue;

        const preferences = user.preferences || {};
        const expiryAlertsEnabled = preferences.notifications?.expiryAlerts !== false;

        if (!expiryAlertsEnabled) {
          console.log(`[GroceryExpiryService] Expiry alerts disabled for user ${userId}`);
          continue;
        }

        // Create notification for each item
        for (const item of items) {
          const daysUntilExpiry = Math.floor(
            (item.expiryDate!.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );

          try {
            await notificationService.notifyGroceryExpiry(
              userId,
              item._id.toString(),
              item.name,
              item.expiryDate!,
              daysUntilExpiry
            );
            notificationCount++;
          } catch (error) {
            console.error(`[GroceryExpiryService] Failed to create notification for item ${item._id}:`, error);
          }
        }
      }

      console.log(`[GroceryExpiryService] ✅ Created ${notificationCount} expiry notifications`);
    } catch (error) {
      console.error('[GroceryExpiryService] ❌ Error checking expiring items:', error);
    }
  }

  /**
   * Check for a specific user's expiring items
   */
  async checkUserExpiringItems(userId: string): Promise<void> {
    try {
      console.log(`[GroceryExpiryService] 🔍 Checking expiring items for user ${userId}...`);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const threeDaysFromNow = new Date(today);
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const expiringItems = await GroceryItem.find({
        userId,
        expiryDate: {
          $gte: today,
          $lte: threeDaysFromNow
        },
        completed: false
      });

      console.log(`[GroceryExpiryService] Found ${expiringItems.length} expiring items for user ${userId}`);

      for (const item of expiringItems) {
        const daysUntilExpiry = Math.floor(
          (item.expiryDate!.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        await notificationService.notifyGroceryExpiry(
          userId,
          item._id.toString(),
          item.name,
          item.expiryDate!,
          daysUntilExpiry
        );
      }
    } catch (error) {
      console.error(`[GroceryExpiryService] ❌ Error checking user expiring items:`, error);
    }
  }

  /**
   * Check and notify for expiring groceries (main method)
   * This is the method called by the scheduler
   */
  async checkAndNotifyExpiringGroceries(): Promise<void> {
    console.log('[GroceryExpiryService] Starting check for expiring groceries...');
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    const expiryThreshold = new Date();
    expiryThreshold.setDate(today.getDate() + 3); // Check items expiring within 3 days
    expiryThreshold.setHours(23, 59, 59, 999); // Normalize to end of day

    try {
      const expiringItems = await GroceryItem.find({
        expiryDate: {
          $gte: today,
          $lte: expiryThreshold,
        },
        status: { $in: ['pending', 'completed'] }, // Include pending (not bought) and completed (bought but not used)
        notifiedForExpiry: { $ne: true } // Only notify once
      }).populate('userId', 'name email preferences'); // Populate user to check preferences

      console.log(`[GroceryExpiryService] Found ${expiringItems.length} expiring items to notify`);

      for (const item of expiringItems) {
        const user = item.userId as any; // Cast to any to access preferences
        if (!user) {
          console.log(`[GroceryExpiryService] Skipping notification for ${item.name} (User not found).`);
          continue;
        }

        // Check if user has expiry alerts enabled
        const expiryAlertsEnabled = user.preferences?.notifications?.expiryAlerts !== false;
        if (!expiryAlertsEnabled) {
          console.log(`[GroceryExpiryService] Skipping notification for ${item.name} (User preferences disabled).`);
          continue;
        }

        // Calculate days until expiry
        const daysUntilExpiry = Math.ceil((item.expiryDate!.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Create in-app notification
        await notificationService.notifyGroceryExpiry(
          user._id,
          item._id.toString(),
          item.name,
          item.expiryDate!,
          daysUntilExpiry
        );

        // Send email notification if enabled
        const emailNotificationsEnabled = user.preferences?.notifications?.email !== false;
        if (emailNotificationsEnabled && user.email) {
          try {
            await emailService.sendExpiryAlert(
              user.email,
              user.name,
              item.name,
              item.expiryDate!,
              daysUntilExpiry
            );
            console.log(`[GroceryExpiryService] ✅ Sent email notification to ${user.email} for ${item.name}`);
          } catch (emailError) {
            console.error(`[GroceryExpiryService] ❌ Failed to send email for ${item.name}:`, emailError);
          }
        }

        // Mark item as notified to prevent duplicate notifications
        item.notifiedForExpiry = true;
        await item.save();
      }

      console.log(`[GroceryExpiryService] ✅ Completed expiry check. Notified for ${expiringItems.length} items.`);
    } catch (error) {
      console.error('[GroceryExpiryService] ❌ Error during expiry check:', error);
    }
  }
}

export const groceryExpiryService = new GroceryExpiryService();

