"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSort, setGrid } from "@/store/slices/productSlice";
import Products from "@/components/products";
import SortBar from "@/app/pages/product/SortBar";
import FilterSidebar from "@/components/FilterSidebar";
import { useSearchParams, useRouter } from "next/navigation";
import { APP_ROUTE } from "@/constants/AppRoutes";
import { supabase } from "@/lib/supabase/client";
import { mapProducts } from "@/lib/supabase/productMapping";

const INITIAL_LIMIT = 12;
const INCREMENT_LIMIT = 12;

export default function ProductPageContent({ initialProducts = [] }: { initialProducts?: any[] }) {
  const mappedInitial = useMemo(() => mapProducts(initialProducts), [initialProducts]);
  const { sort, grid } = useAppSelector((state: any) => state.products);
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlCategory = searchParams.get("category") || "All Rooms";

  // State
  const [items, setItems] = useState<any[]>(mappedInitial);
  const [visibleCount, setVisibleCount] = useState(INITIAL_LIMIT);
  const [isLoading, setIsLoading] = useState(mappedInitial.length === 0);
  const [itemsOffset, setItemsOffset] = useState(mappedInitial.length);
  const [hasMoreInDB, setHasMoreInDB] = useState(mappedInitial.length < INITIAL_LIMIT ? false : true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [selectedPrice, setSelectedPrice] = useState<string[]>(["all", "0-99", "100-199", "200-299", "300-399", "400+"]);

  // Fetch logic
  const fetchProductsBatch = useCallback(async (limit: number, currentOffset: number, category: string, priceFilters: string[]) => {
    try {
      // 1. Fetch from product_variant to ensure CARD-BASED pagination (12 cards per row/batch)
      let query = supabase
        .from("product_variant")
        .select(`
          id, color, price, old_price, stock, thumbnails, color_images,
          products!inner (
            id, name, category, image, measurements, is_new, created_at, description, is_deleted, validation_till
          )
        `)
        .eq("products.is_deleted", false);

      // Apply Category Filter on the joined product
      if (category !== "All Rooms") {
        query = query.eq("products.category", category);
      }

      // Apply Price Filters
      if (priceFilters.length > 0 && !priceFilters.includes("all")) {
        const filters = priceFilters.map(range => {
          if (range === "0-99") return { min: 0, max: 99 };
          if (range === "100-199") return { min: 100, max: 199 };
          if (range === "200-299") return { min: 200, max: 299 };
          if (range === "300-399") return { min: 300, max: 399 };
          if (range === "400+") return { min: 400, max: 1000000 };
          return null;
        }).filter(Boolean);

        if (filters.length > 0) {
          // Use OR logic for multiple ranges: (price >= min1 AND price <= max1) OR (price >= min2 AND price <= max2)
          const orFilter = filters.map(f => `and(price.gte.${f!.min},price.lte.${f!.max})`).join(",");
          query = query.or(orFilter);
        }
      }

      // Order by product creation then variant ID for consistency
      const { data: variantsData, error: variantError } = await query
        .order("id", { ascending: false })
        .range(currentOffset, currentOffset + limit - 1);

      if (variantError) throw variantError;

      const productIds = Array.from(new Set((variantsData || []).map((v: any) => v.products.id)));

      // Parallel fetch for collective review stats
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("product_id, rating")
        .in("product_id", productIds);

      if (reviewsError) {
        console.error("Failed to load review stats:", reviewsError);
      }

      // Group reviews by product_id
      const groupedReviews: Record<number, { sum: number; count: number }> = {};
      (reviewsData ?? []).forEach(row => {
        const pid = Number(row.product_id);
        if (!groupedReviews[pid]) groupedReviews[pid] = { sum: 0, count: 0 };
        groupedReviews[pid].sum += Number(row.rating ?? 0);
        groupedReviews[pid].count += 1;
      });

      // Transform variant data into the standard product object format the UI expects
      const mappedItems = (variantsData || []).map((v: any) => {
        const p = v.products;
        const pid = p.id;
        const reviewEntry = groupedReviews[pid];

        return {
          id: pid,
          variant_id: v.id,
          name: p.name,
          category: p.category,
          price: v.price || 0,
          old_price: v.old_price || 0,
          image: (v.color_images && Array.isArray(v.color_images) && v.color_images[0]) || p.image,
          is_new: p.is_new,
          created_at: p.created_at,
          description: p.description,
          measurements: p.measurements,
          color: v.color,
          validation_till: p.validation_till,
          stock: Number(v.stock ?? 0),
          reviewStats: reviewEntry
            ? { rating: reviewEntry.sum / reviewEntry.count, count: reviewEntry.count }
            : { rating: 0, count: 0 }
        };
      });

      // Shuffle the results within this batch for dynamic feel
      const shuffled = [...mappedItems];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      return {
        items: shuffled,
        rawCount: variantsData?.length || 0
      };
    } catch (err) {
      console.error("Fetch error:", err);
      return { items: [], rawCount: 0 };
    }
  }, []);

  const fetchAttemptedRef = useRef(false);

  // Sync URL parameters on mount
  useEffect(() => {
    const gridFromURL = searchParams.get("grid");
    const categoryFromURL = searchParams.get("category");
    const sortFromURL = searchParams.get("sort");

    if (gridFromURL && ["one", "two", "three", "four"].includes(gridFromURL) && gridFromURL !== grid) {
      dispatch(setGrid(gridFromURL));
    }

    if (categoryFromURL && categoryFromURL !== selectedCategory) {
      setSelectedCategory(categoryFromURL);
    }

    if (sortFromURL && sortFromURL !== sort) {
      dispatch(setSort(sortFromURL));
    }
  }, [searchParams, dispatch]); // Only run when URL params change or on mount


  // Sync initial load and filter changes (Deduplicated)
  useEffect(() => {
    // 1. Initial Hydration Guard
    if (mappedInitial.length > 0 && selectedCategory === "All Rooms" && !fetchAttemptedRef.current) {
      setIsLoading(false);
      return;
    }

    // 2. Fetch Logic
    const initFetch = async () => {
      // If we already have items and filters haven't meaningfully changed compared to initial, skip
      if (fetchAttemptedRef.current && selectedCategory === "All Rooms" && selectedPrice.length === 6) {
        return;
      }

      fetchAttemptedRef.current = true;
      setIsLoading(true);
      setItems([]);

      const { items: batchItems, rawCount } = await fetchProductsBatch(INITIAL_LIMIT, 0, selectedCategory, selectedPrice);

      setItems(batchItems);
      setItemsOffset(rawCount);
      setHasMoreInDB(rawCount === INITIAL_LIMIT);
      setVisibleCount(batchItems.length);
      setIsLoading(false);
    };
    initFetch();
  }, [fetchProductsBatch, selectedCategory, selectedPrice, mappedInitial.length]);



  useEffect(() => {
    const handleResize = () => {
      // Only force grid "three" (2 columns) if we are on mobile AND 
      // the current grid is a desktop-only grid (one or two).
      // This prevents overriding a user's manual selection of "four" (List View) on mobile.
      if (window.innerWidth < 1024) {
        if (grid === "one" || grid === "two") {
          dispatch(setGrid("three"));
        }
      }
    };

    // We don't call handleResize() immediately here because we want to 
    // respect whatever came from the URL or previous state first.
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch, grid]);


  // Pagination
  const handleLoadMore = async () => {
    if (isFetchingMore) return;
    setIsFetchingMore(true);

    const { items: batchItems, rawCount } = await fetchProductsBatch(INCREMENT_LIMIT, itemsOffset, selectedCategory, selectedPrice);

    setItems((prev) => [...prev, ...batchItems]);
    setItemsOffset((prev) => prev + rawCount);
    setHasMoreInDB(rawCount === INCREMENT_LIMIT);
    setVisibleCount((prev) => prev + batchItems.length);
    setIsFetchingMore(false);
  };

  // Handlers
  const handleGridChange = useCallback((gridVal: string) => {
    dispatch(setGrid(gridVal));
    const params = new URLSearchParams(window.location.search);
    params.set("grid", gridVal);
    router.push(`${window.location.pathname}?${params.toString()}`, { scroll: false });
  }, [dispatch, router]);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handlePriceChange = useCallback((price: string | string[]) => {
    if (Array.isArray(price)) {
      setSelectedPrice(price);
      return;
    }
    if (price === "all") {
      setSelectedPrice((prev) => {
        const specificPrices = ["0-99", "100-199", "200-299", "300-399", "400+"];
        const isCurrentlyAll = prev.includes("all") && specificPrices.every(p => prev.includes(p));
        return isCurrentlyAll ? [] : ["all", ...specificPrices];
      });
    } else {
      setSelectedPrice((prev) => {
        const brands = prev.filter((p) => p !== "all");
        const alreadySelected = brands.includes(price);
        let next: string[];
        if (alreadySelected) {
          next = brands.filter((p) => p !== price);
        } else {
          next = [...brands, price];
        }
        const specificPrices = ["0-99", "100-199", "200-299", "300-399", "400+"];
        if (specificPrices.every(p => next.includes(p))) {
          return ["all", ...next];
        }
        return next;
      });
    }
  }, []);

  const handleSortChange = useCallback((sortVal: string) => {
    dispatch(setSort(sortVal));
    const params = new URLSearchParams(window.location.search);
    params.set("sort", sortVal);
    router.push(`${window.location.pathname}?${params.toString()}`, { scroll: false });
  }, [dispatch, router]);


  // Derived state
  const filteredProducts = useMemo(() => {
    // If no price is selected, return an empty list immediately
    if (selectedPrice.length === 0) return [];

    let list = [...items];
    if (selectedCategory !== "All Rooms") {
      list = list.filter((p: any) => p.category === selectedCategory);
    }

    // If not "all", filter by specific ranges
    if (!selectedPrice.includes("all")) {
      list = list.filter((p: any) => {
        const price = p.price;
        return selectedPrice.some(range => {
          if (range === "0-99") return price <= 99;
          if (range === "100-199") return price >= 100 && price <= 199;
          if (range === "200-299") return price >= 200 && price <= 299;
          if (range === "300-399") return price >= 300 && price <= 399;
          if (range === "400+") return price >= 400;
          return false;
        });
      });
    }

    if (sort === "low") list.sort((a: any, b: any) => a.price - b.price);
    if (sort === "high") list.sort((a: any, b: any) => b.price - a.price);

    return list;
  }, [items, selectedCategory, selectedPrice, sort]);

  const uniqueProducts = useMemo(() => {
    const seen = new Set();
    return filteredProducts.filter((p: any) => {
      const key = `${p.id}-${p.variant_id || 0}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [filteredProducts]);

  const displayedProducts = useMemo(() => {
    return uniqueProducts.slice(0, visibleCount);
  }, [uniqueProducts, visibleCount]);

  const hasMoreToShow = uniqueProducts.length > visibleCount || hasMoreInDB;

  return (
    <div className="px-4 sm:px-10 lg:px-30">
      <div className="relative w-full h-[320px] lg:h-[392px] mb-10 overflow-hidden">
        <Image
          src="/products/productHome.png"
          alt="Banner"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
          className="object-cover"
          loading="lazy"
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
              setSelectedPrice={handlePriceChange}
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

          <Products products={displayedProducts} grid={grid} isLoading={isLoading} />

          {!isLoading && uniqueProducts.length > 0 && hasMoreToShow && (
            <div className="flex justify-center my-0 md:my-10">
              <button
                onClick={handleLoadMore}
                disabled={isFetchingMore}
                className={`border rounded-full px-6 min-[375px]:px-10 py-2 min-[375px]:py-3 transition text-sm min-[375px]:text-base font-medium ${isFetchingMore ? "bg-gray-100 cursor-not-allowed text-gray-400" : "hover:bg-gray-100 active:scale-[0.98]"
                  }`}
              >
                {isFetchingMore ? "Loading..." : "Show More"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
