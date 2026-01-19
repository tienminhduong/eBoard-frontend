"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import Select, { Option } from "@/components/ui/inputType/Select";
import Input from "@/components/ui/inputType/Input";
import Textarea from "@/components/ui/inputType/TextArea";
import { TimetableItem } from "@/types/timetable";
import { timetableService } from "@/services/timetableService";
import { subjectService } from "@/services/subjectService";

interface Props {
  open: boolean;
  item: TimetableItem | null;
  classId: string;
  onClose: () => void;
  onUpdated?: () => void;
}

const DAY_OPTIONS = [
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
];

const PERIOD_OPTIONS = [
  { value: 1, label: "Tiết 1" },
  { value: 2, label: "Tiết 2" },
  { value: 3, label: "Tiết 3" },
  { value: 4, label: "Tiết 4" },
  { value: 5, label: "Tiết 5" },
];

const SESSION_OPTIONS = [
  { value: true, label: "Buổi sáng" },
  { value: false, label: "Buổi chiều" },
];

export default function TimetableDetailModal({
  open,
  item,
  classId,
  onClose,
  onUpdated,
}: Props) {
  const [subject, setSubject] = useState("");
  const [teacher, setTeacher] = useState("");
  const [note, setNote] = useState("");
  const [day, setDay] = useState<number>();
  const [period, setPeriod] = useState<number>();
  const [isMorning, setIsMorning] = useState<boolean>();
  const [loading, setLoading] = useState(false);

  const [subjectOptions, setSubjectOptions] = useState<Option<string>[]>([]);

  // load item
  useEffect(() => {
    if (!item) return;

    setSubject(item.subject);
    setTeacher(item.teacher);
    setNote(item.content || "");
    setDay(item.day);
    setPeriod(item.period);
    setIsMorning(item.isMorning);
  }, [item]);

  // load subject
  useEffect(() => {
    if (!open) return;

    subjectService
      .getByClass(classId)
      .then((res) =>
        setSubjectOptions(
          res.data.map((s) => ({
            value: s.name,
            label: s.name,
          }))
        )
      )
      .catch(console.error);
  }, [open, classId]);

  if (!item) return null;

  const handleSave = async () => {
    if (
      !subject ||
      !teacher ||
      day === undefined ||
      period === undefined ||
      isMorning === undefined
    )
      return;

    setLoading(true);
    try {
      await timetableService.update(item.id, {
        subject,
        teacher,
        note,
        day,
        period,
        isMorning,
      });

      onUpdated?.();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Chi tiết tiết học"
      description="Chỉnh sửa thông tin tiết học"
    >
      <div className="space-y-4">
        {/* Thời gian */}
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Thứ" required>
            <Select
              options={DAY_OPTIONS}
              value={day}
              onChange={setDay}
            />
          </FormField>

          <FormField label="Buổi học" required>
            <Select
              options={SESSION_OPTIONS}
              value={isMorning}
              onChange={setIsMorning}
            />
          </FormField>

          <FormField label="Tiết học" required>
            <Select
              options={PERIOD_OPTIONS}
              value={period}
              onChange={setPeriod}
            />
          </FormField>
        </div>

        {/* Môn học */}
        <FormField label="Môn học" required>
          <Select
            options={subjectOptions}
            value={subject}
            onChange={setSubject}
            allowCreate
            onCreate={(label) => {
              const value = label.trim();
              if (!value) return;
              setSubject(value);
            }}
          />
        </FormField>

        {/* Giáo viên */}
        <FormField label="Giáo viên">
          <Input
            placeholder="Nhập tên giáo viên"
            value={teacher}
            onChange={(e) => setTeacher(e.target.value)}
          />
        </FormField>

        {/* Ghi chú */}
        <FormField label="Ghi chú">
          <Textarea
            rows={3}
            placeholder="Nhập ghi chú (nếu có)"
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
