"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"
import { APP_ROUTE } from "@/constants/AppRoutes"
import { useToast } from "@/components/admin/Toast"
import { useRefundSettings, useUpdateRefundSettings } from "@/hooks/admin/use-admin-queries"
import { HiOutlineAdjustments, HiOutlineClock, HiCheckCircle, HiChevronLeft } from "react-icons/hi"

export default function AdminSettings() {
  const { toast } = useToast()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [tempInput, setTempInput] = useState("")

  const { data: refundWindow, isLoading: isLoadingSettings } = useRefundSettings()
  const { mutate: updateSettings, isPending: isSaving } = useUpdateRefundSettings()

  useEffect(() => {
    const verifyAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id) return setIsAdmin(false)

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()
      setIsAdmin(profile?.role?.toLowerCase() === "admin")
    }
    verifyAdmin()
  }, [])

  useEffect(() => {
    if (refundWindow !== undefined) {
      setTempInput(String(refundWindow))
    }
  }, [refundWindow])

  const handleSave = () => {
    const days = parseInt(tempInput, 10)

    if (isNaN(days) || days < 1 || days > 365) {
      return toast("Refund window must be between 1 and 365 days", "error")
    }

    updateSettings(days, {
      onSuccess: () => toast(`Refund window updated to ${days} days`),
      onError: (err: any) => toast(err.message || "Failed to update settings", "error")
    })
  }

  if (isAdmin === null || isLoadingSettings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Loading System Config...</p>
      </div>
    )
  }

  if (isAdmin === false) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center p-8 bg-white rounded-3xl border border-gray-100 shadow-xl">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <HiOutlineAdjustments className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Access Restricted</h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">You do not have the necessary permissions to modify system-level configurations.</p>
        <Link href={APP_ROUTE.home} className="inline-block px-8 py-3 bg-gray-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all">
          RETURN TO STORE
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Global store configurations and business rules</p>
        </div>
        <Link 
          href={APP_ROUTE.admindashboard}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
        >
          <HiChevronLeft className="w-4 h-4" /> BACK TO DASHBOARD
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <HiOutlineClock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-gray-900">Refund Policy</h2>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
              Configure the post-purchase window during which customers are eligible to initiate refund requests. 
              Changing this will affect all active and future orders immediately.
            </p>
          </div>

          <div className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Auto-Expiry Window (Days)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    className="w-full pl-5 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-lg font-black text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-200"
                    placeholder="30"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-gray-300 pointer-events-none">DAYS</div>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Quick Selection</p>
                 <div className="grid grid-cols-3 gap-2">
                    {[7, 14, 30].map((d) => (
                      <button
                        key={d}
                        onClick={() => setTempInput(String(d))}
                        className={`py-4 rounded-2xl text-xs font-black transition-all ${
                          tempInput === String(d) 
                          ? "bg-gray-900 text-white shadow-lg shadow-gray-200" 
                          : "bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        {d}D
                      </button>
                    ))}
                 </div>
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving || tempInput === String(refundWindow)}
                className="w-full md:w-auto px-10 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200 disabled:opacity-30 disabled:shadow-none"
              >
                {isSaving ? "SAVING..." : "APPLY CHANGES"}
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl flex items-start gap-4">
               <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-green-500 flex-shrink-0 shadow-sm">
                  <HiCheckCircle className="w-5 h-5" />
               </div>
               <div>
                  <p className="text-xs font-black text-gray-900 uppercase tracking-tight">Active Configuration</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Current policy allows customers to request refunds within <span className="font-black text-gray-900">{refundWindow} days</span> of their purchase date.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
