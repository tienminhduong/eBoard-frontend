"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  classId: string;
}

const tabs = [
  {
    label: "Điểm danh",
    path: "",
  },
  {
    label: "Kết quả học tập",
    path: "/score",
  },
  {
    label: "Quỹ lớp",
    path: "/fund",
    disabled: true,
  },
  {
    label: "Lịch thi & kiểm tra",
    path: "/exam",
    disabled: true,
  },
  {
    label: "Thời khóa biểu",
    path: "/timetable",
    disabled: true,
  },
];

export default function ClassTopNav({ classId }: Props) {
  const pathname = usePathname();

  return (
    <div className="bg-white rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link
          href="/main/class"
          className="text-gray-400 hover:text-gray-600"
        >
          ←
        </Link>

        <div>
          <h2 className="font-semibold text-lg">
            Lớp {classId}
          </h2>
          <p className="text-sm text-gray-400">
            Năm học 2025–2026
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => {
          const fullPath = `/main/class/${classId}${tab.path}`;
          const active =
            tab.path === ""
              ? pathname === fullPath
              : pathname.startsWith(fullPath);

          return (
            <Link
              key={tab.label}
              href={tab.disabled ? "#" : fullPath}
              className={`
                px-5 py-2 rounded-full text-sm transition
                ${
                  active
                    ? "bg-pink-500 text-white shadow"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }
                ${
                  tab.disabled
                    ? "opacity-40 pointer-events-none"
                    : ""
                }
              `}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
