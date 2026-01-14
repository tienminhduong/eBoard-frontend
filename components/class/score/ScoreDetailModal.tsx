import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import ScoreDetailTable from "./ScoreDetailTable";
import { SubjectScore } from "@/types/score";
import { scoreService } from "@/services/scoreService";
// import scoreService from "...";

interface Props {
  open: boolean;
  onClose: () => void;
  classId: string;
  semester: number;
  studentId?: string;
}

export default function ScoreDetailModal({
  open,
  onClose,
  classId,
  semester,
  studentId,
}: Props) {
  const [data, setSubjectScores] = useState<SubjectScore[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  if (!open || !studentId) return;
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await scoreService.getSubjectScores({
        classId,
        semester,
        studentId,
      })
      setSubjectScores(res);
    } catch (e) {
      console.error(e);
      setSubjectScores([]);
    } finally {
      setLoading(false);
    }
  };
    fetchData();
    }, [open, studentId, classId, semester]);                                                                   


  return (
    <Modal open={open} onClose={onClose} title="Chi tiết điểm">
      {loading ? (
        <div className="p-4 text-center">Đang tải...</div>
      ) : (
        <ScoreDetailTable data={data} />
      )}
    </Modal>
  );
}
