import * as XLSX from "xlsx";

/* ================= TYPES ================= */

export interface StudentForExcel {
  studentId: string;   // dùng nội bộ
  studentName: string; // hiển thị cho GV
}

/* ================= EXPORT ================= */

export function exportScoreTemplateExcel(
  students: StudentForExcel[],
  subjectName: string,
  semester: number
) {
  /* 1️⃣ KHÔNG SORT — GIỮ NGUYÊN THỨ TỰ TỪ BE */
  const sheetData: any[][] = [
    // ⬇️ CỘT studentId DÙNG NGẦM
    ["STT", "studentId", "Tên học sinh", "Điểm giữa kỳ", "Điểm cuối kỳ"],
  ];

  /* 2️⃣ DATA */
  students.forEach((s, index) => {
    sheetData.push([
      index + 1,
      s.studentId,   // 👈 ID ẨN
      s.studentName,
      "",
      "",
    ]);
  });

  /* 3️⃣ TẠO SHEET */
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  /* 4️⃣ SET WIDTH + ẨN CỘT studentId */
  worksheet["!cols"] = [
    { wch: 6 },    // STT
    { wch: 0, hidden: true }, // studentId (ẨN)
    { wch: 30 },   // Tên
    { wch: 15 },   // Giữa kỳ
    { wch: 15 },   // Cuối kỳ
  ];

  /* 5️⃣ WORKBOOK */
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    `HK${semester}_${subjectName}`
  );

  /* 6️⃣ DOWNLOAD */
  XLSX.writeFile(
    workbook,
    `Bang_diem_HK${semester}_${subjectName}.xlsx`
  );
}
