import { Document, Types } from 'mongoose';

// User Types
export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password?: string;
  name: string;
  googleId?: string;
  avatar?: string;
  role?: string;
  preferences?: {
    notifications: {
      email: boolean;
      push: boolean;
      marketing: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

// Task Types
export type Priority = 'none' | 'low' | 'medium' | 'high';
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface RecurrenceRule {
  type: RecurrenceType;
  interval: number;
  daysOfWeek?: string[];
  dayOfMonth?: number;
  month?: number;
  day?: number;
  unit?: 'day' | 'week' | 'month' | 'year';
  endDate?: Date;
  count?: number;
  exceptions?: string[]; // ISO date strings to skip (for single-instance edits)
}

export interface ITask extends Document {
  _id: Types.ObjectId;
  userId: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: Priority;
  tags: string[];
  completed: boolean;
  completedAt?: Date;
  isRecurring: boolean;
  recurrenceRule?: RecurrenceRule;
  parentTaskId?: string;
  occurrenceDate?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Habit Types
export type HabitFrequencyType = 'daily' | 'weekly' | 'custom';

export interface HabitFrequency {
  type: HabitFrequencyType;
  daysOfWeek: string[];
}

export interface IHabit extends Document {
  _id: Types.ObjectId;
  userId: string;
  name: string;
  description?: string;
  frequency: HabitFrequency;
  color: string;
  icon?: string;
  currentStreak: number;
  bestStreak: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHabitCompletion extends Document {
  _id: Types.ObjectId;
  habitId: string;
  userId: string;
  date: Date;
  completed: boolean;
  notes?: string;
  createdAt: Date;
}

// Transaction Types
export interface ITransaction extends Document {
  _id: Types.ObjectId;
  userId: string;
  type: 'income' | 'expense' | 'investment' | 'trading';
  amount: number;
  category: string;
  date: Date;
  description?: string;
  frequency?: number;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

