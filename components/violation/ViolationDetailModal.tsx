"use client";

import { useEffect, useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import Input from "@/components/ui/inputType/Input";
import Textarea from "@/components/ui/inputType/TextArea";
import { violationService } from "@/services/violationService";
import { Violation } from "@/types/violation";

interface Props {
  open: boolean;
  onClose: () => void;
  onUpdated?: () => void;
  classId: string;
  violation: Violation | null;
}

type StudentOption = {
  id: string;
  fullName: string;
};

const LEVEL_OPTIONS = [
  { value: 0, label: "Nhẹ" },
  { value: 1, label: "Trung bình" },
  { value: 2, label: "Nặng" },
];

export default function ViolationDetailModal({
  open,
  onClose,
  onUpdated,
  classId,
  violation,
}: Props) {
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // mỗi ô: {studentId, keyword} (autocomplete)
  const [studentFields, setStudentFields] = useState<
    { studentId: string; keyword: string }[]
  >([{ studentId: "", keyword: "" }]);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const [teacherName, setTeacherName] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [level, setLevel] = useState<number | null>(null);
  const [info, setInfo] = useState("");
  const [penalty, setPenalty] = useState("");

  // studentIds hợp lệ
  const selectedStudentIds = useMemo(() => {
    return studentFields
      .map((x) => x.studentId)
      .filter((id) => id && id.trim() !== "");
  }, [studentFields]);

  const canSubmit =
    !!violation?.id &&
    !!classId &&
    selectedStudentIds.length > 0 &&
    !!teacherName &&
    !!date &&
    !!type &&
    level !== null &&
    !submitting;

  /* ===== Load học sinh theo lớp ===== */
  useEffect(() => {
    if (!open) return;
    if (!classId) return;

    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);

        const res = await violationService.getStudents(classId);
        const list: StudentOption[] = (res.data || []).map((s: any) => ({
          id: s.id,
          fullName: s.fullName,
        }));

        setStudents(list);
      } catch (err) {
        console.error("getStudents error:", err);
        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [classId, open]);

  /* ===== Prefill dữ liệu vi phạm ===== */
  useEffect(() => {
    if (!open) return;
    if (!violation) return;

    // Prefill học sinh: lấy từ involvedStudents
    const initStudentFields =
      violation.involvedStudents?.length > 0
        ? violation.involvedStudents.map((s) => ({
            studentId: s.studentId,
            keyword: s.studentName,
          }))
        : [{ studentId: "", keyword: "" }];

    setStudentFields(initStudentFields);

    setTeacherName(violation.inChargeTeacherName || "");
    setDate(violation.violateDate || "");
    setType(violation.violationType || "");
    setLevel(
      typeof violation.violationLevel === "number"
        ? violation.violationLevel
        : null
    );
    setInfo(violation.violationInfo || "");
    setPenalty(violation.penalty || "");
  }, [open, violation]);

  /* ===== Handlers student fields ===== */
  const addStudentField = () => {
    setStudentFields((prev) => [...prev, { studentId: "", keyword: "" }]);
  };

  const removeStudentField = (index: number) => {
    setStudentFields((prev) => {
      if (prev.length === 1) return [{ studentId: "", keyword: "" }];
      return prev.filter((_, i) => i !== index);
    });

    setActiveIndex((prev) => (prev === index ? null : prev));
  };

  const setKeyword = (index: number, keyword: string) => {
    setStudentFields((prev) =>
      prev.map((x, i) =>
        i === index
          ? {
              studentId: "", // gõ lại -> bỏ chọn cũ
              keyword,
            }
          : x
      )
    );
  };

  const pickStudent = (index: number, s: StudentOption) => {
    setStudentFields((prev) =>
      prev.map((x, i) =>
        i === index
          ? {
              studentId: s.id,
              keyword: s.fullName,
            }
          : x
      )
    );

    setActiveIndex(null);
  };

  /* ===== Submit update ===== */
  const handleUpdate = async () => {
    if (!canSubmit || !violation?.id) return;

    try {
      setSubmitting(true);

      await violationService.update(violation.id, {
        studentIds: selectedStudentIds,
        classId,
        inChargeTeacherName: teacherName,
        violateDate: date,
        violationType: type,
        violationLevel: level,
        violationInfo: info,
        penalty,
      });

      onUpdated?.();
      onClose();
    } catch (err) {
      console.error("update violation error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!violation) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Chi tiết vi phạm"
      description="Xem và chỉnh sửa thông tin vi phạm của học sinh"
    >
      <div className="space-y-4">
        {/* ===== Học sinh (Autocomplete) ===== */}
        <FormField label="Học sinh vi phạm" required>
          <div className="space-y-3">
            {studentFields.map((field, index) => {
              const usedIds = studentFields
                .filter((_, i) => i !== index)
                .map((x) => x.studentId)
                .filter(Boolean);

              const keywordLower = field.keyword.trim().toLowerCase();

              const suggestions = students
                .filter((s) => !usedIds.includes(s.id))
                .filter((s) => {
                  if (!keywordLower) return true;
                  return s.fullName.toLowerCase().includes(keywordLower);
                })
                .slice(0, 8);

              const showSuggest =
                activeIndex === index &&
                field.keyword.trim() !== "" &&
                suggestions.length > 0;

              return (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1 relative">
                    <Input
                      placeholder={
                        loadingStudents
                          ? "Đang tải học sinh..."
                          : "Nhập tên học sinh..."
                      }
                      value={field.keyword}
                      onChange={(e) => setKeyword(index, e.target.value)}
                      onFocus={() => setActiveIndex(index)}
                    />

                    {showSuggest && (
                      <div
                        className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-md overflow-hidden"
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        {suggestions.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                            onClick={() => pickStudent(index, s)}
                          >
                            {s.fullName}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button className="text-red-500"variant="ghost" onClick={() => removeStudentField(index)}>
                    Xóa
                  </Button>
                </div>
              );
            })}

            <div>
              <Button variant="outline" onClick={addStudentField}>
                + Thêm học sinh
              </Button>
            </div>
          </div>
        </FormField>

        {/* Giáo viên */}
        <FormField label="Giáo viên phụ trách" required>
          <Input
            placeholder="VD: Cô Trần Thị Hoa"
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
          />
        </FormField>

        {/* Ngày & loại */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Ngày vi phạm" required>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </FormField>

          <FormField label="Loại vi phạm" required>
            <Input
              placeholder="VD: Đi muộn"
              value={type}
              onChange={(e) => setType(e.target.value)}
            />
          </FormField>
        </div>

        {/* Mức độ (màu giống page) */}
        <FormField label="Mức độ" required>
          <div className="grid grid-cols-3 gap-3">
            {LEVEL_OPTIONS.map((o) => {
              const isActive = level === o.value;

              const activeStyle =
                o.value === 0
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : o.value === 1
                  ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                  : "bg-red-100 text-red-700 border-red-200";

              return (
                <button
                  type="button"
                  key={o.value}
                  onClick={() => setLevel(o.value)}
                  className={`py-2 rounded-lg border text-sm font-medium transition
                    ${
                      isActive
                        ? activeStyle
                        : "bg-white text-gray-600 hover:bg-gray-50 border-gray-200"
                    }`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </FormField>

        {/* Nội dung */}
        <FormField label="Nội dung vi phạm">
          <Textarea
            rows={3}
            placeholder="Mô tả chi tiết..."
            value={info}
            onChange={(e) => setInfo(e.target.value)}
          />
        </FormField>

        {/* Xử lý */}
        <FormField label="Hình thức xử lý">
          <Input
            placeholder="VD: Nhắc nhở / Mời phụ huynh"
            value={penalty}
            onChange={(e) => setPenalty(e.target.value)}
          />
        </FormField>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Đóng
          </Button>

          <Button variant="primary" onClick={handleUpdate} disabled={!canSubmit}>
            {submitting ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
