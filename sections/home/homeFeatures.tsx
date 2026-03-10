// import BlackShopButton from "@/components/blackbutton";
// import Link from "next/link";
// const HomeFeatures = () => {
//     // const data = [{ image: '/feature1.png', h3: 'Living Room' },
//     //                 { image: '/feature2.png', h3: 'BedRoom' },
//     //                 { image: '/feature3.png', h3: 'kitchen' }]

//     //         const renderData = data.map((d) => ) 
//     return (
//         <div className="flex mx-30 gap-5">
//             <div >
//                 <div className="absolute z-1 p-10">
//                     <h3 className="sm:text-2xl font-semibold ">Living Room</h3>
//                     <BlackShopButton />
//                 </div>
//                 <img src='/feature1.png' className="relative w-156" />
//             </div>
//             <div className="relative flex flex-col gap-5">
//                 <div >
//                     <div className="absolute top-40 p-4">
//                         <h3 className="sm:text-2xl font-semibold ">BedRoom</h3>
//                         <BlackShopButton />
//                     </div>
//                     <img src='/feature2.png' className="w-160" />
//                 </div>
//                 <div className="relative">
//                     <div className="absolute top-40 p-4">
//                         <h3 className="sm:text-2xl font-semibold ">Kitchen</h3>
//                         <BlackShopButton />
//                     </div>
//                     <img src='/feature3.png' className="w-160" />
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default HomeFeatures;
import BlackShopButton from "@/components/blackbutton";
import { APP_ROUTE } from "@/constants/AppRoutes";

const HomeFeatures = () => {
  return (
    <div className="flex flex-col md:flex-row mx-6 sm:mx-12 lg:mx-30 gap-5">
      <div className="relative w-full lg:w-1/2">
        <div className="absolute z-10 p-6 sm:p-10">
          <h3 className="text-lg sm:text-2xl font-semibold">
            Living Room
          </h3>
          {/* <BlackShopButton href={`${APP_ROUTE.product}?category=Living%20Room`} className="text-[16px]" /> */}
           <BlackShopButton  href={APP_ROUTE.productByCategory("Living Room")} className="text-[16px]" />
        </div>

        <img
          src="/feature1.png"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col justify-between gap-5 w-full lg:w-1/2">
        <div className="relative w-full">
          <div className="absolute top-6 sm:top-10 p-4">
            <h3 className="text-lg sm:text-2xl font-semibold">
              BedRoom
            </h3>
            <BlackShopButton   href={APP_ROUTE.productByCategory("Bedroom")} className="text-[16px]" />
          </div>

          <img
            src="/feature2.png"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative w-full">
          <div className="absolute top-6 sm:top-10 p-4">
            <h3 className="text-lg sm:text-2xl font-semibold">
              Kitchen
            </h3>
            <BlackShopButton  href={APP_ROUTE.productByCategory("Kitchen")} className="text-[16px]" />
          </div>

          <img
            src="/feature3.png"
            className="w-full h-full object-cover"
          />
        </div>

      </div>

    </div>
  );
};

export default HomeFeatures;

