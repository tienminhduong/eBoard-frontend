"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Clock,
  ShieldAlert,
  Calendar,
  Plus,
  List,
} from "lucide-react";

import StatCard from "@/components/ui/StatCard";
import Button from "@/components/ui/Button";
import { Violation, ViolationLevelNumber, ViolationStats } from "@/types/violation";
import AddViolationModal from "@/components/violation/AddViolationModal";
import { violationService } from "@/services/violationService";
import ViolationDetailModal from "@/components/violation/ViolationDetailModal";

const levelLabelMap: Record<ViolationLevelNumber, string> = {
  0: "Nhẹ",
  1: "Trung bình",
  2: "Nặng",
};

const levelStyleMap: Record<ViolationLevelNumber, string> = {
  0: "bg-emerald-100 text-emerald-700",
  1: "bg-yellow-100 text-yellow-700",
  2: "bg-red-100 text-red-700",
};

const formatDate = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function ViolationPage() {
  const [data, setData] = useState<Violation[]>([]);
  const [studentKeyword, setStudentKeyword] = useState("");
  const [classKeyword, setClassKeyword] = useState("");
  const [typeKeyword, setTypeKeyword] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [stats, setStats] = useState<ViolationStats>({
    totalViolations: 0,
    unreadViolations: 0,
    servereViolations: 0,
    thisWeekViolations: 0,
  });
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const classId = "fc23fd72-6527-47ed-97c5-5e320060f457";

  const fetchStats = async () => {
    try {
      const now = new Date();
      const day = now.getDay(); // 0 = CN
      const diffToMonday = day === 0 ? -6 : 1 - day;

      const monday = new Date(now);
      monday.setDate(now.getDate() + diffToMonday);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const from = formatDate(monday);
      const to = formatDate(sunday);

      const res = await violationService.getViolationStats(classId, from, to);
      setStats(res.data);
    } catch (err) {
      console.error("Fetch stats error:", err);
    }
  };

  const fetchViolations = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await violationService.getViolationsByClass(classId, 1, 20);
      
      setData(res.data || []);
    } catch (err: any) {
      console.error("Fetch violations error:", err);
      setError(err?.response?.data?.message || "Không thể tải danh sách vi phạm");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();
    fetchStats();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((v) => {
      if (
        studentKeyword &&
        !v.involvedStudents.some((s) =>
          s.studentName.toLowerCase().includes(studentKeyword.toLowerCase())
        )
      )
        return false;

      if (classKeyword && !v.classId.includes(classKeyword)) return false;

      if (
        typeKeyword &&
        !v.violationType.toLowerCase().includes(typeKeyword.toLowerCase())
      )
        return false;

      return true;
    });
  }, [data, studentKeyword, classKeyword, typeKeyword]);

  return (
    <div className="space-y-6">
      {/* ===== TITLE ===== */}
      <div>
        <h2 className="text-xl font-semibold">Cảnh báo vi phạm</h2>
        <p className="text-sm text-gray-400">
          Quản lý và theo dõi các vi phạm kỷ luật của học sinh
        </p>
      </div>

      {/* ===== STAT CARDS ===== */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Tổng học sinh bị cảnh báo"
          value={stats.totalViolations}
          icon={AlertTriangle}
          accentColor="#F87171"
        />

        <StatCard
          title="Số phụ huynh chưa xác nhận"
          value={stats.unreadViolations}
          icon={Clock}
          accentColor="#6BCDB1"
        />

        <StatCard
          title="Số học sinh vi phạm nặng"
          value={stats.servereViolations}
          icon={ShieldAlert}
          accentColor="#FB7185"
        />

        <StatCard
          title="Số học sinh vi phạm tuần này"
          value={stats.thisWeekViolations}
          icon={Calendar}
          accentColor="#60A5FA"
        />
      </div>

      {/* ===== SEARCH + ACTIONS ===== */}
      <div className="space-y-4">
        {/* Search box */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-600">
                Tìm theo tên học sinh
              </label>
              <input
                placeholder="Nhập tên học sinh..."
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none
                          focus:ring-2 focus:ring-[#518581]"
                value={studentKeyword}
                onChange={(e) => setStudentKeyword(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-600">
                Loại vi phạm
              </label>
              <input
                placeholder="Nhập loại vi phạm..."
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none
                          focus:ring-2 focus:ring-[#518581]"
                value={typeKeyword}
                onChange={(e) => setTypeKeyword(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Action row */}
        <div className="flex justify-between items-center">
          <Button icon={List} variant="primary" onClick={fetchViolations}>
            Danh sách
          </Button>

          <Button
            icon={Plus}
            variant="primary"
            onClick={() => setOpenAdd(true)}
          >
            Tạo vi phạm
          </Button>
        </div>
      </div>

      <AddViolationModal
        open={openAdd}
        classId={classId}
        onClose={() => setOpenAdd(false)}
        onCreated={() => {
          setOpenAdd(false);
          fetchViolations(); // reload list sau khi tạo xong
          fetchStats();
        }}
      />

      {/* ===== ERROR / LOADING ===== */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* ===== TABLE ===== */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-300">
        <table className="w-full text-sm">
          <thead className="bg-gray-200/50 text-black text-base">
            <tr>
              <th className="px-4 py-3">Học sinh</th>
              <th className="px-4 py-3">Giáo viên phụ trách</th>
              <th className="px-4 py-3">Ngày vi phạm</th>
              <th className="px-4 py-3">Loại vi phạm</th>
              <th className="px-4 py-3">Mức độ</th>
              <th className="px-4 py-3">Hình thức xử lý</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400 italic">
                  Đang tải dữ liệu...
                </td>
              </tr>
            )}

            {!loading &&
              filteredData.map((v) => (
                <tr key={v.id} className="border-t hover:bg-gray-50 cursor-pointer" 
                    onClick={() => {
                      setSelectedViolation(v);
                      setOpenDetail(true);
                    }}>
                  <td className="px-4 py-3 text-center">
                    {v.involvedStudents.slice(0, 2).map((s) => (
                      <p key={s.studentId} className="font-medium">
                        {s.studentName}
                      </p>
                    ))}

                    {v.involvedStudents.length > 2 && (
                      <p className="text-gray-400 text-sm">...</p>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {v.inChargeTeacherName}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {new Date(v.violateDate).toLocaleDateString("vi-VN")}
                  </td>

                  <td className="px-4 py-3 text-center">{v.violationType}</td>

                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium text-center
                      ${levelStyleMap[v.violationLevel]}`}
                    >
                      {levelLabelMap[v.violationLevel]}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">{v.penalty}</td>
                </tr>
              ))}

            {!loading && filteredData.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400 italic">
                  Không có dữ liệu vi phạm
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ViolationDetailModal
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        violation={selectedViolation}
        classId={classId}
        onUpdated={() => {
          fetchViolations();
          fetchStats();
        }}
      />
    </div>
  );
}
