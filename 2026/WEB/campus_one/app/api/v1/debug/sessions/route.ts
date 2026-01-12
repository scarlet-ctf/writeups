import { NextResponse } from "next/server";
import { getSessions, initDb } from "@/lib/db";

// Ensure DB is init
try { initDb(); } catch(e) {}

export async function GET() {
  // Simulate "System Admin Debug Tool" (Legacy v1)
  // This version still leaks tokens!
  
  const active_sessions = getSessions();

  return NextResponse.json({
    system_status: "active",
    api_version: "v1.0.2-legacy",
    active_sessions: active_sessions
  });
}
