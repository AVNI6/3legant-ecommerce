"use client"

import { supabase } from "@/lib/supabase/client"

export default function ProductTable({products,refresh}:any){

  const deleteProduct = async(product:any)=>{
    if(!confirm("Archive this product? It will be removed from the shop but kept in the database for order history.")) return

    const { error } = await supabase
      .from("products")
      .update({ is_deleted: true })
      .eq("id", product.id)

    if (error) {
      alert("Error archiving product: " + error.message)
    } else {
      refresh()
    }
  }

  return(

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
        {products.map((p:any)=>(
          <tr key={p.id} className="border-b">
            <td className="p-4">
              <img src={p.image} className="w-16 h-16 object-cover"/>
            </td>
            <td>{p.name}</td>
            <td>${p.price}</td>
            <td>{p.category}</td>
            <td>{p.color || "-"} / {p.size || "-"}</td>
            <td>

              <button onClick={()=>deleteProduct(p)} className="text-red-500">
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

  )
}