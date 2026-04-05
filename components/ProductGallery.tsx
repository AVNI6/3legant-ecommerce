"use client";

import Image from "next/image";
import { IoMdArrowBack, IoMdArrowForward } from "react-icons/io";

type Props = {
  images: string[];
  thumbnailPool: string[];
  product: { name: string };
  currentIndex: number;
  setCurrentIndex: (i: number) => void;
  mainImage: string;
};

export default function ProductGallery({
  images,
  thumbnailPool,
  product,
  currentIndex,
  setCurrentIndex,
  mainImage,
}: Props) {

  const next = () => {
    //setCurrentIndex((currentIndex + 1) % images.length);
    setCurrentIndex((currentIndex - 1 + images.length) % images.length);
  };

  const prev = () => {
    // setCurrentIndex((currentIndex - 1 + images.length) % images.length);
    setCurrentIndex((currentIndex + 1) % images.length);
  };

  const rowThumbnails = thumbnailPool.filter((img) => img && img !== mainImage).slice(0, 3);
  const safeMainImage = mainImage && mainImage.trim() !== "" ? mainImage : null;

  return (
    <div className="w-full">
      <div className="relative bg-[#F3F5F7] w-full h-[340px] sm:h-[440px] md:h-[520px] lg:h-[580px] xl:h-[650px] overflow-hidden flex items-center justify-center">
        <button
          onClick={prev}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white/90 w-6 h-6 sm:w-8 sm:h-8 rounded-full shadow flex items-center justify-center"
        >
          <IoMdArrowBack className="text-xs sm:text-base" />
        </button>
        {safeMainImage ? (
          <Image
            src={safeMainImage}
            alt={product.name}
            fill
            unoptimized
            className="object-contain mix-blend-multiply"
            loading="eager"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400 font-medium">
            No Image Found
          </div>
        )}

        <button onClick={next} className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white/90 w-6 h-6 sm:w-8 sm:h-8 rounded-full shadow flex items-center justify-center" >
          <IoMdArrowForward className="text-xs sm:text-base" />
        </button>
      </div>

      <div className="hidden md:grid grid-cols-3 gap-3 md:gap-4 mt-4 lg:mt-6">

        {rowThumbnails.map((img, i) => {
          const index = images.indexOf(img);
          return (
            <div
              key={i}
              onClick={() => setCurrentIndex(index)}
              className="relative w-full aspect-square cursor-pointer overflow-hidden bg-[#F3F5F7]"
            >
              <Image
                src={img || "/placeholder.png"}
                alt=""
                fill
                unoptimized
                loading="eager"
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          );
        })}

      </div>

    </div>
  );
}
