"use client";

import React, { useEffect, useMemo, useState } from "react";
import clsx from "clsx";

import ExportListModal from "@/components/student/ExportListModal";
import ImportStudentsModal from "@/components/student/ImportStudentModal";
import ConfirmParentsModal from "@/components/student/ConfirmParentsModal";
import StudentDetailModal from "@/components/student/StudentDetailModal";
import ParentTicketModal from "@/components/student/ParentTicketModal";
import DeleteConfirmModal from "@/components/student/DeleteConfirmModal";
import AddStudentModal, { CreateStudentRequest } from "@/components/class/AddStudentModal";
import type { StudentRow, ImportedStudent } from "@/types/student";
import { classService } from "@/services/classService";
import { studentService } from "@/services/studentService";

const PRIMARY = "#518581";

const SELECTED_CLASS_ID_KEY = "selectedClassId";
const SELECTED_CLASS_NAME_KEY = "selectedClassName";

function formatDobISOToVN(iso?: string) {
  if (!iso) return "";
  const [y, m, d] = String(iso).split("-");
  if (!y || !m || !d) return String(iso);
  return `${d}/${m}/${y}`;
}

function payloadToImportedStudent(p: CreateStudentRequest, idx: number): ImportedStudent {
  const fullName = `${p.lastName} ${p.firstName}`.trim();

  return {
    id: `imp_${idx}`,
    fullName: fullName || "Không rõ",
    dob: formatDobISOToVN(p.dateOfBirth),

    province: p.province ?? "",
    district: p.district ?? "",
    ward: p.ward ?? "",
    gender: p.gender ?? "",
    relationshipWithParent: p.relationshipWithParent ?? "",

    address: p.address || "-",
    parentName: p.parentFullName || "-",
    email: "",
    phone: p.parentPhoneNumber || "-",
    password: "-",
  };
}

// tách họ tên "Nguyễn Văn A" -> lastName + firstName
function splitFullName(fullName: string) {
  const name = fullName.trim().replace(/\s+/g, " ");
  const parts = name.split(" ").filter(Boolean);
  const firstName = parts.pop() || "";
  const lastName = parts.join(" ");
  return { firstName, lastName };
}

