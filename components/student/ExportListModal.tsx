"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import * as XLSX from "xlsx";

const PRIMARY = "#518581";

export type ExportType = "students" | "parents" | "full";

import type { StudentRow } from "@/types/Student";


type Props = {
  open: boolean;
  onClose: () => void;
  students: StudentRow[];
  className?: string;
};

function downloadWorkbook(wb: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(wb, filename);
}

function sheetFromJson(rows: any[]) {
  const ws = XLSX.utils.json_to_sheet(rows);
  // auto width simple
  const keys = rows.length ? Object.keys(rows[0]) : [];
  ws["!cols"] = keys.map((k) => {
    const max = Math.max(
      k.length,
      ...rows.map((r) => String(r[k] ?? "").length)
    );
    return { wch: Math.min(40, Math.max(10, max + 2)) };
  });
  return ws;
}

export default function ExportListModal({ open, onClose, students, className }: Props) {
  const [type, setType] = useState<ExportType>("students");

  const options = useMemo(
    () => [
      {
        key: "students" as const,
        title: "Danh sách học sinh",
        desc: "Xuất thông tin học sinh (STT, Họ tên, Ngày sinh, Địa chỉ)",
        icon: <UsersIcon />,
        iconBg: "bg-emerald-50 text-emerald-700",
      },
      {
        key: "parents" as const,
        title: "Danh sách phụ huynh",
        desc: "Xuất thông tin tài khoản phụ huynh (Họ tên, SĐT, Email, Tài khoản, Mật khẩu)",
        icon: <ParentIcon />,
        iconBg: "bg-amber-50 text-amber-700",
      },
      {
        key: "full" as const,
        title: "Danh sách đầy đủ",
        desc: "Xuất toàn bộ thông tin học sinh và phụ huynh",
        icon: <DocIcon />,
        iconBg: "bg-indigo-50 text-indigo-700",
      },
    ],
    []
  );

  function handleDownload() {
    const wb = XLSX.utils.book_new();

    if (type === "students") {
      const rows = students.map((s, i) => ({
        STT: i + 1,
        "Họ và tên": s.fullName,
        "Ngày sinh": s.dob,
        "Địa chỉ": s.address,
      }));
      XLSX.utils.book_append_sheet(wb, sheetFromJson(rows), "DanhSachHocSinh");
      downloadWorkbook(wb, "DanhSachHocSinh.xlsx");
    }

    if (type === "parents") {
      const rows = students.map((s, i) => ({
        STT: i + 1,
        "Họ tên phụ huynh": s.parentName,
        "SĐT": s.phone,
        Email: s.email,
        "Tài khoản": s.phone,
        "Mật khẩu": s.password,
      }));
      XLSX.utils.book_append_sheet(wb, sheetFromJson(rows), "DanhSachPhuHuynh");
      downloadWorkbook(wb, "DanhSachPhuHuynh.xlsx");
    }

    if (type === "full") {
      const rows = students.map((s, i) => ({
        STT: i + 1,
        "Họ và tên HS": s.fullName,
        "Ngày sinh": s.dob,
        "Địa chỉ": s.address,
        "Họ tên PHHS": s.parentName,
        Email: s.email,
        "SĐT/Tài khoản": s.phone,
        "Mật khẩu": s.password,
      }));
      XLSX.utils.book_append_sheet(wb, sheetFromJson(rows), "DanhSachDayDu");
      downloadWorkbook(wb, "DanhSachDayDu.xlsx");
    }

    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className={clsx("relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden", className)}>
        {/* header */}
        <div className="px-6 py-5 flex items-start justify-between">
          <div>
            <div className="text-xl font-semibold text-gray-900">Xuất danh sách</div>
            <div className="text-sm text-gray-500 mt-1">Chọn loại danh sách cần xuất</div>
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

        <div className="px-6 pb-6 space-y-4">
          {options.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => setType(o.key)}
              className={clsx(
                "w-full rounded-2xl border p-4 text-left flex items-center justify-between gap-4 transition",
                type === o.key ? "border-gray-300 bg-gray-50" : "border-gray-200 hover:bg-gray-50"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center", o.iconBg)}>
                  {o.icon}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{o.title}</div>
                  <div className="text-sm text-gray-500 mt-1">{o.desc}</div>
                </div>
              </div>

              <div className={clsx("w-5 h-5 rounded-full border flex items-center justify-center", type === o.key ? "border-gray-900" : "border-gray-300")}>
                {type === o.key && <div className="w-3 h-3 rounded-full bg-gray-900" />}
              </div>
            </button>
          ))}

          <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-sm text-gray-600 flex items-center gap-2">
            <span className="text-amber-500">💡</span>
            <span>Lưu ý: File sẽ được xuất dưới định dạng Excel (.xlsx)</span>
          </div>

          <button
            type="button"
            onClick={handleDownload}
            className="w-full h-12 rounded-xl border text-gray-900 hover:bg-gray-50"
          >
            Đóng & Tải file
          </button>
        </div>
      </div>
    </div>
  );
}

/* icons */
function UsersIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16.5 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function ParentIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M16 11a4 4 0 1 0-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 22c0-4 4-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 8.5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M21 8.5l-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function DocIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 13h8M8 17h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
