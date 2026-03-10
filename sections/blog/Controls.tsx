"use client"

import { MdGridView, MdArrowUpward, MdArrowDownward } from "react-icons/md"
import { BsFillGrid3X3GapFill } from "react-icons/bs"
import { CiGrid2H, CiGrid2V } from "react-icons/ci"
import { SortOrder, GridType } from "@/constants/Data"

interface ControlsProps {
  sortOrder: SortOrder
  setSortOrder: React.Dispatch<React.SetStateAction<SortOrder>>
  gridType: GridType
  setGridType: (type: GridType) => void
}

export default function Controls({
  sortOrder,
  setSortOrder,
  gridType,
  setGridType
}: ControlsProps) {

  const toggleSort = () => {
    if (sortOrder === "default") setSortOrder("asc")
    else if (sortOrder === "asc") setSortOrder("desc")
    else setSortOrder("default")
  }

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 md:gap-0">
      <div className="flex items-center gap-6">
        <button onClick={toggleSort} className="flex items-center gap-1 text-sm font-medium hover:text-black">
          Sort By
          {sortOrder === "asc" && <MdArrowUpward />}
          {sortOrder === "desc" && <MdArrowDownward />}
        </button>

        <div className="flex gap-3 items-center">
          <BsFillGrid3X3GapFill
            onClick={() => setGridType("three")}
            className={`cursor-pointer ${gridType === "three" ? "text-black" : "text-gray-400"}`}
            size={24} />
          <MdGridView
            onClick={() => setGridType("two")}
            className={`cursor-pointer ${gridType === "two" ? "text-black" : "text-gray-400"}`}
            size={24} />
          <CiGrid2H
            onClick={() => setGridType("horizontal")}
            className={`cursor-pointer ${gridType === "horizontal" ? "text-black" : "text-gray-400"}`}
            size={24}  />
          <CiGrid2V
            onClick={() => setGridType("vertical")}
            className={`cursor-pointer ${gridType === "vertical" ? "text-black" : "text-gray-400"}`}
            size={24} />
        </div>
      </div>
    </div>
  )
}