"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface Props {
  open: boolean;
  onClose: () => void;
  item: {
    id: string;
    content: string;        // Nội dung đóng
    amount: number;
    contributedAt: string;
    notes?: string;
  };
  onSubmit: (payload: {
    id: string;
    contributedAmount: number;
    contributedAt: string;
    notes?: string;
  }) => void;

}

export default function EditFundIncomeHistoryModal({
  open,
  onClose,
  item,
  onSubmit,
}: Props) {
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  /* ===== LOAD DATA (GIỐNG SCORE MODAL) ===== */
  useEffect(() => {
    if (!open || !item) return;

    setAmount(item.amount);
    setDate(item.contributedAt);
    setNotes(item.notes ?? "");
  }, [open, item]);

  const handleSave = () => {
    onSubmit({
      id: item.id,
      contributedAmount: amount,      // ✅ map đúng BE
      contributedAt: date,             // yyyy-MM-dd OK
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Chỉnh sửa đóng tiền">
      {/* ===== INFO BAR ===== */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Info label="Nội dung đóng" value={item.content} />
        <Info label="Mã bản ghi" value={item.id} />
      </div>

      {/* ===== EDIT FORM ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* AMOUNT */}
        <div>
          <label className="text-sm text-gray-500">Số tiền</label>
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>

        {/* DATE */}
        <div>
          <label className="text-sm text-gray-500">Ngày đóng</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>

        {/* NOTES */}
        <div className="md:col-span-3">
          <label className="text-sm text-gray-500">Ghi chú</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm resize-none"
          />
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <div className="flex justify-end gap-2 mt-6">
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="primary" onClick={handleSave}>
          Lưu thay đổi
        </Button>
      </div>
    </Modal>
  );
}

/* ===== INFO COMPONENT (COPY TỪ SCORE MODAL STYLE) ===== */
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
