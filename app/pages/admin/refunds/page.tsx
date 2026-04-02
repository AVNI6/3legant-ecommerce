"use client"

import { useState, Fragment } from "react"
import { formatCurrency } from "@/constants/Data"
import { useToast } from "@/components/admin/Toast"
import ConfirmModal from "@/components/admin/ConfirmModal"
import Link from "next/link"
import { useAdminRefunds, useProcessRefund, useRejectRefund } from "@/hooks/admin/use-admin-queries"
import { TableSkeleton } from "@/components/ui/skeleton"
import { HiOutlineRefresh, HiCheckCircle, HiXCircle, HiChevronLeft, HiChevronRight, HiOutlineInformationCircle, HiChevronDown, HiChevronUp } from "react-icons/hi"

const PAGE_SIZE = 10

export default function RefundsPage() {
  const { toast } = useToast()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [page, setPage] = useState(0)
  
  const [approvingOrder, setApprovingOrder] = useState<any | null>(null)
  const [rejectingOrder, setRejectingOrder] = useState<any | null>(null)
  const [adminNote, setAdminNote] = useState("")
  const [refundAmount, setRefundAmount] = useState<number>(0)
  const [expandedId, setExpandedId] = useState<number | string | null>(null)

  const { data, isLoading, refetch } = useAdminRefunds(page, PAGE_SIZE, statusFilter)
  const { mutate: processRefund, isPending: isProcessing } = useProcessRefund()
  const { mutate: rejectRefund, isPending: isRejecting } = useRejectRefund()

  const orders = data?.data || []
  const totalCount = data?.count || 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const handleApprove = () => {
    if (!approvingOrder) return
    processRefund({ orderId: approvingOrder.id, amount: refundAmount, adminNote }, {
      onSuccess: () => {
        toast("Refund processed successfully")
        setApprovingOrder(null)
        refetch()
      },
      onError: (err: any) => toast(err.message, "error")
    })
  }

  const handleReject = () => {
    if (!rejectingOrder) return
    rejectRefund({ orderId: rejectingOrder.id, adminNote }, {
      onSuccess: () => {
        toast("Refund request rejected")
        setRejectingOrder(null)
        refetch()
      },
      onError: (err: any) => toast(err.message, "error")
    })
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-blue-100 text-blue-700",
      rejected: "bg-red-100 text-red-700",
      processed: "bg-green-100 text-green-700",
    }
    return colors[status] || "bg-gray-100 text-gray-700"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Refund Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and process customer refund claims</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm self-start overflow-x-auto whitespace-nowrap max-w-full">
          {["all", "pending", "processed", "rejected"].map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(0) }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                statusFilter === s ? "bg-gray-900 text-white shadow-md" : "text-gray-400 hover:text-gray-900"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={8} columns={7} />
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left font-poppins text-sm">
                <thead className="bg-gray-50/50">
                  <tr>
                    {["Order", "Customer", "Amount", "Reason", "Date", "Status", ""].map(h => (
                      <th key={h} className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic">No refund requests found</td>
                    </tr>
                  ) : (
                    orders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4 font-bold">
                          <Link href={`/pages/admin/orders?id=${order.id}`} className="text-blue-600 hover:text-blue-800 transition-colors">
                            #{order.id}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">{order.shipping_address?.firstName} {order.shipping_address?.lastName}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{order.shipping_address?.email || "No Email"}</p>
                        </td>
                        <td className="px-6 py-4 font-black text-gray-900">
                          {formatCurrency(order.refund_amount || order.total_price)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-[180px] break-words text-xs text-gray-500 italic flex items-start gap-1">
                            <HiOutlineInformationCircle className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{order.refund_reason || "No reason provided"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 font-medium">
                          {new Date(order.order_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <RefundStatusBadge status={order.refund_status || ""} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <RefundActions 
                            order={order} 
                            setApprovingOrder={setApprovingOrder} 
                            setRejectingOrder={setRejectingOrder} 
                            setRefundAmount={setRefundAmount} 
                            setAdminNote={setAdminNote} 
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden divide-y divide-gray-50">
              {orders.length === 0 ? (
                <div className="p-12 text-center text-gray-400 italic font-medium">No refund requests found</div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className={`p-4 transition-colors ${expandedId === order.id ? "bg-blue-50/20" : "bg-white"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/pages/admin/orders?id=${order.id}`} className="text-sm font-black text-blue-600">
                          #{order.id}
                        </Link>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">
                          {new Date(order.order_date).toLocaleDateString()}
                        </span>
                      </div>
                      <button 
                        onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
                      >
                        {expandedId === order.id ? <HiChevronUp /> : <HiChevronDown />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm text-gray-900">{order.shipping_address?.firstName} {order.shipping_address?.lastName}</p>
                        <p className="text-lg font-black text-gray-900 mt-1">
                          {formatCurrency(order.refund_amount || order.total_price)}
                        </p>
                      </div>
                      <RefundStatusBadge status={order.refund_status || ""} />
                    </div>

                    {expandedId === order.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-4">
                           <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 italic">
                             <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">
                               <HiOutlineInformationCircle className="w-4 h-4" /> Refund Reason
                             </div>
                             <p className="text-sm text-gray-600 leading-relaxed">"{order.refund_reason || "No reason provided"}"</p>
                           </div>

                           <div className="flex justify-end gap-2 bg-white/50 p-2 rounded-xl">
                              <RefundActions 
                                order={order} 
                                setApprovingOrder={setApprovingOrder} 
                                setRejectingOrder={setRejectingOrder} 
                                setRefundAmount={setRefundAmount} 
                                setAdminNote={setAdminNote} 
                                showLabel
                              />
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-none">
              Showing <span className="text-gray-900">{page * PAGE_SIZE + 1}</span>-
              <span className="text-gray-900">{Math.min((page + 1) * PAGE_SIZE, totalCount)}</span> of 
              <span className="text-gray-900 ml-1">{totalCount}</span> claims
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setPage(p => Math.max(0, p - 1)); setExpandedId(null) }}
                disabled={page === 0}
                className="p-2 border border-gray-200 rounded-xl hover:bg-white disabled:opacity-30 transition-all text-gray-600"
              >
                <HiChevronLeft className="w-5 h-5" />
              </button>
              <div className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black text-gray-900">
                {page + 1} / {totalPages}
              </div>
              <button
                onClick={() => { setPage(p => p + 1); setExpandedId(null) }}
                disabled={page >= totalPages - 1}
                className="p-2 border border-gray-200 rounded-xl hover:bg-white disabled:opacity-30 transition-all text-gray-600"
              >
                <HiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {approvingOrder && (
        <ConfirmModal
          title={`Process Refund`}
          message={
            <div className="space-y-5 text-left pt-2 text-poppins">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
                <HiOutlineRefresh className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed font-medium">This will issue a partial or full refund via <span className="font-bold">Stripe</span>. This action is irreversible.</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block ml-1 leading-none">Refund Amount ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">$</span>
                    <input 
                      type="number" 
                      step="0.01"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-7 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      max={approvingOrder.total_price}
                    />
                  </div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight mt-1.5 ml-1 leading-none">Max Limit: <span className="text-gray-900 font-black">{formatCurrency(approvingOrder.total_price)}</span></p>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block ml-1 leading-none">Internal Note</label>
                  <textarea 
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-medium h-24 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none placeholder:text-gray-300"
                    placeholder="Reason for approval or internal tracking notes..."
                  />
                </div>
              </div>
            </div>
          }
          onConfirm={handleApprove}
          onCancel={() => setApprovingOrder(null)}
          loading={isProcessing}
          confirmText="ISSUE REFUND"
        />
      )}

      {rejectingOrder && (
        <ConfirmModal
          title={`Reject Refund Claim`}
          message={
            <div className="space-y-5 text-left pt-2 text-poppins">
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3">
                <HiXCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <p className="text-xs text-red-700 leading-relaxed font-medium">The customer will be notified that their refund request has been declined. Please provide a clear reason.</p>
              </div>
              
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block ml-1 leading-none">Rejection Reason</label>
                <textarea 
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-medium h-32 focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none placeholder:text-gray-300"
                  placeholder="Explain why the refund claim is being rejected..."
                />
              </div>
            </div>
          }
          onConfirm={handleReject}
          onCancel={() => setRejectingOrder(null)}
          loading={isRejecting}
          confirmText="REJECT CLAIM"
        />
      )}
    </div>
  )
}

function RefundStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-blue-100 text-blue-700",
    rejected: "bg-red-100 text-red-700",
    processed: "bg-green-100 text-green-700",
  }
  const color = colors[status] || "bg-gray-100 text-gray-700"
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest ${color}`}>
        {status}
    </span>
  )
}

function RefundActions({ order, setApprovingOrder, setRejectingOrder, setRefundAmount, setAdminNote, showLabel = false }: any) {
  if (order.refund_status !== "pending") {
    return (
        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none bg-gray-100 px-3 py-2 rounded-lg">
            COMPLETED
        </span>
    )
  }

  return (
    <div className="flex items-center gap-2">
        <button 
            onClick={() => {
                setApprovingOrder(order); 
                setRefundAmount(order.refund_amount || order.total_price);
                setAdminNote("");
            }}
            className={`px-3 py-1.5 bg-gray-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-sm ${showLabel ? 'flex-1' : ''}`}
        >
            {showLabel ? "Process Refund" : "PROCESS"}
        </button>
        <button 
            onClick={() => { setRejectingOrder(order); setAdminNote("") }}
            className={`px-3 py-1.5 bg-white border border-gray-200 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:border-red-200 hover:text-red-600 transition-all ${showLabel ? 'flex-1' : ''}`}
        >
            {showLabel ? "Reject Claim" : "REJECT"}
        </button>
    </div>
  )
}
