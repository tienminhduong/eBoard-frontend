"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { FormField } from "../ui/FormField";
import Input from "../ui/inputType/Input";
import Textarea from "../ui/inputType/TextArea";
import Select, { Option } from "../ui/inputType/Select";
import { ExamSchedule, ExamType } from "@/types/exam";
import { examService } from "@/services/examService";
import { subjectService } from "@/services/subjectService";

interface Props {
  open: boolean;
  exam: ExamSchedule;
  classId: string;
  onClose: () => void;
  onUpdated?: () => void;
}

const EXAM_TYPE_OPTIONS: Option<string>[] = [
  { value: "Giữa kỳ", label: "Giữa kỳ" },
  { value: "Cuối kỳ", label: "Cuối kỳ" },
];

export default function ExamDetailModal({
  open,
  exam,
  classId,
  onClose,
  onUpdated,
}: Props) {
  const [subjectId, setSubjectId] = useState<string>("");
  const [examFormat, setExamFormat] = useState<ExamType | "">("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const [subjectOptions, setSubjectOptions] = useState<Option<string>[]>([]);

  /* =======================
     Load subject theo lớp
     ======================= */
  useEffect(() => {
    if (!open || !classId) return;

    subjectService
      .getByClass(classId)
      .then((res) => {
        setSubjectOptions(
          res.data.map((s: any) => ({
            value: s.id,
            label: s.name,
          }))
        );
      })
      .catch(console.error);
  }, [open, classId]);

  /* =======================
     Load exam data
     ======================= */
  useEffect(() => {
    if (!exam) return;

    setSubjectId(exam.subjectId);
    setExamFormat(exam.type as ExamType);
    setDate(exam.date);
    setTime(exam.time);
    setLocation(exam.location || "");
    setNotes(exam.notes || "");
  }, [exam]);

  if (!exam) return null;

  /* =======================
     Submit update
     ======================= */
  const handleSave = async () => {
    if (!subjectId || !examFormat || !date || !time) return;

    setLoading(true);
    try {
      const startTime = `${date}T${time}:00Z`;

      await examService.updateExam(exam.id, {
        subjectId,
        examFormat,
        location,
        startTime,
        notes,
      });

      onUpdated?.();
      onClose();
      alert("Cập nhật lịch thi thành công");
    } catch (err: any) {
      alert(err.message || "Cập nhật lịch thi thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Chi tiết lịch thi"
      description="Xem và cập nhật thông tin bài thi"
    >
      <div className="space-y-4">
        {/* Môn học */}
        <FormField label="Môn học" required>
          <Select
            options={subjectOptions}
            value={
              subjectOptions.find((o) => o.value === subjectId)
                ? subjectId
                : ""
            }
            onChange={(v) => setSubjectId(v as string)}
            placeholder="Chọn môn học"
            allowCreate
          />
        </FormField>

        {/* Hình thức thi */}
        <FormField label="Hình thức thi" required>
          <Select
            options={EXAM_TYPE_OPTIONS}
            value={examFormat}
            onChange={(v) => setExamFormat(v as ExamType)}
            placeholder="Chọn hình thức thi"
          />
        </FormField>

        {/* Ngày & giờ */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Ngày thi" required>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </FormField>

          <FormField label="Giờ thi" required>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </FormField>
        </div>

        {/* Địa điểm */}
        <FormField label="Địa điểm">
          <Input
            placeholder="Phòng / địa điểm thi"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </FormField>

        {/* Ghi chú */}
        <FormField label="Ghi chú">
          <Textarea
            rows={3}
            placeholder="Nhập ghi chú..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </FormField>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </Modal>
  );
}
