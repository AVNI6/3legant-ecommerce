"use client"

import Link from "next/link"
import { useMemo } from "react"
import { formatCurrency } from "@/constants/Data"
import { useAdminStats, useAdminRecentOrders } from "@/hooks/admin/use-admin-queries"
import {
  StatsCardSkeleton,
  ChartSkeleton,
  ListSkeleton,
  TableSkeleton
} from "@/components/ui/skeleton"

type ChartData = { label: string; value: number }

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useAdminStats()
  const { data: recentOrders = [], isLoading: ordersLoading } = useAdminRecentOrders(8)

  const revenueData = useMemo(() => stats?.dailyRevenue || [], [stats])
  const maxRevenue = useMemo(() => Math.max(...revenueData.map(d => d.value), 1), [revenueData])

  const loading = statsLoading || ordersLoading

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome back, Admin</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
        ) : stats ? (
          <>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold mt-2 text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              <div className="mt-4 flex items-center text-xs font-medium text-green-600 bg-green-50 w-fit px-2 py-1 rounded-full">
                {stats.totalRevenueLast30Days > 0 ? "+" : ""}{((stats.totalRevenueLast30Days / (stats.totalRevenue || 1)) * 100).toFixed(1)}% from last 7 days
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold mt-2 text-gray-900">{stats.totalOrders}</p>
              <div className="mt-4 flex items-center text-xs font-medium text-green-600 bg-green-50 w-fit px-2 py-1 rounded-full">
                {stats.ordersTrend > 0 ? "+" : ""}{stats.ordersTrend.toFixed(1)}% trend
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <p className="text-sm font-medium text-gray-500">Pending Orders</p>
              <p className="text-2xl font-bold mt-2 text-yellow-600">{stats.pendingOrders}</p>
              <div className="mt-4 text-xs font-medium text-gray-500">Requires attention</div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <p className="text-sm font-medium text-gray-500">Active Products</p>
              <p className="text-2xl font-bold mt-2 text-blue-600">{stats.totalProducts}</p>
              <div className="mt-4 text-xs font-medium text-gray-500">In your inventory</div>
            </div>
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Revenue Performance</h3>
              <p className="text-xs text-gray-400 font-medium mt-1">Daily sales trends for the last 7 days</p>
            </div>
            <div className="px-3 py-1.5 bg-gray-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500">
              Last 7 Days
            </div>
          </div>

          {loading ? (
            <ChartSkeleton />
          ) : (
            <div className="flex-1 flex items-end justify-between gap-3 min-h-[220px] pb-2">
              {(stats?.dailyRevenue || []).map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  <div
                    className="w-full bg-gray-900 rounded-t-xl transition-all duration-500 group-hover:bg-blue-600 cursor-pointer relative"
                    style={{ height: `${Math.max((d.value / (Math.max(...(stats?.dailyRevenue.map(rv => rv.value) || [1])) || 1)) * 100, 4)}%` }}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1.5 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-20 shadow-xl pointer-events-none transform translate-y-2 group-hover:translate-y-0 font-bold border border-gray-700">
                      {formatCurrency(d.value)}
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-4 font-black uppercase tracking-tighter">{d.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-gray-900 text-lg">Top Products</h3>
            <Link href="/pages/admin/products" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors">
              View All
            </Link>
          </div>

          {loading ? (
            <ListSkeleton items={5} />
          ) : (
            <div className="space-y-5">
              {(stats?.topProducts || []).map((product, idx) => (
                <div key={idx} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 relative">
                    {product.image ? (
                      <img src={product.image} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-bold">N/A</div>
                    )}
                    <div className="absolute top-0 right-0 bg-gray-900 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-bl-lg shadow-lg">
                      {idx + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{product.name}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight mt-0.5">{product.totalSold} Units Sold</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900">{formatCurrency(product.revenue)}</p>
                    <p className="text-[9px] text-green-600 font-black uppercase tracking-tighter mt-0.5">Profit</p>
                  </div>
                </div>
              ))}

              {!(stats?.topProducts?.length) && (
                <div className="py-12 text-center">
                  <p className="text-xs text-gray-400 font-medium italic">No sales data yet</p>
                </div>
              )}

              <Link
                href="/pages/admin/orders"
                className="mt-6 flex items-center justify-center gap-2 py-4 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-black/20 hover:-translate-y-0.5 active:translate-y-0 duration-300"
              >
                Go to Order Center
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white">
          <h3 className="font-bold text-gray-900">Recent Transactions</h3>
          <Link href="/pages/admin/orders" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            See all
          </Link>
        </div>

        {loading ? (
          <TableSkeleton rows={8} columns={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  {["Order ID", "Customer", "Product", "Amount", "Status"].map(h => (
                    <th key={h} className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900">#{o.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs mr-3">
                          {o.customerName.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{o.customerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500 truncate max-w-[150px] inline-block">{o.product}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(o.total_price)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${o.status === "delivered" ? "bg-green-100 text-green-700" :
                          o.status === "cancelled" ? "bg-red-100 text-red-700" :
                            o.status === "shipped" ? "bg-blue-100 text-blue-700" :
                              "bg-yellow-100 text-yellow-700"
                        }`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {!recentOrders.length && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <p className="text-gray-400 text-sm font-medium">No recent orders found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
