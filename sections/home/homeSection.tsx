import Slick from "./slick";

export default function HomeSection() {
  return (
    <>
      <Slick />
      <div className="flex flex-col lg:flex-row lg:items-start justify-between mx-6 sm:mx-12 lg:mx-30 my-5 sm:my-20 gap-6 lg:gap-0">
        <div className="font-medium  text-[32px] sm:text-[48px] lg:text-[62px] ">
          <h1 className="">
            <span className="block">
              Simply Unique <span className="text-gray-500">/</span>
            </span>
            <span className="block">
              Simply Better<span className="text-gray-500">.</span>
            </span>
          </h1>
        </div>
        <div className="font-inter text-sm sm:text-base lg:text-lg  text-[#6C7275] max-w-full lg:max-w-md lg:mt-6">
          <h4>
            <span className="font-bold text-[#343839]">3legant </span>is a gift & decorations store based in HCMC, Vietnam. Est since 2019.
          </h4>
        </div>
      </div>
    </>
  );
}