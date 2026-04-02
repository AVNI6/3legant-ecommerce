"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/admin/Toast"
import Link from "next/link"

export default function AddProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [variants, setVariants] = useState([{ option: "", value: "", price: "" }])

  const addVariant = () => {
    setVariants([...variants, { option: "", value: "", price: "" }])
  }

  const removeVariant = (index: number) => {
    const newVariants = [...variants]
    newVariants.splice(index, 1)
    setVariants(newVariants)
  }

  const handleVariantChange = (index: number, field: string, value: string) => {
    const newVariants = [...variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setVariants(newVariants)
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-sm font-medium text-gray-500 mb-1">
            <Link href="/pages/admin/products" className="hover:text-black hover:underline">Products</Link>
            <span className="mx-2">/</span>
            <span className="text-black">Add Product</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
        </div>
        <div className="flex gap-4">
          <Link 
            href="/pages/admin/products" 
            className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button 
            type="button"
            className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 shadow"
            onClick={() => toast("Integration with backend needed for saving", "success")}
          >
            Save Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content (Left Col) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Product Details Card */}
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-6">Product Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Name</label>
                <input 
                  type="text" 
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none" 
                  placeholder="e.g. Minimalist Chair"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">SKU</label>
                  <input 
                    type="text" 
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none" 
                    placeholder="SKU-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Barcode (Optional)</label>
                  <input 
                    type="text" 
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none" 
                    placeholder="0123456789"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea 
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none min-h-[120px]" 
                  placeholder="Set a description of the product for better visibility."
                ></textarea>
              </div>
            </div>
          </div>

          {/* Product Media Card */}
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-6">Product Images</h2>

            <div className="space-y-6">
              {/* Main Thumbnail Drag & Drop area styled like requested */}
              <div>
                <label className="block text-sm font-medium mb-2">Main Thumbnail</label>
                <div className="bg-[#1e293b] rounded-xl p-8 border border-dashed border-blue-500/30 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-800 transition">
                  <p className="text-blue-400 font-medium mb-2">Drag 'n' drop some files here, or click to select files</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Set the product thumbnail image. Only *.png, *.jpg and *.jpeg image files are accepted.
                </p>
              </div>

              {/* Gallery Images */}
              <div>
                 <label className="block text-sm font-medium mb-2">Gallery Images (Max 3)</label>
                 <div className="border border-dashed rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
                  <p className="text-sm font-medium">Drop your images here</p>
                  <p className="text-xs text-gray-400 mt-1">PNG or JPG (max. 5MB)</p>
                 </div>
              </div>
            </div>
          </div>

          {/* Variants Card */}
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-6">Variants</h2>
            
            <div className="space-y-4">
              {variants.map((v, i) => (
                <div key={i} className="flex gap-4 items-end border p-4 rounded-lg bg-gray-50 relative">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Option</label>
                    <select 
                      value={v.option} 
                      onChange={(e) => handleVariantChange(i, 'option', e.target.value)}
                      className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none bg-white"
                    >
                      <option value="">Select option...</option>
                      <option value="size">Size</option>
                      <option value="color">Color</option>
                      <option value="material">Material</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Value</label>
                    <input 
                      type="text" 
                      value={v.value} 
                      onChange={(e) => handleVariantChange(i, 'value', e.target.value)}
                      className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none bg-white" 
                      placeholder="e.g. Small, Red, Steel"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Price (+/-)</label>
                    <input 
                      type="number" 
                      value={v.price} 
                      onChange={(e) => handleVariantChange(i, 'price', e.target.value)}
                      className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none bg-white" 
                      placeholder="0.00"
                    />
                  </div>
                  {variants.length > 1 && (
                    <button 
                      onClick={() => removeVariant(i)}
                      className="text-red-500 p-2 hover:bg-red-50 rounded"
                      title="Remove variant"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  )}
                </div>
              ))}

              <button 
                type="button" 
                onClick={addVariant}
                className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 flex justify-center items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 12h8"></path><path d="M12 8v8"></path></svg>
                Add another variant
              </button>
            </div>
          </div>

        </div>

        {/* Sidebar (Right Col) */}
        <div className="space-y-6">
          
          {/* Status & Pricing */}
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-6">Pricing</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Base Price ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none" 
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5">Compare at Price ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none" 
                  placeholder="Optional discount price"
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-6">Category</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Product Category</label>
                <select className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none">
                  <option value="living-room">Living Room</option>
                  <option value="bedroom">Bedroom</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="bathroom">Bathroom</option>
                  <option value="outdoor">Outdoor</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5">Tags</label>
                <input 
                  type="text" 
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none" 
                  placeholder="e.g. Modern, Wood, Minimal"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
