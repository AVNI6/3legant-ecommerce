import { BiArrowFromBottom } from "react-icons/bi";
import { IoIosArrowForward } from "react-icons/io";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { contact } from "@/constants/Data"
import ContactFeature from "@/components/contactFeature";
import MapPage from "@/components/MapPage";
import BlackShopButton from "@/components/blackbutton";
import { APP_ROUTE } from "@/constants/AppRoutes";

const ContactUs = async () => {

    return (
        <div>
            <div className="px-3 min-[375px]:px-4 sm:px-6 md:px-10 lg:px-30">
                <div className="flex gap-1 min-[375px]:gap-2 sm:gap-4 items-center pt-4 text-xs min-[375px]:text-sm sm:text-base">
                    <Link href={'/'} className="text-[#605F5F] hover:text-black transition-colors">Home</Link>
                    <IoIosArrowForward className="text-[10px] min-[375px]:text-xs sm:text-base" />
                    <p className="font-semibold">Contact Us</p>
                </div>
                <div className="lg:pt-5 pt-4 min-[375px]:pt-6">
                    <h1 className="font-medium text-2xl min-[375px]:text-3xl sm:text-4xl md:text-5xl lg:text-[54px] max-w-full lg:max-w-210 leading-tight lg:leading-[58px]">
                        We believe in sustainable decor. We're passionate about life at home.
                    </h1>
                    <p className="text-xs min-[375px]:text-sm sm:text-base lg:text-[16px] pt-3 min-[375px]:pt-4 sm:pt-5 max-w-full lg:max-w-220 text-[#141718] leading-relaxed lg:leading-[26px]">
                        Our features timeless furniture, with natural fabrics, curved lines, plenty of mirrors and classic design, which can be incorporated into any decor project. The pieces enchant for their sobriety, to last for generations, faithful to the shapes of each period, with a touch of the present
                    </p>
                </div>
                <div className="py-6 min-[375px]:py-8 sm:py-10">
                    <section className="w-full flex flex-col md:flex-row ">
                        <div className="w-full md:w-1/2">
                            <Image
                                src="/home2.png"
                                alt="COntact US"
                                width={1920}
                                height={1080}
                                loading="eager"
                                className="w-full object-cover h-[260px] max-[353px]:h-[220px] sm:h-[320px] md:h-full" />
                        </div>

                        <div className="w-full md:w-1/2 bg-gray-100 flex flex-col justify-center p-5 sm:p-8 md:p-12 lg:p-20 ">
                            <span className="font-poppins font-medium text-2xl  md:text-[40px] leading-[44px] tracking-[-0.4px]">
                                About Us
                            </span>

                            <h2 className="my-5 font-inter font-normal text-md text-[16px] leading-[30px] tracking-[0px]">
                                <p>3legant is a gift & decorations store based in HCMC, Vietnam. Est since 2019.</p>
                                <p>Our customer service is always prepared to support you 24/7</p>
                            </h2>
                            <BlackShopButton href={APP_ROUTE.product} className="
                                            font-medium
                                            text-[13px]
                                            max-[353px]:text-[12px]
                                            sm:text-[14px]
                                            md:text-[15px]
                                            lg:text-[16px] "  />
                        </div>
                    </section>
                </div>
                <div className="">
                    <p className="text-center font-bold text-lg min-[375px]:text-xl md:text-2xl lg:text-[40px]">Contact Us</p>

                    <section className="w-full py-6 min-[375px]:py-8 sm:py-12">
                        <div className="">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 min-[375px]:gap-4 sm:gap-6">
                                {contact.map((item, index) => (
                                    <div key={index} className="h-auto sm:h-[156px] bg-gray-100 rounded-lg flex flex-col gap-1 min-[375px]:gap-2 items-center justify-center text-center px-3 min-[375px]:px-4 sm:px-6 py-4 min-[375px]:py-6 sm:py-0">
                                        <div className="text-xl min-[375px]:text-2xl sm:text-3xl mb-1 min-[375px]:mb-3 text-gray-800">
                                            {item.icon}
                                        </div>
                                        <h3 className="font-bold text-[#6C7275] text-[12px] min-[375px]:text-[16px] leading-tight min-[375px]:leading-[16px] tracking-[0%] uppercase ">
                                            {item.title}
                                        </h3>
                                        <p className="font-semibold text-[12px] min-[375px]:text-[16px] leading-snug min-[375px]:leading-[26px] tracking-[0px] text-center">
                                            {item.des}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

            </div>
            <div>
                <MapPage />
                <ContactFeature />
            </div>
        </div>
    );
}

export default ContactUs;