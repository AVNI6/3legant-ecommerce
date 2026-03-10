// "use client"
// // import CheckoutDetail from "@/sections/cart/CheckoutDetail";
// // import { PiColumnsFill } from "react-icons/pi";

// import CheckoutDetail from "@/sections/cart/CheckoutDetail";
// import CompleteOrder from "@/sections/cart/CompleteOrder";
// import ShoppingCart from "@/sections/cart/ShoppingCart";
// import { useState } from "react";


// // import ArticlePage from "@/sections/home/articlepage";
// // import Newsletter from "@/sections/home/newsletter";

// // const page = () => {

// //     const steps = [
// //         { number: 1, title: "Shopping cart" },
// //         { number: 2, title: "Checkout details" },
// //         { number: 3, title: "Order complete" },
// //     ];



// //     return (
// //         <>
// //             <div className="text-center ">
// //                 <h1 className="font-medium text-[54px]">Cart</h1>
// //             </div>

// //             {/* Steps */}
// //             <div className="flex items-center justify-center gap-40 my-10">
// //                 {steps.map((step, index) => (
// //                     <div
// //                         key={index}
// //                         className="flex items-center gap-4 group pb-5"
// //                     >
// //                         <div className="bg-[#B1B5C3] text-white group-hover:bg-black h-10 w-10 rounded-full flex items-center justify-center">
// //                             {step.number}
// //                         </div>
// //                         <h1 className="text-[#B1B5C3] font-semibold group-hover:text-black">
// //                             {step.title}
// //                         </h1>
// //                     </div>
// //                 ))}
// //             </div>



// //             {/* <div className="text-center">
// //                 <h1 className=" font-medium text-bold text-[54px]">Cart</h1>
// //             </div>
// //             <div className=" flex items-center justify-center gap-40 my-10 ">
// //                 {data.map((key, value) => {
// //                     return (<div key={value} className="flex items-center justify-center gap-4 group pb-5 ">
// //                         <div className="bg-[#B1B5C3] text-white group-hover:bg-black group hover:text-white h-10 w-10 rounded-4xl  flex items-center justify-center">{key.number}</div>
// //                         <h1 className="text-[#B1B5C3] font-semibold group-hover:text-black">{key.title}</h1>
// //                     </div>)

// //                 })}
// //             </div>
// //             {/* <div className="flex gap-10 mx-30">
// //                 <div className="">
// //                     <div className="flex gap-80 border-b-3 pb-5">
// //                         <div>Product</div>
// //                         <div className="flex gap-30">
// //                             <div>Quantity</div>
// //                             <div>Price</div>
// //                             <div>Sub Total</div>
// //                         </div>
// //                     </div>
// //                     <div>1</div>
// //                     <div>2</div>
// //                     <div>3</div>
// //                 </div>

// //                 <aside className="border rounded p-5">
// //                     <h1 className="pb-3 font-semibold">Cart Summary</h1>
// //                     {cart.map((key, value) => {
// //                         return (
// //                             <div key={value} className="flex justify-between gap-30 border rounded p-3 mb-2">
// //                                 <div className="flex gap-2"> <input type='radio' />{key.name}</div>
// //                                 <p>{key.price}</p>
// //                             </div>
// //                         )
// //                     })}

// //                     <div className="flex justify-between p-2 border-b border-[#EAEAEA]">
// //                         <h1>Sub Total</h1>
// //                         <p>$123.00</p>
// //                     </div>
// //                     <div className="flex justify-between p-2 font-semibold ">
// //                         <h1>Total</h1>
// //                         <p>$1289.00</p>
// //                     </div>
// //                     <button className="bg-black text-white py-3 w-full rounded-lg">Checkout</button>
// //                 </aside>

// //             </div>
// //             <div className="mx-30 my-10 leading-9">
// //                 <h1 className="font-medium font-semibold">Have a coupon?</h1>
// //                 <h2 className="text-[#6C7275]">Add your code for an instant cart discount</h2>
// //                 <div className="flex border w-fit px-3 border-[#6C7275]">
// //                     <div className="flex items-center gap-1">
// //                         <RiCoupon4Line />
// //                         <input placeholder="Coupon Code" className="focus:outline-none" />
// //                     </div>
// //                     <button>Apply</button>
// //                 </div>
// //             </div> */}


