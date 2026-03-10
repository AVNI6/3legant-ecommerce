// "use client";
// import CartDrawer from "@/sections/cart/CartDrawer"
// import Link from "next/link";
// import Image from "next/image";
// import { CiSearch } from "react-icons/ci";
// import { RiAccountCircleLine } from "react-icons/ri";
// import { TbShoppingBag } from "react-icons/tb";
// import { GiHamburgerMenu } from "react-icons/gi";
// import { RxCross1 } from "react-icons/rx";
// import { useState } from "react";
// import { APP_ROUTE } from "@/constants/AppRoutes";

// const Navbar = () => {
//   const [open, setOpen] = useState(false);

//   const navLinks = [
//     { name: "Home", href: "/" },
//     { name: "Shop", href: APP_ROUTE.product },
//     { name: "Product", href:'/'},
//     { name: "Contact Us", href: APP_ROUTE.contact },
//   ];

//   const iconLinks = [
//     { icon: <CiSearch />, href: null, hideOnMobile: true },
//     { icon: <RiAccountCircleLine />, href: APP_ROUTE.signup, hideOnMobile: true },
//     { icon: <TbShoppingBag />, href: APP_ROUTE.cart, hideOnMobile: false },
//   ];

//   return (
//     <>
//       <header className="w-full px-5 sm:px-10 lg:px-30 py-5 flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <button className="sm:hidden text-2xl" onClick={() => setOpen(true)}>
//             <GiHamburgerMenu />
//           </button>
//           <Image src="/3legoot.png" width={110} height={40} alt="Logo" priority />
//         </div>

//         <nav className="hidden sm:flex gap-8 font-medium">
//           {navLinks.map((link) => (
//             <Link key={link.name} href={link.href}>
//               {link.name}
//             </Link>
//           ))}
//         </nav>

//         <div className="flex gap-5 text-2xl">
//           {iconLinks.map((iconItem, idx) =>
//             iconItem.href ? (
//               <Link key={idx} href={iconItem.href}>
//                 <div className={`${iconItem.hideOnMobile ? "hidden sm:block" : ""} cursor-pointer`}>
//                   {iconItem.icon}
//                 </div>
//               </Link>
//             ) : (
//               <div key={idx} className={`${iconItem.hideOnMobile ? "hidden sm:block" : ""} cursor-pointer`}>
//                 {iconItem.icon}
//               </div>
//             )
//           )}
//         </div>
//       </header>

//       {open && <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)} />}

//       <div className={`fixed top-0 left-0 h-full w-[280px] bg-white z-50 shadow-lg transform transition-transform duration-300  ${open ? "translate-x-0" : "-translate-x-full"}`} >
//         <div className="flex justify-end p-4">
//           <button onClick={() => setOpen(false)} className="text-2xl">
//             <RxCross1 />
//           </button>
//         </div>

//         <nav className="flex flex-col gap-6 px-6 text-lg font-medium">
//           {navLinks.map((link) => (
//             <Link key={link.name} href={link.href} onClick={() => setOpen(false)}>
//               {link.name}
//             </Link>
//           ))}
//         </nav>

//         <div className="flex gap-6 px-6 mt-10 text-2xl">
//           {iconLinks.map((iconItem, idx) =>
//             iconItem.href ? (
//               <Link key={idx} href={iconItem.href} onClick={() => setOpen(false)}>
//                 <div>{iconItem.icon}</div>
//               </Link>
//             ) : (
//               <div key={idx}>{iconItem.icon}</div>
//             )
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default Navbar;


