import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: 40 }}>
      <h1>eBoard - Hệ thống quản lý học sinh tiểu học</h1>
      <Link href="/login">👉 Đăng nhập</Link>
    </main>
  );
}
