"use client"
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { APP_ROUTE } from "@/constants/AppRoutes";
import { toast } from "react-toastify";

type Inputs = {
  password: string;
};

export default function ResetPassword() {
  const router = useRouter();

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
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5 w-[350px]"
      >
        <h1 className="text-2xl font-bold">Reset Password</h1>

        <label htmlFor="reset-password" title="New Password" />

        <input
          id="reset-password"
          autoComplete="new-password"
          type="password"
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
          className="border-b py-2 focus:border-black outline-none"
        />
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
  );
}