import Slick from "@/components/slick";

export default function HomeSection({ initialBanners }: { initialBanners?: any[] }) {
  return (
    <>
      <Slick initialBanners={initialBanners} />
      <div className="flex flex-col md:flex-row md:items-start justify-between mx-4 sm:mx-10 md:mx-12 lg:mx-30 mt-8 mb-5 md:my-10 gap-4 md:gap-10">
        <div className="font-poppins font-medium text-[40px] sm:text-[54px] md:text-[42px] lg:text-[54px] xl:text-[72px] leading-[1.15] lg:leading-[1.2] tracking-[-0.02em] w-full md:w-[60%]">
          <h1 className="w-full">
            Simply Unique<span className="text-gray-500 font-medium text-[0.9em] ">/</span><br className="lg:hidden" />
            <span className="lg:whitespace-nowrap"> Simply Better<span className="text-gray-500 text-[0.9em] font-medium">.</span></span>
          </h1>
        </div>
        <div className="font-inter text-[14px] leading-[22px] lg:leading-[28px] text-[#6C7275] sm:text-base lg:text-lg w-full md:w-[40%] md:mt-2 lg:mt-10">
          <p>
            <span className="font-bold text-[#343839]">3legant </span>
            is a gift & decorations store based in HCMC, Vietnam. Est since 2019.
          </p>
        </div>

      </div>
    </>
  );
}