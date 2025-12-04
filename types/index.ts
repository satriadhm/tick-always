import { Document } from 'mongoose';

// User Types
export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  name: string;
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
  _id: string;
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
  _id: string;
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
  _id: string;
  habitId: string;
  userId: string;
  date: Date;
  completed: boolean;
  notes?: string;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
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

