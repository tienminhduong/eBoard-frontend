"use client";

import { UserCheck, UserX, FileMinus } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import { AttendanceRecord } from "@/types/attendance";

interface Props {
  data: AttendanceRecord[];
}

export default function AttendanceStats({ data }: Props) {
  const present = data.filter(x => x.status === "Có mặt").length;
  const absentNo = data.filter(x => x.status === "Vắng không phép").length;
  const absentYes = data.filter(x => x.status === "Vắng có phép").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        title="Sĩ số"
        value={`${present}/${data.length}`}
        icon={UserCheck}
        accentColor="#6BCDB1"
      />
      <StatCard
        title="Vắng không phép"
        value={absentNo}
        icon={UserX}
        accentColor="#F87171"
      />
      <StatCard
        title="Vắng có phép"
        value={absentYes}
        icon={FileMinus}
        accentColor="#FACC15"
      />
    </div>
  );
}
