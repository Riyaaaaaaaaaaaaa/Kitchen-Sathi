import mongoose, { Schema, Document } from 'mongoose';

export interface ISavedRecipe extends Document {
  userId: string;
  recipeId: string; // Edamam recipe ID (can be URI or extracted ID)
  title: string;
  image: string;
  servings: number;
  readyInMinutes: number;
  sourceUrl?: string;
  summary?: string;
  cuisines?: string[];
  diets?: string[];
  savedAt: string;
  notes?: string; // User's personal notes about the recipe
  rating?: number; // User's rating 1-5
}

const SavedRecipeSchema = new Schema<ISavedRecipe>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  recipeId: {
    type: String, // Changed from Number to String for Edamam compatibility
    required: true
  },
  title: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  servings: {
    type: Number,
    default: 1
  },
  readyInMinutes: {
    type: Number,
    default: 0
  },
  sourceUrl: String,
  summary: String,
  cuisines: [String],
  diets: [String],
  savedAt: {
    type: String,
    default: () => new Date().toISOString()
  },
  notes: String,
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
});

// Compound index to ensure user can't save same recipe twice
SavedRecipeSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

export const SavedRecipe = mongoose.model<ISavedRecipe>('SavedRecipe', SavedRecipeSchema);

