"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AccountLayout({ children }: { children: React.ReactNode }) {

  const links = [
    { name: "Account Details", path: "/pages/account" },
    { name: "Address", path: "/pages/account/address" },
    { name: "Orders", path: "/pages/account/order" },
    { name: "Wishlist", path: "/pages/account/wishlist" },
  ];

  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState(links[0].name);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const getUser = async () => {

      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.push("/signin");
        return;
      }

      setUser(data.user);
    };

    getUser();
  }, []);

  if (!user) return <p className="p-10">Loading...</p>;

  const active = "font-semibold text-black border-b-2 border-black";
  const inactive = "text-gray-600";

  return (
    <div className="px-4 lg:px-30 py-16">
      <h1 className="text-4xl font-semibold mb-10 text-center">My Account</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="hidden lg:flex flex-col bg-gray-100 p-6 rounded-lg h-fit">

          <div className="flex flex-col items-center py-4">
            <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-xl font-semibold mb-4">
              {user.email?.charAt(0).toUpperCase()}
            </div>

            <p className="font-semibold mb-6 break-words text-center">
              {user?.user_metadata?.name}
            </p>
          </div>

          <div className="space-y-4 flex flex-col">
            {links.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={pathname === link.path ? active : inactive}
              >
                {link.name}
              </Link>
            ))}

            <p
              className="cursor-pointer text-red-500"
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/");
              }}
            >
              Logout
            </p>
          </div>

        </div>

        {/* Mobile Dropdown */}
        <div className="lg:hidden w-full">

          <div className="flex flex-col items-center bg-gray-100 p-4 rounded-lg mb-6">

            <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-xl font-semibold mb-4">
              {user.email?.charAt(0).toUpperCase()}
            </div>

            <p className="font-semibold mb-4 break-words text-center">
              {user?.user_metadata?.name}
            </p>

            <div className="relative w-full">

              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full border-3 border-gray-500 px-4 py-3 rounded-lg flex justify-between items-center"
              >
                <span>{selectedLink}</span>
                <span>▾</span>
              </button>

              {dropdownOpen && (
                <div className="absolute mt-2 w-full bg-white border rounded shadow-lg z-10">

                  {links.map((link) => (
                    <button
                      key={link.path}
                      onClick={() => {
                        setSelectedLink(link.name);
                        setDropdownOpen(false);
                        router.push(link.path);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      {link.name}
                    </button>
                  ))}

                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      router.push("/");
                    }}
                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                  >
                    Logout
                  </button>

                </div>
              )}

            </div>
          </div>
        </div>

        <div className="lg:col-span-3">{children}</div>

      </div>
    </div>
  );
}

// "use client"

// import { useEffect, useState } from "react"
// import { supabase } from "@/lib/supabase/client"
// import { useRouter, usePathname } from "next/navigation"
// import Link from "next/link"
// import { FiCamera } from "react-icons/fi"

// export default function AccountLayout({ children }: { children: React.ReactNode }) {
//   const links = [
//     { name: "Account Details", path: "/pages/account" },
//     { name: "Address", path: "/pages/account/address" },
//     { name: "Orders", path: "/pages/account/order" },
//     { name: "Wishlist", path: "/pages/account/wishlist" },
//   ]

//   const [user, setUser] = useState<any>(null)
//   const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
//   const [dropdownOpen, setDropdownOpen] = useState(false)
//   const [selectedLink, setSelectedLink] = useState(links[0].name)

//   const router = useRouter()
//   const pathname = usePathname()

//   // Fetch user + avatar on mount
//   useEffect(() => {
//     const fetchUser = async () => {
//       const { data: { user }, error } = await supabase.auth.getUser()
//       if (error) {
//         alert(error.message)
//         return
//       }
//       if (!user) {
//         router.push("/signin")
//         return
//       }

//       setUser(user)

//       // Load avatar from metadata
//       if (user.user_metadata?.avatar_url) {
//         const { data } = supabase.storage.from("avatars").getPublicUrl(user.user_metadata.avatar_url)
//         setAvatarUrl(data.publicUrl)
//       }
//     }
//     fetchUser()
//   }, [router])

//   // Handle avatar upload
//   const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (!file || !user) return

