import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { exaApiKey } = body as { exaApiKey?: string };

    const key = exaApiKey || process.env.EXA_API_KEY;
    if (!key) {
      return NextResponse.json(
        { error: "Missing EXA API key" },
        { status: 400 },
      );
    }

    const res = await fetch("https://api.exa.ai/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
      },
      body: JSON.stringify({ query: "hello", numResults: 1, useAutoprompt: true }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `EXA test failed: ${text || res.statusText}` },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: `Server error: ${e.message}` },
      { status: 500 },
    );
  }
}


