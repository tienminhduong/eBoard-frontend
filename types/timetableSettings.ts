export type PeriodSetting = {
  periodNumber: number;
  isMorningPeriod: boolean;
  startTime: string;
  endTime: string;
};

export type TimetableSettings = {
  id: string;
  morningPeriodCount: number;
  afternoonPeriodCount: number;
  details: PeriodSetting[];
};
