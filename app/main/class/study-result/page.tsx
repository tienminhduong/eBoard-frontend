"use client";

import { useEffect, useState } from "react";
import ScoreStats from "@/components/class/score/ScoreStats";
import ScoreFilters from "@/components/class/score/ScoreFilters";
import ScoreTable from "@/components/class/score/ScoreTable";
import ScoreDetailTable from "@/components/class/score/ScoreDetailTable";
import { scoreService } from "@/services/scoreService";
import {
  ScoreDetailSummary,
  ScoreStat,
  StudentScore,
  SubjectScore,
} from "@/types/score";
import ScorePrintModal from "@/components/class/score/ScorePrintModal";
import { exportScoreExcel } from "@/utils/exportScoreExcel";

export default function StudyResultPage() {
  // TODO: lấy từ route params
  const classId = "b7f3b2c2-4e1a-4e8f-9d9c-123456789abc"; // GUID

  const [semester, setSemester] = useState<number>(1);
  const [studentId, setStudentId] = useState<"all" | string>("all");
  const [subjectId, setSubjects] = useState<"all" | string>("all");
  const [stats, setStats] = useState<ScoreStat[]>([]);
  const [students, setStudents] = useState<StudentScore[]>([]);
  const [subjectScores, setSubjectScores] = useState<SubjectScore[]>([]);

  const [openPrint, setOpenPrint] = useState(false);


  const [summary, setSummary] =
  useState<ScoreDetailSummary | null>(null);


  /* ===== LOAD STATS ===== */
  useEffect(() => {
    scoreService
      .getStats({
        classId,
        semester,
      })
      .then(setStats);
  }, [classId, semester]);

  /* ===== LOAD DATA ===== */
  useEffect(() => {
    if (studentId === "all") {
      scoreService
        .getStudentScores({
          classId,
          semester,
        })
        .then(setStudents);
      return;
    }
    
    scoreService
      .getSubjectScores({
        classId,
        semester,
        studentId,
      })
      .then(setSubjectScores);
  }, [classId, semester, studentId]);

  useEffect(() => {
    if (studentId === "all") return;

    scoreService
      .getScoreDetailSummary({
        classId,
        semester,
        studentId,
      })
      .then(setSummary);
  }, [classId, semester, studentId]);

  const mockClassInfo = {
  id: "b7f3b2c2-4e1a-4e8f-9d9c-123456789abc",
  name: "10A1",
  Year: "2024 - 2025",
  };
  const classInfo = mockClassInfo;
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
        onStudentChange={setStudentId}
        onPrint={() => setOpenPrint(true)}
         onExportExcel={handleExportExcel}
        onSubjectChange={() => {}}  
      />

      <ScorePrintModal
        open={openPrint}
        onClose={() => setOpenPrint(false)}
        data={students}       // ✅ StudentScore[]
        semester={semester}
        className={classInfo.name}
        schoolYear={classInfo.Year}        
      />

      {studentId === "all" ? (
        <ScoreTable data={students} classId={classId} semester={semester} />
      ) : (
        <ScoreDetailTable
          data={subjectScores}
          summary={summary}
        />
      )}
    </div>
  );
}
