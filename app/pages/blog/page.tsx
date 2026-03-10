import BlogCards from "@/sections/blog/BlogCards";
import Article from "@/sections/home/articlepage";
import Newsletter from "@/sections/home/newsletter";
import Image from "next/image";
import Link from "next/link";
const page = () => {
    return (
        <div>
            <div className="px-5 sm:px-10 md:px-10 lg:px-30">
                <div className="relative w-full h-[392px] mb-10">
                    <Image
                        src="/blog/bloghome.png"
                        alt="Banner"
                        fill
                        className="object-cover w-full h-full"
                        priority
                    />

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 gap-3">
                        <p className="text-sm md:text-base mb-2"><span className="text-[#605F5F]"><Link href={'/'}>Home</Link></span> &gt; &nbsp; blog</p>
                        <h1 className="text-2xl text-[54px] font-semibold mb-2">Our Blog</h1>
                        <h3 className="text-sm md:text-lg">
                            Home ideas and design inspiration
                        </h3>
                    </div>
                </div>
                <>
                <BlogCards/>
                </>
            </div>
         <Newsletter/>
        </div>
    );
}

export default page;