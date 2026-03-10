"use client";
import { useState } from "react";
import { APP_ROUTE } from "@/constants/AppRoutes";
import Link from "next/link";

export const useRequireLogin = () => {
  const [showModal, setShowModal] = useState(false);

  // Wrap any action with login check
  const requireLogin = (action: () => void, user: any) => {
    if (!user) {
      setShowModal(true);
      return;
    }
    action();
  };

  const LoginModal = () => (
    showModal ? (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-white p-6 rounded-lg w-[90%] max-w-sm text-center shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Sign In Required</h3>
          <p className="text-gray-600 mb-6">
            You must sign in to perform this action.
          </p>
          <Link
            href={APP_ROUTE.signin}
            className="inline-block bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            Go to Sign In
          </Link>
          <button
            onClick={() => setShowModal(false)}
            className="mt-4 text-gray-500 hover:text-black underline"
          >
            Cancel
          </button>
        </div>
      </div>
    ) : null
  );

  return { requireLogin, LoginModal };
};