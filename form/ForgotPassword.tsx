"use client";

import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { APP_ROUTE } from "@/constants/AppRoutes";

type Inputs = {
  email: string;
};

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<Inputs>();

  const onSubmit = async (data: Inputs) => {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/pages/resetpassword`,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Password reset email sent! Check your inbox.");
    redirect(APP_ROUTE.signin)
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[50vh]">
      
      <div className="relative w-full h-[300px] lg:h-screen lg:w-[55%]">
        <Image
          src="/signup.png"
          alt="Signup Image"
          fill
          className="object-cover"
        />

        <div className="absolute top-6 left-1/2 -translate-x-1/2">
          <h1 className="text-2xl md:text-4xl font-bold">
            <Link href="/">3legant.</Link>
          </h1>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6 w-full max-w-md" >
          <h1 className="text-md md:text-3xl font-bold">Forgot Password</h1>

          <input
            type="email"
            placeholder="Enter your email"
            {...register("email", { required: true })}
            className="border-b py-3 outline-none"
          />

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