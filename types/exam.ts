export type Subject = "Toán" | "Tiếng Việt" | "Tiếng Anh" | "Khoa học";

export type ExamType = "Giữa kỳ" | "Cuối kỳ";

export interface ExamSchedule {
  id: string;
  subject: Subject;
  type: ExamType;
  date: string;        // 2025-11-24
  time: string;        // 08:00
  content: string;     // Chương 1, 2
}
