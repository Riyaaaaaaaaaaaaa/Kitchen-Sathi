import mongoose, { Schema, Document } from 'mongoose';

export interface NotificationDocument extends Document {
  userId: mongoose.Types.ObjectId;
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
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['grocery_expiry', 'recipe_shared', 'meal_reminder', 'share_accepted', 'share_rejected'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    data: {
      groceryItemId: String,
      groceryItemName: String,
      expiryDate: Date,
      recipeId: String,
      recipeName: String,
      shareId: String,
      sharedBy: String,
      mealType: String,
      mealDate: Date
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient querying
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });

export const Notification = mongoose.model<NotificationDocument>('Notification', NotificationSchema);
