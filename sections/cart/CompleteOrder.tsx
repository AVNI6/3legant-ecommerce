// // // const CompleteOrder = () => {
// // //     return ( 
// // //          <div className="text-center my-20">
// // //       <h1 className="text-[#777E90] text-[28px]">
// // //         Thank you! 🎉
// // //       </h1>
// // //       <h1 className="text-[40px] font-medium">
// // //         Your order has been received
// // //       </h1>

// // //       <div className="text-[#6C7275] font-semibold my-6 space-y-2">
// // //         <p>Order code: #12345</p>
// // //         <p>Date: 20/02/2026</p>
// // //         <p>Total: $500.00</p>
// // //         <p>Payment method: Card</p>
// // //       </div>

// // //       <button className="bg-black text-white px-9 py-4 rounded-full">
// // //         Purchase history
// // //       </button>
// // //     </div>
// // //      );
// // // }
 
// // // export default CompleteOrder;

// // type Props = { total: number };

// // export default function CompleteOrder({ total }: Props) {
// //   return (
// //     <div className="text-center my-20">
// //       <h1 className="text-green-600 text-2xl">Thank you 🎉</h1>
// //       <h2 className="text-4xl font-semibold">Order Received</h2>

// //       <div className="text-gray-500 my-6">
// //         <p>Order Code: #{Math.floor(Math.random() * 100000)}</p>
// //         <p>Date: {new Date().toLocaleDateString()}</p>
// //         <p>Total: ${total}</p>
// //       </div>

// //       <button className="bg-black text-white px-10 py-4 rounded">
// //         Purchase History
// //       </button>
// //     </div>
// //   );
// // }

// import { formatCurrency } from "@/constants/Data"
// import { useCart } from "@/sections/cart/context/CartContext"
// import { useEffect } from "react"
// export default function CompleteOrder() {
//   const { total, clearCart } = useCart()

//   useEffect(() => {
//     clearCart()
//   }, [])

//   return (
//     <div className="text-center my-20">
//       <h1 className="text-green-600 text-2xl">Thank you</h1>
//       <h2 className="text-4xl font-semibold">Order Received</h2>

//       <div className="text-gray-500 my-6">
//         <p>Order Code: #{Math.floor(Math.random() * 100000)}</p>
//         <p>Date: {new Date().toLocaleDateString()}</p>
//        <p>Total: {formatCurrency(total)}</p>
//       </div>

//        <button
//         onClick={() => (window.location.href = "/pages/account/order")}
//         className="bg-black text-white px-10 py-4 rounded"
//       >
//         Purchase History
//       </button>
//     </div>
//   )
// }


import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { formatCurrency } from "@/constants/Data"

interface Order {
  id: number
  user_id: string
  items: any
  total_price: number
  status: string
  order_date: string
  shipping_address: any
  payment_method: string
}

export default function CompleteOrder() {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLatestOrder = async () => {
      setLoading(true)
      // get the current logged-in user
      const {
        data: { user },
        error: sessionError,
      } = await supabase.auth.getUser()

      if (sessionError || !user) {
        console.error("User not logged in", sessionError)
        setLoading(false)
        return
      }

      // fetch the latest order for this user
      const { data, error } = await supabase
        .from<Order>("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("order_date", { ascending: false })
        .limit(1)
        .single()

      if (error) {
        console.error("Failed to fetch latest order:", error.message)
        setOrder(null)
      } else {
        setOrder(data)
      }
      setLoading(false)
    }

    fetchLatestOrder()
  }, [])

  if (loading) return <p>Loading your order...</p>
  if (!order) return <p>No recent order found!</p>

  return (
    <div className="text-center my-20">
      <h1 className="text-green-600 text-2xl">Thank you</h1>
      <h2 className="text-4xl font-semibold">Order Received</h2>

      <div className="text-gray-500 my-6">
        <p>Order Code: #{order.id}</p>
        <p>Date: {new Date(order.order_date).toLocaleDateString()}</p>
        <p>Total: {formatCurrency(order.total_price)}</p>
        <p>Status: {order.status}</p>
      </div>

      <button
        onClick={() => (window.location.href = "/pages/account/order")}
        className="bg-black text-white px-10 py-4 rounded"
      >
        Purchase History
      </button>
    </div>
  )
}