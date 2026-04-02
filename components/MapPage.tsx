"use client";

import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase/client";
import { useState } from "react";

type FormData = {
  full_name: string;
  email: string;
  message: string;
};

const MapPage = () => {
  const { register, handleSubmit, reset } = useForm<FormData>();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    const { error } = await supabase
      .from("contact_messages")
      .insert([data]);

    if (error) {
      setToast("Failed to send message");
    } else {
      setToast("Message sent successfully");
      reset();
    }

    setLoading(false);

    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  return (
    <div className="w-full pb-8 min-[375px]:pb-12 px-3 min-[375px]:px-5 sm:px-10 lg:px-30">

      {toast && (
        <div className="fixed top-6 right-6 bg-black text-white px-5 py-3 rounded shadow-lg z-50">
          {toast}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col-reverse lg:flex-row gap-6 min-[375px]:gap-10">

          <div className="flex-1">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4 min-[375px]:gap-6"
            >
              <div>
                <label htmlFor="contact-full-name" className="text-sm font-semibold text-[#6C7275]">
                  FULL NAME
                </label>
                <input
                  id="contact-full-name"
                  autoComplete="name"
                  {...register("full_name", { required: true })}
                  type="text"
                  placeholder="Your Name"
                  className="w-full mt-1 min-[375px]:mt-2 px-3 min-[375px]:px-4 py-2 min-[375px]:py-3 border border-[#CBCBCB] rounded-md text-sm min-[375px]:text-base"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="text-sm font-semibold text-[#6C7275]">
                  EMAIL ADDRESS
                </label>
                <input
                  id="contact-email"
                  autoComplete="email"
                  {...register("email", { required: true })}
                  type="email"
                  placeholder="Your Email"
                  className="w-full mt-1 min-[375px]:mt-2 px-3 min-[375px]:px-4 py-2 min-[375px]:py-3 border border-[#CBCBCB] rounded-md text-sm min-[375px]:text-base"
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="text-sm font-semibold text-[#6C7275]">
                  MESSAGE
                </label>
                <textarea
                  id="contact-message"
                  autoComplete="off"
                  {...register("message", { required: true })}
                  rows={5}
                  placeholder="Your message"
                  className="w-full mt-1 min-[375px]:mt-2 px-3 min-[375px]:px-4 py-2 min-[375px]:py-3 border border-[#CBCBCB] rounded-md text-sm min-[375px]:text-base"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-black text-white text-sm min-[375px]:text-[16px] px-[24px] min-[375px]:px-[40px] py-2 min-[375px]:py-3 rounded-[8px] w-full sm:w-fit hover:bg-gray-800 transition"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          <div className="flex-1">
            <div className="w-full h-[200px] min-[375px]:h-[300px] sm:h-[400px] lg:h-full overflow-hidden rounded-md min-[375px]:rounded-none">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3670.0000000000005!2d72.8310623152608!3d21.170240992318026!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e849b0c12345%3A0x123456789abcdef!2sSurat%2C%20Gujarat%2C%20India!5e0!3m2!1sen!2s!4v1690000000000"
                width="100%"
                height="100%"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MapPage;