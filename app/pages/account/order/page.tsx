import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import OrdersContent from "@/sections/account/OrdersContent"
import { redirect } from "next/navigation"
import { APP_ROUTE } from "@/constants/AppRoutes"
import { getRefundWindowDays, DEFAULT_REFUND_WINDOW_DAYS } from "@/constants/RefundConfig"

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const sp = await searchParams
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        redirect(APP_ROUTE.signin)
    }

    const currentPage = parseInt(sp.page || "1", 10)
    const PAGE_SIZE = 10
    const from = (currentPage - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data: ordersData, error: ordersError, count } = await supabase
        .from("orders")
        .select(`
            id, user_id, total_price, status, order_date, shipping_address,
            payment_method, billing_address, items_snapshot, invoice_url,
            invoice_sent_at, refund_status, refund_amount, refund_reason,
            discount_amount, coupon_code, admin_note,
            order_items ( id, product_id, price, quantity, color, variant_id )
        `, { count: "exact" })
        .eq("user_id", user.id)
        .order("order_date", { ascending: false })
        .range(from, to)

    if (ordersError) {
        console.error("Failed to fetch server-side orders:", ordersError)
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
            userId={user.id}
            currentPage={currentPage}
            refundWindowDays={refundWindowDays}
            initialOrders={(ordersData as any[]) || []}
            initialTotalCount={count || 0}
        />
    )
}
