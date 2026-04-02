"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useToast } from "@/components/admin/Toast"
import ConfirmModal from "@/components/admin/ConfirmModal"
import { useAdminShippingMethods, useSaveShippingMethod, useDeleteShippingMethod } from "@/hooks/admin/use-admin-queries"
import { HiPlus, HiOutlineTruck, HiOutlineTrash, HiOutlinePencilAlt, HiOutlineCurrencyDollar, HiOutlineReceiptTax, HiChevronDown, HiChevronUp } from "react-icons/hi"

type ShippingMethod = {
  id: number
  name: string
  type: "fixed" | "percentage"
  price: number | null
  percentage: number | null
}

type FormValues = {
  name: string
  type: "fixed" | "percentage"
  price: string
  percentage: string
}

export default function AdminShipping() {
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ShippingMethod | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const { data: methods = [], isLoading, refetch } = useAdminShippingMethods()
  const { mutate: saveMethod, isPending: isSaving } = useSaveShippingMethod()
  const { mutate: deleteMethod, isPending: isDeleting } = useDeleteShippingMethod()

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormValues>()
  const watchType = watch("type")

  const openAdd = () => {
    setEditingMethod(null)
    reset({ name: "", type: "fixed", price: "", percentage: "" })
    setShowForm(true)
  }

  const openEdit = (method: ShippingMethod) => {
    setEditingMethod(method)
    reset({
      name: method.name,
      type: method.type,
      price: method.price?.toString() || "",
      percentage: method.percentage?.toString() || ""
    })
    setShowForm(true)
  }

  const onSubmit = (data: FormValues) => {
    const payload: any = {
      name: data.name,
      type: data.type,
      price: data.type === "fixed" ? parseFloat(data.price) || 0 : null,
      percentage: data.type === "percentage" ? parseFloat(data.percentage) || 0 : null,
    }

    saveMethod({ id: editingMethod?.id, payload }, {
      onSuccess: () => {
        toast(`Shipping method ${editingMethod ? "updated" : "added"} successfully`)
        setShowForm(false)
        refetch()
      },
      onError: (err: any) => {
        const msg = err.message || ""
        if (msg.includes("409") || msg.toLowerCase().includes("conflict") || msg.includes("duplicate")) {
          toast("A shipping method with this name already exists. Please use a unique name.", "error")
        } else {
          toast(msg || "Failed to save shipping method", "error")
        }
      }
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteMethod(deleteTarget.id, {
      onSuccess: () => {
        toast("Shipping method deleted")
        setDeleteTarget(null)
        refetch()
      },
      onError: (err: any) => toast(err.message || "Delete failed", "error")
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipping Methods</h1>
          <p className="text-sm text-gray-500 mt-1">Configure delivery options and pricing models</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-black transition-all shadow-md active:scale-95"
        >
          <HiPlus className="w-5 h-5" />
          <span>ADD METHOD</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
             {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse" />
             ))}
          </div>
        ) : methods.length === 0 ? (
          <div className="p-12 text-center text-poppins">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <HiOutlineTruck className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-400 font-medium italic">No shipping methods configured.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {methods.map(method => (
              <div
                key={method.id}
                className={`flex flex-col p-5 hover:bg-gray-50/30 transition-all group ${expandedId === method.id ? 'bg-blue-50/10' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center shadow-lg shadow-gray-200">
                      <HiOutlineTruck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-black text-gray-900 uppercase tracking-tight">{method.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {method.type === "fixed" ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-widest">
                            <HiOutlineCurrencyDollar className="w-3 h-3" /> Fixed Rate
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full uppercase tracking-widest">
                            <HiOutlineReceiptTax className="w-3 h-3" /> Percentage
                          </span>
                        )}
                        <span className="text-sm font-black text-gray-900">
                          {method.type === "fixed"
                            ? `$${method.price?.toFixed(2) ?? "0.00"}`
                            : `${((method.percentage ?? 0) * 100).toFixed(0)}%`
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Desktop Actions */}
                    <div className="hidden lg:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(method)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"><HiOutlinePencilAlt className="w-5 h-5"/></button>
                      <button onClick={() => setDeleteTarget(method)} className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"><HiOutlineTrash className="w-5 h-5"/></button>
                    </div>
                    
                    {/* Mobile Toggle */}
                    <button 
                      onClick={() => setExpandedId(expandedId === method.id ? null : method.id)}
                      className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
                    >
                      {expandedId === method.id ? <HiChevronUp /> : <HiChevronDown />}
                    </button>
                  </div>
                </div>

                {expandedId === method.id && (
                  <div className="lg:hidden mt-4 pt-4 border-t border-gray-100 flex justify-end gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                     <button 
                        onClick={() => openEdit(method)} 
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl text-[10px] font-black uppercase text-gray-600"
                      >
                        <HiOutlinePencilAlt className="w-4 h-4" /> Edit
                      </button>
                      <button 
                        onClick={() => setDeleteTarget(method)} 
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-xl text-[10px] font-black uppercase text-red-600"
                      >
                        <HiOutlineTrash className="w-4 h-4" /> Delete
                      </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative text-poppins">
            <div className="absolute top-0 left-0 w-full h-2 bg-gray-900"></div>
            <div className="p-8">
              <h2 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight">
                {editingMethod ? "Edit Shipping Method" : "Add New Method"}
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block ml-1 leading-none">Display Name</label>
                  <input
                    placeholder="e.g. Express Delivery (2-3 days)"
                    {...register("name", { required: "Name is required" })}
                    className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-300"
                  />
                  {errors.name && <span className="text-red-500 text-[10px] font-bold mt-1 ml-1 leading-none">{errors.name.message}</span>}
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block ml-1 leading-none">Fee Type</label>
                  <select
                    {...register("type")}
                    className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="fixed">Fixed Price ($)</option>
                    <option value="percentage">Percentage based on Subtotal (%)</option>
                  </select>
                </div>

                {watchType === "fixed" ? (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block ml-1 leading-none">Shipping Cost ($)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">$</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...register("price")}
                        className="w-full pl-8 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block ml-1 leading-none">Percentage Fee (e.g. 0.15 = 15%)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.15"
                      {...register("percentage")}
                      className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                    <p className="text-[9px] text-gray-400 font-bold uppercase mt-1.5 ml-1">Calculated as: <span className="text-gray-900">Subtotal × Value</span></p>
                  </div>
                )}

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setEditingMethod(null) }}
                    className="flex-1 px-6 py-3 border border-gray-200 rounded-2xl text-[10px] font-black text-gray-400 hover:bg-gray-50 transition-all uppercase tracking-widest leading-none"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-2 px-8 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black hover:bg-black shadow-lg shadow-gray-200 transition-all disabled:opacity-50 uppercase tracking-widest leading-none"
                  >
                    {isSaving ? "SAVING..." : editingMethod ? "UPDATE METHOD" : "ADD METHOD"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Method"
          message={`Are you sure you want to permanently remove "${deleteTarget.name}"? This will affect new orders immediately.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={isDeleting}
          confirmText="DELETE"
        />
      )}
    </div>
  )
}
