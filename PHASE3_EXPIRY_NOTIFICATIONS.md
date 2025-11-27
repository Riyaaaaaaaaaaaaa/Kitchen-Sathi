# Phase 3: Expiry Reminders & Notifications - Implementation Guide

## 🎯 **Overview**

Phase 3 adds comprehensive expiry tracking and notification system to KitchenSathi, enabling users to set expiry dates for grocery items and receive timely reminders through multiple channels.

## 🏗️ **Architecture Components**

### **Backend Services**

#### **1. Enhanced Data Models**

**GroceryItem Model** (`src/models/GroceryItem.ts`)
```typescript
export interface GroceryItemDocument extends Document {
  name: string;
  quantity: number;
  unit: string;
  completed: boolean;
  userId: mongoose.Types.ObjectId;
  expiryDate?: Date;                    // NEW: Expiry tracking
  notificationPreferences: {           // NEW: User preferences
    enabled: boolean;
    daysBeforeExpiry: number[];        // e.g., [1, 3, 7]
    emailNotifications: boolean;
    inAppNotifications: boolean;
  };
  lastNotificationSent?: Date;         // NEW: Prevent spam
  notificationHistory: mongoose.Types.ObjectId[]; // NEW: Track sent notifications
}
```

**Notification Model** (`src/models/Notification.ts`)
```typescript
export interface NotificationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  groceryItemId: mongoose.Types.ObjectId;
  type: 'expiry_reminder' | 'expiry_warning' | 'expiry_urgent';
  title: string;
  message: string;
  status: 'sent' | 'delivered' | 'failed' | 'read';
  sentAt: Date;
  readAt?: Date;
  deliveryMethod: 'email' | 'in_app' | 'both';
  metadata?: {
    daysUntilExpiry?: number;
    expiryDate?: Date;
    itemName?: string;
  };
}
```

#### **2. Notification Service** (`src/services/NotificationService.ts`)

**Key Features:**
- **Multi-channel delivery**: Email and in-app notifications
- **Smart batching**: Groups notifications by user to reduce spam
- **Template system**: Dynamic message generation based on urgency
- **Delivery tracking**: Status monitoring and retry logic

**Notification Types:**
- 🕒 **Reminder** (7+ days): Gentle reminder
- ⏰ **Warning** (3-6 days): Attention needed
- 🚨 **Urgent** (0-2 days): Immediate action required

#### **3. Scheduled Expiry Check Service** (`src/services/ExpiryCheckService.ts`)

**Cron Schedule:**
- **Daily Check**: 9:00 AM UTC (comprehensive scan)
- **Hourly Check**: Urgent items only (expiring today)

**Smart Logic:**
- Prevents duplicate notifications (once per day per item)
- Respects user notification preferences
- Handles timezone considerations
- Provides detailed logging and statistics

### **API Endpoints**

#### **Expiry Management**
- `GET /api/groceries/expiring?days=7` - Items expiring soon
- `GET /api/groceries/expired` - Already expired items
- `PATCH /api/groceries/:id/expiry` - Update expiry settings

#### **Notifications**
- `GET /api/groceries/notifications` - User notification history
- `PATCH /api/groceries/notifications/:id/read` - Mark as read
- `GET /api/groceries/expiry/stats` - Expiry statistics

#### **Admin Functions**
- `POST /api/groceries/expiry/check` - Manual trigger (admin only)

### **Frontend Components**

#### **1. ExpiryAlerts Component**
- **Real-time monitoring**: Shows expiring and expired items
- **Visual urgency indicators**: Color-coded alerts (🟢🟡🔴)
- **Smart grouping**: Groups by urgency level
- **Auto-refresh**: Keeps data current

#### **2. NotificationCenter Component**
- **Pagination**: Handles large notification histories
- **Status tracking**: Shows read/unread status
- **Bulk actions**: Mark multiple as read
- **Filtering**: Filter by notification type

#### **3. ExpirySettings Component**
- **Modal interface**: Clean settings management
- **Flexible preferences**: Customizable notification timing
- **Validation**: Ensures valid date ranges
- **Real-time updates**: Immediate UI feedback

## 🔧 **Implementation Details**

### **Scheduling Best Practices**

#### **Cron Job Configuration**
```typescript
// Daily comprehensive check
cron.schedule('0 9 * * *', async () => {
  await checkExpiringItems();
}, { timezone: 'UTC' });

// Hourly urgent check
cron.schedule('0 * * * *', async () => {
  await checkUrgentItems();
}, { timezone: 'UTC' });
```

#### **Notification Batching**
- **User-level batching**: Groups notifications by user
- **Time-based batching**: Prevents notification spam
- **Priority handling**: Urgent notifications bypass batching

#### **Error Handling**
- **Graceful degradation**: Service continues if notifications fail
- **Retry logic**: Failed notifications are retried
- **Comprehensive logging**: Detailed error tracking

### **User Experience Features**

