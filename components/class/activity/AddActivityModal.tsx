"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/inputType/Input";
import { X } from "lucide-react";
import { activityService } from "@/services/activityService";

interface Props {
  open: boolean;
  onClose: () => void;
  classId: string;
  onSuccess: () => void;
}

export default function AddActivityModal({
  open,
  onClose,
  classId,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    location: "",
    minParticipants: "",
    maxParticipants: "",
    inChargeTeacher: "",
    startTime: "",
    endTime: "",
    assignDeadline: "",
    cost: "",
    description: "",
  });

  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await activityService.createActivity({
        classId,
        name: form.name,
        location: form.location,
        // minParticipants: Number(form.minParticipants),
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
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-lg">
            Tạo hoạt động ngoại khóa mới
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
              placeholder="Nhập tên hoạt động"
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
              placeholder="Nhập địa điểm tổ chức"
              value={form.location}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">
                Số lượng tối thiểu <span className="text-red-500">*</span>
              </label>
              <Input
                name="minParticipants"
                placeholder="Số học sinh tối thiểu"
                value={form.minParticipants}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Số lượng tối thiểu <span className="text-red-500">*</span>
              </label>
              <Input
                name="maxParticipants"
                placeholder="Số học sinh tối đa"
                value={form.maxParticipants}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Người quản lý hoạt động <span className="text-red-500">*</span>
              </label>
              <Input
                name="inChargeTeacher"
                placeholder="Người quản lý hoạt động"
                value={form.inChargeTeacher}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">
                Thời gian bắt đầu <span className="text-red-500">*</span>
              </label>
              <Input
                type="datetime-local"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Thời gian kết thúc <span className="text-red-500">*</span>
              </label>
              <Input
                type="datetime-local"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">
                Chi phí <span className="text-red-500">*</span>
              </label>
              <Input
                name="cost"
                placeholder="Chi phí cần đóng cho mỗi học sinh"
                value={form.cost}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Hạn đăng ký <span className="text-red-500">*</span>
              </label>
              <Input
                type="datetime-local"
                name="assignDeadline"
                value={form.assignDeadline}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">
              Mô tả hoạt động <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Thông tin chi tiết hoạt động ngoại khóa"
              className="w-full rounded-xl border px-3 py-2 text-sm min-h-[100px]
                         focus:outline-none focus:ring-2 focus:ring-[#518581]/40"
            />
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
            Tạo hoạt động
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
