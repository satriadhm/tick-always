import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const hasClientId = !!process.env.GOOGLE_CLIENT_ID;
    const hasClientSecret = !!process.env.GOOGLE_CLIENT_SECRET;

    return NextResponse.json({
      configured: hasClientId && hasClientSecret,
      clientId: hasClientId ? 'Set' : 'Missing',
      clientSecret: hasClientSecret ? 'Set' : 'Missing',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to check configuration',
        configured: false,
      },
      { status: 500 },
    );
  }
}

