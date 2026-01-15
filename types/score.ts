// --- ENUM ---
export type Grade =
  | "Xuất sắc"
  | "Giỏi"
  | "Khá"
  | "Trung bình"
  | "Yếu";
// --- THỐNG KÊ ---
export interface ScoreStat {
  label: Grade;
  value: number;
  type: "excellent" | "good" | "average" | "weak";
}

// --- DANH SÁCH HỌC SINH TRONG LỚP ---
export interface StudentScore {
  studentId: string;
  studentName: string;
  averageScore: number;
  grade: Grade;
}

// --- ĐIỂM CHI TIẾT THEO MÔN ---
export interface SubjectScore {
  subjectId: string;
  subjectName: string;
  midTermScore: number | null;
  finalTermScore: number | null;
  averageScore: number | null;
}


// --- SCORE SHEET (tổng kết học kỳ của 1 học sinh) ---
export interface ScoreDetailSummary {
  averageScore?: number;  // Điểm trung bình chung
  grade?: Grade;          // Xếp loại
  rank?: number;         // Xếp hạng (optional – nếu BE có)
}

export interface Subject {
  id: string;   // SUBJECT.Id (guid)
  name: string; // SUBJECT.Name
}

export interface ScoreBySubject {
  studentId: string;
  studentName: string;
  subjectId: string;

  midtermScore: number | null;
  finalScore: number | null;

  averageScore: number | null; // ← BE tính
  grade: Grade | null;         // ← BE tính
  note?: string;
}




