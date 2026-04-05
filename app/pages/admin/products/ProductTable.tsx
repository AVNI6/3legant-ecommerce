"use client"

import { supabase } from "@/lib/supabase/client"
import { useState } from "react"
import Modal from "@/components/ui/Modal"
import { toast } from "react-toastify"

export default function ProductTable({ products, refresh }: any) {

  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, product: any }>({ isOpen: false, product: null })
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean, message: string }>({ isOpen: false, message: "" })

  const deleteProduct = async (product: any) => {
    const { error } = await supabase
      .from("products")
      .update({ is_deleted: true })
      .eq("id", product.id)

    if (error) {
      setErrorModal({ isOpen: true, message: "Error archiving product: " + error.message })
    } else {
      toast.success("Product archived successfully")
      refresh()
    }
    setConfirmModal({ isOpen: false, product: null })
  }

  return (
    <>
      <table className="w-full bg-white rounded shadow">
        <thead className="border-b">
          <tr>
            <th className="p-4">Image</th>
            <th>Name</th>
            <th>Price</th>
            <th>Category</th>
            <th>Variant</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p: any) => (
            <tr key={p.id} className="border-b">
              <td className="p-4">
                <img src={p.image} className="w-16 h-16 object-cover" />
              </td>
              <td>{p.name}</td>
              <td>${p.price}</td>
              <td>{p.category}</td>
              <td>{p.color || "-"} / {p.size || "-"}</td>
              <td>

                <button onClick={() => setConfirmModal({ isOpen: true, product: p })} className="text-red-500 hover:text-red-700 font-medium h-full flex items-center justify-center w-full">
                  Archive
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, product: null })}
        title="Archive Product"
      >
        <div className="space-y-6">
          <p className="text-gray-600 font-medium leading-relaxed">Archive this product? It will be removed from the shop but kept in the database for order history.</p>
          <div className="flex gap-3 pt-4 justify-end">
            <button
              onClick={() => setConfirmModal({ isOpen: false, product: null })}
              className="px-6 py-2.5 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all text-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteProduct(confirmModal.product)}
              className="px-6 py-2.5 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-lg active:scale-95"
            >
              Archive Now
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: "" })}
        title="Error"
      >
        <div className="space-y-4">
          <p className="text-red-600 font-medium">{errorModal.message}</p>
        </div>
      </Modal>
    </>
  )
}