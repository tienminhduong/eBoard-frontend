import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  accentColor?: string; // màu viền trái, mặc định xanh
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  accentColor = "#6BCDB1",
}: StatCardProps) {
  return (
    <div
      className="relative bg-white rounded-2xl p-4 flex items-center gap-4"
      style={{
        borderLeft: `6px solid ${accentColor}`,
      }}
    >
      {/* Icon box */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{
          backgroundColor: `${accentColor}20`, // màu nhạt hơn
        }}
      >
        <Icon size={28} style={{ color: accentColor }} />
      </div>

      {/* Content */}
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
