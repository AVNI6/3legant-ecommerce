// // import BlackShopButton from "@/components/blackbutton";

// // const Hundreds = () => {
// //     return (
// //         <div className="flex flex-col md:flex-row  ">
// //           <img src='/home2.png' className="max-sm:h-96 lg:w-1/2 object-cover" />  
// //             <div className="flex flex-col bg-gray-100 justify-center p-10 xl:p-20 ">
// //                 <span className="text-blue-500 font-bold">SALE UP TO 35% OFF</span>
               
// //                 <h2 className="font-poppins font-medium text-[40px] max-w-[65%] ">HUNDREDS of New lower prices!</h2>
// //                 <p className="font text-[20px] py-3 max-w-[65%]">It’s more affordable than ever to give every room in your home a stylish makeover</p>
// //              <BlackShopButton/>
// //             </div>
// //         </div>
// //     );
// // }

// // export default Hundreds;

// import BlackShopButton from "@/components/blackbutton";

// const Hundreds = () => {
//   return (
//     <section className="w-full flex flex-col md:flex-row">
      
//       <div className="w-full md:w-1/2">
//         <img
//           src="/home2.png"
//           alt="Living Room"
//           className="w-full h-[320px] sm:h-[420px] md:h-full object-cover"
//         />
//       </div>

//       <div className="w-full md:w-1/2 bg-gray-100 flex flex-col justify-center p-8 sm:p-12 lg:p-20">
        
//         <span className="text-blue-500 font-semibold text-sm tracking-wide mb-3">
//           SALE UP TO 35% OFF
//         </span>

//         <h2 className="font-poppins font-semibold text-[34px] sm:text-4xl lg:text-5xl leading-tight mb-4">
//           HUNDREDS of <br className="hidden sm:block" />
//           New lower prices!
//         </h2>

//         <p className="text-gray-600 text-base sm:text-lg mb-6 max-w-md">
//           It’s more affordable than ever to give every room in your home a stylish makeover
//         </p>

//         <BlackShopButton />
//       </div>

//     </section>
//   );
// };

// export default Hundreds;

import BlackShopButton from "@/components/blackbutton";

const Hundreds = () => {
  return (
    <section className="w-full flex flex-col md:flex-row">
      <div className="w-full md:w-1/2">
        <img src="/home2.png" alt="Living Room" className="w-full h-[320px] sm:h-[420px] md:h-full object-cover"  />
      </div>

      <div className="w-full md:w-1/2 bg-gray-100 flex flex-col justify-center p-6 sm:p-12 lg:p-20">
        <span className="text-blue-500 font-semibold text-sm tracking-wide mb-3">
          SALE UP TO 35% OFF
        </span>

        <h2 className="font-poppins font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight mb-4">
          HUNDREDS of
          <span className="block">New lower prices!</span>
        </h2>

        <p className="text-gray-600 text-base sm:text-lg mb-6 max-w-md">
          It’s more affordable than ever to give every room in your home a stylish makeover
        </p>

        <BlackShopButton  className="text-[16px]"/>
      </div>

    </section>
  );
};

export default Hundreds;