import { NextResponse } from "next/server";
import { getSessions, initDb } from "@/lib/db";

// Ensure DB is init
try { initDb(); } catch(e) {}

export async function GET() {
  // Simulate "System Admin Debug Tool"
  // NOW CONNECTED TO REAL DATABASE
  // This endpoint is "accidentally" public
  
  const active_sessions = getSessions();

  return NextResponse.json({
    system_status: "active",
    debug_mode: true,
    active_sessions: active_sessions
  });
}
