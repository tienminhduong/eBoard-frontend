"use client";

import React, { useEffect, useMemo, useState } from "react";
import clsx from "clsx";

import type { StudentRow } from "@/types/Student";
import type { ProvinceDto, WardDto } from "@/types/address";
import type { UpdateParentInfoRequest } from "@/types/parent";

import { addressService } from "@/services/addressService";
import { parentService } from "@/services/parentService";

const PRIMARY = "#518581";

type Props = {
  open: boolean;
  student: StudentRow | null;
  onClose: () => void;
  onSave: (updated: StudentRow) => void; // cập nhật list bên ngoài
};

function isoToVN(iso?: string) {
  if (!iso) return "-";
  const [y, m, d] = String(iso).split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function isISODate(v: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(v);
}

function extractStreetFromAddress(full?: string) {
  if (!full) return "";
  return String(full).split(",")[0]?.trim() ?? "";
}

const GENDER_OPTIONS = [
  { value: "Nam", label: "Nam" },
  { value: "Nữ", label: "Nữ" },
  { value: "Khác", label: "Khác" },
];

export default function StudentDetailModal({ open, student, onClose, onSave }: Props) {
  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // working copy for student
  const [form, setForm] = useState<StudentRow | null>(null);

  // parent editable fields (from StudentRow)
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPassword, setParentPassword] = useState("");

  // address edit state (dropdown like AddStudentModal)
  const [provinces, setProvinces] = useState<ProvinceDto[]>([]);
  const [wards, setWards] = useState<WardDto[]>([]);
  const [provinceCode, setProvinceCode] = useState("");
  const [wardCode, setWardCode] = useState("");
  const [street, setStreet] = useState("");

  const [addrLoading, setAddrLoading] = useState(false);
  const [addrError, setAddrError] = useState("");

  useEffect(() => {
    setSaveError("");
    setEdit(false);

    if (!open || !student) {
      setForm(null);
      return;
    }

    setForm({ ...student });

    // init parent fields
    setParentName(student.parentName || "");
    setParentPhone(student.phone || "");
    setParentEmail(student.email || "");
    setParentPassword(student.password || "");

    // init street for rebuilding address
    setStreet(extractStreetFromAddress(student.address));

    // reset dropdown selections (optional: user picks again)
    setProvinceCode("");
    setWardCode("");
    setWards([]);
    setAddrError("");
  }, [student, open]);

  // load provinces only when enter edit mode
  useEffect(() => {
    let mounted = true;
    if (!open || !edit) return;

    (async () => {
      try {
        setAddrLoading(true);
        setAddrError("");
        const res = await addressService.getProvinces();
        if (mounted) setProvinces(res || []);
      } catch (e: any) {
        if (mounted) setAddrError(e?.message ?? "Không tải được tỉnh/TP.");
      } finally {
        if (mounted) setAddrLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [open, edit]);

  // load wards when province changes
  useEffect(() => {
    let mounted = true;
    if (!open || !edit) return;

    (async () => {
      try {
        if (!provinceCode) {
          setWards([]);
          setWardCode("");
          return;
        }
        setAddrLoading(true);
        setAddrError("");
        const res = await addressService.getWardsByProvinceCode(provinceCode);

        if (!mounted) return;
        setWards(res || []);

        const ok = (res || []).some((w) => String(w.code) === String(wardCode));
        if (!ok) setWardCode("");
      } catch (e: any) {
        if (mounted) setAddrError(e?.message ?? "Không tải được phường/xã.");
      } finally {
        if (mounted) setAddrLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [open, edit, provinceCode]);

  const provinceName = useMemo(() => {
    const p = provinces.find((x) => String(x.code) === String(provinceCode));
    return p?.name ?? "";
  }, [provinces, provinceCode]);

  const wardName = useMemo(() => {
    const w = wards.find((x) => String(x.code) === String(wardCode));
    return w?.name ?? "";
  }, [wards, wardCode]);

  const provinceOptions = useMemo(
    () => provinces.map((p) => ({ value: String(p.code), label: p.name })),
    [provinces]
  );

  const wardOptions = useMemo(
    () => wards.map((w) => ({ value: String(w.code), label: w.name })),
    [wards]
  );

  const canSave = useMemo(() => {
    if (!form) return false;

    const nameOk = !!form.fullName?.trim();
    const dobOk = !!form.dob && isISODate(form.dob);
    const genderOk = !!form.gender?.trim();
    const relOk = !!form.relationshipWithParent?.trim();

    // address is 1 line
    const addrOk = !!form.address?.trim();

    // parent (editable)
    const pNameOk = !!parentName.trim();
    const pPhoneOk = !!parentPhone.trim();
    const pEmailOk = !!parentEmail.trim();

    return nameOk && dobOk && genderOk && relOk && addrOk && pNameOk && pPhoneOk && pEmailOk;
  }, [form, parentName, parentPhone, parentEmail]);

  if (!open || !student || !form) return null;

  function setField<K extends keyof StudentRow>(key: K, value: StudentRow[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function buildFullAddressFromDropdown() {
    // district removed
    return [street.trim(), wardName, provinceName].filter(Boolean).join(", ");
  }

  async function handleSave() {
    if (!form) return;
    if (!canSave) return;

    setSaving(true);
    setSaveError("");

    try {
      // ✅ If user selected dropdown values, rebuild address
      // If user doesn't select province/ward, keep existing form.address
      const shouldRebuild = !!street.trim() && !!provinceCode && !!wardCode;
      const nextAddress = shouldRebuild ? buildFullAddressFromDropdown() : form.address;

      // ✅ update student form (district not used, but keep safe)
      const updatedStudent: StudentRow = {
        ...form,
        address: nextAddress,
        province: "", // not used in DB view, keep empty to avoid stale data
        district: "", // remove huyện
        ward: "", // not used in DB view
        parentName: parentName.trim(),
        phone: parentPhone.trim(),
        email: parentEmail.trim(),
        password: parentPassword, // keep as-is
      };

      // 1) Save parent info via API
      // ⚠️ WARNING: StudentRow does not have parentId, so we use student.id as id.
      const parentPayload: UpdateParentInfoRequest = {
        fullName: parentName.trim(),
        email: parentEmail.trim(),
        phoneNumber: parentPhone.trim(),
        address: parentAddressFromStudent(updatedStudent.address),
      };

      if (!form.parentId?.trim()) throw new Error("Không tìm thấy parentId để cập nhật phụ huynh.");
      await parentService.updateParentInfo(form.parentId, parentPayload);

      // 2) notify parent component to update student list UI
      onSave(updatedStudent);

      setEdit(false);
      onClose();
    } catch (e: any) {
      setSaveError(e?.message ?? "Lưu thay đổi thất bại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* header */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: PRIMARY }}>
          <div className="text-white font-semibold text-lg">Thông tin chi tiết</div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-md hover:bg-white/10 flex items-center justify-center text-white"
            title="Đóng"
          >
            <XIcon />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6 text-sm">
          {saveError ? (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {saveError}
            </div>
          ) : null}

          {/* Student */}
          <Section title="Thông tin học sinh">
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

            {/* address: view 1 line */}
            {!edit ? (
              <OneCol label="Địa chỉ" value={<TextValue value={student.address || "-"} />} />
            ) : (
              <div className="space-y-3">
                <div className="text-xs text-gray-400">Địa chỉ (tạo lại từ dropdown)</div>

                {addrError ? (
                  <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    {addrError}
                  </div>
                ) : null}

                <div className="grid grid-cols-3 gap-4">
                  <Field label="Tỉnh/TP">
                    <Select
                      value={provinceCode}
                      onChange={(v) => {
                        setProvinceCode(v);
                        setWardCode("");
                      }}
                      options={provinceOptions}
                      placeholder={addrLoading ? "Đang tải..." : "Chọn tỉnh/TP"}
                    />
                  </Field>

                  <Field label="Phường/Xã">
                    <Select
                      value={wardCode}
                      onChange={setWardCode}
                      options={wardOptions}
                      placeholder={!provinceCode ? "Chọn tỉnh trước" : addrLoading ? "Đang tải..." : "Chọn phường/xã"}
                    />
                  </Field>

                  <Field label="Số nhà, đường">
                    <Input value={street} onChange={setStreet} placeholder="VD: 25 Trần Phú" />
                  </Field>
                </div>

                <div className="text-xs text-gray-500">
                  Địa chỉ sẽ lưu thành:{" "}
                  <span className="font-medium text-gray-800">{buildFullAddressFromDropdown() || "-"}</span>
                </div>

                <div className="text-xs text-gray-500">
                  (Nếu không chọn Tỉnh/Phường thì giữ nguyên địa chỉ hiện tại.)
                </div>
              </div>
            )}
          </Section>

          {/* Parent */}
          <Section title="Thông tin phụ huynh">
            <TwoCol
              label1="Họ và tên"
              value1={
                edit ? <Input value={parentName} onChange={setParentName} /> : <TextValue value={student.parentName || "-"} />
              }
              label2="Số điện thoại"
              value2={
                edit ? (
                  <Input
                    value={parentPhone}
                    onChange={(v) => setParentPhone(String(v).replace(/\D/g, "").slice(0, 11))}
                  />
                ) : (
                  <TextValue value={student.phone || "-"} badge />
                )
              }
            />

            <TwoCol
              label1="Email"
              value1={edit ? <Input value={parentEmail} onChange={setParentEmail} /> : <TextValue value={student.email || "-"} />}
              label2="Mật khẩu"
              value2={
                edit ? (
                  <Input value={parentPassword} onChange={setParentPassword} placeholder="(tuỳ chọn)" />
                ) : (
                  <TextValue value={student.password ? "********" : "-"} badge />
                )
              }
            />
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
                    setParentName(student.parentName || "");
                    setParentPhone(student.phone || "");
                    setParentEmail(student.email || "");
                    setParentPassword(student.password || "");
                    setProvinceCode("");
                    setWardCode("");
                    setWards([]);
                    setStreet(extractStreetFromAddress(student.address));
                    setAddrError("");
                    setSaveError("");
                  }}
                  className="flex-1 h-12 rounded-xl border border-gray-200 text-gray-800 hover:bg-gray-50"
                  disabled={saving}
                >
                  Hủy
                </button>

                <button
                  type="button"
                  disabled={!canSave || saving}
                  onClick={handleSave}
                  className={clsx(
                    "flex-1 h-12 rounded-xl text-white font-medium shadow-sm",
                    (!canSave || saving) && "opacity-60 cursor-not-allowed"
                  )}
                  style={{ backgroundColor: PRIMARY }}
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </>
            )}
          </div>

          {edit && !canSave ? (
            <div className="text-xs text-gray-500">
              Bắt buộc: Họ tên, Ngày sinh (yyyy-mm-dd), Giới tính, Quan hệ với PH, Địa chỉ, Tên PH, SĐT, Email.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ================= small UI helpers ================= */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 text-gray-700">
          {/* simple dot icon */}
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIMARY }} />
        </div>
        <div className="font-semibold text-gray-900 text-base">{title}</div>
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
          "w-full h-10 rounded-lg border px-3 outline-none focus:ring-2 text-sm",
          error ? "border-red-300" : "border-gray-200"
        )}
        style={{ ["--tw-ring-color" as any]: `${PRIMARY}33` }}
      />
      {error ? <div className="text-xs text-red-500 mt-1">{error}</div> : null}
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
      className="w-full h-10 rounded-lg border border-gray-200 px-3 outline-none focus:ring-2 text-sm"
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

/* icons (tối giản để file self-contained) */
function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* helper: parent address payload (swagger require address). dùng chung address student */
function parentAddressFromStudent(studentAddress: string) {
  return studentAddress || "";
}
