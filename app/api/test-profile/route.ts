import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { userId, name, email } = await request.json();
    
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(url, key);

    console.log("Creating profile with:", { userId, name, email });

    const { data, error } = await supabase.from("profiles").insert({
      id: userId,
      name: name || null,
      email,
      role: "user",
    }).select();

    if (error) {
      console.error("Profile insert error:", error);
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("Test profile error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
