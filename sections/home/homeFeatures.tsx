import BlackShopButton from "@/components/blackbutton";
import { APP_ROUTE } from "@/constants/AppRoutes";

const HomeFeatures = () => {
  return (
    <div className="flex flex-col md:flex-row mx-4 sm:mx-10 lg:mx-30 gap-5">
      <div className="relative w-full lg:w-1/2">
        <div className="absolute z-10 p-6 sm:p-10">
          <h3 className="font-poppins text-lg sm:text-2xl font-semibold">
            Living Room
          </h3>
          {/* <BlackShopButton href={`${APP_ROUTE.product}?category=Living%20Room`} className="text-[16px]" /> */}
          <BlackShopButton href={APP_ROUTE.productByCategory("Living Room")} className="font-medium text-[16px] leading-[28px] tracking-[-0.4px]" />
        </div>

        <img
          src="/feature1.png"
          className="w-full h-[377px] md:h-full object-cover"
        />
      </div>

      <div className="flex flex-col justify-between gap-5 w-full lg:w-1/2">
        <div className="relative w-full">
          <div className="absolute top-6 sm:top-10 p-4">
            <h3 className="font-poppins font-semibold text-lg md:text-[28px] leading-[38px] tracking-[-0.6px]">
              BedRoom
            </h3>
            <BlackShopButton href={APP_ROUTE.productByCategory("Bedroom")} className="font-medium text-[16px] leading-[28px] tracking-[-0.4px]" />
          </div>

          <img
            src="/feature2.png"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative w-full">
          <div className="absolute top-6 sm:top-10 p-4">
            <h3 className="font-poppins font-semibold text-lg md:text-[28px] leading-[38px] tracking-[-0.6px]">
              Kitchen
            </h3>
            <BlackShopButton href={APP_ROUTE.productByCategory("Kitchen")} className="font-medium text-[16px] leading-[28px] tracking-[-0.4px]" />
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

