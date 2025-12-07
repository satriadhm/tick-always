import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: `${process.env.NEXT_AUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/google/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    })}`;

    return NextResponse.redirect(googleAuthUrl);
  } catch (error) {
    console.error('Google OAuth redirect error:', error);
    return NextResponse.redirect(
      new URL('/login?error=oauth_error', process.env.NEXT_AUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'),
    );
  }
}

