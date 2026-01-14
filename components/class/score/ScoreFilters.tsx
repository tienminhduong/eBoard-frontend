"use client";

import { useEffect, useState } from "react";
import { Plus, Printer, FileDown, Upload } from "lucide-react";

import Button from "@/components/ui/Button";
import Select from "@/components/ui/inputType/Select";
import AddScoreModal from "./AddScoreModal";

import { scoreService } from "@/services/scoreService";
import { Subject } from "@/types/score";

/* ================= TYPES ================= */

interface Props {
  classId: string;
  semester: number;
  studentId: "all" | string;
  subjectId: "all" | string;

  onSemesterChange: (v: number) => void;
  onStudentChange: (v: "all" | string) => void;
  onSubjectChange: (v: "all" | string) => void;

  onPrint: () => void;
  onExportExcel: () => void;
}

/* ================= COMPONENT ================= */

export default function ScoreFilters({
  classId,
  semester,
  studentId,
  subjectId,
  onSemesterChange,
  onStudentChange,
  onSubjectChange,
  onPrint,
  onExportExcel,
}: Props) {
  /* ===== MODAL ===== */
  const [openAddScore, setOpenAddScore] = useState(false);

  /* ===== DATA ===== */
  const [semesters, setSemesters] = useState<
    { value: number; label: string }[]
  >([]);

  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [students, setStudents] = useState<
    { id: string; name: string }[]
  >([]);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    scoreService.getSemesters().then((data) =>
      setSemesters(
        data.map((s) => ({
          value: Number(s.value),
          label: s.label,
        }))
      )
    );
  }, []);

  useEffect(() => {
    scoreService.getSubjects().then(setSubjects);
  }, []);

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
        <div className="w-[200px]">
          <Select
            value={subjectId}
            onChange={onSubjectChange}
            options={[
              { value: "all", label: "Tổng quan" },
              ...subjects.map((s) => ({
                value: s.id,
                label: s.name,
              })),
            ]}
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex gap-2">
        {isOverview && (
          <Button
            icon={Plus}
            variant="primary"
            className="rounded-xl"
            onClick={() => setOpenAddScore(true)}
          >
            Nhập điểm
          </Button>
        )}

        {!isOverview && (
          <>
            <Button icon={Plus} variant="primary">
              Nhập điểm theo môn
            </Button>

            <Button icon={Upload} variant="outline">
              Đăng tải Excel
            </Button>
          </>
        )}

        <Button
          icon={Printer}
          variant="outline"
          className="rounded-xl"
          onClick={onPrint}
        >
          In bảng điểm
        </Button>

        <Button
          icon={FileDown}
          variant="outline"
          className="rounded-xl"
          onClick={onExportExcel}
        >
          Xuất Excel
        </Button>
      </div>

      {/* MODAL */}
      <AddScoreModal
        open={openAddScore}
        onClose={() => setOpenAddScore(false)}
        classId={classId}
        semester={semester}
      />
    </div>
  );
}
