"use client"

import { supabase } from "@/lib/supabase/client"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useState } from "react"

type FormValues = {
  email: string
  password: string
}

export default function AdminLogin() {
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState("")
  const [isRedirecting, setIsRedirecting] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>()

  const onSubmit = async (data: FormValues) => {
    setErrorMsg("")

    try {

      // Step 1: Sign in
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })

      if (loginError) {
        console.error("❌ Login failed:", loginError.message)
        setErrorMsg(loginError.message)
        return
      }

      const user = loginData.user

      // Step 2: Verify user has admin role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profileError || !profile) {
        setErrorMsg("Profile not found. Contact support.")
        await supabase.auth.signOut()
        return
      }

      const isAdmin = (profile.role || "").trim().toLowerCase() === "admin"

      if (!isAdmin) {
        setErrorMsg(`Access denied. You need admin role to access this area. Your role: ${profile.role || "user"}`)
        await supabase.auth.signOut()
        return
      }

      // Show redirecting state immediately
      setIsRedirecting(true)

      // Force full page reload so middleware receives session cookies
      // This ensures the Supabase session is in the request headers
      setTimeout(() => {
        window.location.href = "/pages/admin/dashboard"
      }, 300)
    } catch (error) {
      setErrorMsg("Login failed. Please try again.")
      await supabase.auth.signOut()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-10 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">3legant.</h1>
          <p className="text-gray-500 mt-2 text-sm uppercase tracking-widest font-medium">Internal Admin Portal</p>
        </div>

        {isRedirecting ? (
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="animate-spin h-12 w-12 text-black mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-center text-gray-600 font-semibold">Redirecting to Dashboard...</p>
            <p className="text-center text-gray-400 text-sm mt-2">Please wait</p>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="admin-login-email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  id="admin-login-email"
                  autoComplete="email"
                  placeholder="admin@3legant.com"
                  suppressHydrationWarning
                  disabled={isRedirecting}
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                  })}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none disabled:opacity-50"
                />
                {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email.message}</span>}
              </div>

              <div>
                <label htmlFor="admin-login-password" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Password</label>
                <input
                  id="admin-login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  suppressHydrationWarning
                  disabled={isRedirecting}
                  {...register("password", { required: "Password is required", minLength: { value: 6, message: "Minimum 6 characters" } })}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none disabled:opacity-50"
                />
                {errors.password && <span className="text-red-500 text-xs mt-1 block">{errors.password.message}</span>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isRedirecting}
                suppressHydrationWarning
                className="w-full bg-black text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all duration-200 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Authenticating...
                  </span>
                ) : "Log into Dashboard"}
              </button>
            </form>
          </>
        )}

        <div className="mt-8 text-center text-xs text-gray-400">
          <p>© 2024 3legant. Secure Access Only.</p>
        </div>
      </div>
    </div>
  )
}