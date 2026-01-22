// types/attendance.ts
// types/attendance.ts

export type AttendanceStatus =
  | "Có mặt"
  | "Vắng không phép"
  | "Vắng có phép";

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  absenceReason: string;
  pickupPerson: string;
  notes: string;
}

export interface AttendanceInfoByClass {
  classId: string;
  className: string;
  date: string; // yyyy-MM-dd
  attendances: AttendanceRecord[];
}

export interface CreateAttendanceDto {
  classId: string;
  date: string;
}

export interface PatchAttendanceDto {
  status?: AttendanceStatus;
  absenceReason?: string;
  pickupPerson?: string;
  notes?: string;
}

// constants/pickupPeople.ts
export const PICKUP_PEOPLE = [
  "Bố",
  "Mẹ",
  "Ông",
  "Bà",
  "Anh",
  "Chị",
];

