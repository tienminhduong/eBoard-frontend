"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import Select from "@/components/ui/inputType/Select";
import Textarea from "@/components/ui/inputType/TextArea";
import { timetableService } from "@/services/timetableService";
import Input from "../ui/inputType/Input";
import { Option } from "@/components/ui/inputType/Select";
import { subjectService } from "@/services/subjectService";

interface Props {
  open: boolean;
  onClose: () => void;
  classId: string;
  prefill?: {
    day?: number;
    period?: number;
    isMorning?: boolean;
  };
  onCreated?: () => void;
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

export default function AddTimetableModal({ open, onClose, classId, prefill, onCreated }: Props) {
  const [subject, setSubject] = useState("");
  const [teacher, setTeacher] = useState("");
  const [note, setNote] = useState("");
  const [day, setDay] = useState<number | undefined>(prefill?.day);
  const [period, setPeriod] = useState<number | undefined>(prefill?.period);
  const [isMorning, setIsMorning] = useState<boolean | undefined>(prefill?.isMorning);

  const [subjectOptions, setSubjectOptions] = useState<Option<string>[]>([]);

  const isTimeLocked = !!prefill;

  const resetForm = () => {
    setSubject("");
    setTeacher("");
    setNote("");
    setDay(prefill?.day);
    setPeriod(prefill?.period);
    setIsMorning(prefill?.isMorning);
  };

  useEffect(() => {
    if (open) {
      resetForm();
    }
    if (prefill) { 
      setDay(prefill.day); 
      setPeriod(prefill.period); 
      setIsMorning(prefill.isMorning); 
    }
  }, [open]);

  // Lấy môn theo classId
  useEffect(() => {
    subjectService
      .getByClass(classId)
      .then((res) => {
        const options = res.data.map((s) => ({
          value: s.name, // hoặc s.id nếu backend nhận id
          label: s.name,
        }));
        setSubjectOptions(options);
      })
      .catch(console.error);
  }, [classId]);

  // Tạo mới tiết học
  const handleSubmit = async () => {
    if (
      !subject ||
      day === undefined ||
      period === undefined ||
      isMorning === undefined
    ) {
      return;
    }

    try {
      await timetableService.create({
        subject,
        day,
        period,
        isMorning,
        teacher,
        note,
        classId,
      });

      onCreated?.();
      onClose();
    } catch (err) {
      console.error("Create timetable failed", err);
    }
  };
  
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Thêm tiết học"
      description="Thêm tiết học mới vào thời khóa biểu"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {/* THỨ */}
          <FormField label="Thứ" required>
            {isTimeLocked ? (
              <Input value={`Thứ ${day! + 1}`} disabled />
            ) : (
              <Select
                options={DAY_OPTIONS}
                placeholder="Chọn thứ"
                value={day}
                onChange={(v) => setDay(v)}
              />
            )}
          </FormField>

          {/* BUỔI */}
          <FormField label="Buổi học" required>
            {isTimeLocked ? (
              <Input value={isMorning ? "Buổi sáng" : "Buổi chiều"} disabled />
            ) : (
              <Select
                options={SESSION_OPTIONS}
                placeholder="Chọn buổi"
                value={isMorning}
                onChange={(v) => setIsMorning(v)}
              />
            )}
          </FormField>

          {/* TIẾT */}
          <FormField label="Tiết học" required>
            {isTimeLocked ? (
              <Input value={`Tiết ${period}`} disabled />
            ) : (
              <Select
                options={PERIOD_OPTIONS}
                placeholder="Chọn tiết"
                value={period}
                onChange={(v) => setPeriod(v)}
              />
            )}
          </FormField>
        </div>

        {/* Môn học */}
        <FormField label="Môn học" required>
          <Select
            options={subjectOptions}
            placeholder="Chọn môn học"
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
            onClick={handleSubmit}
            disabled={ !subject || day === undefined || period === undefined || isMorning === undefined }
          >
            Thêm tiết học
          </Button>
        </div>
      </div>
    </Modal>
  );
}
