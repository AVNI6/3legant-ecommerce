import Link from "next/link";
import { IoLogoInstagram } from "react-icons/io";
import { SlSocialFacebook } from "react-icons/sl";
import { CiYoutube } from "react-icons/ci";
import { APP_ROUTE } from "@/constants/AppRoutes";
const Footer = () => {
	return (
		<div className="bg-[#232627] text-white p-8 lg:py-13 lg:px-30 lg:bg-black">
			<div className="flex flex-col lg:flex-row justify-between items-center lg:items-center gap-8 lg:gap-0">
				<div className="flex flex-col lg:flex-row lg:gap-7 items-center">
					<h3 className="font-medium text-xl lg:text-[24px]">3legant.</h3>
					<h1 className="text-[#6C7275] text-xl lg:text-2xl rotate-90 lg:rotate-0">|</h1>
					<h2 className="text-xs lg:text-base text-center lg:text-left">Gift & Decoration Store</h2>
				</div>
				<div className="flex flex-col md:flex-row items-center lg:justify-end gap-6 md:gap-10 text-xs sm:text-sm lg:text-base font-medium">
					<Link href={'/'} className="hover:text-gray-300 transition-colors">Home</Link>
					<Link href={APP_ROUTE.product} className="hover:text-gray-300 transition-colors">Shop</Link>
					<Link href={'/'} className="hover:text-gray-300 transition-colors">Product</Link>
					<Link href={APP_ROUTE.blog} className="hover:text-gray-300 transition-colors">Blog</Link>
					<Link href={APP_ROUTE.contact} className="hover:text-gray-300 transition-colors">Contact Us</Link>
				</div>
			</div>

			<div className="mt-10 flex flex-col-reverse lg:flex-row items-center justify-between border-t border-[#6C7275] pt-6 lg:pt-8 gap-8 lg:gap-0">
				<div className="flex flex-col-reverse lg:flex-row items-center gap-6 lg:gap-10 text-[10px] md:text-xs lg:text-sm text-gray-400 lg:text-white">
					<h4 className="text-center">Copyright © 2023 3legant. All rights reserved</h4>
					<div className="flex gap-6 lg:gap-10">
						<Link href="/pages/privacy-policy">
							<h2 className="font-bold hover:text-white cursor-pointer transition-colors">Privacy Policy</h2>
						</Link>
						<Link href="/pages/terms-of-use">
							<h2 className="font-bold hover:text-white cursor-pointer transition-colors">Terms of Use</h2>
						</Link>
					</div>
				</div>
				<div className="flex gap-6 text-2xl lg:text-3xl">
					<IoLogoInstagram className="hover:text-gray-300 cursor-pointer transition-transform hover:scale-110" />
					<SlSocialFacebook className="hover:text-gray-300 cursor-pointer transition-transform hover:scale-110" />
					<CiYoutube className="hover:text-gray-300 cursor-pointer transition-transform hover:scale-110" />
				</div>
			</div>
		</div>
	);
}

export default Footer;