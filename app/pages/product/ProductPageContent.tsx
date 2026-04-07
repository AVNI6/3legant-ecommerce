"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSort, setGrid } from "@/store/slices/productSlice";
import Products from "@/components/products";
import SortBar from "@/app/pages/product/SortBar";
import FilterSidebar from "@/components/FilterSidebar";
import { useSearchParams } from "next/navigation";
import { APP_ROUTE } from "@/constants/AppRoutes";
import { ProductGridSkeleton } from "@/components/ui/skeleton";

const INITIAL_LIMIT = 12;
const INCREMENT_LIMIT = 12;
const PRODUCT_PAGE_CACHE_KEY = "product-page-batch-cache-v3";

type BatchFetchResult = {
  items: any[];
  sourceOffset: number;
  hasMoreInDB: boolean;
};

const inFlightBatchRequests = new Map<string, Promise<BatchFetchResult>>();

type CachedBatchState = {
  items: any[];
  visibleCount: number;
  sourceOffset: number;
  hasMoreInDB: boolean;
};

const PRICE_RANGE_VALUES = ["0-99", "100-199", "200-299", "300-399", "400+"] as const;

const readBatchCache = (): Record<string, CachedBatchState> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PRODUCT_PAGE_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const writeBatchCache = (cache: Record<string, CachedBatchState>) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PRODUCT_PAGE_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore quota/write errors for non-critical UI cache.
  }
};

