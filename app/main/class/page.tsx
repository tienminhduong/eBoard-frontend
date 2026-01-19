"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { classService } from "@/services/classService";

const PRIMARY = "#518581";
const SELECTED_CLASS_ID_KEY = "selectedClassId";
const CURRENT_TEACHER_ID_KEY = "teacherId";
const MOCK_TEACHER_ID = "0ae25138-f3ca-43a4-aa36-d485f2e5f323";

type ClassItem = {
  id: string;
  name: string;
  gradeLabel: string;
  roomName: string;
  startDate: string; // yyyy-mm-dd or ISO
  endDate: string; // yyyy-mm-dd or ISO
  currentStudentCount: number;
  maxCapacity: number;
  classDescription?: string;
};

function ymRange(startDate: string, endDate: string) {
  const s = startDate?.slice(0, 7) ?? "";
  const e = endDate?.slice(0, 7) ?? "";
  return s && e ? `${s} - ${e}` : "-";
}

// normalize date to ISO-like string (keep as "yyyy-mm-dd" if possible)
function normDateAny(d: any) {
  if (!d) return "";
  const s = String(d);
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m?.[1]) return m[1];
  const dt = new Date(s);
  if (isNaN(dt.getTime())) return s;
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getTeacherId() {
  try {
    return localStorage.getItem(CURRENT_TEACHER_ID_KEY) || MOCK_TEACHER_ID;
  } catch {
    return MOCK_TEACHER_ID;
  }
}

