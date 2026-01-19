"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { timetableService } from "@/services/timetableService";
import { useTimetablePeriods } from "@/hooks/useTimetablePeriods";
import { TimetableSettings } from "@/types/timetableSettings";

type Props = {
  open: boolean;
  classId: string;
  onClose: () => void;
};

export default function TimetableSettingsModal({
  open,
  classId,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TimetableSettings | null>(null);
  const [editData, setEditData] = useState<TimetableSettings | null>(null);

  const {
    morningPeriods,
    afternoonPeriods,
    getPeriodTime,
  } = useTimetablePeriods(editData);

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    timetableService
      .getSettings(classId)
      .then((res) => {
        setData(res);
        setEditData(res); // copy để edit
      })
      .finally(() => setLoading(false));
  }, [open, classId]);

  const updatePeriodTime = (
    period: number,
    isMorning: boolean,
    field: "startTime" | "endTime",
    value: string
  ) => {
    if (!editData) return;

    setEditData({
      ...editData,
      details: editData.details.map((d) =>
        d.periodNumber === period && d.isMorningPeriod === isMorning
          ? { ...d, [field]: value }
          : d
      ),
    });
  };

  const handleSave = async () => {
    if (!editData) return;

    try {
      setLoading(true);
      await timetableService.updateSettings(classId, editData);
      onClose();
    } catch (err) {
      console.error("Update settings failed", err);
    } finally {
      setLoading(false);
    }
  };

  // Nút thêm tiết
  const addPeriod = (isMorning: boolean) => {
    if (!editData) return;

    if (isMorning && editData.morningPeriodCount >= 10) return;
    if (!isMorning && editData.afternoonPeriodCount >= 10) return;

    const nextPeriod =
      isMorning
        ? editData.morningPeriodCount + 1
        : editData.afternoonPeriodCount + 1;

    setEditData({
      ...editData,
      morningPeriodCount: isMorning
        ? editData.morningPeriodCount + 1
        : editData.morningPeriodCount,
      afternoonPeriodCount: !isMorning
        ? editData.afternoonPeriodCount + 1
        : editData.afternoonPeriodCount,
      details: [
        ...editData.details,
        {
          periodNumber: nextPeriod,
          isMorningPeriod: isMorning,
          startTime: "00:00",
          endTime: "00:00",
        },
      ],
    });
  };

  // Nút xóa tiết
  const removePeriod = (isMorning: boolean, period: number) => {
    if (!editData) return;

    // Không cho xóa nếu chỉ còn 1 tiết
    if (isMorning && editData.morningPeriodCount <= 1) return;
    if (!isMorning && editData.afternoonPeriodCount <= 1) return;

    setEditData({
      ...editData,
      morningPeriodCount: isMorning
        ? editData.morningPeriodCount - 1
        : editData.morningPeriodCount,
      afternoonPeriodCount: !isMorning
        ? editData.afternoonPeriodCount - 1
        : editData.afternoonPeriodCount,
      details: editData.details.filter(
        (d) =>
          !(
            d.isMorningPeriod === isMorning &&
            d.periodNumber === period
          )
      ),
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Thiết lập thời khóa biểu" description="Cấu hình số tiết và khung giờ học.">
      {loading && <p className="text-sm text-gray-500">Đang tải...</p>}

      {data && (
        <div className="space-y-6">
          {/* Số tiết */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Số tiết buổi sáng</label>
              <input
                type="number"
                value={editData?.morningPeriodCount ?? 0}
                disabled
                className="mt-1 w-full rounded-lg border px-3 py-2 bg-gray-100"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Số tiết buổi chiều</label>
              <input
                type="number"
                value={editData?.afternoonPeriodCount ?? 0}
                disabled
                className="mt-1 w-full rounded-lg border px-3 py-2 bg-gray-100"
              />
            </div>
          </div>

          {/* BUỔI SÁNG */}
          <h4 className="font-semibold flex items-center justify-between">
            Khung giờ buổi sáng
            <Button
              variant="outline"
              onClick={() => addPeriod(true)}
            >
              + Thêm tiết
            </Button>
          </h4>
          <div className="space-y-2">
            {editData && morningPeriods.map((p) => {
              const time = getPeriodTime(p, true);

              return (
                <div
                  key={p}
                  className="grid grid-cols-4 gap-3 items-center"
                >
                  <span>Tiết {p}</span>

                  <input
                    type="time"
                    value={time?.start ?? "00:00"}
                    onChange={(e) =>
                      updatePeriodTime(p, true, "startTime", e.target.value)
                    }
                    className="rounded-lg border px-2 py-1 bg-gray-100"
                  />

                  <input
                    type="time"
                    value={time?.end ?? "00:00"}
                    onChange={(e) =>
                      updatePeriodTime(p, true, "endTime", e.target.value)
                    }
                    className="rounded-lg border px-2 py-1 bg-gray-100"
                  />

                  <Button
                    variant="ghost"
                    onClick={() => removePeriod(true, p)}
                    disabled={editData.morningPeriodCount <= 1}
                    className="text-red-500 font-black w-8 h-8 p-0 flex items-center justify-center justify-self-end"
                  >
                    –
                  </Button>
                </div>
              );
            })}
          </div>

          {/* BUỔI CHIỀU */}
          <h4 className="font-semibold flex items-center justify-between mt-6">
            Khung giờ buổi chiều
            <Button
              variant="outline"
              onClick={() => addPeriod(false)}
            >
              + Thêm tiết
            </Button>
          </h4>
          <div className="space-y-2">
            {editData && afternoonPeriods.map((p) => {
              const time = getPeriodTime(p, false);

              return (
                <div key={p} className="grid grid-cols-4 gap-3 items-center">
                  <span>Tiết {p}</span>

                  <input
                    type="time"
                    value={time?.start ?? "00:00"}
                    onChange={(e) =>
                      updatePeriodTime(p, false, "startTime", e.target.value)
                    }
                    className="rounded-lg border px-2 py-1 bg-gray-100"
                  />

                  <input
                    type="time"
                    value={time?.end ?? "00:00"}
                    onChange={(e) =>
                      updatePeriodTime(p, false, "endTime", e.target.value)
                    }
                    className="rounded-lg border px-2 py-1 bg-gray-100"
                  />

                  <Button
                    variant="ghost"
                    onClick={() => removePeriod(false, p)}
                    disabled={editData.afternoonPeriodCount <= 1}
                    className="text-red-500 font-black w-8 h-8 p-0 flex items-center justify-center justify-self-end"
                  >
                    –
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={onClose}>
              Hủy
            </Button>

            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!editData}
            >
              Lưu thiết lập
            </Button>
          </div>

        </div>
      )}
    </Modal>
  );
}
