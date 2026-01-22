"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { classService } from "@/services/classService";
import type { ClassItem, ClassesPagedResponse } from "@/types/Class";
import { ymRange } from "@/utils/date";
import { mapToClassItem } from "@/utils/classMapper";
import { isCurrentClass, isPastClass } from "@/utils/classStatus";
import ClassDetailModal from "@/components/class/ClassDetailModal";

import { tokenStorage } from "@/services/tokenStorage";
import { decodeJwt } from "@/utils/jwt";
import { teacherSession } from "@/services/teacherSession";

const PRIMARY = "#518581";
const SELECTED_CLASS_ID_KEY = "selectedClassId";

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

export default function MyClassesPage() {
  const router = useRouter();

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // modal state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailClass, setDetailClass] = useState<ClassItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const pageNumber = 1;
  const pageSize = 50;

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        // lấy teacherId từ token đăng nhập
        const teacherId = teacherSession.getTeacherId();
        if (!teacherId) {
          router.replace("/login");
          return;
        }

        // API mới: /api/classes?teacherId=...&pageNumber=...&pageSize=...
        const res: ClassesPagedResponse<any> = await classService.getAllClassesByTeacher(
          teacherId,
          pageNumber,
          pageSize
        );

        const listRaw = Array.isArray(res?.data) ? res.data : [];
        const mapped = listRaw.map(mapToClassItem).filter((c) => !!c.id);

        // sort mới nhất trước cho đẹp
        mapped.sort((a, b) => (b.startDate || "").localeCompare(a.startDate || ""));

        if (mounted) setClasses(mapped);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "Không tải được danh sách lớp.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router]);

  const currentClasses = useMemo(() => classes.filter(isCurrentClass), [classes]);
  const pastClasses = useMemo(() => classes.filter(isPastClass), [classes]);

  async function openDetail(c: ClassItem) {
    setDetailError("");
    setDetailLoading(true);

    try {
      const res = await classService.getClassById(c.id);
      setDetailClass(mapToClassItem(res));
      setDetailOpen(true);
    } catch (e: any) {
      setDetailError(e?.message ?? "Không lấy được chi tiết lớp.");
      setDetailClass(c);
      setDetailOpen(true);
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetail() {
    setDetailOpen(false);
    setDetailClass(null);
    setDetailError("");
  }

  function goManageStudents(classId: string) {
    try {
      localStorage.setItem(SELECTED_CLASS_ID_KEY, classId); // lưu lớp được chọn
    } catch {}
    router.push("/main/class/attendance");
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-7">
          <div className="text-2xl font-semibold text-gray-900">Lớp của tôi</div>
        </div>

        {error ? (
          <div className="mb-5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </div>
        ) : null}

        {loading ? <div className="mb-5 text-sm text-gray-500">Đang tải danh sách lớp...</div> : null}

        {/* ===== TABLE 1: CURRENT ===== */}
        <SectionCard
          title="Lớp hiện tại"
          subtitle="Các lớp bạn đang dạy"
          emptyText={!loading && !error && currentClasses.length === 0 ? "Chưa có lớp hiện tại." : ""}
        >
          <ClassesTable
            rows={currentClasses}
            highlightCurrent
            onDetail={openDetail}
            onManage={goManageStudents}
          />
        </SectionCard>

        {/* ===== TABLE 2: PAST ===== */}
        <SectionCard
          title="Lớp đã từng dạy"
          subtitle="Các lớp trong quá khứ"
          emptyText={!loading && !error && pastClasses.length === 0 ? "Chưa có lớp quá khứ." : ""}
          className="mt-6"
        >
          <ClassesTable rows={pastClasses} onDetail={openDetail} onManage={goManageStudents} />
        </SectionCard>

        <ClassDetailModal
          open={detailOpen}
          onClose={closeDetail}
          data={detailClass}
          loading={detailLoading}
          error={detailError}
        />
      </div>
    </main>
  );
}

/* ================= UI PARTS ================= */

function SectionCard({
  title,
  subtitle,
  emptyText,
  className,
  children,
}: {
  title: string;
  subtitle: string;
  emptyText?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden ${className ?? ""}`}>
      <div className="px-6 py-4">
        <div className="text-lg font-semibold text-gray-900">{title}</div>
        <div className="text-sm text-gray-500 mt-1">{subtitle}</div>
      </div>

      {emptyText ? <div className="px-6 pb-6 text-sm text-gray-500">{emptyText}</div> : null}

      {children}
    </div>
  );
}

function ClassesTable({
  rows,
  onDetail,
  onManage,
  highlightCurrent,
}: {
  rows: ClassItem[];
  onDetail: (c: ClassItem) => void;
  onManage: (classId: string) => void;
  highlightCurrent?: boolean;
}) {
  if (!rows.length) return null;

  return (
    <div className="overflow-x-auto">
      {/* ✅ tbody content text-sm, thead bigger */}
      <table className="w-full">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="text-left px-6 py-3 font-semibold text-sm md:text-base">Tên lớp</th>
            <th className="text-left px-6 py-3 font-semibold text-sm md:text-base">Khối</th>
            <th className="text-left px-6 py-3 font-semibold text-sm md:text-base">Phòng</th>
            <th className="text-left px-6 py-3 font-semibold text-sm md:text-base">Năm học</th>
            <th className="text-left px-6 py-3 font-semibold text-sm md:text-base">Sĩ số</th>
            <th className="text-left px-6 py-3 font-semibold text-sm md:text-base">Hành động</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100 text-sm text-gray-800">
          {rows.map((c, idx) => {
            const isFirst = idx === 0 && highlightCurrent;
            return (
              <tr key={c.id} className={isFirst ? "bg-emerald-50/60" : "hover:bg-gray-50"}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {isFirst ? <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIMARY }} /> : null}
                    <span className="font-semibold text-gray-900">{c.name}</span>
                    {isFirst ? (
                      <span
                        className="ml-2 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: `${PRIMARY}22`, color: PRIMARY }}
                      >
                        Hiện tại
                      </span>
                    ) : null}
                  </div>

                  {c.classDescription ? <div className="text-xs text-gray-500 mt-1">{c.classDescription}</div> : null}
                </td>

                <td className="px-6 py-4">{c.gradeLabel}</td>
                <td className="px-6 py-4">{c.roomName}</td>
                <td className="px-6 py-4">{ymRange(c.startDate, c.endDate)}</td>
                <td className="px-6 py-4">
                  {c.currentStudentCount}/{c.maxCapacity}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onDetail(c)}
                      className="h-9 px-4 rounded-lg text-xs text-white font-medium"
                      style={{ backgroundColor: PRIMARY }}
                    >
                      Chi tiết
                    </button>
                    <button
                      onClick={() => onManage(c.id)}
                      className="h-9 px-4 rounded-lg text-xs font-medium border"
                      style={{ borderColor: PRIMARY, color: PRIMARY }}
                    >
                      Quản lý
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
