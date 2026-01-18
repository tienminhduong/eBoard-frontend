import { api } from "@/lib/api";
import {
  ScoreStat,
  StudentScore,
  SubjectScore,
  ScoreDetailSummary,
  Subject,
  ScoreBySubject,
} from "@/types/score";

/* ================= SERVICE ================= */

export const scoreService = {
  /* ====== Thống kê + danh sách lớp ====== */
  async getStats(params: {
    classId: string;
    semester: number;
  }): Promise<ScoreStat[]> {
    const res = await api.get(
      `/score/${params.classId}/summary/${params.semester}`
    );

    const data = res.data;

    return [
      { label: "Xuất sắc", value: data.excellentCount, type: "excellent" },
      { label: "Giỏi", value: data.goodCount, type: "good" },
      { label: "Khá", value: data.averageCount, type: "average" },
      { label: "Yếu", value: data.poorCount, type: "weak" },
    ];
  },

  async getStudentScores(params: {
    classId: string;
    semester: number;
  }): Promise<StudentScore[]> {
    const res = await api.get(
      `/score/${params.classId}/summary/${params.semester}`
    );

    return res.data.studentScores.map((s: any) => ({
      studentId: s.studentId,
      studentName: s.studentName,
      averageScore: s.averageScore,
      grade: s.grade,
    }));
  },

  /* ====== Bảng điểm chi tiết học sinh ====== */
  async getSubjectScores(params: {
    classId: string;
    studentId: string;
    semester: number;
  }): Promise<SubjectScore[]> {
    try {
      const res = await api.get(
        `/score/${params.classId}/student/${params.studentId}/scores/${params.semester}`
      );

      return res.data.subjectScores.map((s: any) => ({
        subjectId: s.subjectId,
        subjectName: s.subjectName,
        midTermScore: s.midtermScore,
        finalTermScore: s.finalScore,
        averageScore: s.averageScore,
      }));
    } catch (err: any) {
      if (err.response?.status === 404) {
        // 👉 CHƯA CÓ BẢNG ĐIỂM → LẤY MÔN HỌC
        const subjectsRes = await api.get(
          `/score/${params.classId}/subjects`
        );

        return subjectsRes.data.map((s: any) => ({
          subjectId: s.id,
          subjectName: s.name,
          midTermScore: null,
          finalTermScore: null,
          averageScore: null,
        }));
      }

      throw err;
    }
  },

  /* ====== Tổng kết học kỳ học sinh ====== */
  async getScoreDetailSummary(params: {
    classId: string;
    studentId: string;
    semester: number;
  }): Promise<ScoreDetailSummary | null> {
    try {
      const res = await api.get(
        `/score/${params.classId}/student/${params.studentId}/scores/${params.semester}`
      );

      return {
        averageScore: res.data.averageScore,
        grade: res.data.grade,
        rank: res.data.rank,
      };
    } catch (err: any) {
      if (err.response?.status === 404) {
        // chưa có bảng điểm → hợp lệ
        return null;
      }
      throw err; // lỗi khác thì vẫn throw
    }
  },

  /* ====== Bảng điểm theo môn học ====== */
    async getScoresBySubject(params: {
      classId: string;
      subjectId: string;
      semester: number;
    }): Promise<ScoreBySubject[]> {
      const res = await api.get(
        `/score/${params.classId}/subject/${params.subjectId}/scores/${params.semester}`
      );

      return res.data.map((s: any) => ({
        studentId: s.studentId,
        studentName: s.studentName,

        midtermScore: s.midtermScore ?? null,
        finalScore: s.finalScore ?? null,
        averageScore: s.averageScore ?? null,

        grade: s.grade ?? null,
        note: s.note ?? null,
      }));
    },

/* ====== Lưu điểm theo môn học ====== */
async saveScoresBySubject(payload: {
    classId: string;
    subjectId: string;
    semester: number;
    scores: {
      studentId: string;
      midtermScore: number;
      finalScore: number;
    }[];
  }) {
    return api.put(
      `/score/${payload.classId}/subject/${payload.subjectId}/scores/${payload.semester}`,
      payload.scores
    );
  },

  /* ====== Lưu / cập nhật bảng điểm học sinh ====== */
  async saveScores(payload: {
    classId: string;
    studentId: string;
    semester: number;
    scores: {
      subjectId: string;
      midtermScore: number;
      finalScore: number;
    }[];
  }) {
    return api.put(
      `/score/${payload.classId}/student/${payload.studentId}/scores/${payload.semester}`,
      {
        subjectScores: payload.scores,
      }
    );
  },

  /* ====== Danh sách học sinh theo lớp (option) ====== */
  async getStudents(classId: string): Promise<{ id: string; name: string }[]> {
    const res = await api.get(`/students/${classId}/lists`);

    return res.data.map((s: any) => ({
      id: s.id,
      name: s.fullName,
    }));
  },

  /* ====== Môn học của lớp ====== */
  async getSubjects(classId: string): Promise<Subject[]> {
    const res = await api.get(`/score/${classId}/subjects`);

    return res.data.map((s: any) => ({
      id: s.id,
      name: s.name,
    }));
  },
};
