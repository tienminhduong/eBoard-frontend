"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import Input from "@/components/ui/inputType/Input";
import Textarea from "@/components/ui/inputType/TextArea";
import { violationService } from "@/services/violationService";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  classId: string;
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

export default function AddViolationModal({
  open,
  onClose,
  onCreated,
  classId,
}: Props) {
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  /**
   * Mỗi ô học sinh sẽ có:
   * - studentId (id được chọn)
   * - keyword (text đang gõ trong input)
   */
  const [studentFields, setStudentFields] = useState<
    { studentId: string; keyword: string }[]
  >([{ studentId: "", keyword: "" }]);

  // ô đang focus để hiện dropdown gợi ý đúng ô đó
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const [teacherName, setTeacherName] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [level, setLevel] = useState<number | null>(null);
  const [info, setInfo] = useState("");
  const [penalty, setPenalty] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ===== Load học sinh theo lớp ===== */
  useEffect(() => {
    if (!open) return;
    if (!classId) return;

    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);

        // ✅ endpoint mới: /api/students/{classId}/lists
        const res = await violationService.getStudents(classId);

        setStudents(
          (res.data || []).map((s: any) => ({
            id: s.id,
            fullName: s.fullName,
          }))
        );

        // reset form khi mở modal
        setStudentFields([{ studentId: "", keyword: "" }]);
        setTeacherName("");
        setDate("");
        setType("");
        setLevel(null);
        setInfo("");
        setPenalty("");
      } catch (err) {
        console.error("getStudents error:", err);
        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [classId, open]);

  // list studentId hợp lệ
  const selectedStudentIds = useMemo(() => {
    return studentFields
      .map((x) => x.studentId)
      .filter((id) => id && id.trim() !== "");
  }, [studentFields]);

  const canSubmit =
    !!classId &&
    selectedStudentIds.length > 0 &&
    !!teacherName &&
    !!date &&
    !!type &&
    level !== null &&
    !submitting;

  /* ===== Student field handlers ===== */
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
              studentId: "", // gõ lại thì bỏ chọn cũ
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
              keyword: s.fullName, // input hiển thị tên
            }
          : x
      )
    );

    setActiveIndex(null);
  };

  /* ===== Submit ===== */
  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      setSubmitting(true);

      await violationService.create({
        studentIds: selectedStudentIds,
        classId,
        inChargeTeacherName: teacherName,
        violateDate: date,
        violationType: type,
        violationLevel: level,
        violationInfo: info,
        penalty,
      });

      onCreated?.();
      onClose();
    } catch (err) {
      console.error("create violation error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tạo cảnh báo vi phạm"
      description="Ghi nhận và gửi cảnh báo đến phụ huynh về vi phạm của học sinh trong lớp"
    >
      <div className="space-y-4">
        {/* ===== Học sinh (Autocomplete) ===== */}
        <FormField label="Học sinh vi phạm" required>
          <div className="space-y-3">
            {studentFields.map((field, index) => {
              // không cho trùng học sinh
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
                    {/* Input gõ tên */}
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

                    {/* Dropdown gợi ý */}
                    {showSuggest && (
                      <div
                        className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-md overflow-hidden"
                        onMouseDown={(e) => {
                          // để click gợi ý không bị blur input trước
                          e.preventDefault();
                        }}
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

        {/* Mức độ */}
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
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!canSubmit}>
            {submitting ? "Đang gửi..." : "Gửi cảnh báo"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
