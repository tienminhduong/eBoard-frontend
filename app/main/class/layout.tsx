import ClassNavigation from "@/components/class/ClassNavigation";
import { School } from "lucide-react";

export default function ClassLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {/* Header thông tin lớp */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#518581]/10 flex items-center justify-center">
          <School className="text-[#518581]" size={20} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Lớp 5A
          </h2>
          <p className="text-sm text-gray-400">
            Năm học 2025 – 2026
          </p>
        </div>
      </div>

      {/* Thanh navigation ngang */}
      <ClassNavigation />

      {/* Nội dung từng tab */}
      <div>{children}</div>
    </div>
  );
}
