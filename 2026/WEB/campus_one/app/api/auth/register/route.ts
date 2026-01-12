import { NextResponse } from "next/server";
import { createUser, initDb } from "@/lib/db";

// Ensure DB is init
try { initDb(); } catch(e) {}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    try {
        createUser(email, password);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        if (e.message === "User already exists") {
             return NextResponse.json({ error: "User already exists" }, { status: 409 });
        }
        throw e;
    }

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
