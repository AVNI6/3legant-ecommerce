import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import OrdersContent from "@/sections/account/OrdersContent"
import { redirect } from "next/navigation"
import { APP_ROUTE } from "@/constants/AppRoutes"
import { getRefundWindowDays, DEFAULT_REFUND_WINDOW_DAYS } from "@/constants/RefundConfig"

export default async function OrdersPage() {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        redirect(APP_ROUTE.signin)
    }

    // Fetch orders with all required fields - CORRECTED for actual schema
    const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select(`
            id,
            user_id,
            total_price,
            status,
            order_date,
            shipping_address,
            payment_method,
            billing_address,
            items_snapshot,
            invoice_url,
            invoice_sent_at,
            refund_status,
            refund_amount,
            refund_reason,
            discount_amount,
            coupon_code,
            admin_note,
            order_items (
                id,
                product_id,
                price,
                quantity,
                color,
                variant_id
            )
        `)
        .eq("user_id", user.id)
        .order("order_date", { ascending: false })

    if (ordersError) {
        console.error("Error fetching orders:", ordersError.message)
    } else {
        console.log("Orders loaded:", orders?.length || 0)
    }

    let refundWindowDays = DEFAULT_REFUND_WINDOW_DAYS
    try {
        const { createAdminClient } = await import("@/lib/supabase/admin")
        const adminSupabase = createAdminClient()
        const { data: settingData } = await adminSupabase
            .from("admin_settings")
            .select("setting_value")
            .eq("setting_key", "refund_window_days")
            .single()

        if (settingData?.setting_value) {
            refundWindowDays = parseInt(settingData.setting_value, 10) || DEFAULT_REFUND_WINDOW_DAYS
        }
    } catch (error) {
        console.error("Failed to fetch refund window:", error)
    }

    return (
        <OrdersContent
            initialOrders={(orders as any[]) || []}
            refundWindowDays={refundWindowDays}
        />
    )
}
