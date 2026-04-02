"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { APP_ROUTE } from "@/constants/AppRoutes";
import { toast } from "react-toastify";
import Modal from "@/components/ui/Modal";
import { PRIVACY_POLICY_CONTENT, TERMS_OF_USE_CONTENT } from "@/sections/PolicyContent";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

type SignUpInputs = {
  name: string;
  username: string;
  email: string;
  password: string;
  terms: boolean;
};

const Signup = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInputs>();

  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit: SubmitHandler<SignUpInputs> = async (data) => {
    if (!data.terms) {
      toast.error("You must accept Terms & Conditions");
      return;
    }

    try {
      const { data: signupData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            username: data.username,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered") || error.message.includes("User already registered")) {
          toast.error("Account already exists! Please sign in instead.");
          router.push(APP_ROUTE.signin);
          return;
        }
        toast.error(error.message);
        return;
      }

      if (signupData.user?.id) {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: signupData.user.id,
            name: data.name,
            email: data.email,
          }),
        });

        if (!res.ok) {
          toast.error("Account created but profile setup failed. Please contact support.");
          return;
        }
      }

      toast.success("Signup successful! Check your email to verify your account.");
      router.push(APP_ROUTE.signin);
    } catch (error: any) {
      toast.error("An error occurred during signup. Please try again.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen overflow-hidden">
      <div className="w-full h-[35vh] md:h-screen md:w-1/2 bg-[#F3F5F7] flex flex-col items-center justify-center p-4 md:p-8 relative">


        <Image
          src="/signup.png"
          alt="Chair"
          fill
          className="object-contain"
          priority
        />
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
          <h1 className="text-2xl md:text-4xl font-bold text-black">
            <Link href="/">3legant.</Link>
          </h1>
        </div>

      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-md flex flex-col font-poppins">

          <h1 className="text-3xl md:text-4xl font-semibold mb-3">
            Sign Up
          </h1>

          <p className="text-gray-500 mb-8 text-sm md:text-base">
            Already have an account?{" "}
            <Link
              href={APP_ROUTE.signin}
              className="text-[#38CB89] font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 flex flex-col"
          >
            <label htmlFor="signup-name" className="sr-only">Your name</label>
            <input
              id="signup-name"
              autoComplete="name"
              placeholder="Your name"
              {...register("name", { required: "Name is required" })}
              className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-black"
            />
            {errors.name && (
              <p className="text-red-500 text-xs">{errors.name.message}</p>
            )}

            <label htmlFor="signup-username" className="sr-only">Username</label>
            <input
              id="signup-username"
              autoComplete="username"
              placeholder="Username"
              {...register("username", { required: "Username required" })}
              className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-black"
            />

            <label htmlFor="signup-email" className="sr-only">Email address</label>
            <input
              id="signup-email"
              autoComplete="email"
              type="email"
              placeholder="Email address"
              {...register("email", { required: "Email required" })}
              className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-black"
            />

            <div className="relative">
              <input
                id="signup-password"
                autoComplete="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                {...register("password", {
                  required: "Password required",
                  minLength: { value: 6, message: "Min 6 characters" },
                })}
                className="w-full border-b border-gray-300 py-3 pr-10 focus:outline-none focus:border-black"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black focus:outline-none"
              >
                {showPassword ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
              </button>
            </div>

            <label className="flex items-center space-x-2 text-sm text-gray-500">
              <input
                id="signup-terms"
                type="checkbox"
                autoComplete="off"
                {...register("terms")}
                className="w-4 h-4 accent-black cursor-pointer"
              />
              <span className="select-none">
                I agree with{" "}
                <button
                  type="button"
                  onClick={() => setIsPrivacyOpen(true)}
                  className="font-bold text-black hover:underline focus:outline-none"
                >
                  Privacy Policy
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  onClick={() => setIsTermsOpen(true)}
                  className="font-bold text-black hover:underline focus:outline-none"
                >
                  Terms of Use
                </button>
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white rounded-lg py-3 hover:bg-gray-800 transition shadow-sm font-semibold disabled:opacity-50"
            >
              {isSubmitting ? "Signing Up..." : "Sign Up"}
            </button>
          </form>

          <Modal
            isOpen={isPrivacyOpen}
            onClose={() => setIsPrivacyOpen(false)}
            title="Privacy Policy"
          >
            {PRIVACY_POLICY_CONTENT}
          </Modal>

          <Modal
            isOpen={isTermsOpen}
            onClose={() => setIsTermsOpen(false)}
            title="Terms of Use"
          >
            {TERMS_OF_USE_CONTENT}
          </Modal>
          {/* <div className="my-5 flex items-center gap-3 ">Admin?? <BlackShopButton content="SignUp"  href={'/pages/admin/login'}/></div> */}
        </div>
      </div>
    </div>
  );
};

export default Signup;