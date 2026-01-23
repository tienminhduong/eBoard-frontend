// src/services/classService.ts
import { Class, ClassInfo } from "@/types/Class";
import api from "@/lib/api";

/* ===================== TYPES ===================== */
export type GradeDto = { id: string; name: string };

export type CreateClassPayload = {
  name: string;
  gradeId: string;
  startDate: string; // yyyy-mm-dd
  endDate: string;   // yyyy-mm-dd
  maxCapacity: number;
  roomName: string;
  description?: string;
};

export type TeachingClassDto = {
  id: string;
  name: string;
  gradeId?: string;
  gradeLabel?: string;
  gradeName?: string;
  grade?: { name?: string };
  roomName?: string;
  startDate?: string;
  endDate?: string;
  currentStudentCount?: number;
  maxCapacity?: number;
  description?: string;
  classDescription?: string;
};
export type PagedStudentInClassDto = {
  items?: any[];          // BE có thể đặt tên items/data/students → t để optional
  data?: any[];
  students?: any[];

  pageNumber?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;

  [key: string]: any;
};

export type TeachingClassListResponse =
  | TeachingClassDto[]
  | { items: TeachingClassDto[] }
  | { data: TeachingClassDto[] }
  | any;

/* ===================== SERVICES ===================== */
export const classService = {
  // GET /api/grades
  async getGrades(): Promise<GradeDto[]> {
    const res = await api.get<GradeDto[]>("/grades");
    return res.data;
  },

  // POST /api/classes?teacherId=...
  async createClass(
    teacherId: string,
    payload: CreateClassPayload
  ): Promise<void> {
    await api.post("/classes", payload, {
      params: { teacherId },
    });
  },

  // GET /api/classes/teaching?teacherId=...
  // get class đang dạy
  async getTeachingClasses(
    teacherId: string
  ): Promise<TeachingClassListResponse> {
    const res = await api.get<TeachingClassListResponse>(
      "/classes/teaching",
      {
        params: { teacherId },
      }
    );
    return res.data;
  },

  // GET /api/classes/{classId}
  async getClassById(classId: string): Promise<TeachingClassDto> {
    const res = await api.get<TeachingClassDto>(`/classes/${classId}`);
    return res.data;
  },

  // GET /api/classes/{classId} (ClassInfo version - kvy)
  async getClassInfoById(classId: string) {
    return api
      .get<ClassInfo>(`/classes/${classId}`)
      .then(res => res.data);
  },

  // GET /api/classes/{classId}/students - GET all
  async getStudentsByClassId(
    classId: string,
    pageNumber = 1,
    pageSize = 20
  ): Promise<PagedStudentInClassDto> {
    const res = await api.get<PagedStudentInClassDto>(
      `/classes/${classId}/students`,
      {
        params: { pageNumber, pageSize },
      }
    );
    return res.data;
  },

  //get all class
  async getAllClassesByTeacher(teacherId: string, pageNumber = 1, pageSize = 20) {
    const res = await api.get("/classes", {
      params: { teacherId, pageNumber, pageSize },
    });
    return res.data; // dạng { data: [...] }
  },

  // DELETE /api/classes/{classId}/students/{studentId}
  async removeStudentFromClass(
    classId: string,
    studentId: string
  ): Promise<void> {
    await api.delete(`/classes/${classId}/students/${studentId}`);
  },
};

