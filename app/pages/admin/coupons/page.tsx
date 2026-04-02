"use client"

import { useMemo, useState } from "react"
import { useToast } from "@/components/admin/Toast"
import ConfirmModal from "@/components/admin/ConfirmModal"
import { useAdminCoupons, useSaveCoupon, useDeleteCoupon } from "@/hooks/admin/use-admin-queries"
import { TableSkeleton } from "@/components/ui/skeleton"
import { HiPlus, HiSearch, HiOutlineTicket, HiOutlineTrash, HiOutlinePencilAlt, HiOutlineClock, HiCheckCircle, HiXCircle, HiChevronDown, HiChevronUp } from "react-icons/hi"

type Coupon = {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order: number
  expires_at: string | null
  usage_limit: number | null
  usage_count: number
  active: boolean
}

const emptyForm = {
  code: "",
  discount_type: "percentage" as "percentage" | "fixed",
  discount_value: "",
  min_order: "",
  expires_at: "",
  usage_limit: "",
  active: true
}

export default function CouponManagement() {
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [form, setForm] = useState<any>(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data: coupons = [], isLoading } = useAdminCoupons()
  const { mutate: saveCoupon, isPending: isSaving } = useSaveCoupon()
  const { mutate: deleteCoupon, isPending: isDeleting } = useDeleteCoupon()

  const filteredCoupons = useMemo(() => {
    if (!search) return coupons
    return coupons.filter(c => c.code.toLowerCase().includes(search.toLowerCase()))
  }, [search, coupons])

  const openAdd = () => {
    setEditingCoupon(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setForm({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order: coupon.min_order ?? 0,
      expires_at: coupon.expires_at?.split("T")[0] || "",
      usage_limit: coupon.usage_limit ?? "",
      active: coupon.active
    })
    setShowModal(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      code: form.code,
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value) || 0,
      min_order: parseFloat(form.min_order) || 0,
      usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
      expires_at: form.expires_at || null,
      active: form.active
    }

    saveCoupon({ id: editingCoupon?.id, payload }, {
      onSuccess: () => {
        toast(`Coupon ${editingCoupon ? "updated" : "created"} successfully`)
        setShowModal(false)
      },
      onError: (err: any) => toast(err.message || "Failed to save coupon", "error")
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteCoupon(deleteTarget.id, {
      onSuccess: () => {
        toast("Coupon deleted")
        setDeleteTarget(null)
      },
      onError: (err: any) => toast(err.message || "Delete failed", "error")
    })
  }

  const isExpired = (coupon: Coupon) => {
    if (!coupon.expires_at) return false
    return new Date() > new Date(coupon.expires_at)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discount Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">{filteredCoupons.length} promotional offers active</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-black transition-all shadow-md active:scale-95"
        >
          <HiPlus className="w-5 h-5" />
          <span>CREATE COUPON</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:w-80">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            placeholder="Search by coupon code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left font-poppins text-sm">
                <thead className="bg-gray-50/50">
                  <tr>
                    {["Coupon Code", "Value", "Min. Order", "Usage", "Status", ""].map(h => (
                      <th key={h} className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredCoupons.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">No coupons found</td>
                    </tr>
                  ) : (
                    filteredCoupons.map((coupon) => (
                      <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                              <HiOutlineTicket className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-gray-900 tracking-wider uppercase">{coupon.code}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-black text-gray-900">
                            {coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : `$${coupon.discount_value}`}
                          </span>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5">{coupon.discount_type}</p>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-600">${coupon.min_order || 0}</td>
                        <td className="px-6 py-4">
                          <UsageTracker coupon={coupon} />
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge coupon={coupon} expired={isExpired(coupon)} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <CouponActions coupon={coupon} openEdit={openEdit} setDeleteTarget={setDeleteTarget} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden divide-y divide-gray-50">
              {filteredCoupons.length === 0 ? (
                <div className="p-12 text-center text-gray-400 italic">No coupons found</div>
              ) : (
                filteredCoupons.map((coupon) => (
                  <div key={coupon.id} className={`p-4 transition-colors ${expandedId === coupon.id ? "bg-blue-50/20" : "bg-white"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                          <HiOutlineTicket className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-gray-900 tracking-wider uppercase">{coupon.code}</span>
                      </div>
                      <button 
                        onClick={() => setExpandedId(expandedId === coupon.id ? null : coupon.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
                      >
                        {expandedId === coupon.id ? <HiChevronUp /> : <HiChevronDown />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-black text-gray-900">
                          {coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : `$${coupon.discount_value}`}
                        </span>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{coupon.discount_type} discount</p>
                      </div>
                      <StatusBadge coupon={coupon} expired={isExpired(coupon)} />
                    </div>

                    {expandedId === coupon.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Min. Order</p>
                            <p className="text-sm font-bold text-gray-900">${coupon.min_order || 0}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Expiry</p>
                            <p className="text-sm font-bold text-gray-900">{coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : "No Expiry"}</p>
                          </div>
                        </div>
                        <div className="mb-6">
                           <UsageTracker coupon={coupon} />
                        </div>
                        <div className="flex justify-end gap-2 border-t border-gray-50 pt-3">
                          <CouponActions coupon={coupon} openEdit={openEdit} setDeleteTarget={setDeleteTarget} showLabel />
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gray-900"></div>
            <div className="p-8 text-poppins">
              <h2 className="text-xl font-black text-gray-900 mb-6">
                {editingCoupon ? "Edit Coupon Details" : "Create New Coupon"}
              </h2>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block ml-1">Coupon Code</label>
                    <input
                      required
                      placeholder="e.g. SUMMER25"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      className="w-full p-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-300"
                    />
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block ml-1">Discount Type</label>
                    <select
                      value={form.discount_type}
                      onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block ml-1">Value</label>
                    <input
                      type="number"
                      required
                      value={form.discount_value}
                      onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })}
                      className="w-full p-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block ml-1">Min. Order ($)</label>
                    <input
                      type="number"
                      value={form.min_order}
                      onChange={(e) => setForm({ ...form, min_order: Number(e.target.value) })}
                      className="w-full p-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block ml-1">Usage Limit</label>
                    <input
                      type="number"
                      placeholder="Unlimited"
                      value={form.usage_limit}
                      onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-300"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block ml-1">Expiry Date</label>
                    <input
                      type="date"
                      value={form.expires_at}
                      onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                    />
                  </div>
                  
                  <div className="col-span-2 py-2">
                    <label className="flex items-center gap-3 cursor-pointer group w-fit">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={form.active}
                          onChange={(e) => setForm({ ...form, active: e.target.checked })}
                          className="sr-only"
                        />
                        <div className={`w-12 h-6 rounded-full transition-colors duration-300 ${form.active ? "bg-green-500" : "bg-gray-200"}`}></div>
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${form.active ? "translate-x-6" : ""}`}></div>
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-900 transition-colors">Active Coupon</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-200 rounded-2xl text-[10px] font-black text-gray-400 hover:bg-gray-50 transition-all tracking-widest uppercase"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-2 px-8 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black hover:bg-black shadow-lg shadow-gray-200 transition-all disabled:opacity-50 tracking-widest uppercase"
                  >
                    {isSaving ? "SAVING..." : editingCoupon ? "UPDATE COUPON" : "CREATE COUPON"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Coupon"
          message={`Are you sure you want to permanently delete coupon "${deleteTarget.code}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={isDeleting}
        />
      )}
    </div>
  )
}

function StatusBadge({ coupon, expired }: { coupon: Coupon, expired: boolean }) {
  if (expired) return (
    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded-full tracking-widest">
      <HiOutlineClock className="w-3 h-3" /> EXPIRED
    </span>
  )
  if (coupon.active) return (
    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-green-700 bg-green-50 px-2 py-0.5 rounded-full tracking-widest">
      <HiCheckCircle className="w-3 h-3" /> ACTIVE
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full tracking-widest">
      <HiXCircle className="w-3 h-3" /> DISABLED
    </span>
  )
}

function UsageTracker({ coupon }: { coupon: Coupon }) {
  const limit = Number(coupon.usage_limit) || 0
  const count = Number(coupon.usage_count) || 0
  const usagePercent = limit > 0 ? Math.min(100, (count / limit) * 100) : 0
  
  // Ensure the bar is visible (min 2%) if there is any usage but the percent is very low
  const displayWidth = count > 0 && usagePercent < 2 ? 2 : usagePercent

  return (
    <div className="w-full">
      <div className="w-full max-w-[120px] h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${usagePercent > 80 ? "bg-orange-500" : "bg-blue-600"}`}
          style={{ width: `${displayWidth}%` }}
        />
      </div>
      <span className="text-[9px] font-black text-gray-400 underline decoration-gray-100 tracking-widest uppercase">
        {count} / {coupon.usage_limit ?? "∞"} USED
      </span>
    </div>
  )
}

function CouponActions({ coupon, openEdit, setDeleteTarget, showLabel = false }: { coupon: Coupon, openEdit: (c: Coupon) => void, setDeleteTarget: (c: Coupon) => void, showLabel?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => openEdit(coupon)}
        className={`p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 flex items-center gap-2 ${showLabel ? 'bg-gray-50' : ''}`}
      >
        <HiOutlinePencilAlt className="w-5 h-5" />
        {showLabel && <span className="text-[10px] font-black uppercase tracking-widest">Edit</span>}
      </button>
      <button
        onClick={() => setDeleteTarget(coupon)}
        className={`p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600 flex items-center gap-2 ${showLabel ? 'bg-red-50' : ''}`}
      >
        <HiOutlineTrash className="w-5 h-5" />
        {showLabel && <span className="text-[10px] font-black uppercase tracking-widest">Delete</span>}
      </button>
    </div>
  )
}