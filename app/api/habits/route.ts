import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Habit } from '@/lib/models/Habit';
import { HabitCompletion } from '@/lib/models/HabitCompletion';
import { requireAuth } from '@/lib/auth';
import { ApiResponse } from '@/types';
import { startOfDay, endOfDay, format } from 'date-fns';

// GET /api/habits - Get all habits with today's completion status
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const user = await requireAuth(request);

    // Get all habits for user
    const habits = await Habit.find({ userId: user.userId }).sort({ createdAt: -1 }).lean();

    // Get today's completions
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    const todayCompletions = await HabitCompletion.find({
      userId: user.userId,
      date: { $gte: todayStart, $lte: todayEnd },
      completed: true,
    }).lean();

    const completedHabitIds = new Set(todayCompletions.map((c) => c.habitId));

    // Format response with today's status
    const formattedHabits = habits.map((habit) => ({
      id: habit._id.toString(),
      name: habit.name,
      description: habit.description,
      frequency: habit.frequency,
      color: habit.color,
      icon: habit.icon,
      currentStreak: habit.currentStreak,
      bestStreak: habit.bestStreak,
      completedToday: completedHabitIds.has(habit._id.toString()),
      createdAt: habit.createdAt.toISOString(),
      updatedAt: habit.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        habits: formattedHabits,
        date: format(today, 'yyyy-MM-dd'),
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Get habits error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch habits' }, { status: 500 });
  }
}

// POST /api/habits - Create a new habit
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const user = await requireAuth(request);

    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Habit name is required' }, { status: 400 });
    }

    if (body.name.length > 100) {
      return NextResponse.json({ success: false, error: 'Habit name must be 100 characters or less' }, { status: 400 });
    }

    // Prepare habit data
    const habitData = {
      userId: user.userId,
      name: body.name.trim(),
      description: body.description?.trim() || undefined,
      frequency: body.frequency || { type: 'daily', daysOfWeek: [] },
      color: body.color || '#6b8cce',
      icon: body.icon || undefined,
      currentStreak: 0,
      bestStreak: 0,
    };

    // Create habit
    const habit = await Habit.create(habitData);

    // Format response
    const formattedHabit = {
      id: habit._id.toString(),
      name: habit.name,
      description: habit.description,
      frequency: habit.frequency,
      color: habit.color,
      icon: habit.icon,
      currentStreak: habit.currentStreak,
      bestStreak: habit.bestStreak,
      completedToday: false,
      createdAt: habit.createdAt.toISOString(),
      updatedAt: habit.updatedAt.toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: { habit: formattedHabit },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Create habit error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create habit' }, { status: 500 });
  }
}
