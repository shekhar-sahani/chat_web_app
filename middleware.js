import { NextResponse } from 'next/server';

export async function middleware(req) {
  const token = req.cookies.get('authToken');
  const url = req.nextUrl.clone();

  if (url.pathname === '/login' && token) {
    console.log('User is already logged in, redirecting to home page.');
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (url.pathname !== '/login' && !token) {
    console.log('No token found, redirecting to login page.');
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (token) {
    try {
      const apiUrl = `${url.origin}/api/auth/validate-token`;
      console.log('Validating token with API:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.value }),
      });

      if (!response.ok) {
        console.error('Token validation failed:', response.statusText);
        throw new Error('Invalid token');
      }

      console.log('Token is valid, proceeding.');
      return NextResponse.next();

    } catch (err) {
      console.error('Authentication error:', err.message);

      const res = NextResponse.redirect(new URL('/login', req.url));
      res.cookies.set('authToken', '', { httpOnly: true, maxAge: -1 });
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login'],
};
