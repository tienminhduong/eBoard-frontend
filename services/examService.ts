import { ExamSchedule, ExamType } from "@/types/exam";
import api from "@/lib/api";

export const examService = {
  // Tạo lịch thi
  create: (data: {
    classId: string;
    subjectId: string;
    examFormat: string;
    location?: string;
    startTime: string;
    notes?: string;
  }) => api.post("/exams-schedule", data),

  // Lấy lịch thi theo lớp với các tham số lọc
  getByClass: (
    classId: string,
    params?: {
      from?: string;
      to?: string;
      subjectId?: string;
      examFormat?: string;
    }
  ) =>
    api.get(`/exams-schedule/classes/${classId}`, {
      params: {
        From: params?.from,
        To: params?.to,
        SubjectId: params?.subjectId,
        ExamFormat: params?.examFormat,
      },
    }),

  // Cập nhật lịch thi
  updateExam(
    examScheduleId: string,
    payload: {
      subjectId?: string;
      examFormat?: ExamType;
      location?: string;
      startTime?: string;
      notes?: string;
    }
  ) {
    return api.put(`/exams-schedule/${examScheduleId}`, payload);
  },

  // Xoá lịch thi
  deleteExam(id: string) {
    return api.delete(`/exams-schedule/${id}`);
  },

  // Lấy thống kê lịch thi theo lớp
  getStatsByClass(classId: string) {
    return api.get(
      `/exams-schedule/classes/${classId}/stats`
    );
  }
};
