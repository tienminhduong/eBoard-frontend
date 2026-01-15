"use client";

import Button from "@/components/ui/Button";
import { ScoreBySubject } from "@/types/score";

interface Props {
  open: boolean;
  onClose: () => void;

  data: ScoreBySubject[];

  className: string;
  schoolYear: string;
  semester: number;
  subjectName: string;
}

function calcAverage(mid: number | null, fin: number | null) {
  if (mid == null || fin == null) return null;
  return Number(((mid + fin * 2) / 3).toFixed(1));
}

function classify(avg: number | null) {
  if (avg == null) return "-";
  if (avg >= 8) return "Giỏi";
  if (avg >= 6.5) return "Khá";
  if (avg >= 5) return "TB";
  return "Yếu";
}

export default function ScoreBySubjectPrintModal({
  open,
  onClose,
  data,
  className,
  schoolYear,
  semester,
  subjectName,
}: Props) {
  if (!open) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-[1000px] max-h-[90vh] rounded-xl shadow-lg overflow-hidden flex flex-col">

        {/* ===== HEADER (KHÔNG IN) ===== */}
        <div className="px-6 py-4 border-b text-center print:hidden">
          <h2 className="text-xl font-semibold uppercase">
            In bảng điểm theo môn
          </h2>
        </div>

        {/* ===== CONTENT (IN) ===== */}
        <div className="px-6 py-6 overflow-auto space-y-6 print-area">

          {/* ===== TITLE ===== */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold uppercase">
              BẢNG ĐIỂM MÔN {subjectName}
            </h1>
            <div className="text-sm">
              Lớp: <strong>{className}</strong>
            </div>
            <div className="text-sm">
              Năm học: <strong>{schoolYear}</strong>
            </div>
            <div className="text-sm">
              Học kỳ: <strong>{semester}</strong>
            </div>
          </div>

          {/* ===== TABLE ===== */}
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
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
                {data.map((s, idx) => {
                  const avg = calcAverage(
                    s.midtermScore,
                    s.finalScore
                  );

                  return (
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
                        {avg ?? "-"}
                      </td>
                      <td className="p-3 text-center">
                        {classify(avg)}
                      </td>
                      <td className="p-3">
                        {s.note || ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ===== SIGNATURE ===== */}
          <div className="grid grid-cols-2 gap-8 mt-16 text-center text-sm">
            <div>
              <div className="font-medium">Giáo viên bộ môn</div>
              <div className="italic mt-20">(Ký, ghi rõ họ tên)</div>
            </div>

            <div>
              <div className="font-medium">
                Xác nhận Ban Giám Hiệu
              </div>
              <div className="italic mt-20">(Ký, đóng dấu)</div>
            </div>
          </div>
        </div>

        {/* ===== ACTION (KHÔNG IN) ===== */}
        <div className="px-6 py-4 border-t flex justify-end gap-3 print:hidden">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button onClick={handlePrint}>
            In bảng điểm
          </Button>
        </div>
      </div>
    </div>
  );
}
