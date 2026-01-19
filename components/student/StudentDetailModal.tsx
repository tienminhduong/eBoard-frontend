"use client";

import React, { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import type { StudentRow } from "@/types/student";

const PRIMARY = "#518581";

type Props = {
  open: boolean;
  student: StudentRow | null;
  onClose: () => void;
  onSave: (updated: StudentRow) => void;
};

function isoToVN(iso?: string) {
  if (!iso) return "-";
  // yyyy-mm-dd -> dd/mm/yyyy
  const [y, m, d] = String(iso).split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function isISODate(v: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(v);
}

const GENDER_OPTIONS = [
  { value: "Nam", label: "Nam" },
  { value: "Nữ", label: "Nữ" },
  { value: "Khác", label: "Khác" },
];

export default function StudentDetailModal({ open, student, onClose, onSave }: Props) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState<StudentRow | null>(null);

  useEffect(() => {
    setEdit(false);
    setForm(student ? { ...student } : null);
  }, [student, open]);

  const canSave = useMemo(() => {
    if (!form) return false;

    const nameOk = !!form.fullName?.trim();
    const dobOk = !!form.dob && isISODate(form.dob);
    const genderOk = !!form.gender?.trim();
    const relOk = !!form.relationshipWithParent?.trim();

    const addrOk = !!form.address?.trim();
    const pOk = !!form.province?.trim();
    const dOk = !!form.district?.trim();
    const wOk = !!form.ward?.trim();

    return nameOk && dobOk && genderOk && relOk && addrOk && pOk && dOk && wOk;
  }, [form]);

  if (!open || !student || !form) return null;

  function setField<K extends keyof StudentRow>(key: K, value: StudentRow[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* header */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: PRIMARY }}>
          <div className="text-white font-semibold">Thông tin chi tiết</div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-md hover:bg-white/10 flex items-center justify-center text-white"
            title="Đóng"
          >
            <XIcon />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Section: Student */}
          <Section icon={<UserIcon />} iconBg="bg-emerald-50 text-emerald-700" title="Thông tin học sinh">
            <TwoCol
              label1="Họ và tên"
              value1={
                edit ? (
                  <Input value={form.fullName} onChange={(v) => setField("fullName", v)} />
                ) : (
                  <TextValue value={student.fullName} />
                )
              }
              label2="Ngày sinh"
              value2={
                edit ? (
                  <Input type="date" value={form.dob || ""} onChange={(v) => setField("dob", v)} />
                ) : (
                  <TextValue value={isoToVN(student.dob)} />
                )
              }
            />

            <TwoCol
              label1="Giới tính"
              value1={
                edit ? (
                  <Select
                    value={form.gender || ""}
                    onChange={(v) => setField("gender", v)}
                    options={GENDER_OPTIONS}
                    placeholder="Chọn giới tính"
                  />
                ) : (
                  <TextValue value={student.gender || "-"} badge />
                )
              }
              label2="Quan hệ với PH"
              value2={
                edit ? (
                  <Input
                    value={form.relationshipWithParent || ""}
                    onChange={(v) => setField("relationshipWithParent", v)}
                    placeholder="VD: Mẹ / Ba / Ông / Bà..."
                  />
                ) : (
                  <TextValue value={student.relationshipWithParent || "-"} badge />
                )
              }
            />

            <OneCol
              label="Địa chỉ (Số nhà, đường)"
              value={
                edit ? (
                  <Input value={form.address || ""} onChange={(v) => setField("address", v)} />
                ) : (
                  <TextValue value={student.address || "-"} />
                )
              }
            />

            <ThreeCol
              label1="Tỉnh/TP"
              value1={
                edit ? (
                  <Input value={form.province || ""} onChange={(v) => setField("province", v)} placeholder="VD: TP.HCM" />
                ) : (
                  <TextValue value={student.province || "-"} />
                )
              }
              label2="Quận/Huyện"
              value2={
                edit ? (
                  <Input value={form.district || ""} onChange={(v) => setField("district", v)} placeholder="VD: Quận 3" />
                ) : (
                  <TextValue value={student.district || "-"} />
                )
              }
              label3="Phường/Xã"
              value3={
                edit ? (
                  <Input value={form.ward || ""} onChange={(v) => setField("ward", v)} placeholder="VD: Phường 1" />
                ) : (
                  <TextValue value={student.ward || "-"} />
                )
              }
            />
          </Section>

          {/* Section: Parent (read-only) */}
          <Section icon={<ParentIcon />} iconBg="bg-amber-50 text-amber-700" title="Thông tin phụ huynh (chỉ xem)">
            <TwoCol
              label1="Họ và tên"
              value1={<TextValue value={student.parentName || "-"} />}
              label2="Số điện thoại"
              value2={<TextValue value={student.phone || "-"} badge />}
            />

            <OneCol label="Email" value={<TextValue value={student.email || "-"} />} />
          </Section>

          {/* actions */}
          <div className="pt-2 flex gap-3">
            {!edit ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-12 rounded-xl text-white font-medium shadow-sm"
                  style={{ backgroundColor: PRIMARY }}
                >
                  Đóng
                </button>

                <button
                  type="button"
                  onClick={() => setEdit(true)}
                  className="h-12 px-5 rounded-xl border border-gray-200 text-gray-800 hover:bg-gray-50"
                >
                  Chỉnh sửa
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setEdit(false);
                    setForm({ ...student });
                  }}
                  className="flex-1 h-12 rounded-xl border border-gray-200 text-gray-800 hover:bg-gray-50"
                >
                  Hủy
                </button>

                <button
                  type="button"
                  disabled={!canSave}
                  onClick={() => {
                    if (!form) return;
                    onSave(form);
                    setEdit(false);
                    onClose();
                  }}
                  className={clsx(
                    "flex-1 h-12 rounded-xl text-white font-medium shadow-sm",
                    !canSave && "opacity-60 cursor-not-allowed"
                  )}
                  style={{ backgroundColor: PRIMARY }}
                  title={!canSave ? "Vui lòng nhập đủ thông tin bắt buộc" : "Lưu"}
                >
                  Lưu thay đổi
                </button>
              </>
            )}
          </div>

          {edit && !canSave ? (
            <div className="text-xs text-gray-500">
              Bắt buộc: Họ tên, Ngày sinh (yyyy-mm-dd), Giới tính, Quan hệ với PH, Địa chỉ, Tỉnh/TP, Quận/Huyện, Phường/Xã.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ---------- UI helpers ---------- */

function Section({
  icon,
  iconBg,
  title,
  children,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div className={clsx("w-8 h-8 rounded-xl flex items-center justify-center", iconBg)}>{icon}</div>
        <div className="font-semibold text-gray-900">{title}</div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function TwoCol({
  label1,
  value1,
  label2,
  value2,
}: {
  label1: string;
  value1: React.ReactNode;
  label2: string;
  value2: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label={label1}>{value1}</Field>
      <Field label={label2}>{value2}</Field>
    </div>
  );
}

function ThreeCol({
  label1,
  value1,
  label2,
  value2,
  label3,
  value3,
}: {
  label1: string;
  value1: React.ReactNode;
  label2: string;
  value2: React.ReactNode;
  label3: string;
  value3: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Field label={label1}>{value1}</Field>
      <Field label={label2}>{value2}</Field>
      <Field label={label3}>{value3}</Field>
    </div>
  );
}

function OneCol({ label, value }: { label: string; value: React.ReactNode }) {
  return <Field label={label}>{value}</Field>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      {children}
    </div>
  );
}

function TextValue({ value, badge }: { value: string; badge?: boolean }) {
  if (badge) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">
        {value || "-"}
      </span>
    );
  }
  return <div className="text-sm text-gray-800">{value || "-"}</div>;
}

function Input({
  value,
  onChange,
  placeholder,
  error,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  type?: string;
}) {
  return (
    <div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={clsx(
          "w-full h-10 rounded-lg border px-3 outline-none focus:ring-2",
          error ? "border-red-300" : "border-gray-200"
        )}
        style={{ ["--tw-ring-color" as any]: `${PRIMARY}33` }}
      />
      {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-10 rounded-lg border border-gray-200 px-3 outline-none focus:ring-2"
      style={{ ["--tw-ring-color" as any]: `${PRIMARY}33` }}
    >
      <option value="">{placeholder || "Chọn"}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/* icons */
function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5Z" stroke="currentColor" strokeWidth="2" />
      <path d="M4 22c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function ParentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M16 11a4 4 0 1 0-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 22c0-4 4-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
