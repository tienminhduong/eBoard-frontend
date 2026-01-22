"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/inputType/Input";
import { X } from "lucide-react";
import { activityService } from "@/services/activityService";
import { ExtracurricularActivity } from "@/types/activity";

interface Props {
  open: boolean;
  activityId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditActivityModal({
  open,
  activityId,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    location: "",
    maxParticipants: "",
    inChargeTeacher: "",
    startTime: "",
    endTime: "",
    assignDeadline: "",
    cost: "",
    description: "",
  });

  /* ===== LOAD DATA ===== */
  useEffect(() => {
    if (!open || !activityId) return;

    activityService.getActivityById(activityId).then(
      (a: ExtracurricularActivity) => {
        setForm({
          name: a.name,
          location: a.location,
          maxParticipants: String(a.maxParticipants),
          inChargeTeacher: a.inChargeTeacher,
          startTime: a.startTime.slice(0, 16),
          endTime: a.endTime.slice(0, 16),
          assignDeadline: a.assignDeadline.slice(0, 16),
          cost: String(a.cost),
          description: a.description,
        });
      }
    );
  }, [open, activityId]);

  if (!open || !activityId) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await activityService.updateActivity(activityId, {
        name: form.name,
        location: form.location,
        maxParticipants: Number(form.maxParticipants),
        inChargeTeacher: form.inChargeTeacher,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        assignDeadline: new Date(form.assignDeadline).toISOString(),
        cost: Number(form.cost),
        description: form.description,
      });

      onSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-[600px] max-h-[85vh] rounded-2xl shadow-lg overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-[#F6B85C] text-white">
          <h2 className="font-semibold text-lg">
            Chỉnh sửa hoạt động ngoại khóa
          </h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="text-sm font-medium">
              Tên hoạt động <span className="text-red-500">*</span>
            </label>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Địa điểm <span className="text-red-500">*</span>
            </label>
            <Input
              name="location"
              value={form.location}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">
                Số lượng tối đa <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                name="maxParticipants"
                value={form.maxParticipants}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Người phụ trách <span className="text-red-500">*</span>
              </label>
              <Input
                name="inChargeTeacher"
                value={form.inChargeTeacher}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="datetime-local"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
            />
            <Input
              type="datetime-local"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              name="cost"
              value={form.cost}
              onChange={handleChange}
            />
            <Input
              type="datetime-local"
              name="assignDeadline"
              value={form.assignDeadline}
              onChange={handleChange}
            />
          </div>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full rounded-xl border px-3 py-2 text-sm min-h-[100px]
                       focus:outline-none focus:ring-2 focus:ring-[#518581]/40"
          />
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
