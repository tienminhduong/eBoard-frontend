export interface ScoreStat {
  label: string;
  value: number;
  type: "excellent" | "good" | "average" | "weak";
}

export interface StudentScore {
  id: number;
  name: string;
  averageScore: number;
  rank: "Giỏi" | "Khá" | "Trung bình" | "Yếu";
}
