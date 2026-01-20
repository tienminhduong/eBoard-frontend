// src/services/student.service.ts
import api from "@/lib/api";

export type CreateStudentRequest = {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // yyyy-mm-dd
  address: string;
  province: string;
  district: string;
  ward: string;
  gender: string;
  parentPhoneNumber: string;
  relationshipWithParent: string;
  parentFullName: string;
  parentHealthCondition: string;
  classId: string; // GUID
};

export type StudentInfoDto = {
  id: string;

  firstName?: string;
  lastName?: string;
  fullName?: string;

  dateOfBirth?: string; // yyyy-mm-dd
  address?: string;
  province?: string;
  district?: string;
  ward?: string;
  gender?: string;

  parentPhoneNumber?: string;
  relationshipWithParent?: string;
  parentFullName?: string;
  parentHealthCondition?: string;

  // BE có trả thêm field nào (email/username/password...) thì vẫn không lỗi
  [key: string]: any;
};

export type StudentOptionDto = {
  id: string;
  fullName: string;
};

export const studentService = {
  // POST /api/students
  async createStudent(payload: CreateStudentRequest): Promise<void> {
    await api.post("/students", payload);
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
