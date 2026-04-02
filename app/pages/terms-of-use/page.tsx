import React from "react";
import { TERMS_OF_USE_CONTENT } from "@/sections/PolicyContent";

export const metadata = {
  title: "Terms of Use | 3legant.",
  description: "Terms and Conditions for using 3legant.",
};

export default function TermsOfUsePage() {
  return (
    <main className="flex flex-col min-h-screen">

      <div className="flex-1 max-w-4xl mx-auto px-4 min-[375px]:px-6 sm:px-10 lg:px-10 py-10 min-[375px]:py-16 md:py-20">
        <h1 className="text-2xl min-[375px]:text-3xl sm:text-4xl md:text-5xl font-semibold mb-6 min-[375px]:mb-10 text-center text-black">
          Terms of Use
        </h1>

        <div className="text-center mb-12">
          <p className="text-gray-400 text-sm">Last updated: March 29, 2026</p>
        </div>

        {TERMS_OF_USE_CONTENT}

      </div>

    </main>
  );
}