"use client"
import { supabase } from "@/lib/supabase/client"
import CartDrawer from "@/sections/cart/CartDrawer"
import Link from "next/link"
import Image from "next/image"
import { CiSearch } from "react-icons/ci"
import { RiAccountCircleLine } from "react-icons/ri"
import { TbShoppingBag } from "react-icons/tb"
import { GiHamburgerMenu } from "react-icons/gi"
import { RxCross1 } from "react-icons/rx"
import { useEffect, useState } from "react"
import { APP_ROUTE } from "@/constants/AppRoutes"
import { useCart } from "@/sections/cart/context/CartContext"
import { LuSearch } from "react-icons/lu"
import { GoHeart } from "react-icons/go"
import { IoLogoFacebook, IoLogoInstagram, IoLogoYoutube } from "react-icons/io"
import { FaYoutube } from "react-icons/fa6"
import { FiYoutube } from "react-icons/fi"
import { SlSocialFacebook } from "react-icons/sl"

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const { cartItems } = useCart()

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: APP_ROUTE.product },
    { name: "Product", href: "/" },
    { name: "Contact Us", href: APP_ROUTE.contact },
  ]
  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user ?? null)
    }

    fetchSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])


  return (
    <>
      <header className="w-full px-5 sm:px-10 lg:px-30 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="sm:hidden text-2xl" onClick={() => setOpen(true)}>
            <GiHamburgerMenu />
          </button>

          <Image src="/3legoot.png" width={110} height={40} alt="Logo" priority />
        </div>

        <nav className="hidden sm:flex gap-8 font-medium">
          {navLinks.map(link => (
            <Link key={link.name} href={link.href}>
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex gap-5 text-2xl items-center">
          <div className="hidden sm:block cursor-pointer">
            <CiSearch />
          </div>

          <div className="hidden sm:block font-space">
            {user ? (
              <Link href={APP_ROUTE.account}>
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-semibold cursor-pointer">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              </Link>
            ) : (
              <Link href={APP_ROUTE.signup}>
                <RiAccountCircleLine className="cursor-pointer" />
              </Link>
            )}
          </div>

          <div className="flex gap-1 items-center cursor-pointer" onClick={() => setIsCartOpen(true)}  >
            <TbShoppingBag />
            {cartItems.length > 0 && (
              <span className="flex items-center bg-black text-white text-xs px-2 py-[4px] rounded-full">
                {cartItems.length}
              </span>
            )}
          </div>
        </div>
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </header>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)} />
      )}
      <div className={`fixed top-0 left-0 h-screen max-w-[330px] w-[80%] bg-white z-50 shadow-lg transform transition-transform duration-300 
      ${open ? "translate-x-0" : "-translate-x-full"
        }`} >
        <div className="flex  justify-between p-4">
          <Image src="/3legoot.png" width={100} height={24} alt="Logo" priority />
          <button onClick={() => setOpen(false)} className="text-2xl">
            <RxCross1 />
          </button>
        </div>
        <div className="flex border rounded p-2 gap-2 items-center mx-6 ">
          <LuSearch />
          <input placeholder="Search" className="w-full" />
        </div>

        <div className="p-6 flex flex-col justify-between h-[calc(100%-100px)]">
          <nav className="flex flex-col gap-6  text-lg font-medium">
            {navLinks.map(link => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setOpen(false)}>
                {link.name}
                <hr className="mt-1 text-gray-300" />
              </Link>

            ))}
          </nav>
          <div className="text-[18px] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[#6C7275] font-medium">Cart</p>
              <div onClick={() => {
                setIsCartOpen(true)
                setOpen(false)
              }}>
                <TbShoppingBag size={25} />
                {cartItems.length > 0 && (
                  <span className=" bg-black text-white text-xs px-2 py-[2px] rounded-full">
                    {cartItems.length}
                  </span>
                )}</div>
            </div>
            <hr className="text-gray-300" />
            <div className="flex items-center justify-between">
              <p className="text-[#6C7275] font-medium">Wishlist</p>
              <GoHeart size={25} />
            </div>
            <hr className="text-gray-300" />
            <Link href={APP_ROUTE.signin} className="bg-black text-white p-2 rounded-md my-5">Signin</Link>
            <div className="flex items-center gap-4 text-[30px]">
              <IoLogoInstagram />
              <SlSocialFacebook />
              <FiYoutube />
            </div>
          </div>

        </div>


        <div className="flex gap-6 p-6 mt-10 text-2xl items-center">
          <div className="hidden sm:block">
            {user ? (
              <Link href={APP_ROUTE.account}>
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-semibold cursor-pointer">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              </Link>
            ) : (
              <Link href={APP_ROUTE.signup}>
                <RiAccountCircleLine className="cursor-pointer" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar