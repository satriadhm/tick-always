import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { requireAuth } from '@/lib/auth';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();

    const authUser = await requireAuth(request);

    // Get user from database
    const user = await User.findById(authUser.userId).select('-password');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      preferences: user.preferences,
      googleId: user.googleId,
    };

    return NextResponse.json(
      {
        success: true,
        data: { user: userData },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get user' },
      { status: 500 }
    );
  }
}

