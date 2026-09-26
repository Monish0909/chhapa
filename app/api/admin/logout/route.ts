import { NextResponse } from 'next/server';

const ADMIN_SESSION_COOKIE = 'admin_session';

export async function POST() {
  const response = NextResponse.json({ success: true });
  // Clear the session cookie
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
