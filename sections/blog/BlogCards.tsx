// // "use client"

// // import { useState } from "react"
// // import { MdGridView } from "react-icons/md"
// // import { BsFillGrid3X3GapFill } from "react-icons/bs"
// // import { CiGrid2H, CiGrid2V } from "react-icons/ci"
// // import Article from "@/components/article";
// // import { articles } from "@/constants/Data";

// // type SortOrder = "asc" | "desc"
// // type TabType = "blog" | "features"
// // type GridType = "two" | "three" | "horizontal" | "vertical"

// // export default function BlogLayout() {
// //   const [activeTab, setActiveTab] = useState<TabType>("blog")
// //   const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
// //   const [gridType, setGridType] = useState<GridType>("two")

// //   // Separate data per tab
// //   const blogItems = ["Apple", "Zebra", "Monkey", "Banana"]
// //   const featureItems = ["Cherry", "Orange", "Grapes", "Pineapple"]

// //   const toggleSort = () => {
// //     setSortOrder(prev => (prev === "asc" ? "desc" : "asc"))
// //   }

// //   // Get items based on active tab
// //   const currentItems = activeTab === "blog" ? blogItems : featureItems

// //   // Sort them
// //   const displayedItems = [...currentItems].sort((a, b) =>
// //     sortOrder === "asc"
// //       ? a.localeCompare(b)
// //       : b.localeCompare(a)
// //   )

// //   const tabClass = (tab: TabType) =>
// //     `pb-2 font-medium transition-colors ${
// //       activeTab === tab
// //         ? "text-black border-b-2 border-black"
// //         : "text-gray-300 hover:text-black"
// //     }`

// //   const gridClass = () => {
// //     switch (gridType) {
// //       case "two":
// //         return "grid grid-cols-2 gap-4"
// //       case "three":
// //         return "grid grid-cols-3 gap-4"
// //       case "horizontal":
// //         return "flex flex-col gap-4"
// //       case "vertical":
// //         return "flex flex-row flex-wrap gap-4"
// //       default:
// //         return "grid grid-cols-2 gap-4"
// //     }
// //   }

// //   const iconClass = (type: GridType) =>
// //     `cursor-pointer text-xl transition ${
// //       gridType === type ? "text-black" : "text-gray-400"
// //     }`

// //   return (
// //     <div className="p-6">
// //       {/* Top Controls */}
// //       <div className="flex justify-between items-center mb-6">

// //         {/* LEFT SIDE (Tabs) */}
// //         <div className="flex space-x-6">
// //           <button
// //             onClick={() => setActiveTab("blog")}
// //             className={tabClass("blog")}
// //           >
// //             All Blog
// //           </button>
// //           <button
// //             onClick={() => setActiveTab("features")}
// //             className={tabClass("features")}
// //           >
// //             Features
// //           </button>
// //         </div>

// //         {/* RIGHT SIDE (Sort + Icons) */}
// //         <div className="flex items-center gap-6">

// //           {/* Sort */}
// //           <button
// //             onClick={toggleSort}
// //             className="text-sm font-medium flex items-center gap-2"
// //           >
// //             Sort By {sortOrder === "asc" ? "↑" : "↓"}
// //           </button>

// //           {/* Grid Icons */}
// //           <div className="flex gap-4">
// //             <MdGridView
// //               onClick={() => setGridType("two")}
// //               className={iconClass("two")}
// //             />
// //             <BsFillGrid3X3GapFill
// //               onClick={() => setGridType("three")}
// //               className={iconClass("three")}
// //             />
// //             <CiGrid2H
// //               onClick={() => setGridType("horizontal")}
// //               className={iconClass("horizontal")}
// //             />
// //             <CiGrid2V
// //               onClick={() => setGridType("vertical")}
// //               className={iconClass("vertical")}
// //             />
// //           </div>
// //         </div>
// //       </div>

// //       {/* Content */}
// //       <div className={gridClass()}>
// //         {displayedItems.map((item, index) => (
// //           <div
// //             key={index}
// //             className="p-4 border rounded bg-gray-100 text-center"
// //           >
// //             {item}
// //           </div>
// //         ))}
// //       </div>
// //          <Article data={articles}/>
// //     </div>
// //   )
// // }

// "use client"

// import { useState, useMemo } from "react"
// import { MdGridView } from "react-icons/md"
// import { BsFillGrid3X3GapFill } from "react-icons/bs"
// import { CiGrid2H, CiGrid2V } from "react-icons/ci"
// import Article from "@/components/article"
// import { articles } from "@/constants/Data"

