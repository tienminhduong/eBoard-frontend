"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ClassTabs({
  classId,
}: {
  classId: string;
}) {
  const pathname = usePathname();

  const tabs = [
    {
      label: "Điểm danh",
      href: `/main/class/${classId}`,
    },
    {
      label: "Kết quả học tập",
      href: `/main/class/${classId}/score`,
    },
    {
      label: "Quỹ lớp",
      href: "#",
      disabled: true,
    },
    {
      label: "Lịch thi & kiểm tra",
      href: "#",
      disabled: true,
    },
    {
      label: "Thời khóa biểu",
      href: "#",
      disabled: true,
    },
  ];

  return (
    <div className="flex gap-3 mb-6">
      {tabs.map((tab) => {
        const isActive =
          !tab.disabled &&
          (pathname === tab.href ||
            pathname.startsWith(tab.href + "/"));

        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={`
              px-5 py-2 rounded-full text-sm font-medium
              transition
              ${
                tab.disabled
                  ? "bg-gray-100 text-gray-400 pointer-events-none"
                  : isActive
                  ? "bg-pink-500 text-white shadow"
                  : "bg-white text-gray-500 hover:bg-pink-100"
              }
            `}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
