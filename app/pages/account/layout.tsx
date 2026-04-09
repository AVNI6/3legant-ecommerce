"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { AccountLayoutSkeleton } from "@/components/ui/skeleton";
import Avatar from "./Avatar";
import { useAppSelector } from "@/store/hooks";
import Modal from "@/components/ui/Modal";
import { useClickOutside } from "@/hooks/use-click-outside";

export default function AccountLayout({ children }: { children: React.ReactNode }) {

	const links = [
		{ name: "Account Details", path: "/pages/account" },
		{ name: "Address", path: "/pages/account/address" },
		{ name: "Orders", path: "/pages/account/order" },
		{ name: "Wishlist", path: "/pages/account/wishlist" },
	];

	const { user, loading } = useAppSelector(state => state.auth);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [showLogoutModal, setShowLogoutModal] = useState(false);

	const dropdownRef = useClickOutside(() => {
		if (dropdownOpen) setDropdownOpen(false);
	});

	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (!loading && !user) {
			if (!pathname.includes("/signin")) {
				router.push("/signin");
			}
		}
	}, [user, loading, router, pathname]);

	if (loading || !user) return <AccountLayoutSkeleton />;

	const active = "font-semibold text-black border-b-2 border-black";
	const inactive = "text-gray-600 hover:text-black";

	const currentLinkName = links.find(l => l.path === pathname)?.name || "Menu";

	return (
		<div className="px-4 lg:px-30 py-5">
			<div className="lg:hidden mb-6">
				<Link href="/" className="flex items-center gap-1 text-[#6C7275] hover:text-black transition-colors text-sm font-medium">
					<span className="text-base">‹</span> back
				</Link>
			</div>

			<h1 className="text-3xl sm:text-4xl font-semibold lg:my-8 my-5 text-center">My Account</h1>

			<div className="flex flex-col lg:flex-row w-full gap-10">
				<div className="w-1/4 hidden lg:flex flex-col bg-gray-100 p-6 rounded-lg h-fit sticky top-40">
					<div className="flex flex-col items-center py-4 relative">
						<Avatar
							uid={user.id}
							url={user.user_metadata?.avatar_url}
							size={80}
							fallbackName={user.user_metadata?.name || user.email}
						/>
						<p className="font-semibold mb-6 mt-4 break-words text-center">
							{user?.user_metadata?.name || user.email}
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

						<button
							className="text-red-500 text-left font-medium hover:underline transition-colors w-fit"
							onClick={() => setShowLogoutModal(true)}
						>
							Logout
						</button>
					</div>
				</div>

				<div className="lg:hidden flex flex-col items-center w-full">
					<div className="flex flex-col items-center mb-8">
						<Avatar
							uid={user.id}
							url={user.user_metadata?.avatar_url}
							size={80}
							fallbackName={user.user_metadata?.name || user.email}
						/>
						<p className="font-bold text-xl mt-4">{user?.user_metadata?.name || user.email?.split('@')[0]}</p>
					</div>

					<div className="relative w-full" ref={dropdownRef}>
						<button
							onClick={() => setDropdownOpen(!dropdownOpen)}
							className="w-full border-2 border-[#6C7275] px-4 py-3.5 rounded-lg flex justify-between items-center text-sm font-semibold text-gray-900 bg-white"
						>
							<span>{currentLinkName}</span>
							<span className={`transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}>▾</span>
						</button>

						{dropdownOpen && (
							<div className="absolute mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
								<div className="py-2">
									{links.map((link) => (
										<button
											key={link.path}
											onClick={() => {
												setDropdownOpen(false);
												router.push(link.path);
											}}
											className={`w-full text-left px-5 py-3.5 text-sm transition-colors ${pathname === link.path ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"
												}`}
										>
											{link.name}
										</button>
									))}

									<button
										onClick={() => setShowLogoutModal(true)}
										className="w-full text-left px-5 py-3.5 text-sm font-bold text-red-500 hover:bg-red-50 border-t border-gray-50 mt-1"
									>
										Logout
									</button>
								</div>
							</div>
						)}
					</div>
				</div>

				<div className="lg:w-3/4 w-full ">{children}</div>
			</div>

			<Modal
				isOpen={showLogoutModal}
				onClose={() => setShowLogoutModal(false)}
				title="Log Out"
			>
				<div className="space-y-6 flex flex-col items-center text-center">
					<div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-2">
						<svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
						</svg>
					</div>
					<div className="space-y-2">
						<h4 className="text-xl font-bold text-gray-900">Log Out?</h4>
						<p className="text-gray-500 font-medium">Are you sure you want to log out of your account?</p>
					</div>
					<div className="flex gap-3 w-full pt-4">
						<button
							onClick={() => setShowLogoutModal(false)}
							className="flex-1 px-6 py-3.5 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all text-gray-500"
						>
							Cancel
						</button>
						<button
							onClick={async () => {
								await supabase.auth.signOut();
								setShowLogoutModal(false);
								router.push("/");
							}}
							className="flex-1 px-6 py-3.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg active:scale-95"
						>
							Log Out
						</button>
					</div>
				</div>
			</Modal>
		</div>
	);
}