#### **Smart Defaults**
- **Default notification timing**: 1, 3, 7 days before expiry
- **Opt-in notifications**: Users can disable per item
- **Flexible preferences**: Customizable timing and channels

#### **Visual Feedback**
- **Urgency indicators**: Icons and colors show importance
- **Progress tracking**: Shows days until expiry
- **Status updates**: Real-time notification status

#### **Accessibility**
- **Keyboard navigation**: Full keyboard support
- **Screen reader friendly**: Proper ARIA labels
- **High contrast**: Clear visual indicators

## 📊 **Monitoring & Analytics**

### **Backend Logging**
```typescript
console.log(`📧 [notification] Sent ${type} for ${item.name} (${days} days)`);
console.log(`🔍 [expiry-check] Found ${count} items expiring in next 7 days`);
console.log(`📊 [expiry-check] Notification summary:`, summary);
```

### **Statistics Tracking**
- **Notification delivery rates**: Success/failure tracking
- **User engagement**: Read rates and interaction patterns
- **Expiry patterns**: Common expiry timelines
- **System performance**: Check execution times

### **Health Monitoring**
- **Service status**: Cron job health checks
- **Database performance**: Query optimization
- **Notification delivery**: Success rate monitoring

## 🚀 **Deployment Considerations**

### **Environment Variables**
```bash
# Notification settings
NOTIFICATION_BATCH_SIZE=50
NOTIFICATION_RETRY_ATTEMPTS=3
NOTIFICATION_RETRY_DELAY=300000

# Cron settings
EXPIRY_CHECK_ENABLED=true
URGENT_CHECK_ENABLED=true
```

### **Production Enhancements**

#### **Email Service Integration**
```typescript
// Replace console.log with actual email service
await emailService.send({
  to: user.email,
  subject: title,
  html: generateEmailTemplate(title, message, item)
});
```

#### **WebSocket Integration**
```typescript
// Real-time in-app notifications
await websocketService.emitToUser(userId, 'notification', notification);
```

#### **Queue System**
```typescript
// For high-volume deployments
await notificationQueue.add('send-notification', {
  userId, itemId, type, message
});
```

## 🧪 **Testing Strategy**

### **Unit Tests**
- **Notification service**: Message generation and delivery
- **Expiry service**: Cron job logic and scheduling
- **API endpoints**: Request/response validation

### **Integration Tests**
- **End-to-end flows**: User registration → item creation → expiry → notification
- **Database operations**: Model interactions and queries
- **Scheduled tasks**: Cron job execution and timing

### **Manual Testing**
```bash
# Test expiry check manually
curl -X POST http://localhost:5000/api/groceries/expiry/check \
  -H "Authorization: Bearer <admin-token>"

# Check notification history
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/groceries/notifications
```

## 📈 **Performance Optimizations**

### **Database Indexing**
```typescript
// Efficient expiry queries
NotificationSchema.index({ userId: 1, sentAt: -1 });
NotificationSchema.index({ groceryItemId: 1 });
NotificationSchema.index({ status: 1 });
```

### **Caching Strategy**
- **User preferences**: Cache notification settings
- **Expiry statistics**: Cache computed statistics
- **Notification templates**: Cache message templates

### **Batch Processing**
- **Notification batching**: Group by user and time
- **Database operations**: Bulk updates and inserts
- **API responses**: Paginated results

## 🔒 **Security Considerations**

### **Data Protection**
- **User privacy**: Notification preferences are user-scoped
- **Data retention**: Configurable notification history limits
- **Access control**: Admin-only manual triggers

### **Rate Limiting**
- **Notification frequency**: Prevent spam
- **API endpoints**: Rate limit expiry checks
- **User actions**: Limit settings changes

## 🎉 **Success Metrics**

### **User Engagement**
- **Notification open rates**: Track user interaction
- **Settings customization**: Monitor preference usage
- **Expiry management**: Track item completion rates

### **System Performance**
- **Notification delivery**: Success rates and timing
- **Cron job reliability**: Execution success rates
- **Database performance**: Query response times

### **Business Impact**
- **Food waste reduction**: Track expired vs. used items
- **User satisfaction**: Notification usefulness ratings
- **Feature adoption**: Usage of expiry features

## 🚀 **Next Steps**

### **Phase 4 Enhancements**
1. **Machine Learning**: Predict expiry dates based on item types
2. **Recipe Integration**: Suggest recipes for expiring items
3. **Social Features**: Share expiry alerts with family members
4. **Mobile App**: Push notifications and offline support

### **Advanced Features**
1. **Smart Suggestions**: AI-powered meal planning with expiring items
2. **Barcode Integration**: Automatic expiry date detection
3. **Store Integration**: Sync with grocery store databases
4. **Analytics Dashboard**: Comprehensive expiry and usage analytics

This implementation provides a robust foundation for expiry tracking and notifications, with room for future enhancements and scaling.
