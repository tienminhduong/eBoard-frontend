"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

import Button from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import Input from "@/components/ui/inputType/Input";
import Textarea from "@/components/ui/inputType/TextArea";
import Select from "@/components/ui/inputType/Select";

import { classService } from "@/services/classService";
import { PlusIcon, CheckIcon } from "@/components/ui/icon";

import type { CreateClassForm, CreatedClass, Option } from "@/types/Class";
import { compareYYYYMM, isValidMonth, isValidYear, toFirstDayISO } from "@/utils/classDate";

import { tokenStorage } from "@/services/tokenStorage";
import { decodeJwt } from "@/utils/jwt";

const PRIMARY = "#518581";

function getSelectedClassKey(teacherId: string) {
  return `selectedClassId_${teacherId}`;
}

const initialForm: CreateClassForm = {
  name: "",
  gradeId: "",
  roomName: "",
  startMonth: "",
  startYear: "",
  endMonth: "",
  endYear: "",
  maxCapacity: "",
  classDescription: "",
};

function extractTeacherIdFromAccessToken(): string | null {
  const token = tokenStorage.getAccessToken();
  if (!token) return null;

  try {
    const payload: any = decodeJwt(token);

    const id =
      payload?.user_id ||
      payload?.id ||
      payload?.sub ||
      payload?.teacherId ||
      payload?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

    return typeof id === "string" && id.trim() ? id : null;
  } catch {
    return null;
  }
}

