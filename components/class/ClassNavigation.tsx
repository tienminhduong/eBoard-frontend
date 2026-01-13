"use client";

import { usePathname, useRouter } from "next/navigation";

const tabs = [
  { label: "Điểm danh", path: "/main/class/attendance" },
  { label: "Kết quả học tập", path: "/main/class/study-result" },
  { label: "Quỹ lớp", path: "/main/class/fund" },
  { label: "Lịch thi", path: "/main/class/exam" },
  { label: "Thời khóa biểu", path: "/main/class/schedule" },
];

export default function ClassNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex gap-3">
      {tabs.map((tab) => {
        const active = pathname === tab.path;

        return (
          <button
            key={tab.path}
            onClick={() => router.push(tab.path)}
            className={`
              px-5 py-2 rounded-full text-base font-medium transition
              ${
                active
                  ? "bg-[#518581] text-white shadow-md"
                  : "bg-white text-gray-500 border hover:bg-[#518581]/10"
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
