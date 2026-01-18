"use client";

import { useEffect, useMemo, useState } from "react";
import { ScoreBySubject } from "@/types/score";
import Pagination from "@/components/ui/Pagination";

interface Props {
  data: ScoreBySubject[];
}

export default function ScoreBySubjectTable({ data }: Props) {
  /* ===== PAGINATION ===== */
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.ceil(data.length / pageSize);

  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page]);

  // reset page khi đổi môn / học kỳ
  useEffect(() => {
    setPage(1);
  }, [data]);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
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
          {pagedData.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="py-6 text-center text-gray-500"
              >
                Chưa có dữ liệu
              </td>
            </tr>
          ) : (
            pagedData.map((s, index) => (
              <tr key={s.studentId} className="border-t">
                {/* STT toàn bảng */}
                <td className="p-3 text-center">
                  {(page - 1) * pageSize + index + 1}
                </td>

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
            ))
          )}
        </tbody>
      </table>

      {/* ===== PAGINATION ===== */}
      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={setPage}
      />
    </div>
  );
}
