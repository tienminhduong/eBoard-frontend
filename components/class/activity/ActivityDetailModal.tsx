"use client";

import { ActivityParticipant, ExtracurricularActivity } from "@/types/activity";
import Button from "@/components/ui/Button";
import { X, Pencil, Plus, FileDown } from "lucide-react";
import ParticipantTable from "./ParticipantTable";
import { useEffect, useState } from "react";
import EditActivityModal from "./EditActivityModal";
import AddParticipantsModal from "./AddParticipantsModal";
import { StudentOptionDto, studentService } from "@/services/studentService";
import EditParticipantModal from "./EditParticipantModal";
import { exportActivityParticipantsExcel } from "@/utils/exportActivityParticipantsExcel";

interface Props {
  open: boolean;
  activity: ExtracurricularActivity | null;
  classId: string;
  onClose: () => void;
}

export default function ActivityDetailModal({
  open,
  activity,
  classId,
  onClose,
}: Props) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [students, setStudents] = useState<StudentOptionDto[]>([]);
  const [editing, setEditing] = useState<ActivityParticipant | null>(null);

useEffect(() => {
  studentService
    .getStudentsOptionInClass(classId)
    .then(setStudents);
}, [classId]);

  if (!open || !activity) return null;

  return (
    <>
      {/* MODAL CHI TIẾT */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white w-[900px] max-h-[90vh] rounded-2xl overflow-hidden shadow-lg flex flex-col">
          {/* HEADER */}
          <div className="bg-[#6B8F8B] text-white px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">{activity.name}</h2>
            <button onClick={onClose}>
              <X />
            </button>
          </div>

          {/* BODY */}
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* THÔNG TIN */}
            <div className="bg-gray-50 rounded-xl p-5 relative">
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-[#518581]"
                onClick={() => setOpenEdit(true)}
              >
                <Pencil size={18} />
              </button>

              <div className="grid grid-cols-2 gap-y-3 gap-x-10 text-sm">
                <Info label="Địa điểm" value={activity.location} />
                <Info
                  label="Số lượng tham gia"
                  value={`${activity.participants.length}/${activity.maxParticipants} học sinh`}
                />
                <Info
                  label="Thời gian bắt đầu"
                  value={new Date(activity.startTime).toLocaleString()}
                />
                <Info
                  label="Thời gian kết thúc"
                  value={new Date(activity.endTime).toLocaleString()}
                />
                <Info
                  label="Hạn đăng ký"
                  value={new Date(activity.assignDeadline).toLocaleString()}
                />
                <Info
                  label="Chi phí"
                  value={`${activity.cost.toLocaleString()}đ`}
                />
                <Info
                  label="Người phụ trách"
                  value={activity.inChargeTeacher}
                />
              </div>

              {/* MÔ TẢ */}
              <div className="mt-4">
                <p className="text-gray-500 text-xs mb-1">Mô tả</p>
                <div className="bg-white border rounded-lg p-3 text-sm min-h-[80px]">
                  {activity.description || "—"}
                </div>
              </div>
            </div>

            {/* DANH SÁCH THAM GIA */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="font-medium text-sm">
                  Danh sách tham gia ({activity.participants.length}/
                  {activity.maxParticipants})
                </p>

                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        <Button
                        icon={FileDown}
                        variant="outline"
                        onClick={() =>
                            {exportActivityParticipantsExcel(
                                activity,
                                activity.participants,
                                { className: "10A1" });}
                        }
                        >
                        Xuất Excel
                        </Button>

                        <Button
                        icon={Plus}
                        variant="outline"
                        onClick={() => setOpenAdd(true)}
                        >
                        Thêm học sinh
                        </Button>
                    </div>
                </div>

              </div>

              <ParticipantTable
                data={activity.participants}
                onEdit={(p) => setEditing(p)}
                onDelete={() => {}}
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-4 border-t ">
            <Button
              variant="primary"
              className="w-full flex justify-center items-center"
              onClick={onClose}
            >
              Đóng
            </Button>
          </div>
        </div>
      </div>

      {/* MODAL CHỈNH SỬA */}
      <EditActivityModal
        open={openEdit}
        activityId={activity.id}
        onClose={() => setOpenEdit(false)}
        onSuccess={() => {}}
      />

   <AddParticipantsModal
    open={openAdd}
    students={students}
    activityId={activity.id} // ✅ thêm ID hoạt động
    onClose={() => setOpenAdd(false)}
    onSuccess={() => {}} // reload list nếu cần
  />

    <EditParticipantModal
        open={!!editing}
        participant={editing}
        onEdit={(p) => setEditing(p)}
        onClose={() => setEditing(null)}
        onSuccess={() => {
            // reload activity detail
        }}
    />

    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
