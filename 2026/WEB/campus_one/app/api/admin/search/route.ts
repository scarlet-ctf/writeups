import { NextResponse } from "next/server";
import { searchOrders, initDb } from "@/lib/db";

// Ensure DB is init
try { initDb(); } catch(e) {}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query) {
        return NextResponse.json({ error: "Missing search query parameter 'q'" }, { status: 400 });
    }

    // This calls the vulnerable searchOrders function
    // SQL Injection is possible here!
    const results = searchOrders(query);

    return NextResponse.json({
        query: query,
        results: results,
        count: results.length
    });
}
