import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Habit } from '@/lib/models/Habit';
import { HabitCompletion } from '@/lib/models/HabitCompletion';
import { requireAuth } from '@/lib/auth';
import { ApiResponse } from '@/types';
import { startOfDay, endOfDay, subDays, parseISO, format, isSameDay } from 'date-fns';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/habits/:id/complete - Toggle habit completion for a date
export async function POST(request: NextRequest, { params }: RouteParams): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const user = await requireAuth(request);
    const { id } = await params;

    const body = await request.json();
    
    // Parse date (default to today)
    let targetDate: Date;
    if (body.date) {
      targetDate = parseISO(body.date);
      if (isNaN(targetDate.getTime())) {
        return NextResponse.json({ success: false, error: 'Invalid date format' }, { status: 400 });
      }
    } else {
      targetDate = new Date();
    }

    const dateStart = startOfDay(targetDate);
    const dateEnd = endOfDay(targetDate);

    // Find habit
    const habit = await Habit.findOne({ _id: id, userId: user.userId });
    if (!habit) {
      return NextResponse.json({ success: false, error: 'Habit not found' }, { status: 404 });
    }

    // Check if already completed for this date
    const existingCompletion = await HabitCompletion.findOne({
      habitId: id,
      userId: user.userId,
      date: { $gte: dateStart, $lte: dateEnd },
    });

    let completed: boolean;
    
    if (body.completed !== undefined) {
      // Explicit set
      completed = Boolean(body.completed);
    } else {
      // Toggle
      completed = !existingCompletion?.completed;
    }

    if (completed) {
      if (existingCompletion) {
        existingCompletion.completed = true;
        existingCompletion.notes = body.notes || existingCompletion.notes;
        await existingCompletion.save();
      } else {
        await HabitCompletion.create({
          habitId: id,
          userId: user.userId,
          date: dateStart,
          completed: true,
          notes: body.notes,
        });
      }
    } else {
      if (existingCompletion) {
        existingCompletion.completed = false;
        await existingCompletion.save();
      }
    }

    // Update streaks if completion is for today
    if (isSameDay(targetDate, new Date())) {
      await updateStreak(habit, user.userId, id);
    }

    return NextResponse.json({
      success: true,
      data: {
        completed,
        date: format(targetDate, 'yyyy-MM-dd'),
        currentStreak: habit.currentStreak,
        bestStreak: habit.bestStreak,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Toggle habit completion error:', error);
    return NextResponse.json({ success: false, error: 'Failed to toggle completion' }, { status: 500 });
  }
}

// Helper function to update streak
async function updateStreak(habit: typeof Habit.prototype, userId: string, habitId: string) {
  // Get completions for the last 365 days
  const today = startOfDay(new Date());
  const yearAgo = subDays(today, 365);

  const completions = await HabitCompletion.find({
    habitId,
    userId,
    date: { $gte: yearAgo },
    completed: true,
  })
    .sort({ date: -1 })
    .lean();

  // Calculate current streak (consecutive days including today)
  let currentStreak = 0;
  let checkDate = today;

  for (let i = 0; i < 365; i++) {
    const hasCompletion = completions.some((c) => isSameDay(new Date(c.date), checkDate));
    
    if (hasCompletion) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    } else if (i === 0) {
      // If today is not completed, check if yesterday starts a streak
      checkDate = subDays(checkDate, 1);
      const yesterdayCompletion = completions.some((c) => isSameDay(new Date(c.date), checkDate));
      if (!yesterdayCompletion) {
        break; // No streak
      }
    } else {
      break; // Streak broken
    }
  }

  // Update habit
  habit.currentStreak = currentStreak;
  if (currentStreak > habit.bestStreak) {
    habit.bestStreak = currentStreak;
  }
  await habit.save();
}
