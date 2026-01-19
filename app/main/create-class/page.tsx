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

const PRIMARY = "#518581";
const SELECTED_CLASS_ID_KEY = "selectedClassId";
const CURRENT_TEACHER_ID_KEY = "teacherId"; // giữ lại, nhưng hiện tại mock

const MOCK_TEACHER_ID = "0ae25138-f3ca-43a4-aa36-d485f2e5f323";

type CreateClassForm = {
  name: string;
  gradeId: string;
  roomName: string;

  startMonth: string; // 1..12
  startYear: string; // 4 digits
  endMonth: string; // 1..12
  endYear: string; // 4 digits

  maxCapacity: string; // number string
  classDescription: string; // UI dùng field này, POST map -> description
};

type CreatedClass = {
  id: string;
  name: string;
  gradeId: string;
  teacherId: string;
  roomName: string;
  startDate: string; // yyyy-mm-dd
  endDate: string; // yyyy-mm-dd
  currentStudentCount: number;
  maxCapacity: number;
  classDescription: string;
};

function toFirstDayISO(month: string, year: string) {
  const m = String(month).padStart(2, "0");
  const y = String(year);
  return `${y}-${m}-01`;
}

function isValidMonth(m: string) {
  const n = Number(m);
  return Number.isInteger(n) && n >= 1 && n <= 12;
}

function isValidYear(y: string) {
  return /^\d{4}$/.test(y) && Number(y) >= 1900 && Number(y) <= 2100;
}

function compareYYYYMM(aY: string, aM: string, bY: string, bM: string) {
  const a = Number(aY) * 100 + Number(aM);
  const b = Number(bY) * 100 + Number(bM);
  return a - b;
}

export default function CreateClassPage() {
  const router = useRouter();

  const [form, setForm] = useState<CreateClassForm>({
    name: "",
    gradeId: "",
    roomName: "",

    startMonth: "",
    startYear: "",
    endMonth: "",
    endYear: "",

    maxCapacity: "",
    classDescription: "",
  });

  const [created, setCreated] = useState(false);
  const [createdClass, setCreatedClass] = useState<CreatedClass | null>(null);

  // grades from API
  const [gradeOptions, setGradeOptions] = useState<{ value: string; label: string }[]>([]);
  const [gradeLoading, setGradeLoading] = useState(false);
  const [gradeError, setGradeError] = useState("");

  // create state
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

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
    setForm({
      name: "",
      gradeId: "",
      roomName: "",
      startMonth: "",
      startYear: "",
      endMonth: "",
      endYear: "",
      maxCapacity: "",
      classDescription: "",
    });
  }

  function saveSelectedClassId(id: string) {
    try {
      localStorage.setItem(SELECTED_CLASS_ID_KEY, id);
    } catch {}
  }

  function getTeacherId() {
    // hiện tại chưa login => mock cứng
    try {
      return localStorage.getItem(CURRENT_TEACHER_ID_KEY) || MOCK_TEACHER_ID;
    } catch {
      return MOCK_TEACHER_ID;
    }
  }

  function fakeGuid() {
    // tạm tạo id để UI hoạt động (vì BE đang không trả id)
    return `cls_${Date.now()}_${Math.random().toString(16).slice(2)}`;
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
    const teacherId = getTeacherId();

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

      // ✅ do BE không trả classId => tạm gán fake id để lưu selectedClassId nếu muốn
      const classId = fakeGuid();

      const createdObj: CreatedClass = {
        id: classId,
        name: payload.name,
        gradeId: payload.gradeId,
        teacherId,
        roomName: payload.roomName,
        startDate: payload.startDate,
        endDate: payload.endDate,
        currentStudentCount: 0,
        maxCapacity: payload.maxCapacity,
        classDescription: payload.description,
      };

      setCreatedClass(createdObj);
      setCreated(true);
    } catch (e: any) {
      setCreateError(e?.message ?? "Tạo lớp học thất bại.");
    } finally {
      setIsCreating(false);
    }
  }

  function handleViewClass() {
    // nếu có id thì lưu; không có cũng vẫn cho qua trang /main/class
    if (createdClass?.id) saveSelectedClassId(createdClass.id);
    router.push("/main/class");
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Chào mừng trở lại!</h1>
        <p className="text-gray-500">Quản lý lớp học của bạn một cách hiệu quả</p>
      </div>

      {!created ? (
        <>
          {/* Title row */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: PRIMARY }}
            >
              <PlusIcon />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Tạo lớp học mới</h2>
              <p className="text-sm text-gray-500">Điền thông tin để tạo lớp học tiểu học</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="text-sm font-semibold text-gray-900 mb-4">Thông tin lớp học</div>

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
                        <div className="text-xs text-gray-500 mb-2">Bắt đầu</div>
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
                        <div className="text-xs text-gray-500 mb-2">Kết thúc</div>
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

              <div className="mt-4 font-semibold text-gray-900">Tạo lớp học thành công!</div>
              <div className="text-sm text-gray-500 mt-1">Lớp học đã được tạo và sẵn sàng để sử dụng</div>
            </div>

            <div className="mt-6 rounded-xl bg-gray-50 border border-gray-100 p-6">
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

            {/* ✅ Chỉ còn 1 nút Xem lớp học */}
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

/* ---------- icons ---------- */

function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="text-white">
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
