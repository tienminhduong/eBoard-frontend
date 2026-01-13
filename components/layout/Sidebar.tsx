"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  PlusCircle,
  BookOpen,
  Users,
  Sparkles,
  AlertCircle,
  BarChart2,
  Settings,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-white border-r px-4 py-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-[#518581] flex items-center justify-center">
          <GraduationCap className="text-white w-6 h-6" />
        </div>
        <div>
          <div className="font-semibold text-lg">Quản lý lớp học</div>
          <div className="text-sm text-gray-400">Tiểu học</div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-1">
        <SidebarItem
          href="/main/create-class"
          label="Tạo lớp học"
          icon={<PlusCircle />}
          active={pathname === "/main/create-class"}
        />
        <SidebarItem
          href="/main/class"
          label="Lớp của tôi"
          icon={<BookOpen />}
          active={pathname.startsWith("/main/class")}
        />
        <SidebarItem
          href="/main/student"
          label="Học sinh"
          icon={<Users />}
          active={pathname === "/main/student"}
        />
        <SidebarItem
          href="/main/activity"
          label="Hoạt động ngoại khóa"
          icon={<Sparkles />}
          active={pathname === "/main/activity"}
        />
        <SidebarItem
          href="/main/violation"
          label="Cảnh báo vi phạm"
          icon={<AlertCircle />}
          active={pathname === "/main/violation"}
        />
        <SidebarItem
          href="/main/report"
          label="Báo cáo thống kê"
          icon={<BarChart2 />}
          active={pathname === "/main/report"}
        />
        <SidebarItem
          href="/main/setting"
          label="Cài đặt"
          icon={<Settings />}
          active={pathname === "/main/setting"}
        />
      </nav>

      {/* Tip box */}
      <div className="mt-6 p-4 rounded-xl bg-orange-50 border border-orange-200 text-sm">
        <div className="font-semibold flex items-center gap-1 mb-1">
          💡 Mẹo nhỏ
        </div>
        <div className="text-gray-600">
          Bạn có thể tạo lớp học và quản lý học sinh dễ dàng!
        </div>
      </div>
    </aside>
  );
}

function SidebarItem({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl transition
        ${
          active
            ? "bg-[#518581] text-white shadow"
            : "text-gray-600 hover:bg-[#518581]/10"
        }
      `}
    >
      <span
        className={`
          w-5 h-5
          ${active ? "text-white" : "text-[#518581]"}
        `}
      >
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
