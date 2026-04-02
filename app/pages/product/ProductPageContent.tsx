"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSort, setGrid, incrementVisibleCount, setItems } from "@/store/slices/productSlice";
import Products from "@/components/products";
import SortBar from "@/app/pages/product/SortBar";
import FilterSidebar from "@/components/FilterSidebar";
import { useSearchParams, useRouter } from "next/navigation";
import { APP_ROUTE } from "@/constants/AppRoutes";

export default function ProductPageContent({ initialProducts = [] }: { initialProducts?: any[] }) {
  const { items: reduxProducts, loading: reduxLoading, sort, grid, visibleCount, initialized } = useAppSelector((state: any) => state.products);
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();
  const gridFromURL = searchParams.get("grid");
  const categoryFromURL = searchParams.get("category");

  // Sync grid state from URL on mount
  useEffect(() => {
    if (gridFromURL && gridFromURL !== grid) {
      dispatch(setGrid(gridFromURL));
    }
  }, [gridFromURL, dispatch, grid]);

  const handleGridChange = useCallback((gridVal: string) => {
    dispatch(setGrid(gridVal));
    const params = new URLSearchParams(window.location.search);
    params.set("grid", gridVal);
    router.push(`${window.location.pathname}?${params.toString()}`, { scroll: false });
  }, [dispatch, router]);

  // Robust hydration: If server provides more products than currently in Redux, update the store.
  useEffect(() => {
    if (initialProducts.length > 0) {
      if (!initialized || reduxProducts.length < initialProducts.length) {
        console.log(`Hydrating shop: initial(${initialProducts.length}) vs redux(${reduxProducts.length})`);
        dispatch(setItems(initialProducts));
      }
    }
  }, [initialProducts, initialized, dispatch, reduxProducts.length]);

  // Use the combined set of products
  const products = useMemo(() => {
    if (initialProducts.length > reduxProducts.length) return initialProducts;
    return reduxProducts.length > 0 ? reduxProducts : initialProducts;
  }, [reduxProducts, initialProducts]);
  const isLoading = !initialized || reduxLoading;

  const [selectedCategory, setSelectedCategory] = useState(categoryFromURL || "All Rooms");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const PRODUCTS_INCREMENT = 6;

  useEffect(() => {
    if (categoryFromURL) {
      setSelectedCategory(categoryFromURL);
    }
  }, [categoryFromURL]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const lastWidth = useRef<number | null>(null);

  useEffect(() => {
    if (!mounted) return;

    const handleResize = () => {
      const width = window.innerWidth;
      const wasDesktop = lastWidth.current === null ? null : lastWidth.current >= 1024;
      const isDesktop = width >= 1024;

      if (!gridFromURL || (lastWidth.current !== null && wasDesktop !== isDesktop)) {
        dispatch(setGrid(isDesktop ? "one" : "three"));
      }
      lastWidth.current = width;
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch, mounted, gridFromURL]);

  const filteredProducts = useMemo(() => {
    // Show all products on the main shop page
    let items = [...products];

    if (selectedCategory !== "All Rooms") {
      items = items.filter((p: any) => p.category === selectedCategory);
    }

    if (selectedPrice !== "all") {
      items = items.filter((p: any) => {
        const price = p.price;
        if (selectedPrice === "0-99") return price <= 99;
        if (selectedPrice === "100-199") return price >= 100 && price <= 199;
        if (selectedPrice === "200-299") return price >= 200 && price <= 299;
        if (selectedPrice === "300-399") return price >= 300 && price <= 399;
        if (selectedPrice === "400+") return price >= 400;
        return true;
      });
    }

    if (sort === "low") items.sort((a: any, b: any) => a.price - b.price);
    if (sort === "high") items.sort((a: any, b: any) => b.price - a.price);

    if (sort === "newest") {
      items.sort((a: any, b: any) => {
        try {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        } catch {
          return 0;
        }
      });
    }

    if (sort === "default") {
      items.sort((a: any, b: any) => {
        const pseudoRandomA = (a.variant_id * 89) % 100;
        const pseudoRandomB = (b.variant_id * 89) % 100;
        return pseudoRandomA - pseudoRandomB;
      });
    }

    return items;
  }, [products, selectedCategory, selectedPrice, sort]);

  const uniqueProducts = useMemo(() => {
    const seen = new Set();
    return filteredProducts.filter((p: any) => {
      const key = `${p.id}-${p.variant_id || 0}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [filteredProducts]);

  const visibleProducts = uniqueProducts.slice(0, visibleCount);

  const handleLoadMore = () => {
    dispatch(incrementVisibleCount(PRODUCTS_INCREMENT));
  };

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handlePriceChange = useCallback((price: string) => {
    setSelectedPrice(price);
  }, []);


  const handleSortChange = useCallback((sortVal: string) => {
    dispatch(setSort(sortVal));
  }, [dispatch]);

  return (
    <div className="px-4 sm:px-10 lg:px-30">
      <div className="relative w-full h-[320px] lg:h-[392px] mb-10 overflow-hidden">
        <Image
          src="/products/productHome.png"
          alt="Banner"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-4 bg-black/5 px-6">
          <div className="flex items-center gap-4 text-xs md:text-sm font-medium">
            <Link href={APP_ROUTE.home} className="text-gray-500 hover:text-black">Home</Link>
            <span className="text-gray-500">&gt;</span>
            <span className="text-black">Shop</span>
          </div>
          <h1 className="text-[34px] md:text-[44px] lg:text-[54px] font-medium leading-none tracking-tight text-black">
            Our Shop
          </h1>
          <p className="text-[14px] md:text-[16px] lg:text-[20px] text-gray-600 max-w-[500px]">
            Let&apos;s design the place you always imagined.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 mb-0">
        {grid === "one" && (
          <div className="hidden lg:block lg:w-[262px] flex-shrink-0">
            <FilterSidebar
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedPrice={selectedPrice}
              setSelectedPrice={setSelectedPrice}
            />
          </div>
        )}

        <div className="flex-1">
          <SortBar
            grid={grid}
            setGrid={handleGridChange}
            sort={sort}
            setSort={handleSortChange}
            selectedCategory={selectedCategory}
            setSelectedCategory={handleCategoryChange}
            selectedPrice={selectedPrice}
            setSelectedPrice={handlePriceChange}
          />

          {/* Products component handles its own mounting and loading internally */}
          <Products products={visibleProducts} grid={grid} isLoading={isLoading} />

          {!isLoading && uniqueProducts.length > 0 && (
            <div className="flex justify-center my-0 md:my-10">
              {visibleCount < uniqueProducts.length ? (
                <button
                  onClick={handleLoadMore}
                  className="border rounded-full px-6 min-[375px]:px-10 py-2 min-[375px]:py-3 hover:bg-gray-100 active:scale-[0.98] transition text-sm min-[375px]:text-base font-medium"
                >
                  Show More
                </button>
              ) : (
                <button
                  disabled
                  className="border border-gray-200 text-gray-400 rounded-full px-6 min-[375px]:px-10 py-2 min-[375px]:py-3 bg-gray-50 text-sm min-[375px]:text-base font-medium cursor-not-allowed"
                >
                  All Products Loaded
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
