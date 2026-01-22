"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/inputType/Input";
import { X } from "lucide-react";
import { ActivityParticipant } from "@/types/activity";
import { activityService } from "@/services/activityService";

interface Props {
  open: boolean;
  participant: ActivityParticipant | null;
  onEdit: (participant: ActivityParticipant) => void;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditParticipantModal({
  open,
  participant,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    studentName: "",
    parentPhoneNumber: "",
    teacherComments: "",
    notes: "",
  });

  useEffect(() => {
    if (participant) {
      setForm({
        studentName: participant.studentName,
        parentPhoneNumber: participant.parentPhoneNumber,
        teacherComments: participant.teacherComments,
        notes: participant.notes,
      });
    }
  }, [participant]);

  if (!open || !participant) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
        setLoading(true);

        await activityService.updateParticipant(participant.id, {
        parentPhoneNumber: form.parentPhoneNumber, // ✅ luôn có
        teacherComments: form.teacherComments || "",
        notes: form.notes || "",
        });

        onSuccess();
        onClose();
    } finally {
        setLoading(false);
    }
};


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-[600px] rounded-2xl shadow-lg overflow-hidden">
        {/* HEADER */}
        <div className="bg-[#6F6CF2] text-white px-6 py-4 flex justify-between items-center">
          <h2 className="font-semibold text-lg">
            Chỉnh sửa thông tin học sinh
          </h2>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <Input value={form.studentName} disabled />
            </div>

            <div>
              <label className="text-sm font-medium">
                SĐT phụ huynh <span className="text-red-500">*</span>
              </label>
              <Input
                name="parentPhoneNumber"
                value={form.parentPhoneNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nhận xét</label>
              <Input
                name="teacherComments"
                value={form.teacherComments}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Ghi chú</label>
              <Input
                name="notes"
                value={form.notes}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t flex gap-3">
          <Button
            variant="primary"
            className="flex-1 flex justify-center"
            onClick={handleSubmit}
            disabled={loading}
          >
            Lưu thay đổi
          </Button>

          <Button
            variant="outline"
            className="flex-1 flex justify-center"
            onClick={onClose}
          >
            Hủy
          </Button>
        </div>
      </div>
    </div>
  );
}
