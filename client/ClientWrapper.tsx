"use client";
import { usePathname } from "next/navigation";
import NotificationWrapper from "../client/NotificationWrapper";
import { APP_ROUTE } from "@/constants/AppRoutes";

import Navbar from "../components/Navbar";
import Footer from "../components/footer";

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