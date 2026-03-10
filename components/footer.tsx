import Link from "next/link";
import { IoLogoInstagram } from "react-icons/io";
import { SlSocialFacebook } from "react-icons/sl";
import { CiYoutube } from "react-icons/ci";
import { APP_ROUTE } from "@/constants/AppRoutes";
import App from "next/app";
const Footer = () => {
    return (
        <div className="bg-[#232627] text-white p-5 lg:py-15 lg:px-30 lg:bg-black">
            <div className="flex flex-col lg:flex-row justify-between">
                <div className="flex flex-col lg:flex-row lg:gap-7 items-center">
                    <h3 className="font-medium text-[24px]">3legant.</h3>
                    <h1 className="text-[#6C7275] text-2xl rotate-90 lg:rotate-0">|</h1>
                    <h2>Gift & Decoration Store</h2>
                </div>
                <div className="flex flex-col items-center pt-10 md:flex-row  md:justify-center lg:pt-0 lg:flex-row gap-10">
                    <Link href={'/'}>Home</Link>
                    <Link href={APP_ROUTE.product}>Shop</Link>
                    <Link href={'/'}>Product</Link>
                    <Link href={APP_ROUTE.blog}>Blog</Link>
                    <Link href={APP_ROUTE.contact}>Contact Us</Link>
                </div>
            </div>

            <div className="mt-10 mx-10 md:mx-0 flex flex-col-reverse lg:flex-row items-center justify-between border-t-2 border-[#6C7275]">
                <div className="flex flex-col-reverse items-center text-center lg:flex-row gap-10 pt-5">
                    
                    <h4>Copyright © 2023 3legant. All rights reserved</h4>
                    <div className="flex gap-10">
                        <h2 className="font-bold">Privacy Policy</h2>
                        <h2 className="font-bold">Terms of Use</h2>
                    </div>
                   
                </div>
                <div className="flex gap-5 text-3xl py-3 md:pt-5 ">
                    <IoLogoInstagram />
                    <SlSocialFacebook />
                    <CiYoutube />
                </div>
            </div>
        </div>
    );
}

export default Footer;