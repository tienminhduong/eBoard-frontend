"use client";

import { Upload, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import * as XLSX from "xlsx";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { scoreService } from "@/services/scoreService";
import { exportScoreTemplateExcel } from "@/utils/exportScoreBySubjectTemplateExcel";

/* ================= PROPS ================= */

interface Props {
  open: boolean;
  onClose: () => void;
  classId: string;
  subjectId: string;
  subjectName: string;
  semester: number;
  students: {
    studentId: string;
    studentName: string;
  }[];
  onSuccess?: () => void;
}

/* ================= HEADER ================= */

const REQUIRED_HEADERS = [
  "STT",
  "studentId",      // 👈 BẮT BUỘC
  "Tên học sinh",
  "Điểm giữa kỳ",
  "Điểm cuối kỳ",
];

/* ================= HELPER ================= */

function parseScore(value: any): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const normalized =
    typeof value === "string"
      ? value.replace(",", ".").trim()
      : value;

  const num = Number(normalized);

  if (Number.isNaN(num)) {
    throw new Error("Điểm không hợp lệ");
  }

  if (num < 0 || num > 10) {
    throw new Error("Điểm phải từ 0 đến 10");
  }

  return num;
}

/* ================= COMPONENT ================= */

export default function ImportScoreExcelModal({
  open,
  onClose,
  classId,
  subjectId,
  subjectName,
  semester,
  students, // vẫn nhận nhưng KHÔNG dùng để map ID nữa
  onSuccess,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* ===== VALIDATE FILE ===== */
  const handleFileChange = async (f: File) => {
    setError(null);
    setFile(null);

    if (!f.name.endsWith(".xlsx")) {
      setError("Chỉ chấp nhận file .xlsx");
      return;
    }

    try {
      const buffer = await f.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const rows = XLSX.utils.sheet_to_json<any>(sheet, {
        defval: null,
      });

      if (!rows.length) {
        setError("File Excel không có dữ liệu");
        return;
      }

      const headers = Object.keys(rows[0]);
      const missing = REQUIRED_HEADERS.filter(
        (h) => !headers.includes(h)
      );

      if (missing.length) {
        setError(`Thiếu cột: ${missing.join(", ")}`);
        return;
      }

      setFile(f);
    } catch {
      setError("Không thể đọc file Excel");
    }
  };

  /* ===== UPLOAD ===== */
  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const rows = XLSX.utils.sheet_to_json<any>(sheet, {
        defval: null,
      });

      const payload = rows.map((r, index) => {
        let mid: number | null;
        let fin: number | null;

        try {
          mid = parseScore(r["Điểm giữa kỳ"]);
          fin = parseScore(r["Điểm cuối kỳ"]);
        } catch (err: any) {
          throw new Error(`Dòng ${index + 2}: ${err.message}`);
        }

        if (!r["studentId"]) {
          throw new Error(`Dòng ${index + 2}: Thiếu studentId`);
        }

        return {
          studentId: r["studentId"],   // 👈 LẤY TỪ EXCEL
          midtermScore: mid ?? 0,
          finalScore: fin ?? 0,
        };
      });

      console.log("UPLOAD SCORES:", payload);

      await scoreService.saveScoresBySubject({
        classId,
        subjectId,
        semester,
        scores: payload,
      });

      onSuccess?.();
      onClose();
    } catch (e: any) {
      setError(e.message || "Đăng tải thất bại");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Đăng tải điểm theo môn bằng Excel"
      description="Tải file mẫu, nhập điểm và upload"
      width="max-w-lg"
    >
      <div className="space-y-6">
        {/* TEMPLATE */}
        <div className="border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 font-medium text-[#355E5A]">
            <FileSpreadsheet size={18} />
            File Excel mẫu
          </div>

          <Button
            onClick={() =>
              exportScoreTemplateExcel(
                students, // ❗ KHÔNG sort
                subjectName,
                semester
              )
            }
          >
            Tải file Excel mẫu
          </Button>
        </div>

        {/* UPLOAD */}
        <div className="border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 font-medium text-[#355E5A]">
            <Upload size={18} />
            Đăng tải file Excel
          </div>

          <input
            type="file"
            accept=".xlsx"
            onChange={(e) =>
              e.target.files?.[0] &&
              handleFileChange(e.target.files[0])
            }
          />

          {file && (
            <p className="text-sm text-green-600">
              ✔ Đã chọn: {file.name}
            </p>
          )}

          {error && (
            <p className="text-sm text-red-500">
              ✖ {error}
            </p>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button
            variant="primary"
            disabled={!file || !!error || loading}
            onClick={handleUpload}
          >
            {loading ? "Đang xử lý..." : "Quét & lưu dữ liệu"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
