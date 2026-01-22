"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { fundService } from "@/services/fundService";
import { FundExpense } from "@/types/fund";

interface Props {
  open: boolean;
  expenseId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditFundExpenseModal({
  open,
  expenseId,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FundExpense | null>(null);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState(0);
  const [spenderName, setSpenderName] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [notes, setNotes] = useState("");

  /* ===== LOAD DATA ===== */
  useEffect(() => {
    if (!open || !expenseId) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await fundService.getExpenseById(expenseId);
        setData(res);

        setTitle(res.title);
        setAmount(res.amount);
        setSpenderName(res.spenderName);
        setExpenseDate(res.expenseDate);
        setNotes(res.notes ?? "");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, expenseId]);

  /* ===== SAVE ===== */
  const handleSave = async () => {
    if (!expenseId) return;

    await fundService.updateExpense(expenseId, {
      title,
      amount,
      spenderName,
      expenseDate,
      notes: notes.trim() || undefined,
    });

    onSuccess?.();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Chỉnh sửa khoản chi">
      {loading || !data ? (
        <div className="py-8 text-center text-gray-500">
          Đang tải dữ liệu...
        </div>
      ) : (
        <>
          {/* ===== INFO ===== */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Info label="Mã khoản chi" value={data.id} />
            <Info label="Ngày tạo" value={data.expenseDate} />
          </div>

          {/* ===== FORM ===== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nội dung chi">
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="input w-full"
              />
            </Field>

            <Field label="Số tiền">
              <input
                type="number"
                min={0}
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="input w-full"
              />
            </Field>

            <Field label="Người chi">
              <input
                value={spenderName}
                onChange={e => setSpenderName(e.target.value)}
                className="input w-full"
              />
            </Field>

            <Field label="Ngày chi">
              <input
                type="date"
                value={expenseDate}
                onChange={e => setExpenseDate(e.target.value)}
                className="input w-full"
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="Ghi chú">
                <textarea
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="input w-full resize-none"
                />
              </Field>
            </div>
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
