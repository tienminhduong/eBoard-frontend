import * as XLSX from "xlsx";
import {
  ExtracurricularActivity,
  ActivityParticipant,
} from "@/types/activity";

/* ===== BORDER HELPER ===== */
const allBorder = {
  top: { style: "thin" },
  bottom: { style: "thin" },
  left: { style: "thin" },
  right: { style: "thin" },
};

interface ExportActivityMeta {
  className: string;
}

export function exportActivityParticipantsExcel(
  activity: ExtracurricularActivity,
  participants: ActivityParticipant[],
  meta: ExportActivityMeta
) {
  if (!participants || participants.length === 0) return;

  /* ===== 1. DATA ===== */
  const titleRow = [
    `DANH SÁCH THAM GIA HOẠT ĐỘNG: ${activity.name.toUpperCase()}`,
  ];
  const classRow = [`Lớp: ${meta.className}`];
  const emptyRow: never[] = [];

  const activityInfoRows = [
    [`Tên hoạt động: ${activity.name}`],
    [`Địa điểm: ${activity.location}`],
    [
      `Thời gian: ${new Date(activity.startTime).toLocaleString()} - ${new Date(
        activity.endTime
      ).toLocaleString()}`,
    ],
    [
      `Hạn đăng ký: ${new Date(
        activity.assignDeadline
      ).toLocaleString()}`,
    ],
    [`Giáo viên phụ trách: ${activity.inChargeTeacher}`],
    [`Chi phí: ${activity.cost.toLocaleString()}đ`],
  ];

  const headerRow = [
    "STT",
    "Họ và tên",
    "SĐT phụ huynh",
    "Ghi chú",
    "Nhận xét GV",
    "Trạng thái",
  ];

  const bodyRows = participants.map((p, index) => [
    index + 1,
    p.studentName,
    p.parentPhoneNumber ?? "",
    p.notes ?? "",
    p.teacherComments ?? "",
  ]);

  const sheetData = [
    titleRow,
    classRow,
    emptyRow,
    ...activityInfoRows,
    emptyRow,
    headerRow,
    ...bodyRows,
  ];

  /* ===== 2. CREATE SHEET ===== */
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  /* ===== 3. MERGE ===== */
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
    ...activityInfoRows.map((_, idx) => ({
      s: { r: 3 + idx, c: 0 },
      e: { r: 3 + idx, c: 5 },
    })),
  ];

  /* ===== 4. TITLE STYLE ===== */
  ["A1", "A2"].forEach((cellRef, idx) => {
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
  const headerRowIndex =
    3 + activityInfoRows.length + 1;

  ["A", "B", "C", "D", "E", "F"].forEach((col) => {
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

  /* ===== 6. BODY STYLE ===== */
  const startBodyRow = headerRowIndex + 2;
  const endBodyRow = startBodyRow + bodyRows.length - 1;

  for (let r = startBodyRow; r <= endBodyRow; r++) {
    ["A", "B", "C", "D", "E", "F"].forEach((col, idx) => {
      const cell = ws[`${col}${r}`];
      if (!cell) return;

      cell.s = {
        alignment: {
          horizontal:
            idx === 1 || idx === 3 || idx === 4
              ? "left"
              : "center",
          vertical: "center",
        },
        border: allBorder,
      };
    });
  }

  /* ===== 7. COLUMN WIDTH ===== */
  ws["!cols"] = [
    { wch: 6 },
    { wch: 28 },
    { wch: 18 },
    { wch: 24 },
    { wch: 28 },
    { wch: 16 },
  ];

  /* ===== 8. EXPORT ===== */
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "DanhSachThamGia");

  XLSX.writeFile(
    wb,
    `Danh_sach_tham_gia_${activity.name.replace(/\s+/g, "_")}.xlsx`
  );
}
