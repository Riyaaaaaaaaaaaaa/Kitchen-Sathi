import mongoose, { Document, Schema } from 'mongoose';

export interface MealConsumptionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  recipeName: string;
  calories: number;
  consumedAt: Date;
}

const MealConsumptionSchema = new Schema<MealConsumptionDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  recipeName: {
    type: String,
    required: true
  },
  calories: {
    type: Number,
    required: true,
    min: 0
  },
  consumedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { timestamps: true });

// Index for efficient querying by user and date
MealConsumptionSchema.index({ userId: 1, consumedAt: -1 });

export const MealConsumption = mongoose.model<MealConsumptionDocument>('MealConsumption', MealConsumptionSchema);

