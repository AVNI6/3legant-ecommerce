"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import { OrderStatus } from "@/types/enums"
import { getRefundWindowDays, clearRefundWindowCache } from "@/constants/RefundConfig"

// Types
export type AdminStats = {
  totalProducts: number
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  customersCount: number
  totalRevenueLast30Days: number
  ordersTrend: number
  dailyRevenue: { label: string; value: number }[]
  topProducts: { name: string; image: string; totalSold: number; revenue: number }[]
}

// 🔐 Centralized Query Keys for reliable invalidation
export const ADMIN_KEYS = {
  stats: ["admin", "stats"] as const,
  orders: (params?: any) => params ? ["admin", "orders", params] : ["admin", "orders"],
  users: (params?: any) => params ? ["admin", "users", params] : ["admin", "users"],
  products: ["admin", "products"] as const,
  payments: ["admin", "payments"] as const,
  reviews: (params?: any) => params ? ["admin", "reviews", params] : ["admin", "reviews"],
  coupons: ["admin", "coupons"] as const,
  refunds: (params?: any) => params ? ["admin", "refunds", params] : ["admin", "refunds"],
  shipping: ["admin", "shipping-methods"] as const,
  settings: ["admin", "refund-settings"] as const,
  questions: ["admin", "questions"] as const,
  banners: ["admin", "banners"] as const,
  blogs: ["admin", "blogs"] as const,
}

// 🛠 Generic Mutation Helper for UPSERT operations (Insert/Update)
function useAdminMutation<T extends { id?: any }>({
  table,
  queryKeyToInvalidate,
  additionalInvalidates = []
}: {
  table: string,
  queryKeyToInvalidate: any,
  additionalInvalidates?: any[]
}) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id?: T["id"]; payload: any }) => {
      const { error } = id
        ? await supabase.from(table).update(payload).eq("id", id)
        : await supabase.from(table).insert([payload])
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate })
      additionalInvalidates.forEach(key => queryClient.invalidateQueries({ queryKey: key }))
    }
  })
}

// 🛠 Generic Delete Helper
function useAdminDeleteMutation({
  table,
  queryKeyToInvalidate
}: {
  table: string,
  queryKeyToInvalidate: any
}) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: any) => {
      const { error } = await supabase.from(table).delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate })
    }
  })
}

// Queries
export function useAdminStats() {
  return useQuery({
    queryKey: ADMIN_KEYS.stats,
    queryFn: async (): Promise<AdminStats> => {
      // 1. Fetch current products for reference (to ensure we use real names/images)
      const { data: currentProducts } = await supabase
        .from("products")
        .select("id, name, image")

      const currentProductsMap = (currentProducts || []).reduce((acc, p) => {
        acc[p.id] = p
        return acc
      }, {} as Record<number, any>)

      // 2. Fetch all orders (excluding cancelled for revenue) WITH their order_items
      const { data: ordersData } = await supabase
        .from("orders")
        .select("id, total_price, status, order_date, order_items(product_id, quantity, price)")
        .neq("status", "cancelled")

      // 3. Fetch users count
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })

      const orders = ordersData || []

      // Calculate Revenue Metrics
      const totalRevenue = orders.reduce((sum, o) => sum + (o.total_price || 0), 0)
      const pendingOrders = orders.filter(o => o.status === "pending").length

      const now = new Date()
      const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date()
        d.setDate(now.getDate() - (6 - i))
        return d.toISOString().split("T")[0]
      })

      const dailyRevenueMap: Record<string, number> = {}
      last7Days.forEach(date => dailyRevenueMap[date] = 0)

      orders.forEach(o => {
        const date = o.order_date.split("T")[0]
        if (dailyRevenueMap[date] !== undefined) {
          dailyRevenueMap[date] += (o.total_price || 0)
        }
      })

      const dailyRevenue = last7Days.map(date => ({
        label: new Date(date).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
        value: dailyRevenueMap[date]
      }))

      // Aggregate Top Products from order_items (the source of truth)
      const productMap: Record<string, { id: number; name: string; image: string; totalSold: number; revenue: number }> = {}

      orders.forEach(o => {
        const items = Array.isArray(o.order_items) ? o.order_items : []
        items.forEach((item: any) => {
          const productId = item.product_id
          if (!productId) return

          // ONLY include if the product still exists in inventory
          const currentItem = currentProductsMap[productId]
          if (!currentItem) return

          const key = productId.toString()
          if (!productMap[key]) {
            productMap[key] = {
              id: productId,
              name: currentItem.name,
              image: currentItem.image || "",
              totalSold: 0,
              revenue: 0
            }
          }
          // Aggregate real quantities and revenue
          const qty = Number(item.quantity) || 0
          const price = Number(item.price) || 0
          productMap[key].totalSold += qty
          productMap[key].revenue += (price * qty)
        })
      })

      const topProducts = Object.values(productMap)
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 5)

      // Trends
      const last7Start = new Date(now); last7Start.setDate(now.getDate() - 7)
      const last14Start = new Date(now); last14Start.setDate(now.getDate() - 14)

      const last7Revenue = orders
        .filter(o => new Date(o.order_date) >= last7Start)
        .reduce((sum, o) => sum + (o.total_price || 0), 0)

      const last7Orders = orders.filter(o => new Date(o.order_date) >= last7Start).length
      const prev7Orders = orders.filter(o => {
        const d = new Date(o.order_date)
        return d >= last14Start && d < last7Start
      }).length

      const ordersTrend = prev7Orders > 0 ? (((last7Orders - prev7Orders) / prev7Orders) * 100) : 0

      return {
        totalProducts: (currentProducts || []).length,
        totalOrders: orders.length,
        pendingOrders,
        totalRevenue,
        customersCount: usersCount || 0,
        totalRevenueLast30Days: last7Revenue,
        ordersTrend,
        dailyRevenue,
        topProducts
      }
    }
  })
}

