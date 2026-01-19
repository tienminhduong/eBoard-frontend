"use client";

import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import * as XLSX from "xlsx";

const PRIMARY = "#518581";
const SELECTED_CLASS_ID_KEY = "selectedClassId";

export type CreateStudentRequest = {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // yyyy-mm-dd
  address: string;
  province: string;
  district: string;
  ward: string;
  gender: string;
  parentPhoneNumber: string;
  relationshipWithParent: string;
  parentFullName: string;
  parentHealthCondition: string;
  classId: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  classId?: string;
  onImported: (rows: CreateStudentRequest[]) => void;
};

function normalizeHeader(h: string) {
  return String(h || "")
    .trim()
    .toLowerCase()
    // bỏ ngoặc
    .replace(/[()]/g, " ")
    // mọi ký tự đặc biệt -> space (giữ unicode)
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getCell(row: any, keys: string[]) {
  for (const k of keys) {
    if (row[k] != null && String(row[k]).trim() !== "") return String(row[k]).trim();
  }
  return "";
}

function excelDateToYMD(v: any): string {
  const s = String(v ?? "").trim();
  if (!s) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) {
    const dd = m[1].padStart(2, "0");
    const mm = m[2].padStart(2, "0");
    const yyyy = m[3];
    return `${yyyy}-${mm}-${dd}`;
  }

  if (!Number.isNaN(Number(s))) {
    const n = Number(s);
    const d = XLSX.SSF.parse_date_code(n);
    if (d?.y && d?.m && d?.d) {
      const yyyy = String(d.y).padStart(4, "0");
      const mm = String(d.m).padStart(2, "0");
      const dd = String(d.d).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
  }

  return "";
}

function splitName(fullName: string) {
  const s = (fullName || "").trim().replace(/\s+/g, " ");
  if (!s) return { firstName: "", lastName: "" };
  const parts = s.split(" ");
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[parts.length - 1], lastName: parts.slice(0, -1).join(" ") };
}

function normalizeGender(v: string) {
  const s = (v || "").trim().toLowerCase();
  if (!s) return "";
  if (s === "nam" || s === "male" || s === "m") return "Nam";
  if (s === "nữ" || s === "nu" || s === "female" || s === "f") return "Nữ";
  return "Khác";
}

