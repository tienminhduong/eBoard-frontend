import * as XLSX from "xlsx";
import { ScoreBySubject } from "@/types/score";

/* ===== BORDER HELPER ===== */
const allBorder = {
  top: { style: "thin" },
  bottom: { style: "thin" },
  left: { style: "thin" },
  right: { style: "thin" },
};

interface ExportBySubjectMeta {
  className: string;
  schoolYear: string;
  semester: number;
  subjectName: string;
}

export function exportScoreBySubjectExcel(
  data: ScoreBySubject[],
  meta: ExportBySubjectMeta
) {
  if (!data || data.length === 0) return;

  /* ===== 1. DATA ===== */
  const titleRow = [
    `BẢNG ĐIỂM MÔN ${meta.subjectName.toUpperCase()} – LỚP ${meta.className}`,
  ];
  const schoolYearRow = [`Năm học: ${meta.schoolYear}`];
  const semesterRow = [`Học kỳ: ${meta.semester}`];
  const emptyRow: never[] = [];

  const headerRow = [
    "STT",
    "Họ và tên",
    "GK",
    "CK",
    "Điểm TB",
    "Xếp loại",
    "Ghi chú",
  ];

  const bodyRows = data.map((s, index) => [
    index + 1,
    s.studentName,
    s.midtermScore ?? "",
    s.finalScore ?? "",
    s.averageScore ?? "",
    s.grade ?? "",
    s.note ?? "",
  ]);

  const sheetData = [
    titleRow,
    schoolYearRow,
    semesterRow,
    emptyRow,
    headerRow,
    ...bodyRows,
  ];

  /* ===== 2. CREATE SHEET ===== */
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  /* ===== 3. MERGE TITLE ===== */
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } },
  ];

  /* ===== 4. TITLE STYLE ===== */
  ["A1", "A2", "A3"].forEach((cellRef, idx) => {
    const cell = ws[cellRef];
    if (!cell) return;

    cell.s = {
      font: {
        bold: idx === 0,
        sz: idx === 0 ? 16 : 12,
      },
      alignment: {
        horizontal: "center",
        vertical: "center",
      },
    };
  });

  /* ===== 5. HEADER STYLE ===== */
  const headerRowIndex = 4;
  ["A", "B", "C", "D", "E", "F", "G"].forEach((col) => {
    const cell = ws[`${col}${headerRowIndex + 1}`];
    if (!cell) return;

    cell.s = {
      font: { bold: true },
      alignment: {
        horizontal: "center",
        vertical: "center",
      },
      border: allBorder,
    };
  });

  /* ===== 6. BODY STYLE + BORDER ===== */
  const startBodyRow = headerRowIndex + 2;
  const endBodyRow = startBodyRow + bodyRows.length - 1;

  for (let r = startBodyRow; r <= endBodyRow; r++) {
    ["A", "B", "C", "D", "E", "F", "G"].forEach((col, idx) => {
      const cell = ws[`${col}${r}`];
      if (!cell) return;

      cell.s = {
        alignment: {
          horizontal: idx === 1 || idx === 6 ? "left" : "center",
          vertical: "center",
        },
        border: allBorder,
      };
    });
  }

  /* ===== 7. COLUMN WIDTH ===== */
  ws["!cols"] = [
    { wch: 6 },   // STT
    { wch: 28 },  // Họ tên
    { wch: 8 },   // GK
    { wch: 8 },   // CK
    { wch: 14 },  // ĐTB
    { wch: 14 },  // Xếp loại
    { wch: 24 },  // Ghi chú
  ];

  /* ===== 8. ROW HEIGHT ===== */
  ws["!rows"] = [
    { hpt: 30 },
    { hpt: 22 },
    { hpt: 22 },
    { hpt: 10 },
    { hpt: 26 },
    ...data.map(() => ({ hpt: 24 })),
  ];

  /* ===== 9. EXPORT ===== */
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "BangDiemTheoMon");

  XLSX.writeFile(
    wb,
    `Bang_diem_${meta.className}_${meta.subjectName}_HK${meta.semester}.xlsx`
  );
}
