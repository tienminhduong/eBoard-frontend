"use client";

import React, { useEffect, useMemo, useState } from "react";
import clsx from "clsx";

import ExportListModal from "@/components/student/ExportListModal";
import ImportStudentsModal from "@/components/student/ImportStudentModal";
import ConfirmParentsModal from "@/components/student/ConfirmParentsModal";
import StudentDetailModal from "@/components/student/StudentDetailModal";
import ParentTicketModal from "@/components/student/ParentTicketModal";
import DeleteConfirmModal from "@/components/student/DeleteConfirmModal";
import AddStudentModal from "@/components/class/AddStudentModal";
import type { CreateStudentRequest } from "@/types/Student";

import type { StudentRow, ImportedStudent } from "@/types/Student";
import { classService } from "@/services/classService";
import { studentService } from "@/services/studentService";
import { parentService } from "@/services/parentService";
import { getFromStorage } from "@/utils/storage";


import {
  SELECTED_CLASS_ID_KEY,
  SELECTED_CLASS_NAME_KEY,
  formatDobISOToVN,
  payloadToImportedStudent,
  splitFullName,
  mapStudentFromList,
  mapStudentFromDetail,
} from "@/utils/studentMapper";

import { DownloadIcon, EditIcon, PlusIcon, SearchIcon, TrashIcon, DocIcon, UploadIcon } from "@/components/ui/icon";

const PRIMARY = "#518581";