export default function ImportStudentsModal({ open, onClose, onImported, classId }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedClassId, setResolvedClassId] = useState("");

  useEffect(() => {
    if (!open) return;
    if (classId?.trim()) {
      setResolvedClassId(classId.trim());
      return;
    }
    const stored = localStorage.getItem(SELECTED_CLASS_ID_KEY) || "";
    setResolvedClassId(stored);
  }, [open, classId]);

  async function parseFile(file: File) {
    setError(null);

    if (!resolvedClassId) {
      setError("Chưa có classId. Vui lòng chọn lớp trước khi import.");
      return;
    }

    if (!file.name.toLowerCase().match(/\.(xlsx|xls)$/)) {
      setError("Chỉ hỗ trợ file .xlsx hoặc .xls");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File quá lớn (tối đa 10MB)");
      return;
    }

    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const raw: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

    const rows: CreateStudentRequest[] = raw.map((r) => {
      const norm: Record<string, any> = {};
      Object.keys(r).forEach((k) => {
        norm[normalizeHeader(k)] = r[k];
      });

      // ✅ Support template: Họ + Tên
      const lastName = getCell(norm, ["họ", "ho", "last name", "lastname"]);
      const firstName = getCell(norm, ["tên", "ten", "first name", "firstname"]);

      // ✅ Fallback: Họ và tên
      const fullName = getCell(norm, [
        "họ và tên",
        "ho va ten",
        "full name",
        "fullname",
        "student name",
        "ten hoc sinh",
      ]);
      const split = splitName(fullName);

      const finalFirstName = (firstName || split.firstName).trim();
      const finalLastName = (lastName || split.lastName).trim();

      // ✅ Support: "Ngày sinh (yyyy-mm-dd)" -> normalize thành "ngày sinh yyyy mm dd"
      const dobRaw = getCell(norm, [
        "ngày sinh",
        "ngay sinh",
        "ngày sinh yyyy mm dd",
        "dob",
        "date of birth",
        "dateofbirth",
      ]);
      const dateOfBirth = excelDateToYMD(dobRaw);

      // Address pieces (support header có dấu / ,)
      const province = getCell(norm, ["tỉnh tp", "tinh tp", "tỉnh", "tinh", "province", "city", "thành phố"]);
      const district = getCell(norm, ["quận huyện", "quan huyen", "quận", "quan", "district"]);
      const ward = getCell(norm, ["phường xã", "phuong xa", "phường", "phuong", "ward"]);
      const street = getCell(norm, [
        "số nhà tên đường",
        "so nha ten duong",
        "địa chỉ chi tiết",
        "dia chi chi tiet",
        "street",
        "address line",
      ]);

      const addressFull =
        getCell(norm, ["địa chỉ", "dia chi", "address", "full address", "fulladdress"]) ||
        [street, ward, district, province].filter(Boolean).join(", ");

      // gender
      const genderRaw = getCell(norm, ["giới tính", "gioi tinh", "giới tính nam nữ khác", "gender", "sex"]);
      const gender = normalizeGender(genderRaw) || "Nữ";

      // parent
      const parentFullName = getCell(norm, ["họ tên phụ huynh", "ho ten phu huynh", "parent name", "guardian name"]);
      const parentPhoneNumber = getCell(norm, ["sđt phụ huynh", "sdt phu huynh", "sđt", "sdt", "phone", "parent phone"])
        .replace(/\D/g, "")
        .slice(0, 11);

      const relationshipWithParent =
        getCell(norm, ["quan hệ ba mẹ", "quan he ba me", "quan hệ", "quan he", "relationship", "mối quan hệ"]) || "Mẹ";

      const parentHealthCondition =
        getCell(norm, ["sức khỏe phụ huynh", "suc khoe phu huynh", "health", "health condition", "tình trạng sức khỏe"]) ||
        "N/A";

      return {
        firstName: finalFirstName,
        lastName: finalLastName,
        dateOfBirth,
        address: addressFull,
        province: province || "HCMinh",
        district: district || "",
        ward: ward || "",
        gender,
        parentPhoneNumber,
        relationshipWithParent,
        parentFullName,
        parentHealthCondition,
        classId: resolvedClassId,
      };
    });

    const cleaned = rows.filter((x) => x.firstName.trim() || x.lastName.trim());
    if (cleaned.length === 0) {
      setError("Không đọc được dữ liệu. Vui lòng kiểm tra file theo đúng mẫu.");
      return;
    }

    const invalid = cleaned.find(
      (x) =>
        !x.firstName.trim() ||
        !x.lastName.trim() ||
        !x.dateOfBirth ||
        !x.address.trim() ||
        !x.parentFullName.trim() ||
        !x.parentPhoneNumber.trim() ||
        !x.relationshipWithParent.trim()
    );
    if (invalid) {
      setError("Có dòng thiếu dữ liệu bắt buộc (Họ, Tên, Ngày sinh, Địa chỉ, Phụ huynh, SĐT, Quan hệ).");
      return;
    }

    onImported(cleaned);
    onClose();
  }

  function handleDownloadTemplate() {
    const wb = XLSX.utils.book_new();
    const rows = [
      {
        "Họ": "Nguyễn",
        "Tên": "Văn An",
        "Ngày sinh (yyyy-mm-dd)": "2018-03-15",
        "Giới tính (Nam/Nữ/Khác)": "Nữ",
        "Số nhà, tên đường": "123 Lê Lợi",
        "Phường/Xã": "Phường 1",
        "Quận/Huyện": "Q1",
        "Tỉnh/TP": "HCMinh",
        "Họ tên phụ huynh": "Nguyễn Văn Bình",
        "SĐT phụ huynh": "0912345678",
        "Quan hệ (Ba/Mẹ/...)": "Mẹ",
        "Sức khỏe phụ huynh": "N/A",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [
      { wch: 14 },
      { wch: 16 },
      { wch: 20 },
      { wch: 22 },
      { wch: 22 },
      { wch: 14 },
      { wch: 12 },
      { wch: 12 },
      { wch: 22 },
      { wch: 14 },
      { wch: 18 },
      { wch: 18 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "MauImport");
    XLSX.writeFile(wb, "Mau_Import_CreateStudent.xlsx");
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseFile(file);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 flex items-start justify-between">
          <div>
            <div className="text-xl font-semibold text-gray-900">Import danh sách học sinh</div>
            <div className="text-sm text-gray-500 mt-1">Tải lên file Excel chứa danh sách học sinh</div>
          </div>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded-md hover:bg-gray-100 flex items-center justify-center" title="Đóng">
            <XIcon />
          </button>
        </div>

        <div className="px-6 pb-6">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: PRIMARY }}>
              <DownloadIcon />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">Tải xuống file mẫu</div>
              <div className="text-sm text-gray-600 mt-1">Tải file Excel mẫu để nhập thông tin học sinh đúng định dạng</div>
              <button type="button" onClick={handleDownloadTemplate} className="mt-3 h-10 px-4 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: PRIMARY }}>
                Tải file mẫu
              </button>
            </div>
          </div>

          <div
            className={clsx(
              "mt-6 rounded-2xl border border-gray-200 bg-white p-10 flex flex-col items-center justify-center text-center",
              dragOver && "border-emerald-300 bg-emerald-50"
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
              <UploadIcon />
            </div>
            <div className="mt-4 text-gray-900 font-medium">Kéo thả file Excel vào đây</div>
            <div className="text-gray-400 text-sm mt-1">hoặc</div>

            <button type="button" onClick={() => inputRef.current?.click()} className="mt-3 h-11 px-6 rounded-xl text-white text-sm font-medium" style={{ backgroundColor: PRIMARY }}>
              Chọn file
            </button>

            <div className="text-xs text-gray-400 mt-3">Hỗ trợ định dạng: .xlsx, .xls (Tối đa 10MB)</div>

            {!resolvedClassId && <div className="mt-3 text-sm text-red-600">Chưa có classId – hãy chọn lớp trước khi import.</div>}
            {error && <div className="mt-3 text-sm text-red-500">{error}</div>}

            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) parseFile(f);
                e.currentTarget.value = "";
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* icons */
function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M21 21H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function UploadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 16V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 9l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