export default function StudentsPage() {
  const [hydrated, setHydrated] = useState(false);
  const [classId, setClassId] = useState("");
  const [className, setClassName] = useState("Lớp");

  useEffect(() => {
    const cid = localStorage.getItem(SELECTED_CLASS_ID_KEY) || "";
    const cname = localStorage.getItem(SELECTED_CLASS_NAME_KEY) || "Lớp";
    setClassId(cid);
    setClassName(cname);
    setHydrated(true);
  }, []);

  const [students, setStudents] = useState<StudentRow[]>([]);
  const [q, setQ] = useState("");

  // load state
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  // paging
  const [pageNumber] = useState(1);
  const [pageSize] = useState(20);

  // modals
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  // Import: payload để POST + preview cho confirm UI
  const [importPayloads, setImportPayloads] = useState<CreateStudentRequest[]>([]);
  const [importPreview, setImportPreview] = useState<ImportedStudent[]>([]);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");

  const [selectedStudent, setSelectedStudent] = useState<StudentRow | null>(null);
  const [deleting, setDeleting] = useState(false);
const [deleteError, setDeleteError] = useState("");
async function handleDeleteStudent() {
  if (!classId || !selectedStudent?.id) return;

  try {
    setDeleteError("");
    setDeleting(true);

    await classService.removeStudentFromClass(classId, selectedStudent.id);

    setDeleteOpen(false);
    setSelectedStudent(null);
    await loadStudents(); // cập nhật lại tổng + danh sách
  } catch (e: any) {
    setDeleteError(e?.message ?? "Xóa học sinh thất bại.");
  } finally {
    setDeleting(false);
  }
}


  async function loadStudents() {
    if (!classId) {
      setStudents([]);
      setLoadError("Chưa chọn lớp. Hãy bấm 'Quản lý' từ trang Lớp của tôi trước.");
      return;
    }

    try {
      setLoading(true);
      setLoadError("");

      const json = await classService.getStudentsByClassId(classId, pageNumber, pageSize);
      const list = Array.isArray(json?.data) ? json.data : [];

      const mapped: StudentRow[] = list.map((s: any) => {
        const firstName = s?.firstName ?? "";
        const lastName = s?.lastName ?? "";
        const fullName = `${lastName} ${firstName}`.trim() || "Không rõ";

        const parentName = (s?.parent?.fullName ?? "").trim() || "Không rõ";
        const email = (s?.parent?.email ?? "").trim() || "-";
        const phone = (s?.parent?.phoneNumber ?? "").trim() || "-";

        return {
          id: s?.id ?? "",
          fullName,
          dob: formatDobISOToVN(s?.dateOfBirth),

          // list API có thể không trả mấy field này -> fallback
          gender: s?.gender ?? "",
          relationshipWithParent: s?.relationshipWithParent ?? "",
          address: (s?.fullAddress ?? s?.address ?? "").trim() || "-",
          province: s?.province ?? "",
          district: s?.district ?? "",
          ward: s?.ward ?? "",

          parentName,
          email,
          phone,
          password: "-",
        };
      });

      setStudents(mapped.filter((x) => x.id));
    } catch (e: any) {
      setLoadError(e?.message ?? "Không tải được danh sách học sinh.");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!hydrated) return;
    loadStudents();
  }, [hydrated, classId]);

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return students;
    return students.filter((s) => {
      return (
        s.fullName.toLowerCase().includes(keyword) ||
        s.parentName.toLowerCase().includes(keyword) ||
        s.phone.toLowerCase().includes(keyword) ||
        s.email.toLowerCase().includes(keyword) ||
        s.address.toLowerCase().includes(keyword)
      );
    });
  }, [students, q]);

  const gradeLabel = " ";
  const totalLabel = `Tổng số học sinh: ${students.length}`;

  async function handleAddStudent(payload: CreateStudentRequest) {
    if (!classId) return;

    try {
      setAddError("");
      setAdding(true);

      await studentService.createStudent({
        ...payload,
        classId,
      });

      setAddOpen(false);
      await loadStudents();
    } catch (e: any) {
      setAddError(e?.message ?? "Thêm học sinh thất bại.");
    } finally {
      setAdding(false);
    }
  }

  // Import create thật lên BE theo danh sách đã confirm
  async function handleConfirmImport(selectedPreviewRows: ImportedStudent[]) {
    if (!classId) return;

    try {
      setImportError("");
      setImporting(true);

      const selectedIds = new Set(selectedPreviewRows.map((x) => x.id));
      const selectedPayloads = importPayloads.filter((_, idx) => selectedIds.has(importPreview[idx]?.id));

      for (const p of selectedPayloads) {
        await studentService.createStudent({
          ...p,
          classId,
        });
      }

      setConfirmOpen(false);
      setImportPayloads([]);
      setImportPreview([]);
      await loadStudents();
    } catch (e: any) {
      setImportError(e?.message ?? "Import thất bại.");
    } finally {
      setImporting(false);
    }
  }
  if (!hydrated) return null;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-7">
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Quản lý học sinh - {className}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {gradeLabel} {gradeLabel ? "•" : ""} {totalLabel}
            </p>
          </div>

          <div className="flex gap-3">
            {/* THÊM HS */}
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className={clsx(
                "h-10 px-4 rounded-xl text-white font-medium shadow-sm flex items-center gap-2",
                (!classId || adding) && "opacity-70 cursor-not-allowed"
              )}
              style={{ backgroundColor: PRIMARY }}
              disabled={!classId || adding}
            >
              <PlusIcon />
              Thêm học sinh
            </button>

            {/* IMPORT */}
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className={clsx(
                "h-10 px-4 rounded-xl text-white font-medium shadow-sm flex items-center gap-2",
                !classId && "opacity-70 cursor-not-allowed"
              )}
              style={{ backgroundColor: "#f59e0b" }}
              disabled={!classId}
            >
              <UploadIcon />
              Nhập file excel
            </button>

            {/* EXPORT */}
            <button
              type="button"
              onClick={() => setExportOpen(true)}
              className="h-10 px-4 rounded-xl border border-emerald-300 text-emerald-800 bg-white font-medium shadow-sm flex items-center gap-2"
              disabled={!classId}
            >
              <DownloadIcon />
              Xuất danh sách
            </button>
          </div>
        </div>

        {/* Errors / loading */}
        {loadError ? (
          <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{loadError}</div>
        ) : null}

        {loading ? <div className="mt-3 text-sm text-gray-500">Đang tải danh sách học sinh...</div> : null}

        {/* Search */}
        <div className="mt-5">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm kiếm học sinh theo tên, phụ huynh, SĐT..."
              className="w-full h-11 rounded-xl border border-gray-200 bg-white pl-11 pr-4 outline-none focus:ring-2"
              style={{ ["--tw-ring-color" as any]: `${PRIMARY}33` }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead>
                <tr style={{ backgroundColor: PRIMARY }} className="text-white">
                  <th className="text-left text-xs font-semibold px-5 py-4 w-[70px]">STT</th>
                  <th className="text-left text-xs font-semibold px-5 py-4 w-[170px]">Họ và tên HS</th>
                  <th className="text-left text-xs font-semibold px-5 py-4 w-[130px]">Ngày sinh</th>
                  <th className="text-left text-xs font-semibold px-5 py-4 w-[240px]">Địa chỉ</th>
                  <th className="text-left text-xs font-semibold px-5 py-4 w-[170px]">Họ và tên PHHS</th>
                  <th className="text-left text-xs font-semibold px-5 py-4 w-[190px]">Email</th>
                  <th className="text-left text-xs font-semibold px-5 py-4 w-[160px]">SĐT / Tên đăng nhập</th>
                  <th className="text-left text-xs font-semibold px-5 py-4 w-[120px]">Mật khẩu</th>
                  <th className="text-left text-xs font-semibold px-5 py-4 w-[130px]">Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-sm text-gray-500 py-10">
                      Không có học sinh nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filtered.map((st, idx) => (
                    <tr key={st.id} className="border-t border-gray-100">
                      <td className="px-5 py-5 text-sm text-gray-700">{idx + 1}</td>

                      <td className="px-5 py-5 text-sm text-gray-800 font-medium">{st.fullName}</td>

                      <td className="px-5 py-5 text-sm text-gray-700">{st.dob}</td>

                      <td className="px-5 py-5 text-sm text-gray-700">
                        <div className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[220px]" title={st.address}>
                          {st.address}
                        </div>
                      </td>

                      <td className="px-5 py-5 text-sm text-gray-700">{st.parentName}</td>

                      <td className="px-5 py-5 text-sm text-gray-700">
                        <div className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px]" title={st.email}>
                          {st.email}
                        </div>
                      </td>

                      <td className="px-5 py-5 text-sm">
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">
                          {st.phone}
                        </span>
                      </td>

                      <td className="px-5 py-5 text-sm">
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                          {st.password}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2">
                          <IconBtn
                            title="Xóa"
                            tone="danger"
                            onClick={() => {
                              setSelectedStudent(st);
                              setDeleteOpen(true);
                            }}
                          >
                            <TrashIcon />
                          </IconBtn>

                          <IconBtn
                            title="Chỉnh sửa"
                            tone="warn"
                            onClick={async () => {
                              try {
                                const s = await studentService.getStudentById(st.id);

                                // ✅ FIX address: ưu tiên fullAddress
                                const addr = (s.fullAddress ?? s.address ?? "").trim();

                                setSelectedStudent({
                                  id: s.id,
                                  fullName: `${s.lastName ?? ""} ${s.firstName ?? ""}`.trim(),
                                  dob: s.dateOfBirth ?? "", // ISO yyyy-mm-dd

                                  address: addr,
                                  province: s.province ?? "",
                                  district: s.district ?? "",
                                  ward: s.ward ?? "",

                                  gender: s.gender ?? "",
                                  relationshipWithParent: s.relationshipWithParent ?? "",

                                  parentName: s.parent?.fullName ?? "-",
                                  phone: s.parent?.phoneNumber ?? "-",
                                  email: s.parent?.email ?? "-",
                                  password: "-",
                                });

                                setDetailOpen(true);
                              } catch (e: any) {
                                alert(e?.message ?? "Không lấy được chi tiết học sinh.");
                              }
                            }}
                          >
                            <EditIcon />
                          </IconBtn>

                          <IconBtn
                            title="Phiếu tài khoản"
                            tone="info"
                            onClick={() => {
                              setSelectedStudent(st);
                              setTicketOpen(true);
                            }}
                          >
                            <DocIcon />
                          </IconBtn>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      <AddStudentModal
        open={addOpen}
        onClose={() => {
          setAddError("");
          setAddOpen(false);
        }}
        onSubmit={handleAddStudent}
      />

      {addOpen && addError ? (
        <div className="max-w-6xl mx-auto px-6 pb-4">
          <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{addError}</div>
        </div>
      ) : null}

      {addOpen && adding ? (
        <div className="max-w-6xl mx-auto px-6 pb-4">
          <div className="mt-2 text-sm text-gray-500">Đang thêm học sinh...</div>
        </div>
      ) : null}

      {/* Export */}
      <ExportListModal open={exportOpen} onClose={() => setExportOpen(false)} students={students} />

      {/* Import */}
      <ImportStudentsModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={(rows) => {
          setImportPayloads(rows);
          setImportPreview(rows.map((p, idx) => payloadToImportedStudent(p, idx)));
          setImportOpen(false);
          setConfirmOpen(true);
        }}
      />

      {/* Confirm Parents */}
      <ConfirmParentsModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        students={importPreview}
        onConfirm={async (selected) => {
          await handleConfirmImport(selected);
        }}
      />

      {confirmOpen && importError ? (
        <div className="max-w-6xl mx-auto px-6 pb-4">
          <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{importError}</div>
        </div>
      ) : null}

      {confirmOpen && importing ? (
        <div className="max-w-6xl mx-auto px-6 pb-4">
          <div className="mt-2 text-sm text-gray-500">Đang import học sinh...</div>
        </div>
      ) : null}

      {/* Detail / Edit */}
      <StudentDetailModal
        open={detailOpen}
        student={selectedStudent}
        onClose={() => setDetailOpen(false)}
        onSave={async (updated) => {
          try {
            const { firstName, lastName } = splitFullName(updated.fullName);

            await studentService.updateStudent(updated.id, {
              firstName,
              lastName,
              relationshipWithParent: updated.relationshipWithParent,
              dateOfBirth: updated.dob, // ISO yyyy-mm-dd
              gender: updated.gender,
              address: updated.address,
              province: updated.province,
              district: updated.district,
              ward: updated.ward,
            });

            setDetailOpen(false);
            await loadStudents();
          } catch (e: any) {
            alert(e?.message ?? "Cập nhật học sinh thất bại.");
          }
        }}
      />

      {/* Ticket */}
      <ParentTicketModal open={ticketOpen} student={selectedStudent} onClose={() => setTicketOpen(false)} />

      {/* Delete confirm */}
      <DeleteConfirmModal
  open={deleteOpen}
  onClose={() => {
    if (deleting) return; // tránh đóng khi đang xóa
    setDeleteError("");
    setDeleteOpen(false);
  }}
  onConfirm={handleDeleteStudent}
  loading={deleting}
  error={deleteError}
/>

    </main>
  );
}

/* ---------------- Small components ---------------- */

function IconBtn({
  children,
  title,
  tone = "neutral",
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  tone?: "neutral" | "warn" | "info" | "danger";
  onClick?: () => void;
}) {
  const styles =
    tone === "danger"
      ? "bg-red-50 text-red-600 hover:bg-red-100"
      : tone === "warn"
      ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
      : tone === "info"
      ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100";

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={clsx("w-9 h-9 rounded-lg flex items-center justify-center transition", styles)}
    >
      {children}
    </button>
  );
}

/* ---------------- Icons ---------------- */

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 21l-4.3-4.3m1.8-5.2a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 3v12m0-12 4 4m-4-4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 17v3h16v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 3v10m0 0 4-4m-4 4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 17v3h16v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0 0-3L16.5 4.5a2.1 2.1 0 0 0-3 0L3 15v5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M13.5 6.5l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 3h7l3 3v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M14 3v3h3" stroke="currentColor" strokeWidth="2" />
      <path d="M8 12h8M8 16h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 6V4h8v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 6l1 16h10l1-16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
