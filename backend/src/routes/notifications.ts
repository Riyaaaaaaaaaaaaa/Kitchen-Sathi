import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Notification } from '../models/Notification.js';

const router = Router();

// Get all notifications for the authenticated user
router.get('/', requireAuth, async (req: any, res) => {
  try {
    console.log(`[notifications-api] 📋 GET / - User: ${req.user.id}`);
    
    const unreadOnly = req.query.unreadOnly === 'true';
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const query: any = { userId: req.user.id };
    if (unreadOnly) {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    console.log(`[notifications-api] ✅ Found ${notifications.length} notifications`);
    res.json(notifications);
  } catch (error) {
    console.error('[notifications-api] ❌ Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get unread notification count
router.get('/unread-count', requireAuth, async (req: any, res) => {
  try {
    console.log(`[notifications-api] 🔢 GET /unread-count - User: ${req.user.id}`);
    
    const count = await Notification.countDocuments({ userId: req.user.id, isRead: false });

    console.log(`[notifications-api] ✅ Unread count: ${count}`);
    res.json({ count });
  } catch (error) {
    console.error('[notifications-api] ❌ Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// Mark a notification as read
router.patch('/:id/read', requireAuth, async (req: any, res) => {
  try {
    console.log(`[notifications-api] ✅ PATCH /:id/read - Notification: ${req.params.id}, User: ${req.user.id}`);
    
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('[notifications-api] ❌ Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', requireAuth, async (req: any, res) => {
  try {
    console.log(`[notifications-api] ✅ PATCH /mark-all-read - User: ${req.user.id}`);
    
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('[notifications-api] ❌ Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Delete a notification
router.delete('/:id', requireAuth, async (req: any, res) => {
  try {
    console.log(`[notifications-api] 🗑️ DELETE /:id - Notification: ${req.params.id}, User: ${req.user.id}`);
    
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    res.json({ success: true });
  } catch (error) {
    console.error('[notifications-api] ❌ Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router;

