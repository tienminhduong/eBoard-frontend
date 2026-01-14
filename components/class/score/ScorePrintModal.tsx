import Button from "@/components/ui/Button";
import ScoreTable from "./ScoreTable";
import { StudentScore } from "@/types/score";

interface Props {
  open: boolean;
  onClose: () => void;
  data: StudentScore[];
  className: string;
  schoolYear: string;
  semester: number;
}

export default function ScorePrintModal({
  open,
  onClose,
  data,
  className,
  schoolYear,
  semester,
}: Props) {
  if (!open) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-[1000px] max-h-[90vh] rounded-xl shadow-lg overflow-hidden flex flex-col">

        {/* ===== HEADER (KHÔNG IN) ===== */}
        <div className="px-6 py-4 border-b text-center print:hidden">
          <h2 className="text-xl font-semibold uppercase">
            In bảng điểm
          </h2>
        </div>

        {/* ===== CONTENT (IN) ===== */}
        <div className="px-6 py-6 overflow-auto space-y-6 print-area">

          {/* ===== TITLE ===== */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold uppercase">
              BẢNG ĐIỂM LỚP {className}
            </h1>
            <div className="text-sm">
              Năm học: <strong>{schoolYear}</strong>
            </div>
            <div className="text-sm">
              Học kỳ: <strong>{semester}</strong>
            </div>
          </div>

          {/* ===== TABLE ===== */}
          <ScoreTable
            data={data}
            classId=""
            semester={semester}
            showAction={false}
          />

          {/* ===== SIGNATURE ===== */}
          <div className="grid grid-cols-2 gap-8 mt-16 text-center text-sm">
            <div>
              <div className="font-medium">Giáo viên chủ nhiệm</div>
              <div className="italic mt-20">(Ký, ghi rõ họ tên)</div>
            </div>

            <div>
              <div className="font-medium">Xác nhận Ban Giám Hiệu</div>
              <div className="italic mt-20">(Ký, đóng dấu)</div>
            </div>
          </div>
        </div>

        {/* ===== ACTION (KHÔNG IN) ===== */}
        <div className="px-6 py-4 border-t flex justify-end gap-3 print:hidden">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button onClick={handlePrint}>
            In bảng điểm
          </Button>
        </div>
      </div>
    </div>
  );
}
