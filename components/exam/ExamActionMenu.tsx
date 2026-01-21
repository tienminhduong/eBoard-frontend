"use client";

import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  onEdit: () => void;
  onDelete: () => void;
}

export default function ExamActionMenu({
  onEdit,
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
        <div className="absolute right-2 top-8 z-50 w-36 rounded-lg bg-white shadow-lg border text-black">
          <button
            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
              setOpen(false);
            }}
          >
            <Pencil size={14} />
            Chỉnh sửa
          </button>

          <button
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
              setOpen(false);
            }}
          >
            <Trash2 size={14} />
            Xoá
          </button>
        </div>
      )}
    </div>
  );
}
