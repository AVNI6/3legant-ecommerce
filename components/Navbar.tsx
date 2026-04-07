"use client"
import { supabase } from "@/lib/supabase/client"
import dynamic from "next/dynamic"
import Link from "next/link"
import Image from "next/image"
import { RiAccountCircleLine } from "react-icons/ri"
import { TbShoppingBag } from "react-icons/tb"
import { GiHamburgerMenu } from "react-icons/gi"
import { RxCross1 } from "react-icons/rx"
import { APP_ROUTE } from "@/constants/AppRoutes"
import { LuSearch } from "react-icons/lu"
import { GoHeart } from "react-icons/go"
import { IoLogoFacebook, IoLogoInstagram, IoLogoYoutube } from "react-icons/io"
const ProductSearch = dynamic(() => import("./ProductSearch"), { ssr: false })
const CartDrawer = dynamic(() => import("@/sections/cart/CartDrawer"), { ssr: false })
import { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { fetchProducts } from "@/store/slices/productSlice"

const Navbar = () => {
  const dispatch = useAppDispatch()
  const { items: products, initialized: productsInitialized, loading: productsLoading } = useAppSelector((state) => state.products)
  const [open, setOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)

  const prefetchProducts = () => {
    if (!productsInitialized && !productsLoading) {
      dispatch(fetchProducts())
    }
  }

  const { user, isAdmin, adminChecked } = useAppSelector((state) => state.auth)
  const cartItems = useAppSelector((state) => state.cart.items)
  const wishlistitems = useAppSelector((state) => state.wishlist.items)

  // Prevent body scroll when drawer is open
  useEffect(() => {
    // 🧺 Catch the 'toggle-cart' event (e.g. from AddToCartButton)
    const handleToggleCart = (e: any) => {
      setIsCartOpen(e.detail?.open ?? true)
    }

    window.addEventListener('toggle-cart', handleToggleCart)

    // Cleanup on unmount
    return () => {
      window.removeEventListener('toggle-cart', handleToggleCart)
    }
  }, []) // 👈 Run once on mount to keep it listening always

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: APP_ROUTE.product },
    { name: "Blog", href: APP_ROUTE.blog },
    { name: "Contact Us", href: APP_ROUTE.contact },
  ]


  // Robust role detection using Redux state and metadata as fallbacks
  const isUserAdmin = isAdmin || user?.user_metadata?.role === "admin" || user?.app_metadata?.role === "admin"
  const accountLink = isUserAdmin ? APP_ROUTE.admindashboard : APP_ROUTE.account
  return (
    <>
      <header className="w-full sticky top-0 z-30 bg-white px-3 min-[428px]:px-4 sm:px-10 lg:px-30 py-3 sm:py-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-1.5 min-[428px]:gap-2 sm:gap-3">
          <button className="sm:hidden text-lg min-[428px]:text-xl" onClick={() => setOpen(true)}>
            <GiHamburgerMenu />
          </button>

          <Image src="/3legoot.png" width={90} height={32} alt="Logo" priority loading="eager" className="h-auto w-[75px] min-[428px]:w-[90px] sm:w-[110px]" />
        </div>

        <nav className="hidden sm:flex sm:gap-3 md:gap-6 lg:gap-8 sm:text-[13px] md:text-sm lg:text-base font-medium transition-all">
          {navLinks.map(link => (
            <Link key={link.name} href={link.href}>
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex gap-2 min-[428px]:gap-3 sm:gap-3 md:gap-5 text-lg min-[428px]:text-xl sm:text-xl md:text-2xl items-center max-[234px]:hidden transition-all">
          <div onMouseEnter={prefetchProducts} onTouchStart={prefetchProducts} onClick={prefetchProducts}>
            <ProductSearch />
          </div>
          <div className="hidden md:block font-space">
            {user ? (
              <Link href={accountLink}>
                {user.user_metadata?.avatar_url ? (
                  <Image
                    src={supabase.storage.from("avatars").getPublicUrl(user.user_metadata.avatar_url).data.publicUrl}
                    className="w-8 h-8 rounded-full border object-cover bg-gray-50 shadow-sm"
                    alt="User"
                    width={32}
                    height={32}
                  />
                ) : (
                  <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-semibold cursor-pointer">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
            ) : (
              <Link href={APP_ROUTE.signup}>
                <RiAccountCircleLine className="cursor-pointer" />
              </Link>
            )}
          </div>
          <div className="flex gap-0.5 min-[428px]:gap-1 items-center cursor-pointer" onClick={() => setIsCartOpen(true)}  >
            <TbShoppingBag />
            {cartItems?.length > 0 && (
              <span className="flex items-center justify-center bg-black text-white text-[10px] sm:text-[12px] font-bold w-5 h-5 sm:w-6 sm:h-6 p-3 rounded-full shadow-sm">
                {cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0)}
              </span>
            )}
          </div>
        </div>
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </header>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)} />
      )}
      <div className={`fixed top-0 left-0 h-[100dvh] overflow-y-auto max-w-[360px] w-[90%] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col
      ${open ? "translate-x-0" : "-translate-x-full"}`} >

        {/* Drawer Header */}
        <div className="flex justify-between items-center p-6 pb-4 shrink-0">
          <span className="text-xl font-bold tracking-tight">3legant.</span>
          <button onClick={() => setOpen(false)} className="text-2xl text-gray-400 hover:text-black transition-colors">
            <RxCross1 />
          </button>
        </div>
        <div className="flex-1 px-6 py-2 shrink-0 flex flex-col">
          <div className="relative mb-6">
            <div
              className="flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg group cursor-pointer hover:border-black transition-colors"
              onClick={() => {
                setOpen(false)
                window.dispatchEvent(new CustomEvent('toggle-search'))
              }}
            >
              <LuSearch className="text-xl text-gray-500 group-hover:text-black" />
              <span className="text-gray-400 text-sm">Search</span>
            </div>
          </div>
          <nav className="flex flex-col mb-8">
            {navLinks.map((link, index) => (
              <div key={link.name} className="flex flex-col">
                {link.name === "Shop" ? (
                  <>
                    <button
                      onClick={() => setShopOpen(!shopOpen)}
                      className="flex items-center justify-between py-4 text-sm font-semibold text-gray-900 border-b border-gray-100 hover:text-gray-600 transition-colors w-full text-left"
                    >
                      {link.name}
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${shopOpen ? 'rotate-180 text-black' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {/* Shop Sub-menu */}
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${shopOpen ? 'max-h-64 opacity-100 mt-2 pb-2' : 'max-h-0 opacity-0'}`}>
                      <Link
                        href={APP_ROUTE.product}
                        className="block py-2.5 pl-4 text-sm font-semibold text-black hover:pl-6 transition-all"
                        onClick={() => { setOpen(false); setShopOpen(false); }}
                      >
                        All Products
                      </Link>
                      {["Living Room", "Bedroom", "Kitchen", "Office"].map((sub) => (
                        <Link
                          key={sub}
                          href={`${APP_ROUTE.product}?category=${sub}`}
                          className="block py-2.5 pl-4 text-sm text-gray-500 hover:text-black hover:pl-6 transition-all"
                          onClick={() => { setOpen(false); setShopOpen(false); }}
                        >
                          {sub}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    href={link.href}
                    className="flex items-center justify-between py-4 text-sm font-semibold text-gray-900 border-b border-gray-100 hover:text-gray-600 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

        </div>

        <div className="px-6 py-6 border-t border-gray-50 bg-white mt-auto shrink-0">
          <div className="flex flex-col gap-2 mb-6">
            {/* Cart Row */}
            <div
              className="flex items-center justify-between py-2 cursor-pointer group"
              onClick={() => { setIsCartOpen(true); setOpen(false); }}
            >
              <span className="text-base font-medium text-gray-500 group-hover:text-black transition-colors">Cart</span>
              <div className="flex items-center gap-2">
                <TbShoppingBag className="text-xl" />
                <span className="bg-black text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full leading-none">
                  {cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0)}
                </span>
              </div>
            </div>
            <div className="h-[1px] bg-gray-100 w-full" />

            <div className="flex items-center justify-between py-2 cursor-pointer group">
              <span className="text-base font-medium text-gray-500 group-hover:text-black transition-colors">Wishlist</span>
              <div className="flex items-center gap-2">
                <GoHeart className="text-xl" />
                <span className="bg-black text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full leading-none">
                  {wishlistitems?.length || 0}
                </span>
              </div>
            </div>
            <div className="h-[1px] bg-gray-100 w-full" />
          </div>

          {user ? (
            <div className="flex flex-col gap-3 mb-6">
              <Link
                href={accountLink}
                className="flex items-center gap-4 p-1 rounded-lg hover:bg-gray-50 transition-colors group"
                onClick={() => setOpen(false)}
              >
                {user.user_metadata?.avatar_url ? (
                  <Image
                    src={supabase.storage.from("avatars").getPublicUrl(user.user_metadata.avatar_url).data.publicUrl}
                    className="w-12 h-12 rounded-full border object-cover bg-gray-50 shadow-sm"
                    alt="User"
                    width={48}
                    height={48}
                    loading="eager"
                    unoptimized
                    priority
                  />
                ) : (
                  <div className="w-12 h-12 bg-[#141718] text-white rounded-full flex items-center justify-center text-lg font-bold">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-gray-900 truncate">
                    {user.email?.split('@')[0]}
                  </span>
                  <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                    My Account
                  </span>
                </div>
              </Link>
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  setOpen(false)
                }}
                className="text-[10px] font-bold text-gray-400 hover:text-red-500 uppercase tracking-[0.2em] w-fit px-1 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link href={APP_ROUTE.signin} className="block w-full bg-[#141718] text-white text-center py-[12px] rounded-md font-semibold mb-6 hover:bg-black transition-colors" onClick={() => setOpen(false)}>
              Sign In
            </Link>
          )}

          <div className="flex items-center gap-6 pb-2 px-2">
            <IoLogoInstagram className="text-xl text-gray-900 cursor-pointer hover:scale-110 transition-transform" />
            <IoLogoFacebook className="text-xl text-gray-900 cursor-pointer hover:scale-110 transition-transform" />
            <IoLogoYoutube className="text-xl text-gray-900 cursor-pointer hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar