import { Fragment } from "react";
import { TimetableItem } from "@/types/timetable";
import TimetableCard from "./TimetableCard";

const DAYS = [
  { label: "Thứ 2", value: 1 },
  { label: "Thứ 3", value: 2 },
  { label: "Thứ 4", value: 3 },
  { label: "Thứ 5", value: 4 },
  { label: "Thứ 6", value: 5 },
];

interface Props {
  title: string;
  periods: number[];
  data: TimetableItem[];
  isMorning: boolean;
  onAdd: (day: number, period: number) => void;
  onEdit: (item: TimetableItem) => void;
  onDelete: (item: TimetableItem) => void;
  getPeriodTime?: (
    period: number,
    isMorning: boolean
  ) => { start: string; end: string } | null;
}

export default function TimetableSession({
  title,
  periods,
  data,
  isMorning,
  onAdd,
  onEdit,
  onDelete,
  getPeriodTime,
}: Props) {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-xl">{title}</h4>

      <div className="grid grid-cols-[140px_repeat(5,1fr)] gap-4">
        {/* empty corner */}
        <div />

        {/* days header */}
        {DAYS.map((d) => (
          <div
            key={d.value}
            className="text-center font-medium text-gray-700"
          >
            {d.label}
          </div>
        ))}

        {/* rows */}
        {periods.map((period) => {
          const time = getPeriodTime?.(period, isMorning);

          return (
            <Fragment key={period}>
              {/* period label */}
              <div className="space-y-1 flex flex-col items-center justify-center">
                <div className="font-medium text-gray-700">
                  Tiết {period}
                </div>

                {time && (
                  <div className="text-sm text-gray-400">
                    {time.start} – {time.end}
                  </div>
                )}
              </div>

              {/* day cells */}
              {DAYS.map((day) => {
                const lesson = data.find(
                  (l) =>
                    l.day === day.value &&
                    l.period === period
                );

                return (
                  <div
                    key={day.value}
                    className="
                      min-h-[96px]
                      rounded-2xl
                      border
                      border-gray-200
                      bg-white
                      cursor-pointer
                    "
                    onClick={() => {
                      if (!lesson) onAdd(day.value, period);
                    }}
                  >
                    {lesson ? (
                      <TimetableCard
                        item={lesson}
                        onEdit={() => onEdit(lesson)}
                        onDelete={() => onDelete(lesson)}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-gray-300 italic">
                        Trống
                      </div>
                    )}
                  </div>
                );
              })}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
