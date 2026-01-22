"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";

import Button from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import Input from "@/components/ui/inputType/Input";

import { teacherService } from "@/services/teacherService";

import type { TeacherInfo } from "@/types/teacher";
import { teacherSession } from "@/services/teacherSession";

const PRIMARY = "#518581";

type TeacherForm = {
  fullName: string;
  email: string;
  phoneNumber: string;
  qualifications: string;
};

function normalizeTeacherForm(x: any): TeacherForm {
  return {
    fullName: String(x?.fullName ?? "").trim(),
    email: String(x?.email ?? "").trim(),
    phoneNumber: String(x?.phoneNumber ?? "").trim(),
    qualifications: String(x?.qualifications ?? "").trim(),
  };
}

// chỉ merge những field user đã sửa (dirty)
function buildMergedPayload(
  original: TeacherForm,
  current: TeacherForm,
  dirty: Record<keyof TeacherForm, boolean>
) {
  const payload: TeacherForm = { ...original };
  (Object.keys(dirty) as (keyof TeacherForm)[]).forEach((k) => {
    if (dirty[k]) payload[k] = current[k]; // chỉ field nào sửa mới lấy form hiện tại
  });
  return payload;
}

export default function SettingsPage() {
  const [teacherId, setTeacherId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [edit, setEdit] = useState(false);

  // dữ liệu gốc từ server
  const [original, setOriginal] = useState<TeacherForm | null>(null);

  // form đang hiển thị (có thể sửa)
  const [form, setForm] = useState<TeacherForm>({
    fullName: "",
    email: "",
    phoneNumber: "",
    qualifications: "",
  });

  // đánh dấu field nào đã sửa để patch merge
  const [dirty, setDirty] = useState<Record<keyof TeacherForm, boolean>>({
    fullName: false,
    email: false,
    phoneNumber: false,
    qualifications: false,
  });

  // lấy teacherId từ localStorage
  useEffect(() => {
    const id = teacherSession.getTeacherId(); // lấy từ localStorage
    if (!id) {
      window.location.href = "/login";
      return;
    }
    setTeacherId(id);
  }, []);

  // ✅ load teacher info theo teacherId
  useEffect(() => {
    if (!teacherId) return;

    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setLoadError("");

        const data: TeacherInfo = await teacherService.getTeacherInfo(teacherId);
        const normalized = normalizeTeacherForm(data);

        if (!mounted) return;
        setOriginal(normalized);
        setForm(normalized);
        setDirty({
          fullName: false,
          email: false,
          phoneNumber: false,
          qualifications: false,
        });
      } catch (e: any) {
        if (!mounted) return;
        setLoadError(e?.message ?? "Không tải được thông tin giáo viên.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [teacherId]);

  function setField<K extends keyof TeacherForm>(key: K, value: TeacherForm[K]) {
    setForm((p) => ({ ...p, [key]: value }));
    setDirty((p) => ({ ...p, [key]: true }));
  }

  const canSave = useMemo(() => {
    if (!edit) return false;
    // cho phép lưu dù có ô trống, chỉ cần có ít nhất 1 field dirty
    return Object.values(dirty).some(Boolean);
  }, [dirty, edit]);

  async function handleSave() {
    if (!original) return;
    if (!canSave) return;
    if (!teacherId) return;

    try {
      setSaving(true);
      setSaveError("");

      const payload = buildMergedPayload(original, form, dirty);
      await teacherService.updateTeacherInfo(teacherId, payload);

      // sau khi save OK -> cập nhật original + reset dirty
      setOriginal(payload);
      setForm(payload);
      setDirty({
        fullName: false,
        email: false,
        phoneNumber: false,
        qualifications: false,
      });
      setEdit(false);
    } catch (e: any) {
      setSaveError(e?.message ?? "Lưu thông tin thất bại.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    if (!original) return;
    setForm(original);
    setDirty({
      fullName: false,
      email: false,
      phoneNumber: false,
      qualifications: false,
    });
    setEdit(false);
    setSaveError("");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-7">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Thông tin tài khoản</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý thông tin cá nhân và bảo mật tài khoản</p>
        </div>

        {/* Card: Teacher Info */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="px-6 py-5 flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-gray-900">Thông tin cá nhân</div>
            </div>

            {!edit ? (
              <Button variant="outline" onClick={() => setEdit(true)} disabled={loading || !!loadError || !teacherId}>
                Sửa
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleCancelEdit} disabled={saving}>
                  Hủy
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={!canSave || saving}
                  className={clsx("bg-[#518581] hover:bg-[#3f6f67]", saving && "opacity-70 cursor-not-allowed")}
                >
                  {saving ? "Đang lưu..." : "Lưu"}
                </Button>
              </div>
            )}
          </div>

          <div className="px-6 pb-6">
            {loadError ? (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {loadError}
              </div>
            ) : null}

            {saveError ? (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {saveError}
              </div>
            ) : null}

            {loading ? <div className="text-sm text-gray-500">Đang tải thông tin...</div> : null}

            {!loading && !loadError ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Họ tên giáo viên" required={false}>
                  <Input
                    value={form.fullName}
                    onChange={(e: any) => setField("fullName", e.target.value)}
                    disabled={!edit}
                    className="text-sm"
                  />
                </FormField>

                <FormField label="Trình độ chuyên môn" required={false}>
                  <Input
                    value={form.qualifications}
                    onChange={(e: any) => setField("qualifications", e.target.value)}
                    disabled={!edit}
                    className="text-sm"
                  />
                </FormField>

                <FormField label="Email" required={false}>
                  <Input
                    value={form.email}
                    onChange={(e: any) => setField("email", e.target.value)}
                    disabled={!edit}
                    className="text-sm"
                  />
                </FormField>

                <FormField label="SĐT" required={false}>
                  <Input
                    value={form.phoneNumber}
                    onChange={(e: any) =>
                      setField("phoneNumber", String(e.target.value).replace(/\D/g, "").slice(0, 11))
                    }
                    disabled={!edit}
                    className="text-sm"
                  />
                </FormField>
              </div>
            ) : null}
          </div>
        </div>

        {/* Card: Security (UX only) */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="px-6 py-5">
            <div className="text-lg font-semibold text-gray-900">Bảo mật</div>
            <div className="text-sm text-gray-500 mt-1">Đổi mật khẩu đăng nhập</div>
          </div>

          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Mật khẩu hiện tại">
                <Input type="password" value="" onChange={() => {}} disabled placeholder="••••••••" className="text-sm" />
              </FormField>
              <div />
              <FormField label="Mật khẩu mới">
                <Input type="password" value="" onChange={() => {}} disabled placeholder="••••••••" className="text-sm" />
              </FormField>
              <FormField label="Nhập lại mật khẩu mới">
                <Input type="password" value="" onChange={() => {}} disabled placeholder="••••••••" className="text-sm" />
              </FormField>
            </div>

            <div className="mt-5">
              <Button variant="outline" disabled>
                Lưu mật khẩu 
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
