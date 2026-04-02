import BlackShopButton from "@/components/blackbutton";
import Image from "next/image";
const Hundreds = ({ initialBanner }: { initialBanner?: any }) => {
	const imageUrl = initialBanner?.image_url || "/home2.png";
	const title = initialBanner?.title || "HUNDREDS of";
	const subtitle = initialBanner?.subtitle || "New lower prices!";
	const link = initialBanner?.link_url || "/shop";

	return (
		<section className="w-full flex flex-col md:flex-row">
			<div className="w-full md:w-1/2">
				<Image
					src={imageUrl}
					alt={title}
					width={1920}
					height={1080}
					loading="eager"
					className="
						w-full object-cover
						h-[260px]
						max-[353px]:h-[220px]
						sm:h-[320px]
						md:h-full
					"
				/>
			</div>

			<div className="w-full md:w-1/2 bg-gray-100 flex flex-col justify-center p-5 sm:p-8 md:p-12 lg:p-20">
				<span className="
						text-blue-500 font-semibold uppercase tracking-wide mb-2 sm:mb-3
text-[11px] max-[353px]:text-[10px]sm:text-[12px] md:text-[13px]">
					{initialBanner?.category === "SALE"
						? initialBanner.subtitle
						: "SALE UP TO 35% OFF"}
				</span>

				<h2
					className="
						font-poppins font-semibold leading-tight mb-3 sm:mb-4
						text-[20px]
						max-[353px]:text-[18px]
						sm:text-[26px]
						md:text-[34px]
						lg:text-[44px]
					"
				>
					{title}
					<span className="block">{subtitle}</span>
				</h2>

				<p
					className="
						font-inter text-gray-600 font-normal mb-4 sm:mb-6
						text-[14px] leading-[22px]
						max-[353px]:text-[13px] max-[353px]:leading-[20px]
						sm:text-[16px] sm:leading-[26px]
						md:text-[18px] md:leading-[28px]
						lg:text-[20px] lg:leading-[32px]
					"
				>
					It&apos;s more affordable than ever to give every room in your home a stylish makeover
				</p>

				<BlackShopButton
					href={link}
					className="
						font-medium
						text-[13px]
						max-[353px]:text-[12px]
						sm:text-[14px]
						md:text-[15px]
						lg:text-[16px]
					"
				/>
			</div>
		</section>
	);
};

export default Hundreds;
