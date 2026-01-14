import { SubjectScore, ScoreDetailSummary } from "@/types/score";

export default function ScoreDetailTable({
  data,
  summary,
}: {
  data: SubjectScore[];
  summary?: ScoreDetailSummary | null;
}) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      {/* ===== TABLE ===== */}
      <table className="w-full text-sm table-fixed">
        <thead className="bg-[#518581] text-white">
          <tr>
            <th className="w-[60px] px-3 py-2 text-center">STT</th>
            <th className="px-3 py-2 text-left">Môn học</th>
            <th className="w-[120px] px-3 py-2 text-center">Giữa kỳ</th>
            <th className="w-[120px] px-3 py-2 text-center">Cuối kỳ</th>
            <th className="w-[120px] px-3 py-2 text-center">ĐTB</th>
          </tr>
        </thead>

        <tbody>
          {data.map((s, idx) => (
            <tr key={s.subjectId} className="border-t hover:bg-gray-50">
              <td className="px-3 py-2 text-center">{idx + 1}</td>

              <td className="px-3 py-2 text-left">{s.subjectName}</td>

              <td className="px-3 py-2 text-center">
                {s.midTermScore ?? "-"}
              </td>

              <td className="px-3 py-2 text-center">
                {s.finalTermScore ?? "-"}
              </td>

              <td className="px-3 py-2 text-center font-medium">
                {s.averageScore ?? "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ===== SUMMARY ===== */}
      <div className="border-t bg-[#f3f8f6] px-6 py-4">
        <div className="flex justify-end gap-12 text-sm text-gray-600">
          {/* Rank */}
          <div className="text-center">
            <div className="text-xs">Xếp hạng</div>
            <div className="text-lg font-semibold text-gray-900">
              {summary?.rank ?? "-"}
            </div>
          </div>

          {/* Overall average */}
          <div className="text-center">
            <div className="text-xs">Điểm trung bình chung</div>
            <div className="text-lg font-semibold text-gray-900">
              {summary?.averageScore?.toFixed(2)}
            </div>
          </div>

          {/* Grade */}
          <div className="text-center">
            <div className="text-xs">Xếp loại học lực</div>
            <div className="text-lg font-semibold text-[#518581]">
              {summary?.grade}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
