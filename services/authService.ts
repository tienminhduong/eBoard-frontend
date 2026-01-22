import api from "@/lib/api";
import type {
  ApiResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  LoginResponseDto,
  RegisterTeacherRequest,
  TeacherLoginRequest,
} from "@/types/auth";

export const authService = {
  async teacherLogin(payload: TeacherLoginRequest): Promise<LoginResponseDto> {
    const res = await api.post<ApiResponse<LoginResponseDto>>(
      "/auth/teacher/login",
      payload
    );

    // BE bọc trong isSuccess/value/errorMessage
    if (!res.data?.isSuccess || !res.data?.value) {
      throw new Error(res.data?.errorMessage || "Đăng nhập thất bại");
    }

    return res.data.value; // chỉ trả { accessToken, refreshToken }
  },

  async registerTeacher(payload: RegisterTeacherRequest): Promise<void> {
    await api.post("/auth/teacher/register", payload);
  },

  async forgotPassword(payload: ForgotPasswordRequest): Promise<string> {
    const res = await api.post("/auth/forgot-password", payload);
    // BE trả string message
    return res.data;
  },

  // BE chỉ cần token + newPassword + confirmPassword
  async resetPassword(payload: ResetPasswordRequest): Promise<string> {
    const res = await api.post("/auth/reset-password", payload);
    return res.data;
  },
};
