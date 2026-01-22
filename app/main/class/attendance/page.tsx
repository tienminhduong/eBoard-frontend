"use client";

import { useEffect, useState } from "react";
import AttendanceStats from "@/components/class/attendance/AttendanceStats";
import AttendanceTable from "@/components/class/attendance/AttendanceTable";
import { attendanceService } from "@/services/attendanceService";
import {
  AttendanceInfoByClass,
  PICKUP_PEOPLE,
} from "@/types/attendance";
import Button from "@/components/ui/Button";
import { exportAttendanceExcel } from "@/utils/exportAttendanceExcel";
import { FileDown, SaveIcon, PlusCircle, Bell } from "lucide-react";
import { teacherSession } from "@/services/teacherSession";
import { useRouter } from "next/navigation";

export default function AttendancePage() {
  const [classId, setClassId] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(today);
  const [data, setData] = useState<AttendanceInfoByClass | null>(null);
  const [editing, setEditing] = useState<
    AttendanceInfoByClass["attendances"]
  >([]);
  const [notCreated, setNotCreated] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  type TabType = "pending" | "approved" | "rejected";

  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [requests, setRequests] = useState<any[]>([]);
  const [pickupPeople, setPickupPeople] = useState<string[]>([]);
  const STATUS_OPTIONS = [
    "Có mặt",
    "Vắng có phép",
    "Vắng không phép",
  ] as const;

  type AttendanceStatus = typeof STATUS_OPTIONS[number];

  const router = useRouter();

  useEffect(() => {
    const teacherId = teacherSession.getTeacherId();

    if (!teacherId) {
      router.replace("/login");
      return;
    }

    const selectedClassId = localStorage.getItem(
      `selectedClassId_${teacherId}`
    );

    if (!selectedClassId) {
      // chưa chọn lớp → quay về danh sách lớp
      router.replace("/main/my-classes");
      return;
    }

    setClassId(selectedClassId);
  }, [router]);

  const toAttendanceStatus = (v?: string) =>
    STATUS_OPTIONS.includes(v as AttendanceStatus)
      ? (v as AttendanceStatus)
      : undefined;

  const loadPendingRequests = async () => {
    if (!classId) return;
    setLoadingRequests(true);
    try {
      const res = await attendanceService.getPendingAbsentRequests(classId);
      setPendingRequests(res);
    } finally {
      setLoadingRequests(false);
    }
  };

  const loadRequests = async (tab: TabType) => {
    if (!classId) return;
    setLoadingRequests(true);
    try {
      let res = [];

      if (tab === "pending") {
        res = await attendanceService.getPendingAbsentRequests(classId);
      }

      if (tab === "approved") {
        res = await attendanceService.getApprovedAbsentRequests(classId);
      }

      if (tab === "rejected") {
        res = await attendanceService.getRejectedAbsentRequests(classId);
      }

      setRequests(res);
    } finally {
      setLoadingRequests(false);
    }
  };

  const openApproveModal = async () => {
    setShowModal(true);
    setActiveTab("pending");
    await loadRequests("pending");
  };

  const switchTab = async (tab: TabType) => {
    setActiveTab(tab);
    await loadRequests(tab);
  };

  const handleApprove = async (id: string) => {
    await attendanceService.approveAbsentRequest(id);
    await loadRequests("pending");
  };

  const handleReject = async (id: string) => {
    await attendanceService.rejectAbsentRequest(id);
    await loadRequests("pending");
  };

  /* ================= LOAD ================= */
  const load = async () => {
    if (!classId) return;
    try {
      const res = await attendanceService.getByClassAndDate(classId, date);

      if (!res.attendances || res.attendances.length === 0) {
        setNotCreated(true);
        setData(null);
        return;
      }

      setData(res);
      setEditing(structuredClone(res.attendances));
      setNotCreated(false);

      if (res.attendances.length > 0) {
        await loadPickupPeople(res.attendances[0].studentId);
      }
    } catch {
      setNotCreated(true);
      setData(null);
    }
  };

  const loadPickupPeople = async (studentId: string) => {
    try {
      const list = await attendanceService.getRecentPickupPeople(studentId);
      setPickupPeople(list);
    } catch {
      setPickupPeople([]);
    }
  };

  useEffect(() => {
    if (!classId) return;
    load();
  }, [date, classId]);

  /* ================= CREATE ================= */
  const handleCreateAttendance = async () => {
    if (!classId) return;
    const created = await attendanceService.createForDate({
      classId,
      date,
    });

    setData(created);
    setEditing(structuredClone(created.attendances));
    setNotCreated(false);
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!data) return;

    setSaveSuccess(false);

    const changed = editing.filter(e => {
      const o = data.attendances.find(x => x.id === e.id);
      if (!o) return true;

      return JSON.stringify({
        status: o.status ?? "",
        absenceReason: o.absenceReason ?? "",
        pickupPerson: o.pickupPerson ?? "",
        notes: o.notes ?? "",
      }) !== JSON.stringify({
        status: e.status ?? "",
        absenceReason: e.absenceReason ?? "",
        pickupPerson: e.pickupPerson ?? "",
        notes: e.notes ?? "",
      });
    });

    console.log("PATCH LIST:", changed);

    await Promise.all(
      changed.map(a =>
        attendanceService.patchAttendance(a.id, {
          status: a.status,
          absenceReason: a.absenceReason || undefined,
          pickupPerson: a.pickupPerson || undefined,
          notes: a.notes || undefined,
        })
      )
    );

    await load();

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };


  /* ================= EXPORT ================= */
  const onExportExcel = () => {
    if (!data) return;

    exportAttendanceExcel(data, {
      className: data.className,
      date: data.date,
    });
  };

  /* ================= NOTIFY ================= */
  const handleNotifyAbsent = async () => {
    if (!classId) return;
    if (!data) return;

    const absent = editing.filter(
      x => x.status === "Vắng không phép"
    );

    await attendanceService.notifyAbsenceWithoutExcuse(classId, date);

    alert("Đã gửi thông báo đến phụ huynh");
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      {/* ===== TITLE ===== */}
      <div>
        <h2 className="text-xl font-semibold">Điểm danh</h2>
        <p className="text-sm text-gray-400">
          Quản lý và theo dõi điểm danh học sinh theo ngày
        </p>
      </div>
      
      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-center">
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="border rounded px-3 py-2"
        />
        {saveSuccess && (
          <div className="px-4 py-2 rounded bg-green-100 text-green-700 border border-green-300">
            ✅ Lưu danh sách điểm danh thành công
          </div>
        )}

        {!notCreated && data && (
          <div className="flex gap-2">
            <Button icon={SaveIcon} variant="outline" onClick={handleSave}>
              Lưu danh sách
            </Button>

            <Button icon={FileDown} variant="outline" onClick={onExportExcel}>
              Xuất Excel
            </Button>

            <Button
              icon={Bell}
              variant="outline"
              onClick={handleNotifyAbsent}
            >
              Gửi thông báo vắng
            </Button>

            <Button
              icon={Bell}
              variant="outline"
              onClick={openApproveModal}
            >
              Duyệt xin phép
            </Button>

          </div>
        )}
      </div>

      {/* ===== CREATE ===== */}
      {notCreated && (
        <div className="border rounded p-6 text-center space-y-4">
          <p className="text-gray-600">
            Chưa có danh sách điểm danh cho ngày này
          </p>
          <Button
            variant="primary"
            icon={PlusCircle}
            onClick={handleCreateAttendance}
          >
            Tạo danh sách điểm danh
          </Button>
        </div>
      )}

      {/* ===== DATA ===== */}
      {data && (
        <>
          <AttendanceStats data={editing} />
          <AttendanceTable
            data={editing}
            date={date}
            pickupPeople={pickupPeople}
            onChange={setEditing}
          />
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[900px] rounded-xl p-6 space-y-4 shadow-lg">

            {/* HEADER */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">📄 Đơn xin vắng</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-black"
              >
                ✖
              </button>
            </div>

            {/* TABS */}
            <div className="flex gap-2 border-b pb-2">
              {[
                { key: "pending", label: "🕒 Đang chờ" },
                { key: "approved", label: "✅ Chấp nhận" },
                { key: "rejected", label: "❌ Từ chối" },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => switchTab(tab.key as TabType)}
                  className={`px-4 py-2 rounded-t font-medium ${
                    activeTab === tab.key
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* CONTENT */}
            {loadingRequests && (
              <div className="text-center py-6">Đang tải dữ liệu...</div>
            )}

            {!loadingRequests && requests.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                Không có đơn trong mục này
              </div>
            )}

            {!loadingRequests && requests.length > 0 && (
              <div className="space-y-3 max-h-[420px] overflow-y-auto">

                {requests.map(req => (
                  <div
                    key={req.id}
                    className="border rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">{req.studentName}</div>
                      <div className="text-sm text-gray-600">
                        📅 {req.fromDate} → {req.toDate}
                      </div>
                      <div className="text-sm text-gray-500">
                        📝 {req.reason}
                      </div>
                      <div className="text-xs text-gray-400">
                        Trạng thái: {req.status}
                      </div>
                    </div>

                    {/* ACTIONS — chỉ hiện nếu Pending */}
                    {activeTab === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleReject(req.id)}
                        >
                          ❌ Từ chối
                        </Button>

                        <Button
                          variant="primary"
                          onClick={() => handleApprove(req.id)}
                        >
                          ✅ Duyệt
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