//     const fileExt = file.name.split(".").pop()
//     const fileName = `${user.id}.${fileExt}`
//     const filePath = `avatars/${fileName}`

//     const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true })
//     if (uploadError) {
//       alert("Upload failed: " + uploadError.message)
//       return
//     }

//     const { error: updateError } = await supabase.auth.updateUser({
//       data: { avatar_url: filePath }
//     })
//     if (updateError) {
//       alert("Failed to update avatar: " + updateError.message)
//       return
//     }

//     const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)
//     setAvatarUrl(data.publicUrl)
//   }

//   if (!user) return <p className="p-10">Loading...</p>

//   const active = "font-semibold text-black border-b-2 border-black"
//   const inactive = "text-gray-600"

//   return (
//     <div className="px-4 lg:px-30 py-16">
//       <h1 className="text-4xl font-semibold mb-10 text-center">My Account</h1>

//       <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
//         <div className="hidden lg:flex flex-col bg-gray-100 p-6 rounded-lg h-fit">
//           <div className="flex flex-col items-center py-4 relative">
//             <div className="relative w-16 h-16 rounded-full overflow-hidden flex items-center justify-center bg-black text-white text-xl font-semibold mb-4">
//               {avatarUrl ? (
//                 <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
//               ) : (
//                 user.email?.charAt(0).toUpperCase()
//               )}
//               {/* Camera icon */}
//               <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 cursor-pointer border">
//                 <FiCamera className="text-black" />
//                 <input
//                   type="file"
//                   accept="image/*"
//                   className="hidden"
//                   onChange={handleAvatarChange}
//                 />
//               </label>
//             </div>
//             <p className="font-semibold mb-6 break-words text-center">
//               {user.user_metadata?.name || user.email}
//             </p>
//           </div>

//           <div className="space-y-4 flex flex-col">
//             {links.map((link) => (
//               <Link
//                 key={link.path}
//                 href={link.path}
//                 className={pathname === link.path ? active : inactive}
//               >
//                 {link.name}
//               </Link>
//             ))}

//             <p
//               className="cursor-pointer text-red-500"
//               onClick={async () => {
//                 await supabase.auth.signOut()
//                 router.push("/")
//               }}
//             >
//               Logout
//             </p>
//           </div>
//         </div>

//         {/* Mobile Dropdown */}
//         <div className="lg:hidden w-full">
//           <div className="flex flex-col items-center bg-gray-100 p-4 rounded-lg mb-6">
//             <div className="relative w-16 h-16 rounded-full overflow-hidden flex items-center justify-center bg-black text-white text-xl font-semibold mb-4">
//               {avatarUrl ? (
//                 <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
//               ) : (
//                 user.email?.charAt(0).toUpperCase()
//               )}
//               <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 cursor-pointer border">
//                 <FiCamera className="text-black" />
//                 <input
//                   type="file"
//                   accept="image/*"
//                   className="hidden"
//                   onChange={handleAvatarChange}
//                 />
//               </label>
//             </div>
//             <p className="font-semibold mb-4 break-words text-center">
//               {user.user_metadata?.name || user.email}
//             </p>

//             <div className="relative w-full">
//               <button
//                 onClick={() => setDropdownOpen(!dropdownOpen)}
//                 className="w-full border-3 border-gray-500 px-4 py-3 rounded-lg flex justify-between items-center"
//               >
//                 <span>{selectedLink}</span>
//                 <span className="ml-2">▾</span>
//               </button>

//               {dropdownOpen && (
//                 <div className="absolute mt-2 w-full bg-white border rounded shadow-lg z-10">
//                   {links.map((link) => (
//                     <button
//                       key={link.path}
//                       onClick={() => {
//                         setSelectedLink(link.name)
//                         setDropdownOpen(false)
//                         router.push(link.path)
//                       }}
//                       className="w-full text-left px-4 py-2 hover:bg-gray-100"
//                     >
//                       {link.name}
//                     </button>
//                   ))}

//                   <button
//                     onClick={async () => {
//                       await supabase.auth.signOut()
//                       router.push("/")
//                     }}
//                     className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
//                   >
//                     Logout
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="lg:col-span-3">{children}</div>
//       </div>
//     </div>
//   )
// }