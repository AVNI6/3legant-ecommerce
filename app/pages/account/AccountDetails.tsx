"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { supabase } from "@/lib/supabase/client"
import { AccountDetailsSkeleton } from "@/components/ui/skeleton"
import { useAppSelector } from "@/store/hooks"

type FormData = {
  displayName: string
  firstName: string
  lastName: string
  email: string
  oldPassword?: string
  newPassword?: string
  repeatPassword?: string
}

export default function AccountDetails() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>()
  const { user, loading: authLoading } = useAppSelector((state: any) => state.auth)
  const [updateError, setUpdateError] = useState("")
  const [updateSuccess, setUpdateSuccess] = useState("")

  // Populate form one-time when user data is available
  useEffect(() => {
    if (!user) return;

    const fullName = user.user_metadata?.name || ""
    const nameParts = fullName.trim().split(" ")
    const firstName = nameParts[0] || ""
    const lastName = nameParts.slice(1).join(" ") || ""

    reset({
      displayName: fullName,
      firstName,
      lastName,
      email: user.email || "",
      oldPassword: "",
      newPassword: "",
      repeatPassword: ""
    })
  }, [user, reset])

  const onSubmit = async (formData: FormData) => {
    setUpdateError("")
    setUpdateSuccess("")

    try {

      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      if (userError || !currentUser) throw new Error("No active session found. Please log in again.")

      // 2. Handle Password Verification (Optional for password changes)
      if (formData.newPassword) {
        if (!formData.oldPassword) {
          setUpdateError("Current password is required to set a new one")
          return
        }
        if (formData.newPassword !== formData.repeatPassword) {
          setUpdateError("New passwords do not match")
          return
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: currentUser.email!,
          password: formData.oldPassword
        })

        if (signInError) {
          setUpdateError("Incorrect current password. Please try again.")
          return
        }
      }

      const combinedName = `${formData.firstName} ${formData.lastName}`.trim()
      const currentName = user?.user_metadata?.name || ""
      const nameToSave = (formData.displayName === currentName)
        ? combinedName
        : (formData.displayName || combinedName)

      // 3. Update Auth User (Metadata + optional local email/password change)
      const { error: authError } = await supabase.auth.updateUser({
        email: formData.email !== currentUser.email ? formData.email : undefined,
        password: formData.newPassword || undefined,
        data: {
          name: nameToSave
        }
      })

      if (authError) throw authError
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: currentUser.id,
          name: nameToSave,
          email: formData.email,
        })

      if (profileError) {
        console.error("Profile sync error details:", profileError)
        throw new Error(`Profile sync failed: ${profileError.message}`)
      }

      setUpdateSuccess("Account details saved successfully!")

      reset({
        ...formData,
        displayName: nameToSave,
        oldPassword: "",
        newPassword: "",
        repeatPassword: ""
      })
    } catch (err: any) {
      console.error("Full Update Error Object:", err)
      setUpdateError(err.message || "An error occurred during update")
    }
  }

  if (authLoading) {
    return <AccountDetailsSkeleton />
  }

  return (
    <div className="max-w-3xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 text-gray-500">
        <h2 className="text-2xl font-semibold text-black">Account Details</h2>

        {updateError && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 animate-in fade-in slide-in-from-top-1">
            {updateError}
          </div>
        )}
        {updateSuccess && (
          <div className="p-4 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100 animate-in fade-in slide-in-from-top-1">
            {updateSuccess}
          </div>
        )}

        <div className="space-y-6">
          <div className="flex flex-col">
            <label htmlFor="account-first-name" className="uppercase font-bold text-xs text-gray-400 mb-2">First Name</label>
            <input
              id="account-first-name"
              autoComplete="given-name"
              {...register("firstName", { required: "First name required" })}
              className="border border-gray-200 py-3 px-4 text-black focus:outline-none focus:ring-2 focus:ring-black/5 rounded-xl transition-all"
            />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
          </div>

          <div className="flex flex-col">
            <label htmlFor="account-last-name" className="uppercase font-bold text-xs text-gray-400 mb-2">Last Name</label>
            <input
              id="account-last-name"
              autoComplete="family-name"
              {...register("lastName", { required: "Last name required" })}
              className="border border-gray-200 py-3 px-4 text-black focus:outline-none focus:ring-2 focus:ring-black/5 rounded-xl transition-all"
            />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
          </div>

          <div className="flex flex-col">
            <label htmlFor="account-display-name" className="uppercase font-bold text-xs text-gray-400 mb-2">Display Name</label>
            <input
              id="account-display-name"
              {...register("displayName")}
              placeholder="Full Name (Visible to others)"
              className="border border-gray-200 py-3 px-4 text-black focus:outline-none focus:ring-2 focus:ring-black/5 rounded-xl transition-all"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="account-email" className="uppercase font-bold text-xs text-gray-400 mb-2">Email Address</label>
            <input
              id="account-email"
              autoComplete="email"
              {...register("email", { required: "Email required" })}
              className="border border-gray-200 py-3 px-4 text-black focus:outline-none focus:ring-2 focus:ring-black/5 rounded-xl transition-all"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 mt-8 space-y-6">
          <h2 className="text-2xl font-semibold text-black">Password Change</h2>

          <div className="flex flex-col">
            <label htmlFor="account-old-password" title="Required to change password" className="uppercase font-bold text-xs text-gray-400 mb-2 cursor-help">Current Password *</label>
            <input
              id="account-old-password"
              type="password"
              autoComplete="current-password"
              {...register("oldPassword")}
              placeholder="Enter current password"
              className="border border-gray-200 py-3 px-4 text-black focus:outline-none focus:ring-2 focus:ring-black/5 rounded-xl transition-all"
            />
          </div>


          <div className="flex flex-col">
            <label htmlFor="account-new-password" title="Leave empty to keep current password" className="uppercase font-bold text-xs text-gray-400 mb-2 cursor-help">New Password</label>
            <input
              id="account-new-password"
              type="password"
              autoComplete="new-password"
              {...register("newPassword")}
              placeholder="New Password"
              className="w-full border border-gray-200 py-3 px-4 text-black focus:outline-none focus:ring-2 focus:ring-black/5 rounded-xl transition-all"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="account-repeat-password" title="Must match new password" className="uppercase font-bold text-xs text-gray-400 mb-2 cursor-help">Repeat New Password</label>
            <input
              id="account-repeat-password"
              type="password"
              autoComplete="new-password"
              {...register("repeatPassword")}
              placeholder="Repeat New Password"
              className="w-full border border-gray-200 py-3 px-4 text-black focus:outline-none focus:ring-2 focus:ring-black/5 rounded-xl transition-all"
            />
          </div>

        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-black text-white px-9 py-3 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:translate-y-0"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => reset()}
            disabled={isSubmitting}
            className="border border-gray-200 px-10 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}