export default function ProductPageContent({ initialItems = [] }: { initialItems?: any[] }) {
  const { sort, grid } = useAppSelector((state: any) => state.products);
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  const urlCategory = searchParams.get("category") || "All Rooms";

  // State
  const [items, setItems] = useState<any[]>(initialItems);
  const [visibleCount, setVisibleCount] = useState(INITIAL_LIMIT);
  const [isLoading, setIsLoading] = useState(initialItems.length === 0);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [sourceOffset, setSourceOffset] = useState(initialItems.length);
  const [hasMoreInDB, setHasMoreInDB] = useState(initialItems.length === INITIAL_LIMIT);

  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [selectedPrice, setSelectedPrice] = useState<string[]>(["all", "0-99", "100-199", "200-299", "300-399", "400+"]);
  const batchCacheRef = useRef<Record<string, CachedBatchState>>(readBatchCache());

  const normalizePriceRangesForKey = useCallback((ranges: string[]) => {
    if (ranges.includes("all")) return "all";
    if (ranges.length === 0) return "none";
    return [...ranges].sort().join(",");
  }, []);

  const getBatchCacheKey = useCallback((category: string, sortVal: string, ranges: string[]) => {
    return `${category}|${sortVal}|${normalizePriceRangesForKey(ranges)}`;
  }, [normalizePriceRangesForKey]);

  const matchesAnyPriceRange = useCallback((price: number, ranges: string[]) => {
    if (ranges.includes("all")) {
      return true;
    }

    if (ranges.length === 0) {
      return false;
    }

    return ranges.some((range) => {
      if (range === "0-99") return price >= 0 && price <= 99;
      if (range === "100-199") return price >= 100 && price <= 199;
      if (range === "200-299") return price >= 200 && price <= 299;
      if (range === "300-399") return price >= 300 && price <= 399;
      if (range === "400+") return price >= 400;
      return false;
    });
  }, []);

  const normalizeSelectedPrice = useCallback((ranges: string[]) => {
    if (ranges.includes("all")) {
      return ["all", ...PRICE_RANGE_VALUES];
    }

    const validRanges = ranges.filter((range) => PRICE_RANGE_VALUES.includes(range as any));
    if (validRanges.length === 0) {
      return [];
    }

    if (validRanges.length === PRICE_RANGE_VALUES.length) {
      return ["all", ...PRICE_RANGE_VALUES];
    }

    return validRanges;
  }, []);

  const fetchProductsBatch = useCallback(async (limit: number, initialSourceOffset: number, category: string, sortVal: string, ranges: string[]) => {
    const requestKey = `${category}|${sortVal}|${normalizePriceRangesForKey(ranges)}|${initialSourceOffset}|${limit}`;

    const inFlight = inFlightBatchRequests.get(requestKey);
    if (inFlight) {
      return inFlight;
    }

    const requestPromise = (async (): Promise<BatchFetchResult> => {
      try {
        const rangesParam = ranges.length > 0 ? ranges.join(",") : "none";
        const params = new URLSearchParams({
          category,
          sort: sortVal,
          offset: String(initialSourceOffset),
          limit: String(limit),
          ranges: rangesParam,
        });

        const response = await fetch(`/api/products/filter?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          return { items: [], sourceOffset: initialSourceOffset, hasMoreInDB: false };
        }

        const data = await response.json();
        return {
          items: Array.isArray(data?.items) ? data.items : [],
          sourceOffset: Number(data?.sourceOffset ?? initialSourceOffset),
          hasMoreInDB: Boolean(data?.hasMoreInDB),
        };
      } catch (err) {
        console.error("Fetch error:", err);
        return { items: [], sourceOffset: initialSourceOffset, hasMoreInDB: false };
      }
    })();

    inFlightBatchRequests.set(requestKey, requestPromise);

    try {
      return await requestPromise;
    } finally {
      inFlightBatchRequests.delete(requestKey);
    }
  }, [normalizePriceRangesForKey]);

  const fetchAttemptedRef = useRef(false);

  // Sync URL parameters on mount + initialize mobile defaults
  useEffect(() => {
    const gridFromURL = searchParams.get("grid");
    const categoryFromURL = searchParams.get("category");
    const sortFromURL = searchParams.get("sort");

    // Handle Mobile Default Grid
    if (window.innerWidth < 1024 && !gridFromURL) {
      if (grid === "one" || grid === "two") {
        dispatch(setGrid("three"));
      }
    } else if (gridFromURL && ["one", "two", "three", "four"].includes(gridFromURL) && gridFromURL !== grid) {
      dispatch(setGrid(gridFromURL));
    }

    if (categoryFromURL && categoryFromURL !== selectedCategory) {
      setSelectedCategory(categoryFromURL);
    }

    if (sortFromURL && sortFromURL !== sort) {
      dispatch(setSort(sortFromURL));
    }
  }, [searchParams, dispatch]); // Initial sync on mount+url change


  // Sync initial load and filter changes (Deduplicated)
  useEffect(() => {
    const normalizedRanges = normalizeSelectedPrice(selectedPrice);
    const currentKey = getBatchCacheKey(selectedCategory, sort, normalizedRanges);
    const hasCachedState = Object.prototype.hasOwnProperty.call(batchCacheRef.current, currentKey);
    const cachedState = hasCachedState ? batchCacheRef.current[currentKey] : undefined;

    if (hasCachedState && cachedState) {
      setItems(cachedState.items);
      setVisibleCount(cachedState.visibleCount);
      setSourceOffset(cachedState.sourceOffset);
      setHasMoreInDB(cachedState.hasMoreInDB);
      setIsLoading(false);
      fetchAttemptedRef.current = true;
      return;
    }

    if (
      initialItems.length > 0 &&
      selectedCategory === "All Rooms" &&
      sort === "default" &&
      normalizedRanges.includes("all") &&
      !fetchAttemptedRef.current
    ) {
      setIsLoading(false);
      setVisibleCount(INITIAL_LIMIT);
      setItems(initialItems);
      setSourceOffset(initialItems.length);
      setHasMoreInDB(initialItems.length === INITIAL_LIMIT);

      const nextState: CachedBatchState = {
        items: initialItems,
        visibleCount: INITIAL_LIMIT,
        sourceOffset: initialItems.length,
        hasMoreInDB: initialItems.length === INITIAL_LIMIT,
      };
      batchCacheRef.current[currentKey] = nextState;
      writeBatchCache(batchCacheRef.current);
      return;
    }

    let active = true;

    (async () => {
      fetchAttemptedRef.current = true;
      if (!hasCachedState) {
        setIsLoading(true);
      }

      const { items: batchItems, sourceOffset: nextSourceOffset, hasMoreInDB: nextHasMoreInDB } = await fetchProductsBatch(
        INITIAL_LIMIT,
        0,
        selectedCategory,
        sort,
        normalizedRanges
      );

      if (!active) return;

      setItems(batchItems);
      setVisibleCount(INITIAL_LIMIT);
      setSourceOffset(nextSourceOffset);
      setHasMoreInDB(nextHasMoreInDB);
      setIsLoading(false);

      const nextState: CachedBatchState = {
        items: batchItems,
        visibleCount: INITIAL_LIMIT,
        sourceOffset: nextSourceOffset,
        hasMoreInDB: nextHasMoreInDB,
      };
      batchCacheRef.current[currentKey] = nextState;
      writeBatchCache(batchCacheRef.current);
    })();

    return () => {
      active = false;
    };
  }, [
    fetchProductsBatch,
    selectedCategory,
    sort,
    selectedPrice,
    initialItems,
    initialItems.length,
    getBatchCacheKey,
    normalizeSelectedPrice,
  ]);



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

    const normalizedRanges = normalizeSelectedPrice(selectedPrice);
    const currentKey = getBatchCacheKey(selectedCategory, sort, normalizedRanges);

    // If we already have more items in memory, reveal the next 12 immediately.
    if (uniqueProducts.length > visibleCount) {
      setVisibleCount((prev) => {
        const nextVisibleCount = prev + INCREMENT_LIMIT;
        const prevState = batchCacheRef.current[currentKey];
        if (prevState) {
          const nextState: CachedBatchState = {
            ...prevState,
            visibleCount: nextVisibleCount,
          };
          batchCacheRef.current[currentKey] = nextState;
          writeBatchCache(batchCacheRef.current);
        }
        return nextVisibleCount;
      });
      return;
    }

    if (!hasMoreInDB) return;

    setIsFetchingMore(true);
    const { items: nextItems, sourceOffset: nextSourceOffset, hasMoreInDB: nextHasMoreInDB } = await fetchProductsBatch(
      INCREMENT_LIMIT,
      sourceOffset,
      selectedCategory,
      sort,
      normalizedRanges
    );

    if (nextItems.length > 0) {
      const nextMergedItems = [...items, ...nextItems];
      const nextVisibleCount = visibleCount + INCREMENT_LIMIT;

      setItems(nextMergedItems);
      setVisibleCount(nextVisibleCount);
      setSourceOffset(nextSourceOffset);
      setHasMoreInDB(nextHasMoreInDB);

      const nextState: CachedBatchState = {
        items: nextMergedItems,
        visibleCount: nextVisibleCount,
        sourceOffset: nextSourceOffset,
        hasMoreInDB: nextHasMoreInDB,
      };
      batchCacheRef.current[currentKey] = nextState;
      writeBatchCache(batchCacheRef.current);
    } else {
      setSourceOffset(nextSourceOffset);
      setHasMoreInDB(nextHasMoreInDB);

      const prevState = batchCacheRef.current[currentKey];
      if (prevState) {
        const nextState: CachedBatchState = {
          ...prevState,
          sourceOffset: nextSourceOffset,
          hasMoreInDB: nextHasMoreInDB,
        };
        batchCacheRef.current[currentKey] = nextState;
        writeBatchCache(batchCacheRef.current);
      }
    }

    setIsFetchingMore(false);
  };

  // Handlers
  const handleGridChange = useCallback((gridVal: string) => {
    dispatch(setGrid(gridVal));
    const params = new URLSearchParams(window.location.search);
    params.set("grid", gridVal);
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
  }, [dispatch]);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handlePriceChange = useCallback((price: string | string[], isSingleSelect: boolean = false) => {
    if (Array.isArray(price)) {
      setSelectedPrice(price);
      return;
    }

    if (isSingleSelect) {
      if (price === "all" || price === "") {
        setSelectedPrice(["all", "0-99", "100-199", "200-299", "300-399", "400+"]);
      } else {
        setSelectedPrice([price]);
      }
      return;
    }

    if (price === "all") {
      setSelectedPrice((prev) => {
        const specificPrices = ["0-99", "100-199", "200-299", "300-399", "400+"];
        const isCurrentlyAll = prev.includes("all");
        // Toggle everything: if all on -> clear all; if all off -> select all
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
        // If all specific options are selected manually, automatically add "all"
        if (next.length > 0 && specificPrices.every(p => next.includes(p))) {
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
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
  }, [dispatch]);


  // Derived state
  const uniqueProducts = useMemo(() => {
    const seen = new Set();
    return items.filter((p: any) => {
      const key = `${p.id}-${p.variant_id || 0}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [items]);

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
            setSelectedPrice={(price) => handlePriceChange(price, true)}
          />

          <Products products={displayedProducts} grid={grid} isLoading={isLoading} />

          {isFetchingMore && (
            <div className="mt-6">
              <ProductGridSkeleton count={INCREMENT_LIMIT} />
            </div>
          )}

          {!isLoading && displayedProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-2">No products found</h3>
              <p className="text-gray-500 max-w-[300px] text-sm">
                We couldn&apos;t find any products matching your current filters. Try adjusting your price range or category.
              </p>
              <button
                onClick={() => handlePriceChange("all", true)}
                className="mt-6 text-sm font-bold text-black border-b border-black pb-0.5 hover:text-gray-600 hover:border-gray-600 transition-all"
              >
                Clear all filters
              </button>
            </div>
          )}

          {!isLoading && uniqueProducts.length > 0 && hasMoreToShow && (
            <div className="flex justify-center my-0 md:my-10">
              <button
                onClick={handleLoadMore}
                disabled={isFetchingMore}
                className={`border rounded-full px-6 min-[375px]:px-10 py-2 min-[375px]:py-3 transition text-sm min-[375px]:text-base font-medium ${isFetchingMore ? "bg-gray-100 cursor-not-allowed text-gray-400" : "hover:bg-gray-100 active:scale-[0.98]"}`}
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