export function useAdminRecentOrders(limit = 8) {
  return useQuery({
    queryKey: ADMIN_KEYS.orders({ recent: limit }),
    queryFn: async () => {
      const { data: orders } = await supabase
        .from("orders")
        .select("id, user_id, total_price, status, order_date, delivered_at, items_snapshot")
        .order("order_date", { ascending: false })
        .limit(limit)

      if (!orders) return []

      const userIds = [...new Set(orders.map(o => o.user_id).filter(Boolean))]
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", userIds)

      const profileMap = (profiles || []).reduce((m: any, p) => ({ ...m, [p.id]: p.name }), {})

      return orders.map(o => ({
        ...o,
        customerName: profileMap[o.user_id] || "Guest",
        product: o.items_snapshot?.[0]?.name || "Multiple Items"
      }))
    }
  })
}

export function useAdminOrders(page: number, pageSize: number, statusFilter: string) {
  return useQuery({
    queryKey: ADMIN_KEYS.orders({ page, pageSize, statusFilter }),
    queryFn: async () => {
      let query = supabase
        .from("orders")
        .select("*, order_items(id, product_id, price, quantity, color), payments(details)", { count: "exact" })
        .order("order_date", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)

      if (statusFilter !== "all") query = query.eq("status", statusFilter)

      const { data, count, error } = await query

      if (error) {
        throw error
      }

      // 🛰 Ensure order_items is always populated with display data from snapshot
      // and extract shipping info from payment details or order snapshot
      const mapped = (data || []).map((o: any) => {
        const snapshot = o.items_snapshot as any;
        const paymentDetails = o.payments?.[0]?.details || {};

        // Favor snapshot inside payment details as it's the checkout-time final state
        const shippingInfo = paymentDetails.snapshot || (Array.isArray(snapshot) ? {} : snapshot) || {};
        const itemsList = Array.isArray(snapshot) ? snapshot : (snapshot?.items || []);

        return {
          ...o,
          shipping_method: shippingInfo.shipping_method || "Standard",
          shipping_amount: shippingInfo.shipping_cost || 0,
          shipping_address: o.shipping_address || paymentDetails.shippingAddress || shippingInfo.shipping_address || o.shipping_address,
          payment_status: o.payments?.[0]?.status || "pending",
          transaction_id: o.payments?.[0]?.transaction_id || null,
          order_items: itemsList.length > 0
            ? itemsList.map((item: any, i: number) => ({
              id: item.variant_id || item.id || i,
              product_id: item.id || 0,
              price: item.price || 0,
              quantity: item.quantity || 1,
              color: item.color || "-",
              product_name: item.name || "Product",
              product_image: item.image || null
            }))
            : (o.order_items || [])
        };
      })

      return { data: mapped, count: count || 0 }
    }
  })
}

