"use client";

import { ScoreBySubject } from "@/types/score";

interface Props {
  data: ScoreBySubject[];
}

export default function ScoreBySubjectTable({ data }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="p-3 text-center w-12">STT</th>
            <th className="p-3 text-left">Họ tên</th>
            <th className="p-3 text-center">GK</th>
            <th className="p-3 text-center">CK</th>
            <th className="p-3 text-center">ĐTB</th>
            <th className="p-3 text-center">Xếp loại</th>
            <th className="p-3 text-left">Ghi chú</th>
          </tr>
        </thead>

        <tbody>
          {data.map((s, idx) => (
            <tr key={s.studentId} className="border-t">
              <td className="p-3 text-center">{idx + 1}</td>

              <td className="p-3 font-medium">
                {s.studentName}
              </td>

              <td className="p-3 text-center">
                {s.midtermScore ?? "-"}
              </td>

              <td className="p-3 text-center">
                {s.finalScore ?? "-"}
              </td>

              <td className="p-3 text-center font-semibold">
                {s.averageScore ?? "-"}
              </td>

              <td className="p-3 text-center">
                {s.grade || "-"}
              </td>

              <td className="p-3">
                {s.note ?? ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
