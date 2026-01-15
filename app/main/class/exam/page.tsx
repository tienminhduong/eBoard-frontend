"use client";

import { useEffect, useState } from "react";
import ScoreStats from "@/components/class/score/ScoreStats";
import ScoreFilters from "@/components/class/score/ScoreFilters";
import ScoreTable from "@/components/class/score/ScoreTable";
import ScoreDetailTable from "@/components/class/score/ScoreDetailTable";
import ScoreBySubjectTable from "@/components/class/score/ScoreBySubjectTable";

import { scoreService } from "@/services/scoreService";
import {
  ScoreBySubject,
  ScoreDetailSummary,
  ScoreStat,
  StudentScore,
  SubjectScore,
} from "@/types/score";
import ScorePrintModal from "@/components/class/score/ScorePrintModal";
import { exportScoreExcel } from "@/utils/exportScoreExcel";

export default function StudyResultPage() {
  const classId = "b7f3b2c2-4e1a-4e8f-9d9c-123456789abc";

  const [semester, setSemester] = useState(1);
  const [studentId, setStudentId] = useState<"all" | string>("all");
  const [subjectId, setSubjectId] = useState<"all" | string>("all");

  const [stats, setStats] = useState<ScoreStat[]>([]);
  const [students, setStudents] = useState<StudentScore[]>([]);
  const [subjectScores, setSubjectScores] = useState<SubjectScore[]>([]);
  const [scoreBySubject, setScoreBySubject] = useState<ScoreBySubject[]>([]);

  const [summary, setSummary] = useState<ScoreDetailSummary | null>(null);
  const [openPrint, setOpenPrint] = useState(false);

  /* ===== LOAD STATS ===== */
  useEffect(() => {
    scoreService.getStats({ classId, semester }).then(setStats);
  }, [classId, semester]);

  /* ===== LOAD DATA ===== */
  useEffect(() => {
    // Tổng quan
    if (studentId === "all" && subjectId === "all") {
      scoreService
        .getStudentScores({ classId, semester })
        .then(setStudents);
      return;
    }

    // Theo môn
    if (studentId === "all" && subjectId !== "all") {
      scoreService
        .getScoreBySubject({ classId, semester, subjectId })
        .then(setScoreBySubject);
      return;
    }

    // Theo học sinh
    scoreService
      .getSubjectScores({ classId, semester, studentId })
      .then(setSubjectScores);
  }, [classId, semester, studentId, subjectId]);

  /* ===== SUMMARY ===== */
  useEffect(() => {
    if (studentId === "all") return;

    scoreService
      .getScoreDetailSummary({ classId, semester, studentId })
      .then(setSummary);
  }, [classId, semester, studentId]);

  const classInfo = {
    id: classId,
    name: "10A1",
    Year: "2024 - 2025",
  };

  const handleExportExcel = () => {
    exportScoreExcel(students, {
      className: classInfo.name,
      schoolYear: classInfo.Year,
      semester,
    });
  };

  return (
    <div className="space-y-6">
      <ScoreStats stats={stats} />

      <ScoreFilters
        classId={classId}
        semester={semester}
        studentId={studentId}
        subjectId={subjectId}
        onSemesterChange={setSemester}
        onStudentChange={(v) => {
          setStudentId(v);
          setSubjectId("all");
        }}
        onSubjectChange={setSubjectId}
        onPrint={() => setOpenPrint(true)}
        onExportExcel={handleExportExcel}
      />

      <ScorePrintModal
        open={openPrint}
        onClose={() => setOpenPrint(false)}
        data={students}
        semester={semester}
        className={classInfo.name}
        schoolYear={classInfo.Year}
      />

      {/* ===== TABLE ===== */}
      {studentId === "all" ? (
        subjectId === "all" ? (
          <ScoreTable
            data={students}
            classId={classId}
            semester={semester}
          />
        ) : (
          <ScoreBySubjectTable data={scoreBySubject} />
        )
      ) : (
        <ScoreDetailTable
          data={subjectScores}
          summary={summary}
        />
      )}
    </div>
  );
}
