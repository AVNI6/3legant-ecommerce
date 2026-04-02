"use client"

import { useState, useMemo, Fragment } from "react"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/constants/Data"
import { useAdminPayments } from "@/hooks/admin/use-admin-queries"
import { TableSkeleton, StatsCardSkeleton } from "@/components/ui/skeleton"
import { HiSearch, HiFilter, HiOutlineInformationCircle, HiChevronDown, HiChevronUp, HiOutlineMail } from "react-icons/hi"

export default function PaymentsPage() {
  const [filter, setFilter] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const [expandedPaymentId, setExpandedPaymentId] = useState<string | null>(null)
  const PAGE_SIZE = 15

  const { data: allPayments = [], isLoading } = useAdminPayments()

  const summary = useMemo(() => {
    return allPayments.reduce((acc, p) => {
      const amt = Number(p.amount) || 0
      if (p.status === "success") acc.paid += amt
      else if (p.status === "pending") acc.pending += amt
      else if (p.status === "failed") acc.failed += amt
      else if (p.status === "refund") acc.refunded += amt
      acc.total += amt
      return acc
    }, { total: 0, paid: 0, pending: 0, failed: 0, refunded: 0 })
  }, [allPayments])

  const filteredPayments = useMemo(() => {
    let result = allPayments
    if (filter !== "all") {
      result = result.filter(p => p.status === filter)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.payment_id.toLowerCase().includes(q) ||
        p.transaction_id?.toLowerCase().includes(q) ||
        p.order_id?.toString().includes(q) ||
        p.customerName?.toLowerCase().includes(q) ||
        p.customerEmail?.toLowerCase().includes(q)
      )
    }
    return result
  }, [allPayments, filter, search])

  const paginatedPayments = useMemo(() => {
    return filteredPayments.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  }, [filteredPayments, page])

  const totalPages = Math.ceil(filteredPayments.length / PAGE_SIZE)

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      success: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      failed: "bg-red-100 text-red-700",
      cancel: "bg-gray-100 text-gray-700",
      refund: "bg-purple-100 text-purple-700"
    }
    return colors[status] || "bg-gray-100 text-gray-700"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments & Transactions</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor your store's financial activity</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <StatsCardSkeleton key={i} />)
        ) : (
          <>
            <div className="p-4 bg-gray-900 text-white rounded-2xl shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Total volume</p>
              <p className="text-xl font-bold mt-1">{formatCurrency(summary.total)}</p>
            </div>
            <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-green-600">Successful</p>
              <p className="text-xl font-bold mt-1 text-gray-900">{formatCurrency(summary.paid)}</p>
            </div>
            <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-yellow-600">Pending</p>
              <p className="text-xl font-bold mt-1 text-gray-900">{formatCurrency(summary.pending)}</p>
            </div>
            <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">Failed</p>
              <p className="text-xl font-bold mt-1 text-gray-900">{formatCurrency(summary.failed)}</p>
            </div>
            <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Refunded</p>
              <p className="text-xl font-bold mt-1 text-gray-900">{formatCurrency(summary.refunded)}</p>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "All" },
            { key: "success", label: "Paid" },
            { key: "pending", label: "Pending" },
            { key: "failed", label: "Failed" },
            { key: "refund", label: "Refunded" }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setPage(0) }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === f.key ? "bg-gray-900 text-white shadow-md" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
            >
              {f.label.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="relative">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by ID, Order or Customer..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm w-full sm:w-64 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={10} columns={7} />
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left font-poppins">
                <thead className="bg-gray-50/50">
                  <tr>
                    {["id", "order", "customer", "method", "amount", "status", "date", ""].map(h => (
                      <th key={h} className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <p className="text-gray-400 text-sm font-medium">No transactions found</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedPayments.map(p => (
                      <Fragment key={p.payment_id}>
                        <tr className={`hover:bg-gray-50/50 transition-colors ${expandedPaymentId === p.payment_id ? "bg-blue-50/30" : ""}`}>
                          <td className="px-6 py-4">
                            <code className="text-[10px] font-bold text-gray-400 uppercase cursor-help" title={p.payment_id}>
                              {p.payment_id.slice(0, 8)}...
                            </code>
                          </td>
                          <td className="px-6 py-4">
                            <Link href={`/pages/admin/orders?id=${p.order_id}`} className="text-sm font-bold text-blue-600 hover:text-blue-700">
                              #{p.order_id}
                            </Link>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900">{p.customerName}</span>
                              <span className="text-[10px] text-gray-400 truncate max-w-[120px]">{p.customerEmail}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-medium text-gray-500 uppercase">{p.method}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-sm font-bold ${p.status === "refund" ? "text-purple-600" : "text-gray-900"}`}>
                              {p.status === "refund" ? "-" : ""}{formatCurrency(p.amount)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusColor(p.status)}`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-gray-500 font-medium">
                              {formatDate(p.displayDate)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setExpandedPaymentId(expandedPaymentId === p.payment_id ? null : p.payment_id)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
                            >
                              {expandedPaymentId === p.payment_id ? <HiChevronUp /> : <HiChevronDown />}
                            </button>
                          </td>
                        </tr>
                        {expandedPaymentId === p.payment_id && (
                          <tr>
                            <td colSpan={7} className="px-6 py-4 bg-gray-50/50">
                              <PaymentExpandedContent p={p} />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden divide-y divide-gray-50">
              {paginatedPayments.length === 0 ? (
                <div className="p-12 text-center text-gray-400 text-sm font-medium">No transactions found</div>
              ) : (
                paginatedPayments.map(p => (
                  <div key={p.payment_id} className={`p-4 transition-colors ${expandedPaymentId === p.payment_id ? "bg-blue-50/20" : "bg-white"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <code className="text-[10px] font-bold text-gray-400 uppercase">
                          {p.payment_id.slice(0, 8)}...
                        </code>
                        <span className="text-[10px] text-gray-400 font-bold">
                          {formatDate(p.displayDate)}
                        </span>
                      </div>
                      <button
                        onClick={() => setExpandedPaymentId(expandedPaymentId === p.payment_id ? null : p.payment_id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
                      >
                        {expandedPaymentId === p.payment_id ? <HiChevronUp /> : <HiChevronDown />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Link href={`/pages/admin/orders?id=${p.order_id}`} className="text-sm font-bold text-blue-600">
                          Order #{p.order_id}
                        </Link>
                        <div className="text-xs text-gray-400 mt-0.5">{p.customerName}</div>
                        <div className="text-sm font-black text-gray-900 mt-1">
                          {p.status === "refund" ? "-" : ""}{formatCurrency(p.amount)}
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusColor(p.status)}`}>
                        {p.status}
                      </span>
                    </div>

                    {expandedPaymentId === p.payment_id && (
                      <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                        <PaymentExpandedContent p={p} />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Page <span className="text-gray-900">{page + 1}</span> of <span className="text-gray-900">{totalPages || 1}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold disabled:opacity-50 hover:bg-white transition-colors"
            >
              PREV
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold disabled:opacity-50 hover:bg-white transition-colors"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PaymentExpandedContent({ p }: { p: any }) {
  return (
    <div className="grid grid-cols-1 gap-6 max-w-4xl">
      <div className="space-y-4">
        <div>
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Transaction info</h4>
          <div className="p-3 bg-white rounded-xl border border-gray-100 text-xs space-y-2">
            <div className="flex justify-between gap-4"><span className="text-gray-500 shrink-0">ID:</span> <span className="font-mono break-all text-right">{p.payment_id}</span></div>
            <div className="flex justify-between gap-4"><span className="text-gray-500 shrink-0">External reference:</span> <span className="font-mono text-gray-900 break-all text-right">{p.transaction_id || "N/A"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Currency:</span> <span className="font-bold uppercase">{p.currency}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Method:</span> <span className="font-bold uppercase">{p.method}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Date:</span> <span className="font-bold">{formatDate(p.displayDate, true)}</span></div>
          </div>
        </div>
        {p.error_message && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
            <HiOutlineInformationCircle className="text-red-500 w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-red-700 uppercase">Gateway error</p>
              <p className="text-xs text-red-600 mt-1">{p.error_message}</p>
            </div>
          </div>
        )}
      </div>
      <div className="space-y-4">
        {p.refund_reason && (
          <div>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Refund Details</h4>
            <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl">
              <p className="text-xs text-purple-700 italic">"{p.refund_reason}"</p>
            </div>
          </div>
        )}
        {p.admin_note && (
          <div>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Admin Note</h4>
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-xs text-blue-700 italic">"{p.admin_note}"</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
