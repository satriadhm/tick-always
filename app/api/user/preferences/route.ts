import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import jwt from 'jsonwebtoken';

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const { notifications } = await request.json();

    await connectDB();
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Initialize preferences if missing
    if (!user.preferences) {
      user.preferences = { notifications: { email: true, push: false, marketing: false } };
    }

    // Update only provided fields
    if (notifications) {
      user.preferences.notifications = {
        ...user.preferences.notifications,
        ...notifications
      };
    }

    await user.save();

    return NextResponse.json({
      success: true,
      data: { preferences: user.preferences }
    });
  } catch (error) {
    console.error('Failed to update preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
