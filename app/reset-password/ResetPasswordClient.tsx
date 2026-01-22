"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";

import { authService } from "@/services/authService";
import { decodeJwt } from "@/utils/jwt";

const PRIMARY = "#518581";

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") ?? "";

  useEffect(() => {
    if (!token) router.replace("/forgot-password");
  }, [token, router]);

  const decoded = useMemo(() => (token ? decodeJwt(token) : null), [token]);

  const emailFromToken =
    (decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] as
      | string
      | undefined) ||
    (decoded?.email as string | undefined) ||
    "";

  const [email, setEmail] = useState(emailFromToken);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    setEmail(emailFromToken);
  }, [emailFromToken]);

  const isPasswordMatch =
    newPassword.length > 0 && newPassword === confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!token) return;

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setErrorMsg("Vui lòng nhập đầy đủ mật khẩu mới và xác nhận mật khẩu.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setIsLoading(true);

      const msg = await authService.resetPassword({
        token,
        newPassword,
        confirmPassword,
      });

      setSuccessMsg(msg || "Đổi mật khẩu thành công. Bạn có thể đăng nhập lại.");
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Đổi mật khẩu thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) return null;

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow border border-gray-200 p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: PRIMARY }}
          >
            <LockIcon />
          </div>

          <h1 className="text-sm font-semibold text-gray-900">Đặt lại mật khẩu</h1>
          <p className="text-xs text-gray-500 mt-1">
            Nhập mật khẩu mới và xác nhận lại để hoàn tất
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg ? (
            <div className="text-xs rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {errorMsg}
            </div>
          ) : null}

          {successMsg ? (
            <div className="text-xs rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-emerald-800">
              {successMsg}
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
              placeholder="Email"
              className={clsx(
                "mt-1 w-full h-11 rounded-lg border px-4 outline-none transition focus:ring-2",
                "border-gray-200"
              )}
              style={{ ["--tw-ring-color" as any]: `${PRIMARY}33` }}
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <PasswordInput
            label="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            show={showNew}
            toggle={() => setShowNew((v) => !v)}
            primary={PRIMARY}
            disabled={isLoading}
          />

          <PasswordInput
            label="Xác nhận mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            show={showConfirm}
            toggle={() => setShowConfirm((v) => !v)}
            primary={PRIMARY}
            disabled={isLoading}
            error={
              confirmPassword.length > 0 && !isPasswordMatch
                ? "Mật khẩu xác nhận không khớp"
                : undefined
            }
          />

          <button
            type="submit"
            className={clsx(
              "w-full h-12 rounded-lg text-white font-medium transition",
              isLoading ? "opacity-70 cursor-not-allowed" : "hover:opacity-95"
            )}
            style={{ backgroundColor: PRIMARY }}
            disabled={isLoading}
          >
            {isLoading ? "Đang đổi..." : "Đổi mật khẩu"}
          </button>

          <div className="pt-2 flex items-center justify-center">
            <Link
              href="/login"
              className="text-sm flex items-center gap-2 hover:underline"
              style={{ color: PRIMARY }}
            >
              <ArrowLeftIcon />
              Quay lại đăng nhập
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}

/* ---------------- Components ---------------- */

function PasswordInput({
  label,
  show,
  toggle,
  error,
  primary,
  ...props
}: {
  label: string;
  show: boolean;
  toggle: () => void;
  error?: string;
  primary: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-sm text-gray-800">
        {label} <span className="text-amber-600">*</span>
      </label>
      <div className="relative mt-1">
        <input
          {...props}
          type={show ? "text" : "password"}
          className={clsx(
            "w-full h-11 rounded-lg border px-4 pr-12 outline-none transition focus:ring-2",
            error ? "border-red-400" : "border-gray-200"
          )}
          style={{ ["--tw-ring-color" as any]: error ? "#fecaca" : `${primary}33` }}
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-md"
          disabled={props.disabled}
          title={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          <EyeIcon />
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

/* ---------------- Icons ---------------- */

function LockIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white">
      <path
        d="M7 11V8a5 5 0 0 1 10 0v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6 11h12v10H6V11Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
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

function ArrowLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 18 9 12l6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
