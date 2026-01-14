"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/inputType/Select";
import { FormField } from "@/components/ui/FormField";
import { SubjectScore } from "@/types/score";
import { scoreService } from "@/services/scoreService";

interface Props {
  open: boolean;
  onClose: () => void;
  classId: string;
  semester: number;
  studentId?: string;
}

export default function ScoreInputModal({
  open,
  onClose,
  classId,
  semester,
  studentId: studentIdFromParent,
}: Props) {
  const [studentId, setStudentId] = useState<string>();

  const [students, setStudents] = useState<
    { id: string; name: string }[]
  >([]);

  const [scores, setScores] = useState<SubjectScore[]>([]);
  const [loading, setLoading] = useState(false);

  /* ===== LOAD STUDENTS WHEN OPEN ===== */
  useEffect(() => {
    if (!open) return;

    setStudentId(studentIdFromParent);
    setScores([]);

    scoreService.getStudents(classId).then(setStudents);
  }, [open, classId]);

  /* ===== LOAD SCORE OF STUDENT ===== */
  useEffect(() => {
    if (!studentId) return;

    setLoading(true);

    scoreService
      .getSubjectScores({
        classId,
        semester,
        studentId,
      })
      .then((data) => {
        // 👉 Có dữ liệu → sửa
        // 👉 Không có → BE trả về danh sách môn với null
        setScores(data);
      })
      .finally(() => setLoading(false));
  }, [studentId, classId, semester]);

  /* ===== HANDLE CHANGE ===== */
  const updateScore = (
    subjectId: string,
    field: "midTermScore" | "finalTermScore",
    value: number | null
  ) => {
    setScores((prev) =>
      prev.map((s) =>
        s.subjectId === subjectId
          ? { ...s, [field]: value }
          : s
      )
    );
  };

  /* ===== SAVE ===== */
  const handleSave = async () => {
    if (!studentId) return;
    const mappedScores = scores.map(item => ({
    subjectId: item.subjectId,
    score:
      item.midTermScore !== null && item.finalTermScore !== null
        ? Math.round((item.midTermScore + item.finalTermScore) / 2)
        : null,
  }));


    await scoreService.saveScores({
      studentId,
      semester,
       scores: mappedScores,
    });

    onClose();
  };
  /* ===== RENDER ===== */
  const [studentName, setStudentName] = useState("");
  useEffect(() => {
  if (!studentIdFromParent) return;

  scoreService.getStudents(classId).then((data) => {
    const found = data.find(
      (s) => s.id === studentIdFromParent
    );
    if (found) setStudentName(found.name);
  });
}, [studentIdFromParent, classId]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nhập / chỉnh sửa điểm học sinh"
      width="max-w-5xl"
    >
      {/* ===== FILTER ===== */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {!studentIdFromParent ? (
          <FormField label="Học sinh" required>
            <Select
              placeholder="Chọn học sinh"
              value={studentId}
              onChange={setStudentId}
              options={students.map((s) => ({
                value: s.id,
                label: s.name,
              }))}
            />
          </FormField>
        ) : (
          <FormField label="Học sinh">
            <input
              disabled
              value={studentName}
              className="w-full rounded-xl border px-3 py-2 text-sm bg-gray-50"
            />
          </FormField>
        )}

        <FormField label="Học kỳ">
          <input
            disabled
            value={`Học kỳ ${semester}`}
            className="w-full rounded-xl border px-3 py-2 text-sm bg-gray-50"
          />
        </FormField>
      </div>

      {/* ===== TABLE ===== */}
      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#518581] text-white">
            <tr>
              <th className="px-3 py-2 w-16">STT</th>
              <th className="px-3 py-2">Môn học</th>
              <th className="px-3 py-2 w-32">Giữa kỳ</th>
              <th className="px-3 py-2 w-32">Cuối kỳ</th>
              <th className="px-3 py-2 w-32">ĐTB</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            )}

            {!loading &&
              scores.map((s, idx) => (
                <tr key={s.subjectId} className="border-t">
                  <td className="px-3 py-2 text-center">
                    {idx + 1}
                  </td>
                  <td className="px-3 py-2">
                    {s.subjectName}
                  </td>

                  <td className="px-3 py-2 text-center">
                    <ScoreSelect
                      value={s.midTermScore}
                      onChange={(v) =>
                        updateScore(
                          s.subjectId,
                          "midTermScore",
                          v
                        )
                      }
                    />
                  </td>

                  <td className="px-3 py-2 text-center">
                    <ScoreSelect
                      value={s.finalTermScore}
                      onChange={(v) =>
                        updateScore(
                          s.subjectId,
                          "finalTermScore",
                          v
                        )
                      }
                    />
                  </td>

                  <td className="px-3 py-2 text-center font-medium">
                    {s.averageScore ?? "-"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
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

/* ===== SCORE SELECT ===== */
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
      className="w-24 rounded-lg border px-2 py-1 text-sm"
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
