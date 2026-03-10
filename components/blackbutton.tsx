// // import Link from "next/link";
// // import { MdArrowForward } from "react-icons/md";
// // const BlackShopButton = () => {
// //   return (
// //     <Link href={"/"} className="flex items-center text-[10px] sm:text-xl text--black underline gap-1">
// //       <p>Shop Now</p>
// //       <MdArrowForward />
// //     </Link>
// //   );
// // }

// // export default BlackShopButton;

// // import Link from "next/link";
// // import { MdArrowForward } from "react-icons/md";

// // interface BlackShopButtonProps {
// //   className?: string;
// // }

// // const BlackShopButton: React.FC<BlackShopButtonProps> = ({ className = "" }) => {
// //   const linkClasses = "flex items-center gap-1 text-black border-b-0 hover:border-b-2 w-[100px] border-black transition-all"; 
// //   const textClasses = `${className ? ` ${className}` :  `text-[10px] sm:text-xl`}`

// //   return (
// //     <Link href="/" className={linkClasses}>
// //       <p className={textClasses}>Shop Now</p>
// //       <MdArrowForward />
// //     </Link>
// //   );
// // };

// // export default BlackShopButton;
import Link from "next/link"
import { MdArrowForward } from "react-icons/md"

interface BlackShopButtonProps {
  href?: string
  content?: string
  className?: string
  onClick?: () => void
}


const BlackShopButton: React.FC<BlackShopButtonProps> = ({ href, content = "Shop Now", className = "", onClick, }) => {

  const baseClasses = "font-inter flex items-center gap-1 text-black border-b-2  w-fit border-black transition-all"

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

// import Link from "next/link"
// import { MdArrowForward } from "react-icons/md"

// interface BlackShopButtonProps {
//   href?: string
//   content?: string
//   className?: string
//   onClick?: () => void
// }

// const BlackShopButton: React.FC<BlackShopButtonProps> = ({ href, content = "Shop Now", className = "", onClick }) => {
//   const baseClasses = "flex items-center gap-1 text-black border-b-0 hover:border-b-2 w-fit border-black transition-all"
//   const textClasses = className || "text-[10px] sm:text-xl"

//   if (href) {
//     return (
//       <Link href={href} legacyBehavior>
//         <a className={baseClasses}>
//           <span className={textClasses}>{content}</span>
//           <MdArrowForward />
//         </a>
//       </Link>
//     )
//   }

//   return (
//     <button onClick={onClick} className={baseClasses}>
//       <span className={textClasses}>{content}</span>
//       <MdArrowForward />
//     </button>
//   )
// }

// export default BlackShopButton