"use client";

import { useEffect, useState } from "react";
import { Calendar, Filter, Upload, Plus, ChevronLeft, ChevronRight, BookOpen, Clock, FileCheck, FilterX } from "lucide-react";
import { examService } from "@/services/examService";
import type { ExamSchedule } from "@/types/exam";
import StatCard from "@/components/ui/StatCard";
import Legend from "@/components/ui/Legend";
import { subjectColor } from "@/utils/subjectColor";
import Button from "@/components/ui/Button";
import AddExamModal from "@/components/exam/AddExamModal";
import ExamDetailModal from "@/components/exam/ExamDetailModal";
import ExamFilterModal from "@/components/exam/ExamFilterModal";
import ImportExamExcelModal from "@/components/exam/ImportExamExcelModal";
import { getWeekDays } from "@/utils/week";
import ExamActionMenu from "@/components/exam/ExamActionMenu";

type ExamFilter = {
  subjectId?: string;
  type?: string;
  fromDate?: string;
  toDate?: string;
};

export default function ExamPage() {
  const [data, setData] = useState<ExamSchedule[]>([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ExamSchedule | null>(null);
  const [filter, setFilter] = useState<ExamFilter>({});
  const [openFilter, setOpenFilter] = useState(false);
  const isFiltering = Object.values(filter).some(Boolean);
  const [openImportExcel, setOpenImportExcel] = useState(false);
  const [weekBase, setWeekBase] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const classId = "04598b0c-3d9f-4519-8581-dadee7db189a";

  // Mapping dữ liệu từ BE sang FE
  const mapExamFromBE = (e: any): ExamSchedule => {
    const start = new Date(e.startTime);

    return {
      id: e.id,
      subjectId: e.subject.id,
      subjectName: e.subject.name,
      type: e.examFormat,
      date: start.toISOString().slice(0, 10), // 2024-06-17
      time: start.toISOString().slice(11, 16), // 08:30
      location: e.location ?? undefined,
      notes: e.notes ?? undefined,
    };
  };

  // Lấy danh sách lịch thi
  const fetchExamSchedule = async () => {
    try {
      const from = days[0].full + "T00:00:00Z";
      const to = days[days.length - 1].full + "T23:59:59Z";

      const res = await examService.getByClass(classId, {
        from,
        to,
        examFormat: filter.type,
        subjectId: filter.subjectId,
      });

      const mapped = res.data.map(mapExamFromBE);
      setData(mapped);
    } catch (err) {
      console.error("Fetch exam schedule failed", err);
    }
  };

  useEffect(() => {
    fetchExamSchedule();
  }, [weekBase, filter]);

  const days = getWeekDays(weekBase);

  const onDeleteExam = async (exam: ExamSchedule) => {
    const ok = confirm(
      `Xoá lịch thi môn ${exam.subjectName} ngày ${exam.date}?`
    );
    if (!ok) return;

    try {
      await examService.deleteExam(exam.id);

      // reload từ server (an toàn nhất)
      await fetchExamSchedule();
      alert("Xoá lịch thi thành công");
    } catch (err) {
      alert("Xoá lịch thi thất bại");
    }
  };

  const filteredData = data.filter((exam) => {
    if (filter.subjectId && exam.subjectId !== filter.subjectId) return false;
    if (filter.type && exam.type !== filter.type) return false;
    if (filter.fromDate && exam.date < filter.fromDate) return false;
    if (filter.toDate && exam.date > filter.toDate) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-semibold">Lịch thi & kiểm tra</h2>
        <p className="text-sm text-gray-400">
          Quản lý và theo dõi lịch thi trong năm học của lớp
        </p>
      </div>

      {/* Statistic cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="Tổng bài thi tháng này"
          value={5}
          icon={BookOpen}
          accentColor="#6BCDB1"
        />
        <StatCard
          title="Bài thi sắp diễn ra"
          value={1}
          icon={Clock}
          accentColor="#F8A8C4"
        />
        <StatCard
          title="Bài cần chấm"
          value={4}
          icon={FileCheck}
          accentColor="#F9D976"
        />
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button icon={Calendar} variant="primary">
            Lịch tuần
          </Button>

          <Button 
            icon={isFiltering ? FilterX : Filter}
            variant="ghost"
            className={`
              ${isFiltering 
                ? "bg-[#518581]/10 text-[#518581] hover:bg-[#518581]/20 border border-[#518581]/30"
                : "bg-white"
              }
            `}
            onClick={() => {
              if (isFiltering) {
                setFilter({});
              } else {
                setOpenFilter(true);
              }
            }}
          >
            Bộ lọc
          </Button>
        </div>

        <div className="flex gap-2">
          <Button icon={Upload} variant="outline" className="bg-white" onClick={() => setOpenImportExcel(true)}>
            Đăng tải Excel
          </Button>

          <Button
            icon={Plus}
            variant="primary"
            onClick={() => {
              setSelectedDate(null); 
              setOpenAddModal(true);
            }}
          >
            Thêm lịch thi
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl p-6 space-y-4 shadow-sm">
        {/* Week header */}
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">
            Tuần {days[0].date} – {days[days.length - 1].date}
          </h3>
          <div className="flex gap-2 text-[#518581]">
            <ChevronLeft 
              className="cursor-pointer" 
              onClick={() =>
                setWeekBase((prev) => {
                  const d = new Date(prev);
                  d.setDate(d.getDate() - 7);
                  return d;
                })
              } />
            <ChevronRight 
              className="cursor-pointer"
              onClick={() =>
                setWeekBase((prev) => {
                  const d = new Date(prev);
                  d.setDate(d.getDate() + 7);
                  return d;
                })
              } />
          </div>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-5 gap-4">
          {days.map((d, index) => {
            const exams = filteredData.filter((e) => e.date === d.full);
            const isToday = d.full === new Date().toISOString().slice(0, 10);

            return (
              <div
                key={d.full}
                className={`
                  border rounded-2xl p-4 space-y-4
                  ${isToday ? "border-[#518581]" : ""}
                `}
              >
                {/* Header thứ - ngày */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Thứ */}
                    <p className="text-base font-semibold text-gray-600">
                      {d.day}
                    </p>

                    {/* BADGE HÔM NAY */}
                    {isToday && (
                      <span className="text-sm px-2 py-0.5 rounded-full bg-[#518581] text-white">
                        Hôm nay
                      </span>
                    )}
                  </div>

                  {/* Ngày */}
                  <p className="text-base font-bold text-gray-900">
                    {d.date}
                  </p>
                </div>

                {/* Nếu KHÔNG có lịch */}
                {exams.length === 0 && (
                  <button
                    onClick={() => {
                      setSelectedDate(d.full);
                      setOpenAddModal(true);
                    }}
                    className="
                      w-full py-6 text-sm italic
                      text-gray-400 hover:text-green-700
                      hover:bg-green-50
                      rounded-xl transition
                    "
                  >
                    + Thêm lịch thi
                  </button>
                )}

                {/* Nếu CÓ lịch */}
                {exams.map((exam) => {
                  const color = subjectColor[exam.subjectName];

                  return (
                    <div
                      key={exam.id}
                      className="p-3 rounded-xl space-y-2"
                      style={{
                        backgroundColor: color.bg,
                        color: color.text,
                      }}
                      onClick={() => setSelectedExam(exam)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Môn */}
                          <span 
                            className="font-bold text-base">
                            {exam.subjectName}
                          </span>

                          {/* BADGE HÌNH THỨC THI */}
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: color.text + "20",
                              color: color.text,
                            }}
                          >
                            {exam.type}
                          </span>
                        </div>

                        <ExamActionMenu
                          onEdit={() => setSelectedExam(exam)}
                          onDelete={() => onDeleteExam(exam)}
                        />
                      </div>

                      {/* GIỜ THI */}
                      <div className="flex items-center gap-1 text-base font-bold">
                        <Clock size={16} />
                        <span>{exam.time}</span>
                      </div>

                      {/* ĐỊA ĐIỂM */}
                      {exam.location && (
                        <p className="text-sm flex items-center gap-1 opacity-90">
                          📍 {exam.location}
                        </p>
                      )}

                      {/* GHI CHÚ */}
                      {exam.notes && (
                        <p className="text-xs italic opacity-70">
                          {exam.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="pt-4 border-t text-sm text-gray-500 flex gap-4">
          <Legend color="bg-emerald-200" label="Toán" />
          <Legend color="bg-pink-200" label="Tiếng Việt" />
          <Legend color="bg-blue-200" label="Tiếng Anh" />
          <Legend color="bg-yellow-200" label="Khoa học" />
        </div>

        {/* Modal */}
        <AddExamModal
          open={openAddModal}
          onClose={() => {
            setOpenAddModal(false);
            setSelectedDate(null);
          }}
          classId={classId} 
          defaultDate={selectedDate ?? undefined}
          onCreated={() => {
            fetchExamSchedule();            // reload danh sách lịch thi
          }}
        />
        {selectedExam && (
          <ExamDetailModal
            open
            exam={selectedExam}
            classId={classId}
            onUpdated={fetchExamSchedule}
            onClose={() => setSelectedExam(null)}
          />
        )}
        <ExamFilterModal
          open={openFilter}
          onClose={() => setOpenFilter(false)}
          filter={filter}
          setFilter={setFilter}
          classId={classId}
        />
        <ImportExamExcelModal
          open={openImportExcel}
          onClose={() => setOpenImportExcel(false)}
        />
      </div>
    </div>
  );
}
