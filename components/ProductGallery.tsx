// "use client";

// import Image from "next/image";
// import { IoMdArrowBack, IoMdArrowForward } from "react-icons/io";

// type Props = {
//   images: string[];
//   product: { name: string };
//   currentIndex: number;
//   setCurrentIndex: (i: number) => void;
//   mainImage: string;
// };

// export default function ProductGallery({ images, product, currentIndex, setCurrentIndex, mainImage }: Props) {
//   const next = () => {
//     setCurrentIndex((currentIndex + 1) % images.length);
//   };

//   const prev = () => {
//     setCurrentIndex((currentIndex - 1 + images.length) % images.length);
//   };
//   const thumbnails = images.filter((img) => img !== mainImage).slice(0, 3);

//   return (
//     <div className="w-full max-w-[547px]">
//       <div className="relative bg-gray-100 w-[547px] h-[640px]">
//         <button
//           onClick={prev}
//           className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white w-9 h-9 rounded-full shadow flex items-center justify-center"  >
//           <IoMdArrowBack />
//         </button>

//         <div className="flex justify-center w-full h-full relative">
//           <Image
//             src={mainImage}
//             alt={product.name}
//             fill
//             sizes="547px"
//             quality={200}
//             className="object-contain"
//             priority
//           />
//         </div>

//         <button
//           onClick={next}
//           className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white w-9 h-9 rounded-full shadow flex items-center justify-center"
//         >
//           <IoMdArrowForward />
//         </button>
//       </div>

//       <div className="mt-6 grid grid-cols-3 gap-4 w-[547px]">
//         {thumbnails.map((img, i) => {
//           const index = images.indexOf(img);
//           return (
//             <div
//               key={i}
//               onClick={() => setCurrentIndex(index)}
//               className="relative w-[167px] h-[167px] cursor-pointer overflow-hidden border border-gray-200">
//               <Image src={img} alt="" fill className="object-cover" />
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }


"use client";

import Image from "next/image";
import { IoMdArrowBack, IoMdArrowForward } from "react-icons/io";

type Props = {
  images: string[];
  product: { name: string };
  currentIndex: number;
  setCurrentIndex: (i: number) => void;
  mainImage: string;
};

export default function ProductGallery({
  images,
  product,
  currentIndex,
  setCurrentIndex,
  mainImage,
}: Props) {

  const next = () => {
    setCurrentIndex((currentIndex + 1) % images.length);
  };

  const prev = () => {
    setCurrentIndex((currentIndex - 1 + images.length) % images.length);
  };

  const thumbnails = images.filter((img) => img !== mainImage).slice(0, 3);

  return (
    <div className="w-full">

      {/* MAIN IMAGE */}
      <div className="relative bg-gray-100 w-full aspect-square">

        {/* LEFT ARROW */}
        <button
          onClick={prev}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white/90 w-6 h-6 sm:w-8 sm:h-8 rounded-full shadow flex items-center justify-center"
        >
          <IoMdArrowBack className="text-xs sm:text-base" />
        </button>

        {/* IMAGE */}
        <Image
          src={mainImage}
          alt={product.name}
          fill
          sizes="100vw"
          className="object-contain"
          priority
        />

        {/* RIGHT ARROW */}
        <button
          onClick={next}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white/90 w-6 h-6 sm:w-8 sm:h-8 rounded-full shadow flex items-center justify-center"
        >
          <IoMdArrowForward className="text-xs sm:text-base" />
        </button>

      </div>

      {/* THUMBNAILS (hidden on small screens) */}
      <div className="hidden md:grid grid-cols-3 gap-3 mt-4">

        {thumbnails.map((img, i) => {
          const index = images.indexOf(img);

          return (
            <div
              key={i}
              onClick={() => setCurrentIndex(index)}
              className="relative w-full aspect-square cursor-pointer overflow-hidden border border-gray-200"
            >
              <Image
                src={img}
                alt=""
                fill
                className="object-cover"
              />
            </div>
          );
        })}

      </div>

    </div>
  );
}