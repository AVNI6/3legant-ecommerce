"use client"

import { Fragment, useState, Suspense, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { formatCurrency, formatDate } from "@/constants/Data"
import { OrderStatus } from "@/types/enums"
import { useToast } from "@/components/admin/Toast"
import { useAdminOrders, useUpdateOrderStatus, useAdminActionRequiredOrders, useAdminRefundedOrders } from "@/hooks/admin/use-admin-queries"
import { TableSkeleton } from "@/components/ui/skeleton"
import { HiChevronDown, HiChevronUp, HiSearch, HiFilter, HiArrowSmRight, HiOutlineReceiptRefund, HiOutlineClock, HiOutlineTruck, HiOutlineThumbUp, HiArrowSmDown, HiOutlineInboxIn, HiOutlineCreditCard } from "react-icons/hi"

const STATUS_OPTIONS = Object.values(OrderStatus)
const PAGE_SIZE = 10

export default function AdminOrders() {
  return (
    <Suspense fallback={<TableSkeleton rows={10} columns={7} />}>
      <AdminOrdersContent />
    </Suspense>
  )
}

function CommandCenterSkeleton() {
  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
        <div className="lg:col-span-3 p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-5 w-48 bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-3 w-32 bg-gray-50 rounded-lg animate-pulse" />
            </div>
            <div className="w-6 h-6 bg-gray-50 rounded-lg animate-pulse" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-50/40 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-1 p-8 space-y-6 bg-gray-50/20">
          <div className="space-y-2">
            <div className="h-5 w-24 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-3 w-32 bg-gray-100 rounded-lg animate-pulse" />
          </div>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function CommandCenter() {
  const { data: actionOrders, isLoading: loadingActions } = useAdminActionRequiredOrders()
  const { data: refundedOrders, isLoading: loadingRefunds } = useAdminRefundedOrders()
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatus()
  const { toast } = useToast()

  if (loadingActions || loadingRefunds) return <CommandCenterSkeleton />

  const getNextStatus = (status: string) => {
    switch (status) {
      case OrderStatus.CONFIRMED: return OrderStatus.PROCESSING
      case OrderStatus.PROCESSING: return OrderStatus.SHIPPED
      case OrderStatus.SHIPPED: return OrderStatus.DELIVERED
      default: return null
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case OrderStatus.PROCESSING: return <HiOutlineClock className="w-4 h-4" />
      case OrderStatus.SHIPPED: return <HiOutlineTruck className="w-4 h-4" />
      case OrderStatus.DELIVERED: return <HiOutlineThumbUp className="w-4 h-4" />
      default: return null
    }
  }

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">

        {/* 🚀 LEFT PANEL: OUTBOUND FULFILLMENT (3/4 Width) */}
        <div className="lg:col-span-3 p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                Outbound Fulfillment
                <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-[10px]">{actionOrders?.length || 0}</span>
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 italic tracking-tight underline decoration-blue-500/30 underline-offset-4">Primary fulfillment pipeline</p>
            </div>
            <HiOutlineTruck className="w-5 h-5 text-blue-500 opacity-20" />
          </div>

          <div className="max-h-[380px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {actionOrders && actionOrders.length > 0 ? (
              actionOrders.map((order: any) => {
                const nextStatus = getNextStatus(order.status)
                return (
                  <div key={order.id} className="group p-5 bg-gray-50/20 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-white transition-all shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-900">
                          #{order.id}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-gray-900 line-clamp-1 truncate">{order.shipping_address?.firstName} {order.shipping_address?.lastName}</p>
                          <span className="bg-gray-200/50 text-gray-600 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tight">{order.status}</span>
                        </div>
                      </div>
                      {nextStatus && (
                        <button
                          onClick={() => updateStatus({ orderId: order.id, status: nextStatus }, {
                            onSuccess: () => toast(`Order #${order.id} moved to ${nextStatus}`),
                            onError: () => toast("Transfer failed", "error")
                          })}
                          disabled={isUpdating}
                          className="flex items-center gap-2 h-9 px-3 bg-gray-900 text-white rounded-xl text-[9px] font-black uppercase tracking-tighter hover:bg-blue-600 hover:scale-105 transition-all shadow-lg whitespace-nowrap"
                        >
                          {getStatusIcon(nextStatus)}
                          {nextStatus}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-gray-200 italic">
                <HiOutlineThumbUp className="w-10 h-10 mb-2 opacity-20" />
                <p className="text-[10px] font-bold uppercase">All tasks clear</p>
              </div>
            )}
          </div>
        </div>

        {/* 📦 RIGHT PANEL: INBOUND RETURN ITEMS (1/4 Width) */}
        <div className="lg:col-span-1 p-8 space-y-6 bg-gray-50/20 shadow-inner">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
                Returns
                <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px]">{refundedOrders?.length || 0}</span>
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 italic tracking-tight">Pending collection</p>
            </div>
          </div>

          <div className="max-h-[380px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {refundedOrders && refundedOrders.length > 0 ? (
              refundedOrders.map((order: any) => (
                <div key={`return-${order.id}`} className="group p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-red-200 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight mb-1 truncate">#{order.id}</p>
                      <h4 className="text-[11px] font-bold text-gray-900 truncate leading-tight">{order.shipping_address?.firstName} {order.shipping_address?.lastName}</h4>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {(() => {
                      const snapshot = order.items_snapshot as any;
                      const items = Array.isArray(snapshot) ? snapshot : (snapshot?.items || []);
                      return items.map((item: any, idx: number) => (
                        <div key={`ret-item-${order.id}-${idx}`} className="flex items-center justify-between gap-2 p-1.5 bg-gray-50 rounded-lg">
                          <p className="text-[9px] font-bold text-gray-800 truncate flex-1">{item.name}</p>
                          <span className="text-[8px] font-black text-gray-400">{item.quantity}×</span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              ))
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-gray-200 italic">
                <HiOutlineInboxIn className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-[10px] font-bold uppercase">No returns</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

function AdminOrdersContent() {
  const { toast } = useToast()
  const searchParams = useSearchParams()

  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [search, setSearch] = useState("")

  const { data, isLoading } = useAdminOrders(page, PAGE_SIZE, statusFilter)
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatus()

  const orders = data?.data || []
  const totalCount = data?.count || 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const handleUpdateStatus = (orderId: number, newStatus: string) => {
    updateStatus(
      { orderId, status: newStatus },
      {
        onSuccess: () => toast("Status updated successfully"),
        onError: () => toast("Failed to update status", "error")
      }
    )
  }

  const filteredOrders = useMemo(() => {
    if (!search) return orders
    return orders.filter(o =>
      o.id.toString().includes(search) ||
      o.shipping_address?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      o.shipping_address?.lastName?.toLowerCase().includes(search.toLowerCase())
    )
  }, [orders, search])

  const getRefundStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-blue-100 text-blue-700",
      rejected: "bg-red-100 text-red-700",
      processed: "bg-green-100 text-green-700",
    }
    return colors[status] || "bg-gray-100 text-gray-700"
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Orders Center</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Direct management and smart fulfillment dashboard</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative group">
              <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by ID or Name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm w-full sm:w-80 shadow-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            <div className="relative group">
              <HiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setPage(0) }}
                className="pl-12 pr-10 py-3 bg-white border border-gray-100 rounded-2xl text-sm appearance-none shadow-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all cursor-pointer font-bold uppercase tracking-wider"
              >
                <option value="all">ALL FILTERS</option>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
              </select>
              <HiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-900 w-5 h-5 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <CommandCenter />

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={10} columns={7} />
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 font-medium">No orders found matching your criteria</p>
          </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50">
                  <tr>
                    {["Order", "Date", "Customer", "Total", "Status", "Details"].map(h => (
                      <th key={h} className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredOrders.map(order => (
                    <Fragment key={order.id}>
                      <tr className={`hover:bg-gray-50/50 transition-colors ${expandedId === order.id ? "bg-blue-50/30" : ""}`}>
                        <td className="px-6 py-4 font-bold text-gray-900">#{order.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(order.order_date)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{order.shipping_address?.firstName} {order.shipping_address?.lastName}</div>
                          <div className="text-xs text-gray-500">{order.shipping_address?.city}</div>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(order.total_price)}</td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={e => handleUpdateStatus(order.id, e.target.value)}
                            disabled={isUpdating}
                            className={`text-xs font-bold px-3 py-1.5 rounded-full appearance-none border-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer ${order.status === OrderStatus.DELIVERED ? "bg-green-100 text-green-700" :
                              order.status === OrderStatus.CANCELLED ? "bg-red-100 text-red-700" :
                                order.status === OrderStatus.SHIPPED ? "bg-blue-100 text-blue-700" :
                                  "bg-yellow-100 text-yellow-700"
                              }`}
                          >
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
                          >
                            {expandedId === order.id ? <HiChevronUp /> : <HiChevronDown />}
                          </button>
                        </td>
                      </tr>
                      {expandedId === order.id && (
                        <tr>
                          <td colSpan={6} className="px-6 py-6 bg-gray-50/50">
                            <OrderExpandedContent order={order} getRefundStatusColor={getRefundStatusColor} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden divide-y divide-gray-50">
              {filteredOrders.map(order => (
                <div key={order.id} className={`p-4 transition-colors ${expandedId === order.id ? "bg-blue-50/20" : "bg-white"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900">#{order.id}</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                        {formatDate(order.order_date)}
                      </span>
                    </div>
                    <button
                      onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                    >
                      {expandedId === order.id ? <HiChevronUp /> : <HiChevronDown />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-gray-900">{order.shipping_address?.firstName} {order.shipping_address?.lastName}</div>
                      <div className="text-sm font-black text-gray-900 mt-0.5">{formatCurrency(order.total_price)}</div>
                    </div>
                    <select
                      value={order.status}
                      onChange={e => handleUpdateStatus(order.id, e.target.value)}
                      disabled={isUpdating}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer ${order.status === OrderStatus.DELIVERED ? "bg-green-100 text-green-700" :
                        order.status === OrderStatus.CANCELLED ? "bg-red-100 text-red-700" :
                          order.status === OrderStatus.SHIPPED ? "bg-blue-100 text-blue-700" :
                            "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {expandedId === order.id && (
                    <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                      <OrderExpandedContent order={order} getRefundStatusColor={getRefundStatusColor} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )
        }
        <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 font-medium">
            Showing <span className="text-gray-900 font-bold">{page * PAGE_SIZE + 1}</span> to <span className="text-gray-900 font-bold">{Math.min((page + 1) * PAGE_SIZE, totalCount)}</span> of <span className="text-gray-900 font-bold">{totalCount}</span> orders
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-white transition-colors"
            >
              Prev
            </button>
            <div className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900">
              {page + 1} / {totalPages || 1}
            </div>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-white transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function OrderExpandedContent({ order, getRefundStatusColor }: { order: any, getRefundStatusColor: (s: string) => string }) {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Items Summary</h4>
          <div className="space-y-3">
            {order.order_items.map((item: any) => (
              <div key={item.id} className="flex items-center gap-4 p-3 bg-white rounded-xl border border-gray-100">
                {item.product_image ? (
                  <img src={item.product_image} alt="" className="w-12 h-12 object-cover rounded-lg" />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">No img</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{item.product_name || `Product #${item.product_id}`}</p>
                  <p className="text-xs text-gray-500 prose-sm">Qty: {item.quantity} • {item.color}</p>
                </div>
                <div className="text-sm font-bold text-gray-900">
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Shipping Address</h4>
            <div className="p-4 bg-white rounded-xl border border-gray-100 text-sm text-gray-600 leading-relaxed">
              <p className="font-bold text-gray-900 mb-1">{order.shipping_address?.firstName} {order.shipping_address?.lastName}</p>
              <p>{order.shipping_address?.street}</p>
              <p>{order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zip}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 border-t border-gray-100 pt-6 mt-6">
            <div>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Shipment</h4>
              <p className="text-sm font-bold text-gray-900 uppercase flex items-center gap-2">
                <HiOutlineTruck className="w-4 h-4 text-gray-400" />
                {order.shipping_method || "Standard"}
              </p>
              <p className="text-xs text-gray-400 font-medium">{formatCurrency(order.shipping_amount || 0)} delivery fee</p>
            </div>
            
            <div>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Payment</h4>
              <p className="text-sm font-bold text-gray-900 uppercase flex items-center gap-2">
                <HiOutlineCreditCard className="w-4 h-4 text-gray-400" />
                {order.payment_method}
              </p>
              <p className="text-xs text-gray-400 font-medium capitalize">{order.status} payment</p>
            </div>

            {order.refund_status && (
              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Refund Status</h4>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter ${getRefundStatusColor(order.refund_status)}`}>
                    {order.refund_status}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
