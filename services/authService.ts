// src/services/auth.service.ts
import api from "@/lib/api";

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

export const authService = {
  async parentLogin(dto: ParentLoginDto): Promise<LoginResponseDto> {
    const res = await api.post<LoginResponseDto>(
      "/auth/parent/login",
      dto
    );
    return res.data;
  },

  async teacherLogin(dto: TeacherLoginDto): Promise<LoginResponseDto> {
    const res = await api.post<LoginResponseDto>(
      "/auth/teacher/login",
      dto
    );
    return res.data;
  },
};
