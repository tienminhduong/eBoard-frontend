import { ExamSchedule } from "@/types/exam";

/**
 * MOCK DATABASE (in-memory)
 * Giữ dữ liệu trong suốt vòng đời app
 */
let mockExamSchedules: ExamSchedule[] = [
  {
    id: "1",
    subject: "Toán",
    type: "Giữa kỳ",
    date: "2025-11-24",
    time: "08:00",
    content: "Chương 1, 2",
  },
  {
    id: "2",
    subject: "Tiếng Việt",
    type: "Giữa kỳ",
    date: "2025-11-25",
    time: "08:00",
    content: "Tập làm văn",
  },
  {
    id: "3",
    subject: "Tiếng Anh",
    type: "Giữa kỳ",
    date: "2025-11-26",
    time: "08:00",
    content: "Unit 1-3",
  },
  {
    id: "4",
    subject: "Khoa học",
    type: "Giữa kỳ",
    date: "2026-01-15",
    time: "08:00",
    content: "Chương 1, 2",
  },
  {
    id: "5",
    subject: "Toán",
    type: "Giữa kỳ",
    date: "2026-01-15",
    time: "10:00",
    content: "Hình học",
  },
];

export const examService = {
  getExamSchedules: async (): Promise<ExamSchedule[]> => {
    await new Promise((r) => setTimeout(r, 300));
    return [...mockExamSchedules];
  },
  
  updateExam: async (
    id: string,
    payload: Partial<ExamSchedule>
  ): Promise<ExamSchedule> => {
    await new Promise((r) => setTimeout(r, 300));

    const index = mockExamSchedules.findIndex((e) => e.id === id);

    if (index === -1) {
      throw new Error("Exam not found");
    }

    mockExamSchedules[index] = {
      ...mockExamSchedules[index],
      ...payload,
    };

    return mockExamSchedules[index];
  },
};
