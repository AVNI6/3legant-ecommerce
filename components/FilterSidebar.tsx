// "use client";

// import { useState } from "react";
// import { FaFilter } from "react-icons/fa6";
// import { IoFilterSharp } from "react-icons/io5";

// const priceRanges = [
//   { label: "All Price", min: 0, max: Infinity },
//   { label: "$0.00 - 99.99", min: 0, max: 99 },
//   { label: "$100.00 - 199.99", min: 100, max: 199 },
//   { label: "$200.00 - 299.99", min: 200, max: 299 },
//   { label: "$300.00 - 399.99", min: 300, max: 399 },
//   { label: "$400.00+", min: 400, max: Infinity },
// ];

// const categories = [
//   "All Rooms",
//   "Living Room",
//   "Bedroom",
//   "Kitchen",
// ];

// export default function FilterSidebar({ onFilter }: any) {
//   const [selectedPrice, setSelectedPrice] = useState(priceRanges[0]);
//   const [selectedCategory, setSelectedCategory] = useState("All Rooms");

//   const handlePrice = (range: any) => {
//     setSelectedPrice(range);
//     onFilter(range, selectedCategory);
//   };

//   const handleCategory = (cat: string) => {
//     setSelectedCategory(cat);
//     onFilter(selectedPrice, cat);
//   };

//   return (
//     <div className="w-64 space-y-6">
//       <div>
//         <h1 className="font-semibold text-[20px] flex items-center gap-3 mb-3"> <IoFilterSharp />Filter</h1>
//         <h2 className="font-bold mb-3">CATEGORIES</h2>

//         {categories.map((cat) => (
//           <p key={cat} onClick={() => handleCategory(cat)} className={`cursor-pointer py-1 ${ selectedCategory === cat ? "font-bold underline" : ""}`}>
//             {cat}
//           </p>
//         ))}
//       </div>
//       <div>
//         <h2 className="font-bold mb-3">PRICE</h2>

//         {priceRanges.map((range) => (
//           <label key={range.label} className="flex justify-between mr-10 gap-2 py-1 cursor-pointer">
//             {range.label}
//               <input
//               type="checkbox"
//               checked={selectedPrice.label === range.label}
//               onChange={() => handlePrice(range)  } />
//           </label>
//         ))}
//       </div>
//     </div>
//   );
// }


"use client"
import { APP_ROUTE } from "@/constants/AppRoutes"
import  { useRouter } from "next/navigation"
import React from "react"
type FilterBarProps = {
    selectedCategory: string
    setSelectedCategory: React.Dispatch<React.SetStateAction<string>>
    selectedPrice: string
    setSelectedPrice: React.Dispatch<React.SetStateAction<string>>
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
     const router = useRouter();
    return (
        <div className="sticky top-10 flex flex-col gap-8 ">
            <div className="overflow-y-auto h-50">
                <h4 className="uppercase text-sm font-semibold mb-4 ">Categories</h4>
                <div className="flex flex-col gap-2 ">
                    {categories.map((cat) => (
                        <p
                            key={cat}
                            onClick={() => {
                setSelectedCategory(cat); 
               router.push(`${APP_ROUTE.product}?category=${encodeURIComponent(cat)}`); 
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
                            className="flex justify-between items-center cursor-pointer"
                        >
                            <span className="capitalize">{price}</span>
                            <input
                                type="radio"
                                name="price"
                                checked={selectedPrice === price}
                                onChange={() => setSelectedPrice(price)}
                                className="w-5 h-5 rounded-md border border-gray-400 appearance-none cursor-pointer relative before:content-[''] before:absolute before:inset-0 before:flex before:items-center before:justify-center checked:before:content-['✓'] checked:before:text-white checked:before:text-sm checked:bg-black transition-all"
                            />
                        </label>
                    ))}
                </div>
            </div>

        </div>
    )
}

export default FilterSidebar