// map API object -> UI item (chịu được nhiều shape khác nhau)
function mapToClassItem(x: any): ClassItem {
  const gradeLabel =
    x?.gradeLabel ??
    x?.gradeName ??
    x?.grade?.name ??
    (x?.gradeId ? `Khối ${String(x.gradeId).slice(0, 6)}...` : "-");

  return {
    id: x?.id,
    name: x?.name ?? "-",
    gradeLabel,
    roomName: x?.roomName ?? "-",
    startDate: normDateAny(x?.startDate),
    endDate: normDateAny(x?.endDate),
    currentStudentCount: Number(x?.currentStudentCount ?? 0),
    maxCapacity: Number(x?.maxCapacity ?? 0),
    classDescription: x?.classDescription ?? x?.description ?? "",
  };
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

  // load teaching classes
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const teacherId = getTeacherId();

        // GET /api/classes/teaching?teacherId=...
        const data = await classService.getTeachingClasses(teacherId);

        // data có thể là array trực tiếp, hoặc nằm trong items/data/etc
        const listRaw: any[] =
          Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : Array.isArray(data?.data) ? data.data : [];

        const mapped = listRaw.map(mapToClassItem).filter((c) => !!c.id);

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
  }, []);

  // Demo: lớp hiện tại = lớp đầu (giữ đúng UI m đang dùng)
  const currentClass = classes[0];
  const otherClasses = useMemo(() => classes.slice(1), [classes]);

  async function openDetail(c: ClassItem) {
    setDetailError("");
    setDetailLoading(true);

    try {
      // GET /api/classes/{classId}
      const res = await classService.getClassById(c.id);
      const mapped = mapToClassItem(res);
      setDetailClass(mapped);
      setDetailOpen(true);
    } catch (e: any) {
      setDetailError(e?.message ?? "Không lấy được chi tiết lớp.");
      // vẫn mở modal để show lỗi (nhưng giữ UX gọn)
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
      localStorage.setItem(SELECTED_CLASS_ID_KEY, classId); // ✅ bấm lớp nào lưu lớp đó
    } catch {}
    router.push("/main/student");
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4">
            <div className="text-sm font-semibold text-gray-900">Lớp của tôi</div>
            <div className="text-xs text-gray-500 mt-1">Quản lý và theo dõi các lớp học của bạn</div>
          </div>

          {/* status banners (không phá layout) */}
          {error ? (
            <div className="mx-6 mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="mx-6 mb-4 text-sm text-gray-500">Đang tải danh sách lớp...</div>
          ) : null}

          {!loading && !error && classes.length === 0 ? (
            <div className="mx-6 mb-6 text-sm text-gray-500">Chưa có lớp nào.</div>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>
                  <th className="text-left px-6 py-3 font-medium">Tên lớp</th>
                  <th className="text-left px-6 py-3 font-medium">Khối lớp</th>
                  <th className="text-left px-6 py-3 font-medium">Phòng học</th>
                  <th className="text-left px-6 py-3 font-medium">Năm học</th>
                  <th className="text-left px-6 py-3 font-medium">Sĩ số</th>
                  <th className="text-left px-6 py-3 font-medium">Hành động</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {/* CURRENT CLASS */}
                {currentClass && (
                  <tr className="bg-emerald-50/60">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIMARY }} />
                        <span className="font-semibold text-gray-900">{currentClass.name}</span>
                        <span
                          className="ml-2 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: `${PRIMARY}22`, color: PRIMARY }}
                        >
                          Hiện tại
                        </span>
                      </div>
                      {currentClass.classDescription && (
                        <div className="text-xs text-gray-500 mt-1">{currentClass.classDescription}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium">{currentClass.gradeLabel}</td>
                    <td className="px-6 py-4 font-medium">{currentClass.roomName}</td>
                    <td className="px-6 py-4 font-medium">
                      {ymRange(currentClass.startDate, currentClass.endDate)}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {currentClass.currentStudentCount}/{currentClass.maxCapacity}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openDetail(currentClass)}
                          className="h-9 px-4 rounded-lg text-xs text-white font-medium"
                          style={{ backgroundColor: PRIMARY }}
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() => goManageStudents(currentClass.id)}
                          className="h-9 px-4 rounded-lg text-xs font-medium border"
                          style={{ borderColor: PRIMARY, color: PRIMARY }}
                        >
                          Quản lý
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {/* OTHER CLASSES */}
                {otherClasses.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{c.name}</td>
                    <td className="px-6 py-4">{c.gradeLabel}</td>
                    <td className="px-6 py-4">{c.roomName}</td>
                    <td className="px-6 py-4">{ymRange(c.startDate, c.endDate)}</td>
                    <td className="px-6 py-4">
                      {c.currentStudentCount}/{c.maxCapacity}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openDetail(c)}
                          className="h-9 px-4 rounded-lg text-xs text-white font-medium"
                          style={{ backgroundColor: PRIMARY }}
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() => goManageStudents(c.id)}
                          className="h-9 px-4 rounded-lg text-xs font-medium border"
                          style={{ borderColor: PRIMARY, color: PRIMARY }}
                        >
                          Quản lý
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* DETAIL MODAL */}
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

/* ================= MODAL ================= */

function ClassDetailModal({
  open,
  onClose,
  data,
  loading,
  error,
}: {
  open: boolean;
  onClose: () => void;
  data: ClassItem | null;
  loading: boolean;
  error: string;
}) {
  if (!open || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white w-full max-w-xl rounded-2xl p-6">
        <div className="font-semibold text-gray-900 mb-2">Chi tiết lớp học</div>

        {loading ? <div className="text-sm text-gray-500 mb-3">Đang tải chi tiết...</div> : null}

        {error ? (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        ) : null}

        <div className="text-sm text-gray-600 space-y-2">
          <div>
            <b>Tên lớp:</b> {data.name}
          </div>
          <div>
            <b>Khối:</b> {data.gradeLabel}
          </div>
          <div>
            <b>Năm học:</b> {ymRange(data.startDate, data.endDate)}
          </div>
          <div>
            <b>Phòng học:</b> {data.roomName}
          </div>
          <div>
            <b>Sĩ số:</b> {data.currentStudentCount}/{data.maxCapacity}
          </div>
          <div>
            <b>Mô tả:</b> {data.classDescription || "-"}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="h-10 px-5 rounded-lg border text-sm">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
