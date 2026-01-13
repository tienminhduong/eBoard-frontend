"use client";

import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    // sau này gọi authService
    router.push("/main");
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Đăng nhập</h2>
      <button onClick={handleLogin}>Đăng nhập</button>
    </div>
  );
}
