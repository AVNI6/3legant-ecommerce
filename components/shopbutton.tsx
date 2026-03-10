import Link from "next/link";
import { MdArrowForward } from "react-icons/md";
const ShopButton = () => {
  return (
    <Link href={"/"} className="flex items-center text-[12px] sm:text-[17px] text-blue-500 underline gap-1">
      <p>Shop Now</p>
      <MdArrowForward />
    </Link>
  );
}

export default ShopButton;
