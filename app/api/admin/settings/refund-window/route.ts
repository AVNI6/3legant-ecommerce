import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabase
      .from("admin_settings")
      .select("setting_value")
      .eq("setting_key", "refund_window_days")
      .single();

    if (error || !data) {
      console.error("Error fetching refund window setting:", error);
      return NextResponse.json(
        { refund_window_days: 15 },
        { status: 200 }
      );
    }

    return NextResponse.json({
      refund_window_days: parseInt(data.setting_value, 10) || 15,
    });
  } catch (error) {
    console.error("Refund window fetch error:", error);
    return NextResponse.json(
      { refund_window_days: 15 },
      { status: 200 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify admin user
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profileError || (profile?.role || "").trim().toLowerCase() !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { refund_window_days } = await req.json();

    if (!refund_window_days || refund_window_days < 1 || refund_window_days > 365) {
      return NextResponse.json(
        { error: "Refund window must be between 1 and 365 days" },
        { status: 400 }
      );
    }

    // Update the setting
    const { data, error } = await supabase
      .from("admin_settings")
      .update({
        setting_value: refund_window_days.toString(),
        updated_by: session.user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("setting_key", "refund_window_days")
      .select();

    if (error) {
      console.error("Error updating refund window:", error);
      return NextResponse.json(
        { error: "Failed to update setting" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      refund_window_days: parseInt(data?.[0]?.setting_value || refund_window_days, 10),
    });
  } catch (error: any) {
    console.error("Refund window update error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
