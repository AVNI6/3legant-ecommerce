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
  selectedPrice: string;
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
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
      {grid === "one" ? (
        <div className="text-lg font-semibold">{selectedCategory}</div>
      ) : (
        <div className="flex flex-wrap items-end justify-center gap-6">
          <div>
            <label className="flex pb-2 text-md font-semibold text-gray-500 uppercase">
              Categories
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="border border-gray-500 px-4 py-3 rounded-md w-[220px] focus:outline-none"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex pb-2 text-sm font-semibold text-gray-500 uppercase">
              Price
            </label>
            <select
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
              className="border border-gray-500 px-4 py-3 rounded-md w-[220px] focus:outline-none"
            >
              <option value="all">All Price</option>
              {priceRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.max
                    ? `${formatCurrency(range.min)} - ${formatCurrency(range.max)}`
                    : `${formatCurrency(range.min)}+`}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="flex items-center gap-5">
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setIsOpen(false)}
            className="appearance-none cursor-pointer focus:outline-none px-2 w-[190px]"
          >
            <option value="default">Sort By</option>
            <option value="newest">Newest</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
          </select>

          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600 text-lg">
            {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
          </div>
        </div>

        <div className="flex text-2xl bg-white rounded-md p-1 gap-2">
          <BiSolidGrid
            onClick={() => setGrid("one")}
            className={`hidden sm:block cursor-pointer p-1 rounded ${
              grid === "one" ? "bg-gray-200 text-black" : "text-gray-500"
            }`}
          />
          <IoGridSharp
            onClick={() => setGrid("two")}
            className={`hidden sm:block cursor-pointer p-1 rounded ${
              grid === "two" ? "bg-gray-200 text-black" : "text-gray-500"
            }`}
          />
          <PiColumnsFill
            onClick={() => setGrid("three")}
            className={`cursor-pointer p-1 rounded ${
              grid === "three" ? "bg-gray-200 text-black" : "text-gray-500"
            }`}
          />
          <PiRowsFill
            onClick={() => setGrid("four")}
            className={`cursor-pointer p-1 rounded ${
              grid === "four" ? "bg-gray-200 text-black" : "text-gray-500"
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default SortBar;