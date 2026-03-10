"use client"
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { APP_ROUTE } from "@/constants/AppRoutes";

type Inputs = {
  password: string;
};

export default function ResetPassword() {
  const router = useRouter();

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<Inputs>();

  const onSubmit = async (data: Inputs) => {
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Password updated successfully!");
    router.push(APP_ROUTE.signin);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5 w-[350px]"
      >
        <h1 className="text-2xl font-bold">Reset Password</h1>

        <input
          type="password"
          placeholder="New Password"
          {...register("password", { required: true })}
          className="border-b py-2"
        />

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