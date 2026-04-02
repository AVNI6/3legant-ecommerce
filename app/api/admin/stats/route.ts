import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { AdminDashboardStats } from "@/types/utils";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, user_id, total_price, status, created_at, order_items(product_id, quantity)")
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 }
      );
    }

    const ordersCount = orders?.length || 0;
    const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0;

    // Calculate daily revenue (last 30 days)
    const dailyRevenue = calculateDailyRevenue(orders || []);

    // Calculate weekly revenue (last 12 weeks)
    const weeklyRevenue = calculateWeeklyRevenue(orders || []);

    // Calculate monthly revenue (last 12 months)
    const monthlyRevenue = calculateMonthlyRevenue(orders || []);

    // Get top products
    const topProducts = await getTopProducts();

    // Get recent orders
    const recentOrders = (orders || []).slice(0, 10).map((order: any) => ({
      id: order.id,
      userId: order.user_id,
      totalPrice: order.total_price,
      status: order.status,
      createdAt: order.created_at,
    }));

    const stats: AdminDashboardStats = {
      totalRevenue,
      ordersCount,
      dailyRevenue,
      weeklyRevenue,
      monthlyRevenue,
      topProducts,
      recentOrders,
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (err: any) {
    console.error("Error fetching dashboard stats:", err);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}

function calculateDailyRevenue(orders: any[]): Array<{ date: string; revenue: number }> {
  const dailyMap = new Map<string, number>();
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split("T")[0];
    dailyMap.set(dateString, 0);
  }

  orders.forEach((order) => {
    const date = new Date(order.created_at).toISOString().split("T")[0];
    if (dailyMap.has(date)) {
      dailyMap.set(date, (dailyMap.get(date) || 0) + order.total_price);
    }
  });

  return Array.from(dailyMap.entries())
    .reverse()
    .map(([date, revenue]) => ({ date, revenue }));
}

function calculateWeeklyRevenue(orders: any[]): Array<{ week: string; revenue: number }> {
  const weeklyMap = new Map<string, number>();
  const today = new Date();

  for (let i = 0; i < 12; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i * 7);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekString = weekStart.toISOString().split("T")[0];
    weeklyMap.set(weekString, 0);
  }

  orders.forEach((order) => {
    const orderDate = new Date(order.created_at);
    const weekStart = new Date(orderDate);
    weekStart.setDate(orderDate.getDate() - orderDate.getDay());
    const weekString = weekStart.toISOString().split("T")[0];
    if (weeklyMap.has(weekString)) {
      weeklyMap.set(weekString, (weeklyMap.get(weekString) || 0) + order.total_price);
    }
  });

  return Array.from(weeklyMap.entries())
    .reverse()
    .map(([week, revenue]) => ({ week, revenue }));
}

function calculateMonthlyRevenue(orders: any[]): Array<{ month: string; revenue: number }> {
  const monthlyMap = new Map<string, number>();
  const today = new Date();

  for (let i = 0; i < 12; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthString = date.toISOString().substring(0, 7);
    monthlyMap.set(monthString, 0);
  }

  orders.forEach((order) => {
    const monthString = new Date(order.created_at).toISOString().substring(0, 7);
    if (monthlyMap.has(monthString)) {
      monthlyMap.set(monthString, (monthlyMap.get(monthString) || 0) + order.total_price);
    }
  });

  return Array.from(monthlyMap.entries())
    .reverse()
    .map(([month, revenue]) => ({ month, revenue }));
}

async function getTopProducts(): Promise<
  Array<{ id: number; name: string; sales: number; revenue: number }>
> {
  try {
    const { data, error } = await supabase.rpc("get_top_products", { limit: 5 });

    if (error) {
      console.warn("Error fetching top products via RPC:", error);
      return [];
    }

    return data || [];
  } catch {
    console.warn("Failed to fetch top products, returning empty array");
    return [];
  }
}
