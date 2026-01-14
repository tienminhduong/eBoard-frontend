"use client";

import { useEffect, useState } from "react";
import { Calendar, List, Filter, Upload, Plus, MoreVertical, ChevronLeft, ChevronRight, BookOpen, Clock, FileCheck } from "lucide-react";
import { examService } from "@/services/examService";
import { ExamSchedule } from "@/types/exam";
import StatCard from "@/components/ui/StatCard";
import Legend from "@/components/ui/Legend";
import { subjectColor } from "@/utils/subjectColor";
import Button from "@/components/ui/Button";

export default function ExamPage() {
  const [data, setData] = useState<ExamSchedule[]>([]);

  useEffect(() => {
    examService.getExamSchedules().then(setData);
  }, []);

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
        <div className="flex gap-2">
          <Button icon={Calendar} variant="primary">
            Lịch
          </Button>

          <Button icon={List} variant="ghost">
            Danh sách
          </Button>

          <Button icon={Filter} variant="ghost">
            Bộ lọc
          </Button>
        </div>

        <div className="flex gap-2">
          <Button icon={Upload} variant="outline" className="rounded-xl">
            Đăng tải Excel
          </Button>

          <Button icon={Plus} variant="primary" className="rounded-xl">
            Thêm lịch kiểm tra
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl p-6 space-y-4 shadow-sm">
        {/* Week header */}
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Tuần 24/11 - 28/11</h3>
          <div className="flex gap-2 text-[#518581]">
            <ChevronLeft className="cursor-pointer" />
            <ChevronRight className="cursor-pointer" />
          </div>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-5 gap-4">
          {[
            { day: "Thứ 2", date: "24/11", full: "2025-11-24" },
            { day: "Thứ 3", date: "25/11", full: "2025-11-25" },
            { day: "Thứ 4", date: "26/11", full: "2025-11-26" },
            { day: "Thứ 5", date: "27/11", full: "2025-11-27" },
            { day: "Thứ 6", date: "28/11", full: "2025-11-28" },
          ].map((d, index) => {
            const exams = data.filter((e) => e.date === d.full);
            const isToday = index === 4; // giống hình demo

            return (
              <div
                key={d.full}
                className={`
                  border rounded-xl p-3 space-y-3
                  ${isToday ? "border-[#518581] bg-[#518581]/5" : ""}
                `}
              >
                <div>
                  <p className="font-medium text-sm">{d.day}</p>
                  <p className="text-xs text-gray-400">{d.date}</p>
                </div>

                {exams.map((exam) => {
                  const color = subjectColor[exam.subject];

                  return (
                    <div
                      key={exam.id}
                      className="p-3 rounded-xl text-sm space-y-1"
                      style={{
                        backgroundColor: color.bg,
                        color: color.text,
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{exam.subject}</span>
                        <MoreVertical size={14} />
                      </div>
                      <p className="text-xs">{exam.type}</p>
                      <p className="text-xs">{exam.time}</p>
                      <p className="text-xs italic">{exam.content}</p>
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
      </div>
    </div>
  );
}
