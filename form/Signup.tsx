"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { APP_ROUTE } from "@/constants/AppRoutes";

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

  const onSubmit: SubmitHandler<SignUpInputs> = async (data) => {
    if (!data.terms) {
      alert("You must accept Terms & Conditions");
      return;
    }

    const { error } = await supabase.auth.signUp({
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
      alert(error.message);
      return;
    }

    alert("Signup successful! Check your email.");
    router.push(APP_ROUTE.signin);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen overflow-hidden">
      <div className="w-full h-[35vh] md:h-screen md:w-1/2 bg-[#F3F5F7] flex flex-col items-center justify-center p-4 md:p-8 relative">
       <div className="relative w-full md:w-1/2 md:h-auto">
         <Image
          src="/signup.png"
         alt="Signup Image"
          fill
           className="object-cover"
       />
   </div>

     
          <Image
            src="/signup.png"
            alt="Chair"
            fill
            className="object-contain"
            priority
          />
    
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
            <input
              placeholder="Your name"
              {...register("name", { required: "Name is required" })}
              className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-black"
            />
            {errors.name && (
              <p className="text-red-500 text-xs">{errors.name.message}</p>
            )}

            <input
              placeholder="Username"
              {...register("username", { required: "Username required" })}
              className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-black"
            />

            <input
              type="email"
              placeholder="Email address"
              {...register("email", { required: "Email required" })}
              className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-black"
            />

            <input
              type="password"
              placeholder="Password"
              {...register("password", {
                required: "Password required",
                minLength: { value: 6, message: "Min 6 characters" },
              })}
              className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-black"
            />

            <label className="flex items-center space-x-2 text-sm text-gray-500">
              <input
                type="checkbox"
                {...register("terms")}
                className="w-4 h-4 accent-black"
              />
              <span>
                I agree with <b>Privacy Policy</b> and <b>Terms of Use</b>
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white rounded-lg py-3 hover:bg-gray-800 transition"
            >
              {isSubmitting ? "Signing Up..." : "Sign Up"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Signup;