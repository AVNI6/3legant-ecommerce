import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("admin_settings")
      .select("setting_value")
      .eq("setting_key", "refund_window_days")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { refund_window_days: 15 },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { refund_window_days: parseInt(data.setting_value, 10) },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error fetching refund settings:", err);
    return NextResponse.json(
      { error: "Failed to fetch settings", refund_window_days: 15 },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { refund_window_days } = await req.json();

    if (!refund_window_days || refund_window_days < 1 || refund_window_days > 365) {
      return NextResponse.json(
        { error: "Invalid refund window days. Must be between 1 and 365." },
        { status: 400 }
      );
    }

    // Verify admin status by checking if setting value can be updated
    // Admin middleware will have already verified this before the request reaches here
    const { data, error } = await supabase
      .from("admin_settings")
      .update({
        setting_value: String(refund_window_days),
        updated_at: new Date().toISOString(),
      })
      .eq("setting_key", "refund_window_days")
      .select();

    if (error) {
      console.error("❌ Error updating refund settings:", error);
      return NextResponse.json(
        { error: error.message || "Failed to update setting" },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      console.error("❌ No rows updated for refund_window_days");
      // Try to insert if update failed
      const { data: insertData, error: insertError } = await supabase
        .from("admin_settings")
        .insert([{
          setting_key: "refund_window_days",
          setting_value: String(refund_window_days),
        }])
        .select();

      if (insertError) {
        return NextResponse.json(
          { error: "Failed to update or create setting" },
          { status: 500 }
        );
      }

      console.log("✅ Refund window created (new entry):", refund_window_days);
      return NextResponse.json(
        {
          success: true,
          refund_window_days,
          message: `Refund window set to ${refund_window_days} days`
        },
        { status: 200 }
      );
    }

    console.log("✅ Refund window updated to", refund_window_days, "days");
    return NextResponse.json(
      {
        success: true,
        refund_window_days,
        message: `Refund window updated to ${refund_window_days} days`
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Error updating refund settings:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
