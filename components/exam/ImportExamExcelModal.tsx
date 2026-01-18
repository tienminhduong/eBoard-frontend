"use client";

import { Upload, Download, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface Props {
  open: boolean;
  onClose: () => void;
}

const REQUIRED_HEADERS = ["subject", "date", "time", "type", "content"];

export default function ImportExamExcelModal({ open, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (f: File) => {
    setError(null);
    setFile(null);

    // ⚠️ Ở đây giả lập validate header
    // Backend thực tế sẽ parse Excel bằng Apache POI / SheetJS
    const fileName = f.name.toLowerCase();

    if (!fileName.endsWith(".xlsx")) {
      setError("Chỉ chấp nhận file .xlsx");
      return;
    }

    // TODO: sau này validate header thật từ backend
    setFile(f);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Đăng tải lịch thi bằng Excel"
      description="Tải mẫu dữ liệu và đăng tải file đúng định dạng để hệ thống quét"
      width="max-w-lg"
    >
      <div className="space-y-6">
        {/* ===== 1. Mẫu dữ liệu ===== */}
        <div className="border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-[#355E5A] font-medium">
            <FileSpreadsheet size={18} />
            Mẫu dữ liệu
          </div>

          <p className="text-sm text-gray-500">
            Vui lòng sử dụng đúng mẫu Excel của hệ thống để đảm bảo dữ liệu được
            quét chính xác.
          </p>

          <Button
            icon={Download}
            variant="outline"
            onClick={() => {
              // TODO: link file mẫu từ backend / public
              window.open("/templates/exam-schedule-template.xlsx");
            }}
          >
            Tải file mẫu
          </Button>
        </div>

        {/* ===== 2. Upload ===== */}
        <div className="border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-[#355E5A] font-medium">
            <Upload size={18} />
            Đăng tải Excel
          </div>

          <input
            type="file"
            accept=".xlsx"
            className="block w-full text-sm"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFileChange(e.target.files[0]);
              }
            }}
          />

          {file && (
            <p className="text-sm text-green-600">
              ✔ Đã chọn file: {file.name}
            </p>
          )}

          {error && (
            <p className="text-sm text-red-500">
              ✖ {error}
            </p>
          )}

          <p className="text-sm text-gray-400">
            File phải đúng định dạng và đúng header theo mẫu.
          </p>
        </div>

        {/* ===== Actions ===== */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button
            variant="primary"
            disabled={!file || !!error}
            onClick={() => {
              // TODO: call API upload + scan
              console.log("Upload file", file);
              onClose();
            }}
          >
            Quét dữ liệu
          </Button>
        </div>
      </div>
    </Modal>
  );
}
