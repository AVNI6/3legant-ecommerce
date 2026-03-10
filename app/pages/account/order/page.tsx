// "use client";

// import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabase/client";
// import { formatCurrency } from "@/constants/Data";

// type Order = {
//   id: number;
//   order_date: string;
//   total_price: number;
//   status: string;
// };

// export default function Orders() {
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchOrders = async () => {
//       const {
//         data: { session },
//       } = await supabase.auth.getSession();
//       const userId = session?.user?.id;
//       if (!userId) {
//         setLoading(false);
//         return;
//       }

//       const { data, error } = await supabase
//         .from("orders")
//         .select("*")
//         .eq("user_id", userId)
//         .order("order_date", { ascending: false });

//       if (error) {
//         console.log("Fetch orders error:", error);
//       } else {
//         setOrders(data as Order[]);
//       }
//       setLoading(false);
//     };

//     fetchOrders();
//   }, []);

//   if (loading) return <p>Loading...</p>;

//   if (orders.length === 0)
//     return (
//       <div>
//         <h2 className="text-xl font-semibold mb-4">Orders</h2>
//         <p className="text-gray-500">No orders yet.</p>
//       </div>
//     );

//   return (
//     <div>
//       <h2 className="text-xl font-semibold mb-6">Order History</h2>

//       <div className="space-y-4">
//         {orders.map((order) => (
//           <div
//             key={order.id}
//             className="border rounded p-4 flex justify-between items-center"
//           >
//             <div>
//               <p>
//                 <span className="font-semibold">Order Code:</span> #{order.id}
//               </p>
//               <p>
//                 <span className="font-semibold">Date:</span>{" "}
//                 {new Date(order.order_date).toLocaleDateString()}
//               </p>
//               <p>
//                 <span className="font-semibold">Status:</span> {order.status}
//               </p>
//             </div>

//             <div className="text-lg font-semibold">
//               {formatCurrency(order.total_price)}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { formatCurrency } from "@/constants/Data";

type Order = {
  id: number;
  order_date: string;
  total_price: number;
  status: string;
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const userId = session?.user?.id;

      if (!userId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("order_date", { ascending: false });

      if (error) {
        console.log("Fetch orders error:", error);
      } else {
        setOrders(data as Order[]);
      }

      setLoading(false);
    };

    fetchOrders();
  }, []);

  if (loading) return <p>Loading...</p>;

  if (orders.length === 0)
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Orders</h2>
        <p className="text-gray-500">No orders yet.</p>
      </div>
    );

  return (
    <div className="w-full">

      <h2 className="text-2xl font-semibold mb-6">Order History</h2>

      {/* DESKTOP TABLE HEADER */}
      <div className="hidden md:grid grid-cols-[3fr_3fr_3fr_3fr] text-gray-500 border-b pb-3">
        <p>Number ID</p>
        <p>Dates</p>
        <p>Status</p>
        <p>Price</p>
      </div>

      {/* ORDERS */}
      <div className="divide-y">

        {orders.map((order) => (

          <div
            key={order.id}
            className="py-4 md:py-5"
          >

            {/* MOBILE VIEW */}
            <div className="md:hidden space-y-1">

              <p className="font-semibold">#{order.id}</p>

              <p className="text-gray-500 text-sm">
                {new Date(order.order_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>

              <p className="text-sm">
                Status: <span className="font-medium">{order.status}</span>
              </p>

              <p className="font-semibold">
                {formatCurrency(order.total_price)}
              </p>

            </div>

            {/* DESKTOP VIEW */}
            <div className="hidden md:grid grid-cols-[3fr_3fr_3fr_3fr] items-center">

              <p className="font-medium">#{order.id}</p>

              <p>
                {new Date(order.order_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>

              <p>{order.status}</p>

              <p className="font-medium">
                {formatCurrency(order.total_price)}
              </p>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}