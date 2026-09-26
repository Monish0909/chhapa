import { NextRequest, NextResponse } from 'next/server';

const ADMIN_SESSION_COOKIE = 'admin_session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    // Environment variable check: LINE 12 of this file reads process.env.ADMIN_PASSWORD
    // Fallback placeholder check if ADMIN_PASSWORD is not set in environment
    const configuredPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (!password || password !== configuredPassword) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      );
    }

    // Set HTTP-only session cookie expiring in 7 days (60 * 60 * 24 * 7 seconds)
    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: 'authenticated',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
