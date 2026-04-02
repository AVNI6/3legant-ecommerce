import Link from "next/link"
import { MdArrowForward } from "react-icons/md"

interface BlackShopButtonProps {
  href?: string
  content?: string
  className?: string
  onClick?: () => void
}


const BlackShopButton: React.FC<BlackShopButtonProps> = ({ href, content = "Shop Now", className = "", onClick, }) => {

  const baseClasses = "font-inter flex items-center gap-1 text-black border-b-2 border-transparent hover:border-black w-fit transition-all"

  const textClasses = className || "text-[10px] sm:text-xl"

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        <span className={textClasses}>{content}</span>
        <MdArrowForward className="" />
      </Link>
    )
  }
  return (
    <button onClick={onClick} className={baseClasses}>
      <span className={textClasses}>{content}</span>
      <MdArrowForward />
    </button>
  )
}

export default BlackShopButton