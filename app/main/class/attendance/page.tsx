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

export default function AttendancePage() {
  const classId = "27f5cded-0c8a-4aa0-a099-718ac7434a3b";
  const today = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(today);
  const [data, setData] = useState<AttendanceInfoByClass | null>(null);
  const [editing, setEditing] = useState<
    AttendanceInfoByClass["attendances"]
  >([]);
  const [notCreated, setNotCreated] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  /* ================= LOAD ================= */
  const load = async () => {
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
    } catch {
      setNotCreated(true);
      setData(null);
    }
  };

  useEffect(() => {
    load();
  }, [date]);

  /* ================= CREATE ================= */
  const handleCreateAttendance = async () => {
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

    const normalize = (v?: string) => (v ?? "").trim();

    const changed = editing.filter(e => {
      const o = data.attendances.find(x => x.id === e.id);
      if (!o) return true;

      return (
        normalize(o.status) !== normalize(e.status) ||
        normalize(o.absenceReason) !== normalize(e.absenceReason) ||
        normalize(o.pickupPerson) !== normalize(e.pickupPerson) ||
        normalize(o.notes) !== normalize(e.notes)
      );
    });

    for (const a of changed) {
      await attendanceService.patchAttendance(a.id, {
        status: a.status,
        absenceReason: a.absenceReason,
        pickupPerson: a.pickupPerson,
        notes: a.notes,
      });
    }

    await load();

    // ✅ báo thành công
    setSaveSuccess(true);

    // tự ẩn sau 3s
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
    if (!data) return;

    const absent = editing.filter(
      x => x.status === "Vắng không phép"
    );

    await attendanceService.notifyAbsentParents({
      classId,
      date,
      studentIds: absent.map(x => x.studentId),
    });

    alert("Đã gửi thông báo đến phụ huynh");
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
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
            pickupPeople={PICKUP_PEOPLE}
            onChange={setEditing}
          />
        </>
      )}
    </div>
  );
}
