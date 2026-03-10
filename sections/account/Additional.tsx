"use client"

import BlackShopButton from "@/components/blackbutton";
import Products from "@/components/products";
import { useProducts } from "@/lib/supabase/context/ProductContext";
import { ProductType } from "@/constants/Data";

type Props = {
  product: ProductType
}

const Additional = ({ product }: Props) => {

  const { products } = useProducts()

  const relatedProducts = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  )

  return (
    <div className="mt-6 space-y-4">
      <h3 className="font-semibold text-lg mb-2">Product Details</h3>

      <div className="pt-5 flex flex-col gap-8 text-sm text-gray-700">
        <div>
          <p className="text-gray-500">SKU</p>
          <p className="font-semibold">{product.id}</p>
        </div>

        <div>
          <p className="text-gray-500">Category</p>
          <p className="font-semibold">{product.category}</p>
        </div>

        <div>
          <p className="text-gray-500">Dimensions</p>
          <p className="font-semibold">{product.measurements || "N/A"}</p>
        </div>
      </div>

      <div className="my-10 mr-0">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-poppins font-medium text-[28px]">
            You might also like
          </h1>

          <BlackShopButton
            content="More Products"
            className="text-[16px]"
          />
        </div>

        <Products products={relatedProducts} variant="scroll" />
      </div>
    </div>
  )
}

export default Additional;
// import BlackShopButton from "@/components/blackbutton";
// import Products from "@/components/products";
// import { products, ProductType } from "@/constants/Data";

// type Props = {
//     product: ProductType
// }
// const Additional = ({ product }: Props) => {
//     return (
//         <div className="mt-6 space-y-4">
//             <h3 className="font-semibold text-lg mb-2">Product Details</h3>
//             <div className="pt-5 flex flex-col gap-8 text-sm text-gray-700">
//                 <div>
//                     <p className="text-gray-500">SKU</p>
//                     <p className="font-semibold">{product.id}</p>
//                 </div>
//                 <div>
//                     <p className="text-gray-500">Category</p>
//                     <p className="font-semibold">{product.category}</p>
//                 </div>
//                 <div>
//                     <p className="text-gray-500">Dimensions</p>
//                     <p className="font-semibold">{product.measurements || "N/A"}</p>
//                 </div>
//             </div>
//             <div className="my-10 mr-0">
//                  <div className="flex justify-between items-center mb-8">
//                     <h1 className="font-poppins font-medium text-[28px]">You might also like</h1>
//                     <BlackShopButton content="More Products" className="text-[16px]"/>
//                  </div>
//                 <Products products={products} variant="scroll"/>
//             </div>
//         </div>
//     );
// }

// export default Additional;