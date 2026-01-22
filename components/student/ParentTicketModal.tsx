"use client";

import type { StudentRow } from "@/types/Student";

const PRIMARY = "#518581";

type Props = {
  open: boolean;
  student: StudentRow | null;
  onClose: () => void;
};

export default function ParentTicketModal({ open, student, onClose }: Props) {
  if (!open || !student) return null;

  function handlePrint() {
    // in popup theo layout hiện tại
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* header */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: PRIMARY }}>
          <div className="text-white font-semibold">Phiếu tài khoản phụ huynh</div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-md hover:bg-white/10 flex items-center justify-center text-white"
            title="Đóng"
          >
            <XIcon />
          </button>
        </div>

        <div className="px-6 py-6">
          {/* Ticket body */}
          <div className="rounded-xl border border-emerald-200 p-5">
            <div className="text-center">
              <div className="font-semibold text-gray-900 flex items-center justify-center gap-2">
                <span>🎓</span>
                <span>eBoard</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">Thông tin tài khoản phụ huynh</div>
              <div className="text-xs text-gray-400 mt-2">Vui lòng bảo mật thông tin tài khoản</div>
            </div>

            <div className="my-4 border-t border-gray-200" />

            <div className="space-y-3 text-sm">
              <Line label="Học sinh" value={student.fullName} />
              <Line label="Phụ huynh" value={student.parentName} />
              <div className="grid grid-cols-2 gap-3">
                <Line label="Số điện thoại" value={student.phone} />
                <Line label="Email" value={student.email} />
              </div>

              <div className="rounded-xl bg-emerald-50 p-4 mt-2">
                <Line label="Tên đăng nhập" value={student.phone} highlight />
                <Line label="Mật khẩu" value={student.password} highlight />
              </div>

              <div className="text-center text-xs text-gray-400 mt-3">
                Truy cập: eboard.edu.vn để đăng nhập
              </div>
            </div>
          </div>

          {/* footer actions */}
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-gray-200 text-gray-800 hover:bg-gray-50"
            >
              Đóng
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 h-11 rounded-xl text-white font-medium"
              style={{ backgroundColor: PRIMARY }}
            >
              In phiếu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Line({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className={highlight ? "text-sm font-semibold text-emerald-700" : "text-sm text-gray-800"}>
        {value || "-"}
      </div>
    </div>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
