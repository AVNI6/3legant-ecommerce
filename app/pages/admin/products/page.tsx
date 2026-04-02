"use client"

import { useMemo, useState, Fragment } from "react"
import { supabase } from "@/lib/supabase/client"
import { formatCurrency, isNewProduct } from "@/constants/Data"
import { type ProductType } from '@/types/index'
import ProductForm from "./ProductForm"
import ConfirmModal from "@/components/admin/ConfirmModal"
import { useToast } from "@/components/admin/Toast"
import { useAdminProducts } from "@/hooks/admin/use-admin-queries"
import { TableSkeleton } from "@/components/ui/skeleton"
import { HiPlus, HiSearch, HiChevronDown, HiChevronUp, HiOutlineTrash, HiOutlinePencilAlt } from "react-icons/hi"
import Link from "next/link"

type DisplayProduct =
  Pick<ProductType, "id" | "name" | "image" | "category" | "is_new" | "price" | "old_price" | "sku" | "created_at"> & {
    variants: ProductType[]
    stock: number
  }

export default function AdminProducts() {
  const { toast } = useToast()
  const [query, setQuery] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductType | null>(null)
  const [editingVariants, setEditingVariants] = useState<ProductType[]>([])
  const [busyId, setBusyId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DisplayProduct | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  const { data: allProducts = [], isLoading, refetch } = useAdminProducts()

  const grouped = useMemo<DisplayProduct[]>(() => {
    return (allProducts ?? []).map(p => {
      const variants = Array.isArray(p.product_variant) ? p.product_variant : []
      const totalStock = variants.reduce((sum: number, v: any) => sum + (v.stock ?? 0), 0)
      const minPrice = variants.length > 0
        ? Math.min(...variants.map((v: any) => v.price ?? p.price ?? 0))
        : (p.price ?? 0)

      return {
        ...p,
        price: minPrice,
        sku: p.sku || (variants[0]?.sku ?? ""),
        variants: variants,
        stock: totalStock,
      }
    })
  }, [allProducts])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return grouped
    return grouped.filter(p =>
      [p.name, p.category, p.sku, isNewProduct(p.created_at) ? "new" : ""].some(v =>
        (v ?? "").toLowerCase().includes(q)
      )
    )
  }, [grouped, query])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated = useMemo(() => {
    return filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [filtered, currentPage])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setBusyId(deleteTarget.id)
    try {
      const { error } = await supabase.from("products").update({ is_deleted: true }).eq("id", deleteTarget.id)
      if (error) throw new Error(error.message)
      toast("Product archived successfully")
      refetch()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Delete failed", "error")
    } finally {
      setBusyId(null)
      setDeleteTarget(null)
    }
  }

  const openEdit = (display: any) => {
    setEditingProduct(display)
    setEditingVariants(display.variants || [])
    setShowForm(true)
  }

  const isAllPaginatedSelected = paginated.length > 0 && paginated.every(p => selectedIds.includes(p.id))

  const toggleSelectAll = () => {
    if (isAllPaginatedSelected) {
      setSelectedIds(prev => prev.filter(id => !paginated.some(p => p.id === id)))
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...paginated.map(p => p.id)])])
    }
  }

  const toggleSelectOne = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true)
    try {
      const { error } = await supabase.from("products").update({ is_deleted: true }).in("id", selectedIds)
      if (error) throw new Error(error.message)
      toast(`${selectedIds.length} products archived successfully`)
      setSelectedIds([])
      refetch()
    } catch (err: any) {
      toast(err.message || "Bulk delete failed", "error")
    } finally {
      setIsBulkDeleting(false)
      setShowBulkDeleteConfirm(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">
            {grouped.length} items · {allProducts?.length ?? 0} variations tracked
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button
              onClick={() => setShowBulkDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all flex items-center gap-2 shadow-sm"
            >
              <HiOutlineTrash className="w-4 h-4" />
              <span>DELETE ({selectedIds.length})</span>
            </button>
          )}
          <button
            onClick={() => {
              setEditingProduct(null)
              setEditingVariants([])
              setShowForm(true)
            }}
            className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-black transition-all shadow-md active:scale-95"
          >
            <HiPlus className="w-5 h-5" />
            <span>ADD PRODUCT</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:w-80">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setCurrentPage(1) }}
            placeholder="Search by name, SKU, category..."
            className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={10} columns={7} />
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left font-poppins">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 w-[40px]">
                      <input
                        type="checkbox"
                        checked={isAllPaginatedSelected}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                    {["Product", "Category", "Price", "Stock", "Variants", ""].map(h => (
                      <th key={h} className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <p className="text-gray-400 text-sm font-medium italic">No products found in the catalog</p>
                      </td>
                    </tr>
                  ) : (
                    paginated.map(product => (
                      <Fragment key={product.id}>
                        <tr className={`hover:bg-gray-50/50 transition-colors ${selectedIds.includes(product.id) ? "bg-blue-50/30" : ""}`}>
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(product.id)}
                              onChange={() => toggleSelectOne(product.id)}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <Link href={`/pages/product/${product.id}`}>
                              <div className="flex items-center gap-4">
                                <img src={product.image} alt="" className="w-15 h-15 rounded-xl object-cover border border-gray-100 shadow-sm" />
                                <div className="min-w-0">
                                  <p className="font-bold text-sm text-gray-900 truncate">{product.name}</p>
                                  <code className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{product.sku || "NO-SKU"}</code>
                                  <div>  {isNewProduct(product.created_at) && (
                                    <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider">NEW</span>
                                  )}</div>
                                </div>
                              </div>
                            </Link>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-xs font-bold text-gray-500 lowercase bg-gray-100 px-2.5 py-1 rounded-lg">
                              {product.category || "Uncategorized"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-gray-900">{formatCurrency(product.price)}</p>
                            {product.old_price && product.old_price > product.price && (
                              <p className="text-xs text-gray-400 line-through mt-0.5">{formatCurrency(product.old_price)}</p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[13px] font-bold uppercase ${product.stock > 10 ? "bg-green-100 text-green-700" :
                              product.stock > 0 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                              }`}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setExpandedId(expandedId === product.id ? null : product.id)}
                              className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors group"
                            >
                              <span className="bg-gray-100 group-hover:bg-gray-200 px-2 py-1 rounded-lg">{product.variants.length} variations</span>
                              <HiChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedId === product.id ? "rotate-180" : ""}`} />
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <ProductActions
                              product={product}
                              openEdit={openEdit}
                              setDeleteTarget={setDeleteTarget}
                              busyId={busyId}
                            />
                          </td>
                        </tr>

                        {expandedId === product.id && (
                          <tr>
                            <td colSpan={7} className="px-6 py-4 bg-gray-50/50">
                              <ProductExpandedContent product={product} />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <div className="p-12 text-center text-gray-400 text-sm font-medium">No products found</div>
              ) : (
                paginated.map(product => (
                  <div key={product.id} className={`p-4 transition-colors ${expandedId === product.id ? "bg-blue-50/20" : "bg-white"}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(product.id)}
                          onChange={() => toggleSelectOne(product.id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <img src={product.image} alt="" className="w-12 h-12 rounded-xl object-cover border border-gray-100 shadow-sm" />
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-gray-900 truncate">{product.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{product.category}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setExpandedId(expandedId === product.id ? null : product.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
                      >
                        {expandedId === product.id ? <HiChevronUp /> : <HiChevronDown />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-black text-gray-900">{formatCurrency(product.price)}</p>
                        <p className={`text-[10px] font-bold uppercase mt-1 ${product.stock > 10 ? "text-green-600" :
                          product.stock > 0 ? "text-yellow-600" : "text-red-600"
                          }`}>
                          {product.stock} Units left
                        </p>
                      </div>
                      <div className="bg-gray-100 px-2 py-1 rounded-lg text-[10px] font-bold text-gray-500 uppercase">
                        {product.variants.length} Vars
                      </div>
                    </div>

                    {expandedId === product.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100">
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SKU Identifier</p>
                              <p className="text-xs font-mono font-bold mt-1 text-gray-900">{product.sku || "N/A"}</p>
                            </div>
                            <ProductActions
                              product={product}
                              openEdit={openEdit}
                              setDeleteTarget={setDeleteTarget}
                              busyId={busyId}
                            />
                          </div>

                          <ProductExpandedContent product={product} />
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            Showing <span className="text-gray-900">{(currentPage - 1) * pageSize + 1}</span>-
            <span className="text-gray-900">{Math.min(currentPage * pageSize, filtered.length)}</span> of
            <span className="text-gray-900 ml-1">{filtered.length}</span> items
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-200 rounded-xl hover:bg-white disabled:opacity-30 transition-all font-bold text-xs"
            >
              PREV
            </button>
            <div className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black text-gray-900">
              {currentPage} / {totalPages || 1}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 border border-gray-200 rounded-xl hover:bg-white disabled:opacity-30 transition-all font-bold text-xs"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct}
          allVariants={editingVariants}
          close={() => {
            setShowForm(false)
            setEditingProduct(null)
            setEditingVariants([])
            refetch()
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Archive Product"
          message={`Are you sure you want to archive "${deleteTarget.name}" and its ${deleteTarget.variants.length} variant(s)? It will be removed from the shop but kept in the database.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={busyId === deleteTarget.id}
        />
      )}

      {showBulkDeleteConfirm && (
        <ConfirmModal
          title="Bulk Archive"
          message={`Are you sure you want to archive ${selectedIds.length} selected product(s)?`}
          onConfirm={handleBulkDelete}
          onCancel={() => setShowBulkDeleteConfirm(false)}
          loading={isBulkDeleting}
        />
      )}
    </div>
  )
}

function ProductActions({ product, openEdit, setDeleteTarget, busyId }: { product: DisplayProduct, openEdit: (p: DisplayProduct) => void, setDeleteTarget: (p: DisplayProduct) => void, busyId: number | null }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => openEdit(product)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
        title="Edit product"
      >
        <HiOutlinePencilAlt className="w-5 h-5" />
      </button>
      <button
        onClick={() => setDeleteTarget(product)}
        disabled={busyId === product.id}
        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600 disabled:opacity-30"
        title="Delete product"
      >
        <HiOutlineTrash className="w-5 h-5" />
      </button>
    </div>
  )
}

function ProductExpandedContent({ product }: { product: DisplayProduct }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {product.variants.map((v, idx) => (
        <div key={idx} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg border border-gray-100 overflow-hidden flex-shrink-0 bg-gray-50">
            {v.color_images?.[0] ? (
              <img src={v.color_images[0]} className="w-full h-full object-cover" alt="" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300 font-bold">N/A</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <p className="text-xs font-bold text-gray-900 truncate">{v.color || "No color"}</p>
              <p className="text-xs font-black text-gray-900 ml-2">{formatCurrency(v.price ?? 0)}</p>
            </div>
            <div className="flex justify-between items-center mt-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Size: {v.size || "-"}</p>
              <p className={`text-[10px] font-bold uppercase ${(v.stock ?? 0) > 0 ? "text-green-600" : "text-red-600"
                }`}>
                {v.stock ?? 0} Units
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}