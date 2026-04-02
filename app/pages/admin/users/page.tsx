"use client"

import { useState, useMemo } from "react"
import { supabase } from "@/lib/supabase/client"
import { formatCurrency, formatDate } from "@/constants/Data"
import { useToast } from "@/components/admin/Toast"
import { useAdminUsers } from "@/hooks/admin/use-admin-queries"
import { TableSkeleton } from "@/components/ui/skeleton"
import { HiSearch, HiFilter, HiOutlineMail, HiOutlineClipboardList, HiX, HiChevronDown, HiChevronUp } from "react-icons/hi"

export default function UserManagement() {
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "customer">("all")
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [userOrders, setUserOrders] = useState<any[]>([])
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 10

  const { data, isLoading, refetch } = useAdminUsers(page, PAGE_SIZE, roleFilter)
  const users = data?.data || []
  const totalCount = data?.count || 0

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "customer" : "admin"
    const { data, error } = await supabase.rpc("handle_toggle_user_role", { 
      target_user_id: userId, 
      new_role: newRole 
    })
    
    if (error || (data && data.error)) {
        toast(error?.message || data?.error || "Error updating role", "error")
    } else { 
        toast(`Role changed to ${newRole}`); 
        refetch() 
    }
  }

  const toggleBlock = async (userId: string, isBlocked: boolean) => {
    const { data, error } = await supabase.rpc("handle_toggle_user_block", { 
      target_user_id: userId, 
      block_status: !isBlocked 
    })

    if (error || (data && data.error)) {
        toast(error?.message || data?.error || "Error updating block status", "error")
    } else { 
        toast(isBlocked ? "User unblocked" : "User blocked"); 
        refetch() 
    }
  }

  const viewUserOrders = async (user: any) => {
    setSelectedUser(user)
    const { data } = await supabase
      .from("orders")
      .select("id, total_price, status, order_date")
      .eq("user_id", user.id)
      .order("order_date", { ascending: false })
      .limit(10)
    setUserOrders(data || [])
  }

  const filtered = useMemo(() => {
    if (!search) return users
    return users.filter(u => 
      u.name?.toLowerCase().includes(search.toLowerCase()) || 
      u.id.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    )
  }, [users, search])

  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-sm text-gray-500 mt-1">{totalCount} total users registered</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm w-full sm:w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="relative">
            <HiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select 
              value={roleFilter} 
              onChange={e => { setRoleFilter(e.target.value as any); setPage(0) }} 
              className="pl-10 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-sm appearance-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="customer">Customers</option>
            </select>
            <HiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 w-4 h-4 pointer-events-none" />
          </div>
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
                    {["Customer", "Role", "Status", "Activity", "Total Spent", "Actions"].map(h => (
                      <th key={h} className={`px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider ${h === "Actions" ? "text-right" : ""}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(user => (
                    <tr key={user.id} className={`hover:bg-gray-50/50 transition-colors ${user.is_blocked ? "bg-red-50/30" : ""}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-500 border border-white shadow-sm">
                            {user.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-gray-900 truncate">{user.name || "Unnamed Customer"}</p>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                              <HiOutlineMail className="w-3 h-3" />
                              <span className="truncate max-w-[120px]">{user.email || "No email"}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${user.role === "admin" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}>
                          {user.role || "customer"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${user.is_blocked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                          {user.is_blocked ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{user.total_orders} Orders</div>
                        <div className="text-[10px] text-gray-400">Created: {formatDate(user.created_at)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(user.total_spent || 0)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <UserActions user={user} viewUserOrders={viewUserOrders} toggleRole={toggleRole} toggleBlock={toggleBlock} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden divide-y divide-gray-50">
              {filtered.map(user => (
                <div key={user.id} className={`p-4 transition-colors ${expandedId === user.id ? "bg-blue-50/20" : user.is_blocked ? "bg-red-50/20" : "bg-white"}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-500 border border-white shadow-sm">
                        {user.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-gray-900 truncate">{user.name || "Unnamed Customer"}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email || "No email"}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setExpandedId(expandedId === user.id ? null : user.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
                    >
                      {expandedId === user.id ? <HiChevronUp /> : <HiChevronDown />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${user.role === "admin" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}>
                        {user.role || "customer"}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${user.is_blocked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                        {user.is_blocked ? "Blocked" : "Active"}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(user.total_spent || 0)}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{user.total_orders} Orders</p>
                    </div>
                  </div>

                  {expandedId === user.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <UserActions user={user} viewUserOrders={viewUserOrders} toggleRole={toggleRole} toggleBlock={toggleBlock} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex justify-between items-center">
          <button 
            onClick={() => setPage(p => Math.max(0, p - 1))} 
            disabled={page === 0} 
            className="px-4 py-1.5 border border-gray-200 rounded-xl text-xs font-bold disabled:opacity-50 hover:bg-white transition-colors"
          >
            PREV
          </button>
          <span className="text-xs font-bold text-gray-400">PAGE {page + 1}</span>
          <button 
            onClick={() => setPage(p => p + 1)} 
            disabled={filtered.length < PAGE_SIZE} 
            className="px-4 py-1.5 border border-gray-200 rounded-xl text-xs font-bold disabled:opacity-50 hover:bg-white transition-colors"
          >
            NEXT
          </button>
        </div>
      </div>

      {/* User Orders Drawer/Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedUser.name}'s Order History</h3>
                <p className="text-xs text-gray-500 mt-1">Showing last 10 transactions</p>
              </div>
              <button 
                onClick={() => setSelectedUser(null)} 
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto bg-gray-50/30">
              {userOrders.length ? (
                <div className="space-y-3">
                  {userOrders.map(o => (
                    <div key={o.id} className="flex justify-between items-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                      <div>
                        <p className="font-bold text-sm text-gray-900">Order #{o.id}</p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">{formatDate(o.order_date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-gray-900">{formatCurrency(o.total_price)}</p>
                        <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          o.status === "delivered" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {o.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HiOutlineClipboardList className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium italic">No orders found for this user</p>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-white border-t">
              <button 
                onClick={() => setSelectedUser(null)}
                className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function UserActions({ user, viewUserOrders, toggleRole, toggleBlock }: { user: any, viewUserOrders: (u: any) => void, toggleRole: (id: string, role: string) => void, toggleBlock: (id: string, blocked: boolean) => void }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button 
        onClick={() => viewUserOrders(user)} 
        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
        title="View Orders"
      >
        <HiOutlineClipboardList className="w-5 h-5" />
      </button>
      <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block" />
      <button 
        onClick={() => toggleRole(user.id, user.role || "customer")} 
        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
          user.role === "admin" ? "border-gray-200 text-gray-600 hover:bg-gray-50" : "border-blue-200 text-blue-600 hover:bg-blue-50"
        }`}
      >
        {user.role === "admin" ? "DEMOTE" : "PROMOTE"}
      </button>
      <button
        onClick={() => toggleBlock(user.id, !!user.is_blocked)}
        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
          user.is_blocked ? "bg-green-600 text-white hover:bg-green-700" : "bg-red-600 text-white hover:bg-red-700"
        }`}
      >
        {user.is_blocked ? "UNBLOCK" : "BLOCK"}
      </button>
    </div>
  )
}
