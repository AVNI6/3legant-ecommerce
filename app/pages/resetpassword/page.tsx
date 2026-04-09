"use client"
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { APP_ROUTE } from "@/constants/AppRoutes";
import { toast } from "react-toastify";
import Image from "next/image";
import Link from "next/link";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { useState } from "react";

type Inputs = {
  password: string;
};

export default function ResetPassword() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Inputs>();

  const onSubmit = async (data: Inputs) => {
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Password updated successfully!");
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
        className="flex flex-col gap-5 w-full max-w-md md:max-w-xl min-w-[300px] px-4"
      >
        <h1 className="text-2xl font-bold">Reset Password</h1>

        <label htmlFor="reset-password" title="New Password" />

        <div className="relative">
          <input
            id="reset-password"
            autoComplete="new-password"
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "Min 8 characters required" },
              validate: {
                hasUpper: (v) => /[A-Z]/.test(v) || "Include an uppercase letter",
                hasLower: (v) => /[a-z]/.test(v) || "Include a lowercase letter",
                hasNumber: (v) => /\d/.test(v) || "Include a number",
                hasSpecial: (v) => /[@$!%*?&]/.test(v) || "Include a special character (@$!%*?&)",
              }
            })}
            className="w-full border-b py-2 pr-10 focus:border-black outline-none transition-colors"
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
          <p className="text-red-500 text-xs mt-[-10px]">{errors.password.message}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-black text-white py-2 rounded"
        >
          {isSubmitting ? "Updating..." : "Update Password"}
        </button>

      </form>
      </div>
    </div>
  );
}