"use client"
import BlackShopButton from "@/components/blackbutton";
import Products from "@/components/products";
import { APP_ROUTE } from "@/constants/AppRoutes";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setItems } from "@/store/slices/productSlice";
import { ProductType } from "@/types";

interface NewArrivalProps {
    initialProducts?: ProductType[]
}

const NewArrival = ({ initialProducts }: NewArrivalProps) => {
    const dispatch = useAppDispatch();
    const { items: reduxProducts, loading, initialized } = useAppSelector((state: any) => state.products);

    useEffect(() => {
        if (!initialized && initialProducts && initialProducts.length > 0) {
            dispatch(setItems(initialProducts));
        }
    }, [initialized, initialProducts, dispatch]);

    const allProducts = reduxProducts.length > 0 ? reduxProducts : initialProducts;
    const products = allProducts?.filter((p: ProductType) => p.is_new) || [];
    const isProductsHydrating = !initialized && reduxProducts.length === 0;

    // Hide component if no products are new (after hydration)
    if (!loading && !isProductsHydrating && products.length === 0) {
        return null;
    }

    return (
        <div>
            <div className="mx-6 sm:mx-12 md:mx-10 lg:mx-30 my-10 flex justify-between">
                <h1 className="font-bold text-xl lg:text-3xl w-20">New Arrivals</h1>
                <div className="self-end" ><BlackShopButton className="text-[16px]" href={APP_ROUTE.product} /></div>

            </div>
            <div className="ml-4 sm:ml-12 md:ml-10 lg:ml-30 ">
                <Products products={products || []} variant="scroll" isLoading={loading || isProductsHydrating} />
            </div>
        </div>
    );
}

export default NewArrival;
