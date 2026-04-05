"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { ToastProvider } from "@/components/admin/Toast"
import { useAppSelector } from "@/store/hooks"
import {
  HiMenu,
  HiX,
  HiOutlineExternalLink,
  HiOutlineHome,
  HiOutlineShoppingBag,
  HiOutlineCreditCard,
  HiOutlineReceiptRefund,
  HiOutlineCube,
  HiOutlineUsers,
  HiOutlineStar,
  HiOutlineDocumentText,
  HiOutlineTicket,
  HiOutlineTruck,
  HiOutlineQuestionMarkCircle,
  HiOutlineCog
} from "react-icons/hi"
import { APP_ROUTE } from "@/constants/AppRoutes"

const NAV_ITEMS = [
  { href: APP_ROUTE.admindashboard, label: "Dashboard", icon: HiOutlineHome },
  { href: APP_ROUTE.adminorders, label: "Orders", icon: HiOutlineShoppingBag },
  { href: APP_ROUTE.adminpayments, label: "Payments", icon: HiOutlineCreditCard },
  { href: APP_ROUTE.adminrefunds, label: "Refunds", icon: HiOutlineReceiptRefund },
  {
    href: APP_ROUTE.adminproducts, label: "Products", icon: HiOutlineCube, children: [
      { href: APP_ROUTE.adminproducts, label: "All Products" },
      { href: APP_ROUTE.adminaddProduct, label: "+ Add Product" }
    ]
  },
  { href: APP_ROUTE.adminusers, label: "Customers", icon: HiOutlineUsers },
  { href: APP_ROUTE.adminreviews, label: "Reviews", icon: HiOutlineStar },
  { href: APP_ROUTE.admincms, label: "Blog", icon: HiOutlineDocumentText },
  { href: APP_ROUTE.admincoupons, label: "Coupons", icon: HiOutlineTicket },
  { href: APP_ROUTE.adminshipping, label: "Shipping", icon: HiOutlineTruck },
  { href: APP_ROUTE.adminquestions, label: "Questions Hub", icon: HiOutlineQuestionMarkCircle },
  { href: APP_ROUTE.adminsettings, label: "Settings", icon: HiOutlineCog }
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { user, isAdmin, adminChecked, loading: authLoading } = useAppSelector(state => state.auth)

  const isPublicPage = pathname === "/pages/admin/login" || pathname === "/pages/admin/signup"

  useEffect(() => {
    if (isPublicPage || authLoading) return

    if (!user) {
      router.replace("/pages/admin/login")
      return
    }

    if (!adminChecked) return

    if (!isAdmin) {
      router.replace("/")
    }
  }, [user, isAdmin, adminChecked, authLoading, isPublicPage, router])

  // Close sidebar on path change
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sb-admin-verified')
    }
    await supabase.auth.signOut()
    router.push("/")
  }

  if (isPublicPage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md">{children}</div>
      </div>
    )
  }

  // Optimization: Skip the blocking spinner if we already know the user is an admin.
  // We use a local storage hint to skip the spinner synchronously on refresh.
  const [isAdminHint] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sb-admin-verified') === 'true'
    }
    return false
  })

  const isVerifiedAdmin = isAdmin || isAdminHint || (user?.app_metadata?.role === 'admin') || (user?.user_metadata?.role === 'admin');

  // NOTE: We no longer return a full-screen blocking spinner here.
  // The Admin Shell now renders immediately for an instant feeling.
  // Security redirects are handled by the useEffect above.

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900 text-white flex items-center px-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-gray-800 rounded-md transition-colors"
          aria-label="Open Sidebar"
        >
          <HiMenu className="w-6 h-6" />
        </button>
        <h1 className="ml-4 font-bold text-lg">Admin Panel</h1>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`
          fixed inset-y-0 z-[70] bg-gray-900 text-white flex flex-col transition-transform duration-300 ease-in-out
          w-[80vw] sm:w-64 lg:w-64 lg:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h1 className="text-lg font-bold">Admin Panel</h1>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-800 rounded-md"
            aria-label="Close Sidebar"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition ${isActive ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                >
                  <item.icon className="w-5 h-5 text-current" />
                  {item.label}
                </Link>
                {item.children && isActive && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map(child => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block px-3 py-1.5 rounded text-xs ${pathname === child.href ? "text-white bg-white/10" : "text-gray-500 hover:text-white"}`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="p-3 border-t border-gray-800 mt-auto space-y-2">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded text-sm transition font-medium border border-gray-700"
          >
            <HiOutlineExternalLink className="w-4 h-4 text-gray-400" />
            View Store
          </Link>
          <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm transition font-medium">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`
        flex-1 p-4 sm:p-6 lg:p-8 overflow-auto transition-all duration-300
        mt-16 lg:mt-0 lg:ml-64
      `}>
        <ToastProvider>
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </ToastProvider>
      </main>
    </div>
  )
}
