"use client";

import { X } from "lucide-react";
import { ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  width?: string;
}

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  width = "max-w-xl",
}: ModalProps) {
  if (!open) return null;
  if (typeof window === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal box */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className={`relative bg-white rounded-2xl shadow-lg w-full ${width} max-h-[80vh] flex flex-col`}
        >
          {/* Header */}
          {(title || description) && (
            <div className="px-6 pt-4 pb-2">
              <div className="flex justify-between items-start">
                <div>
                  {title && (
                    <h3 className="text-lg font-semibold">{title}</h3>
                  )}
                  {description && (
                    <p className="text-sm text-gray-400">
                      {description}
                    </p>
                  )}
                </div>

                <button onClick={onClose}>
                  <X className="text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </div>
          )}

          {/* ===== BODY (SCROLL) ===== */}
          <div className="overflow-y-auto px-6 py-4 flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
