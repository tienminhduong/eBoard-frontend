export type ExamType = "Giữa kỳ" | "Cuối kỳ";

export type ExamSchedule = {
  id: string;
  subjectId: string;
  subjectName: string;
  type: string;          // examFormat
  date: string;          // yyyy-MM-dd
  time: string;          // HH:mm
  location?: string;
  notes?: string;
};
