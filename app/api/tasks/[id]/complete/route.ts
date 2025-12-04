import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Task } from '@/lib/models/Task';
import { requireAuth } from '@/lib/auth';
import { taskCompleteSchema } from '@/lib/utils/validation';
import { ApiResponse } from '@/types';

// PATCH /api/tasks/[id]/complete - Toggle task completion
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const user = await requireAuth(request);
    const { id } = await params;

    const body = await request.json();
    const validatedData = taskCompleteSchema.parse(body);

    // Find task and verify ownership
    const task = await Task.findOne({
      _id: id,
      userId: user.userId,
      deletedAt: { $exists: false },
    });

    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    // Update completion status
    task.completed = validatedData.completed;
    if (validatedData.completed) {
      task.completedAt = new Date();
    } else {
      task.completedAt = undefined;
    }

    await task.save();

    // TODO: If recurring task and completed, generate next occurrence
    // This will be implemented in Phase 3

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

    console.error('Complete task error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update task' }, { status: 500 });
  }
}

