import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

export async function POST(): Promise<NextResponse<ApiResponse>> {
  const response = NextResponse.json(
    {
      success: true,
      message: 'Logged out successfully',
    },
    { status: 200 }
  );

  // Clear auth cookie
  response.cookies.delete('auth-token');

  return response;
}

