// // import axios from "axios";
// // import { ScoreStat, StudentScore } from "@/types/score";

// // const API_URL = "http://localhost:8080/api/scores"; // đổi sau

// export const scoreService = {
// //   getStats: async (): Promise<ScoreStat[]> => {
// //     const res = await axios.get(`${API_URL}/stats`);
// //     return res.data;
// //   },

// //   getStudentScores: async (
// //     semester: string
// //   ): Promise<StudentScore[]> => {
// //     const res = await axios.get(`${API_URL}`, {
// //       params: { semester },
// //     });
// //     return res.data;
// //   },
//  };

import { ScoreStat, StudentScore } from "@/types/score";

/**
 * Giả lập delay gọi API
 */
const fakeDelay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * MOCK DATA
 */
const mockStats: ScoreStat[] = [
  { label: "Học sinh giỏi", value: 8, type: "excellent" },
  { label: "Học sinh khá", value: 12, type: "good" },
  { label: "Học sinh trung bình", value: 7, type: "average" },
  { label: "Cần cải thiện", value: 3, type: "weak" },
];

const mockStudents: StudentScore[] = [
  { id: 1, name: "Nguyễn Văn An", averageScore: 8.9, rank: "Giỏi" },
  { id: 2, name: "Trần Thị Bình", averageScore: 8.5, rank: "Giỏi" },
  { id: 3, name: "Lê Hoàng Minh", averageScore: 8.2, rank: "Khá" },
  { id: 4, name: "Phạm Thị Lan", averageScore: 8.6, rank: "Giỏi" },
  { id: 5, name: "Hoàng Văn Hải", averageScore: 8.9, rank: "Giỏi" },
];

/**
 * SERVICE
 */
export const scoreService = {
  getStats: async (): Promise<ScoreStat[]> => {
    await fakeDelay(500);
    return mockStats;
  },

  getStudentScores: async (
    semester: string
  ): Promise<StudentScore[]> => {
    await fakeDelay(500);

    // giả lập filter theo học kỳ
    console.log("Fetch scores for semester:", semester);

    return mockStudents;
  },
};
