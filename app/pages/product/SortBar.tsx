"use client";

import { useState, useEffect } from "react";
import { BiSolidGrid } from "react-icons/bi";
import { IoGridSharp } from "react-icons/io5";
import { PiColumnsFill, PiRowsFill } from "react-icons/pi";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { formatCurrency } from "@/constants/Data";
import { useSearchParams, useRouter } from "next/navigation";
import { APP_ROUTE } from "@/constants/AppRoutes";

type Props = {
  grid: string;
  setGrid: (value: string) => void;
  sort: string;
  setSort: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedPrice: string[];
  setSelectedPrice: (value: string) => void;
};

const priceRanges = [
  { value: "0-99", min: 0, max: 99 },
  { value: "100-199", min: 100, max: 199 },
  { value: "200-299", min: 200, max: 299 },
  { value: "300-399", min: 300, max: 399 },
  { value: "400+", min: 400 },
];

const categories = [
  "All Rooms",
  "Living Room",
  "Bedroom",
  "Kitchen",
  "Bathroom",
  "Dining",
  "Outdoor",
];

const SortBar = ({
  grid,
  setGrid,
  sort,
  setSort,
  selectedCategory,
  setSelectedCategory,
  selectedPrice,
  setSelectedPrice,
}: Props) => {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const categoryFromURL = searchParams.get("category");
    if (categoryFromURL && categoryFromURL !== selectedCategory) {
      setSelectedCategory(categoryFromURL);
    }
  }, [searchParams]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    router.push(`${APP_ROUTE.product}?category=${encodeURIComponent(value)}`);
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-5 md:mb-12">
      {grid === "one" ? (
        <div className="text-2xl font-semibold text-black tracking-tight">{selectedCategory}</div>
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 w-full lg:w-auto">
          <div className="w-full sm:w-[260px]">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">
              Categories
            </label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg appearance-none focus:outline-none focus:border-black text-sm font-semibold"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <IoIosArrowDown />
              </div>
            </div>
          </div>

          <div className="w-full sm:w-[260px]">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">
              Price
            </label>
            <div className="relative">
              <select
                value={selectedPrice.length === 1 ? selectedPrice[0] : selectedPrice.includes("all") ? "all" : "multiple"}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg appearance-none focus:outline-none focus:border-black text-sm font-semibold"
              >
                <option value="all">All Price</option>
                {selectedPrice.length > 1 && !selectedPrice.includes("all") && (
                  <option value="multiple" disabled>Multiple Selected</option>
                )}
                {priceRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.max
                      ? `${formatCurrency(range.min)} - ${formatCurrency(range.max)}`
                      : `${formatCurrency(range.min)}+`}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <IoIosArrowDown />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right Section: Sort and Grid */}
      <div className="flex flex-col min-[347px]:flex-row items-start min-[347px]:items-center justify-between lg:justify-end gap-4 min-[347px]:gap-8 w-full lg:w-auto mt-2 min-[347px]:h-[42px]">
        <div className="relative flex items-center gap-2">
          <span className="text-sm font-bold text-black whitespace-nowrap">Sort by</span>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              onFocus={() => setIsSortOpen(true)}
              onBlur={() => setIsSortOpen(false)}
              className="appearance-none cursor-pointer focus:outline-none pr-6 pl-1 py-1 text-sm font-bold bg-transparent"
            >
              <option value="default">Default</option>
              <option value="newest">Newest</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-800">
              {isSortOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </div>
          </div>
        </div>

        <div className="flex items-center border border-gray-100 rounded-md overflow-hidden h-[42px] min-[347px]:h-full z-20 w-full min-[347px]:w-auto justify-between min-[347px]:justify-start">
          <button
            type="button"
            onClick={() => { console.log("GRID ICON 1 CLICKED"); setGrid("one"); }}
            className={`p-2 flex-1 min-[347px]:flex-none transition-colors hidden md:flex items-center justify-center ${grid === "one" ? "bg-gray-100 text-black" : "text-gray-400 hover:text-black"}`}
            title="3 Columns"
          >
            <BiSolidGrid className="text-xl mx-auto" />
          </button>
          <button
            type="button"
            onClick={() => { console.log("GRID ICON 2 CLICKED"); setGrid("two"); }}
            className={`p-2 flex-1 min-[347px]:flex-none transition-colors hidden md:flex items-center justify-center ${grid === "two" ? "bg-gray-100 text-black" : "text-gray-400 hover:text-black"}`}
            title="4 Columns"
          >
            {/* 
                 className={`p-2 transition-colors hidden lg:block ${grid === "one" ? "bg-gray-100 text-black" : "text-gray-400 hover:text-black"}`}
               className={`p-2 transition-colors hidden lg:block ${grid === "two" ?  */}
            <IoGridSharp className="text-xl mx-auto" />
          </button>
          <button
            type="button"
            onClick={() => { console.log("GRID ICON 3 CLICKED"); setGrid("three"); }}
            className={`p-2 flex-1 min-[347px]:flex-none transition-colors border-x md:border-x-0 md:border-l border-gray-100 ${grid === "three" ? "bg-gray-100 text-black" : "text-gray-400 hover:text-black"}`}
            title="2 Columns"
          >
            <PiColumnsFill className="text-xl mx-auto" />
          </button>
          <button
            type="button"
            onClick={() => { console.log("GRID ICON 4 CLICKED"); setGrid("four"); }}
            className={`p-2 flex-1 min-[347px]:flex-none transition-colors ${grid === "four" ? "bg-gray-100 text-black" : "text-gray-400 hover:text-black"}`}
            title="List View"
          >
            <PiRowsFill className="text-xl mx-auto" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SortBar;