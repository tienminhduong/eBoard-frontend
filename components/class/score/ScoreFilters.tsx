import { Plus, Pencil, Printer, FileDown } from "lucide-react";

interface Props {
  semester: string;
  onSemesterChange: (value: string) => void;
}

export default function ScoreFilters({
  semester,
  onSemesterChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap gap-3">
        <select
          value={semester}
          onChange={(e) => onSemesterChange(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="1">Học kỳ 1</option>
          <option value="2">Học kỳ 2</option>
        </select>

        <select className="border rounded-lg px-3 py-2 text-sm">
          <option>Chọn học sinh</option>
        </select>

        <div className="flex rounded-lg overflow-hidden border">
          <button className="px-4 py-2 text-sm bg-emerald-500 text-white">
            Danh sách
          </button>
          <button className="px-4 py-2 text-sm text-gray-600">
            Chi tiết
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <ActionButton icon={<Plus size={16} />} label="Nhập điểm" primary />
        <ActionButton icon={<Pencil size={16} />} label="Chỉnh sửa điểm" />
        <ActionButton icon={<Printer size={16} />} label="In bảng điểm" />
        <ActionButton icon={<FileDown size={16} />} label="Xuất Excel" />
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  primary,
}: {
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
}) {
  return (
    <button
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm
        ${primary ? "bg-emerald-500 text-white" : "border"}`}
    >
      {icon}
      {label}
    </button>
  );
}
