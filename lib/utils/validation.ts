import { z } from 'zod';

// User validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Task validation schemas
export const taskCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(2000, 'Description is too long').optional().or(z.literal('')),
  dueDate: z
    .union([
      z.string().datetime(),
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
      z.date(),
    ])
    .optional()
    .nullable(),
  priority: z.enum(['none', 'low', 'medium', 'high']).default('none').optional(),
  tags: z.array(z.string().max(30)).max(10).default([]).optional(),
  isRecurring: z.boolean().default(false).optional(),
  recurrenceRule: z
    .object({
      type: z.enum(['daily', 'weekly', 'monthly', 'yearly', 'custom']),
      interval: z.number().min(1),
      daysOfWeek: z.array(z.string()).optional(),
      dayOfMonth: z.number().min(1).max(31).optional(),
      month: z.number().min(1).max(12).optional(),
      day: z.number().min(1).max(31).optional(),
      unit: z.enum(['day', 'week', 'month', 'year']).optional(),
      endDate: z
        .union([
          z.string().datetime(),
          z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          z.date(),
        ])
        .optional()
        .nullable(),
      count: z.number().positive().optional(),
      exceptions: z.array(z.string()).optional(), // ISO date strings
    })
    .optional()
    .nullable(),
});

export const taskUpdateSchema = taskCreateSchema.partial();

export const taskCompleteSchema = z.object({
  completed: z.boolean(),
});

// Habit validation schemas
export const habitCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  frequency: z.object({
    type: z.enum(['daily', 'weekly', 'custom']),
    daysOfWeek: z.array(z.string()).default([]),
  }),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').default('#3B82F6'),
  icon: z.string().optional(),
});

export const habitUpdateSchema = habitCreateSchema.partial();

export const habitCompleteSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  notes: z.string().max(500).optional(),
});

// Calendar validation schemas
export const calendarQuerySchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  includeCompleted: z.boolean().default(true),
});

export const monthQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

export const weekQuerySchema = z.object({
  startDate: z.string().datetime(),
});

