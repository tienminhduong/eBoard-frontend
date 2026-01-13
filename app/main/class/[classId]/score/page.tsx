"use client";

import { useEffect, useState } from "react";
import ScoreStats from "@/components/class/score/ScoreStats";
import ScoreFilters from "@/components/class/score/ScoreFilters";
import ScoreTable from "@/components/class/score/ScoreTable";
import { scoreService } from "@/services/scoreService";
import { ScoreStat, StudentScore } from "@/types/score";

export default function ScorePage() {
  const [semester, setSemester] = useState("1");
  const [stats, setStats] = useState<ScoreStat[]>([]);
  const [students, setStudents] = useState<StudentScore[]>([]);

  useEffect(() => {
    scoreService.getStats().then(setStats);
    scoreService.getStudentScores(semester).then(setStudents);
  }, [semester]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">
          Theo dõi kết quả học tập
        </h1>
        <p className="text-sm text-gray-500">
          Quản lý và theo dõi kết quả học tập của học sinh
        </p>
      </div>

      <ScoreStats stats={stats} />
      <ScoreFilters
        semester={semester}
        onSemesterChange={setSemester}
      />
      <ScoreTable data={students} />
    </div>
  );
}
