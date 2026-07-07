import { Schema, model, Document } from 'mongoose';

export type UserRole = 'student' | 'recruiter' | 'admin';
export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  isVerified: boolean;
  avatarUrl?: string;
  googleId?: string;
  githubId?: string;
  refreshToken?: string[];
  subscription: {
    tier: SubscriptionTier;
    status: 'active' | 'canceled' | 'past_due';
    currentPeriodEnd?: Date;
  };
  usageMetrics: {
    resumesParsedCount: number;
    coverLettersGeneratedCount: number;
    lastUsedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: false },
    role: { type: String, enum: ['student', 'recruiter', 'admin'], default: 'student' },
    isVerified: { type: Boolean, default: false },
    avatarUrl: { type: String },
    googleId: { type: String, sparse: true },
    githubId: { type: String, sparse: true },
    refreshToken: { type: [String], default: [] },
    subscription: {
      tier: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
      status: { type: String, enum: ['active', 'canceled', 'past_due'], default: 'active' },
      currentPeriodEnd: { type: Date },
    },
    usageMetrics: {
      resumesParsedCount: { type: Number, default: 0 },
      coverLettersGeneratedCount: { type: Number, default: 0 },
      lastUsedAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

// Optimize search queries via indexing
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

export const User = model<IUser>('User', UserSchema);