import { useMemo } from "react";
import { TimetableSettings } from "../types/timetableSettings";

export function useTimetablePeriods(settings: TimetableSettings | null) {
  const morningPeriods = useMemo(() => {
    if (!settings) return [];
    return Array.from(
      { length: settings.morningPeriodCount },
      (_, i) => i + 1
    );
  }, [settings]);

  const afternoonPeriods = useMemo(() => {
    if (!settings) return [];
    return Array.from(
      { length: settings.afternoonPeriodCount },
      (_, i) => i + 1
    );
  }, [settings]);

  const getPeriodTime = (
    period: number,
    isMorning: boolean
  ): { start: string; end: string } | null => {
    if (!settings) return null;

    const found = settings.details.find(
      d =>
        d.periodNumber === period &&
        d.isMorningPeriod === isMorning
    );

    if (!found) return null;

    return {
      start: found.startTime.slice(0, 5),
      end: found.endTime.slice(0, 5),
    };
  };

  return {
    morningPeriods,
    afternoonPeriods,
    getPeriodTime,
  };
}
