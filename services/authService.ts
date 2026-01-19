// src/services/auth.service.ts
export type LoginResponseDto = {
  accessToken: string;
  refreshToken: string;
};

export type ParentLoginDto = {
  email: string;
  password: string;
};

export type TeacherLoginDto = {
  email: string;
  password: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:5000"; // sửa port theo BE

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  // cố gắng parse error message nếu BE trả text/json
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const text = await res.text();
      msg = text ? `${msg}: ${text}` : msg;
    } catch {}
    throw new Error(msg);
  }

  return (await res.json()) as T;
}

export const authService = {
  parentLogin(dto: ParentLoginDto) {
    return postJson<LoginResponseDto>(`${API_BASE}/api/auth/parent/login`, dto);
  },
  teacherLogin(dto: TeacherLoginDto) {
    return postJson<LoginResponseDto>(`${API_BASE}/api/auth/teacher/login`, dto);
  },
};