export default function StudentsPage() {
  const [hydrated, setHydrated] = useState(false);
  const [classId, setClassId] = useState("");
  const [className, setClassName] = useState("Lớp");

  useEffect(() => {
  const cid = getFromStorage(SELECTED_CLASS_ID_KEY);
  const cname = getFromStorage(SELECTED_CLASS_NAME_KEY) || "Lớp";

  console.log("STORAGE cid:", cid);
  console.log("STORAGE cname:", cname);

  setClassId(cid);
  setClassName(cname);
  setHydrated(true);
}, []);

useEffect(() => {
  if (!hydrated) return;
  console.log("STATE classId:", classId);
}, [hydrated, classId]);


  

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

  // delete
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function loadStudents() {
  console.log("CALL API with classId =", classId);

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

    const mapped: StudentRow[] = list.map(mapStudentFromList).filter((x: any) => x?.id);

    // ✅ lấy unique parentId
    const parentIds = Array.from(
      new Set(mapped.map((s) => (s.parentId || "").trim()).filter(Boolean))
    );

    // ✅ gọi api lấy parent info theo parentId
    const parentMap = new Map<string, any>();

    await Promise.all(
      parentIds.map(async (pid) => {
        try {
          const p = await parentService.getParentById(pid);
          parentMap.set(pid, p);
        } catch (err) {
          // fail thì bỏ qua, vẫn render bảng
          console.warn("Cannot load parent:", pid, err);
        }
      })
    );

    // ✅ nhét mật khẩu vào row
    const enriched: StudentRow[] = mapped.map((s) => {
      const p = parentMap.get(s.parentId);
      const pwd =
        (p?.generatedPassword ?? p?.password ?? s.password ?? "").toString();

      return { ...s, password: pwd };
    });

    setStudents(enriched);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const totalLabel = `Tổng số học sinh: ${students.length}`;

  async function handleAddStudent(payload: CreateStudentRequest) {
    if (!classId) return;

    try {
      setAddError("");
      setAdding(true);

      await studentService.createStudent({ ...payload, classId });

      setAddOpen(false);
      await loadStudents();
    } catch (e: any) {
      setAddError(e?.message ?? "Thêm học sinh thất bại.");
    } finally {
      setAdding(false);
    }
  }

  async function handleDeleteStudent() {
    if (!classId || !selectedStudent?.id) return;

    try {
      setDeleteError("");
      setDeleting(true);

      await classService.removeStudentFromClass(classId, selectedStudent.id);

      setDeleteOpen(false);
      setSelectedStudent(null);
      await loadStudents();
    } catch (e: any) {
      setDeleteError(e?.message ?? "Xóa học sinh thất bại.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleConfirmImport(selectedPreviewRows: ImportedStudent[]) {
    if (!classId) return;

    try {
      setImportError("");
      setImporting(true);

      const selectedIds = new Set(selectedPreviewRows.map((x) => x.id));
      const selectedPayloads = importPayloads.filter((_, idx) => selectedIds.has(importPreview[idx]?.id));

      for (const p of selectedPayloads) {
        await studentService.createStudent({ ...p, classId });
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
            <h1 className="text-2xl font-semibold text-gray-900">Quản lý học sinh - {className}</h1>
            <p className="text-base text-gray-500 mt-1">{totalLabel}</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className={clsx(
                "h-10 px-4 rounded-xl text-white font-medium shadow-sm flex items-center gap-2 text-sm",
                (!classId || adding) && "opacity-70 cursor-not-allowed"
              )}
              style={{ backgroundColor: PRIMARY }}
              disabled={!classId || adding}
            >
              <PlusIcon />
              Thêm học sinh
            </button>

            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className={clsx(
                "h-10 px-4 rounded-xl text-white font-medium shadow-sm flex items-center gap-2 text-sm",
                !classId && "opacity-70 cursor-not-allowed"
              )}
              style={{ backgroundColor: "#f59e0b" }}
              disabled={!classId}
            >
              <UploadIcon />
              Nhập file excel
            </button>

            <button
              type="button"
              onClick={() => setExportOpen(true)}
              className="h-10 px-4 rounded-xl border border-emerald-300 text-emerald-800 bg-white font-medium shadow-sm flex items-center gap-2 text-sm"
              disabled={!classId}
            >
              <DownloadIcon />
              Xuất danh sách
            </button>
          </div>
        </div>

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
              className="w-full h-11 rounded-xl border border-gray-200 bg-white pl-11 pr-4 outline-none focus:ring-2 text-sm"
              style={{ ["--tw-ring-color" as any]: `${PRIMARY}33` }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px]">
              <thead>
                <tr style={{ backgroundColor: PRIMARY }} className="text-white">
                  <th className="text-left text-sm font-semibold px-5 py-4 w-[70px]">STT</th>
                  {/* ✅ giãn cột tên + nowrap */}
                  <th className="text-left text-sm font-semibold px-5 py-4 w-[230px]">Họ và tên HS</th>
                  <th className="text-left text-sm font-semibold px-5 py-4 w-[140px]">Ngày sinh</th>
                  <th className="text-left text-sm font-semibold px-5 py-4 w-[320px]">Địa chỉ</th>
                  <th className="text-left text-sm font-semibold px-5 py-4 w-[210px]">Họ và tên PHHS</th>
                  <th className="text-left text-sm font-semibold px-5 py-4 w-[230px]">Email</th>
                  <th className="text-left text-sm font-semibold px-5 py-4 w-[190px]">SĐT / Tên đăng nhập</th>
                  <th className="text-left text-sm font-semibold px-5 py-4 w-[160px]">Mật khẩu tự động</th>
                  <th className="text-left text-sm font-semibold px-5 py-4 w-[140px]">Thao tác</th>
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

                      {/* ✅ nowrap để tên nằm ngang */}
                      <td className="px-5 py-5 text-sm text-gray-800 font-medium whitespace-nowrap">
                        {st.fullName}
                      </td>

                      <td className="px-5 py-5 text-sm text-gray-700 whitespace-nowrap">{st.dob}</td>

                      <td className="px-5 py-5 text-sm text-gray-700">
                        <div className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px]" title={st.address}>
                          {st.address}
                        </div>
                      </td>

                      <td className="px-5 py-5 text-sm text-gray-700 whitespace-nowrap">{st.parentName}</td>

                      <td className="px-5 py-5 text-sm text-gray-700">
                        <div className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[220px]" title={st.email}>
                          {st.email}
                        </div>
                      </td>

                      <td className="px-5 py-5 text-sm">
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 whitespace-nowrap">
                          {st.phone}
                        </span>
                      </td>

                      <td className="px-5 py-5 text-sm">
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 whitespace-nowrap">
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
                                setSelectedStudent(mapStudentFromDetail(s));
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
      // 1) update student
      const { firstName, lastName } = splitFullName(updated.fullName);

      await studentService.updateStudent(updated.id, {
        firstName,
        lastName,
        relationshipWithParent: updated.relationshipWithParent,
        dateOfBirth: updated.dob, // ISO yyyy-mm-dd
        gender: updated.gender,
        address: updated.address,
        province: updated.province,
        ward: updated.ward,
      });

      // 2) update parent (CẦN parentId)
      if (!updated.parentId?.trim()) throw new Error("Thiếu parentId để cập nhật phụ huynh.");

      await parentService.updateParentInfo(updated.parentId, {
        fullName: updated.parentName.trim(),
        email: updated.email.trim(),
        phoneNumber: updated.phone.trim(),
        address: updated.address.trim(), // hoặc parentAddress nếu mày có field riêng
        
      });

      setDetailOpen(false);
      await loadStudents();
    } catch (e: any) {
      alert(e?.message ?? "Cập nhật thất bại.");
    }
  }}
/>


      {/* Ticket */}
      <ParentTicketModal open={ticketOpen} student={selectedStudent} onClose={() => setTicketOpen(false)} />

      {/* Delete confirm */}
      <DeleteConfirmModal
        open={deleteOpen}
        onClose={() => {
          if (deleting) return;
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
