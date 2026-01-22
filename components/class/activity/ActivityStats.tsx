"use client";

import StatCard from "@/components/ui/StatCard";
import { Calendar, Users } from "lucide-react";
import { ExtracurricularActivity } from "@/types/activity";

export default function ActivityStats({
  activities,
}: {
  activities: ExtracurricularActivity[];
}) {
  const total = activities.length;

  const totalParticipants = activities.reduce(
    (sum, a) => sum + a.participants.length,
    0
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard
        title="Tổng hoạt động"
        value={total}
        icon={Calendar}
      />
      <StatCard
        title="Tổng lượt tham gia"
        value={totalParticipants}
        icon={Users}
        accentColor="#F59E0B"
      />
    </div>
  );
}
