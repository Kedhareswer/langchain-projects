import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { supabaseUrl, supabaseServiceKey } = body as {
      supabaseUrl?: string;
      supabaseServiceKey?: string;
    };

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Missing Supabase URL or service key" },
        { status: 400 },
      );
    }

    const client = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await client.from("documents").select("id").limit(1);
    if (error) {
      return NextResponse.json(
        { error: `Query failed: ${error.message}` },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, count: data?.length ?? 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


