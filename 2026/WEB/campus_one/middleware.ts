import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// In a real app, this would be in a database.
// We use a constant session ID for the admin to make it "hackable".
export const ADMIN_SESSION_ID = "admin_session_44920_x8z";
const ADMIN_USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"; // Suspiciously specific admin UA

export function middleware(request: NextRequest) {
  // 1. Session Management
  // If the user doesn't have a session, give them a guest one.
  let session = request.cookies.get('session_id')?.value;
  const response = NextResponse.next();

  if (!session) {
    session = `guest_session_${Math.random().toString(36).substring(2, 15)}`;
    response.cookies.set('session_id', session, { path: '/', httpOnly: true }); 
  }

  // 2. Admin Route Protection (UI and API)
  if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/api/admin')) {
    if (session !== ADMIN_SESSION_ID) {
        // Redir for UI, 403 for API
        if (request.nextUrl.pathname.startsWith('/api')) {
            return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 403, headers: { 'Content-Type': 'application/json' } });
        }
        return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
