"use client";

import { useEffect, useState } from "react";
import { Plus, Printer, FileDown, Upload } from "lucide-react";

import Button from "@/components/ui/Button";
import Select from "@/components/ui/inputType/Select";
import AddScoreModal from "./AddScoreModal";

import { scoreService } from "@/services/scoreService";
import { Subject } from "@/types/score";
import AddScoreBySubjectModal from "./AddScoreBySubjectModal";

/* ================= TYPES ================= */

interface Props {
  classId: string;
  semester: number;
  studentId: "all" | string;
  subjectId: "all" | string;
  subjectName: string;

  onSemesterChange: (v: number) => void;
  onStudentChange: (v: "all" | string) => void;
  onSubjectChange: (id: "all" | string, name: string) => void;

  onPrint: () => void;
  onExportExcel: () => void;
  onImportExcel: () => void;
}

/* ================= COMPONENT ================= */

export default function ScoreFilters({
  classId,
  semester,
  studentId,
  subjectId,
  subjectName,
  onSemesterChange,
  onStudentChange,
  onSubjectChange,
  onPrint,
  onExportExcel,
  onImportExcel,
}: Props) {
  /* ===== MODAL ===== */
  const [openAddScore, setOpenAddScore] = useState(false);
  const [openAddScoreBySubject, setOpenAddScoreBySubject] =
  useState(false);

  /* ===== DATA ===== */
  const [semesters, setSemesters] = useState<
    { value: number; label: string }[]
  >([]);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
  setSemesters([
    { value: 1, label: "Học kỳ 1" },
    { value: 2, label: "Học kỳ 2" },
  ]);
}, []);


  useEffect(() => {
  if (!classId) return;

  scoreService.getSubjects(classId).then((data) => {
    // đảm bảo KHÔNG có "all" từ backend
    setSubjects(data.filter((s) => s.id !== "all"));
  });
}, [classId]);
  useEffect(() => {
    if (!classId) return;
    scoreService.getStudents(classId).then(setStudents);
  }, [classId]);

  /* ================= LOGIC ================= */

  const isOverview = subjectId === "all";

  /* ================= RENDER ================= */

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      {/* LEFT */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Semester */}
        <div className="w-[160px]">
          <Select
            value={String(semester)}
            onChange={(v) => onSemesterChange(Number(v))}
            options={semesters.map((s) => ({
              value: String(s.value),
              label: s.label,
            }))}
          />
        </div>

        {/* Student */}
        <div className="w-[220px]">
          <Select
            value={studentId}
            onChange={onStudentChange}
            options={[
              { value: "all", label: "Tất cả học sinh" },
              ...students.map((s) => ({
                value: s.id,
                label: s.name,
              })),
            ]}
          />
        </div>

        {/* Subject */}
        {studentId === "all" && (
          <div className="w-[200px]">
            <Select
              value={subjectId}
              onChange={(value) => {
                const subject = subjects.find(s => s.id === value);

                onSubjectChange(
                  value,
                  subject ? subject.name : "Tổng quan"
                );
              }}
              options={[
                { value: "all", label: "Tổng quan" },
                ...subjects.map((s) => ({
                  value: s.id,
                  label: s.name,
                })),
              ]}
            />
          </div>)}
      </div>

      {/* RIGHT */}
      <div className="flex gap-2">
        {/* OVERVIEW */}
        {isOverview && (
          <>
            <Button
              icon={Plus}
              variant="primary"
              className="rounded-xl"
              onClick={() => setOpenAddScore(true)}
            >
              Nhập điểm
            </Button>

            <Button icon={Printer} variant="outline" onClick={onPrint}>
                In bảng điểm
            </Button>

            <Button icon={FileDown} variant="outline" onClick={onExportExcel}>
              Xuất Excel
            </Button>
          </>
        )}

        {/* BY SUBJECT */}
        {!isOverview && (
          <>
            <Button
              icon={Plus}
              variant="primary"
              onClick={() => setOpenAddScoreBySubject(true)}
            >
              Nhập điểm theo môn
            </Button>

            <Button
              icon={Upload}
              variant="outline"
              onClick={onImportExcel}
            >
              Đăng tải Excel
            </Button>


            <Button icon={Printer} variant="outline" onClick={onPrint}>
              In bảng điểm theo môn
            </Button>

            <Button icon={FileDown} variant="outline" onClick={onExportExcel}>
              Xuất Excel theo môn
            </Button>
          </>
        )}


      </div>

      {/* MODAL */}
      <AddScoreModal
        open={openAddScore}
        onClose={() => setOpenAddScore(false)}
        classId={classId}
        semester={semester}
      />

      <AddScoreBySubjectModal
        open={openAddScoreBySubject}
        onClose={() => setOpenAddScoreBySubject(false)}
        classId={classId}
        semester={semester}
        subjectId={subjectId as string} // vì != "all"
        subjectName={subjectName}
      />
    </div>
  );
}
