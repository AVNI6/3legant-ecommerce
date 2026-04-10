"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { supabase } from "@/lib/supabase/client"
import { AccountDetailsSkeleton } from "@/components/ui/skeleton"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { setAuth } from "@/store/slices/authSlice"

import { toast } from "react-toastify"
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi"

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
  const dispatch = useAppDispatch()
  const { register, reset, watch, trigger, getValues, formState: { errors } } = useForm<FormData>()
  const { user, loading: authLoading } = useAppSelector((state: any) => state.auth)
  const [updateError, setUpdateError] = useState("")
  const [isSavingDetails, setIsSavingDetails] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)

  const [isOldFocused, setIsOldFocused] = useState(false)
  const [isNewFocused, setIsNewFocused] = useState(false)
  const [isRepeatFocused, setIsRepeatFocused] = useState(false)

  const watchOld = watch("oldPassword")
  const watchNew = watch("newPassword")
  const watchRepeat = watch("repeatPassword")
  const firstNameValue = watch("firstName")
  const lastNameValue = watch("lastName")
  const displayNameValue = watch("displayName")
  const currentName = (user?.user_metadata?.name || "").trim()
  const currentNameParts = currentName.split(" ")
  const currentFirstName = currentNameParts[0] || ""
  const currentLastName = currentNameParts.slice(1).join(" ") || ""
  const normalizedFirstName = (firstNameValue || "").trim()
  const normalizedLastName = (lastNameValue || "").trim()
  const normalizedDisplayName = (displayNameValue || "").trim()
  const isDetailsUnchanged =
    normalizedFirstName === currentFirstName &&
    normalizedLastName === currentLastName &&
    normalizedDisplayName === currentName

  const showUpdateError = (message: string) => {
    setUpdateError(message)
    toast.error(message)
  }

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

  const saveAccountDetails = async () => {
    setUpdateError("")
    const isValid = await trigger(["firstName", "lastName", "displayName"])
    if (!isValid) return

    const formData = getValues()

    const normalizedFirst = (formData.firstName || "").trim()
    const normalizedLast = (formData.lastName || "").trim()
    const normalizedDisplay = (formData.displayName || "").trim()
    const combinedName = `${normalizedFirst} ${normalizedLast}`.trim()

    // If display name wasn't manually changed from current value, keep it in sync with split name fields.
    // If user explicitly clears display name, keep it empty.
    const nextDisplayName =
      normalizedDisplay === currentName ? combinedName : normalizedDisplay

    const hasAnyChange =
      normalizedFirst !== currentFirstName ||
      normalizedLast !== currentLastName ||
      nextDisplayName !== currentName

    if (!hasAnyChange) {
      toast.info("No changes to save")
      return
    }

    setIsSavingDetails(true)

    try {

      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      if (userError || !currentUser) throw new Error("No active session found. Please log in again.")

      const nameToSave = nextDisplayName

      const { error: authError } = await supabase.auth.updateUser({
        data: {
          name: nameToSave
        }
      })

      if (authError) {
        const authMessage = authError.message || "Unable to update account details"
        if (authMessage.toLowerCase().includes("new password should be different")) {
          showUpdateError("New password should be different from the old password.")
          return
        }
        throw new Error(authMessage)
      }
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: currentUser.id,
          name: nameToSave,
          email: formData.email,
        }, { onConflict: "id" })

      if (profileError) {
        console.error("Profile sync error details:", profileError)
        throw new Error(`Profile sync failed: ${profileError.message}`)
      }

      toast.success("Account details saved successfully!")

      const { data: refreshedUserData } = await supabase.auth.getUser()
      if (refreshedUserData?.user) {
        const { data: refreshedSessionData } = await supabase.auth.getSession()
        dispatch(setAuth({ user: refreshedUserData.user, session: refreshedSessionData.session }))
      }

      reset({
        ...formData,
        firstName: normalizedFirst,
        lastName: normalizedLast,
        displayName: nameToSave,
      })
    } catch (err: any) {
      const message = err?.message || "An error occurred during update"
      showUpdateError(message)
    } finally {
      setIsSavingDetails(false)
    }
  }

  const savePassword = async () => {
    setUpdateError("")
    const isValid = await trigger(["oldPassword", "newPassword", "repeatPassword"])
    if (!isValid) return

    const formData = getValues()

    if (!formData.newPassword || !formData.repeatPassword) {
      showUpdateError("Please enter and confirm your new password")
      return
    }

    if (!formData.oldPassword) {
      showUpdateError("Current password is required to set a new one")
      return
    }

    if (formData.newPassword !== formData.repeatPassword) {
      showUpdateError("New passwords do not match")
      return
    }

    if (formData.newPassword === formData.oldPassword) {
      showUpdateError("New password should be different from the old password.")
      return
    }

    setIsSavingPassword(true)

    try {
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      if (userError || !currentUser) throw new Error("No active session found. Please log in again.")

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentUser.email!,
        password: formData.oldPassword,
      })

      if (signInError) {
        showUpdateError("Incorrect current password. Please try again.")
        return
      }

      const { error: authError } = await supabase.auth.updateUser({
        password: formData.newPassword,
      })

      if (authError) {
        const authMessage = authError.message || "Unable to update password"
        if (authMessage.toLowerCase().includes("new password should be different")) {
          showUpdateError("New password should be different from the old password.")
          return
        }
        throw new Error(authMessage)
      }

      toast.success("Password updated successfully!")
      reset({
        ...formData,
        oldPassword: "",
        newPassword: "",
        repeatPassword: "",
      })
    } catch (err: any) {
      const message = err?.message || "An error occurred while updating password"
      showUpdateError(message)
    } finally {
      setIsSavingPassword(false)
    }
  }

  if (authLoading) {
    return <AccountDetailsSkeleton />
  }

  return (
    <div className="max-w-5xl lg:mx-auto px-4 ">
      <form className="space-y-8 text-gray-500 ">
        <h2 className="font-inter font-semibold text-[20px] leading-[32px] tracking-normal text-black">Account Details</h2>
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
              {...register("lastName")}
              className="border border-gray-200 py-3 px-4 text-black focus:outline-none focus:ring-2 focus:ring-black/5 rounded-xl transition-all"
            />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
          </div>

          <div className="flex flex-col">
            <label htmlFor="account-display-name" className="uppercase font-bold text-xs text-gray-400 mb-2">Display Name</label>
            <input
              id="account-display-name"
              {...register("displayName", {
                validate: (value) => !value || value.trim().length >= 3 || "Min 3 characters"
              })}
              placeholder="Full Name (Visible to others)"
              className="border border-gray-200 py-3 px-4 text-black focus:outline-none focus:ring-2 focus:ring-black/5 rounded-xl transition-all"
            />
            {errors.displayName && <p className="text-red-500 text-xs mt-1">{errors.displayName.message}</p>}
          </div>
          <div className="flex flex-col">
            <label htmlFor="account-email" className="uppercase font-bold text-xs text-gray-400 mb-2">Email Address</label>
            <input
              id="account-email"
              autoComplete="email"
              readOnly
              {...register("email")}
              className="border border-gray-200 py-3 px-4 text-gray-500 bg-gray-50 focus:outline-none rounded-xl transition-all cursor-not-allowed"
              title="Email cannot be changed directly"
            />
          </div>
          <button
            type="button"
            onClick={saveAccountDetails}
            disabled={isSavingDetails || isSavingPassword || isDetailsUnchanged}
            className="flex-1 sm:flex-none bg-black text-white px-8 py-3.5 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all duration-200 disabled:opacity-100 disabled:bg-black disabled:text-white disabled:translate-y-0 disabled:cursor-not-allowed text-sm font-bold"
          >
            {isSavingDetails ? "Saving Details..." : "Save Account Details"}
          </button>
        </div>
        <div className="border-t border-gray-100 pt-3 space-y-6">
          <h2 className="text-2xl font-semibold text-black">Password Change</h2>
       
          <div className="flex flex-col">
            <label htmlFor="account-old-password" title="Required to change password" className="uppercase font-bold text-xs text-gray-400 mb-2 cursor-help">Current Password *</label>
            <div className="relative group/field">
              <input
                id="account-old-password"
                type={showOldPassword ? "text" : "password"}
                autoComplete="current-password"
                {...register("oldPassword", {
                  validate: (value, formValues) => {
                    if (formValues.newPassword && !value) return "Required to change password"
                    return true
                  }
                })}
                onFocus={() => setIsOldFocused(true)}
                onBlur={() => setIsOldFocused(false)}
                placeholder="Enter current password"
                className="w-full border border-gray-200 py-3 pl-4 pr-12 text-black focus:outline-none focus:ring-2 focus:ring-black/5 rounded-xl transition-all"
              />
              {(watchOld && isOldFocused) && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black focus:outline-none transition-colors"
                  aria-label={showOldPassword ? "Hide password" : "Show password"}
                >
                  {showOldPassword ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
                </button>
              )}
            </div>
            {errors.oldPassword && <p className="text-red-500 text-xs mt-1">{errors.oldPassword.message}</p>}
          </div>


          <div className="flex flex-col">
            <label htmlFor="account-new-password" title="Leave empty to keep current password" className="uppercase font-bold text-xs text-gray-400 mb-2 cursor-help">New Password</label>
            <div className="relative group/field">
              <input
                id="account-new-password"
                type={showNewPassword ? "text" : "password"}
                autoComplete="new-password"
                {...register("newPassword", {
                  validate: {
                    minLen: (val) => !val || val.length >= 8 || "Min 8 characters",
                    hasUpper: (val) => !val || /[A-Z]/.test(val) || "Requires uppercase letter",
                    hasLower: (val) => !val || /[a-z]/.test(val) || "Requires lowercase letter",
                    hasNumber: (val) => !val || /\d/.test(val) || "Requires a number",
                    hasSpecial: (val) => !val || /[@$!%*?&]/.test(val) || "Requires a special character (@$!%*?&)",
                  }
                })}
                onFocus={() => setIsNewFocused(true)}
                onBlur={() => setIsNewFocused(false)}
                placeholder="New Password"
                className="w-full border border-gray-200 py-3 pl-4 pr-12 text-black focus:outline-none focus:ring-2 focus:ring-black/5 rounded-xl transition-all"
              />
              {(watchNew && isNewFocused) && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black focus:outline-none transition-colors"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
                </button>
              )}
            </div>
            {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
          </div>

          <div className="flex flex-col">
            <label htmlFor="account-repeat-password" title="Must match new password" className="uppercase font-bold text-xs text-gray-400 mb-2 cursor-help">Repeat New Password</label>
            <div className="relative group/field">
              <input
                id="account-repeat-password"
                type={showRepeatPassword ? "text" : "password"}
                autoComplete="new-password"
                {...register("repeatPassword", {
                  validate: (value, formValues) => {
                    if (formValues.newPassword && value !== formValues.newPassword) {
                      return "Passwords do not match"
                    }
                    return true
                  }
                })}
                onFocus={() => setIsRepeatFocused(true)}
                onBlur={() => setIsRepeatFocused(false)}
                placeholder="Repeat New Password"
                className="w-full border border-gray-200 py-3 pl-4 pr-12 text-black focus:outline-none focus:ring-2 focus:ring-black/5 rounded-xl transition-all"
              />
              {(watchRepeat && isRepeatFocused) && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black focus:outline-none transition-colors"
                  aria-label={showRepeatPassword ? "Hide password" : "Show password"}
                >
                  {showRepeatPassword ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
                </button>
              )}
            </div>
            {errors.repeatPassword && <p className="text-red-500 text-xs mt-1">{errors.repeatPassword.message}</p>}
          </div>

        </div>

        <div className="flex flex-col sm:flex-row gap-4 pb-4">
          
          <button
            type="button"
            onClick={savePassword}
            disabled={isSavingDetails || isSavingPassword}
            className="flex-1 sm:flex-none bg-black text-white px-8 py-3.5 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:translate-y-0 text-sm font-bold"
          >
            {isSavingPassword ? "Saving Password..." : "Save Password"}
          </button>
          <button
            type="button"
            onClick={() => reset()}
            disabled={isSavingDetails || isSavingPassword}
            className="flex-1 sm:flex-none border border-gray-200 px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}