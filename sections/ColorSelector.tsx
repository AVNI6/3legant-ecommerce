// "use client";

// import Image from "next/image";

// type ColorImage = {
//     id: number;
//     image: string;
// };

// type Props = {
//     colors: ColorImage[];
//     selected: number | null;
//     onSelect: (id: number) => void;
// };

// export default function ColorSelector({
//     colors,
//     selected,
//     onSelect,
// }: Props) {
//     return (
//         <div className="my-10">

//             <div className="flex items-center gap-2 text-gray-600">
//                 <span className="font-medium">Choose Color</span>
//                 <span>›</span>
//             </div>

//             <div className="flex gap-6 mt-4">

//                 {colors.map((color) => {
//                     const active = color.id === selected;
//                     return (
//                         <div
//                             key={color.id}
//                             onClick={() => onSelect(color.id)}
//                             className={`relative w-[90px] h-[90px] cursor-pointer
//               ${active ? "border-2 border-black" : "border border-gray-200"}
//               `}
//                         >
//                             <Image
//                                 src={color.image}
//                                 alt="color"
//                                 fill
//                                 className="object-contain"
//                             />
//                         </div>
//                     );
//                 })}

//             </div>

//         </div>
//     );
// }
"use client";

import Image from "next/image";

const normalizeImageSrc = (src: string) => {
  if (!src) return src;

  try {
    return decodeURIComponent(src);
  } catch {
    return src;
  }
};

const isRemoteUrl = (src: string) => /^https?:\/\//i.test(src);

type ColorImage = {
  id: number;
  image: string;
  color?: string; // Add color name
};

type Props = {
  colors: ColorImage[];
  selected: number | null;
  onSelect: (id: number) => void;
};

export default function ColorSelector({ colors, selected, onSelect }: Props) {
  const selectedColorName = colors.find((c) => c.id === selected)?.color;

  return (
    <div className="my-5"><div>
      <div className="flex items-center gap-2 text-gray-600 ">
        <span className="font-semibold [font-weight:600] text-[16px] leading-[26px] tracking-normal whitespace-nowrap">Choose Color</span>
        <span>›</span>
      </div>
      {selectedColorName && (
        <span className="font-normal text-[20px] leading-[32px] tracking-normal">{selectedColorName}</span>
      )}
    </div>

      <div className="flex gap-6 mt-4">
        {colors.map((color) => {
          const active = color.id === selected;
          const normalizedSrc = normalizeImageSrc(color.image);
          return (
            <div
              key={color.id}
              onClick={() => onSelect(color.id)}
              className={`relative w-[90px] h-[90px] cursor-pointer rounded-md overflow-hidden
                ${active ? "border-2 border-black" : "border border-gray-200"}`}
            >
              <Image
                src={normalizedSrc}
                alt="color"
                fill
                sizes="90px"
                unoptimized={isRemoteUrl(normalizedSrc)}
                loading="lazy"
                className="object-cover"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}