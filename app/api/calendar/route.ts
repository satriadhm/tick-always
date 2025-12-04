import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Task } from '@/lib/models/Task';
import { requireAuth } from '@/lib/auth';
import { ApiResponse, Priority } from '@/types';
import { generateRecurrenceInstances } from '@/lib/utils/recurrence';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, format, parseISO, startOfDay } from 'date-fns';

interface CalendarTask {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: Priority;
  tags: string[];
  completed: boolean;
  isRecurring: boolean;
  parentTaskId?: string;
  occurrenceDate?: string;
}

interface CalendarDay {
  date: string;
  tasks: CalendarTask[];
}

interface CalendarResponse {
  range: {
    start: string;
    end: string;
  };
  days: CalendarDay[];
}

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<CalendarResponse>>> {
  try {
    await connectDB();
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'month';
    const dateParam = searchParams.get('date');
    const hideCompleted = searchParams.get('hideCompleted') === 'true';

    // Parse date or use today
    const selectedDate = dateParam ? parseISO(dateParam) : new Date();
    
    // Calculate date range based on view
    let startDate: Date;
    let endDate: Date;
    
    if (view === 'week') {
      startDate = startOfWeek(selectedDate, { weekStartsOn: 0 });
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
    } else if (view === 'day') {
      startDate = startOfDay(selectedDate);
      endDate = startOfDay(selectedDate);
    } else {
      // Month view (default)
      startDate = startOfWeek(startOfMonth(selectedDate), { weekStartsOn: 0 });
      endDate = endOfWeek(endOfMonth(selectedDate), { weekStartsOn: 0 });
    }

    // Fetch all tasks for the user in the date range
    const tasks = await Task.find({
      userId: user.userId,
      deletedAt: { $exists: false },
      $or: [
        { dueDate: { $gte: startDate, $lte: endDate } },
        { isRecurring: true },
      ],
    }).lean();

    // Group tasks by date
    const tasksByDate: { [key: string]: CalendarTask[] } = {};

    // Process regular tasks
    for (const task of tasks) {
      if (!task.isRecurring && task.dueDate) {
        const taskDate = format(new Date(task.dueDate), 'yyyy-MM-dd');
        if (!tasksByDate[taskDate]) {
          tasksByDate[taskDate] = [];
        }
        
        if (!hideCompleted || !task.completed) {
          tasksByDate[taskDate].push({
            id: task._id.toString(),
            title: task.title,
            description: task.description,
            dueDate: task.dueDate.toISOString(),
            priority: task.priority as Priority,
            tags: task.tags,
            completed: task.completed,
            isRecurring: false,
          });
        }
      }
    }

    // Process recurring tasks and generate instances
    for (const task of tasks) {
      if (task.isRecurring && task.recurrenceRule) {
        const instances = generateRecurrenceInstances(
          {
            id: task._id.toString(),
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            priority: task.priority,
            tags: task.tags,
            completed: task.completed,
            isRecurring: true,
            recurrenceRule: task.recurrenceRule,
          },
          startDate,
          endDate
        );

        for (const instance of instances) {
          const instanceDate = format(instance.dueDate, 'yyyy-MM-dd');
          if (!tasksByDate[instanceDate]) {
            tasksByDate[instanceDate] = [];
          }
          tasksByDate[instanceDate].push({
            id: instance.id,
            title: instance.title,
            description: instance.description,
            dueDate: instance.dueDate.toISOString(),
            priority: instance.priority as Priority,
            tags: instance.tags,
            completed: instance.completed,
            isRecurring: false,
            parentTaskId: instance.parentTaskId,
            occurrenceDate: instance.occurrenceDate.toISOString(),
          });
        }
      }
    }

    // Create days array for the calendar range
    const days: CalendarDay[] = [];
    let dayIterator = new Date(startDate);

    while (dayIterator <= endDate) {
      const dateStr = format(dayIterator, 'yyyy-MM-dd');
      days.push({
        date: dateStr,
        tasks: tasksByDate[dateStr] || [],
      });
      const nextDate = new Date(dayIterator);
      nextDate.setDate(nextDate.getDate() + 1);
      dayIterator = nextDate;
    }

    return NextResponse.json({
      success: true,
      data: {
        range: {
          start: format(startDate, 'yyyy-MM-dd'),
          end: format(endDate, 'yyyy-MM-dd'),
        },
        days,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Calendar error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch calendar data' }, { status: 500 });
  }
}

