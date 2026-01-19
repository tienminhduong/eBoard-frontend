// src/services/student.service.ts

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

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "https://localhost:7206";

async function throwIfNotOk(res: Response) {
  if (res.ok) return;
  const text = await res.text().catch(() => "");
  throw new Error(text || `Request failed (${res.status})`);
}

export const studentService = {
  // POST /api/students
  async createStudent(payload: CreateStudentRequest): Promise<void> {
    const res = await fetch(`${API_BASE}/api/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    await throwIfNotOk(res);
  },

  // GET /api/students/{id}
  async getStudentById(id: string): Promise<StudentInfoDto> {
    const res = await fetch(`${API_BASE}/api/students/${id}`, {
      method: "GET",
    });

    await throwIfNotOk(res);
    return (await res.json()) as StudentInfoDto;
  },

  //update
  async updateStudent(id: string, payload: any) {
    const res = await fetch(`${API_BASE}/api/students/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
  },

  // GET /api/students/{classId}/lists
  async getStudentsOptionInClass(classId: string): Promise<StudentOptionDto[]> {
    const res = await fetch(`${API_BASE}/api/students/${classId}/lists`, {
      method: "GET",
    });

    await throwIfNotOk(res);
    return (await res.json()) as StudentOptionDto[];
  },
};
