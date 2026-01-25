import mongoose, { Schema } from 'mongoose';
import { IHabitCompletion } from '@/types';

const HabitCompletionSchema = new Schema<IHabitCompletion>(
  {
    habitId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    completed: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index to prevent duplicate completions
HabitCompletionSchema.index({ habitId: 1, date: 1 }, { unique: true });
HabitCompletionSchema.index({ userId: 1, date: 1 });

// Apply encryption plugin
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { mongooseEncryption } = require('@/lib/plugins/mongooseEncryption');
HabitCompletionSchema.plugin(mongooseEncryption, { fields: ['notes'] });

export const HabitCompletion =
  mongoose.models.HabitCompletion || mongoose.model<IHabitCompletion>('HabitCompletion', HabitCompletionSchema);

