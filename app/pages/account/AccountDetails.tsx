"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { supabase } from "@/lib/supabase/client"

type FormData = {
  firstName: string
  lastName: string
  email: string
  newPassword?: string
  repeatPassword?: string
}

export default function AccountDetails() {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>()
  const watchFirstName = watch("firstName")
  const watchLastName = watch("lastName")

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        alert("Error getting user: " + error.message)
        return
      }
      if (!user) return

      const fullName = user.user_metadata?.name || ""
      const nameParts = fullName.trim().split(" ")
      const firstName = nameParts[0] || ""
      const lastName = nameParts.slice(1).join(" ") || ""

      reset({
        firstName,
        lastName,
        email: user.email || "",
        newPassword: "",
        repeatPassword: ""
      })
    }

    fetchProfile()
  }, [reset])

  const onSubmit = async (formData: FormData) => {
    if (formData.newPassword && formData.newPassword !== formData.repeatPassword) {
      alert("Passwords do not match")
      return
    }

    const displayName = `${formData.firstName} ${formData.lastName}`.trim()

    const { data, error } = await supabase.auth.updateUser({
      email: formData.email,
      password: formData.newPassword || undefined,
      data: {
        name: displayName 
      }
    })

    if (error) {
      alert("Error updating account: " + error.message)
      return
    }

    alert("Account updated successfully!")

    reset({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      newPassword: "",
      repeatPassword: ""
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-gray-500">
      <h2 className="text-xl font-semibold text-black">Account Details</h2>

      <div className="flex flex-col">
        <label className="uppercase font-medium mb-1">First Name</label>
        <input {...register("firstName", { required: "First name required" })} className="border border-gray-300 py-3 px-3" />
        {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
      </div>

      <div className="flex flex-col">
        <label className="uppercase font-medium mb-1">Last Name</label>
        <input {...register("lastName", { required: "Last name required" })} className="border border-gray-300 py-3 px-3" />
        {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
      </div>

      <div className="flex flex-col">
        <label className="uppercase font-medium mb-1">Email</label>
        <input {...register("email", { required: "Email required" })} className="border border-gray-300 py-3 px-3" />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>

      <h2 className="text-xl font-semibold mb-4 text-black">Password</h2>

      <div className="flex flex-col mt-3">
        <label className="uppercase font-medium mb-1">New Password</label>
        <input
          type="password"
          {...register("newPassword")}
          placeholder="New Password"
          className="w-full border border-gray-300 py-3 px-3 focus:outline-none"
        />
      </div>

      <div className="flex flex-col mt-3">
        <label className="uppercase font-medium mb-1">Repeat New Password</label>
        <input
          type="password"
          {...register("repeatPassword")}
          placeholder="Repeat New Password"
          className="w-full border border-gray-300 py-3 px-3 focus:outline-none"
        />
      </div>

      <button type="submit" className="bg-black text-white px-5 py-2 rounded-md">Save Changes</button>
    </form>
  )
}