"use client";

import { useParams } from "next/navigation";
import { formatCurrency } from "@/constants/Data";
import { useProducts } from "@/lib/supabase/context/ProductContext";
import { APP_ROUTE } from "@/constants/AppRoutes";
import { useCart } from "@/sections/cart/context/CartContext";
import Link from "next/link";
import { useState } from "react";
import ProductGallery from "@/components/ProductGallery";
import OfferCountdown from "@/components/OfferCountdown";
import ColorSelector from "@/sections/ColorSelector";
import { GoHeart, GoHeartFill } from "react-icons/go";
import ReviewTab from "@/sections/account/ReviewTab";
import Additional from "@/sections/account/Additional";
import Question from "@/sections/account/Question";
const colorImages = [
  { id: 1, image: "/color/c1.png" },
  { id: 2, image: "/color/c2.png" },
  { id: 3, image: "/color/c3.png" },
  { id: 4, image: "/color/c4.png" }
];

export default function ProductPage() {
  const params = useParams();
  const id = Number(params.id);

  const { products } = useProducts();
  const product = products.find((p) => p.id === id);

  const { addToCart } = useCart();
  const { addToWishlist, removeWishlistItem, wishlistItems, user  } = useCart();
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState("reviews");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [colorImage, setColorImage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false)


  if (!product) return <div className="p-10">Product not found</div>;

  const baseImages = [
    product.image,
    ...(product.thumbnails ? Object.values(product.thumbnails) : [])
  ];

  const mainImage = colorImage || baseImages[currentIndex];

 const isInWishlist = wishlistItems.some(
  item => item.id === product.id && item.color === product.color
)

const handleWishlist = () => {
  if (!user) {
    setShowModal(true)
    return
  }

  if (isInWishlist) {
    removeWishlistItem(product.id)
  } else {
    addToWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      color: product.color
    })
  }
}

  return (
    <div className="mx-5 sm:mx-10 lg:mx-30">
      <div className="text-sm text-gray-500 mb-6">
        <Link href="/">Home</Link> &gt;{" "}
        <Link href={APP_ROUTE.product}>Shop</Link> &gt;{" "}
        <Link href={{ pathname: APP_ROUTE.product, query: { category: product.category }, }} >
          {product.category}
        </Link> &gt;{" "}
        {/* <Link href={APP_ROUTE.product}>{product.category}</Link> &gt;{" "} */}
        <span className="text-black">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-10">

        <ProductGallery
          images={baseImages}
          product={product}
          currentIndex={currentIndex}
          setCurrentIndex={(i: number) => {
            setCurrentIndex(i);
            setColorImage(null);
          }}
          mainImage={mainImage}
        />

        <div>
          <h1 className="text-3xl font-semibold">{product.name}</h1>
          <p className="text-gray-600 mt-3">{product.description}</p>

          <div className="flex gap-4 mt-4 text-xl">
            <span className="font-bold">{formatCurrency(product.price)}</span>
            <span className="line-through text-gray-400">{formatCurrency(product.oldPrice)}</span>
          </div>

          <hr className="text-gray-300 my-6" />
          <OfferCountdown validationTill={product.validationTill} />
          <hr className="text-gray-300 my-6" />

          <div>
            <h1 className="text-[#6C7275] font-semibold">Measurements</h1>
            <p className="tracking-widest">{product.measurements}</p>
          </div>

          <ColorSelector
            colors={colorImages}
            selected={colorImages.find(c => c.image === colorImage)?.id || null}
            onSelect={(id) => {
              const img = colorImages.find(c => c.id === id)?.image;
              if (img) setColorImage(img);
            }} />

          <div className="flex gap-4 items-center">
            <div className="flex bg-[#F5F5F5] rounded-md p-2">
              <button onClick={() => setQty(qty > 1 ? qty - 1 : 1)} className="px-3">-</button>
              <span className="px-4">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-3">+</button>
            </div>
            {/* <button className="border rounded-lg w-full flex items-center justify-center gap-1 px-6 py-2"> <GoHeart /> Wishlist</button> */}
            <button
              onClick={handleWishlist}
              className="border rounded-lg w-full flex items-center justify-center gap-1 px-6 py-2 transition"
            >
              {isInWishlist ? (
                <GoHeartFill className="text-red-500" />
              ) : (
                <GoHeart />
              )}
              Wishlist
            </button>

          </div>

          <button
            onClick={() =>
              addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                color: product.color
              })
            }
            className="bg-black rounded-lg text-white w-full py-3 mt-4" >
            Add to Cart
          </button>
          <hr className="text-gray-300 my-6" />

          <div className="space-y-2">
            <div className="flex items-center gap-10">
              <span className="text-gray-500 font-medium w-24">SKU</span>
              <span>{product.id}</span>
            </div>
            <div className="flex items-center gap-10">
              <span className="text-gray-500 font-medium w-24">Category</span>
              <span>{product.category}</span>
            </div>
          </div>
        </div>
      </div>
      {showModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div className="bg-white p-6 rounded-lg w-[90%] max-w-sm text-center shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Sign In Required</h3>

      <p className="text-gray-600 mb-6">
        Please sign in to add items to wishlist.
      </p>

      <Link
        href={APP_ROUTE.signin}
        className="bg-black text-white px-5 py-2 rounded-lg"
      >
        Go to Sign In
      </Link>

      <button
        onClick={() => setShowModal(false)}
        className="block mt-4 text-gray-500 underline"
      >
        Cancel
      </button>
    </div>
  </div>
)}

      <div className="flex gap-8 mt-12 border-b">
        {["additional", "questions", "reviews"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 capitalize ${tab === t ? "border-b-2 border-black font-semibold" : ""}`}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "additional" && <Additional product={product} />}
      {tab === "questions" && <Question />}
      {tab === "reviews" && <ReviewTab />}
    </div>
  );
}
// "use client";

// import { useParams } from "next/navigation";
// import { formatCurrency, products } from "@/constants/Data";
// import { APP_ROUTE } from "@/constants/AppRoutes";
// import { useCart } from "@/sections/cart/context/CartContext";
// import Link from "next/link";
// import { useState } from "react";
// import ProductGallery from "@/components/ProductGallery";
// import OfferCountdown from "@/components/OfferCountdown";
// import ColorSelector from "@/sections/ColorSelector";
// import { GoHeart, GoHeartFill } from "react-icons/go";
// import ReviewTab from "@/sections/account/ReviewTab";
// import Additional from "@/sections/account/Additional";
// import Question from "@/sections/account/Question";
// const colorImages = [
//   { id: 1, image: "/color/c1.png" },
//   { id: 2, image: "/color/c2.png" },
//   { id: 3, image: "/color/c3.png" },
//   { id: 4, image: "/color/c4.png" }
// ];

// export default function ProductPage() {
//   const params = useParams();
//   const id = Number(params.id);

//   const product = products.find((p) => p.id === id);
//   const { addToCart } = useCart();
//   const { addToWishlist, removeWishlistItem, wishlistItems } = useCart();
//   const [qty, setQty] = useState(1);
//   const [tab, setTab] = useState("reviews");
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [colorImage, setColorImage] = useState<string | null>(null);


//   if (!product) return <div className="p-10">Product not found</div>;

//   const baseImages = [
//     product.image,
//     ...(product.thumbnails ? Object.values(product.thumbnails) : [])
//   ];

//   const mainImage = colorImage || baseImages[currentIndex];

//   const isInWishlist = wishlistItems.some(
//     (item) => item.id === product.id && item.color === product.color
//   );

//   return (
//     <div className="mx-5 sm:mx-10 lg:mx-30">
//       <div className="text-sm text-gray-500 mb-6">
//         <Link href="/">Home</Link> &gt;{" "}
//         <Link href={APP_ROUTE.product}>Shop</Link> &gt;{" "}
//         <Link href={APP_ROUTE.product}>{product.category}</Link> &gt;{" "}
//         <span className="text-black">{product.name}</span>
//       </div>

//       <div className="grid md:grid-cols-2 gap-10">

//         <ProductGallery
//           images={baseImages}
//           product={product}
//           currentIndex={currentIndex}
//           setCurrentIndex={(i: number) => {
//             setCurrentIndex(i);
//             setColorImage(null);
//           }}
//           mainImage={mainImage}
//         />

//         <div>
//           <h1 className="text-3xl font-semibold">{product.name}</h1>
//           <p className="text-gray-600 mt-3">{product.description}</p>

//           <div className="flex gap-4 mt-4 text-xl">
//             <span className="font-bold">{formatCurrency(product.price)}</span>
//             <span className="line-through text-gray-400">{formatCurrency(product.oldPrice)}</span>
//           </div>

//           <hr className="text-gray-300 my-6" />
//           <OfferCountdown />
//           <hr className="text-gray-300 my-6" />

//           <div>
//             <h1 className="text-[#6C7275] font-semibold">Measurements</h1>
//             <p className="tracking-widest">{product.measurements}</p>
//           </div>

//           <ColorSelector
//             colors={colorImages}
//             selected={colorImages.find(c => c.image === colorImage)?.id || null}
//             onSelect={(id) => {
//               const img = colorImages.find(c => c.id === id)?.image;
//               if (img) setColorImage(img);
//             }} />

//           <div className="flex gap-4 items-center">
//             <div className="flex bg-[#F5F5F5] rounded-md p-2">
//               <button onClick={() => setQty(qty > 1 ? qty - 1 : 1)} className="px-3">-</button>
//               <span className="px-4">{qty}</span>
//               <button onClick={() => setQty(qty + 1)} className="px-3">+</button>
//             </div>
//             {/* <button className="border rounded-lg w-full flex items-center justify-center gap-1 px-6 py-2"> <GoHeart /> Wishlist</button> */}
//             <button
//               onClick={() => {
//                 if (isInWishlist) {
//                   removeWishlistItem(product.id);
//                 } else {
//                   addToWishlist({
//                     id: product.id,
//                     name: product.name,
//                     price: product.price,
//                     image: product.image,
//                     color: product.color,
//                   });
//                 }
//               }}
//               className="border rounded-lg w-full flex items-center justify-center gap-1 px-6 py-2 transition"
//             >
//               {isInWishlist ? (
//                 <GoHeartFill className="text-red-500" />
//               ) : (
//                 <GoHeart />
//               )}
//               Wishlist
//             </button>

//           </div>

//           <button
//             onClick={() =>
//               addToCart({
//                 id: product.id,
//                 name: product.name,
//                 price: product.price,
//                 image: product.image,
//                 color: product.color
//               })
//             }
//             className="bg-black rounded-lg text-white w-full py-3 mt-4" >
//             Add to Cart
//           </button>
//           <hr className="text-gray-300 my-6" />

//           <div className="space-y-2">
//             <div className="flex items-center gap-10">
//               <span className="text-gray-500 font-medium w-24">SKU</span>
//               <span>{product.id}</span>
//             </div>
//             <div className="flex items-center gap-10">
//               <span className="text-gray-500 font-medium w-24">Category</span>
//               <span>{product.category}</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="flex gap-8 mt-12 border-b">
//         {["additional", "questions", "reviews"].map((t) => (
//           <button
//             key={t}
//             onClick={() => setTab(t)}
//             className={`pb-3 capitalize ${tab === t ? "border-b-2 border-black font-semibold" : ""}`}
//           >
//             {t}
//           </button>
//         ))}
//       </div>
//       {tab === "additional" && <Additional product={product} />}
//       {tab === "questions" && <Question />}
//       {tab === "reviews" && <ReviewTab />}
//     </div>
//   );
// }