// //             {/* <CheckoutDetail/> */}

// //             {/* <div className="">
// //                 <h1 className="text-[#777E90] text-medium text-[28px]">Thank you! 🎉</h1>
// //                 <h1 className="text-medium text-[40px]">Your order has been received</h1>
// //             </div>
// //             <div className="text-[#6C7275] font-semibold">
// //                 <p>Order code:</p>
// //                 <p>Date:</p>
// //                 <p>Total:</p>
// //                 <p>Payment method</p>
// //             </div>
// //             <button className="bg-black text-white px-9 py-4 rounded-4xl">Purchase history</button> */}



// //             <ArticlePage />
// //             <Newsletter />

// //         </>
// //     );
// // }
// // export default page;

// import StepIndicator from "@/sections/cart/StepIndicator";

// export type CartItem = {
//   id: number;
//   name: string;
//   color: string;
//   price: number;
//   quantity: number;
//   image: string;
// };


// const initialCartItems: CartItem[] = [
//   { id: 1, name: "Tray Table", color: "Black", price: 19, quantity: 2, image: "/products/P5.png" },
//   { id: 2, name: "Tray Table", color: "Red", price: 19, quantity: 2, image: "/products/P6.png" },
//   { id: 3, name: "Tray Table", color: "Black", price: 19, quantity: 2, image: "/products/P5.png" },
//   { id: 4, name: "Tray Table", color: "Red", price: 19, quantity: 2, image: "/products/P6.png" },
// ];

// export default function Page() {
//   const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
//   const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
//   const [shippingCost, setShippingCost] = useState(0);

//   const updateQuantity = (id: number, type: "inc" | "dec") => {
//     setCartItems(prev =>
//       prev.map(item =>
//         item.id === id
//           ? { ...item, quantity: Math.max(1, item.quantity + (type === "inc" ? 1 : -1)) }
//           : item
//       )
//     );
//   };

//   const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
//   const total = subtotal + shippingCost;

//   const removeItem = (id: number) => {
//     setCartItems(prev => prev.filter(item => item.id !== id));
//   };

//   return (
//     <div>
//       <div className="text-center ">
//         <h1 className="font-medium text-[54px]">Cart</h1>
//       </div>
//       <StepIndicator activeStep={activeStep} />

//       {activeStep === 1 && (
//         <ShoppingCart
//           cartItems={cartItems}
//           updateQuantity={updateQuantity}
//           subtotal={subtotal}
//           shippingCost={shippingCost}
//           setShippingCost={setShippingCost}
//           total={total}
//           onCheckout={() => setActiveStep(2)}
//           removeItem={removeItem}
//         />
//       )}

//       {activeStep === 2 && (
//         <CheckoutDetail
//           cartItems={cartItems}
//           subtotal={subtotal}
//           shippingCost={shippingCost}
//           total={total}
//           updateQuantity={updateQuantity}
//           onValidSubmit={() => setActiveStep(3)}
//           removeItem={removeItem}
//         />
//       )}

//       {activeStep === 3 && (
//         <CompleteOrder total={total} />
//       )}
//     </div>
//   );
// }
"use client"
import CheckoutDetail from "@/sections/cart/CheckoutDetail";
import CompleteOrder from "@/sections/cart/CompleteOrder";
import ShoppingCart from "@/sections/cart/ShoppingCart";
import StepIndicator from "@/sections/cart/StepIndicator"
import { CartProvider, useCart } from "@/sections/cart/context/CartContext"

function CartContent() {
  const { activeStep } = useCart()

  return (
    <>
      <div className="text-center">
        <h1 className="font-medium text-[54px]">Cart</h1>
      </div>

      <StepIndicator/>

      {activeStep === 1 && <ShoppingCart />}
      {activeStep === 2 && <CheckoutDetail />}
      {activeStep === 3 && <CompleteOrder />}
    </>
  )
}

export default function Page() {
  return (
 
      <CartContent />

  )
}