import { authService } from '@/lib/services/authService';
import {
  getAccessTokenMaxAgeSeconds,
  getRefreshTokenMaxAgeSeconds,
  signAccessToken,
  signAndStoreRefreshToken,
} from '@/lib/tokens';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(new URL('/login?error=google_auth_failed', request.url));
    }

    if (!code) {
      console.error('Missing OAuth code');
      return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
    }

    // Exchange code for token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_AUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/google/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.id_token) {
      console.error('No ID token received:', tokenData);
      return NextResponse.redirect(new URL('/login?error=token_exchange_failed', request.url));
    }

    // Login with Google token
    const result = await authService.googleLogin(tokenData.id_token);

    if (!result.success) {
      console.error('Google login failed:', result.error, result.message);
      return NextResponse.redirect(new URL('/login?error=google_login_failed', request.url));
    }

    if (!result.user) {
      return NextResponse.redirect(new URL('/login?error=user_not_found', request.url));
    }

    // Set cookies and redirect
    const response = NextResponse.redirect(new URL('/tasks', request.url));

    const accessToken = signAccessToken(result.user);
    const refreshToken = await signAndStoreRefreshToken(result.user);

    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: getAccessTokenMaxAgeSeconds(),
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: getRefreshTokenMaxAgeSeconds(),
    });

    response.cookies.set('userId', result.user.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    response.cookies.set('userRole', result.user.role || 'user', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    response.cookies.set('userName', encodeURIComponent(result.user.name || ''), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(new URL('/login?error=callback_error', request.url));
  }
}

