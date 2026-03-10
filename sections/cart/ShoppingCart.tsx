// import { formatCurrency } from "@/constants/Data"
// import { useCart } from "@/sections/cart/context/CartContext"
// import { RiCoupon4Line } from "react-icons/ri"
// import { RxCross2 } from "react-icons/rx"

// export default function ShoppingCart() {
//   const {
//     cartItems,
//     updateQuantity,
//     subtotal,
//     shippingCost,
//     setShippingCost,
//     total,
//     setActiveStep,
//     removeItem,
//   } = useCart()

//   const shippingOptions = [
//     { id: 1, name: "Free Shipping", price: 0 },
//     { id: 2, name: "Express Shipping", price: 15 },
//     { id: 3, name: "Pickup (+21%)", price: subtotal * 0.21 },
//   ]

//   return (
//     <>
//       <div className="grid grid-cols-3 gap-15 px-30">
//         <div className="col-span-2">

//           <div className="grid grid-cols-[3fr_1fr_1fr_1fr] border-b text-gray-500 py-4 font-medium">
//             <div className="pl-6">Product</div>
//             <div className="text-center">Quantity</div>
//             <div className="text-center">Price</div>
//             <div className="text-right pr-6">Subtotal</div>
//           </div>

//           {cartItems.map(item => (
//             <div key={`${item.id}-${item.color}`} className="grid grid-cols-[3fr_1fr_1fr_1fr] border-b py-6 items-center">

//               <div className="flex gap-4 items-center pl-6">
//                 <img src={item.image} className="w-20 h-20 object-cover" />
//                 <div>
//                   <p className="font-semibold">{item.name}</p>
//                   <p className="text-gray-400 text-sm">Color: {item.color}</p>
//                   <button
//                     onClick={() => removeItem(item.id)}
//                     className="flex gap-1 items-center text-gray-400 text-[14px] hover:text-red-500 transition"
//                   >
//                     <RxCross2 />
//                     Remove
//                   </button>
//                 </div>
//               </div>

//               <div className="flex justify-center">
//                 <div className="border flex w-fit px-3 py-1 rounded">
//                   <button onClick={() => updateQuantity(item.id, "dec")}>-</button>
//                   <span className="px-4">{item.quantity}</span>
//                   <button onClick={() => updateQuantity(item.id, "inc")}>+</button>
//                 </div>
//               </div>

//           <div className="text-center">{formatCurrency(item.price)}</div>

//               <div className="font-semibold text-right pr-6">
//                 {formatCurrency(item.price * item.quantity)}
//               </div>

//             </div>
//           ))}
//         </div>

//         <aside className="border p-6 rounded-lg h-fit lg:sticky lg:top-24">
//           <h2 className="font-semibold text-lg mb-6">Cart Summary</h2>

//           <div className="space-y-3">
//             {shippingOptions.map(option => (
//               <label key={option.id} className="flex justify-between items-center border p-3 rounded cursor-pointer">
//                 <div className="flex items-center gap-1">
//                   <input
//                     type="radio"
//                     name="shipping"
//                     onChange={() => setShippingCost(option.price)}
//                   />
//                   <span>{option.name}</span>
//                 </div>
//                 <span className="font-medium">
//                   {option.price === 0 ? "Free" : `+${formatCurrency(option.price)}`}
//                 </span>
//               </label>
//             ))}
//           </div>

//           <div className="space-y-3 border-t pt-6 mt-6">
//             <div className="flex justify-between">
//               <span>Subtotal</span>
//               <span>{formatCurrency(subtotal)}</span>
//             </div>
//             <div className="flex justify-between">
//               <span>Shipping</span>
//               <span>{formatCurrency(shippingCost)}</span>
//             </div>
//             <div className="flex justify-between font-bold text-lg">
//               <span>Total</span>
//               <span>{formatCurrency(total)}</span>
//             </div>
//           </div>

//           <button
//             className="bg-black text-white w-full py-3 mt-6"
//             onClick={() => setActiveStep(2)}
//           >
//             Checkout
//           </button>
//         </aside>
//       </div>

//       <div className="mx-30 my-10 leading-9">
//         <h1 className="font-medium text-[21px]">Have a coupon?</h1>
//         <h2 className="text-[#6C7275] text-[16px]">Add your code for an instant cart discount</h2>
//         <div className="flex border w-fit px-3 gap-25 border-[#6C7275]">
//           <div className="flex items-center gap-2">
//             <RiCoupon4Line />
//             <input placeholder="Coupon Code" className="focus:outline-none" />
//           </div>
//           <button>Apply</button>
//         </div>
//       </div>
//     </>
//   )
// }

