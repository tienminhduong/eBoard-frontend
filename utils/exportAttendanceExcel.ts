import * as XLSX from "xlsx";
import { AttendanceInfoByClass, AttendanceRecord } from "@/types/attendance";

/* ===== BORDER ===== */
const allBorder = {
  top: { style: "thin" },
  bottom: { style: "thin" },
  left: { style: "thin" },
  right: { style: "thin" },
};

interface ExportAttendanceMeta {
  className: string;
  date: string;
  teacherName?: string;
}

/* ===================================================== */
/* ================== EXPORT ĐIỂM DANH ================= */
/* ===================================================== */
export function exportAttendanceExcel(
  attendance: AttendanceInfoByClass,
  meta: ExportAttendanceMeta
) {
  if (!attendance || !attendance.attendances.length) return;

  /* ===== TITLE ===== */
  const titleRow = [`BẢNG ĐIỂM DANH LỚP ${meta.className}`];
  const dateRow = [`Ngày: ${meta.date}`];
  const teacherRow = meta.teacherName
    ? [`Giáo viên chủ nhiệm: ${meta.teacherName}`]
    : [""];
  const emptyRow: never[] = [];

  /* ===== HEADER ===== */
  const headerRow = [
    "STT",
    "Họ và tên học sinh",
    "Trạng thái",
    "Lý do vắng",
    "Người đón",
    "Ghi chú",
  ];

  /* ===== BODY ===== */
  const bodyRows = attendance.attendances.map(
    (a: AttendanceRecord, index: number) => [
      index + 1,
      a.studentName,
      a.status,
      a.absenceReason || "",
      a.pickupPerson || "",
      a.notes || "",
    ]
  );

  const sheetData = [
    titleRow,
    dateRow,
    teacherRow,
    emptyRow,
    headerRow,
    ...bodyRows,
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  /* ===== MERGE TITLE ===== */
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } },
  ];

  /* ===== TITLE STYLE ===== */
  ["A1", "A2", "A3"].forEach((cellRef, idx) => {
    const cell = ws[cellRef];
    if (!cell) return;
    cell.s = {
      font: { bold: idx === 0, sz: idx === 0 ? 16 : 12 },
      alignment: { horizontal: "center", vertical: "center" },
    };
  });

  /* ===== HEADER STYLE ===== */
  const headerRowIndex = 4;
  ["A", "B", "C", "D", "E", "F"].forEach((col) => {
    const cell = ws[`${col}${headerRowIndex + 1}`];
    if (!cell) return;
    cell.s = {
      font: { bold: true },
      alignment: { horizontal: "center", vertical: "center" },
      border: allBorder,
    };
  });

  /* ===== BODY STYLE ===== */
  const startBodyRow = headerRowIndex + 2;
  const endBodyRow = startBodyRow + bodyRows.length - 1;

  for (let r = startBodyRow; r <= endBodyRow; r++) {
    ["A", "B", "C", "D", "E", "F"].forEach((col, idx) => {
      const cell = ws[`${col}${r}`];
      if (!cell) return;
      cell.s = {
        alignment: {
          horizontal:
            idx === 1 || idx === 3 || idx === 5 ? "left" : "center",
          vertical: "center",
        },
        border: allBorder,
      };
    });
  }

  /* ===== COLUMN WIDTH ===== */
  ws["!cols"] = [
    { wch: 6 },
    { wch: 28 },
    { wch: 18 },
    { wch: 22 },
    { wch: 20 },
    { wch: 28 },
  ];

  /* ===== EXPORT ===== */
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "DiemDanh");
  XLSX.writeFile(
    wb,
    `Diem_danh_${meta.className}_${meta.date}.xlsx`
  );
}
