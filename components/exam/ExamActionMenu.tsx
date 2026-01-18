"use client";

import { MoreVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  onEdit: () => void;
  onClone: () => void;
  onDelete: () => void;
}

export default function ExamActionMenu({
  onEdit,
  onClone,
  onDelete,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close khi click ra ngoài
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <MoreVertical
        size={16}
        className="cursor-pointer text-gray-500 hover:text-gray-700"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      />

      {open && (
        <div className="absolute right-0 top-6 z-50 w-40 rounded-xl bg-white border shadow-lg text-sm">
          <button
            className="w-full px-3 py-2 text-left hover:bg-gray-50"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
              setOpen(false);
            }}
          >
            ✏️ Chỉnh sửa
          </button>

          <button
            className="w-full px-3 py-2 text-left hover:bg-gray-50"
            onClick={(e) => {
              e.stopPropagation();
              onClone();
              setOpen(false);
            }}
          >
            📋 Nhân bản
          </button>

          <div className="h-px bg-gray-100 my-1" />

          <button
            className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
              setOpen(false);
            }}
          >
            🗑️ Xoá
          </button>
        </div>
      )}
    </div>
  );
}
