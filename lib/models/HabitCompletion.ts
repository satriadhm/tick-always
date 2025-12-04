import mongoose, { Schema, Document } from 'mongoose';
import { IHabitCompletion } from '@/types';

const HabitCompletionSchema = new Schema<IHabitCompletion>(
  {
    habitId: {
      type: Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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

export const HabitCompletion =
  mongoose.models.HabitCompletion || mongoose.model<IHabitCompletion>('HabitCompletion', HabitCompletionSchema);

