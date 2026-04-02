"use client"

import { ReactNode } from "react"

type ConfirmModalProps = {
  title: string
  message: ReactNode
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
  loading?: boolean
}

export default function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8">
          <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
          <div className="text-sm text-gray-500 mb-8 leading-relaxed">
            {typeof message === "string" ? <p>{message}</p> : message}
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-100 rounded-2xl text-xs font-bold text-gray-400 hover:bg-gray-50 transition-all uppercase tracking-widest disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-2xl text-xs font-bold hover:bg-black shadow-lg shadow-gray-200 transition-all uppercase tracking-widest disabled:opacity-50"
            >
              {loading ? "PROCESSING..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
