import mongoose, { Schema, Document, Model } from 'mongoose';

// Status enum for grocery items lifecycle
export enum GroceryItemStatus {
  PENDING = 'pending',     // Not yet bought
  COMPLETED = 'completed', // Bought but not used
  USED = 'used'           // Bought and consumed/used
}

export interface GroceryItemDocument extends Document {
  name: string;
  quantity: number;
  unit: string;
  price?: number; // Price per unit in ₹ (optional)
  status: GroceryItemStatus;
  completed: boolean; // Deprecated - kept for backward compatibility
  userId: mongoose.Types.ObjectId;
  expiryDate?: Date;
  notificationPreferences: {
    enabled: boolean;
    daysBeforeExpiry: number[];
    emailNotifications: boolean;
    inAppNotifications: boolean;
  };
  lastNotificationSent?: Date;
  notificationHistory: mongoose.Types.ObjectId[];
  usedAt?: Date; // Track when item was marked as used
  notifiedForExpiry?: boolean; // Flag to prevent duplicate expiry notifications
}

const GroceryItemSchema = new Schema<GroceryItemDocument>({
  name: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0.01 }, // Allow fractional quantities (e.g., 0.5, 0.75)
  unit: { type: String, required: true, trim: true },
  price: { type: Number, min: 0 }, // Optional price per unit in ₹
  status: { 
    type: String, 
    enum: Object.values(GroceryItemStatus),
    default: GroceryItemStatus.PENDING 
  },
  completed: { type: Boolean, default: false }, // Deprecated - use status instead
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  expiryDate: { type: Date },
  notificationPreferences: {
    enabled: { type: Boolean, default: true },
    daysBeforeExpiry: { type: [Number], default: [1, 3, 7] }, // Notify 1, 3, and 7 days before
    emailNotifications: { type: Boolean, default: true },
    inAppNotifications: { type: Boolean, default: true },
  },
  lastNotificationSent: { type: Date },
  notificationHistory: [{ type: Schema.Types.ObjectId, ref: 'Notification' }],
  usedAt: { type: Date }, // Track when item was marked as used
  notifiedForExpiry: { type: Boolean, default: false }, // Flag to prevent duplicate expiry notifications
}, { timestamps: true });

// Middleware to keep completed field in sync with status for backward compatibility
GroceryItemSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.completed = this.status === GroceryItemStatus.COMPLETED || this.status === GroceryItemStatus.USED;
    if (this.status === GroceryItemStatus.USED && !this.usedAt) {
      this.usedAt = new Date();
    }
  }
  next();
});

export const GroceryItem: Model<GroceryItemDocument> = mongoose.models.GroceryItem || mongoose.model<GroceryItemDocument>('GroceryItem', GroceryItemSchema);
