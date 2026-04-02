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

    if (!userId || !email) {
      console.error("Missing required fields:", { userId, email });
      return NextResponse.json({ error: "Missing userId or email" }, { status: 400 });
    }

    const supabase = getSupabase();
    console.log("Attempting to create profile:", { userId, name, email });

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
        console.log("Profile already exists, treating as success");
        return NextResponse.json({ ok: true, message: "Profile already exists" });
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

    console.log("Profile created successfully:", data);
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    console.error("Signup API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create profile" },
      { status: 500 }
    );
  }
}
