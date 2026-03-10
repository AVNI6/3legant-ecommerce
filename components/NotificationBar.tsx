// import { CiDiscount1 } from "react-icons/ci";
// import Link from "next/link";
// import { MdArrowForward } from "react-icons/md";
// import { RxCross1 } from "react-icons/rx";
// import ShopButton from "./shopbutton";
// const NotificationBar = () => {
//     return (
//         <div>
//             <div className="flex justify-center items-center gap-1 p-1 bg-gray-200">
//                 <CiDiscount1 />
//                 <h3 className="text-[12px] sm:text-[20px] ">30% off storewide — Limited time!</h3>
                
//                 <div className="flex justify-between">
//                     <ShopButton/>
//                 </div>
//                 <div className="">
//                     <RxCross1 />
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default NotificationBar;

// "use client";

// import { useState } from "react";
// import { CiDiscount1 } from "react-icons/ci";
// import { RxCross1 } from "react-icons/rx";
// import ShopButton from "./shopbutton";

// const NotificationBar = () => {
//   const [show, setShow] = useState(true);

//   if (!show) return null;

//   return (
//     <div className="relative bg-gray-200 py-2 px-4">
//       <div className="flex justify-center items-center gap-2 text-center">
//         <CiDiscount1 className="text-lg" />
//         <p className="text-xs sm:text-base font-medium">
//           30% off storewide — Limited time!
//         </p>
//         <ShopButton />
//       </div>
//       <button onClick={() => setShow(false)}  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black" >
//         <RxCross1 size={18} />
//       </button>
//     </div>
//   );
// };

// export default NotificationBar;

"use client";

import { useState } from "react";
import { CiDiscount1 } from "react-icons/ci";
import { RxCross1 } from "react-icons/rx";
import ShopButton from "./shopbutton";
import dynamic from "next/dynamic";

const NotificationBar = () => {
  const [show, setShow] = useState(true);

  if (!show) return null;

  return (
    <div className="relative bg-gray-200 py-1 sm:py-2 px-4 sm:px-6 md:px-8">
      <button
        onClick={() => setShow(false)}
        className="absolute right-1 top-1 sm:top-2 text-gray-600 hover:text-black" >
        <RxCross1 size={20} />
      </button>
      <div className="flex items-center justify-center gap-2 text-center">
        <CiDiscount1 className="sm:text-2xl" />
        <p className="text-[10px] sm:text-base font-medium">
          30% off storewide — Limited time!
        </p>
        <ShopButton />
      </div>
    </div>
  );
};

export default NotificationBar;