export function useAdminUsers(page: number, pageSize: number, roleFilter: string) {
  return useQuery({
    queryKey: ADMIN_KEYS.users({ page, pageSize, roleFilter }),
    queryFn: async () => {
      let query = supabase.from("profiles").select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)

      if (roleFilter !== "all") {
        if (roleFilter === "customer") query = query.or("role.eq.customer,role.eq.user,role.is.null")
        else query = query.eq("role", roleFilter)
      }

      const { data: profiles, count } = await query
      if (!profiles) return { data: [], count: 0 }

      const userIds = profiles.map(p => p.id)
      const { data: orderStats } = await supabase
        .from("orders")
        .select("user_id, total_price")
        .in("user_id", userIds)

      const statsMap: Record<string, { count: number; total: number }> = {};
      (orderStats || []).forEach((o: any) => {
        if (!statsMap[o.user_id]) statsMap[o.user_id] = { count: 0, total: 0 }
        statsMap[o.user_id].count++
        statsMap[o.user_id].total += o.total_price || 0
      })

      const mapped = profiles.map(p => ({
        ...p,
        total_orders: statsMap[p.id]?.count || 0,
        total_spent: statsMap[p.id]?.total || 0
      }))

      return { data: mapped, count: count || 0 }
    }
  })
}

export function useAdminProducts() {
  return useQuery({
    queryKey: ADMIN_KEYS.products,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_variant(*)")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    }
  })
}

export function useAdminPayments() {
  return useQuery({
    queryKey: ADMIN_KEYS.payments,
    queryFn: async () => {
      // 1. Fetch payments with order details
      const { data, error } = await supabase
        .from("payments")
        .select("*, orders(user_id, order_date, shipping_address)")
        .order("created_at", { ascending: false })

      if (error) throw error
      if (!data) return []

      // 2. Fetch customer names from profiles
      const userIds = [...new Set(data.map(p => p.orders?.user_id || p.user_id).filter(Boolean))]
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, email")
        .in("id", userIds)

      const profileMap = (profiles || []).reduce((m: any, p) => ({ ...m, [p.id]: p }), {})

      // 3. Map everything together
      return data.map(p => ({
        ...p,
        customerName: profileMap[p.orders?.user_id || p.user_id]?.name || "Guest",
        customerEmail: profileMap[p.orders?.user_id || p.user_id]?.email || "",
        // Prefer order_date from orders table if available, fallback to payment's created_at
        displayDate: p.orders?.order_date || p.created_at,
        shipping_address: p.orders?.shipping_address || p.details?.shippingAddress || null
      }))
    }
  })
}

