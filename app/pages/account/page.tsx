// "use client"

// import { useEffect, useState } from "react"
// import { supabase } from "@/lib/supabase/client"
// import { useRouter } from "next/navigation"
// import { useForm } from "react-hook-form"

// type FormData = {
//   firstName: string
//   lastName: string
//   displayName: string
//   email: string
//   oldPassword?: string
//   newPassword?: string
//   repeatPassword?: string
// }

// export default function AccountPage() {
//   const [user, setUser] = useState<any>(null)
//   const router = useRouter()

// const { register, handleSubmit, reset, formState:{errors} } = useForm<FormData>()

//  useEffect(() => {
//   const getUser = async () => {
//     const { data } = await supabase.auth.getUser()

//     if (!data.user) {
//       router.push("/signin")
//       return
//     }

//     setUser(data.user)

//     // fetch saved account details
//     const { data: profile } = await supabase
//       .from("accountdetails")
//       .select("*")
//       .eq("id", data.user.id)
//       .single()

//     // autofill inputs
//     reset({
//       firstName: profile?.first_name || "",
//       lastName: profile?.last_name || "",
//       displayName: profile?.display_name || "",
//       email: profile?.email || data.user.email || "",
//     })
//   }

//   getUser()
// }, [reset])

//  const onSubmit = async (formData: FormData) => {
//   if (!user) return

//   // update account details table
//   const { error } = await supabase
//     .from("accountdetails")
//     .upsert({
//       id: user.id,
//       first_name: formData.firstName,
//       last_name: formData.lastName,
//       display_name: formData.displayName,
//       email: formData.email,
//     })

//   if (error) {
//     alert("Error saving account details")
//     return
//   }

//   // update password if user entered new one
//   if (formData.newPassword) {
//     if (formData.newPassword !== formData.repeatPassword) {
//       alert("Passwords do not match")
//       return
//     }

//     const { error: passwordError } = await supabase.auth.updateUser({
//       password: formData.newPassword,
//     })

//     if (passwordError) {
//       alert(passwordError.message)
//       return
//     }
//   }

//   alert("Account updated successfully")
// }

//   if (!user) return <p className="p-10">Loading...</p>

//   return (
//     <div className="px-10 lg:px-30 py-16">
//       <h1 className="text-4xl font-semibold mb-10">My Account</h1>

//       <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

//         {/* Sidebar */}
//         <div className="bg-gray-100 p-6 rounded-lg">

//           <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-xl font-semibold mb-4">
//             {user.email?.charAt(0).toUpperCase()}
//           </div>

//           <p className="font-semibold mb-6 break-words">
//             {user.email}
//           </p>

//           <ul className="space-y-4 text-gray-600">
//             <li className="font-medium text-black">Account</li>
//             <li>Address</li>
//             <li>Orders</li>
//             <li>Wishlist</li>

//             <li
//               className="cursor-pointer text-red-500"
//               onClick={async () => {
//                 await supabase.auth.signOut()
//                 router.push("/")
//               }}
//             >
//               Log Out
//             </li>
//           </ul>
//         </div>

//         {/* Main Content */}
//         <div className="lg:col-span-3">

//           <form
//             onSubmit={handleSubmit(onSubmit)}
//             className="border p-6 rounded-lg space-y-6 text-gray-500"
//           >
//             <h2 className="text-xl font-semibold text-black">
//               Account Details
//             </h2>

//             {/* First Name */}
//             <div className="flex flex-col">
//               <label className="uppercase font-medium mb-1">
//                 First Name *
//               </label>

//               <input
//                 {...register("firstName", {
//                   required: "First name required",
//                 })}
//                 className="border border-gray-300 py-3 px-3"
//               />

//               {errors.firstName && (
//                 <p className="text-red-500 text-sm">
//                   {errors.firstName.message as string}
//                 </p>
//               )}
//             </div>

//             {/* Last Name */}
//             <div className="flex flex-col">
//               <label className="uppercase font-medium mb-1">
//                 Last Name *
//               </label>

//               <input
//                 {...register("lastName", {
//                   required: "Last name required",
//                 })}
//                 className="border border-gray-300 py-3 px-3"
//               />

//               {errors.lastName && (
//                 <p className="text-red-500 text-sm">
//                   {errors.lastName.message as string}
//                 </p>
//               )}
//             </div>

//             {/* Display Name */}
//             <div className="flex flex-col">
//               <label className="uppercase font-medium mb-1">
//                 Display Name *
//               </label>

//               <input
//                 {...register("displayName", {
//                   required: "Display name required",
//                 })}
//                 className="border border-gray-300 py-3 px-3"
//               />

//               <p className="text-sm mt-1">
//                 This will be how your name appears in reviews
//               </p>

//               {errors.displayName && (
//                 <p className="text-red-500 text-sm">
//                   {errors.displayName.message as string}
//                 </p>
//               )}
//             </div>

//             {/* Email */}
//             <div className="flex flex-col">
//               <label className="uppercase font-medium mb-1">
//                 Email *
//               </label>

//               <input
//                 {...register("email", {
//                   required: "Email required",
//                 })}
//                 className="border border-gray-300 py-3 px-3"
//               />

//               {errors.email && (
//                 <p className="text-red-500 text-sm">
//                   {errors.email.message as string}
//                 </p>
//               )}
//             </div>

// <h1 className="text-xl font-semibold mb-4 text-black">
//   Password
// </h1>

// <div className="flex flex-col mt-3">
//   <label className="uppercase font-medium mb-1">
//     Old Password
//   </label>
//   <input
//     type="password"
//     {...register("oldPassword")}
//     placeholder="Old Password"
//     className="w-full border border-gray-300 py-3 px-3 focus:outline-none"
//   />
// </div>

// <div className="flex flex-col mt-3">
//   <label className="uppercase font-medium mb-1">
//     New Password
//   </label>
//   <input
//     type="password"
//     {...register("newPassword")}
//     placeholder="New Password"
//     className="w-full border border-gray-300 py-3 px-3 focus:outline-none"
//   />
// </div>

// <div className="flex flex-col mt-3">
//   <label className="uppercase font-medium mb-1">
//     Repeat New Password
//   </label>
//   <input
//     type="password"
//     {...register("repeatPassword")}
//     placeholder="Repeat New Password"
//     className="w-full border border-gray-300 py-3 px-3 focus:outline-none"
//   />
// </div>
//             <button
//               type="submit"
//               className="bg-black text-white px-5 py-2 rounded-md"
//             >
//               Save Changes
//             </button>

//           </form>

//         </div>
//       </div>
//     </div>
//   )
// }

"use client"

import AccountDetails from "@/app/pages/account/AccountDetails"

export default function Page() {

  return <AccountDetails />

}