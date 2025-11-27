import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'user' | 'admin';

export interface UserDocument extends Document {
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: string;
  weight?: number;
  height?: number;
  preferences?: {
    notifications: {
      email: boolean;
      inApp: boolean;
      expiryAlerts: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
    language: string;
    profileVisibility: boolean;
    shareActivity: boolean;
    allowSharing: boolean;
  };
  isEmailVerified: boolean;
  emailVerificationCode?: string;
  emailVerificationExpires?: Date;
  passwordResetCode?: string;
  passwordResetExpires?: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<UserDocument>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user', required: true },
  avatar: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String },
  weight: { type: Number },
  height: { type: Number },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
      expiryAlerts: { type: Boolean, default: true }
    },
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
    language: { type: String, default: 'en' },
    profileVisibility: { type: Boolean, default: true },
    shareActivity: { type: Boolean, default: true },
    allowSharing: { type: Boolean, default: true }
  },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationCode: { type: String, select: false },
  emailVerificationExpires: { type: Date, select: false },
  passwordResetCode: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
}, { timestamps: true });

UserSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.passwordHash);
};

export const User: Model<UserDocument> = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);

