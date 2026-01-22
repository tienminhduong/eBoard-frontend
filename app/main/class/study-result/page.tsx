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
import ScoreBySubjectPrintModal from "@/components/class/score/ScoreBySubjectPrintModal";
import { exportScoreBySubjectExcel } from "@/utils/exportScoreBySubjectExcel";
import BatchStudentPrintModal from "@/components/class/score/BatchStudentPrintModal";
import SingleScorePrintModal from "@/components/class/score/BatchStudentPrintModal";
import ImportScoreExcelModal from "@/components/class/score/ImportScoreExcelModal";

export default function StudyResultPage() {
  const classId = "27f5cded-0c8a-4aa0-a099-718ac7434a3b"; // 1A

  const [semester, setSemester] = useState(1);
  const [studentId, setStudentId] = useState<"all" | string>("all");
  const [subjectId, setSubjectId] = useState<"all" | string>("all");

  const [stats, setStats] = useState<ScoreStat[]>([]);
  const [students, setStudents] = useState<StudentScore[]>([]);
  const [studentList, setStudentList] = useState<{ studentId: string; studentName: string }[]>([]);
  const [subjectScores, setSubjectScores] = useState<SubjectScore[]>([]);
  const [scoreBySubject, setScoreBySubject] = useState<ScoreBySubject[]>([]);
  const [selectedSubjectName, setSelectedSubjectName] = useState("");
  const [summary, setSummary] = useState<ScoreDetailSummary | null>(null);
  const [openPrint, setOpenPrint] = useState(false);
  const [openImportExcel, setOpenImportExcel] = useState(false);

  const isPrintAllClass = studentId === "all" && subjectId === "all";
  const isPrintBySubject = studentId === "all" && subjectId !== "all";
  const isPrintSingleStudent = studentId !== "all";

  /* ===== LOAD STATS ===== */
    useEffect(() => {
        scoreService.getStats({ classId, semester }).then(setStats);
      }, [classId, semester]);
  
    useEffect(() => {
      scoreService.getStudents(classId).then((data) => {
        setStudentList(
          data.map((s) => ({
            studentId: s.id,
            studentName: s.name,
          }))
        );
      });
    }, [classId]);

    /* ===== LOAD DATA ===== */
    useEffect(() => {
    if (!classId) return;

    // ===== Tổng quan =====
    if (studentId === "all" && subjectId === "all") {
      scoreService
        .getStudentScores({ classId, semester })
        .then(setStudents);
      return;
    }

    // ===== Theo môn (CHƯA IMPLEMENT → KHÔNG GỌI API SAI) =====
    // ===== Theo môn =====
    if (studentId === "all" && subjectId !== "all") {
      scoreService
        .getScoresBySubject({
          classId,
          subjectId,
          semester,
        })
        .then(setScoreBySubject)
        .catch(err => {
          console.error("Get score by subject failed", err);
          setScoreBySubject([]); // an toàn UI
        });

      return;
    }
    // ===== Theo học sinh (MERGE MÔN + ĐIỂM) =====
    if (studentId !== "all") {
      Promise.all([
        scoreService.getSubjects(classId), // luôn đủ môn
        scoreService
          .getSubjectScores({ classId, semester, studentId })
          .catch(() => []), // chưa có điểm → mảng rỗng
      ])
        .then(([subjects, scores]) => {
          const scoreMap = new Map(
            scores.map((s) => [s.subjectId, s])
          );

          const merged: SubjectScore[] = subjects.map((subj) => {
            const found = scoreMap.get(subj.id);

            return {
              subjectId: subj.id,
              subjectName: subj.name,
              midTermScore: found?.midTermScore ?? null,
              finalTermScore: found?.finalTermScore ?? null,
              averageScore: found?.averageScore ?? null,
            };
          });

          setSubjectScores(merged);
        })
        .catch(console.error);
    }
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

const className = classInfo.name;
const subjectName = selectedSubjectName;

  const handleExportExcel = () => {
  if (subjectId === "all") {
    exportScoreExcel(students, {
      className: classInfo.name,
      schoolYear: classInfo.Year,
      semester,
    });
  } else {
    exportScoreBySubjectExcel(scoreBySubject, {
      className: classInfo.name,
      schoolYear: classInfo.Year,
      semester,
      subjectName: selectedSubjectName,
    });
  }
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
        onSubjectChange={(subjectId, subjectName) => {
          setSubjectId(subjectId);
          setSelectedSubjectName(subjectName);
        }}
        subjectName={selectedSubjectName}
        onPrint={() => setOpenPrint(true)}
        onExportExcel={handleExportExcel}
        onImportExcel={() => setOpenImportExcel(true)}
      />

      {/* ===== IMPORT MODAL ===== */}
      {isPrintBySubject && (
        <ImportScoreExcelModal
          open={openImportExcel}
          onClose={() => setOpenImportExcel(false)}
          classId={classId}
          subjectId={subjectId as string}
          subjectName={subjectName}
          semester={semester}
          students={studentList}
          onSuccess={() => {
            scoreService
              .getScoresBySubject({
                classId,
                subjectId: subjectId as string,
                semester,
              })
              .then(setScoreBySubject);
          }}
        />
      )}

      {/* ===== PRINT MODALS ===== */}
      {isPrintAllClass && (
        <ScorePrintModal
          open={openPrint}
          onClose={() => setOpenPrint(false)}
          data={students}
          semester={semester}
          className={classInfo.name}
          schoolYear={classInfo.Year}
        />
      )}

      {isPrintBySubject && (
        <ScoreBySubjectPrintModal
          open={openPrint}
          onClose={() => setOpenPrint(false)}
          data={scoreBySubject}
          className={classInfo.name}
          schoolYear={classInfo.Year}
          semester={semester}
          subjectName={selectedSubjectName}
        />
      )}

      {isPrintSingleStudent && (
        <SingleScorePrintModal
          open={openPrint}
          onClose={() => setOpenPrint(false)}
          classId={classId}
          className={classInfo.name}
          schoolYear={classInfo.Year}
          semester={semester}
          student={{
            id: studentId,
            name:
              students.find(s => s.studentId === studentId)
                ?.studentName ?? "",
          }}
        />
      )}

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
