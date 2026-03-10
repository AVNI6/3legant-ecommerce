"use client";

import { usePathname } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/footer";
import NotificationWrapper from "../client/NotificationWrapper";
import { CartProvider } from "../sections/cart/context/CartContext";

interface Props {
    children: React.ReactNode;
}

export default function ClientWrapper({ children }: Props) {
    const pathname = usePathname();

    const noLayoutPages = ["/pages/signin", "/pages/signup", "/pages/forgotpassword", "/pages/resetpassword"];
    const showLayout = !noLayoutPages.includes(pathname);

    return (
        <>
            {showLayout && <NotificationWrapper />}
            <CartProvider>
                {showLayout && <Navbar />}
                {children}
            </CartProvider>
            {showLayout && <Footer />}
        </>
    );
}