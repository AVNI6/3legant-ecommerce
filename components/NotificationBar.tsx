"use client";

import { useState } from "react";
import { CiDiscount1 } from "react-icons/ci";
import { RxCross1 } from "react-icons/rx";
import ShopButton from "./shopbutton";


const NotificationBar = () => {
  const [show, setShow] = useState(true);

  if (!show) return null;

  return (
    <div className="relative bg-gray-200 py-1.5 sm:py-2 px-2 sm:px-6 md:px-8">
      <button
        onClick={() => setShow(false)}
        className="absolute right-1 top-1/2 -translate-y-1/2 sm:top-2 sm:translate-y-0 text-gray-600 hover:text-black z-10" >
        <RxCross1 size={16} className="sm:size-5" />
      </button>
      <div className="flex items-center justify-center gap-1 sm:gap-2 text-center pr-6 sm:pr-0">
        <CiDiscount1 className="text-sm sm:text-2xl shrink-0" />
        <p className="text-[9px] min-[320px]:text-[10px] sm:text-base font-medium truncate sm:whitespace-normal">
          30% off storewide — Limited time!
        </p>
        <div className="shrink-0 hidden lg:block flex items-center">
          <ShopButton />
        </div>
      </div>
    </div>
  );
};

export default NotificationBar;