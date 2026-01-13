import { Class } from "@/types/Class";

export async function getMyClasses(): Promise<Class[]> {
  return Promise.resolve([
    {
      id: "1A",
      name: "Lớp 1A",
      grade: "Khối lớp 1",
      room: "A101",
      schoolYear: "2025-2026",
      totalStudents: 30,
      currentStudents: 28,
    },
  ]);
}
