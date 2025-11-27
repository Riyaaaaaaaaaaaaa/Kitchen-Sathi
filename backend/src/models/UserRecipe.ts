import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IIngredient {
  name: string;
  quantity?: string;
  unit?: string;
}

export interface UserRecipeDocument extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  cuisine?: string;
  dietLabels: string[];
  ingredients: IIngredient[];
  instructions: string[];
  cookingTime?: number; // in minutes
  servings: number;
  mealType?: string;
  tags: string[];
  isFavorite: boolean;
  rating?: number; // 1-5 stars
  image?: string; // Cloudinary URL
  imagePublicId?: string; // Cloudinary public ID for deletion
  isPublic: boolean; // Whether recipe can be shared
  shareCount: number; // Number of times recipe has been shared
  createdAt: Date;
  updatedAt: Date;
}

const ingredientSchema = new Schema<IIngredient>({
  name: { type: String, required: true, trim: true },
  quantity: { type: String, trim: true },
  unit: { type: String, trim: true }
}, { _id: false });

const userRecipeSchema = new Schema<UserRecipeDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  cuisine: {
    type: String,
    trim: true
  },
  dietLabels: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'low-carb', 'keto', 'paleo']
  }],
  ingredients: {
    type: [ingredientSchema],
    required: true,
    validate: {
      validator: function(v: IIngredient[]) {
        return v && v.length > 0;
      },
      message: 'At least one ingredient is required'
    }
  },
  instructions: {
    type: [String],
    required: true,
    validate: {
      validator: function(v: string[]) {
        return v && v.length > 0 && v.every(step => step.trim().length > 0);
      },
      message: 'At least one instruction step is required'
    }
  },
  cookingTime: {
    type: Number,
    min: 0
  },
  servings: {
    type: Number,
    default: 1,
    min: 1,
    required: true
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', '']
  },
  tags: [{
    type: String,
    trim: true
  }],
  isFavorite: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  image: {
    type: String,
    trim: true
  },
  imagePublicId: {
    type: String,
    trim: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  shareCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
userRecipeSchema.index({ userId: 1, name: 1 });
userRecipeSchema.index({ userId: 1, cuisine: 1 });
userRecipeSchema.index({ userId: 1, dietLabels: 1 });
userRecipeSchema.index({ userId: 1, mealType: 1 });
userRecipeSchema.index({ userId: 1, isFavorite: 1 });

export const UserRecipe: Model<UserRecipeDocument> = mongoose.models.UserRecipe || mongoose.model<UserRecipeDocument>('UserRecipe', userRecipeSchema);

