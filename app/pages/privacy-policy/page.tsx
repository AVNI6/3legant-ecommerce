import React from "react";
import { PRIVACY_POLICY_CONTENT } from "@/sections/PolicyContent";

export const metadata = {
  title: "Privacy Policy | 3legant.",
  description: "Privacy Policy and data handling for 3legant.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="flex flex-col min-h-screen">


      <div className="flex-1 max-w-4xl mx-auto px-4 min-[375px]:px-6 sm:px-10 lg:px-10 py-10 min-[375px]:py-16 md:py-20">
        <h1 className="text-2xl min-[375px]:text-3xl sm:text-4xl md:text-5xl font-semibold mb-6 min-[375px]:mb-10 text-center text-black">
          Privacy Policy
        </h1>
        {PRIVACY_POLICY_CONTENT}
      </div>
    </main>
  );
}
