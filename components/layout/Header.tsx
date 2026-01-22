"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { teacherService } from "@/services/teacherService";
import { teacherSession } from "@/services/teacherSession";
import { tokenStorage } from "@/services/tokenStorage";
import type { TeacherInfo } from "@/types/teacher";

export default function Header() {
  const router = useRouter();

  const [teacher, setTeacher] = useState<TeacherInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadTeacher() {
      try {
        const teacherId = teacherSession.getTeacherId();
        if (!teacherId) {
          if (mounted) setTeacher(null);
          return;
        }

        const data = await teacherService.getTeacherInfo(teacherId);
        if (mounted) setTeacher(data);
      } catch {
        if (mounted) setTeacher(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadTeacher();
    return () => {
      mounted = false;
    };
  }, []);

  // đóng menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    const tid = teacherSession.getTeacherId();

    // clear auth
    tokenStorage.clear();
    teacherSession.clear();

    // xoá selectedClassId của đúng teacher
    if (tid) localStorage.removeItem(`selectedClassId_${tid}`);

    // clear user context (nhớ lớp cũ)
    localStorage.removeItem("selectedClassId");
    localStorage.removeItem("currentUser");

    // nếu bạn có lưu ở sessionStorage ở chỗ nào đó thì xoá luôn cho chắc
    sessionStorage.removeItem("selectedClassId");

    router.replace("/");
  }

  const teacherName = loading ? "Đang tải..." : teacher?.fullName ?? "Giáo viên";

  return (
    <header className="h-20 bg-white border-b flex items-center justify-between px-6">
      {/* Left */}
      <div className="flex items-center gap-4">
        <Image src="/logo.jpg" alt="eBoard Logo" width={150} height={150} />

        <div className="mx-4 h-8 w-px bg-gray-200" />

        <div>
          <h2 className="font-semibold text-gray-700 text-lg">
            Chào mừng trở lại!
          </h2>
          <p className="text-base text-gray-400">
            Quản lý lớp học của bạn một cách hiệu quả
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4 relative" ref={menuRef}>
        <button className="text-xl" type="button">
          🔔
        </button>

        {/* Teacher name */}
        <button
          type="button"
          onClick={() => setOpenMenu((v) => !v)}
          className="text-left hover:bg-gray-100 px-3 py-2 rounded-lg transition"
        >
          <p className="text-base font-medium text-gray-700">
            {teacherName}
          </p>
          <p className="text-sm text-gray-400">Giáo viên</p>
        </button>

        {/* Dropdown */}
        {openMenu && (
          <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden z-50">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
