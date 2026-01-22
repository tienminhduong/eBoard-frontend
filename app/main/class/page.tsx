"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ClassNavigation from "@/components/class/ClassNavigation";
import { teacherSession } from "@/services/teacherSession";
import { classService } from "@/services/classService";
import { mapToClassItem } from "@/utils/classMapper";
import type { ClassItem } from "@/types/Class";

export default function ClassLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [currentClass, setCurrentClass] = useState<ClassItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const teacherId = teacherSession.getTeacherId();
    if (!teacherId) {
      router.replace("/login");
      return;
    }

    const classId = localStorage.getItem(`selectedClassId_${teacherId}`);
    if (!classId) {
      router.replace("/main/my-classes"); // quay về danh sách lớp
      return;
    }

    (async () => {
      try {
        const res = await classService.getClassById(classId);
        setCurrentClass(mapToClassItem(res));
      } catch {
        router.replace("/main/my-classes");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Đang tải lớp...</div>;
  }

  if (!currentClass) return null;

  return (
    <div className="px-6 py-6 space-y-6">
      {/* ===== CLASS INFO HEADER ===== */}
      <div className="bg-white rounded-2xl border shadow-sm px-6 py-4">
        <div className="text-xl font-semibold text-gray-900">
          {currentClass.name}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {currentClass.gradeLabel} • {currentClass.roomName}
        </div>
      </div>

      {/* ===== CLASS NAVIGATION ===== */}
      <ClassNavigation />

      {/* ===== PAGE CONTENT ===== */}
      <div>{children}</div>
    </div>
  );
}
