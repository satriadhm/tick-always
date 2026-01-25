import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Habit } from '@/lib/models/Habit';
import { HabitCompletion } from '@/lib/models/HabitCompletion';
import { requireAuth } from '@/lib/auth';
import { ApiResponse } from '@/types';
import { startOfDay, subDays, format, differenceInDays } from 'date-fns';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/habits/:id/stats - Get habit statistics and completion history
export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const user = await requireAuth(request);
    const { id } = await params;

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '90');

    // Find habit
    const habit = await Habit.findOne({ _id: id, userId: user.userId });
    if (!habit) {
      return NextResponse.json({ success: false, error: 'Habit not found' }, { status: 404 });
    }

    // Get completions for the specified period
    const today = startOfDay(new Date());
    const startDate = subDays(today, days);

    const completions = await HabitCompletion.find({
      habitId: id,
      userId: user.userId,
      date: { $gte: startDate },
      completed: true,
    })
      .sort({ date: -1 })
      .lean();

    // Build completion map for calendar heatmap
    const completionsByDate: Record<string, boolean> = {};
    completions.forEach((c) => {
      const dateStr = format(new Date(c.date), 'yyyy-MM-dd');
      completionsByDate[dateStr] = true;
    });

    // Calculate stats
    const totalDays = differenceInDays(today, new Date(habit.createdAt)) + 1;
    const completedDays = completions.length;
    const completionRate = totalDays > 0 ? Math.round((completedDays / Math.min(totalDays, days)) * 100) : 0;

    // Get weekly breakdown (last 7 days)
    const weeklyData: { date: string; completed: boolean }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      weeklyData.push({
        date: dateStr,
        completed: !!completionsByDate[dateStr],
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        habit: {
          id: habit._id.toString(),
          name: habit.name,
          color: habit.color,
          currentStreak: habit.currentStreak,
          bestStreak: habit.bestStreak,
        },
        stats: {
          totalDays: Math.min(totalDays, days),
          completedDays,
          completionRate,
        },
        weeklyData,
        completionsByDate,
        period: {
          start: format(startDate, 'yyyy-MM-dd'),
          end: format(today, 'yyyy-MM-dd'),
          days,
        },
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Get habit stats error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch habit stats' }, { status: 500 });
  }
}