import { formatCurrency } from "@/constants/Data"
import { useCart } from "@/sections/cart/context/CartContext"
import { RiCoupon4Line } from "react-icons/ri"
import { RxCross2 } from "react-icons/rx"

export default function ShoppingCart() {
  const {
    cartItems,
    updateQuantity,
    subtotal,
    shippingCost,
    setShippingCost,
    total,
    setActiveStep,
    removeItem,
  } = useCart()

  const shippingOptions = [
    { id: 1, name: "Free Shipping", price: 0 },
    { id: 2, name: "Express Shipping", price: 15 },
    { id: 3, name: "Pickup (+21%)" },
  ]
  const handleShippingChange = (id: number) => {
    if (id === 1) setShippingCost(0)
    else if (id === 2) setShippingCost(15)
    else if (id === 3) setShippingCost((subtotal ?? 0) * 0.21)
  }
  const handleCheckout = () => {
    if (shippingCost === null || shippingCost === undefined) {
      alert("Please select a shipping option before proceeding!")
      return
    }
    setActiveStep(2)
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-15 px-30">
        <div className="col-span-2">

          <div className="grid grid-cols-[3fr_1fr_1fr_1fr] border-b text-gray-500 py-4 font-medium">
            <div className="pl-6">Product</div>
            <div className="text-center">Quantity</div>
            <div className="text-center">Price</div>
            <div className="text-right pr-6">Subtotal</div>
          </div>

          {cartItems.map(item => (
            <div key={`${item.id}-${item.color}`} className="grid grid-cols-[3fr_1fr_1fr_1fr] border-b py-6 items-center">

              <div className="flex gap-4 items-center pl-6">
                <img src={item.image} className="w-20 h-20 object-cover" />
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-gray-400 text-sm">Color: {item.color}</p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex gap-1 items-center text-gray-400 text-[14px] hover:text-red-500 transition"
                  >
                    <RxCross2 />
                    Remove
                  </button>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="border flex w-fit px-3 py-1 rounded">
                  <button onClick={() => updateQuantity(item.id, "dec")}>-</button>
                  <span className="px-4">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, "inc")}>+</button>
                </div>
              </div>

              <div className="text-center">{formatCurrency(item.price)}</div>

              <div className="font-semibold text-right pr-6">
                {formatCurrency(item.price * item.quantity)}
              </div>

            </div>
          ))}
        </div>

        <aside className="border p-6 rounded-lg h-fit lg:sticky lg:top-24">
          <h2 className="font-semibold text-lg mb-6">Cart Summary</h2>

          <div className="space-y-3">
            {shippingOptions.map(option => (
              <label
                key={option.id}
                className="flex justify-between items-center border p-3 rounded cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="shipping"
                    onChange={() => handleShippingChange(option.id)}
                    checked={
                      option.id === 3
                        ? shippingCost === (subtotal ?? 0) * 0.21
                        : shippingCost === option.price
                    }
                  />
                  <span>{option.name}</span>
                </div>
                <span className="font-medium">
                  {option.id === 1
                    ? "Free"
                    : option.id === 2
                      ? `+${formatCurrency(option.price ?? 0)}`
                      : `+${formatCurrency((subtotal ?? 0) * 0.21)}`}
                </span>
              </label>
            ))}
          </div>

          <div className="space-y-3 border-t pt-6 mt-6">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shippingCost !== null ? formatCurrency(shippingCost) : "-"}</span>
            </div>
           <div className="flex justify-between font-bold text-lg">
  <span>Total</span>
  <span>
    {formatCurrency(
      (subtotal ?? 0) +
      (shippingCost !== undefined ? shippingCost : 0)
    )}
  </span>
</div>
          </div>

          <button
            className={`w-full py-3 mt-6 ${shippingCost === null || shippingCost === undefined
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-black text-white"
              }`}
            onClick={handleCheckout}
            disabled={shippingCost === null || shippingCost === undefined}
          >
            Checkout
          </button>
        </aside>
      </div>

      <div className="mx-30 my-10 leading-9">
        <h1 className="font-medium text-[21px]">Have a coupon?</h1>
        <h2 className="text-[#6C7275] text-[16px]">Add your code for an instant cart discount</h2>
        <div className="flex border w-fit px-3 gap-25 border-[#6C7275]">
          <div className="flex items-center gap-2">
            <RiCoupon4Line />
            <input placeholder="Coupon Code" className="focus:outline-none" />
          </div>
          <button>Apply</button>
        </div>
      </div>
    </>
  )
}