export function useAdminReviews(page: number, pageSize: number, status: string = "all") {
  return useQuery({
    queryKey: ADMIN_KEYS.reviews({ page, status }),
    queryFn: async () => {
      const response = await fetch(`/api/admin/reviews?page=${page}&pageSize=${pageSize}&status=${status}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to fetch reviews")
      }
      return await response.json()
    }
  })
}

export function useAdminCoupons() {
  return useQuery({
    queryKey: ADMIN_KEYS.coupons,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) throw error
      return data || []
    }
  })
}

export function useAdminRefunds(page: number, pageSize: number, statusFilter: string) {
  return useQuery({
    queryKey: ADMIN_KEYS.refunds({ page, pageSize, statusFilter }),
    queryFn: async () => {
      let query = supabase
        .from("orders")
        .select("*", { count: "exact" })

      if (statusFilter === "all") {
        // Show all orders that have any refund activity (either refund_status set or status IS 'refunded')
        query = query.or("refund_status.not.is.null,status.eq.refunded")
      } else if (statusFilter === "processed") {
        // 'Processed' includes both the new 'processed' refund_status and the legacy 'refunded' status
        query = query.or("refund_status.eq.processed,status.eq.refunded")
      } else {
        // Show orders with specific refund status (pending, rejected)
        query = query.eq("refund_status", statusFilter)
      }

      query = query
        .order("order_date", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)

      const { data, error, count } = await query
      if (error) throw error
      return { data: data as any[], count: count || 0 }
    }
  })
}

export function useAdminActionRequiredOrders() {
  return useQuery({
    queryKey: ADMIN_KEYS.orders({ actionRequired: true }),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, status, order_date, delivered_at, total_price, shipping_address, items_snapshot")
        .in("status", ["confirmed", "processing", "shipped"])
        .order("order_date", { ascending: false }) // Newest first for fulfillment dashboard
        .limit(20)

      if (error) throw error
      return data || []
    }
  })
}

export function useAdminRefundedOrders() {
  return useQuery({
    queryKey: ADMIN_KEYS.orders({ refundedOnly: true }),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, status, order_date, delivered_at, total_price, shipping_address, items_snapshot, refund_amount, refund_reason")
        .or("status.eq.refunded")
        .order("order_date", { ascending: false })
        .limit(30)

      if (error) throw error
      return data || []
    }
  })
}

export function useAdminShippingMethods() {
  return useQuery({
    queryKey: ADMIN_KEYS.shipping,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shipping_methods")
        .select("*")
        .order("id")
      if (error) throw error
      return data || []
    }
  })
}

export function useRefundSettings() {
  return useQuery({
    queryKey: ADMIN_KEYS.settings,
    queryFn: async () => {
      const days = await getRefundWindowDays()
      return days
    }
  })
}

export function useAdminQuestions() {
  return useQuery({
    queryKey: ADMIN_KEYS.questions,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("questions")
        .select("*, products(id, name, image)")
        .order("created_at", { ascending: false })
      if (error) throw error
      return data || []
    }
  })
}

export function useAdminBanners() {
  return useQuery({
    queryKey: ADMIN_KEYS.banners,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("position")
      if (error) throw error
      return data || []
    }
  })
}

export function useAdminBlogs() {
  return useQuery({
    queryKey: ADMIN_KEYS.blogs,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) throw error
      return data || []
    }
  })
}

// Mutations
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number, status: string }) => {
      const updatePayload: Record<string, any> = { status: status as OrderStatus }
      if (status === OrderStatus.DELIVERED) {
        updatePayload.delivered_at = new Date().toISOString()
      }
      const { error } = await supabase.from("orders").update(updatePayload).eq("id", orderId)
      if (error) throw error
      return { orderId, status }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.orders() })
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.stats })
    }
  })
}

export function useUpdateReviewStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ reviewId, status }: { reviewId: string; status: string | null }) => {
      const response = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, status })
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update review status")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.reviews() })
    }
  })
}

export function useDeleteReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await fetch(`/api/admin/reviews?id=${reviewId}`, {
        method: "DELETE"
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete review")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.reviews() })
    }
  })
}

export function useSaveCoupon() {
  return useAdminMutation({
    table: "coupons",
    queryKeyToInvalidate: ADMIN_KEYS.coupons
  })
}

export function useDeleteCoupon() {
  return useAdminDeleteMutation({
    table: "coupons",
    queryKeyToInvalidate: ADMIN_KEYS.coupons
  })
}

export function useProcessRefund() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ orderId, amount, adminNote }: { orderId: number; amount: number; adminNote: string }) => {
      const response = await fetch("/api/stripe/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, amount, admin_note: adminNote })
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Refund failed")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.refunds() })
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.stats })
    }
  })
}

export function useRejectRefund() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ orderId, adminNote }: { orderId: number; adminNote: string }) => {
      const response = await fetch("/api/admin/refund/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, admin_note: adminNote })
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Rejection failed")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.refunds() })
    }
  })
}

export function useSaveShippingMethod() {
  return useAdminMutation({
    table: "shipping_methods",
    queryKeyToInvalidate: ADMIN_KEYS.shipping
  })
}

export function useDeleteShippingMethod() {
  return useAdminDeleteMutation({
    table: "shipping_methods",
    queryKeyToInvalidate: ADMIN_KEYS.shipping
  })
}

export function useUpdateRefundSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (days: number) => {
      const response = await fetch("/api/admin/refund-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refund_window_days: days })
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update setting")
      }
      return await response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.settings })
      clearRefundWindowCache()
    }
  })
}

export function useSaveQuestionReply() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ questionId, answer }: { questionId: string; answer: string }) => {
      const { error } = await supabase
        .from("questions")
        .update({ answer: answer.trim(), updated_at: new Date().toISOString() })
        .eq("id", questionId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.questions })
    }
  })
}

export function useDeleteQuestion() {
  return useAdminDeleteMutation({
    table: "questions",
    queryKeyToInvalidate: ADMIN_KEYS.questions
  })
}



export function useSaveBlog() {
  return useAdminMutation({
    table: "blogs",
    queryKeyToInvalidate: ADMIN_KEYS.blogs
  })
}

export function useDeleteBlog() {
  return useAdminDeleteMutation({
    table: "blogs",
    queryKeyToInvalidate: ADMIN_KEYS.blogs
  })
}
