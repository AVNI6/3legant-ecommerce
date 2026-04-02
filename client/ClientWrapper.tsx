"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/footer";
import NotificationWrapper from "../client/NotificationWrapper";
import { APP_ROUTE } from "@/constants/AppRoutes";

interface Props {
    children: React.ReactNode;
}

export default function ClientWrapper({ children }: Props) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const noLayoutPages = [
        APP_ROUTE.signin,
        APP_ROUTE.signup,
        APP_ROUTE.forgotPassword,
        APP_ROUTE.resetPassword
    ];

    const isAdminRoute = pathname?.startsWith("/pages/admin") ?? false;
    const showLayout = mounted && !noLayoutPages.includes(pathname) && !isAdminRoute;

    return (
        <>
            {showLayout && <NotificationWrapper />}
            {showLayout && <Navbar />}
            {children}
            {showLayout && <Footer />}
        </>
    );
}