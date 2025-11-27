import mongoose, { Schema, Document } from 'mongoose';

export interface IMealPlanEntry {
  recipeId: number | string; // Recipe ID (number for Spoonacular, string for Edamam URIs)
  title: string;
  image?: string; // Optional - custom meals may not have images
  servings: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  notes?: string;
}

export interface IMealPlan extends Document {
  userId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  meals: IMealPlanEntry[];
  createdAt: string;
  updatedAt: string;
}

const MealPlanEntrySchema = new Schema<IMealPlanEntry>({
  recipeId: {
    type: Schema.Types.Mixed, // Support both Number and String
    required: true
  },
  title: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: false, // Optional - custom meals may not have images
    default: ''
  },
  servings: {
    type: Number,
    default: 1
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  notes: String
}, { _id: false });

const MealPlanSchema = new Schema<IMealPlan>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: String, // YYYY-MM-DD format
    required: true
  },
  meals: [MealPlanEntrySchema],
  createdAt: {
    type: String,
    default: () => new Date().toISOString()
  },
  updatedAt: {
    type: String,
    default: () => new Date().toISOString()
  }
});

// Compound index to ensure one meal plan per user per date
MealPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

// Update `updatedAt` on save
MealPlanSchema.pre('save', function(next) {
  this.updatedAt = new Date().toISOString();
  next();
});

export const MealPlan = mongoose.model<IMealPlan>('MealPlan', MealPlanSchema);

