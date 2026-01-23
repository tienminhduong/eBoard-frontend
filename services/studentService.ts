// src/services/student.service.ts
import api from "@/lib/api";
import { CreateStudentRequest, StudentInfoDto } from "@/types/Student";

export type StudentOptionDto = {
  id: string;
  fullName: string;
};

export const studentService = {
  // POST /api/students
  async createStudent(payload: CreateStudentRequest): Promise<StudentInfoDto> {
    const res = await api.post<StudentInfoDto>("/students", payload);
    return res.data;
  },

  // GET /api/students/{id}
  async getStudentById(id: string): Promise<StudentInfoDto> {
    const res = await api.get<StudentInfoDto>(`/students/${id}`);
    return res.data;
  },

  //update
  async updateStudent(
    id: string,
    payload: Partial<CreateStudentRequest>
  ): Promise<void> {
    await api.patch(`/students/${id}`, payload);
  },

  // GET /api/students/{classId}/lists
  async getStudentsOptionInClass(
    classId: string
  ): Promise<StudentOptionDto[]> {
    const res = await api.get<StudentOptionDto[]>(
      `/students/${classId}/lists`
    );
    return res.data;
  },
};
