import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
};

export async function POST(request: Request) {
  try {
    const { userId, name, email } = await request.json();

    if (!email) {
      console.error("Missing required fields:", { userId, email });
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const supabase = getSupabase();

    if (!userId) {
      const { data: existingProfile, error: lookupError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (lookupError) {
        return NextResponse.json({ error: lookupError.message }, { status: 500 });
      }

      if (existingProfile?.id) {
        return NextResponse.json({ error: "User already exists" }, { status: 409 });
      }

      return NextResponse.json({ ok: true });
    }

    const { data, error } = await supabase.from("profiles").insert({
      id: userId,
      name: name || null,
      email,
      role: "user",
    }).select();

    if (error) {
      console.error("Profile insert error:", error);

      // If profile already exists (duplicate key), treat as success
      if (error.code === "23505") {
        return NextResponse.json({ error: "User already exists" }, { status: 409 });
      }

      // Log the full error details for debugging
      console.error("Full error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });

      return NextResponse.json({
        error: error.message,
        code: error.code,
        details: error.details
      }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    console.error("Signup API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create profile" },
      { status: 500 }
    );
  }
}
