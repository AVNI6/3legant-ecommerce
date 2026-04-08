"use client";

import { ReactNode, useEffect } from "react";
import { IoCloseOutline } from "react-icons/io5";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  disableClose?: boolean;
};

export default function Modal({ isOpen, onClose, title, children, disableClose = false }: ModalProps) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 min-[375px]:p-6 sm:p-10">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/25 transition-opacity"
        onClick={() => {
          if (!disableClose) onClose();
        }}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-black">{title}</h3>
          <button
            onClick={onClose}
            disabled={disableClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors group disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <IoCloseOutline className="text-2xl text-gray-400 group-hover:text-black" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
          {children}
        </div>


      </div>
    </div>
  );
}
