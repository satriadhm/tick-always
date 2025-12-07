import mongoose, { Schema } from 'mongoose';
import { IHabit, HabitFrequency } from '@/types';

const HabitFrequencySchema = new Schema<HabitFrequency>(
  {
    type: {
      type: String,
      enum: ['daily', 'weekly', 'custom'],
      required: true,
      default: 'daily',
    },
    daysOfWeek: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const HabitSchema = new Schema<IHabit>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    frequency: {
      type: HabitFrequencySchema,
      required: true,
      default: { type: 'daily', daysOfWeek: [] },
    },
    color: {
      type: String,
      default: '#3B82F6',
    },
    icon: String,
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    bestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Habit = mongoose.models.Habit || mongoose.model<IHabit>('Habit', HabitSchema);

