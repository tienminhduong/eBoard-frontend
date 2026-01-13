import { Pencil, ChevronRight } from "lucide-react";
import { StudentScore } from "@/types/score";

interface Props {
  data: StudentScore[];
}

export default function ScoreTable({ data }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-3 text-left">STT</th>
            <th className="px-4 py-3 text-left">Họ tên học sinh</th>
            <th className="px-4 py-3 text-left">Điểm TB</th>
            <th className="px-4 py-3 text-left">Xếp loại</th>
            <th className="px-4 py-3 text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {data.map((s, index) => (
            <tr key={s.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-3">{index + 1}</td>
              <td className="px-4 py-3 font-medium">{s.name}</td>
              <td className="px-4 py-3">{s.averageScore}</td>
              <td className="px-4 py-3">
                <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-600">
                  {s.rank}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-center gap-3">
                  <Pencil size={16} className="cursor-pointer" />
                  <ChevronRight size={18} className="cursor-pointer" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
