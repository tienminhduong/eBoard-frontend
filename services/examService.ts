import { ExamSchedule } from "@/types/exam";

export const examService = {
  getExamSchedules: async (): Promise<ExamSchedule[]> => {
    // mock API delay
    await new Promise((r) => setTimeout(r, 500));

    return [
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
        date: "2025-11-27",
        time: "08:00",
        content: "Chương 1, 2",
      },
      {
        id: "5",
        subject: "Toán",
        type: "Giữa kỳ",
        date: "2025-11-28",
        time: "10:00",
        content: "Hình học",
      },
    ];
  },
};
