"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { fundService } from "@/services/fundService";
import { FundIncome } from "@/types/fund";

interface Props {
  open: boolean;
  fundIncomeId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditFundIncomeModal({
  open,
  fundIncomeId,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FundIncome | null>(null);

  const [title, setTitle] = useState("");
  const [amountPerStudent, setAmountPerStudent] = useState(0);
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");

  /* ===== LOAD DATA ===== */
  useEffect(() => {
    if (!open || !fundIncomeId) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await fundService.getIncomeById(fundIncomeId);
        setData(res);
        setTitle(res.title);
        setEndDate(res.endDate);
        setDescription(res.description ?? "");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, fundIncomeId]);

  /* ===== SAVE ===== */
  const handleSave = async () => {
    if (!fundIncomeId) return;

    await fundService.updateIncome(fundIncomeId, {
      title,
      amountPerStudent,
      endDate,
      description: description.trim() || undefined,
    });

    onSuccess?.();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Chỉnh sửa khoản thu">
      {loading || !data ? (
        <div className="py-8 text-center text-gray-500">
          Đang tải dữ liệu...
        </div>
      ) : (
        <>
          {/* ===== INFO ===== */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Info label="Mã khoản thu" value={data.id} />
            <Info label="Trạng thái" value={data.status} />
          </div>

          {/* ===== FORM ===== */}
          <div className="space-y-4">
            <Field label="Nội dung thu">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input w-full"
              />
            </Field>

            <Field label="Số tiền / học sinh">
              <input
                type="number"
                min={0}
                value={amountPerStudent}
                onChange={(e) => setAmountPerStudent(Number(e.target.value))}
                className="input w-full"
              />
            </Field>

            <Field label="Hạn đóng">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input w-full"
              />
            </Field>

            <Field label="Mô tả">
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input w-full resize-none"
              />
            </Field>
          </div>

          {/* ===== FOOTER ===== */}
          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={onClose}>Hủy</Button>
            <Button variant="primary" onClick={handleSave}>
              Lưu thay đổi
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}

/* ===== SMALL COMPONENTS ===== */
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <input
        disabled
        value={value}
        className="w-full rounded-xl border px-3 py-2 text-sm bg-gray-50"
      />
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm text-gray-500">{label}</label>
      {children}
    </div>
  );
}
