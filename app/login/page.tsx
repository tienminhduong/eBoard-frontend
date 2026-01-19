"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { tokenStorage } from "@/services/tokenStorage";

const PRIMARY = "#518581";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    try {
      setIsLoading(true);

      // Login TEACHER (đúng endpoint của BE bạn: POST /api/auth/teacher/login)
      const tokens = await authService.teacherLogin({
        email: email.trim(),
        password,
      });

      // Lưu token theo remember: true -> localStorage, false -> sessionStorage
      tokenStorage.save(tokens, remember);

      router.push("/main");
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow border border-gray-200 p-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: PRIMARY }}
          >
            <CapIcon />
          </div>
          <h1 className="text-sm font-semibold text-gray-900">Đăng nhập</h1>
          <p className="text-xs text-gray-500 mt-1">
            Chào mừng giáo viên quay trở lại hệ thống quản lý lớp học
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error */}
          {errorMsg ? (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {errorMsg}
            </div>
          ) : null}

          {/* Email */}
          <div>
            <label className="text-sm text-gray-800">
              Email <span className="text-amber-600">*</span>
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập địa chỉ email"
              className={clsx(
                "mt-1 w-full h-11 rounded-lg border px-4 outline-none transition",
                "border-gray-200 focus:ring-2"
              )}
              style={{ ["--tw-ring-color" as any]: `${PRIMARY}33` }}
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-gray-800">
              Mật khẩu <span className="text-amber-600">*</span>
            </label>
            <div className="relative mt-1">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                className={clsx(
                  "w-full h-11 rounded-lg border px-4 pr-12 outline-none transition",
                  "border-gray-200 focus:ring-2"
                )}
                style={{ ["--tw-ring-color" as any]: `${PRIMARY}33` }}
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-md"
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                disabled={isLoading}
              >
                <EyeIcon />
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
                style={{ accentColor: PRIMARY }}
                disabled={isLoading}
              />
              Ghi nhớ đăng nhập
            </label>

            <button
              type="button"
              className="text-sm hover:underline"
              style={{ color: PRIMARY }}
              onClick={() => router.push("/forgot-password")}
              disabled={isLoading}
            >
              Quên mật khẩu?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={clsx(
              "w-full h-12 rounded-lg text-white font-medium transition",
              isLoading ? "opacity-70 cursor-not-allowed" : "hover:opacity-95"
            )}
            style={{ backgroundColor: PRIMARY }}
            disabled={isLoading}
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 pt-2">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="hover:underline"
              style={{ color: PRIMARY }}
            >
              Đăng ký ngay
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}

/* ------------ Icons ------------ */

function CapIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white">
      <path
        d="M12 3 2 8l10 5 10-5-10-5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M6 10.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
