import { features } from "@/constants/Data";

const Features = () => {
  return (
    <section className="w-full px-4 sm:px-10 md:px-10 lg:px-30 py-8 sm:py-10 md:py-12 overflow-hidden">
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
        {features.map((item, index) => (
          <div key={index} className=" bg-gray-100 rounded-lg p-4 sm:p-6 md:p-8 min-h-[140px] max-[353px]:min-h-[120px] sm:min-h-[160px] flex flex-col justify-center gap-2 sm:gap-3 transition hover:shadow-md ">
            <div className="text-gray-800 text-[22px] max-[353px]:text-[20px] sm:text-[26px] md:text-[30px] lg:text-[34px]">
              {item.icon}
            </div>
            <h3 className="font-poppins font-medium text-[14px] leading-[20px] max-[353px]:text-[13px] sm:text-[16px] sm:leading-[22px] md:text-[18px] md:leading-[24px] lg:text-[20px] lg:leading-[28px]">
              {item.title}
            </h3>
            <p className="font-poppins text-gray-600 font-normal text-[12px] leading-[18px] max-[353px]:text-[11px] sm:text-[13px] sm:leading-[20px] md:text-[14px] md:leading-[22px] lg:text-[15px] lg:leading-[24px]">
              {item.des}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;

// import { MdOutlineLocalShipping } from "react-icons/md";
// import { LiaMoneyBillSolid } from "react-icons/lia";
// import { CiLock } from "react-icons/ci";
// import { IoCallOutline } from "react-icons/io5";

// const Features = () => {
//   const data = [
//     { icon: <MdOutlineLocalShipping />, title: "Free Shipping", des: "Order above $200" },
//     { icon: <LiaMoneyBillSolid />, title: "Money-back", des: "30 days guarantee" },
//     { icon: <CiLock />, title: "Secure Payments", des: "Secured by Stripe" },
//     { icon: <IoCallOutline />, title: "24/7 Support", des: "Phone and Email support" },
//   ];

//   return (
//     <section className="w-full px-4 sm:px-6 md:px-10 lg:px-30 py-12 overflow-hidden">
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
//         {data.map((item, index) => (
//           <div
//             key={index}
//             className="
//               bg-gray-100 rounded-lg
//               p-6 sm:p-8
//               min-h-[160px] sm:min-h-[180px]
//               flex flex-col justify-center
//               gap-3
//               transition hover:shadow-md
//             "
//           >
//             <div className="text-3xl sm:text-4xl text-gray-800">
//               {item.icon}
//             </div>

//             <h3 className="font-semibold text-sm sm:text-base">
//               {item.title}
//             </h3>

//             <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
//               {item.des}
//             </p>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// };

// export default Features;


// import { features } from "@/constants/Data";

// const Features = () => {
 

//   return (
//     <section className="w-full px-4 sm:px-12 md:px-10 lg:px-30 py-12 overflow-hidden">
//       <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
//         {features.map((item, index) => (
//           <div
//             key={index}
//             className=" bg-gray-100 rounded-lg p-6 sm:p-8 min-h-[160px] sm:min-h-[180px] flex flex-col justify-center gap-3 transition hover:shadow-md" >
//             <div className="text-3xl sm:text-4xl text-gray-800">
//               {item.icon}
//             </div>

//             <h3 className="font-poppins font-medium text-[20px] leading-[28px] tracking-normal">
//               {item.title}
//             </h3>

//             <p className="font-poppins text-gray-600  font-normal text-[14px] leading-[24px] tracking-normal">
//               {item.des}
//             </p>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// };

// export default Features;
