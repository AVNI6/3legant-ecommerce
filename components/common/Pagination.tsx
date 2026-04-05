"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { FiChevronRight } from "react-icons/fi";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const show = 1;
    const pages: (number | string)[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - show && i <= currentPage + show)) {
        pages.push(i);
      } else if ((i === currentPage - show - 1 && i > 1) || (i === currentPage + show + 1 && i < totalPages)) {
        pages.push("...");
      }
    }
    return pages.filter((item, index) => item !== "..." || pages[index - 1] !== "...");
  };

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-8">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
        Showing Page <span className="text-black">{currentPage}</span> of <span className="text-black">{totalPages}</span>
      </p>

      <div className="flex items-center gap-2">
        <Link
          href={createPageURL(currentPage - 1)}
          className={`p-2.5 rounded-xl border border-gray-200 text-black transition-all active:scale-95 ${currentPage <= 1 ? "opacity-30 pointer-events-none" : "hover:bg-gray-50"}`}
          onClick={(e) => {
            if (onPageChange) {
              e.preventDefault();
              onPageChange(currentPage - 1);
            }
          }}
        >
          <FiChevronRight className="w-5 h-5 rotate-180" />
        </Link>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((pageNum, index) => (
            pageNum === "..." ? (
              <span key={`ellipsis-${index}`} className="min-w-[40px] h-10 flex items-center justify-center text-xs font-black text-gray-400">
                ...
              </span>
            ) : (
              <Link
                key={pageNum}
                href={createPageURL(pageNum)}
                className={`min-w-[40px] h-10 flex items-center justify-center rounded-xl text-xs font-black transition-all active:scale-95 ${currentPage === pageNum
                  ? "bg-black text-white shadow-lg pointer-events-none"
                  : "text-gray-400 hover:text-black hover:bg-gray-50 bg-white border border-transparent"
                  }`}
                onClick={(e) => {
                  if (onPageChange) {
                    e.preventDefault();
                    onPageChange(pageNum as number);
                  }
                }}
              >
                {pageNum}
              </Link>
            )
          ))}
        </div>

        <Link
          href={createPageURL(currentPage + 1)}
          className={`p-2.5 rounded-xl border border-gray-200 text-black transition-all active:scale-95 ${currentPage >= totalPages ? "opacity-30 pointer-events-none" : "hover:bg-gray-50"}`}
          onClick={(e) => {
            if (onPageChange) {
              e.preventDefault();
              onPageChange(currentPage + 1);
            }
          }}
        >
          <FiChevronRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
