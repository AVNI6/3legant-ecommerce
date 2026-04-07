"use client"
import { APP_ROUTE } from "@/constants/AppRoutes"
import React from "react"

type FilterBarProps = {
    selectedCategory: string
    setSelectedCategory: React.Dispatch<React.SetStateAction<string>>
    selectedPrice: string[]
    setSelectedPrice: (price: string) => void
}

export const categories = [
    "All Rooms",
    "Living Room",
    "Bedroom",
    "Kitchen",
    "Bathroom",
    "Dining",
    "Outdoor",
]

export const prices = ["all", "0-99", "100-199", "200-299", "300-399", "400+"]

const FilterSidebar: React.FC<FilterBarProps> = ({
    selectedCategory,
    setSelectedCategory,
    selectedPrice,
    setSelectedPrice,
}) => {
    return (
        <div className="sticky top-22 flex flex-col gap-8 ">
            <div className="overflow-y-auto h-50">
                <h4 className="uppercase text-sm font-semibold mb-4 ">Categories</h4>
                <div className="flex flex-col gap-2 ">
                    {categories.map((cat) => (
                        <p
                            key={cat}
                            onClick={() => {
                                setSelectedCategory(cat);
                                const params = new URLSearchParams(window.location.search);
                                params.set("category", cat);
                                window.history.replaceState({}, "", `${APP_ROUTE.product}?${params.toString()}`);
                            }}


                            className={`cursor-pointer ${selectedCategory === cat
                                ? "font-semibold underline"
                                : "text-gray-500 hover:text-black"
                                }`}
                        >
                            {cat}
                        </p>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="uppercase text-sm font-semibold mb-4">Price</h4>
                <div className="flex flex-col gap-2">
                    {prices.map((price) => (
                        <label
                            key={price}
                            className="flex justify-between items-center cursor-pointer group"
                        >
                            <span className={`capitalize transition-colors ${selectedPrice.includes(price) ? "font-semibold text-black" : "text-gray-500 group-hover:text-black"
                                }`}>
                                {price === "all" ? "All Price" : price}
                            </span>
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedPrice.includes(price)}
                                    onChange={() => setSelectedPrice(price)}
                                    className="w-5 h-5 rounded-md border border-gray-300 appearance-none cursor-pointer checked:bg-black transition-all hover:border-black"
                                />
                                {selectedPrice.includes(price) && (
                                    <svg
                                        className="absolute inset-0 m-auto w-3 h-3 text-white pointer-events-none"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={4}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                        </label>
                    ))}
                </div>
            </div>

        </div>
    )
}

export default FilterSidebar
