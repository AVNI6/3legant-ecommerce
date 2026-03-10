"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { APP_ROUTE } from "@/constants/AppRoutes";

type SignInInputs = {
  email: string;
  password: string;
};

const Signin = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInputs>();

  const onSubmit: SubmitHandler<SignInInputs> = async (data) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    router.refresh()
    router.push("/")
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen overflow-hidden">
      <div className="relative w-auto md:w-full md:h-64 md:h-auto h-[430px] lg:w-[55vw] lg:h-64 lg:h-[100vh]">
        <Image src="/signup.png"
          alt="Signup Image"
          fill
          className="object-cover" />
        <div className="absolute top-6 left-1/2 -translate-x-1/2">
          <h1 className="text-2xl md:text-4xl font-bold">
            <Link href="/">3legant.</Link>
          </h1>
        </div>
      </div>


      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-md flex flex-col font-poppins">

          <h1 className="text-3xl md:text-4xl font-semibold mb-3">
            Sign In
          </h1>

          <p className="text-gray-500 mb-8 text-sm md:text-base">
            Don’t have an account?{" "}
            <Link
              href={APP_ROUTE.signup}
              className="text-[#38CB89] font-medium hover:underline" >
              Sign up
            </Link>
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 flex flex-col" >

            <input
              type="email"
              placeholder="Email address"
              {...register("email", { required: "Email is required" })}
              className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-black" />
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email.message}</p>
            )}

            <input
              type="password"
              placeholder="Password"
              {...register("password", { required: "Password is required" })}
              className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-black" />
            {errors.password && (
              <p className="text-red-500 text-xs">{errors.password.message}</p>
            )}

            <div className="flex justify-between">
              <label className="flex items-center gap-2 text-gray-600 text-[10px] md:text-sm">
                <input type="checkbox" />
                Remember me
              </label>
              <Link
                href="/pages/forgotpassword"
                className="font-semibold hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white rounded-lg py-3 hover:bg-gray-800 transition" >

              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Signin;