"use client"
import { useState, useEffect } from "react";
import BlackShopButton from "@/components/blackbutton";
import Products from "@/components/products";
import { APP_ROUTE } from "@/constants/AppRoutes";
import { supabase } from "@/lib/supabase/client";
import { mapProducts } from "@/lib/supabase/productMapping";
import { ProductType } from "@/types";

const NEW_ARRIVAL_LIMIT = 8;
const NEW_ARRIVAL_DAYS = 7;

const NewArrival = ({ initialProducts = [] }: { initialProducts?: ProductType[] }) => {
    const [products, setProducts] = useState<ProductType[]>(initialProducts);
    const [isLoading, setIsLoading] = useState(initialProducts.length === 0);

    useEffect(() => {
        if (initialProducts.length > 0) {
            return;
        }

        const fetchNewArrivals = async () => {
            setIsLoading(true);
            try {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - NEW_ARRIVAL_DAYS);
                const isoDate = sevenDaysAgo.toISOString();

                const { data, error } = await supabase
                    .from("products")
                    .select(`
                        id, name, category, image, measurements, package, is_new, validation_till, description, created_at,
                        product_variant (
                            id, color, price, old_price, stock, thumbnails, color_images
                        )
                    `)
                    .eq("is_deleted", false)
                    .gte("created_at", isoDate)
                    .order("created_at", { ascending: false })
                    .limit(NEW_ARRIVAL_LIMIT);

                if (error) throw error;
                setProducts(mapProducts(data || []));
            } catch (err) {
                console.error("New Arrival Fetch Error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNewArrivals();
    }, [initialProducts.length]);

    // Hide component if no products are new
    if (!isLoading && products.length === 0) {
        return null;
    }

    return (
        <div>
            <div className="mx-6 sm:mx-12 md:mx-10 lg:mx-30 my-10 flex justify-between">
                <h1 className="font-bold text-xl lg:text-3xl w-20">New Arrivals</h1>
                <div className="self-end" ><BlackShopButton className="text-[16px]" href={APP_ROUTE.product} /></div>
            </div>
            <div className="ml-4 sm:ml-12 md:ml-10 lg:ml-30 ">
                <Products products={products} variant="scroll" isLoading={isLoading} />
            </div>
        </div>
    );
}

export default NewArrival;
