"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ClassSidebar({
  classId,
}: {
  classId: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-white border-r p-4 flex flex-col">
      {/* Back */}
      <Link
        href="/main/class"
        className="text-sm text-gray-500 mb-4 block"
      >
        ← Quay lại
      </Link>

      {/* Class info */}
      <h2 className="font-semibold text-lg">
        Lớp {classId}
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Năm học 2025–2026
      </p>

      {/* NAV */}
      <nav className="space-y-2">
        <SidebarItem
          href={`/main/class/${classId}`}
          label="Điểm danh"
          active={pathname === `/main/class/${classId}`}
        />

        <SidebarItem
          href={`/main/class/${classId}/score`}
          label="Kết quả học tập"
          active={pathname.startsWith(
            `/main/class/${classId}/score`
          )}
        />

        <SidebarItem label="Quỹ lớp" disabled />
        <SidebarItem label="Lịch thi & kiểm tra" disabled />
        <SidebarItem label="Thời khóa biểu" disabled />
      </nav>
    </aside>
  );
}
function SidebarItem({
  href = "#",
  label,
  active,
  disabled,
}: {
  href?: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`
        block px-4 py-2 rounded-lg text-sm transition
        ${
          active
            ? "bg-pink-500 text-white font-medium"
            : "text-gray-700 hover:bg-pink-100"
        }
        ${disabled ? "text-gray-300 pointer-events-none" : ""}
      `}
    >
      {label}
    </Link>
  );
}
