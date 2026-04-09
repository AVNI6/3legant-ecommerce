"use client";

import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { APP_ROUTE } from "@/constants/AppRoutes";
import { toast } from "react-toastify";

type Inputs = {
  email: string;
};

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();
  const router = useRouter();

  const onSubmit = async (data: Inputs) => {
    // Check if the user exists in the profiles table first
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", data.email)
      .single();

    if (profileError || !profile) {
      toast.error("Account does not exist. Please try to sign up.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/pages/resetpassword`,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Password reset email sent! Check your inbox.");
    router.push(APP_ROUTE.signin);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[50vh]">

      <div className="relative w-full h-[50vh] lg:h-screen lg:w-[55%]">
        <Image
          src="/signup.png"
          alt="Signup Image"
          fill
          loading="lazy"
          className="object-contain bg-gray-100"
        />

        <div className="absolute top-6 left-1/2 -translate-x-1/2">
          <h1 className="text-2xl md:text-4xl font-bold">
            <Link href="/">3legant.</Link>
          </h1>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-20 py-10">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6 w-full max-w-md md:max-w-xl " >
          <h1 className="text-md md:text-3xl font-bold">Forgot Password</h1>

          <label htmlFor="forgot-email" className="sr-only">Email address</label>

          <input
            id="forgot-email"
            autoComplete="email"
            type="email"
            placeholder="Enter your email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email"
              }
            })}
            className="border-b py-3 outline-none"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-black text-white py-3 rounded-md hover:opacity-90 transition"
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}