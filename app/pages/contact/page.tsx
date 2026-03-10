import { BiArrowFromBottom } from "react-icons/bi";
import { IoIosArrowForward } from "react-icons/io";
import Link from "next/link";
import Hundreds from "@/sections/home/hundreds";
import { contact } from "@/constants/Data"
import ContactFeature from "@/components/contactFeature";
import MapPage from "@/sections/contact/MapPage";
const ContactUs = () => {
    return (
        <div>
            <div className="px-5 sm:px-10 md:px-10 lg:px-30">
                <div className="flex gap-4 items-center pt-4">
                    <Link href={'/'} className="text-[#605F5F] text-[">Home</Link>
                    <IoIosArrowForward />
                    <p className="font-semibold">Contact Us</p>
                </div>
                <div className=" lg:pt-5">
                    <h1 className="font-medium text-[54px] max-w-210 leading-[58px]">We believe in sustainable decor. We’re passionate about life at home.</h1>
                    <p className="text-[16px] pt-5 max-w-220 text-[#141718] leading-[26px]">Our features timeless furniture, with natural fabrics, curved lines, plenty of mirrors and classic design, which can be incorporated into any decor project. The pieces enchant for their sobriety, to last for generations, faithful to the shapes of each period, with a touch of the present</p>
                </div>
                <div className="py-10">
                    <Hundreds />
                </div>
                <div className="">
                    <p className="text-center font-bold md:text[20px] lg:text-[40px]">Contact Us</p>

                    <section className="w-full py-12">
                        <div className="">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {contact.map((item, index) => (
                                    <div key={index} className="h-[156px] bg-gray-100 rounded-lg flex flex-col items-center justify-center text-center px-6">
                                        <div className="text-3xl mb-3 text-gray-800">
                                            {item.icon}
                                        </div>
                                        <h3 className="font-semibold text-base">
                                            {item.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm mt-1">
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
                <MapPage/>
                <ContactFeature />
            </div>
        </div>
    );
}

export default ContactUs;