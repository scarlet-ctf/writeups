import { NextResponse } from "next/server";

export async function GET() {
  // Patched version of the debug tool
  return NextResponse.json({
    error: "Access Denied: Admin session logging is disabled"
  }, { status: 403 });
}
