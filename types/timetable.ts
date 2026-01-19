export type TimetableItem = {
  id: string;
  day: number;          // BE: Thứ 2 = 1
  period: number;       // 1 → 9
  subject: string;
  teacher: string;
  content?: string;
  isMorning: boolean;   // 👈 BẮT BUỘC
};

export interface CreateTimetablePayload {
  subject: string;
  day: number;
  period: number;
  teacher: string;
  note?: string;
  classId: string;
  isMorning: boolean;
}

export interface UpdateTimetablePayload {
  subject: string;
  teacher: string;
  note?: string;
  day: number;
  period: number;
  isMorning: boolean;
}