"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import type { ImportedStudent } from "@/types/Student";

const PRIMARY = "#518581";

type Props = {
  open: boolean;
  onClose: () => void;
  students: ImportedStudent[];
  onConfirm: (selected: ImportedStudent[]) => void;
};

export default function ConfirmParentsModal({ open, onClose, students, onConfirm }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(students.map(s => s.id)));

  const allChecked = useMemo(() => selectedIds.size === students.length && students.length > 0, [selectedIds, students]);
  const count = selectedIds.size;

  function toggleAll() {
    if (allChecked) setSelectedIds(new Set());
    else setSelectedIds(new Set(students.map(s => s.id)));
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedStudents = useMemo(
    () => students.filter((s) => selectedIds.has(s.id)),
    [students, selectedIds]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 flex items-start justify-between">
          <div>
            <div className="text-xl font-semibold text-gray-900">Xác nhận tạo tài khoản</div>
            <div className="text-sm text-gray-500 mt-1">Đã chọn {count}/{students.length} tài khoản</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-md hover:bg-gray-100 flex items-center justify-center"
            title="Đóng"
          >
            <XIcon />
          </button>
        </div>

        <div className="px-6 pb-6">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 flex items-start gap-2">
            <span>💡</span>
            <span>Hệ thống sẽ tự động tạo tài khoản cho phụ huynh. Bạn có thể bỏ chọn những học sinh không muốn tạo tài khoản.</span>
          </div>

          <label className="mt-4 flex items-center gap-3 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
            <input type="checkbox" checked={allChecked} onChange={toggleAll} />
            <span className="text-sm font-medium text-gray-800">Chọn tất cả ({count}/{students.length})</span>
          </label>

          <div className="mt-4 space-y-3 max-h-[420px] overflow-auto pr-1">
            {students.map((s) => {
              const checked = selectedIds.has(s.id);
              return (
                <div
                  key={s.id}
                  className={clsx(
                    "rounded-2xl border p-4 flex items-start justify-between gap-4",
                    checked ? "border-emerald-300 bg-emerald-50" : "border-gray-200 bg-white"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <input type="checkbox" checked={checked} onChange={() => toggleOne(s.id)} className="mt-1" />
                    <div>
                      <div className="font-semibold text-gray-900">{s.fullName}</div>
                      <div className="text-xs text-gray-400 mt-1">{s.dob || "-"}</div>

                      <div className="text-sm text-gray-600 mt-3">
                        <div>Phụ huynh: <span className="text-gray-800 font-medium">{s.parentName || "-"}</span></div>
                        <div>Email: <span className="text-gray-800 font-medium">{s.email || "-"}</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-sm text-gray-600">
                    <div className="text-xs text-gray-400">SĐT:</div>
                    <div className="font-medium text-gray-800">{s.phone || "-"}</div>
                    <div className="mt-2 text-xs inline-flex items-center gap-2 text-emerald-700">
                      <ClockIcon />
                      {checked ? "Đã chọn" : "Chưa chọn"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl border border-gray-200 text-gray-800 hover:bg-gray-50"
            >
              Quay lại
            </button>

            <button
              type="button"
              onClick={() => onConfirm(selectedStudents)}
              className="flex-1 h-12 rounded-xl text-white font-medium"
              style={{ backgroundColor: PRIMARY, opacity: count ? 1 : 0.6 }}
              disabled={!count}
            >
              Xác nhận tạo {count} tài khoản
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* icons */
function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 8v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
