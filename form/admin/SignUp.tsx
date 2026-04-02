"use client"

import { supabase } from "@/lib/supabase/client"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { logger } from "@/lib/logger"

type FormValues = {
  name: string
  email: string
  password: string
}

export default function AdminSignup() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>()

  // Only allow existing admins to create new admin accounts, or allow if no admins exist yet
  useEffect(() => {
    const checkCurrentAdmin = async () => {
      // 1. Check if ANY admin exists in the system
      const { count, error: countError } = await supabase
        .from("profiles")
        .select("*", { count: 'exact', head: true })
        .eq("role", "admin")

      if (countError) {
        logger.error("Error checking admin count:", countError)
      }

      if (count === 0) {
        // If no admins exist, allow anyone to create the first one
        setIsAuthorized(true)
        setChecking(false)
        return
      }

      // 2. If admins exist, check if current user is an admin
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setChecking(false)
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profile?.role === "admin") {
        setIsAuthorized(true)
      }

      setChecking(false)
    }

    checkCurrentAdmin()
  }, [])

  const onSubmit = async (data: FormValues) => {
    // Sign up user with Supabase Auth and store name in user_metadata
    const { data: signupData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name
        }
      }
    })

    if (signUpError) {
      toast.error("Auth Error: " + signUpError.message)
      return
    }

    // 2. Insert profile into the profiles table
    // Note: If you have a Supabase trigger to create profiles, this might return a duplicate key error.
    // We treat "duplicate key" error as success because it means the profile already exists.
    const { error: profileError } = await supabase.from("profiles").insert({
      id: signupData.user?.id,
      name: data.name,
      email: data.email,
      role: "admin"
    })

    if (profileError && profileError.code !== "23505") { // 23505 = duplicate key
      logger.error("Profile creation error:", profileError)
      toast.error("Admin user created in Auth, but profile insertion failed: " + profileError.message + ". Please check your RLS policies for the profiles table.")
      return
    }

    toast.success("Admin account created successfully!")
    router.push("/pages/admin/login")
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-white p-12 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">Verifying Admin Privileges...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-8 bg-white p-12 rounded-2xl shadow-xl border border-gray-100">
        <div className="bg-red-50 p-4 rounded-full">
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-gray-500 max-w-xs mx-auto">Only existing administrators can authorize the creation of new admin accounts.</p>
        </div>
        <button
          onClick={() => router.push("/pages/admin/login")}
          className="bg-black text-white px-10 py-4 rounded-xl font-bold shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95"
        >
          Return to Login
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-6">
      <div className="w-full max-w-md p-10 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">3legant.</h1>
          <p className="text-gray-500 mt-2 text-sm uppercase tracking-widest font-medium">Create New Administrator</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="admin-signup-name" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Full Name</label>
            <input
              id="admin-signup-name"
              autoComplete="name"
              placeholder="John Doe"
              {...register("name", { required: "Name is required" })}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none"
            />
            {errors.name && <span className="text-red-500 text-xs mt-1 block">{errors.name.message}</span>}
          </div>

          <div>
            <label htmlFor="admin-signup-email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Admin Email</label>
            <input
              id="admin-signup-email"
              autoComplete="email"
              placeholder="admin@3legant.com"
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
              })}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none"
            />
            {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email.message}</span>}
          </div>

          <div>
            <label htmlFor="admin-signup-password" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Security Password</label>
            <input
              id="admin-signup-password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              {...register("password", { required: "Password is required", minLength: { value: 6, message: "Minimum 6 characters" } })}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none"
            />
            {errors.password && <span className="text-red-500 text-xs mt-1 block">{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all duration-200 disabled:opacity-50"
          >
            {isSubmitting ? "Processing Account..." : "Create Admin Account"}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-400">
          <p>Authorized personnel only. All actions are logged.</p>
        </div>
      </div>
    </div>
  )
}