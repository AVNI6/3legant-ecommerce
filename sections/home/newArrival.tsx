"use client"
import BlackShopButton from "@/components/blackbutton";
import Features from "@/components/features";
import Products from "@/components/products";
import { APP_ROUTE } from "@/constants/AppRoutes";
import { features } from "@/constants/Data";
import { useProducts } from "@/lib/supabase/context/ProductContext";

const NewArrival = () => {
    const { products } = useProducts();
    return (
        <div>
            <div className="mx-6 sm:mx-12 md:mx-10 lg:mx-30 my-10 flex justify-between">
                <h1 className="font-bold text-3xl w-20">New Arrivals</h1>
                <div className="self-end" ><BlackShopButton className="text-[16px]" href={APP_ROUTE.product} /></div>

            </div>  
            <div className="ml-4 sm:ml-12 md:ml-10 lg:ml-30 ">
                 <Products products={products} variant="scroll" />
            </div>

           
            <Features />
        </div>
    );
}

export default NewArrival;