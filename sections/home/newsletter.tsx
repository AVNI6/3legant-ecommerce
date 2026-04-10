"use client";
import { useState } from "react";
import { MdOutlineMail } from "react-icons/md";
import Image from "next/image";
import emailjs from "@emailjs/browser";
import { supabase } from "@/lib/supabase/client";

const Newsletter = () => {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");

	const handleSignup = async () => {
		const normalizedEmail = email.trim().toLowerCase();

		if (!normalizedEmail) {
			setMessage("Please enter your email");
			return;
		}

		if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
			setMessage("Please enter a valid email address");
			return;
		}

		setLoading(true);
		setMessage("");

		try {
			const { error } = await supabase
				.from("newsletter_subscribers")
				.insert([{ email: normalizedEmail }]);

			if (error) {
				if (error.code === "23505") {
					setMessage("You're already subscribed! Thanks for your support.");
					setLoading(false);
					setEmail("");
					return;
				}
				throw error;
			}

			try {
				await emailjs.send(
					process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
					process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
					{
						subject: "Welcome to - 3legant Team",
						message: "Thank you for subscribing to our newsletter.",
						from_name: "3legant Team",
						to_name: "Subscriber",
						to_email: normalizedEmail,
						email: normalizedEmail,
						name: "Subscriber",
						reply_to: normalizedEmail,
					},
					process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
				);
			} catch (mailError) {
				console.error("EmailJS error:", mailError);
				setMessage("Subscription saved, but welcome email could not be sent.");
				return;
			}

			setMessage("Thanks for signing up! Check your inbox.");
			setEmail("");
		} catch (err) {
			console.error(err);
			setMessage("Signup failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<section className="mt-5 md:mt-10 w-full">
			<div className="relative w-full bg-gray-100 overflow-hidden">
				<Image
					src="/newsletter.png"
					width={1600}
					height={500}
					alt="Newsletter"
					loading="lazy"
					className="hidden md:block w-full h-auto object-contain"
				/>

				<div className="w-full md:absolute md:inset-0 flex flex-col items-center justify-center text-center px-6 py-14 md:py-0">
					<h1 className="font-poppins font-medium text-[25px] md:text-[35px] leading-[44px] tracking-[-0.4px] text-center sm:text-4xl mb-2">
						Join Our Newsletter
					</h1>

					<p className="font-inter text-gray-600 font-normal text-[16px] md:text-[16px] lg:text-[20px] leading-[32px] tracking-normal mb-8 text-sm sm:text-base">
						Sign up for deals, new products and promotions
					</p>

					<div className="w-full max-w-md border-b border-gray-400 flex items-center justify-between pb-2">
						<div className="flex items-center gap-2 text-gray-500 w-full">
							<MdOutlineMail />

							<label htmlFor="newsletter-email" className="sr-only text-sm md:text-base leading-relaxed tracking-tight">
								Email address
							</label>

							<input
								id="newsletter-email"
								autoComplete="email"
								className="w-full outline-none bg-transparent"
								placeholder="Email address"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && handleSignup()}
								suppressHydrationWarning
							/>
						</div>

						<button
							className="text-gray-500 font-medium text-[16px] leading-[28px] tracking-[-0.4px]"
							onClick={handleSignup}
							disabled={loading}
							suppressHydrationWarning
						>
							{loading ? "Subscribing..." : "Subscribe"}
						</button>
					</div>

					{message && (
						<p
							className={`mt-4 text-sm ${message.toLowerCase().includes("failed") || message.toLowerCase().includes("could not")
									? "text-red-600"
									: "text-green-600"
								}`}
						>
							{message}
						</p>
					)}
				</div>
			</div>
		</section>
	);
};

export default Newsletter;
