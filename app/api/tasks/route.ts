import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Task } from '@/lib/models/Task';
import { requireAuth } from '@/lib/auth';
import { taskCreateSchema } from '@/lib/utils/validation';
import { ApiResponse, ITask } from '@/types';
import { toUTC } from '@/lib/utils/dateHelpers';

// GET /api/tasks - Get all tasks with filtering and pagination
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const completed = searchParams.get('completed');
    const priority = searchParams.get('priority');
    const tags = searchParams.get('tags');
    const search = searchParams.get('search');
    const dueDateFrom = searchParams.get('dueDateFrom');
    const dueDateTo = searchParams.get('dueDateTo');
    const sortBy = searchParams.get('sortBy') || 'dueDate';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Build query
    const query: any = {
      userId: user.userId,
      deletedAt: { $exists: false },
    };

    // Filter by completion status
    if (completed !== null && completed !== undefined) {
      query.completed = completed === 'true';
    }

    // Filter by priority
    if (priority && priority !== 'none') {
      query.priority = priority;
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map((tag) => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by date range
    if (dueDateFrom || dueDateTo) {
      query.dueDate = {};
      if (dueDateFrom) {
        query.dueDate.$gte = toUTC(dueDateFrom);
      }
      if (dueDateTo) {
        query.dueDate.$lte = toUTC(dueDateTo);
      }
    }

    // Build sort object
    const sort: any = {};
    if (sortBy === 'dueDate') {
      sort.dueDate = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1, none: 0 };
      // We'll sort in memory for priority
    } else if (sortBy === 'createdAt') {
      sort.createdAt = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'title') {
      sort.title = sortOrder === 'desc' ? -1 : 1;
    }

    // Get total count
    const total = await Task.countDocuments(query);

    // Fetch tasks
    let tasks = await Task.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Sort by priority if needed (in memory)
    if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1, none: 0 };
      tasks = tasks.sort((a, b) => {
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        return sortOrder === 'desc' ? bPriority - aPriority : aPriority - bPriority;
      });
    }

    // Format response
    const formattedTasks = tasks.map((task) => ({
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
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Get tasks error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const user = await requireAuth(request);

    const body = await request.json();
    const validatedData = taskCreateSchema.parse(body);

    // Prepare task data
    const taskData: any = {
      userId: user.userId,
      title: validatedData.title,
      description: validatedData.description,
      priority: validatedData.priority || 'none',
      tags: validatedData.tags || [],
      isRecurring: validatedData.isRecurring || false,
    };

    // Handle due date
    if (validatedData.dueDate) {
      // Convert date string to Date object if needed
      const dateValue =
        typeof validatedData.dueDate === 'string'
          ? new Date(validatedData.dueDate)
          : validatedData.dueDate;
      taskData.dueDate = toUTC(dateValue);
    }

    // Handle recurrence rule
    if (validatedData.isRecurring && validatedData.recurrenceRule) {
      taskData.recurrenceRule = validatedData.recurrenceRule;
      if (validatedData.recurrenceRule.endDate) {
        taskData.recurrenceRule.endDate = toUTC(validatedData.recurrenceRule.endDate);
      }
    }

    // Create task
    const task = await Task.create(taskData);

    // Format response
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

    return NextResponse.json(
      {
        success: true,
        data: { task: formattedTask },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (error.name === 'ZodError' && error.errors && error.errors.length > 0) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Create task error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create task' },
      { status: 500 }
    );
  }
}

