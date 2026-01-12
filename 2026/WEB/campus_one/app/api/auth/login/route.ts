import { NextResponse } from "next/server";
import { createSession, getUser, initDb } from "@/lib/db";

// Ensure DB is authorized
try {
  initDb();
} catch (e) {
  console.error("Failed to init DB", e);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check DB
    const user = getUser(email);

    if (user && user.password === password) {
      // Success
      const sessionId = `student_session_${Math.random().toString(36).substring(2)}`;

      // Store in DB
      try {
        createSession(sessionId, user.email);
      } catch (dbError) {
        console.error("DB Session Error", dbError);
        return NextResponse.json({ error: "Session creation failed" }, { status: 500 });
      }

      // Create response with cookie
      const response = NextResponse.json({ success: true, user: { email: user.email, role: user.role } });

      // HTTP Only cookie for security (mocking a real secure setup)
      // We set it slightly loosely to allow our client-side context to read it for this demo,
      // or we explicitly assume the middleware handles protection.
      // For the CTF element to remain (client-side context reading), 
      // we might NOT make it httpOnly, or we rely on the `UserContext` needing to be updated manually.
      // Let's stick to the previous logic: simplest cookie.
      response.cookies.set('session_id', sessionId, {
        path: '/',
        maxAge: 86400
      });

      return response;
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
