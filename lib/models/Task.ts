import mongoose, { Schema } from 'mongoose';
import { ITask, RecurrenceRule } from '@/types';

const RecurrenceRuleSchema = new Schema<RecurrenceRule>(
  {
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom'],
      required: true,
    },
    interval: {
      type: Number,
      required: true,
      min: 1,
    },
    daysOfWeek: [String],
    dayOfMonth: Number,
    month: Number,
    day: Number,
    unit: {
      type: String,
      enum: ['day', 'week', 'month', 'year'],
    },
    endDate: Date,
    count: Number,
    exceptions: [String], // ISO date strings to skip
  },
  { _id: false }
);

const TaskSchema = new Schema<ITask>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    dueDate: {
      type: Date,
      index: true,
    },
    priority: {
      type: String,
      enum: ['none', 'low', 'medium', 'high'],
      default: 'none',
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    completed: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: Date,
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrenceRule: RecurrenceRuleSchema,
    parentTaskId: {
      type: String,
      index: true,
    },
    occurrenceDate: Date,
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
TaskSchema.index({ userId: 1, completed: 1 });
TaskSchema.index({ userId: 1, dueDate: 1 });
TaskSchema.index({ userId: 1, priority: 1 });
TaskSchema.index({ userId: 1, tags: 1 });

// Text index for search
TaskSchema.index({ userId: 1, title: 'text', description: 'text' });

export const Task = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

