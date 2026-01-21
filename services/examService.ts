import { ExamSchedule, ExamType } from "@/types/exam";
import axios from "@/lib/api";

export const examService = {
  // Tạo lịch thi
  create: (data: {
    classId: string;
    subjectId: string;
    examFormat: string;
    location?: string;
    startTime: string;
    notes?: string;
  }) => axios.post("/exams-schedule", data),

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
    axios.get(`/exams-schedule/classes/${classId}`, {
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
    return axios.put(`/exams-schedule/${examScheduleId}`, payload);
  },

  // Xoá lịch thi
  deleteExam(id: string) {
    return axios.delete(`/exams-schedule/${id}`);
  },
};
