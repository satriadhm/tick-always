import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Task } from '@/lib/models/Task';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';
import { toUTC } from '@/lib/utils/dateHelpers';
import { ApiResponse, ITask } from '@/types';
import { SortOrder } from 'mongoose';

const taskCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  dueDate: z.string().optional().nullable(),
  priority: z.enum(['none', 'low', 'medium', 'high']).optional().default('none'),
  tags: z.array(z.string()).optional().default([]),
  isRecurring: z.boolean().optional().default(false),
});

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const user = await requireAuth(request);

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const completed = searchParams.get('completed');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');
    const dueDateFrom = searchParams.get('dueDateFrom');
    const dueDateTo = searchParams.get('dueDateTo');
    const sortBy = searchParams.get('sortBy') || 'dueDate';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    const query: any = {
      userId: user.userId,
      deletedAt: { $exists: false },
    };

    if (completed !== null) {
      query.completed = completed === 'true';
    }

    if (priority) {
      query.priority = priority;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (dueDateFrom || dueDateTo) {
      const dateFilter: any = {};
      if (dueDateFrom) dateFilter.$gte = new Date(dueDateFrom);
      if (dueDateTo) dateFilter.$lte = new Date(dueDateTo);
      query.dueDate = dateFilter;
    }
    
    // Sort
    const sort: Record<string, SortOrder> = {};
    if (sortBy === 'dueDate') {
       sort['dueDate'] = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'createdAt') {
       sort['createdAt'] = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'priority') {
        sort['priority'] = sortOrder === 'asc' ? 1 : -1;
    } else {
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }
    
    // Secondary sort by createdAt desc to ensure stable order
    if (sortBy !== 'createdAt') {
        sort['createdAt'] = -1;
    }

    const tasks = await Task.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Task.countDocuments(query);

    const formattedTasks = tasks.map(task => ({
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
    }));

    return NextResponse.json({
      success: true,
      data: {
        tasks: formattedTasks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      console.error('Get tasks error:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const user = await requireAuth(request);

    const body = await request.json();
    
    // Validate body
    let validatedData;
    try {
        validatedData = taskCreateSchema.parse(body);
    } catch (error) {
        if (error instanceof z.ZodError) {
             return NextResponse.json({ success: false, error: error.issues[0].message }, { status: 400 });
        }
        throw error;
    }

    const newTask = await Task.create({
      userId: user.userId,
      title: validatedData.title,
      description: validatedData.description,
      dueDate: validatedData.dueDate ? toUTC(validatedData.dueDate) : undefined,
      priority: validatedData.priority,
      tags: validatedData.tags,
      isRecurring: validatedData.isRecurring,
      // Default fields
      completed: false,
    });

    const formattedTask = {
        id: newTask._id.toString(),
        userId: newTask.userId.toString(),
        title: newTask.title,
        description: newTask.description,
        dueDate: newTask.dueDate ? newTask.dueDate.toISOString() : null,
        priority: newTask.priority,
        tags: newTask.tags,
        completed: newTask.completed,
        completedAt: newTask.completedAt ? newTask.completedAt.toISOString() : null,
        isRecurring: newTask.isRecurring,
        recurrenceRule: newTask.recurrenceRule,
        parentTaskId: newTask.parentTaskId ? newTask.parentTaskId.toString() : null,
        occurrenceDate: newTask.occurrenceDate ? newTask.occurrenceDate.toISOString() : null,
        createdAt: newTask.createdAt.toISOString(),
        updatedAt: newTask.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: { task: formattedTask },
    }, { status: 201 });

  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Create task error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create task' }, { status: 500 });
  }
}
