import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import type { SessionData } from './src/auth/session';

const PROTECTED_PREFIX = '/admin';
const SIGN_IN_PATH = '/sign-in';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith(PROTECTED_PREFIX)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  const session = await getIronSession<SessionData>(request, response, {
    password: process.env.AUTH_SECRET!,
    cookieName: 'photo-blog-session',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
    },
  });

  if (!session.isAdmin) {
    const signInUrl = new URL(SIGN_IN_PATH, request.url);
    signInUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
