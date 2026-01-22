"use client";

import { useEffect, useMemo, useState } from "react";
import ActivityStats from "@/components/class/activity/ActivityStats";
import ActivityTable from "@/components/class/activity/ActivityTable";
import { activityService } from "@/services/activityService";
import { ExtracurricularActivity } from "@/types/activity";
import Button from "@/components/ui/Button";
import { FileDown, Plus } from "lucide-react";
import AddActivityModal from "@/components/class/activity/AddActivityModal";
import SearchInput from "@/components/class/activity/SearchInput";
import ActivityDetailModal from "@/components/class/activity/ActivityDetailModal";

export default function ActivityPage() {
  const classId = "27f5cded-0c8a-4aa0-a099-718ac7434a3b";

  const [activities, setActivities] =
    useState<ExtracurricularActivity[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [keyword, setKeyword] = useState("");

  const loadData = async () => {
    const res = await activityService.getActivitiesByClass(classId);
    setActivities(res);
  };

  const [selected, setSelected] = useState<ExtracurricularActivity | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  /* =======================
     FILTER THEO KEYWORD
     ======================= */
  const filteredActivities = useMemo(() => {
    if (!keyword.trim()) return activities;

    const k = keyword.toLowerCase();

    return activities.filter(a =>
      a.name.toLowerCase().includes(k) ||
      a.location.toLowerCase().includes(k) ||
      a.inChargeTeacher.toLowerCase().includes(k)
    );
  }, [activities, keyword]);

  return (
    <div className="space-y-6">
      <ActivityStats activities={filteredActivities} />

      <div className="flex justify-between items-center">
        <SearchInput
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <div className="flex gap-2">
          <Button
            icon={Plus}
            variant="primary"
            onClick={() => setOpenCreate(true)}
          >
            Tạo hoạt động
          </Button>
        </div>
      </div>

      <ActivityTable
        data={filteredActivities}
        onViewDetail={(id) => {
          const a = activities.find(x => x.id === id);
          setSelected(a || null);
        }}
        onDelete={async (id) => {
          await activityService.deleteActivity(id);
          loadData();
        }}
      />

      <ActivityDetailModal
        open={!!selected}
        activity={selected}
        classId={classId}
        onClose={() => setSelected(null)}
      />

      <AddActivityModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        classId={classId}
        onSuccess={loadData}
      />
    </div>
  );
}
