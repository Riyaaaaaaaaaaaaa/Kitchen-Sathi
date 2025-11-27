import cron from 'node-cron';
import { GroceryItem } from '../models/GroceryItem.js';
import { notificationService } from './NotificationService.js';

export class ExpiryCheckService {
  private isRunning = false;
  private cronJob: cron.ScheduledTask | null = null;

  start(): void {
    if (this.isRunning) {
      console.log('⚠️ [expiry-check] Service already running');
      return;
    }

    // Run every day at 9:00 AM
    this.cronJob = cron.schedule('0 9 * * *', async () => {
      console.log('🕒 [expiry-check] Starting daily expiry check...');
      await this.checkExpiringItems();
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    // Also run every hour for urgent items (expiring today)
    cron.schedule('0 * * * *', async () => {
      console.log('🚨 [expiry-check] Checking urgent items (expiring today)...');
      await this.checkUrgentItems();
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    this.isRunning = true;
    console.log('✅ [expiry-check] Service started - Daily checks at 9:00 AM UTC');
  }

  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
    this.isRunning = false;
    console.log('⏹️ [expiry-check] Service stopped');
  }

  async checkExpiringItems(): Promise<void> {
    try {
      const today = new Date();
      const notifications: any[] = [];

      // Find items expiring in the next 7 days
      const expiringItems = await GroceryItem.find({
        expiryDate: {
          $gte: today,
          $lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
        },
        completed: false,
        'notificationPreferences.enabled': true
      }).populate('userId');

      console.log(`🔍 [expiry-check] Found ${expiringItems.length} items expiring in next 7 days`);

      for (const item of expiringItems) {
        if (!item.expiryDate) continue;

        const daysUntilExpiry = Math.ceil((item.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Check if we should send notification based on user preferences
        if (this.shouldSendNotification(item, daysUntilExpiry)) {
          await notificationService.sendExpiryReminder(item, daysUntilExpiry);
          notifications.push({
            itemName: item.name,
            daysUntilExpiry,
            userId: item.userId
          });
        }
      }

      console.log(`📧 [expiry-check] Sent ${notifications.length} notifications`);
      
      // Log summary
      if (notifications.length > 0) {
        const summary = notifications.reduce((acc, notif) => {
          acc[notif.daysUntilExpiry] = (acc[notif.daysUntilExpiry] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);
        
        console.log('📊 [expiry-check] Notification summary:', summary);
      }

    } catch (error) {
      console.error('❌ [expiry-check] Error during expiry check:', error);
    }
  }

  async checkUrgentItems(): Promise<void> {
    try {
      const today = new Date();
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      // Find items expiring today
      const urgentItems = await GroceryItem.find({
        expiryDate: {
          $gte: today,
          $lte: endOfDay
        },
        completed: false,
        'notificationPreferences.enabled': true
      });

      console.log(`🚨 [expiry-check] Found ${urgentItems.length} urgent items (expiring today)`);

      for (const item of urgentItems) {
        // Only send if we haven't sent a notification in the last 4 hours
        const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
        if (!item.lastNotificationSent || item.lastNotificationSent < fourHoursAgo) {
          await notificationService.sendExpiryReminder(item, 0);
          console.log(`🚨 [expiry-check] Sent urgent notification for ${item.name}`);
        }
      }

    } catch (error) {
      console.error('❌ [expiry-check] Error during urgent check:', error);
    }
  }

  private shouldSendNotification(item: any, daysUntilExpiry: number): boolean {
    // Don't send if already sent today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (item.lastNotificationSent && item.lastNotificationSent >= today) {
      return false;
    }

    // Check if daysUntilExpiry matches user preferences
    return item.notificationPreferences.daysBeforeExpiry.includes(daysUntilExpiry);
  }

  // Manual trigger for testing
  async triggerManualCheck(): Promise<void> {
    console.log('🔧 [expiry-check] Manual trigger requested');
    await this.checkExpiringItems();
  }

  // Get statistics
  async getExpiryStats(): Promise<any> {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const stats = await GroceryItem.aggregate([
      {
        $match: {
          expiryDate: { $gte: today, $lte: nextWeek },
          completed: false
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$expiryDate' }
          },
          count: { $sum: 1 },
          items: { $push: '$name' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return {
      totalExpiringItems: stats.reduce((sum, stat) => sum + stat.count, 0),
      byDate: stats,
      nextCheck: this.getNextCheckTime()
    };
  }

  private getNextCheckTime(): string {
    const now = new Date();
    const nextCheck = new Date(now);
    nextCheck.setHours(9, 0, 0, 0);
    
    if (nextCheck <= now) {
      nextCheck.setDate(nextCheck.getDate() + 1);
    }
    
    return nextCheck.toISOString();
  }
}

export const expiryCheckService = new ExpiryCheckService();
