"use client";

import clsx from "clsx";

type Props = {
  open: boolean;
  title?: string;
  message?: string;

  onClose: () => void;
  onConfirm: () => void | Promise<void>;

  loading?: boolean;
  error?: string;
};

export default function DeleteConfirmModal({
  open,
  title = "Xác nhận xóa",
  message = "Bạn có chắc chắn muốn xóa học sinh này không?",
  onClose,
  onConfirm,
  loading = false,
  error = "",
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30" onClick={() => !loading && onClose()} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 flex items-start justify-between">
          <div>
            <div className="text-lg font-semibold text-gray-900">{title}</div>
            <div className="text-sm text-gray-500 mt-1">{message}</div>
          </div>

          <button
            type="button"
            onClick={() => !loading && onClose()}
            className={clsx(
              "w-9 h-9 rounded-md flex items-center justify-center",
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
            )}
            title="Đóng"
            disabled={loading}
          >
            <XIcon />
          </button>
        </div>

        {error ? (
          <div className="px-6 pb-2">
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          </div>
        ) : null}

        <div className="px-6 pb-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={clsx(
              "flex-1 h-11 rounded-xl border border-gray-200 text-gray-800",
              loading ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-50"
            )}
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={clsx(
              "flex-1 h-11 rounded-xl text-white font-medium",
              loading && "opacity-70 cursor-not-allowed"
            )}
            style={{ backgroundColor: "#ef4444" }}
          >
            {loading ? "Đang xóa..." : "Xóa"}
          </button>
        </div>
      </div>
    </div>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
