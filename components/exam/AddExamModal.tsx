"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import Input from "../ui/inputType/Input";
import Textarea from "../ui/inputType/TextArea";
import Select, { Option } from "../ui/inputType/Select";
import { subjectService } from "@/services/subjectService";
import { examService } from "@/services/examService";

interface Props {
  open: boolean;
  onClose: () => void;
  classId: string;
  defaultDate?: string;
  onCreated?: () => void;
}

const EXAM_TYPE_OPTIONS: Option<string>[] = [
  { value: "Giữa kỳ", label: "Giữa kỳ" },
  { value: "Cuối kỳ", label: "Cuối kỳ" },
];

export default function AddExamModal({
  open,
  onClose,
  classId,
  defaultDate,
  onCreated,
}: Props) {
  const [subjectId, setSubjectId] = useState<string>("");
  const [examFormat, setExamFormat] = useState<string>("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const [subjectOptions, setSubjectOptions] = useState<Option<string>[]>([]);

  const resetForm = () => {
    setSubjectId("");
    setExamFormat("");
    setDate("");
    setTime("");
    setLocation("");
    setNotes("");
  };

  /* =======================
     Load môn học theo lớp
     ======================= */
  useEffect(() => {
    if (!classId) return;

    subjectService
      .getByClass(classId)
      .then((res) => {
        const options = res.data.map((s: any) => ({
          value: s.id,   // dùng subjectId
          label: s.name,
        }));
        setSubjectOptions(options);
      })
      .catch(console.error);
  }, [classId]);

  /* =======================
     Prefill ngày
     ======================= */
  useEffect(() => {
    if (open) {
      resetForm();
    }
    if (defaultDate) {
      setDate(defaultDate);
    } else {
      setDate("");
    }
  }, [defaultDate, open]);

  /* =======================
     Submit
     ======================= */
  const handleSubmit = async () => {
    if (!subjectId || !examFormat || !date || !time) return;

    const startTime = `${date}T${time}:00Z`; // ví dụ: 2024-06-17T08:30:00Z

    try {
      await examService.create({
        classId,
        subjectId,
        examFormat,  // "Giữa kỳ" | "Cuối kỳ"
        location,
        startTime,
        notes,
      });

      alert("Thêm lịch thi thành công");
      onCreated?.();
      onClose();
    } catch (err: any) {
      alert(err.message || "Thêm lịch thi thất bại");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Thêm lịch thi mới"
      description="Điền thông tin chi tiết về bài thi"
    >
      <div className="space-y-4">
        {/* Môn học */}
        <FormField label="Môn học" required>
          <Select
            options={subjectOptions}
            placeholder="Chọn môn học"
            value={subjectId}
            onChange={setSubjectId}
            onCreate={(label) => {
              const value = label.trim();
              if (!value) return;
              setSubjectId(value);
            }}
            allowCreate
          />
        </FormField>

        {/* Hình thức thi */}
        <FormField label="Hình thức thi" required>
          <Select
            options={EXAM_TYPE_OPTIONS}
            placeholder="Chọn hình thức thi"
            value={examFormat}
            onChange={setExamFormat}
          />
        </FormField>

        {/* Ngày & giờ */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Ngày thi" required>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </FormField>

          <FormField label="Giờ thi" required>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
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
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!subjectId || !examFormat || !date || !time}
          >
            Thêm lịch thi
          </Button>
        </div>
      </div>
    </Modal>
  );
}
