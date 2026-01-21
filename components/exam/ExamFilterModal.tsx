"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "../ui/Button";
import { subjectService } from "@/services/subjectService";

interface Props {
  open: boolean;
  onClose: () => void;
  filter: any;
  setFilter: (val: any) => void;
  classId: string;
}

type SubjectOption = {
  id: string;
  name: string;
};

export default function ExamFilterModal({
  open,
  onClose,
  filter,
  setFilter,
  classId,
}: Props) {
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);

  /* =======================
     Load subject từ API
     ======================= */
  useEffect(() => {
    if (!open) return;

    subjectService
      .getByClass(classId)
      .then((res) => setSubjects(res.data))
      .catch(console.error);
  }, [open, classId]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Bộ lọc lịch thi"
      width="max-w-md"
    >
      <div className="space-y-5">
        {/* ===== Môn học ===== */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Môn học
          </label>
          <select
            className="w-full border rounded-lg p-2"
            value={filter.subjectId || ""}
            onChange={(e) =>
              setFilter((f: any) => ({
                ...f,
                subjectId: e.target.value || undefined,
              }))
            }
          >
            <option value="">Tất cả môn</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* ===== Hình thức thi ===== */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Hình thức thi
          </label>
          <select
            className="w-full border rounded-lg p-2"
            value={filter.type || ""}
            onChange={(e) =>
              setFilter((f: any) => ({
                ...f,
                type: e.target.value || undefined,
              }))
            }
          >
            <option value="">Tất cả hình thức</option>
            <option value="Giữa kỳ">Giữa kỳ</option>
            <option value="Cuối kỳ">Cuối kỳ</option>
          </select>
        </div>

        {/* ===== Thời gian ===== */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Thời gian
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              className="border rounded-lg p-2 w-full"
              value={filter.fromDate || ""}
              onChange={(e) =>
                setFilter((f: any) => ({
                  ...f,
                  fromDate: e.target.value || undefined,
                }))
              }
            />
            <input
              type="date"
              className="border rounded-lg p-2 w-full"
              value={filter.toDate || ""}
              onChange={(e) =>
                setFilter((f: any) => ({
                  ...f,
                  toDate: e.target.value || undefined,
                }))
              }
            />
          </div>
        </div>

        {/* ===== Actions ===== */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="ghost"
            onClick={() => {
              setFilter({});
              onClose();
            }}
          >
            Xóa lọc
          </Button>
          <Button variant="primary" onClick={onClose}>
            Áp dụng
          </Button>
        </div>
      </div>
    </Modal>
  );
}
