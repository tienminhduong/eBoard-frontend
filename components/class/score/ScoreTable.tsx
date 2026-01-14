import { Pencil, ChevronRight } from "lucide-react";
import { StudentScore } from "@/types/score";
import Button from "@/components/ui/Button";
import AddScoreModal from "./AddScoreModal";
import { useState } from "react";
import ScoreDetailTable from "./ScoreDetailTable";
import ScoreDetailModal from "./ScoreDetailModal";
interface Props {
  data: StudentScore[];
  classId: string;
  semester: number;
  showAction?: boolean; // default: true
}

export default function ScoreTable({ data, classId, semester, showAction = true, }: Props) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>();
  
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
          {data.map((s, index) => (
            <tr
              key={s.studentId}
              className="border-t hover:bg-gray-50 transition"
            >
              <td className="px-4 py-3">{index + 1}</td>

              <td className="px-4 py-3">
                {s.studentName}
              </td>

              <td className="px-4 py-3">
                {s.averageScore}
              </td>

              <td className="px-4 py-3">
                <span className="px-3 py-1 rounded-full text-xs
                  bg-[#518581]/10 text-[#518581] font-medium">
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
                    <span className="sr-only">Edit</span>
                  </Button>


                  <AddScoreModal
                    open={openEdit}
                    onClose={() => setOpenEdit(false)}
                    classId={classId}
                    semester={semester}
                  />

                  <Button
                    icon={ChevronRight}
                    onClick={() => {
                      setSelectedStudentId(s.studentId);
                      setOpenDetail(true);
                    }}
                  > </Button>
                </div>
              </td>)}
            </tr>
          ))}
        </tbody>
      </table>
      
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
