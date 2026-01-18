"use client";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { FormField } from "../ui/FormField";
import Input from "../ui/inputType/Input";
import Textarea from "../ui/inputType/TextArea";
import Select from "../ui/inputType/Select";
import { ExamSchedule, ExamType, Subject } from "@/types/exam";
import { useState, useEffect } from "react";
import { examService } from "@/services/examService";

interface Props {
  open: boolean;
  exam: ExamSchedule;
  onClose: () => void;
}

const SUBJECT_OPTIONS = [
  { value: "Toán", label: "Toán" },
  { value: "Tiếng Việt", label: "Tiếng Việt" },
  { value: "Tiếng Anh", label: "Tiếng Anh" },
  { value: "Khoa học", label: "Khoa học" },
];

const EXAM_TYPE_OPTIONS = [
  { value: "Giữa kỳ", label: "Giữa kỳ" },
  { value: "Cuối kỳ", label: "Cuối kỳ" },
];

export default function ExamDetailModal({ open, exam, onClose }: Props) {
  const [subject, setSubject] = useState<Subject | undefined>(exam.subject);
  const [examType, setExamType] = useState<ExamType | undefined>(exam.type);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (exam) {
      setSubject(exam.subject);
      setExamType(exam.type);
      setDate(exam.date);
      setTime(exam.time);
      setNote(exam.content || "");
    }
  }, [exam]);

  if (!exam) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      await examService.updateExam(exam.id, {
        subject,
        type: examType,
        date,
        time,
        content: note,
      });
      onClose();
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
            options={SUBJECT_OPTIONS}
            value={subject}
            onChange={(value) => setSubject(value as Subject)}
            allowCreate
          />
        </FormField>

        {/* Hình thức */}
        <FormField label="Hình thức thi" required>
          <Select
            options={EXAM_TYPE_OPTIONS}
            value={examType}
            onChange={(value) => setExamType(value as ExamType)}
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

        {/* Ghi chú */}
        <FormField label="Ghi chú">
          <Textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </FormField>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>

          <Button
            variant="primary"
            onClick={handleSave}
            disabled={loading}
          >
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </Modal>
  );
}
