"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { ScoreBySubject } from "@/types/score";
import { scoreService } from "@/services/scoreService";

interface Props {
  open: boolean;
  onClose: () => void;
  classId: string;
  semester: number;
  subjectId: string;
  subjectName: string;
}

export default function ScoreInputBySubjectModal({
  open,
  onClose,
  classId,
  semester,
  subjectId,
  subjectName,
}: Props) {
  const [scores, setScores] = useState<ScoreBySubject[]>([]);
  const [loading, setLoading] = useState(false);

  /* ===== LOAD DATA ===== */
  useEffect(() => {
  if (!open || !classId || !subjectId) return;

  const loadData = async () => {
    setLoading(true);

    try {
      const [students, subjectScores] = await Promise.all([
        scoreService.getStudents(classId),
        scoreService.getScoresBySubject({ classId, semester, subjectId }),
      ]);

      const scoreMap = new Map(
        subjectScores.map((s) => [s.studentId, s])
      );

      const merged: ScoreBySubject[] = students.map((st) => {
        const existed = scoreMap.get(st.id);

        return (
          existed ?? {
            studentId: st.id,
            studentName: st.name,
            midtermScore: null,
            finalScore: null,
            averageScore: null,
            grade: null,
            note: undefined, // ✅ FIX Ở ĐÂY
          }
        );
      });


      setScores(merged);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, [open, classId, semester, subjectId]);

  /* ===== UPDATE SCORE ===== */
  const updateScore = (
    studentId: string,
    field: "midtermScore" | "finalScore",
    value: number | null
  ) => {
    setScores((prev) =>
      prev.map((s) =>
        s.studentId === studentId
          ? { ...s, [field]: value }
          : s
      )
    );
  };

  /* ===== SAVE ===== */
  const handleSave = async () => {
    await scoreService.saveScoresBySubject({
      classId,
      semester,
      subjectId,
      scores: scores.map((s) => ({
        studentId: s.studentId,
        midtermScore: s.midtermScore ?? 0,
        finalScore: s.finalScore ?? 0,
      })),
    });

    onClose();
  };


  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Nhập điểm môn ${subjectName}`}
      width="max-w-6xl"
    >
      {/* ===== INFO ===== */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Info label="Môn học" value={subjectName} />
        <Info label="Học kỳ" value={`Học kỳ ${semester}`} />
      </div>

      {/* ===== TABLE ===== */}
      <div className="border rounded-xl overflow-hidden">
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#518581] text-white sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 w-16">STT</th>
                <th className="px-3 py-2 text-left">Họ tên</th>
                <th className="px-3 py-2 w-28">GK</th>
                <th className="px-3 py-2 w-28">CK</th>
                <th className="px-3 py-2 w-28">ĐTB</th>
                <th className="px-3 py-2 w-32">Xếp loại</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              )}

              {!loading &&
                scores.map((s, idx) => (
                  <tr key={s.studentId} className="border-t">
                    <td className="px-3 py-2 text-center">
                      {idx + 1}
                    </td>

                    <td className="px-3 py-2 font-medium">
                      {s.studentName}
                    </td>

                    <td className="px-3 py-2 text-center">
                      <ScoreSelect
                        value={s.midtermScore}
                        onChange={(v) =>
                          updateScore(s.studentId, "midtermScore", v)
                        }
                      />
                    </td>

                    <td className="px-3 py-2 text-center">
                      <ScoreSelect
                        value={s.finalScore}
                        onChange={(v) =>
                          updateScore(s.studentId, "finalScore", v)
                        }
                      />
                    </td>

                    <td className="px-3 py-2 text-center font-semibold">
                      {s.averageScore ?? "-"}
                    </td>

                    <td className="px-3 py-2 text-center">
                      {s.grade || "-"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <div className="flex justify-end gap-2 mt-6">
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="primary" onClick={handleSave}>
          Lưu điểm
        </Button>
      </div>
    </Modal>
  );
}

/* ===== SMALL COMPONENTS ===== */
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <input
        disabled
        value={value}
        className="w-full rounded-xl border px-3 py-2 text-sm bg-gray-50"
      />
    </div>
  );
}

function ScoreSelect({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) =>
        onChange(e.target.value === "" ? null : Number(e.target.value))
      }
      className="w-20 rounded-lg border px-2 py-1 text-sm"
    >
      <option value="">-</option>
      {Array.from({ length: 11 }).map((_, i) => (
        <option key={i} value={i}>
          {i}
        </option>
      ))}
    </select>
  );
}
