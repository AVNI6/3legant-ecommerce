"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useProducts } from "@/lib/supabase/context/ProductContext";
import Products from "@/components/products";
import SortBar from "@/app/pages/product/SortBar";
import FilterSidebar from "@/components/FilterSidebar";
import { useSearchParams } from "next/navigation";

export default function ProductPage() {
  const { products, loading } = useProducts();
  const searchParams = useSearchParams();
  const categoryFromURL = searchParams.get("category");

  // Initialize selectedCategory from URL
  const [selectedCategory, setSelectedCategory] = useState(
    categoryFromURL || "All Rooms"
  );
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [grid, setGrid] = useState("one");
  const [sort, setSort] = useState("default");
  const [visibleCount, setVisibleCount] = useState(9);
  const PRODUCTS_INCREMENT = 6;

  // Sync category if URL changes
  useEffect(() => {
    if (categoryFromURL) {
      setSelectedCategory(categoryFromURL);
    }
  }, [categoryFromURL]);

  const filteredProducts = useMemo(() => {
    let items = [...products];

    if (selectedCategory !== "All Rooms") {
      items = items.filter((p) => p.category === selectedCategory);
    }

    if (selectedPrice !== "all") {
      items = items.filter((p) => {
        const price = p.price;
        if (selectedPrice === "0-99") return price <= 99;
        if (selectedPrice === "100-199") return price >= 100 && price <= 199;
        if (selectedPrice === "200-299") return price >= 200 && price <= 299;
        if (selectedPrice === "300-399") return price >= 300 && price <= 399;
        if (selectedPrice === "400+") return price >= 400;
        return true;
      });
    }

    if (sort === "low") items.sort((a, b) => a.price - b.price);
    if (sort === "high") items.sort((a, b) => b.price - a.price);
    if (sort === "newest") items.reverse();

    return items;
  }, [products, selectedCategory, selectedPrice, sort]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PRODUCTS_INCREMENT);
  };

  return (
    <div className="px-5 sm:px-10 lg:px-30">
      <div className="relative w-full h-[392px] mb-10">
        <Image
          src="/products/productHome.png"
          alt="Banner"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-3">
          <p>
            <Link href="/" className="text-gray-500">
              Home
            </Link>{" "}
            &gt; Shop
          </p>
          <h1 className="text-[54px] font-semibold">Our Shop</h1>
          <h3>Lets design the place you always imagined.</h3>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 mb-10">
        {grid === "one" && (
          <div className="hidden sm:block lg:w-[262px]">
            <FilterSidebar
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedPrice={selectedPrice}
              setSelectedPrice={setSelectedPrice}
            />
          </div>
        )}

        <div className="flex-1">
          {grid !== "one" && (
            <div className="flex flex-col md:flex-row gap-6 mb-8"></div>
          )}

          <SortBar
            grid={grid}
            setGrid={setGrid}
            sort={sort}
            setSort={setSort}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedPrice={selectedPrice}
            setSelectedPrice={setSelectedPrice}
          />

          <Products products={visibleProducts} grid={grid} />
          {visibleCount < filteredProducts.length && (
            <div className="flex justify-center md:my-20 my-10">
              <button
                onClick={handleLoadMore}
                className="border rounded-full px-10 py-2 hover:bg-gray-100 transition"
              >
                Show More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// "use client";

// import { useState, useMemo } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { useProducts } from "@/lib/supabase/context/ProductContext";
// import Products from "@/components/products";
// import SortBar from "@/app/pages/product/SortBar";
// import FilterSidebar from "@/components/FilterSidebar";

// export default function ProductPage() {
//   const [grid, setGrid] = useState("one");
//   const [sort, setSort] = useState("default");
//   const [selectedCategory, setSelectedCategory] = useState("All Rooms");
//   const [selectedPrice, setSelectedPrice] = useState("all");
//   const { products, loading } = useProducts();

//   const [visibleCount, setVisibleCount] = useState(9); 
//   const PRODUCTS_INCREMENT = 6;
//   const filteredProducts = useMemo(() => {
//     let items = [...products];

//     if (selectedCategory !== "All Rooms") {
//       items = items.filter((p) => p.category === selectedCategory);
//     }

//     if (selectedPrice !== "all") {
//       items = items.filter((p) => {
//         const price = p.price;
//         if (selectedPrice === "0-99") return price <= 99;
//         if (selectedPrice === "100-199") return price >= 100 && price <= 199;
//         if (selectedPrice === "200-299") return price >= 200 && price <= 299;
//         if (selectedPrice === "300-399") return price >= 300 && price <= 399;
//         if (selectedPrice === "400+") return price >= 400;
//         return true;
//       });
//     }

//     if (sort === "low") items.sort((a, b) => a.price - b.price);
//     if (sort === "high") items.sort((a, b) => b.price - a.price);
//     if (sort === "newest") items.reverse();

//     return items;
//   }, [selectedCategory, selectedPrice, sort]);

//   const visibleProducts = filteredProducts.slice(0, visibleCount);

//   const handleLoadMore = () => {
//     setVisibleCount((prev) => prev + PRODUCTS_INCREMENT);
//   };

//   return (
//     <div className="px-5 sm:px-10 lg:px-30 ">
//       <div className="relative w-full h-[392px] mb-10">
//         <Image
//           src="/products/productHome.png"
//           alt="Banner"
//           fill
//           className="object-cover"
//         />
//         <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-3">
//           <p>
//             <Link href="/" className="text-gray-500">
//               Home
//             </Link>{" "}
//             &gt; Shop
//           </p>
//           <h1 className="text-[54px] font-semibold">Our Shop</h1>
//           <h3>Lets design the place you always imagined.</h3>
//         </div>
//       </div>

//       <div className="flex flex-col lg:flex-row gap-12 mb-10">
//         {grid === "one" && (
//           <div className="hidden sm:block lg:w-[262px]">
//             <FilterSidebar
//               selectedCategory={selectedCategory}
//               setSelectedCategory={setSelectedCategory}
//               selectedPrice={selectedPrice}
//               setSelectedPrice={setSelectedPrice}
//             />
//           </div>
//         )}

//         <div className="flex-1">
//           {grid !== "one" && <div className="flex flex-col md:flex-row gap-6 mb-8"></div>}

//           <SortBar
//             grid={grid}
//             setGrid={setGrid}
//             sort={sort}
//             setSort={setSort}
//             selectedCategory={selectedCategory}
//             setSelectedCategory={setSelectedCategory}
//             selectedPrice={selectedPrice}
//             setSelectedPrice={setSelectedPrice}
//           />

//           <Products products={visibleProducts} grid={grid} />
//           {visibleCount < filteredProducts.length && (
//             <div className="flex justify-center md:my-20 my-10">
//               <button
//                 onClick={handleLoadMore}
//                 className="border rounded-full px-10 py-2 hover:bg-gray-100  transition"
//               >
//                 Show More
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
// // "use client";

// // import { useState, useMemo } from "react";
// // import Image from "next/image";
// // import Link from "next/link";
// // import { products } from "@/constants/Data";
// // import Products from "@/components/products";
// // import SortBar from "@/app/pages/product/SortBar";
// // import FilterSidebar from "@/components/FilterSidebar";

// // export default function ProductPage() {
// //   const [grid, setGrid] = useState("one");
// //   const [sort, setSort] = useState("default");
// //   const [selectedCategory, setSelectedCategory] = useState("All Rooms");
// //   const [selectedPrice, setSelectedPrice] = useState("all");

// //   const [visibleCount, setVisibleCount] = useState(9); 
// //   const PRODUCTS_INCREMENT = 6;
// //   const filteredProducts = useMemo(() => {
// //     let items = [...products];

// //     if (selectedCategory !== "All Rooms") {
// //       items = items.filter((p) => p.category === selectedCategory);
// //     }

// //     if (selectedPrice !== "all") {
// //       items = items.filter((p) => {
// //         const price = p.price;
// //         if (selectedPrice === "0-99") return price <= 99;
// //         if (selectedPrice === "100-199") return price >= 100 && price <= 199;
// //         if (selectedPrice === "200-299") return price >= 200 && price <= 299;
// //         if (selectedPrice === "300-399") return price >= 300 && price <= 399;
// //         if (selectedPrice === "400+") return price >= 400;
// //         return true;
// //       });
// //     }

// //     if (sort === "low") items.sort((a, b) => a.price - b.price);
// //     if (sort === "high") items.sort((a, b) => b.price - a.price);
// //     if (sort === "newest") items.reverse();

// //     return items;
// //   }, [selectedCategory, selectedPrice, sort]);

// //   const visibleProducts = filteredProducts.slice(0, visibleCount);

// //   const handleLoadMore = () => {
// //     setVisibleCount((prev) => prev + PRODUCTS_INCREMENT);
// //   };

// //   return (
// //     <div className="px-5 sm:px-10 lg:px-30 ">
// //       <div className="relative w-full h-[392px] mb-10">
// //         <Image
// //           src="/products/productHome.png"
// //           alt="Banner"
// //           fill
// //           className="object-cover"
// //         />
// //         <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-3">
// //           <p>
// //             <Link href="/" className="text-gray-500">
// //               Home
// //             </Link>{" "}
// //             &gt; Shop
// //           </p>
// //           <h1 className="text-[54px] font-semibold">Our Shop</h1>
// //           <h3>Lets design the place you always imagined.</h3>
// //         </div>
// //       </div>

// //       <div className="flex flex-col lg:flex-row gap-12 mb-10">
// //         {grid === "one" && (
// //           <div className="hidden sm:block lg:w-[262px]">
// //             <FilterSidebar
// //               selectedCategory={selectedCategory}
// //               setSelectedCategory={setSelectedCategory}
// //               selectedPrice={selectedPrice}
// //               setSelectedPrice={setSelectedPrice}
// //             />
// //           </div>
// //         )}

// //         <div className="flex-1">
// //           {grid !== "one" && <div className="flex flex-col md:flex-row gap-6 mb-8"></div>}

// //           <SortBar
// //             grid={grid}
// //             setGrid={setGrid}
// //             sort={sort}
// //             setSort={setSort}
// //             selectedCategory={selectedCategory}
// //             setSelectedCategory={setSelectedCategory}
// //             selectedPrice={selectedPrice}
// //             setSelectedPrice={setSelectedPrice}
// //           />

// //           <Products products={visibleProducts} grid={grid} />
// //           {visibleCount < filteredProducts.length && (
// //             <div className="flex justify-center md:my-20 my-10">
// //               <button
// //                 onClick={handleLoadMore}
// //                 className="border rounded-full px-10 py-2 hover:bg-gray-100  transition"
// //               >
// //                 Show More
// //               </button>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }