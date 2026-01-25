import { NextRequest, NextResponse } from 'next/server';
import { 
  verifyRefreshToken, 
  signAccessToken, 
  getAccessTokenMaxAgeSeconds,
  revokeRefreshToken
} from '@/lib/tokens';
import { User } from '@/lib/models/User';
import connectDB from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;
    const { searchParams } = new URL(request.url);
    const redirectUrl = searchParams.get('redirect') || '/tasks';

    if (!refreshToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verify refresh token
    const payload = await verifyRefreshToken(refreshToken);

    if (!payload) {
      // Invalid or expired refresh token
      return NextResponse.redirect(new URL('/login', request.url));
    }

    await connectDB();
    const user = await User.findById(payload.userId);

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Generate new access token
    const accessToken = signAccessToken(user);

    // Create response with redirect
    const response = NextResponse.redirect(new URL(redirectUrl, request.url));

    // Set new access token cookie
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: getAccessTokenMaxAgeSeconds(),
    });

    return response;
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