export default function CreateClassPage() {
  const router = useRouter();

  const [form, setForm] = useState<CreateClassForm>(initialForm);

  const [created, setCreated] = useState(false);
  const [createdClass, setCreatedClass] = useState<CreatedClass | null>(null);

  // grades from API
  const [gradeOptions, setGradeOptions] = useState<Option[]>([]);
  const [gradeLoading, setGradeLoading] = useState(false);
  const [gradeError, setGradeError] = useState("");

  // create state
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // ✅ teacherId từ token đăng nhập
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const id = extractTeacherIdFromAccessToken();
    if (!id) {
      router.replace("/login");
      return;
    }
    setTeacherId(id);
    setCheckingAuth(false);
  }, [router]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setGradeLoading(true);
        setGradeError("");
        const grades = await classService.getGrades(); // GET /api/grades
        const opts = (grades || []).map((g: any) => ({ value: g.id, label: g.name }));
        if (mounted) setGradeOptions(opts);
      } catch (e: any) {
        if (mounted) setGradeError(e?.message ?? "Không tải được danh sách khối.");
      } finally {
        if (mounted) setGradeLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const gradeLabel = useMemo(() => {
    const found = gradeOptions.find((g) => g.value === form.gradeId);
    return found?.label ?? "";
  }, [form.gradeId, gradeOptions]);

  function setField<K extends keyof CreateClassForm>(key: K, value: CreateClassForm[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function resetForm() {
    setCreateError("");
    setForm(initialForm);
  }

  function saveSelectedClassId(teacherId: string, classId: string) {
    try {
      localStorage.setItem(getSelectedClassKey(teacherId), classId);
    } catch {}
  }

  function validate() {
    if (!form.name.trim()) return false;
    if (!form.gradeId) return false;
    if (!form.roomName.trim()) return false;

    if (!isValidMonth(form.startMonth) || !isValidYear(form.startYear)) return false;
    if (!isValidMonth(form.endMonth) || !isValidYear(form.endYear)) return false;

    if (compareYYYYMM(form.startYear, form.startMonth, form.endYear, form.endMonth) > 0) return false;

    const max = Number(form.maxCapacity);
    if (!Number.isInteger(max) || max <= 0) return false;

    return true;
  }

  async function handleCreateClass() {
    if (!validate()) return;

    setCreateError("");

    if (!teacherId) {
      router.replace("/login");
      return;
    }

    const payload = {
      name: form.name.trim(),
      gradeId: form.gradeId,
      startDate: toFirstDayISO(form.startMonth, form.startYear),
      endDate: toFirstDayISO(form.endMonth, form.endYear),
      maxCapacity: Number(form.maxCapacity),
      roomName: form.roomName.trim(),
      description: form.classDescription.trim(),
    };

    try {
      setIsCreating(true);

      // POST /api/classes?teacherId=...
      await classService.createClass(teacherId, payload);

      // gọi lại danh sách lớp của teacher
      const classes = await classService.getTeachingClasses(teacherId);

      // tìm lớp vừa tạo theo name + room + startDate (hoặc sort newest)
      const newest = classes?.[0]; // nếu API trả theo createdAt desc
      if (!newest?.id) throw new Error("Không lấy được id lớp vừa tạo");

      saveSelectedClassId(teacherId, newest.id);

      setCreatedClass(newest);
      setCreated(true);
    } catch (e: any) {
      setCreateError(e?.message ?? "Tạo lớp học thất bại.");
    } finally {
      setIsCreating(false);
    }
  }

  function handleViewClass() {
    if (teacherId && createdClass?.id) {
      saveSelectedClassId(teacherId, createdClass.id);
    }
    router.push("/main/class");
  }

  // ✅ đang check auth thì đừng render để tránh flash
  if (checkingAuth) return null;
  if (!teacherId) return null;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Chào mừng trở lại!</h1>
        <p className="text-base text-gray-500">Quản lý lớp học của bạn một cách hiệu quả</p>
      </div>

      {!created ? (
        <>
          {/* Title row */}
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: PRIMARY }}
            >
              <PlusIcon />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Tạo lớp học mới</h2>
              <p className="text-sm text-gray-500">Điền thông tin để tạo lớp học tiểu học</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="text-base font-semibold text-gray-900 mb-4">Thông tin lớp học</div>

              {gradeError ? (
                <div className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  {gradeError}
                </div>
              ) : null}

              {createError ? (
                <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {createError}
                </div>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Tên lớp học" required>
                  <Input
                    placeholder="VD: 2A3"
                    value={form.name}
                    onChange={(e: any) => setField("name", e.target.value)}
                    disabled={isCreating}
                  />
                </FormField>

                <FormField label="Khối" required>
                  <Select
                    options={gradeOptions}
                    placeholder={gradeLoading ? "Đang tải khối" : "Chọn khối"}
                    value={form.gradeId}
                    onChange={(v: string) => setField("gradeId", v)}
                  />
                </FormField>

                <FormField label="Phòng học" required>
                  <Input
                    placeholder="VD: P14"
                    value={form.roomName}
                    onChange={(e: any) => setField("roomName", e.target.value)}
                    disabled={isCreating}
                  />
                </FormField>

                <div />

                {/* Năm học */}
                <div className="md:col-span-2">
                  <FormField label="Năm học" required>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">Bắt đầu</div>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            placeholder="Tháng"
                            value={form.startMonth}
                            onChange={(e: any) =>
                              setField("startMonth", String(e.target.value).replace(/\D/g, "").slice(0, 2))
                            }
                            disabled={isCreating}
                          />
                          <Input
                            placeholder="Năm"
                            value={form.startYear}
                            onChange={(e: any) =>
                              setField("startYear", String(e.target.value).replace(/\D/g, "").slice(0, 4))
                            }
                            disabled={isCreating}
                          />
                        </div>
                      </div>

                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">Kết thúc</div>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            placeholder="Tháng"
                            value={form.endMonth}
                            onChange={(e: any) =>
                              setField("endMonth", String(e.target.value).replace(/\D/g, "").slice(0, 2))
                            }
                            disabled={isCreating}
                          />
                          <Input
                            placeholder="Năm"
                            value={form.endYear}
                            onChange={(e: any) =>
                              setField("endYear", String(e.target.value).replace(/\D/g, "").slice(0, 4))
                            }
                            disabled={isCreating}
                          />
                        </div>
                      </div>
                    </div>
                  </FormField>
                </div>

                <div className="md:col-span-2">
                  <FormField label="Sĩ số tối đa" required>
                    <Input
                      placeholder="VD: 26"
                      value={form.maxCapacity}
                      onChange={(e: any) =>
                        setField("maxCapacity", String(e.target.value).replace(/\D/g, "").slice(0, 3))
                      }
                      disabled={isCreating}
                    />
                  </FormField>
                </div>

                <div className="md:col-span-2">
                  <FormField label="Mô tả (Tùy chọn)">
                    <Textarea
                      rows={4}
                      placeholder="Nhập mô tả về lớp học..."
                      value={form.classDescription}
                      onChange={(e: any) => setField("classDescription", e.target.value)}
                      disabled={isCreating}
                    />
                  </FormField>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between gap-4">
                <Button
                  variant="primary"
                  className={clsx("flex-1", isCreating && "opacity-70 cursor-not-allowed")}
                  onClick={handleCreateClass}
                  disabled={isCreating}
                >
                  {isCreating ? "Đang tạo..." : "+ Tạo lớp học"}
                </Button>

                <Button variant="outline" onClick={resetForm} disabled={isCreating}>
                  Đặt lại
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Success screen */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <div className="flex flex-col items-center text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: PRIMARY }}
              >
                <CheckIcon />
              </div>

              <div className="mt-4 text-lg font-semibold text-gray-900">Tạo lớp học thành công!</div>
              <div className="text-sm text-gray-500 mt-1">Lớp học đã được tạo và sẵn sàng để sử dụng</div>
            </div>

            {/* “Bảng” info: text-sm */}
            <div className="mt-6 rounded-xl bg-gray-50 border border-gray-100 p-6 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem label="Tên lớp học" value={createdClass?.name || "-"} />
                <InfoItem label="Khối" value={gradeLabel || "-"} />
                <InfoItem
                  label="Năm học"
                  value={
                    createdClass
                      ? `${createdClass.startDate.slice(0, 7)} - ${createdClass.endDate.slice(0, 7)}`
                      : "-"
                  }
                />
                <InfoItem label="Phòng học" value={createdClass?.roomName || "-"} />
                <InfoItem
                  className="md:col-span-2"
                  label="Sĩ số tối đa"
                  value={createdClass ? `${createdClass.maxCapacity} học sinh` : "-"}
                />
              </div>
            </div>

            <div className="mt-6">
              <Button variant="primary" className="w-full" onClick={handleViewClass}>
                Xem lớp học
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- small parts ---------- */

function InfoItem({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-medium text-gray-900 mt-1">{value}</div>
    </div>
  );
}
