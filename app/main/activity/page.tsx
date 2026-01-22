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
import { useRouter } from "next/navigation";
import { teacherSession } from "@/services/teacherSession";

export default function ActivityPage() {
  const router = useRouter();

  const [classId, setClassId] = useState<string | null>(null);

  const [activities, setActivities] =
    useState<ExtracurricularActivity[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [keyword, setKeyword] = useState("");

  // ✅ lấy classId theo teacherId
  useEffect(() => {
    const teacherId = teacherSession.getTeacherId();

    if (!teacherId) {
      router.replace("/");
      return;
    }

    const saved = localStorage.getItem(`selectedClassId_${teacherId}`);

    if (!saved) {
      router.replace("/main/my-classes");
      return;
    }

    setClassId(saved);
  }, [router]);

  const loadData = async (classId: string) => {
    const res = await activityService.getActivitiesByClass(classId);
    setActivities(res);
  };

  const [selected, setSelected] = useState<ExtracurricularActivity | null>(null);

  useEffect(() => {
    if (!classId) return;
    loadData(classId);
  }, [classId]);

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

  // loading lúc chưa có classId
  if (!classId) {
    return <div className="p-6 text-gray-500">Đang tải lớp đã chọn...</div>;
  }

  return (
    <div className="space-y-6">
      {/* ===== TITLE ===== */}
      <div>
        <h2 className="text-xl font-semibold">Hoạt động ngoại khóa</h2>
        <p className="text-sm text-gray-400">
          Quản lý và theo dõi các hoạt động ngoại khóa của lớp
        </p>
      </div>
      
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
          await loadData(classId);
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
        onSuccess={() => loadData(classId)}
      />
    </div>
  );
}
