// // // "use client";

// // // import { useCart } from "@/sections/cart/context/CartContext";
// // // import { RxCross2 } from "react-icons/rx";
// // // import { formatCurrency } from "@/constants/Data";

// // // export default function Wishlist() {
// // //   const { wishlistItems, removeWishlistItem, addToCart } = useCart();

// // //   if (wishlistItems.length === 0) {
// // //     return (
// // //       <div className="">
// // //         <h2 className="text-xl font-semibold mb-4">Wishlist</h2>
// // //         <p className="text-gray-500">Your wishlist is empty.</p>
// // //       </div>
// // //     );
// // //   }

// // //   return (
// // //     <div className="">
// // //       <h2 className="text-xl font-semibold mb-6">Wishlist</h2>
// // //       <div className="grid grid-cols-[2fr_4fr_2fr] border-b pb-4 text-gray-500 font-medium items-center">
// // //         <div>Product</div>
// // //         <div className="text-center">Price</div>
// // //         <div className="text-left">Action</div>
// // //       </div>

// // //       {wishlistItems.map((item) => (
// // //         <div  key={`${item.id}-${item.color}`}
// // //           className="grid grid-cols-[2fr_4fr_2fr] items-center border-b border-gray-300 py-5 gap-2"  >
// // //           <div className="flex items-center gap-4">
// // //             <button onClick={() => removeWishlistItem(item.id)} className="text-gray-400 hover:text-red-500">
// // //               <RxCross2 size={20} />
// // //             </button>
// // //             <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded"   />
// // //             <div>
// // //               <p className="font-semibold">{item.name}</p>
// // //               <p className="text-gray-400 text-sm">Color: {item.color}</p>
// // //             </div>
// // //           </div>
// // //           <div className="text-center font-semibold">
// // //             {formatCurrency(item.price)}
// // //           </div>
// // //           <div className="flex justify-start">
// // //             <button
// // //               onClick={() =>
// // //                 addToCart({
// // //                   id: item.id,
// // //                   name: item.name,
// // //                   price: item.price,
// // //                   image: item.image,
// // //                   color: item.color,
// // //                 })
// // //               }
// // //               className="bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-800 transition"
// // //             >
// // //               Add to Cart
// // //             </button>
// // //           </div>
// // //         </div>
// // //       ))}
// // //     </div>
// // //   );
// // // }/


"use client";
import { useCart } from "@/sections/cart/context/CartContext";
import { RxCross2 } from "react-icons/rx";
import { formatCurrency } from "@/constants/Data";
import { useRequireLogin } from "@/lib/supabase/context/useRequireLogin";

export default function Wishlist() {
  const { wishlistItems, removeWishlistItem, addToCart, user } = useCart();
  const { requireLogin, LoginModal } = useRequireLogin();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Wishlist</h2>
      {wishlistItems.length === 0 && <p className="text-gray-500 mb-4">Your wishlist is empty.</p>}

      {wishlistItems.map(item => (
        <div key={`${item.id}-${item.color}`} className="grid grid-cols-[2fr_4fr_2fr] items-center border-b border-gray-300 py-5 gap-2">
          <div className="flex items-center gap-4">
            <button onClick={() => removeWishlistItem(item.id)} className="text-gray-400 hover:text-red-500">
              <RxCross2 size={20} />
            </button>
            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-gray-400 text-sm">Color: {item.color}</p>
            </div>
          </div>
          <div className="text-center font-semibold">{formatCurrency(item.price)}</div>
          <div>
            <button
              onClick={() => requireLogin(() => addToCart(item), user)}
              className="bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-800 transition"
            >
              Add to Cart
            </button>
          </div>
        </div>
      ))}

      <LoginModal />
    </div>
  );
}