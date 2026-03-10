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


import { features } from "@/constants/Data";

const Features = () => {
 

  return (
    <section className="w-full px-4 sm:px-12 md:px-10 lg:px-30 py-12 overflow-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {features.map((item, index) => (
          <div
            key={index}
            className=" bg-gray-100 rounded-lg p-6 sm:p-8 min-h-[160px] sm:min-h-[180px] flex flex-col justify-center gap-3 transition hover:shadow-md" >
            <div className="text-3xl sm:text-4xl text-gray-800">
              {item.icon}
            </div>

            <h3 className="font-semibold text-sm sm:text-base">
              {item.title}
            </h3>

            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
              {item.des}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
