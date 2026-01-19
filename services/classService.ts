// src/services/classService.ts
const API_BASE = "https://localhost:7206";

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
async function parseError(res: Response) {
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    return json?.message || json?.title || text || `HTTP ${res.status}`;
  } catch {
    return text || `HTTP ${res.status}`;
  }
}

export type TeachingClassListResponse =
  | TeachingClassDto[]
  | { items: TeachingClassDto[] }
  | { data: TeachingClassDto[] }
  | any;

async function readError(res: Response) {
  const text = await res.text().catch(() => "");
  return text || `Request failed with status ${res.status}`;
}

export const classService = {
  async getGrades(): Promise<GradeDto[]> {
    const res = await fetch(`${API_BASE}/api/grades`, { method: "GET" });
    if (!res.ok) throw new Error(await readError(res));
    return (await res.json()) as GradeDto[];
  },

  async createClass(teacherId: string, payload: CreateClassPayload): Promise<void> {
    const url = `${API_BASE}/api/classes?teacherId=${encodeURIComponent(teacherId)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await readError(res));
  },

  // ✅ thêm: GET /api/classes/teaching?teacherId=...
  async getTeachingClasses(teacherId: string): Promise<TeachingClassListResponse> {
    const url = `${API_BASE}/api/classes/teaching?teacherId=${encodeURIComponent(teacherId)}`;
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) throw new Error(await readError(res));
    return (await res.json()) as TeachingClassListResponse;
  },

  // ✅ thêm: GET /api/classes/{classId}
  async getClassById(classId: string): Promise<TeachingClassDto> {
    const url = `${API_BASE}/api/classes/${encodeURIComponent(classId)}`;
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) throw new Error(await readError(res));
    return (await res.json()) as TeachingClassDto;
  },

  //get all students
  async getStudentsByClassId(
  classId: string,
  pageNumber: number = 1,
  pageSize: number = 20
): Promise<PagedStudentInClassDto> {
  const url =
    `${API_BASE}/api/classes/${classId}/students` +
    `?pageNumber=${pageNumber}&pageSize=${pageSize}`;

  const res = await fetch(url, { method: "GET" });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed (${res.status})`);
  }

  return (await res.json()) as PagedStudentInClassDto;
},

//delete student
async removeStudentFromClass(classId: string, studentId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/classes/${classId}/students/${studentId}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error(await parseError(res));
  },
};
