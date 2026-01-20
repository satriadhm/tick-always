import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Habit } from '@/lib/models/Habit';
import { HabitCompletion } from '@/lib/models/HabitCompletion';
import { requireAuth } from '@/lib/auth';
import { ApiResponse } from '@/types';
import { startOfDay, endOfDay, format } from 'date-fns';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/habits/:id - Get single habit with stats
export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const user = await requireAuth(request);
    const { id } = await params;

    const habit = await Habit.findOne({ _id: id, userId: user.userId }).lean();

    if (!habit) {
      return NextResponse.json({ success: false, error: 'Habit not found' }, { status: 404 });
    }

    // Get today's completion status
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    const todayCompletion = await HabitCompletion.findOne({
      habitId: id,
      userId: user.userId,
      date: { $gte: todayStart, $lte: todayEnd },
      completed: true,
    }).lean();

    const formattedHabit = {
      id: habit._id.toString(),
      name: habit.name,
      description: habit.description,
      frequency: habit.frequency,
      color: habit.color,
      icon: habit.icon,
      currentStreak: habit.currentStreak,
      bestStreak: habit.bestStreak,
      completedToday: !!todayCompletion,
      createdAt: habit.createdAt.toISOString(),
      updatedAt: habit.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: { habit: formattedHabit, date: format(today, 'yyyy-MM-dd') },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Get habit error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch habit' }, { status: 500 });
  }
}

// PUT /api/habits/:id - Update habit
export async function PUT(request: NextRequest, { params }: RouteParams): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const user = await requireAuth(request);
    const { id } = await params;

    const body = await request.json();

    // Find habit
    const habit = await Habit.findOne({ _id: id, userId: user.userId });

    if (!habit) {
      return NextResponse.json({ success: false, error: 'Habit not found' }, { status: 404 });
    }

    // Update fields
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return NextResponse.json({ success: false, error: 'Habit name cannot be empty' }, { status: 400 });
      }
      habit.name = body.name.trim();
    }

    if (body.description !== undefined) {
      habit.description = body.description?.trim() || undefined;
    }

    if (body.frequency !== undefined) {
      habit.frequency = body.frequency;
    }

    if (body.color !== undefined) {
      habit.color = body.color;
    }

    if (body.icon !== undefined) {
      habit.icon = body.icon || undefined;
    }

    await habit.save();

    const formattedHabit = {
      id: habit._id.toString(),
      name: habit.name,
      description: habit.description,
      frequency: habit.frequency,
      color: habit.color,
      icon: habit.icon,
      currentStreak: habit.currentStreak,
      bestStreak: habit.bestStreak,
      createdAt: habit.createdAt.toISOString(),
      updatedAt: habit.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: { habit: formattedHabit },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Update habit error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update habit' }, { status: 500 });
  }
}

// DELETE /api/habits/:id - Delete habit
export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const user = await requireAuth(request);
    const { id } = await params;

    const habit = await Habit.findOne({ _id: id, userId: user.userId });

    if (!habit) {
      return NextResponse.json({ success: false, error: 'Habit not found' }, { status: 404 });
    }

    // Delete habit and all completions
    await Promise.all([
      Habit.deleteOne({ _id: id }),
      HabitCompletion.deleteMany({ habitId: id }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Habit deleted successfully',
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Delete habit error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete habit' }, { status: 500 });
  }
}
