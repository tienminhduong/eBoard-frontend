export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  token: string;
  newPassword: string;
  confirmPassword: string;
};

export type LoginResponseDto = {
  accessToken: string;
  refreshToken: string;
};

export type RegisterTeacherRequest = {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type TeacherLoginRequest = {
  email: string;
  password: string;
};

export type ApiResponse<T> = {
  isSuccess: boolean;
  value: T | null;
  errorMessage: string | null;
};
