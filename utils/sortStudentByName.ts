export function sortStudentsByName<T extends { studentName: string }>(
  students: T[]
): T[] {
  const getLastName = (fullName: string) =>
    fullName.trim().split(/\s+/).pop() || "";

  return [...students].sort((a, b) => {
    const lastA = getLastName(a.studentName);
    const lastB = getLastName(b.studentName);

    const cmp = lastA.localeCompare(lastB, "vi");
    if (cmp !== 0) return cmp;

    return a.studentName.localeCompare(b.studentName, "vi");
  });
}
