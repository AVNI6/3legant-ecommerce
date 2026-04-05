"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { APP_ROUTE } from "@/constants/AppRoutes";
import { useAppDispatch } from "@/store/hooks";
import { checkIsAdmin, setAuth } from "@/store/slices/authSlice";
import { fetchCart } from "@/store/slices/cartSlice";
import { toast } from "react-toastify";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { useState } from "react";

type SignInInputs = {
  email: string;
  password: string;
};

const Signin = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInputs>();

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit: SubmitHandler<SignInInputs> = async (data) => {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Invalid email or password. Please check your credentials.");
      } else if (error.message.includes("Email not confirmed")) {
        toast.error("Please check your email and click the confirmation link before signing in.");
      } else if (error.message.includes("Too many requests")) {
        toast.error("Too many login attempts. Please wait a few minutes and try again.");
      } else {
        toast.error(`Login failed: ${error.message}`);
      }
      return;
    }

    if (authData.user) {
      try {
        dispatch(setAuth({ user: authData.user, session: authData.session }));
        void dispatch(fetchCart(authData.user.id));
        const adminResult = await dispatch(checkIsAdmin(authData.user.id));
        const isAdmin = adminResult.payload as boolean;

        router.refresh();

        if (isAdmin) {
          router.push("/pages/admin/dashboard");
        } else {
          router.push(APP_ROUTE.home);
        }
      } catch (err) {
        router.refresh();
        router.push(APP_ROUTE.home);
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen overflow-hidden">
      <div className="relative w-auto md:w-1/2 md:h-64 md:h-auto h-[430px] lg:w-[55vw] lg:h-64 lg:h-[100vh]">
        <Image src="/signup.png"
          alt="Signup Image"
          fill
          loading="lazy"
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
            Don't have an account?{" "}
            <Link
              href={APP_ROUTE.signup}
              className="text-[#38CB89] font-medium hover:underline" >
              Sign up
            </Link>
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 flex flex-col" >

            <label htmlFor="signin-email" className="sr-only">Email address</label>

            <input
              id="signin-email"
              autoComplete="email"
              type="email"
              placeholder="Email address"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
              className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-black" />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}

            <div className="relative">
              <input
                id="signin-password"
                autoComplete="current-password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters"
                  }
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
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}

            <div className="flex justify-between">
              <label className="flex items-center gap-2 text-gray-600 text-[10px] md:text-sm">
                <input id="signin-remember" name="rememberMe" type="checkbox" autoComplete="on" />
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