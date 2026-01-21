"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import TimetableSession from "@/components/timetable/TimetableSession";
import { TimetableItem } from "@/types/timetable";
import { timetableService } from "@/services/timetableService";
import { Calendar, Plus, Settings, Upload } from "lucide-react";
import AddTimetableModal from "@/components/timetable/AddTimetableModal";
import TimetableDetailModal from "@/components/timetable/TimetableDetailModal";
import TimetableSettingsModal from "@/components/timetable/TimetableSettingModal";
import { useTimetablePeriods } from "@/hooks/useTimetablePeriods";
import { TimetableSettings } from "@/types/timetableSettings";

const CLASS_ID = "04598b0c-3d9f-4519-8581-dadee7db189a";

export default function TimetablePage() {
  const [data, setData] = useState<TimetableItem[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TimetableItem | null>(null);
  const [settings, setSettings] = useState<TimetableSettings | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [prefill, setPrefill] = useState<{
    day?: number;
    period?: number;
    isMorning?: boolean;
  }>();

  const {
    morningPeriods,
    afternoonPeriods,
    getPeriodTime,
  } = useTimetablePeriods(settings);

  const fetchData = () => {
    timetableService
      .getByClassId(CLASS_ID)
      .then(setData)
      .catch(console.error);
  };
  const fetchSettings = () => {
  timetableService
    .getSettings(CLASS_ID)
    .then(setSettings)
    .catch(console.error);
};

  useEffect(() => {
    fetchData();
    fetchSettings();
  }, []);

  // Xóa tiết học
  const handleDelete = async (item: TimetableItem) => {
    if (!confirm("Bạn có chắc muốn xóa tiết học này không?")) return;

    try {
      await timetableService.deleteTimetable(item.id);
      fetchData();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Thời khóa biểu</h2>
        <p className="text-sm text-gray-400">
          Quản lý và xem thời khóa biểu các tiết học trong tuần
        </p>
      </div>

      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button icon={Calendar} variant="primary">Lịch tuần</Button>
        </div>

        <div className="flex gap-2">
          <Button
            icon={Settings}
            variant="outline"
            className="bg-white"
            onClick={() => setOpenSettings(true)}
          >
            Thiết lập
          </Button>

          <Button icon={Upload} variant="outline" className="bg-white" onClick={() => {}}>
            Đăng tải Excel
          </Button>

          <Button
            icon={Plus}
            variant="primary"
            onClick={() => {
              setPrefill(undefined);
              setOpenAdd(true);
            }}
          >
            Thêm tiết học
          </Button>
        </div>
      </div>

      <AddTimetableModal
        open={openAdd}
        classId={CLASS_ID}
        prefill={prefill}
        onClose={() => {
          setOpenAdd(false);
          setPrefill(undefined);
        }}
        onCreated={fetchData}
      />
      <TimetableSettingsModal
        open={openSettings}
        classId={CLASS_ID}
        onClose={() => setOpenSettings(false)}
        onUpdated={() => {
          fetchSettings();
          fetchData(); 
        }}
      />

      <div className="bg-white rounded-3xl p-6 shadow-sm border space-y-8">
        <TimetableSession
          title={`Buổi sáng (${morningPeriods.length} tiết)`}
          periods={morningPeriods}
          data={data.filter(d => d.isMorning)}
          isMorning
          getPeriodTime={(p) => getPeriodTime(p, true)}
          onAdd={(day, period) => {
            setPrefill({ day, period, isMorning: true });
            setOpenAdd(true);
          }}
          onEdit={(item) => {
            setSelectedItem(item);
            setOpenDetail(true);
          }}
          onDelete={handleDelete}
        />

        <TimetableSession
          title={`Buổi chiều (${afternoonPeriods.length} tiết)`}
          periods={afternoonPeriods}
          data={data.filter(d => !d.isMorning)}
          isMorning={false}
          getPeriodTime={(p) => getPeriodTime(p, false)}
          onAdd={(day, period) => {
            setPrefill({ day, period, isMorning: false });
            setOpenAdd(true);
          }}
          onEdit={(item) => {
            setSelectedItem(item);
            setOpenDetail(true);
          }}
          onDelete={handleDelete}
        />

        <TimetableDetailModal
          open={openDetail}
          item={selectedItem}
          classId={CLASS_ID}
          onClose={() => {
            setOpenDetail(false);
            setSelectedItem(null);
          }}
          onUpdated={fetchData}
        />
      </div>
    </div>
  );
}
