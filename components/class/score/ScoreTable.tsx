import { Pencil, ChevronRight } from "lucide-react";
import { StudentScore } from "@/types/score";
import Button from "@/components/ui/Button";
import AddScoreModal from "./AddScoreModal";
import { useEffect, useMemo, useState } from "react";
import ScoreDetailModal from "./ScoreDetailModal";
import Pagination from "@/components/ui/Pagination";

interface Props {
  data: StudentScore[];
  classId: string;
  semester: number;
  showAction?: boolean; // default: true
}

export default function ScoreTable({
  data,
  classId,
  semester,
  showAction = true,
}: Props) {
  /* ===== MODAL ===== */
  const [openEdit, setOpenEdit] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>();

  /* ===== PAGINATION ===== */
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.ceil(data.length / pageSize);

  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page]);

  // reset page khi data thay đổi (đổi lớp / học kỳ)
  useEffect(() => {
    setPage(1);
  }, [data]);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <table className="w-full text-base">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-3 text-left">STT</th>
            <th className="px-4 py-3 text-left">Họ tên học sinh</th>
            <th className="px-4 py-3 text-left">Điểm Trung bình</th>
            <th className="px-4 py-3 text-left">Xếp loại</th>
            {showAction && <th className="text-center">Thao tác</th>}
          </tr>
        </thead>

        <tbody>
          {pagedData.length === 0 ? (
            <tr>
              <td
                colSpan={showAction ? 5 : 4}
                className="py-6 text-center text-gray-500"
              >
                Chưa có dữ liệu
              </td>
            </tr>
          ) : (
            pagedData.map((s, index) => (
              <tr
                key={s.studentId}
                className="border-t hover:bg-gray-50 transition"
              >
                {/* STT toàn bảng */}
                <td className="px-4 py-3">
                  {(page - 1) * pageSize + index + 1}
                </td>

                <td className="px-4 py-3">{s.studentName}</td>

                <td className="px-4 py-3">{s.averageScore}</td>

                <td className="px-4 py-3">
                  <span className="px-3 py-1 rounded-full text-xs bg-[#518581]/10 text-[#518581] font-medium">
                    {s.grade}
                  </span>
                </td>

                {showAction && (
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <Button
                        icon={Pencil}
                        onClick={() => {
                          setSelectedStudentId(s.studentId);
                          setOpenEdit(true);
                        }}
                      >
                        <span className="sr-only">Sửa</span>
                      </Button>

                      <Button
                        icon={ChevronRight}
                        onClick={() => {
                          setSelectedStudentId(s.studentId);
                          setOpenDetail(true);
                        }}
                      >
                        <span className="sr-only">Xem chi tiết</span>
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ===== PAGINATION ===== */}
      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={setPage}
      />

      {/* ===== EDIT MODAL ===== */}
      <AddScoreModal
        open={openEdit}
        onClose={() => {
          setOpenEdit(false);
          setSelectedStudentId(undefined);
        }}
        classId={classId}
        semester={semester}
        studentId={selectedStudentId}
      />

      {/* ===== DETAIL MODAL ===== */}
      <ScoreDetailModal
        open={openDetail}
        onClose={() => {
          setOpenDetail(false);
          setSelectedStudentId(undefined);
        }}
        classId={classId}
        semester={semester}
        studentId={selectedStudentId}
      />
    </div>
  );
}
