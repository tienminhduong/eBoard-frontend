import {
  ScoreStat,
  StudentScore,
  SubjectScore,
  ScoreDetailSummary,
  Subject,
  ScoreBySubject,
} from "@/types/score";

/* ================= FAKE DELAY ================= */
const fakeDelay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/* ================= MOCK DATA ================= */

/* ---- Thống kê lớp ---- */
const mockStats: ScoreStat[] = [
  { label: "Xuất sắc", value: 5, type: "excellent" },
  { label: "Giỏi", value: 10, type: "good" },
  { label: "Khá", value: 8, type: "average" },
  { label: "Yếu", value: 2, type: "weak" },
];
/* ---- Danh sách môn học ---- */
const mockSubjects: Subject[] = [
  { id: "sub-1", name: "Toán" },
  { id: "sub-2", name: "Ngữ văn" },
  { id: "sub-3", name: "Tiếng Anh" },
];

interface GetScoreBySubjectParams {
  classId: string;
  semester: number;
  subjectId: string;
}
/* ---- Danh sách học sinh + điểm TB ---- */
const mockStudentScoresByClass: Record<
  string,
  StudentScore[]
> = {
  "b7f3b2c2-4e1a-4e8f-9d9c-123456789abc": [
    {
      studentId: "stu-1",
      studentName: "Nguyễn Văn An",
      averageScore: 8.9,
      grade: "Giỏi",
    },
    {
      studentId: "stu-2",
      studentName: "Trần Thị Bình",
      averageScore: 7.8,
      grade: "Khá",
    },
  ],
};

/* ---- Học kỳ ---- */
const mockSemesters = [
  { value: 1, label: "Học kỳ 1" },
  { value: 2, label: "Học kỳ 2" },
];

/* ---- Học sinh theo lớp ---- */
const mockStudentsByClass: Record<
  string,
  { id: string; name: string }[]
> = {
  "b7f3b2c2-4e1a-4e8f-9d9c-123456789abc": [
    { id: "stu-1", name: "Nguyễn Văn An" },
    { id: "stu-2", name: "Trần Thị Bình" },
  ],
};

/* ---- Điểm chi tiết theo môn ---- */
const mockSubjectScores: SubjectScore[] = [
  {
    subjectId: "sub-1",
    subjectName: "Toán",
    midTermScore: 9,
    finalTermScore: 8,
    averageScore: 8.5,
  },
  {
    subjectId: "sub-2",
    subjectName: "Tiếng Việt",
    midTermScore: 7,
    finalTermScore: 8,
    averageScore: 7.5,
  },
  {
    subjectId: "sub-3",
    subjectName: "Tiếng Anh",
    midTermScore: null,
    finalTermScore: null,
    averageScore: null,
  },
];

const MOCK_SCORE_BY_SUBJECT: ScoreBySubject[] = [
  {
    studentId: "stu-1",
    studentName: "Nguyễn Văn An",
    subjectId: "sub-1",
    midtermScore: 8.0,
    finalScore: 8.0,
    averageScore: 8.0,
    grade: "Giỏi",
    note: "",
  },
  {
    studentId: "stu-2",
    studentName: "Trần Thị Bình",
    subjectId: "sub-1",
    midtermScore: 8.0,
    finalScore: 8.0,
    averageScore: 8.0,
    grade: "Giỏi",
    note: "",
  },
  {
    studentId: "stu-3",
    studentName: "Lê Minh Châu",
    subjectId: "sub-1",
    midtermScore: 9.0,
    finalScore: 8.0,
    averageScore: 9.0,
    grade: "Giỏi",
    note: "Học tốt",
  },
];

/* ================= SERVICE ================= */

export const scoreService = {
  /* ====== Thống kê lớp ====== */
  getStats: async (params: {
    classId: string;
    semester: number;
  }): Promise<ScoreStat[]> => {
    await fakeDelay(300);
    console.log("Fetch stats:", params);
    return mockStats;
  },

  /* ====== Danh sách điểm cả lớp ====== */
  getStudentScores: async (params: {
    classId: string;
    semester: number;
  }): Promise<StudentScore[]> => {
    await fakeDelay(400);
    console.log("Fetch class scores:", params);
    return mockStudentScoresByClass[params.classId] ?? [];
  },

  /* ====== Dropdown ====== */
  getSemesters: async (): Promise<
    { value: number; label: string }[]
  > => {
    await fakeDelay(200);
    return mockSemesters;
  },

  getStudents: async (
    classId: string
  ): Promise<{ id: string; name: string }[]> => {
    await fakeDelay(300);
    return mockStudentsByClass[classId] ?? [];
  },

  /* ====== Điểm chi tiết học sinh ====== */
  getSubjectScores: async (params: {
    classId: string;
    semester: number;
    studentId: string;
  }): Promise<SubjectScore[]> => {
    await fakeDelay(400);
    console.log("Fetch student detail:", params);
    return mockSubjectScores;
  },

getScoreBySubject: async (
  params: GetScoreBySubjectParams
): Promise<ScoreBySubject[]> => {
  await fakeDelay(400);
  console.log("Fetch score by subject:", params);

  return MOCK_SCORE_BY_SUBJECT.filter(
    (s) => s.subjectId === params.subjectId
  );
},

/* ====== Lưu điểm theo môn ====== */
saveScoresBySubject: async (payload: {
  classId: string;
  semester: number;
  subjectId: string;
  scores: {
    studentId: string;
    midtermScore: number | null;
    finalScore: number | null;
    note?: string;
  }[];
}) => {
  await fakeDelay(500);

  console.log("SAVE SCORE BY SUBJECT:", payload);

  // MOCK success
  return { success: true };
},


  /* ====== Lưu điểm ====== */
  saveScores: async (payload: {
    studentId: string;
    semester: number;
    scores: {
      subjectId: string;
      score: number | null;
    }[];
  }) => {
    await fakeDelay(500);
    console.log("SAVE SCORE:", payload);
    return { success: true };
  },

  /* ====== Tổng kết học kỳ của 1 học sinh ====== */
  getScoreDetailSummary: async (params: {
    classId: string;
    semester: number;
    studentId: string;
  }): Promise<ScoreDetailSummary> => {
    await fakeDelay(300);
    console.log("Fetch score summary:", params);

    // MOCK DATA
    return {
      averageScore: 8.1,
      grade: "Giỏi",
      rank: 2,
    };
  },

  getSubjects: async (): Promise<Subject[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockSubjects), 300);
    });
  },
  
};


