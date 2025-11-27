import mongoose, { Schema, Document, Model } from 'mongoose';

export interface SharedRecipeDocument extends Document {
  recipeId: mongoose.Types.ObjectId; // Reference to UserRecipe
  ownerId: mongoose.Types.ObjectId; // User who shared the recipe
  sharedWithUserId: mongoose.Types.ObjectId; // User who received the share
  sharedAt: Date;
  message?: string; // Optional message from the sharer
  status: 'pending' | 'accepted' | 'rejected'; // Status of the share
}

const sharedRecipeSchema = new Schema<SharedRecipeDocument>({
  recipeId: {
    type: Schema.Types.ObjectId,
    ref: 'UserRecipe',
    required: true,
    index: true
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sharedWithUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sharedAt: {
    type: Date,
    default: Date.now
  },
  message: {
    type: String,
    trim: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
sharedRecipeSchema.index({ sharedWithUserId: 1, status: 1 });
sharedRecipeSchema.index({ ownerId: 1, recipeId: 1 });
sharedRecipeSchema.index({ recipeId: 1, sharedWithUserId: 1 }, { unique: true }); // Prevent duplicate shares

export const SharedRecipe: Model<SharedRecipeDocument> = mongoose.models.SharedRecipe || mongoose.model<SharedRecipeDocument>('SharedRecipe', sharedRecipeSchema);

