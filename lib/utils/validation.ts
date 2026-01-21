import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100),
});

// Task schemas
export const taskCompleteSchema = z.object({
  completed: z.boolean(),
});

export const taskCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  dueDate: z.string().optional().nullable(),
  priority: z.enum(['none', 'low', 'medium', 'high']).optional().default('none'),
  tags: z.array(z.string()).optional().default([]),
  isRecurring: z.boolean().optional().default(false),
});

export const taskUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  dueDate: z.string().optional().nullable(),
  priority: z.enum(['none', 'low', 'medium', 'high']).optional(),
  tags: z.array(z.string()).optional(),
  isRecurring: z.boolean().optional(),
});
