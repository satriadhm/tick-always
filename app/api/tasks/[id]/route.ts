import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Task } from '@/lib/models/Task';
import { requireAuth } from '@/lib/auth';
import { ApiResponse } from '@/types';
import { toUTC } from '@/lib/utils/dateHelpers';
import { z } from 'zod';

// Schema for updating a task - all fields are optional
const taskUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  dueDate: z.string().optional().nullable(),
  priority: z.enum(['none', 'low', 'medium', 'high']).optional(),
  tags: z.array(z.string()).optional(),
  isRecurring: z.boolean().optional(),
  recurrenceRule: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    interval: z.number().optional(),
    endDate: z.string().optional(),
  }).optional().nullable(),
});

// GET /api/tasks/[id] - Get a specific task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const user = await requireAuth(request);
    const { id } = await params;

    const task = await Task.findOne({
      _id: id,
      userId: user.userId,
      deletedAt: { $exists: false },
    }).lean();

    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    const formattedTask = {
      id: task._id.toString(),
      userId: task.userId.toString(),
      title: task.title,
      description: task.description,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      priority: task.priority,
      tags: task.tags,
      completed: task.completed,
      completedAt: task.completedAt ? task.completedAt.toISOString() : null,
      isRecurring: task.isRecurring,
      recurrenceRule: task.recurrenceRule,
      parentTaskId: task.parentTaskId ? task.parentTaskId.toString() : null,
      occurrenceDate: task.occurrenceDate ? task.occurrenceDate.toISOString() : null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: { task: formattedTask },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Get task error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch task' }, { status: 500 });
  }
}

// PUT /api/tasks/[id] - Update a task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const user = await requireAuth(request);
    const { id } = await params;

    const body = await request.json();
    const validatedData = taskUpdateSchema.parse(body);

    // Find task and verify ownership
    const task = await Task.findOne({
      _id: id,
      userId: user.userId,
      deletedAt: { $exists: false },
    });

    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    // Update fields
    if (validatedData.title !== undefined) task.title = validatedData.title;
    if (validatedData.description !== undefined) task.description = validatedData.description;
    if (validatedData.priority !== undefined) task.priority = validatedData.priority;
    if (validatedData.tags !== undefined) task.tags = validatedData.tags;
    if (validatedData.isRecurring !== undefined) task.isRecurring = validatedData.isRecurring;
    if (validatedData.recurrenceRule !== undefined) {
      task.recurrenceRule = validatedData.recurrenceRule;
      if (validatedData.recurrenceRule?.endDate) {
        task.recurrenceRule.endDate = toUTC(validatedData.recurrenceRule.endDate);
      }
    }

    // Handle due date
    if (validatedData.dueDate !== undefined) {
      task.dueDate = validatedData.dueDate ? toUTC(validatedData.dueDate) : undefined;
    }

    await task.save();

    const formattedTask = {
      id: task._id.toString(),
      userId: task.userId.toString(),
      title: task.title,
      description: task.description,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      priority: task.priority,
      tags: task.tags,
      completed: task.completed,
      completedAt: task.completedAt ? task.completedAt.toISOString() : null,
      isRecurring: task.isRecurring,
      recurrenceRule: task.recurrenceRule,
      parentTaskId: task.parentTaskId ? task.parentTaskId.toString() : null,
      occurrenceDate: task.occurrenceDate ? task.occurrenceDate.toISOString() : null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: { task: formattedTask },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof Error && 'name' in error && error.name === 'ZodError' && 'errors' in error && Array.isArray(error.errors) && error.errors.length > 0) {
      return NextResponse.json(
        { success: false, error: ((error as { errors: Array<{ message: string }> }).errors[0]).message },
        { status: 400 }
      );
    }

    console.error('Update task error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const user = await requireAuth(request);
    const { id } = await params;

    // Soft delete
    const task = await Task.findOneAndUpdate(
      {
        _id: id,
        userId: user.userId,
        deletedAt: { $exists: false },
      },
      {
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Delete task error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete task' }, { status: 500 });
  }
}