// type SortOrder = "asc" | "desc"
// type TabType = "blog" | "features"
// type GridType = "two" | "three" | "horizontal" | "vertical"

// export default function BlogLayout() {
//   const [activeTab, setActiveTab] = useState<TabType>("blog")
//   const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
//   const [gridType, setGridType] = useState<GridType>("two")

//   const toggleSort = () => {
//     setSortOrder(prev => (prev === "asc" ? "desc" : "asc"))
//   }

//   // ✅ FILTER + SORT REAL DATA
//   const displayedItems = useMemo(() => {
//     const filtered = articles.filter(
//       (item) => item.type === activeTab
//     )

//     return filtered.sort((a, b) =>
//       sortOrder === "asc"
//         ? a.title.localeCompare(b.title)
//         : b.title.localeCompare(a.title)
//     )
//   }, [activeTab, sortOrder])

//   const tabClass = (tab: TabType) =>
//     `pb-2 font-medium transition-colors ${
//       activeTab === tab
//         ? "text-black border-b-2 border-black"
//         : "text-gray-300 hover:text-black"
//     }`

//   const gridClass = () => {
//     switch (gridType) {
//       case "two":
//         return "grid grid-cols-2 gap-4"
//       case "three":
//         return "grid grid-cols-3 gap-4"
//       case "horizontal":
//         return "flex flex-col gap-4"
//       case "vertical":
//         return "flex flex-row flex-wrap gap-4"
//       default:
//         return "grid grid-cols-2 gap-4"
//     }
//   }

//   const iconClass = (type: GridType) =>
//     `cursor-pointer text-xl transition ${
//       gridType === type ? "text-black" : "text-gray-400"
//     }`

//   return (
//     <div className="">

//       {/* Top Controls */}
//       <div className="flex justify-between items-center mb-6">

//         {/* Tabs */}
//         <div className="flex space-x-6">
//           <button
//             onClick={() => setActiveTab("blog")}
//             className={tabClass("blog")}
//           >
//             All Blog
//           </button>
//           <button
//             onClick={() => setActiveTab("features")}
//             className={tabClass("features")}
//           >
//             Features
//           </button>
//         </div>

//         {/* Sort + Grid */}
//         <div className="flex items-center gap-6">
//           <button
//             onClick={toggleSort}
//             className="text-sm font-medium"
//           >
//             Sort By {sortOrder === "asc" ? "↑" : "↓"}
//           </button>

//           <div className="flex gap-4">
//             <MdGridView onClick={() => setGridType("two")} className={iconClass("two")} />
//             <BsFillGrid3X3GapFill onClick={() => setGridType("three")} className={iconClass("three")} />
//             <CiGrid2H onClick={() => setGridType("horizontal")} className={iconClass("horizontal")} />
//             <CiGrid2V onClick={() => setGridType("vertical")} className={iconClass("vertical")} />
//           </div>
//         </div>
//       </div>

//       {/* Articles */}
//       <div className={gridClass()}>
//         <Article data={displayedItems} />
//       </div>

//     </div>
//   )
// }

"use client"

import { useState } from "react"
import Controls from "./Controls"
import BlogArticle from "./BlogArticle"
import { articles as allArticles } from "@/constants/Data"
import { SortOrder, TabType, GridType } from "@/constants/Data";

export default function BlogCards() {
    const [activeTab, setActiveTab] = useState<TabType>("all")
    const [sortOrder, setSortOrder] = useState<SortOrder>("default")
    const [gridType, setGridType] = useState<GridType>("three")

    const filteredArticles =
        activeTab === "features"
            ? allArticles.filter(a => a.type === "features")
            : allArticles

    const sortedArticles =
        sortOrder === "default"
            ? filteredArticles 
            : [...filteredArticles].sort((a, b) =>
                sortOrder === "asc"
                    ? a.title.localeCompare(b.title)
                    : b.title.localeCompare(a.title)
            )
    const tabClass = (tab: TabType) => `pb-2 font-medium transition-colors ${activeTab === tab ? "text-black border-b-2 border-black" : "text-gray-400 hover:text-black"  }`

    return (
        <div className="">
            <div className="flex justify-between items-center">
                <div className="flex gap-6">
                    <button onClick={() => setActiveTab("all")} className={tabClass("all")}>All Blog</button>
                    <button onClick={() => setActiveTab("features")} className={tabClass("features")}>Features</button>
                </div>
                <Controls  sortOrder={sortOrder} setSortOrder={setSortOrder} gridType={gridType} setGridType={setGridType} />
            </div>
            <BlogArticle data={sortedArticles} gridType={gridType} />
        </div>
    )
}