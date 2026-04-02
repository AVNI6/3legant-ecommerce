"use client"

import { useState } from "react"
import { useToast } from "@/components/admin/Toast"
import { useAdminReviews, useUpdateReviewStatus, useDeleteReview } from "@/hooks/admin/use-admin-queries"
import { TableSkeleton } from "@/components/ui/skeleton"
import { HiStar, HiOutlineTrash, HiOutlineExclamationCircle, HiChevronLeft, HiChevronRight, HiCheckCircle, HiChevronDown, HiChevronUp } from "react-icons/hi"

export default function ReviewsManagement() {
  const { toast } = useToast()
  const [filter, setFilter] = useState<string>("all")
  const [page, setPage] = useState(0)
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; id: string | null }>({ show: false, id: null })
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const PAGE_SIZE = 10

  const { data, isLoading, refetch } = useAdminReviews(page, PAGE_SIZE, filter)
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateReviewStatus()
  const { mutate: deleteReview, isPending: isDeleting } = useDeleteReview()

  const reviews = data?.data || []
  const totalCount = data?.count || 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const handleUpdateStatus = (id: string, status: string | null) => {
    updateStatus({ reviewId: id, status }, {
      onSuccess: () => {
        toast(`Review marked as ${status}`)
        refetch()
      },
      onError: () => toast("Failed to update status", "error")
    })
  }

  const handleDelete = () => {
    if (!deleteModal.id) return
    deleteReview(deleteModal.id, {
      onSuccess: () => {
        toast("Review deleted permanently")
        setDeleteModal({ show: false, id: null })
        refetch()
      },
      onError: () => toast("Failed to delete review", "error")
    })
  }

  const getStatusColor = (status?: string) => {
    if (status === "spam") return "bg-red-100 text-red-700"
    return "bg-blue-100 text-blue-700"
  }

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <HiStar key={n} className={`w-3 h-3 md:w-3.5 md:h-3.5 ${n <= rating ? "text-yellow-400" : "text-gray-200"}`} />
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">Manage product ratings and feedback ({totalCount})</p>
        </div>

        <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm self-start">
          {["all", "spam"].map(s => (
            <button
              key={s}
              onClick={() => { setFilter(s); setPage(0); setExpandedId(null) }}
              className={`px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-black transition-all uppercase tracking-widest ${filter === s ? "bg-gray-900 text-white shadow-md" : "text-gray-400 hover:text-gray-900"
                }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <TableSkeleton rows={5} columns={1} />
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-dashed border-gray-100 p-20 text-center">
            <HiOutlineExclamationCircle className="w-12 h-12 text-gray-100 mx-auto mb-3" />
            <p className="text-gray-400 font-bold italic">No reviews found in this category</p>
          </div>
        ) : (
          reviews.map(r => (
            <div key={r.id} className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 p-4 md:p-6 ${expandedId === r.id ? "border-black/10 shadow-xl shadow-gray-100 -translate-y-0.5" : "border-gray-50 hover:border-gray-100"}`}>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="flex items-center justify-between w-full sm:w-auto">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-50 shadow-sm">
                    {r.products?.image ? (
                      <img src={r.products.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-300">N/A</div>
                    )}
                  </div>
                  <button
                    onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                    className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
                  >
                    {expandedId === r.id ? <HiChevronUp /> : <HiChevronDown />}
                  </button>
                </div>

                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <p className="text-sm font-black text-gray-900 uppercase tracking-tight truncate max-w-[200px] md:max-w-md">{r.products?.name || `Product #${r.product_id}`}</p>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg tracking-widest ${getStatusColor(r.status)}`}>
                      {r.status || "new"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    {renderStars(r.rating)}
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">by <span className="text-gray-900">{r.name || "Anonymous"}</span> • {new Date(r.created_at).toLocaleDateString()}</span>
                  </div>

                  {r.comment && (
                    <div className={`transition-all duration-300 overflow-hidden ${expandedId === r.id ? "max-h-[500px] opacity-100 mt-2" : "max-h-0 sm:max-h-[500px] opacity-0 sm:opacity-100"}`}>
                      <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-50 italic text-sm text-gray-700 leading-relaxed relative mt-2">
                        <span className="absolute -top-3 left-3 text-3xl font-serif text-gray-100 leading-none">“</span>
                        {r.comment}
                      </div>
                    </div>
                  )}

                  <div className={`mt-4 pt-4 border-t border-gray-50 flex flex-wrap gap-2 transition-all duration-300 ${expandedId === r.id ? "opacity-100 translate-y-0" : "opacity-0 sm:opacity-100 translate-y-2 sm:translate-y-0 hidden sm:flex"}`}>
                    <button
                      onClick={() => handleUpdateStatus(r.id, r.status === "spam" ? null : "spam")}
                      disabled={isUpdating}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-transparent shadow-sm ${
                        r.status === "spam" 
                          ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100" 
                          : "bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-700"
                      }`}
                    >
                      <HiOutlineExclamationCircle className="w-4 h-4" />
                      {r.status === "spam" ? "RESTORE TO LIST" : "MARK AS SPAM"}
                    </button>

                    <button
                      onClick={() => setDeleteModal({ show: true, id: r.id })}
                      disabled={isDeleting}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-transparent shadow-sm"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                      DELETE
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {totalPages > 1 && (
          <div className="flex justify-between items-center bg-white p-4 rounded-[28px] border border-gray-100 shadow-sm mt-8">
            <button
              onClick={() => { setPage(p => Math.max(0, p - 1)); setExpandedId(null) }}
              disabled={page === 0}
              className="p-3 border border-gray-100 rounded-2xl hover:bg-gray-50 disabled:opacity-30 transition-all text-gray-600"
            >
              <HiChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-[10px] font-black text-gray-300 tracking-[0.2em] uppercase">Page {page + 1} of {totalPages}</span>
            <button
              onClick={() => { setPage(p => p + 1); setExpandedId(null) }}
              disabled={page >= totalPages - 1}
              className="p-3 border border-gray-100 rounded-2xl hover:bg-gray-50 disabled:opacity-30 transition-all text-gray-600"
            >
              <HiChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl relative overflow-hidden text-poppins">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>
            <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center mb-6">
              <HiOutlineTrash className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Delete Review?</h3>
            <p className="text-gray-500 mb-10 text-xs font-medium leading-relaxed italic">This feedback will be permanently removed from the catalog. It cannot be recovered.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteModal({ show: false, id: null })}
                className="flex-1 px-6 py-4 border border-gray-100 rounded-2xl text-[10px] font-black text-gray-400 hover:bg-gray-50 transition-all uppercase tracking-widest"
              >
                CANCEL
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black hover:bg-red-700 shadow-xl shadow-red-100 transition-all disabled:opacity-50 uppercase tracking-widest"
              >
                {isDeleting ? "..." : "DELETE"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
