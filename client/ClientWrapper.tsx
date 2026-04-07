"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import NotificationWrapper from "../client/NotificationWrapper";
import { APP_ROUTE } from "@/constants/AppRoutes";
import dynamic from "next/dynamic";

const Navbar = dynamic(() => import("../components/Navbar"), { ssr: false });
const Footer = dynamic(() => import("../components/footer"), { ssr: false });

interface Props {
    children: React.ReactNode;
}

export default function ClientWrapper({ children }: Props) {
    const pathname = usePathname();

    const noLayoutPages = [
        APP_ROUTE.signin,
        APP_ROUTE.signup,
        APP_ROUTE.forgotPassword,
        APP_ROUTE.resetPassword
    ];

    const isAdminRoute = pathname?.startsWith("/pages/admin") ?? false;
    const showLayout = !noLayoutPages.includes(pathname) && !isAdminRoute;

    const fullWidthPages = [
        APP_ROUTE.signin,
        APP_ROUTE.signup,
        APP_ROUTE.forgotPassword,
        APP_ROUTE.resetPassword,
    ];

    // Normalize pathname to remove trailing slash for comparison
    const normalizedPathname = pathname?.replace(/\/$/, "") || "";
    const isFullWidth = fullWidthPages.includes(normalizedPathname);

    return (
        <div className="flex flex-col min-h-screen">
            {showLayout && <NotificationWrapper />}
            {showLayout && <Navbar />}
            <main className={`flex-grow ${isFullWidth ? "" : "max-w-[1600px] mx-auto w-full"}`}>
                {children}
            </main>
            {showLayout && <Footer />}
        </div>
    );
}